/* ============================================================
   photos.js — Photo Engine & Swiper
   Mobile-first | Touch-friendly | Flexible photo counts
   ============================================================
   Photo paths live ONLY in js/photos-config.js (PHOTO_SETS).
   Everything here reads from that single manifest.
   ============================================================ */

"use strict";

/* ============================================================
   HELPERS
   ============================================================ */

// Fallback svg name for a given photo path: 01.jpg -> 01.svg
function svgFallbackFor(src) {
  return src.replace(/\.(jpe?g|png|webp)$/i, '.svg');
}

// Build the full list of {src, svg, alt} for one set
function buildPhotoArray(cfgKey) {
  const set = PHOTO_SETS[cfgKey];
  if (!set || !Array.isArray(set.files)) return [];
  return set.files.map((file) => {
    const src = set.folder + file;
    return { src, svg: svgFallbackFor(src), alt: set.alt };
  });
}

// First photo of a set (used by the family reveal)
function firstPhoto(cfgKey) {
  return buildPhotoArray(cfgKey)[0] || null;
}

// Family photo src pair
function familySrc() {
  const arr = buildPhotoArray('family');
  const p = arr[0];
  if (!p) return { jpg: '', svg: '' };
  return { jpg: p.src, svg: p.svg };
}

// Show a beautiful gradient placeholder when a photo is missing
function showGradientPlaceholder(img) {
  if (!img) return;
  img.style.visibility = 'hidden';
  const parent = img.parentElement;
  if (!parent || parent.querySelector('.img-placeholder')) return;

  const ph = document.createElement('div');
  ph.className = 'img-placeholder';
  ph.style.cssText = `
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #1a1428 0%, #0e0c1a 50%, #1a1428 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.4rem; color: rgba(255,255,255,0.25);
  `;

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size: 1.2rem; opacity: 0.4;';
  icon.textContent = '📷';

  const label = document.createElement('div');
  label.style.cssText = 'font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; font-family: Inter, sans-serif; text-align: center; padding: 0 0.5rem;';
  label.textContent = img.alt || 'Your photo here';

  ph.appendChild(icon);
  ph.appendChild(label);

  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }
  parent.appendChild(ph);
}

// Set an image with a two-stage fallback: jpg -> svg -> placeholder
function setImg(img, src, fallback) {
  if (!img) return;
  img._fbApplied = false;
  img.onerror = function () {
    if (fallback && !img._fbApplied) {
      img._fbApplied = true;
      img.onerror = null;
      img.src = fallback;
    } else {
      showGradientPlaceholder(img);
    }
  };
  img.src = src;
}

// Build a lazy-loaded <img> with automatic fallback
function buildImg(src, svg, alt, clickHandler) {
  const img = document.createElement('img');
  img.alt = alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.draggable = false;
  setImg(img, src, svg);
  if (clickHandler) {
    img.addEventListener('click', () => clickHandler(img));
  }
  return img;
}

/* ============================================================
   SWIPER ENGINE
   Touch-friendly, mobile-first photo carousel
   ============================================================ */

class PhotoSwiper {
  constructor(container, photos, options = {}) {
    this.container = container;
    this.photos = photos; // array of {src, svg, alt}
    this.opts = Object.assign({
      caption: null,       // optional array of caption strings
      accentColor: null,   // dot/indicator color
      onOpen: null,        // called when a photo is tapped: fn(imgEl)
      grayscale: false,    // add slight grayscale filter (memorial section)
    }, options);

    this.current = 0;
    this.total = photos.length;
    this.isDragging = false;
    this.isTouch = false;
    this.startX = 0;
    this.diffX = 0;

    if (this.total === 0) return;
    this._build();
    this._bindTouch();
    this._bindKeys();
  }

  _build() {
    this.container.classList.add('ps-root');
    this.container.innerHTML = '';

    // Photo frame
    this.frame = document.createElement('div');
    this.frame.className = 'ps-frame';

    // Track (holds all slides side by side)
    this.track = document.createElement('div');
    this.track.className = 'ps-track';
    this.track.style.width = (this.total * 100) + '%';

    this.slideEls = this.photos.map((p, i) => {
      const slide = document.createElement('div');
      slide.className = 'ps-slide';
      slide.style.width = (100 / this.total) + '%';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'ps-img-wrap';

      const img = buildImg(p.src, p.svg, p.alt, this.opts.onOpen);
      if (this.opts.grayscale) img.classList.add('ps-grayscale');

      imgWrap.appendChild(img);
      slide.appendChild(imgWrap);

      // Caption
      if (this.opts.caption && this.opts.caption[i]) {
        const cap = document.createElement('p');
        cap.className = 'ps-caption';
        cap.textContent = this.opts.caption[i];
        slide.appendChild(cap);
      }

      this.track.appendChild(slide);
      return slide;
    });

    this.frame.appendChild(this.track);
    this.container.appendChild(this.frame);

    // Counter
    this.counter = document.createElement('div');
    this.counter.className = 'ps-counter';
    this._updateCounter();
    this.container.appendChild(this.counter);

    // Dots + arrows (only when there is more than one photo)
    if (this.total > 1) {
      this.dotsEl = document.createElement('div');
      this.dotsEl.className = 'ps-dots';
      this.dots = this.photos.map((_, i) => {
        const d = document.createElement('button');
        d.className = 'ps-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Photo ${i + 1}`);
        d.addEventListener('click', () => this.goTo(i));
        this.dotsEl.appendChild(d);
        return d;
      });
      this.container.appendChild(this.dotsEl);

      // Swipe hint (fades away after a moment)
      this.hint = document.createElement('p');
      this.hint.className = 'ps-hint';
      this.hint.textContent = '← swipe →';
      this.container.appendChild(this.hint);
      setTimeout(() => { if (this.hint) this.hint.style.opacity = '0'; }, 3200);

      // Arrow buttons (touch-friendly, visible on all devices)
      const arrowPrev = document.createElement('button');
      arrowPrev.className = 'ps-arrow ps-arrow-prev';
      arrowPrev.innerHTML = '‹';
      arrowPrev.setAttribute('aria-label', 'Previous photo');
      arrowPrev.addEventListener('click', () => this.prev());

      const arrowNext = document.createElement('button');
      arrowNext.className = 'ps-arrow ps-arrow-next';
      arrowNext.innerHTML = '›';
      arrowNext.setAttribute('aria-label', 'Next photo');
      arrowNext.addEventListener('click', () => this.next());

      this.frame.appendChild(arrowPrev);
      this.frame.appendChild(arrowNext);
    }

    this._go(0, false);
  }

  _updateCounter() {
    if (!this.counter) return;
    const cur = String(this.current + 1).padStart(2, '0');
    const tot = String(this.total).padStart(2, '0');
    this.counter.textContent = `${cur} / ${tot}`;
  }

  _updateDots() {
    if (!this.dots) return;
    this.dots.forEach((d, i) => {
      const active = i === this.current;
      d.classList.toggle('active', active);
      if (this.opts.accentColor) {
        d.style.background = active ? this.opts.accentColor : '';
      }
    });
  }

  _go(index, animate = true) {
    this.current = Math.max(0, Math.min(this.total - 1, index));
    const offset = -(this.current * (100 / this.total));
    this.track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none';
    this.track.style.transform = `translateX(${offset}%)`;
    this._updateCounter();
    this._updateDots();
  }

  goTo(i) { this._go(i); }
  next() { this._go(this.current + 1); }
  prev() { this._go(this.current - 1); }

  _bindTouch() {
    const frame = this.frame;

    const onStart = (e) => {
      if (e.touches) this.isTouch = true;
      if (this.isTouch && !e.touches) return; // ignore emulated mouse events
      this.isDragging = true;
      this.startX = e.touches ? e.touches[0].clientX : e.clientX;
      this.diffX = 0;
      this.track.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      if (this.isTouch && !e.touches) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      this.diffX = x - this.startX;
      const slideW = 100 / this.total;
      const baseOffset = -(this.current * slideW);
      const dragOffset = (this.diffX / frame.clientWidth) * slideW;
      this.track.style.transform = `translateX(${baseOffset + dragOffset}%)`;
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const threshold = 40; // px
      if (this.diffX < -threshold) this.next();
      else if (this.diffX > threshold) this.prev();
      else this._go(this.current); // snap back
    };

    const onCancel = () => {
      this.isDragging = false;
      this._go(this.current);
    };

    frame.addEventListener('touchstart', onStart, { passive: true });
    frame.addEventListener('touchmove', onMove, { passive: false });
    frame.addEventListener('touchend', onEnd);
    frame.addEventListener('touchcancel', onCancel);
    frame.addEventListener('mousedown', onStart);
    frame.addEventListener('mousemove', onMove);
    frame.addEventListener('mouseup', onEnd);
    frame.addEventListener('mouseleave', onEnd);
  }

  _bindKeys() {
    // Only active when this swiper is in viewport
    document.addEventListener('keydown', (e) => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  }
}

/* ============================================================
   SWIPER REGISTRY — keep references to all swipers
   ============================================================ */
const Swipers = {};

/* ============================================================
   INIT ALL GALLERY SWIPERS
   ============================================================ */
function initAllSwipers() {

  // SCREEN 2 — Kinnu + Annaya (Before Everything Changed)
  const kinnuAnnayaSwiper = document.getElementById('swiper-kinnu-annaya');
  if (kinnuAnnayaSwiper) {
    Swipers.kinnuAnnaya = new PhotoSwiper(
      kinnuAnnayaSwiper,
      buildPhotoArray('kinnuAnnaya'),
      { accentColor: 'rgba(201,150,60,0.8)', onOpen: (img) => openLightbox(img) }
    );
  }

  // SCREEN 4 — Annaya (I'm Here)
  const annayaSwiper = document.getElementById('swiper-annaya');
  if (annayaSwiper) {
    Swipers.annaya = new PhotoSwiper(
      annayaSwiper,
      buildPhotoArray('annaya'),
      { accentColor: 'rgba(74,128,200,0.8)', onOpen: (img) => openLightbox(img) }
    );
  }

  // SCREEN 5 — Vadina
  const vadinaSwiper = document.getElementById('swiper-vadina');
  if (vadinaSwiper) {
    const captions = ['You understood.', 'You supported.', 'You stayed.', 'You became family.', '', '', '', '', ''];
    Swipers.vadina = new PhotoSwiper(
      vadinaSwiper,
      buildPhotoArray('vadina'),
      { accentColor: 'rgba(192,96,128,0.8)', caption: captions, onOpen: (img) => openLightbox(img) }
    );
  }

  // SCREEN 6 — Kinnu + Me (July 25, slight grayscale)
  const kinnuMeSwiper = document.getElementById('swiper-kinnu-me');
  if (kinnuMeSwiper) {
    Swipers.kinnuMe = new PhotoSwiper(
      kinnuMeSwiper,
      buildPhotoArray('kinnuMe'),
      { accentColor: 'rgba(255,255,255,0.4)', grayscale: true, onOpen: (img) => openLightbox(img) }
    );
  }

  // SCREEN 7 — Annaya + Vadina together (You Stayed)
  const annayaVadinaSwiper = document.getElementById('swiper-annaya-vadina');
  if (annayaVadinaSwiper) {
    Swipers.annayaVadina = new PhotoSwiper(
      annayaVadinaSwiper,
      buildPhotoArray('annayaVadina'),
      { accentColor: 'rgba(201,150,60,0.6)', onOpen: (img) => openLightbox(img) }
    );
  }

  // SCREEN 8 — Kinnu + Annaya (The Connection)
  const kinnuAnnaya2 = document.getElementById('swiper-kinnu-annaya-2');
  if (kinnuAnnaya2) {
    Swipers.kinnuAnnaya2 = new PhotoSwiper(
      kinnuAnnaya2,
      buildPhotoArray('kinnuAnnaya'),
      { accentColor: 'rgba(201,150,60,0.8)', onOpen: (img) => openLightbox(img) }
    );
  }
}

/* ============================================================
   GIFT MODAL SWIPER — built dynamically when the modal opens
   ============================================================ */
function buildGiftModalSwiper(containerEl, cfgKey, accentColor) {
  if (!containerEl) return;
  const photos = buildPhotoArray(cfgKey);
  if (!photos.length) return;
  new PhotoSwiper(containerEl, photos, {
    accentColor,
    onOpen: (img) => openLightbox(img)
  });
}

/* ============================================================
   FAMILY REVEAL — sequential cinematic steps
   ============================================================ */
let familyStep = 0;
const FAMILY_STEPS = 4; // 0=kinnu-me, 1=kinnu-annaya, 2=annaya-vadina, 3=all-four

function initFamilyReveal() {
  const container = document.getElementById('family-reveal-sequence');
  if (!container) return;
  _loadFamilyStepImage(0); // kinnu-me first photo
}

function _loadFamilyStepImage(stepIndex) {
  const stepEl = document.querySelector(`.family-step[data-step="${stepIndex}"]`);
  if (!stepEl) return;
  const imgEl = stepEl.querySelector('img');
  if (!imgEl) return;

  let p = null;
  switch (stepIndex) {
    case 0: p = firstPhoto('kinnuMe'); break;
    case 1: p = firstPhoto('kinnuAnnaya'); break;
    case 2: p = firstPhoto('annayaVadina'); break;
    case 3: { const fs = familySrc(); p = fs.jpg ? { src: fs.jpg, svg: fs.svg } : null; break; }
  }
  if (p) setImg(imgEl, p.src, p.svg);
}

function advanceFamilyStep() {
  const current = document.querySelector(`.family-step[data-step="${familyStep}"]`);
  if (!current) return;

  if (familyStep < FAMILY_STEPS - 1) {
    // Fade out current
    current.classList.add('fs-exit');

    setTimeout(() => {
      current.classList.remove('fs-active');
      current.classList.remove('fs-exit');

      familyStep++;
      const next = document.querySelector(`.family-step[data-step="${familyStep}"]`);
      if (!next) return;

      _loadFamilyStepImage(familyStep);
      next.classList.add('fs-active');

      // Last step: trigger golden particles + family text
      if (familyStep === FAMILY_STEPS - 1) {
        _onFamilyComplete();
      }

      _updateFamilyBtn();
    }, 600);
  }
}

function _onFamilyComplete() {
  setTimeout(() => {
    ParticleSystem.goldenBurst('golden-particles', 80);
    const familyText = document.getElementById('family-text');
    if (familyText) {
      familyText.classList.remove('hidden');
      familyText.classList.add('visible');
      const lines = familyText.querySelectorAll('.narrative');
      lines.forEach((line, i) => {
        setTimeout(() => {
          line.style.opacity = '1';
          line.style.transform = 'translateY(0)';
        }, i * 700);
      });
    }
    const btn = document.getElementById('family-next-btn');
    if (btn) btn.style.display = 'none';
  }, 800);
}

function _updateFamilyBtn() {
  const btn = document.getElementById('family-next-btn');
  if (!btn) return;

  const labels = [
    'Then Kinnu & Annaya... ›',
    'Then Annaya & Vadina... ›',
    'Bring us all together ✨',
    ''
  ];
  btn.textContent = labels[familyStep] || '';
}

// Preload the images used by the family reveal so the big
// moment is instant (called when screen 9 scrolls into view)
function preloadFamilySet() {
  ['kinnuMe', 'kinnuAnnaya', 'annayaVadina'].forEach((key) => {
    const p = firstPhoto(key);
    if (p) { const im = new Image(); im.src = p.src; }
  });
  const fs = familySrc();
  if (fs.jpg) { const im = new Image(); im.src = fs.jpg; }
}

/* ============================================================
   FINAL SCREEN — full-screen family photo
   ============================================================ */
function setFinalFamilyImage() {
  const img = document.getElementById('final-family-img');
  if (!img) return;
  const fs = familySrc();
  if (fs.jpg) setImg(img, fs.jpg, fs.svg);
}

// Expose globally
window.advanceFamilyStep = advanceFamilyStep;
window.initFamilyReveal = initFamilyReveal;
window.initAllSwipers = initAllSwipers;
window.buildGiftModalSwiper = buildGiftModalSwiper;
window.buildPhotoArray = buildPhotoArray;
window.firstPhoto = firstPhoto;
window.familySrc = familySrc;
window.setFinalFamilyImage = setFinalFamilyImage;
window.preloadFamilySet = preloadFamilySet;

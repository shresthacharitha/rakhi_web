/* ============================================================
   main.js — Main interaction & animation controller
   Rakhi Gift Website for Annaya & Vadina
   ============================================================ */

"use strict";

/* ===== CURSOR GLOW ===== */
const CursorGlow = (() => {
  let glow;
  let animFrame = null;
  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  function init() {
    glow = document.getElementById('cursor-glow');
    if (!glow) return;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    // Interactive elements make the cursor bigger
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('button, a, img, .surprise-card, .cinema-photo, .vadina-photo-item, .scroll-photo-item, .together-photo, .kinnu-photo-item, .couple-photo, .gift-photo')) {
        glow.classList.add('big');
      } else {
        glow.classList.remove('big');
      }
    });

    function animateCursor() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
      animFrame = requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  function stop() {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
    if (glow) glow.style.display = 'none';
  }

  return { init, stop };
})();

/* ===== DOM READY ===== */
let StarCanvas = null;

document.addEventListener('DOMContentLoaded', () => {
  CursorGlow.init();
  initOpeningScreen();
  initSecretEasterEggs();
  StarCanvas = ParticleSystem.initStarCanvas();
  ParticleSystem.startPetalRain();
  ParticleSystem.spawnParticles('opening-particles', 20, 'white', 1, 3);

  // Build every photo gallery from the PHOTO_SETS manifest
  initAllSwipers();
  initFamilyReveal();
  setFinalFamilyImage();
});

/* ============================================================
   SCREEN 1 — OPENING ANIMATION
   ============================================================ */
function initOpeningScreen() {
  const lines = document.querySelectorAll('.opening-line');
  const beginBtn = document.getElementById('begin-btn');

  const delays = [600, 2400, 4200];

  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, delays[i]);
  });

  // Show begin button after all lines appear
  setTimeout(() => {
    if (beginBtn) {
      beginBtn.classList.remove('hidden');
      requestAnimationFrame(() => beginBtn.classList.add('fade-in'));
    }
  }, 6000);
}

/* ============================================================
   BEGIN STORY — transition from opening to story
   ============================================================ */
function beginStory() {
  const screen1 = document.getElementById('screen-1');
  const storyContainer = document.getElementById('story-container');

  // Start music on first user interaction
  MusicController.showControls();
  MusicController.playMusic(true);

  // The starfield canvas is no longer visible — stop it to save battery
  if (StarCanvas && StarCanvas.stop) StarCanvas.stop();

  // Fade out opening screen
  screen1.style.transition = 'opacity 1.5s ease';
  screen1.style.opacity = '0';

  setTimeout(() => {
    screen1.style.display = 'none';
    // Make body scrollable
    document.body.classList.add('story-open');
    storyContainer.classList.remove('hidden');

    // Scroll to top of story
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger first section reveals
    triggerRevealObserver();
  }, 1500);
}

/* ============================================================
   SCROLL OBSERVER — reveal animations on scroll
   ============================================================ */
function triggerRevealObserver() {
  // Observe all .reveal-text elements
  const revealEls = document.querySelectorAll('.reveal-text');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => {
          el.classList.add('in-view');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach((el) => observer.observe(el));

  // Observe float photos
  const floatPhotos = document.querySelectorAll('.float-photo');
  const photoObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => el.classList.add('in-view'), delay);
        photoObs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  floatPhotos.forEach((el) => photoObs.observe(el));

  // Observe scroll photo items
  const scrollPhotos = document.querySelectorAll('.scroll-photo-item');
  const spObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.index || 0) * 250;
        setTimeout(() => el.classList.add('in-view'), delay);
        spObs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  scrollPhotos.forEach((el) => spObs.observe(el));

  // Observe stayed lines (staggered)
  const stayedLines = document.querySelectorAll('.stayed-line');
  const slObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        stayedLines.forEach((line, i) => {
          setTimeout(() => line.classList.add('in-view'), i * 350);
        });
        slObs.disconnect();
      }
    });
  }, { threshold: 0.1 });
  if (stayedLines.length) slObs.observe(stayedLines[0]);

  // Screen transition effects
  observeScreenTransitions();
}

function observeScreenTransitions() {
  // When warming screen enters view, transition music
  const warmingScreen = document.getElementById('screen-7');
  if (warmingScreen) {
    const warmObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        MusicController.transitionToWarmer();
        ParticleSystem.spawnParticles('warming-particles', 30, 'golden', 2, 5);
        warmObs.disconnect();
      }
    }, { threshold: 0.3 });
    warmObs.observe(warmingScreen);
  }

  // Family reveal screen — preload its images so the reveal is instant
  const familyScreen = document.getElementById('screen-9');
  if (familyScreen) {
    const famObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        preloadFamilySet();
        famObs.disconnect();
      }
    }, { threshold: 0.1 });
    famObs.observe(familyScreen);
  }

  // Rakhi screen — add extra particles
  const rakhiScreen = document.getElementById('screen-10');
  if (rakhiScreen) {
    const rakObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        MusicController.transitionToWarmer();
        rakObs.disconnect();
      }
    }, { threshold: 0.3 });
    rakObs.observe(rakhiScreen);
  }

  // Final screen particles
  const finalScreen = document.getElementById('screen-final');
  if (finalScreen) {
    const finObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        ParticleSystem.goldenBurst('golden-particles-final', 80);
        showWaitScreen();
        finObs.disconnect();
      }
    }, { threshold: 0.4 });
    finObs.observe(finalScreen);
  }
}

/* ============================================================
   GIFT CARDS MODAL
   ============================================================ */
const giftData = {
  annaya: {
    icon: '💙',
    title: 'For My Annaya',
    name: 'Anudeep',
    color: '#4a80c8',
    colorBg: 'rgba(74, 128, 200, 0.1)',
    colorBorder: 'rgba(74, 128, 200, 0.3)',
    messages: [
      'Thank you for calling.',
      'Thank you for staying.',
      'Thank you for giving me courage.',
      'Thank you for protecting me when I couldn\'t protect myself.',
      'Thank you for becoming my Annaya.',
    ],
    finalMessage: `I don't know if you will ever truly understand what you did for me.\n\nYou came into my life as Kinnu's best friend...\n\nBut somewhere along the way, you became my Annaya.\n\nI will forever be grateful for you.`,
  },
  vadina: {
    icon: '❤️',
    title: 'For My Vadina',
    name: 'My Vadina',
    color: '#c06080',
    colorBg: 'rgba(192, 96, 128, 0.1)',
    colorBorder: 'rgba(192, 96, 128, 0.3)',
    messages: [
      'Thank you for understanding.',
      'Thank you for supporting me.',
      'Thank you for standing beside him.',
      'And for standing beside me.',
      'You didn\'t have to.',
      'But you did.',
      'Thank you for becoming my Vadina.',
    ],
    finalMessage: `You became part of my family not because you had to — but because you chose to.\n\nThank you for understanding.\nThank you for being there.\n\nYou are my Vadina, forever.`,
  },
};

function openGiftCard(type) {
  const data = giftData[type];
  if (!data) return;

  const modal = document.getElementById('gift-modal');
  const content = document.getElementById('gift-modal-content');
  if (!modal || !content) return;

  const messagesHTML = data.messages.map(m =>
    `<p class="gift-message">${m}</p>`
  ).join('');

  const finalParas = data.finalMessage.split('\n\n').map(p =>
    `<p>${p.replace(/\n/g, '<br/>')}</p>`
  ).join('');

  content.innerHTML = `
    <button class="modal-close" onclick="closeGiftCard()" aria-label="Close">✕</button>
    <div class="gift-header">
      <div class="gift-icon">${data.icon}</div>
      <div class="gift-title" style="color:${data.color}">${data.title}</div>
    </div>
    <div class="gift-swiper" id="gift-swiper" role="region" aria-label="Photos"></div>
    <div class="gift-messages">${messagesHTML}</div>
    <div class="gift-final-message" style="border-color:${data.colorBorder}; background:${data.colorBg}">
      ${finalParas}
    </div>
  `;

  // Cinematic swipeable gallery from the organized folder (annaya/ or vadina/)
  const swiperHost = document.getElementById('gift-swiper');
  const cfgKey = type === 'annaya' ? 'annaya' : 'vadina';
  buildGiftModalSwiper(swiperHost, cfgKey, data.color);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  content.scrollTop = 0;
}

function closeGiftCard() {
  const modal = document.getElementById('gift-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ============================================================
   ENVELOPE / LETTER
   ============================================================ */
function openEnvelope() {
  const envelope = document.getElementById('envelope');
  const flap = document.getElementById('envelope-flap');
  const letterContent = document.getElementById('letter-content');
  const envelopeContainer = document.getElementById('envelope-container');

  if (!envelope || flap._opened) return;
  flap._opened = true;

  flap.classList.add('open');

  setTimeout(() => {
    envelopeContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    envelopeContainer.style.opacity = '0';
    envelopeContainer.style.transform = 'translateY(-20px)';

    setTimeout(() => {
      envelopeContainer.style.display = 'none';
      if (letterContent) {
        letterContent.classList.remove('hidden');
      }
    }, 800);
  }, 900);
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function openLightbox(imgEl) {
  if (!imgEl) return;
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  if (!lightbox || !lbImg) return;

  lbImg.src = imgEl.src;
  lbImg.alt = imgEl.alt || 'Photo';
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.add('hidden');
  document.body.style.overflow = '';
}

// Close lightbox on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeGiftCard();
    closeWaitScreen();
  }
});

/* ============================================================
   EASTER EGGS
   ============================================================ */
function initSecretEasterEggs() {
  // Secret star
  const star = document.getElementById('secret-star');
  const secretMsg = document.getElementById('secret-message');

  if (star && secretMsg) {
    star.addEventListener('click', () => {
      secretMsg.classList.toggle('hidden');
    });
  }

  // Konami code easter egg (UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A)
  let konamiSequence = [];
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  document.addEventListener('keydown', (e) => {
    konamiSequence.push(e.keyCode);
    konamiSequence = konamiSequence.slice(-10);
    if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
      showKonamiSurprise();
    }
  });

  // Hidden heart click easter egg — clicking the 🪷 in Rakhi section
  const rakhiCenter = document.querySelector('.rakhi-center');
  if (rakhiCenter) {
    rakhiCenter.addEventListener('click', showHeartBurst);
  }
}

function closeSecret() {
  const secretMsg = document.getElementById('secret-message');
  if (secretMsg) secretMsg.classList.add('hidden');
}

// Wait screen (easter egg before final screen)
let waitScreenShown = false;
function showWaitScreen() {
  if (waitScreenShown) return;
  waitScreenShown = true;

  const wait = document.getElementById('wait-screen');
  if (wait) {
    setTimeout(() => {
      wait.classList.remove('hidden');
    }, 2000);
  }
}

function closeWaitScreen() {
  const wait = document.getElementById('wait-screen');
  if (wait) wait.classList.add('hidden');
}

function showKonamiSurprise() {
  const burst = document.createElement('div');
  burst.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 9999; text-align: center; pointer-events: none;
  `;
  burst.innerHTML = `
    <div style="font-size: 4rem; animation: konamiBurst 2s ease forwards;">💙❤️💙</div>
    <p style="font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: rgba(201,150,60,0.9); margin-top: 1rem; font-style: italic;">You found the secret! 🌟</p>
  `;
  document.body.appendChild(burst);

  if (!document.getElementById('konami-style')) {
    const style = document.createElement('style');
    style.id = 'konami-style';
    style.textContent = `
      @keyframes konamiBurst {
        0% { transform: scale(0) rotate(-20deg); opacity: 0; }
        50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
        80% { transform: scale(1) rotate(0deg); opacity: 1; }
        100% { transform: scale(0.8) rotate(0deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => burst.remove(), 3000);
}

function showHeartBurst() {
  const hearts = ['💙', '❤️', '🌸', '✨', '💛', '🌺'];
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('div');
    const heart = hearts[Math.floor(Math.random() * hearts.length)];
    const x = (Math.random() - 0.5) * 300;
    const y = -(50 + Math.random() * 150);
    const dur = 1 + Math.random() * 1;

    el.style.cssText = `
      position: fixed;
      left: 50%; top: 50%;
      font-size: ${1 + Math.random() * 1.5}rem;
      pointer-events: none;
      z-index: 9999;
      animation: heartPop ${dur}s ease forwards;
      --tx: ${x}px; --ty: ${y}px;
    `;
    el.textContent = heart;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 100);
  }

  if (!document.getElementById('heart-pop-style')) {
    const style = document.createElement('style');
    style.id = 'heart-pop-style';
    style.textContent = `
      @keyframes heartPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ============================================================
   MOBILE TOUCH — remove custom cursor on touch devices
   ============================================================ */
window.addEventListener('touchstart', () => {
  CursorGlow.stop();
  document.body.style.cursor = 'auto';
  document.querySelectorAll('button, .surprise-card, .cinema-photo, .vadina-photo-item, .scroll-photo-item').forEach(el => {
    el.style.cursor = 'pointer';
  });
}, { once: true });

/* ============================================================
   TYPEWRITER EFFECT for Telugu quote
   ============================================================ */
(function initTypewriter() {
  const teluguLine = document.getElementById('telugu-line');
  if (!teluguLine) return;

  const originalText = teluguLine.textContent.trim();
  let started = false;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      teluguLine.textContent = '';
      teluguLine.style.opacity = '1';
      teluguLine.style.transform = 'translateY(0)';

      let i = 0;
      function type() {
        if (i < originalText.length) {
          teluguLine.textContent += originalText[i];
          i++;
          setTimeout(type, 60 + Math.random() * 40);
        }
      }
      setTimeout(type, 400);
      obs.disconnect();
    }
  }, { threshold: 0.5 });

  obs.observe(teluguLine);
})();


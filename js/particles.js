/* ============================================================
   particles.js — Floating particle system
   ============================================================ */

"use strict";

const ParticleSystem = (() => {
  // Create a single floating particle element
  function createParticle(container, type = 'white', minSize = 2, maxSize = 5) {
    const el = document.createElement('div');
    el.classList.add('particle', type + '-particle');

    const size = minSize + Math.random() * (maxSize - minSize);
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 14;
    const delay = -Math.random() * duration;

    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = left + '%';
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = delay + 's';

    container.appendChild(el);
    return el;
  }

  // Spawn N particles into a container
  function spawnParticles(containerId, count = 40, type = 'white', minSize = 1, maxSize = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < count; i++) {
      createParticle(container, type, minSize, maxSize);
    }
  }

  // Star canvas for opening screen
  function initStarCanvas() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let animFrame;
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateStars();
    }

    function generateStars() {
      stars = [];
      const count = Math.floor((width * height) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.3 + Math.random() * 1.2,
          opacity: 0.2 + Math.random() * 0.7,
          twinkleSpeed: 0.005 + Math.random() * 0.015,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }

    function drawStars() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(5,5,8,0)';
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity > 0.9) { star.opacity = 0.9; star.twinkleDir = -1; }
        if (star.opacity < 0.1) { star.opacity = 0.1; star.twinkleDir = 1; }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(drawStars);
    }

    function stop() {
      if (animFrame) cancelAnimationFrame(animFrame);
    }

    window.addEventListener('resize', resize);
    resize();
    drawStars();

    return { stop };
  }

  // Golden particle burst for family reveal
  function goldenBurst(containerId, count = 60) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = 2 + Math.random() * 6;
      const x = 20 + Math.random() * 60; // % from left
      const duration = 4 + Math.random() * 8;
      const delay = Math.random() * 3;
      const isHeart = Math.random() < 0.1;

      el.style.cssText = `
        position: absolute;
        left: ${x}%;
        bottom: ${Math.random() * 30}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(201,150,60,0.9), transparent);
        border-radius: 50%;
        pointer-events: none;
        animation: goldenRise ${duration}s ease ${delay}s infinite;
        opacity: 0;
      `;

      if (isHeart) {
        el.textContent = '✦';
        el.style.background = 'none';
        el.style.color = 'rgba(201,150,60,0.7)';
        el.style.fontSize = (size * 1.5) + 'px';
        el.style.width = 'auto';
        el.style.height = 'auto';
      }

      container.appendChild(el);
    }

    // Inject keyframe if not already there
    if (!document.getElementById('golden-rise-style')) {
      const style = document.createElement('style');
      style.id = 'golden-rise-style';
      style.textContent = `
        @keyframes goldenRise {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          10% { opacity: 0.8; transform: translateY(-20px) scale(1); }
          90% { opacity: 0.3; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Petal rain effect
  function startPetalRain() {
    const container = document.getElementById('opening-particles');
    if (!container) return;
    const petals = ['🌸', '🌺', '✦', '·', '°'];
    for (let i = 0; i < 25; i++) {
      const el = document.createElement('div');
      const petal = petals[Math.floor(Math.random() * petals.length)];
      const left = Math.random() * 100;
      const dur = 10 + Math.random() * 15;
      const delay = Math.random() * -20;
      const size = 0.5 + Math.random() * 1.5;

      el.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -2rem;
        font-size: ${size}rem;
        color: rgba(201,150,60,${0.15 + Math.random() * 0.3});
        pointer-events: none;
        animation: openingPetal ${dur}s linear ${delay}s infinite;
        user-select: none;
      `;
      el.textContent = petal;
      container.appendChild(el);
    }

    if (!document.getElementById('opening-petal-style')) {
      const style = document.createElement('style');
      style.id = 'opening-petal-style';
      style.textContent = `
        @keyframes openingPetal {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.4; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  return { initStarCanvas, spawnParticles, goldenBurst, startPetalRain };
})();

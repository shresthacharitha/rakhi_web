/* ============================================================
   music.js — Background music controller
   ============================================================ */

"use strict";

const MusicController = (() => {
  let audio = null;
  let isPlaying = false;
  let hasStarted = false;

  function init() {
    audio = document.getElementById('bg-music');
    if (!audio) return;

    const controls = document.getElementById('music-controls');
    const toggleBtn = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const volumeSlider = document.getElementById('volume-slider');

    if (!controls || !toggleBtn) return;

    // Set initial volume
    audio.volume = parseFloat(volumeSlider?.value || 0.4);

    // Volume control
    volumeSlider?.addEventListener('input', () => {
      audio.volume = parseFloat(volumeSlider.value);
    });

    // Toggle play/pause
    toggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });

    // Update button state on audio events
    audio.addEventListener('play', () => {
      isPlaying = true;
      iconPlay?.classList.add('hidden');
      iconPause?.classList.remove('hidden');
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      iconPlay?.classList.remove('hidden');
      iconPause?.classList.add('hidden');
    });

    // Handle music file not found gracefully
    audio.addEventListener('error', () => {
      controls.style.opacity = '0.3';
      controls.title = 'Add music.mp3 to assets/music/ to enable music';
    });
  }

  function showControls() {
    const controls = document.getElementById('music-controls');
    if (controls) controls.classList.remove('hidden');
  }

  function playMusic(fade = true) {
    if (!audio) return;
    if (!hasStarted) {
      audio.load();
      hasStarted = true;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — silently ignore
      });
    }

    if (fade) {
      audio.volume = 0;
      fadeVolume(audio, 0, 0.4, 3000);
    }
  }

  function pauseMusic(fade = false) {
    if (!audio) return;
    if (fade) {
      fadeVolume(audio, audio.volume, 0, 1500, () => audio.pause());
    } else {
      audio.pause();
    }
  }

  function fadeVolume(audioEl, from, to, duration, callback) {
    const startTime = performance.now();
    const diff = to - from;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.max(0, Math.min(elapsed / duration, 1));
      audioEl.volume = Math.min(1, Math.max(0, from + diff * progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (callback) callback();
      }
    }

    requestAnimationFrame(step);
  }

  function transitionToWarmer() {
    // Subtle volume boost when story gets warmer
    if (isPlaying && audio) {
      fadeVolume(audio, audio.volume, Math.min(audio.volume + 0.1, 0.6), 3000);
    }
  }

  return { init, showControls, playMusic, pauseMusic, transitionToWarmer };
})();

// Initialize music on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  MusicController.init();
});

/* ============================================================
   photos-config.js — THE single source of truth for photos
   ============================================================
   This is the ONLY place image paths are listed.

   HOW TO ADD / CHANGE PHOTOS
   ---------------------------
   1. Drop your photos into the matching folder with predictable
      names (01.jpg, 02.jpg, ...):
        assets/images/annaya/
        assets/images/vadina/
        assets/images/kinnu-me/
        assets/images/kinnu-annaya/
        assets/images/annaya-vadina/
        assets/images/family/        <- family/family.jpg
   2. Add or remove the filename in the matching "files" array
      below. That's it. The website updates automatically.

   A .jpg that is missing simply falls back to its .svg
   placeholder of the same name (e.g. 01.jpg -> 01.svg),
   so the website never breaks.

   NOTE: JPG/PNG/WebP all work — the fallback looks for a .svg
   with the same name.
   ============================================================ */

const PHOTO_SETS = {
  // Annaya — personal photos of Anudeep
  annaya: {
    folder: 'assets/images/annaya/',
    files: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg',
      '06.jpg', '07.jpg', '08.jpg', '09.jpg'
    ],
    alt: 'Annaya'
  },

  // Vadina — personal photos of Vadina
  vadina: {
    folder: 'assets/images/vadina/',
    files: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg',
      '06.jpg', '07.jpg', '08.jpg', '09.jpg'
    ],
    alt: 'Vadina'
  },

  // Me + Kinnu — photos of Shrestha and Kinnu together
  kinnuMe: {
    folder: 'assets/images/kinnu-me/',
    files: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'
    ],
    alt: 'Shrestha and Kinnu'
  },

  // Kinnu + Annaya — photos of Kinnu and Anudeep together
  kinnuAnnaya: {
    folder: 'assets/images/kinnu-annaya/',
    files: [
      '01.jpg', '02.jpg', '03.jpg'
    ],
    alt: 'Kinnu and Annaya'
  },

  // Annaya + Vadina — photos of Anudeep and Vadina together
  // (supports any number of photos, not just 4 or 6)
  annayaVadina: {
    folder: 'assets/images/annaya-vadina/',
    files: [
      '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'
    ],
    alt: 'Annaya and Vadina'
  },

  // Family — the big reveal photo (Shrestha + Kinnu + Annaya + Vadina)
  family: {
    folder: 'assets/images/family/',
    files: [
      'family.jpg'
    ],
    alt: 'Shrestha, Kinnu, Annaya and Vadina — our family'
  }
};

// Expose globally so every other script can read it
window.PHOTO_SETS = PHOTO_SETS;

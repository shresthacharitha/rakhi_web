# 📸 PHOTO PLACEMENT GUIDE
## Rakhi Gift Website — assets/images/

Place your photos in the **organized folders** below with predictable names
(`01.jpg`, `02.jpg`, ...). The website is configured from ONE file:
**`js/photos-config.js`** (the `PHOTO_SETS` manifest).

> 💡 Missing photos are safe — each folder already contains labelled
> `.svg` placeholders (same name, e.g. `01.jpg` → `01.svg`) that show
> automatically until you drop in the real photo.

---

## ✅ ANNAYA — Anudeep's personal photos
Folder: `assets/images/annaya/`  ·  Files: `01.jpg` → `09.jpg`

Used in:
- Screen 4 — "I'm Here" (Anudeep support section)
- Screen 11 — Annaya gift-card gallery

---

## ✅ VADINA — Vadina's personal photos
Folder: `assets/images/vadina/`  ·  Files: `01.jpg` → `09.jpg`

Used in:
- Screen 5 — Vadina section
- Screen 11 — Vadina gift-card gallery

---

## ✅ KINNU-ME — Shrestha + Kinnu together
Folder: `assets/images/kinnu-me/`  ·  Files: `01.jpg` → `06.jpg`

Used in:
- Screen 6 — July 25 (memories of our relationship, slight grayscale)
- Screen 9 — Family reveal, step 1 (Me + Kinnu)

---

## ✅ KINNU-ANNAYA — Kinnu + Anudeep together
Folder: `assets/images/kinnu-annaya/`  ·  Files: `01.jpg` → `03.jpg`

Used in:
- Screen 2 — "Before Everything Changed"
- Screen 8 — "The Connection" (how our paths became connected)
- Screen 9 — Family reveal, step 2 (Kinnu + Annaya)

---

## ✅ ANNAYA-VADINA — Anudeep + Vadina together
Folder: `assets/images/annaya-vadina/`  ·  Files: `01.jpg` → up to you

Used in:
- Screen 7 — "You Stayed" (their couple section)
- Screen 9 — Family reveal, step 3 (Annaya + Vadina)

> This folder supports **any number of photos** (currently 6). Add or
> remove entries in `annayaVadina.files` inside `js/photos-config.js`.

---

## ✅ FAMILY — THE most important image ⭐
Folder: `assets/images/family/`  ·  Main file: `family.jpg`

The generated photo of **Shrestha + Kinnu + Anudeep + Vadina**.

Used in:
- Screen 9 — the big family reveal (the strongest visual moment)
- Final screen — full-screen family photo behind "Happy Rakhi"

> Tip: keep all four people visible and centred — this photo is shown
> **in full (never cropped)** on the family reveal.

---

## HOW TO ADD OR CHANGE PHOTOS

1. Drop the photo into the matching folder, named predictably:
   `01.jpg`, `02.jpg`, `03.jpg` ... (JPG, PNG, or WebP all work).
2. Open **`js/photos-config.js`** and update the matching `files` array:
   - adding a photo → add its filename to the array
   - removing a photo → delete its filename from the array

Example — `annaya` has 10 photos:
```js
annaya: {
  folder: 'assets/images/annaya/',
  files: ['01.jpg','02.jpg','03.jpg','04.jpg','05.jpg',
          '06.jpg','07.jpg','08.jpg','09.jpg','10.jpg'],
  alt: 'Annaya'
}
```

---

## MUSIC

Place your background music file here:
  assets/music/music.mp3

Recommended: a soft instrumental piano piece or cinematic orchestral track.
The website has a play/pause button and volume control built in.
Music only starts after the user clicks "Begin Our Story" (browser autoplay policy).

---

## TIPS

- Recommended photo sizes: at least 800×1000px for portraits, 1200×800px for landscape.
- Galleries use a large cinematic 3:4 swipeable carousel (no tiny grids on phones).
- Tap any photo to view it full-size in the built-in lightbox.
- The website is designed **mobile-first** — it is meant to be viewed on a phone.
- Works on desktop, Android, and iPhone.

---

Made with love for Annaya Anudeep and Vadina 💙❤️
— Shrestha

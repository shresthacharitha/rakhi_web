# 🎀 Rakhi Gift Website — Quick Start Guide

## How to Open the Website

Just double-click `index.html` — it opens directly in any browser.
No server or installation needed.

---

## Step 1: Add Your Photos

Photos live in organized folders under `assets/images/`.
The website reads them from ONE file: `js/photos-config.js` (the `PHOTO_SETS` manifest).

### Folder structure

```
assets/images/
├── annaya/            → Anudeep's photos        (01.jpg ... 09.jpg)
├── vadina/            → Vadina's photos         (01.jpg ... 09.jpg)
├── kinnu-me/          → Shrestha + Kinnu        (01.jpg ... 06.jpg)
├── kinnu-annaya/      → Kinnu + Anudeep         (01.jpg ... 03.jpg)
├── annaya-vadina/     → Anudeep + Vadina        (01.jpg ... up to you)
└── family/            → THE big family photo    (family.jpg)
```

### What goes where

| Folder            | Used in                                        |
|-------------------|------------------------------------------------|
| `annaya/`         | "I'm Here" screen, Annaya gift card gallery   |
| `vadina/`         | Vadina screen, Vadina gift card gallery       |
| `kinnu-me/`       | July 25 (memorial) screen, family reveal step 1 |
| `kinnu-annaya/`   | "Before Everything Changed", "The Connection" |
| `annaya-vadina/`  | "You Stayed" screen, family reveal step 3     |
| `family/`         | The big family reveal + final Rakhi screen    |

### Adding / changing photos

1. Put your photos in the matching folder with predictable names:
   `01.jpg`, `02.jpg`, `03.jpg` ... (or `.png` / `.webp`).
2. Open `js/photos-config.js` and add/remove the filename in the
   matching `files` array. That's it.

Example — if you add `annaya/10.jpg`, add `'10.jpg'` to the `annaya.files` array:

```js
annaya: {
  folder: 'assets/images/annaya/',
  files: ['01.jpg', ..., '10.jpg'],
  alt: 'Annaya'
}
```

> Any photo that is missing simply shows its `.svg` placeholder
> (same name, e.g. `01.jpg` → `01.svg`), so the site never breaks.
> The SVG placeholders already in each folder are clearly labelled.

---

## Step 2: Add Music (optional but beautiful)

Place any MP3 file here:
```
assets/music/music.mp3
```

Recommended free music:
- [Pixabay](https://pixabay.com/music/search/piano%20cinematic/) — search "cinematic piano"
- [Free Music Archive](https://freemusicarchive.org/) — search "emotional piano"

The music player has play/pause + volume controls built in.
Music only plays after the user clicks "Begin Our Story" (browser policy).

---

## Step 3: Share with Annaya & Vadina

### Option A — Local file
Send the entire `surprise` folder as a zip file.
They open `index.html` in their browser.

### Option B — Free hosting (recommended!)
Use [Netlify Drop](https://app.netlify.com/drop):
1. Go to netlify.com/drop
2. Drag and drop the entire `surprise` folder
3. You get a free link like `https://your-site.netlify.app`
4. Send them the link!

---

## Hidden Easter Eggs 🥚

The website has 3 secret surprises:
1. **Secret Star** ✦ — bottom-left corner. Tap it for a hidden message.
2. **Konami Code** — press ↑↑↓↓←→←→BA on keyboard for a surprise burst.
3. **Lotus Tap** 🪷 — tap the spinning lotus in the Rakhi section for a heart burst.
4. **Wait screen** — appears before the final screen with a special pause.

---

## Website Screens

| Screen | Title |
|--------|-------|
| 1 | Mystery Opening |
| 2 | Before July 11 (Kinnu + Anudeep photos) |
| 3 | July 11 — The Phone Call |
| 4 | "I'm Here" — Anudeep section |
| 5 | Vadina section |
| 6 | July 25 |
| 7 | You Stayed |
| 8 | The Connection |
| 9 | **Family Reveal** ← The big moment! |
| 10 | Rakhi |
| 11 | Two Gift Cards (Annaya + Vadina) |
| 12 | Final Letter (Envelope) |
| Final | Full-screen family photo |

---

## For Developers

- `js/photos-config.js` — **the only place image paths live**.
- `js/photos.js` — swiper engine + family reveal + image fallback.
- `js/main.js` — interactions, gift modal, lightbox, easter eggs.
- `js/particles.js` — particles / starfield / petal rain.
- `js/music.js` — audio controller.
- Designed **mobile-first** (Anudeep & Vadina will view on phones).
  Every gallery is a large swipeable carousel — no tiny grids.

Made with forever love for Annaya Anudeep and Vadina 💙❤️
— Shrestha

# Yuze Zheng Personal Website

This is a simple static personal website for GitHub Pages. It uses only HTML, CSS, and JavaScript. There is no React, no backend, no database, and no build step.

Most updates should happen in these places:

- `data/profile.json`
- `data/photos.json`
- `assets/photos/`
- `assets/cv/`

## Update Personal Profile Text

1. Open `data/profile.json`.
2. Edit fields such as `shortIntro`, `biography`, `researchInterests`, `education`, `selectedResearchDirections`, and links.
3. Commit changes.
4. GitHub Pages updates automatically.

## Update Photos

1. Export and compress the photo.
2. Upload the photo to `assets/photos/`.
3. Add one entry to `data/photos.json`.
4. Commit changes.
5. GitHub Pages updates automatically.

Each photo entry should look like this:

```json
{
  "title": "Photo Title",
  "location": "Location",
  "year": "2026",
  "category": "Birds",
  "caption": "Short caption here.",
  "image": "assets/photos/photo-01.jpg"
}
```

Filter buttons are generated automatically from the `category` fields in `data/photos.json`.

## Recommended Photo Export Settings

- JPG
- Long edge: 1600-2400 px
- Quality: 75-85%
- Ideally 300 KB-1 MB per image

## Replace the CV

1. Put the PDF file in `assets/cv/`.
2. Update `cvPath` in `data/profile.json` if the filename changes.

The default path is:

```text
assets/cv/Yuze_Zheng_CV.pdf
```

The CV download button will still appear even before the PDF is uploaded.

## GitHub Pages Notes

Keep paths relative, such as `assets/photos/photo-01.jpg` and `data/profile.json`. This allows the site to work directly from the repository `yuzezheng-thomas.github.io`.

# Yuze Zheng Photography Website

This is a simple static photography website for GitHub Pages. It uses only HTML, CSS, and JavaScript. There is no React, no backend, no database, and no build step.

Most updates should happen in these places:

- `data/profile.json`
- `data/photos.json`
- `assets/photos/`

## Update Personal Text

1. Open `data/profile.json`.
2. Edit `displayName`, `shortIntro`, `biography`, or `contactLinks`.
3. Commit changes.
4. GitHub Pages updates automatically.

The homepage and About section both load text from `data/profile.json`.

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

The homepage featured-photo area uses the first three entries in `data/photos.json`. The full gallery and filter buttons are generated automatically from the same file.

## Recommended Photo Export Settings

- JPG
- Long edge: 1600-2400 px
- Quality: 75-85%
- Ideally 300 KB-1 MB per image

## GitHub Pages Notes

Keep paths relative, such as `assets/photos/photo-01.jpg` and `data/profile.json`. This allows the site to work directly from the repository `yuzezheng-thomas.github.io`.

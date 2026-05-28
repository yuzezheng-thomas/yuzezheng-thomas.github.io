# Yuze Zheng Photography Website

This is a simple static photography portfolio for GitHub Pages. It uses only HTML, CSS, and JavaScript. There is no React, no backend, no database, and no build step.

Most updates should happen in these places:

- `data/profile.json`
- `data/featuredPhotos.json`
- `data/collections.json`
- `data/photos.json`
- `assets/photos/`

## Update Personal Text

1. Open `data/profile.json`.
2. Edit `displayName`, `shortIntro`, `biography`, or `contactLinks`.
3. Commit changes.
4. GitHub Pages updates automatically.

## Add A New Collection

1. Create a folder under `assets/photos/`, for example `assets/photos/travel/`.
2. Add one entry to `data/collections.json`.
3. Choose a stable lowercase `slug`, such as `travel`.
4. Set `coverImage` to the image that should represent the collection.

Example:

```json
{
  "slug": "travel",
  "title": "Travel",
  "description": "Photographs from trips and places beyond Chicago.",
  "theme": "Travel notes",
  "coverImage": "assets/photos/travel/cover.jpg"
}
```

The collection link is generated automatically:

```text
collection.html?collection=travel
```

## Update The Homepage Collage

The first screen is controlled by `data/featuredPhotos.json`.

Add or reorder entries to change the homepage photo mosaic:

```json
{
  "image": "assets/photos/city/sun-through-city.jpg",
  "alt": "Sunlight through downtown Chicago"
}
```

These entries only affect the homepage collage. They do not create collections or photo detail pages.

## Add Photos To A Collection

1. Export and compress the photo.
2. Upload the photo to the relevant folder, such as `assets/photos/birds/`.
3. Add one entry to `data/photos.json`.
4. Make sure the `collection` value matches a `slug` in `data/collections.json`.
5. Commit changes.
6. GitHub Pages updates automatically.

Example:

```json
{
  "collection": "birds",
  "title": "American Robin",
  "location": "Chicago, IL",
  "year": "2026",
  "caption": "A robin moving through low grass in soft light.",
  "image": "assets/photos/birds/american-robin.jpg"
}
```

## Choose A Cover Image

Each collection card uses `coverImage` from `data/collections.json`.

If `coverImage` is empty or missing, the site uses the first photo in `data/photos.json` whose `collection` value matches the collection `slug`.

## Recommended Photo Export Settings

- JPG
- Long edge: 1600-2400 px
- Quality: 75-85%
- Ideally 300 KB-1 MB per image

## GitHub Pages Notes

Keep paths relative, such as `assets/photos/birds/american-robin.jpg` and `data/photos.json`. This allows the site to work directly from the repository `yuzezheng-thomas.github.io`.

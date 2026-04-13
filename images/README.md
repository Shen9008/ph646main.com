# Images – WebP optimization

All site images should be provided in **WebP** format for smaller file size and faster loading.

## Usage in HTML

Use the `<picture>` element so browsers that support WebP get the optimized version, with a fallback for older browsers:

```html
<picture>
  <source srcset="images/your-image.webp" type="image/webp">
  <img src="images/your-image.jpg" alt="Descriptive alt text" loading="lazy" width="400" height="225">
</picture>
```

- **WebP**: Primary source; use for all new images.
- **Fallback**: Use JPEG or PNG for the `<img>` `src` if you need to support very old browsers.
- **Alt text**: Always set a meaningful `alt` for accessibility and SEO.
- **Dimensions**: Prefer `width` and `height` to avoid layout shift (use values that match the displayed size or aspect ratio).
- **Lazy loading**: Use `loading="lazy"` for images below the fold.

## Converting to WebP

- **Online**: Use [Squoosh](https://squoosh.app/) or similar.
- **CLI**: Use `cwebp` (WebP encoder) or build scripts (e.g. sharp, imagemin-webp) to batch-convert PNG/JPEG to WebP.

## Folder structure

- `images/` – General site images (hero, logos, icons if raster).
- `images/games/` – Game thumbnails (use WebP).
- `images/news/` – Article and blog images (use WebP).

Keep filenames lowercase and descriptive (e.g. `gates-of-olympus-thumb.webp`).

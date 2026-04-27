# Backend Task: Populate Drama Image URLs

## Problem

The `GET /api/dramas` and `GET /api/dramas/{slug}` responses currently return `thumbnail_url` and `banner_url` as `null` for all dramas. The frontend expects these fields to contain image URLs.

## Required Changes

1. **`thumbnail_url`** – Portrait poster for drama cards (e.g. 200×356px). Used in:
   - Hero carousel
   - Drama rails
   - Continue watching

2. **`banner_url`** – Landscape banner (e.g. 16:9). Used for hero/featured views.

## Expected Format

- **Full URLs:** `https://tv.myuze.app/storage/thumbnails/xyz.jpg` or your CDN URL
- **Relative paths:** `/storage/thumbnails/xyz.jpg` (frontend will prepend the base URL)

## Where to Apply

- `GET /api/dramas` – each drama in the `data` array
- `GET /api/dramas/{slug}` – the single drama object
- Episode objects – `thumbnail_url` for episode thumbnails

## Implementation Notes

- If images are stored in Laravel storage, use `Storage::url()` or `asset()` so URLs are absolute.
- Ensure the storage disk is publicly accessible or served via your CDN.
- If a drama has no image, returning `null` is fine; the frontend will show a placeholder.

## Example Response

```json
{
  "id": 1,
  "title": "Love in Accra",
  "slug": "love-in-accra-1",
  "thumbnail_url": "https://tv.myuze.app/storage/dramas/love-in-accra-thumb.jpg",
  "banner_url": "https://tv.myuze.app/storage/dramas/love-in-accra-banner.jpg",
  "genre": "romance",
  "total_episodes": 30,
  "free_episodes": 3,
  "status": "published",
  "release_date": "2025-12-05",
  "is_featured": true,
  "total_likes": 1474,
  "total_views": 19579,
  "trailer": null
}
```

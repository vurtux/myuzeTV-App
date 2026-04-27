# myzueTV API Reference for React Native/Expo

Api is located at: https://tv.myuze.app/api

## 1. Base Path

**`/api`**

All API routes are prefixed with `/api`. Full URL example: `https://your-domain.com/api/auth/login`.

---

## 2. API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Auth** |
| POST | `/api/auth/register` | No | Register (create/update user by Firebase UID) |
| POST | `/api/auth/login` | No | Login with Firebase UID |
| GET | `/api/auth/me` | Yes | Get current user |
| **Dramas** |
| GET | `/api/dramas` | Yes | Paginated drama list |
| GET | `/api/dramas/featured` | Yes | Featured drama |
| GET | `/api/dramas/{slug}` | Yes | Single drama by slug (with episodes) |
| POST | `/api/dramas/{id}/like` | Yes | Toggle like on drama |
| **Episodes** |
| GET | `/api/episodes/{id}` | Yes | Episode details |
| GET | `/api/episodes/{id}/stream` | Yes | **HLS stream URL** |
| POST | `/api/episodes/{id}/progress` | Yes | Save watch progress |
| **Rails** |
| GET | `/api/rails` | Yes | Content rails (homepage sections) |
| **Watchlist** |
| GET | `/api/watchlist` | Yes | User's watchlist |
| POST | `/api/watchlist` | Yes | Add drama to watchlist |
| DELETE | `/api/watchlist/{dramaId}` | Yes | Remove from watchlist |
| **Subscription** |
| GET | `/api/subscription/plans` | Yes | Plans (query: `?platform=ios|android|web`) |
| GET | `/api/subscription/status` | Yes | Current subscription status |
| POST | `/api/subscription/verify-ios` | Yes | Verify Apple receipt |
| POST | `/api/subscription/verify-android` | Yes | Verify Google Play purchase |
| POST | `/api/subscription/verify-web` | Yes | Verify Paystack payment |

**Rate limit:** 60 requests/minute.

**Geo targeting:** Send `X-User-Country: GH` (or other country code) header for geo-filtered content.

---

## 3. Auth

### Register

```http
POST /api/auth/register
Content-Type: application/json
X-User-Country: GH  (optional)
```

**Request body:**
```json
{
  "firebase_uid": "string (required)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "name": "string (optional)",
  "profile_image": "string (optional)",
  "country_code": "string 2 chars (optional)",
  "ip_address": "string (optional)"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "1|abc123...",
  "token_type": "Bearer"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
X-User-Country: GH  (optional)
```

**Request body:**
```json
{
  "firebase_uid": "string (required)",
  "country_code": "string 2 chars (optional)",
  "ip_address": "string (optional)"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "1|abc123...",
  "token_type": "Bearer"
}
```

**Error (404):**
```json
{
  "message": "User not found"
}
```

### Using the Token

Include in all protected requests:
```
Authorization: Bearer <token>
```

Store the `token` from register/login responses and send it with every authenticated request.

---

## 4. Response Shapes

### GET /api/dramas (paginated)

```json
{
  "data": [
    {
      "id": 1,
      "title": "string",
      "slug": "string",
      "description": "string",
      "thumbnail_url": "https://...",
      "banner_url": "https://...",
      "genre": "romance",
      "total_episodes": 30,
      "free_episodes": 3,
      "status": "published",
      "release_date": "2025-12-17",
      "is_featured": true,
      "total_likes": 100,
      "total_views": 5000,
      "trailer": {
        "id": 1,
        "hls_playlist_url": "https://...",
        "thumbnail_url": "https://...",
        "duration_seconds": 120,
        "encoding_status": "completed"
      },
      "episodes": null
    }
  ],
  "links": {
    "first": "https://.../api/dramas?page=1",
    "last": "https://.../api/dramas?page=5",
    "prev": null,
    "next": "https://.../api/dramas?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "https://.../api/dramas",
    "per_page": 20,
    "to": 20,
    "total": 100
  }
}
```

### GET /api/dramas/{slug}

Single drama object (no `data` wrapper), with `episodes` array:

```json
{
  "id": 1,
  "title": "string",
  "slug": "string",
  "description": "string",
  "thumbnail_url": "https://...",
  "banner_url": "https://...",
  "genre": "romance",
  "total_episodes": 30,
  "free_episodes": 3,
  "status": "published",
  "release_date": "2025-12-17",
  "is_featured": true,
  "total_likes": 100,
  "total_views": 5000,
  "trailer": { "id": 1, "hls_playlist_url": "...", ... },
  "episodes": [
    {
      "id": 1,
      "episode_number": 1,
      "title": "string",
      "description": "string",
      "thumbnail_url": "https://...",
      "duration_seconds": 300,
      "status": "published",
      "video": { "id": 1, "hls_playlist_url": "...", ... },
      "drama": null
    }
  ]
}
```

### GET /api/episodes/{id}/stream

```json
{
  "hls_url": "https://bunnycdn.com/.../playlist.m3u8"
}
```

**Errors:**
- `403`: `{ "message": "Subscription required" }`
- `404`: `{ "message": "Video not ready" }`

### GET /api/rails

```json
[
  {
    "id": 1,
    "title": "Hero",
    "slug": "hero",
    "rail_type": "hero",
    "display_order": 0,
    "dramas": [
      { "id": 1, "title": "...", "slug": "...", ... }
    ]
  }
]
```

### GET /api/auth/me (user)

```json
{
  "id": 1,
  "name": "string",
  "email": "string",
  "phone": "string",
  "profile_image": "string",
  "subscription_status": "free|active|expired|cancelled",
  "subscription_expires_at": "2026-03-15T00:00:00.000000Z",
  "subscriptions": []
}
```

### GET /api/subscription/plans?platform=ios

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "Premium Monthly",
        "product_id": "com.myzuetv.premium.monthly",
        "price": 9.99,
        "currency": "GHS",
        "billing_period": "monthly",
        "trial_days": 7,
        "features": { "unlimited_episodes": true, "ad_free": true }
      }
    ],
    "recommended_plan_id": 1
  }
}
```

---

## 5. Frontend API Client Setup

```typescript
const API_BASE = 'https://your-domain.com/api';

// After Firebase auth, call register or login
const { token } = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Country': 'GH',
  },
  body: JSON.stringify({ firebase_uid: firebaseUser.uid }),
}).then(r => r.json());

// Store token (e.g. SecureStore)
// Use for all protected requests:
headers: {
  'Authorization': `Bearer ${token}`,
  'X-User-Country': 'GH',
}
```

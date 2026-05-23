# Imgo

**Self-hosted image processing. Deploy once, own forever.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()

Imgo is an open-source alternative to ImageKit and Cloudinary — a self-hosted image processing service you deploy once and own forever. Upload images, serve them with on-the-fly URL transformations, protect them with API keys and signed URLs, and pay $0 per month.

```
GET /v1/i/your-image-id?w=800&format=webp&q=80
```

> Stop renting your image infrastructure.

---

## Why Imgo?

| | Imgo | ImageKit | Cloudinary |
|---|---|---|---|
| Monthly cost | **$0** | $59–$249+ | $99–$499+ |
| Bandwidth | **Unlimited** | 25–100 GB | 25–100 GB |
| Transformations | **Unlimited** | 1,000–10,000/mo | 25,000/mo |
| API key auth | **Yes** | Yes | Yes |
| Signed URLs | **Yes** | Yes | Yes |
| Self-hosted | **Yes** | No | No |
| Open source | **Yes** | No | No |
| Data ownership | **Full** | Vendor | Vendor |

---

## Features

- **On-the-fly transforms** — resize, compress, convert format, blur, grayscale via URL params
- **API key authentication** — generate, list, and revoke keys via REST API
- **Signed URLs** — time-limited signed URLs for private images
- **Public / private images** — per-image visibility control at upload time
- **Redis transform cache** — processed images cached 24h, sub-millisecond repeat requests
- **ETag + HTTP caching** — 304 responses, `immutable` cache headers, browser-native caching
- **Storage adapters** — local filesystem or MinIO (S3-compatible), swap with one env var
- **EXIF stripping** — metadata removed by default for privacy
- **Folder organization** — group images into logical folders
- **Health endpoints** — `/ready`, `/live`, `/detailed` for container orchestration
- **Rate limiting** — built-in, configurable
- **Docker first** — one `./start.sh` brings everything up

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/manishdashsharma/Imgo.git
cd Imgo
./start.sh
```

`start.sh` handles everything — checks Docker, creates `.env` if missing, starts all services, and shows live status. Your API is live at `http://localhost:3000`.

### Local Development

**Prerequisites:** Node.js 20+, MongoDB, Redis

```bash
git clone https://github.com/manishdashsharma/Imgo.git
cd Imgo
npm install
cp .env.example .env
# edit .env — set MONGODB_URL, REDIS_URL
npm run dev
```

---

## First-Time Setup

On a fresh deploy, create your first API key:

```bash
curl -X POST http://localhost:3000/v1/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "my-app"}'
```

```json
{
  "data": {
    "apiKey": {
      "key": "imgo_xK9mP2...",
      "keyPrefix": "imgo_xK9mP2",
      "name": "my-app"
    }
  }
}
```

**Store the key immediately — it is shown only once.**

All subsequent requests to management endpoints require:

```
Authorization: Bearer imgo_xK9mP2...
```

---

## Upload an Image

```bash
curl -X POST http://localhost:3000/v1/images/upload \
  -H "Authorization: Bearer <api-key>" \
  -F "image=@photo.jpg" \
  -F "folder=products" \
  -F "visibility=public"
```

`visibility` is optional — defaults to `public`. Use `private` for images that require signed URLs.

**Response:**

```json
{
  "data": {
    "image": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "folder": "products",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 245760,
      "width": 1920,
      "height": 1080,
      "visibility": "public"
    }
  }
}
```

---

## Serve & Transform

Public images are served without authentication — safe for `<img>` tags, CDN, and browsers.

```
GET /v1/i/:imageId
GET /v1/i/:imageId?w=300&h=300&format=webp&q=80
```

### Transform Parameters

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `w` | integer | 1–5000 | original | Width in pixels |
| `h` | integer | 1–5000 | original | Height in pixels |
| `format` | string | `jpeg` `png` `webp` `avif` `gif` | original | Output format |
| `q` | integer | 1–100 | 80 | Quality |
| `fit` | string | `cover` `contain` `fill` `inside` `outside` | `cover` | Resize strategy |
| `blur` | float | 0.3–1000 | — | Gaussian blur sigma |
| `grayscale` | boolean | `true` | — | Convert to grayscale |

### Examples

```bash
# Thumbnail — 200×200, WebP
curl "http://localhost:3000/v1/i/664f1a2b?w=200&h=200&format=webp"

# Banner — 1200px wide, AVIF, high quality
curl "http://localhost:3000/v1/i/664f1a2b?w=1200&format=avif&q=90"

# Blur placeholder
curl "http://localhost:3000/v1/i/664f1a2b?w=20&blur=5"

# Grayscale avatar
curl "http://localhost:3000/v1/i/664f1a2b?w=100&h=100&grayscale=true&format=webp"

# Portrait crop
curl "http://localhost:3000/v1/i/664f1a2b?w=400&h=600&fit=cover"
```

---

## Signed URLs (Private Images)

Private images return `403` without a valid signed URL. Generate one from your backend:

```bash
curl -X POST http://localhost:3000/v1/images/sign \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": "664f1a2b3c4d5e6f7a8b9c0d",
    "expiresIn": 3600,
    "params": { "w": 300, "format": "webp" }
  }'
```

```json
{
  "data": {
    "url": "/v1/i/664f1a2b?w=300&format=webp&expires=1716000000&sig=da217b44..."
  }
}
```

The URL is valid for `expiresIn` seconds (max 7 days). Tampering with any param invalidates the signature.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/auth/setup` | None | First-time setup — creates initial key (fails if keys exist) |
| `POST` | `/v1/auth/keys/create` | Required | Create an additional API key |
| `GET` | `/v1/auth/keys` | Required | List active keys (keys are masked) |
| `POST` | `/v1/auth/keys/revoke` | Required | Revoke a key by ID |

### Images

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/images/upload` | Required | Upload image |
| `GET` | `/v1/images` | Required | List images (paginated, filterable by folder) |
| `GET` | `/v1/images/:imageId` | Required | Get image metadata |
| `POST` | `/v1/images/sign` | Required | Generate signed URL for a private image |
| `POST` | `/v1/images/delete` | Required | Soft-delete image |

### Transform

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/v1/i/:imageId` | None (public) / Signed URL (private) | Serve and transform image |

### Folders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/folders/create` | Required | Create a folder |
| `GET` | `/v1/folders` | Required | List folders (paginated) |
| `POST` | `/v1/folders/delete` | Required | Delete folder (blocked if has active images) |

### Health

| Endpoint | Description |
|----------|-------------|
| `GET /v1/health` | Basic liveness check |
| `GET /v1/health/live` | Kubernetes liveness probe |
| `GET /v1/health/ready` | Kubernetes readiness probe |
| `GET /v1/health/detailed` | MongoDB + Redis + storage status with latency |
| `GET /v1/health/system` | Full system snapshot |

---

## Configuration

All configuration lives in `.env`. Copy the example to get started:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `development` | Environment (`development` / `production`) |
| `PORT` | `3000` | HTTP port |
| `MONGODB_URL` | — | MongoDB connection string |
| `REDIS_URL` | — | Redis connection string |
| `STORAGE_DRIVER` | `local` | Storage backend: `local` or `minio` |
| `STORAGE_LOCAL_PATH` | `./uploads` | Path for local storage |
| `MINIO_ENDPOINT` | — | MinIO/S3 endpoint URL |
| `MINIO_ACCESS_KEY` | — | MinIO access key (also sets `MINIO_ROOT_USER` in Docker) |
| `MINIO_SECRET_KEY` | — | MinIO secret key (also sets `MINIO_ROOT_PASSWORD` in Docker) |
| `MINIO_BUCKET` | `imgo` | Bucket name |
| `MAX_FILE_SIZE_MB` | `50` | Max upload size in MB |
| `ALLOWED_MIME_TYPES` | see example | Comma-separated allowed MIME types |
| `SIGNED_URL_SECRET` | — | Secret for signing private image URLs (`openssl rand -hex 32`) |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in ms |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Log level: `debug` / `info` / `warn` / `error` |

---

## Storage Adapters

Switch between storage backends with a single env var. No code changes required.

### Local filesystem

```env
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
```

Files are stored under `STORAGE_LOCAL_PATH` and served at `/storage/*`. Good for single-server setups and local development.

### MinIO (recommended for production)

MinIO is a self-hosted S3-compatible object store. The bucket is created automatically on startup.

```env
STORAGE_DRIVER=minio
MINIO_ENDPOINT=http://your-minio-host:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=imgo
```

MinIO's web dashboard is available at port `9001` when using Docker Compose (`minioadmin / minioadmin` by default).

---

## How Caching Works

```
Request → If-None-Match header match? → 304 Not Modified  (instant)
        → Redis HIT?                  → Serve cached buffer (fast)
        → Redis MISS                  → Fetch from storage
                                      → Sharp transform + EXIF strip
                                      → Cache in Redis (24h TTL)
                                      → Serve buffer
```

Each unique `imageId + transform params` combination gets its own Redis cache entry. Redis unavailability never crashes the app — it silently falls back to reprocessing on every request.

---

## Self-Hosting Guide

### VPS (Ubuntu / Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone and configure
git clone https://github.com/manishdashsharma/Imgo.git
cd Imgo
cp .env.example .env
nano .env   # set CORS_ORIGIN, SIGNED_URL_SECRET, credentials

# Start
./start.sh
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name images.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add SSL with Certbot:

```bash
certbot --nginx -d images.yourdomain.com
```

---

## Roadmap

| Version | Features | Status |
|---------|----------|--------|
| **v1.0** | Upload, transform, folders, health, Docker | ✅ Done |
| **v1.1** | API key auth, signed URLs, private images | ✅ Done |
| **v1.2** | Background removal, smart crop | Planned |
| **v1.3** | Web dashboard — browse images, usage stats | Planned |
| **v2.0** | Video processing (ffmpeg + BullMQ) | Planned |
| **v2.1** | Multi-tenant support | Planned |

---

## Contributing

Contributions are welcome — bug fixes, features, documentation, tests.

```bash
git clone https://github.com/manishdashsharma/Imgo.git
cd Imgo
npm install
cp .env.example .env
npm run dev
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

- Found a bug? [Open an issue](https://github.com/manishdashsharma/Imgo/issues/new?template=bug_report.md)
- Have an idea? [Start a discussion](https://github.com/manishdashsharma/Imgo/discussions)
- Want to contribute? [Read the guide](CONTRIBUTING.md)

---

## License

MIT — use it, modify it, ship it. See [LICENSE](LICENSE).

---

**Built by [Manish Dash Sharma](https://manishdashsharma.site)**
Senior Software Engineer — architecting systems that scale.

*Stop renting your image infrastructure. Own it.*

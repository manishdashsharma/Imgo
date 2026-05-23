# Changelog

All notable changes to Imgo will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project uses [Semantic Versioning](https://semver.org/).

---

## [0.2.0] — 2026-05-23

### Added
- API key authentication — `POST /v1/auth/setup`, `POST /v1/auth/keys/create`, `GET /v1/auth/keys`, `POST /v1/auth/keys/revoke`
- First-time setup endpoint (`/v1/auth/setup`) — blocked after first key is created
- All management endpoints (images, folders) are now protected with `Authorization: Bearer <key>`
- Per-image visibility — `public` (default) or `private` set at upload time
- Signed URLs for private images — HMAC-SHA256 signed, time-limited, tamper-proof
- `POST /v1/images/sign` — generate signed URL with custom transform params and expiry (60s–7d)
- `SIGNED_URL_SECRET` env var for signing private image URLs
- Storage adapters moved to `src/shared/services/` — cleaner module boundary

### Changed
- `docker-compose.yml` now uses `env_file: .env` — no more hardcoded values in Compose file
- MinIO container credentials (`MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`) now driven by `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` from `.env` — single source of truth
- Docker Compose project renamed to `imgo` (via `name: imgo`) — containers now named `imgo-*` instead of `selfkit-*`
- `.env` updated to use Docker service names (`redis://redis:6379`, `http://minio:9000`, `mongodb://mongo:27017/imgo`)
- `start.sh` MinIO credentials display corrected to `minioadmin / minioadmin`

### Fixed
- Dockerfile: replaced deprecated `--only=production` with `--omit=dev`
- Dockerfile: removed conflicting `vips-dev` package — Sharp 0.34 bundles its own libvips

---

## [0.1.0] — 2026-05-23

### Added
- On-the-fly image transformations via URL parameters (`w`, `h`, `format`, `q`, `fit`, `blur`, `grayscale`)
- ETag + 304 Not Modified support for browser-native caching
- Redis transform cache (24h TTL, silent fallback when Redis unavailable)
- Local filesystem storage adapter
- MinIO (S3-compatible) storage adapter — swap with one env var
- Folder management — create, list, soft-delete
- EXIF metadata stripping by default
- Auto-create MinIO bucket on startup
- Auto-create local uploads directory on startup
- Health endpoints — `/health`, `/health/live`, `/health/ready`, `/health/detailed`, `/health/system`
- Rate limiting — global, configurable via env vars
- Multer error handling — proper 400 for file size and type violations
- Zod v4 request validation for all endpoints
- Docker Compose setup with MongoDB, Redis, and MinIO
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- GitHub issue templates and PR template

---

## Format

```
## [version] — YYYY-MM-DD

### Added      — new features
### Changed    — changes to existing functionality
### Deprecated — features to be removed in a future release
### Removed    — features removed in this release
### Fixed      — bug fixes
### Security   — vulnerability patches
```

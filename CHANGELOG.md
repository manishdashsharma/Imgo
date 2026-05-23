# Changelog

All notable changes to Imgo will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project uses [Semantic Versioning](https://semver.org/).

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

<<<<<<< HEAD
# Imgo

**Self-hosted image processing. Deploy once, own forever.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](docker-compose.yml)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()

Imgo is an open-source alternative to ImageKit and Cloudinary. Upload images, serve them with on-the-fly transformations via URL parameters, and pay nothing — ever. Deploy it on any VPS in under 5 minutes.

```
GET /v1/i/your-image-id?w=800&format=webp&q=80
```

---

## Why Imgo?

| | Imgo | ImageKit | Cloudinary |
|---|---|---|---|
| Monthly cost | **$0** | $59–$249+ | $99–$499+ |
| Bandwidth limits | **None** | 25–100 GB | 25–100 GB |
| Transformations | **Unlimited** | 1,000–10,000/mo | 25,000/mo |
| Self-hosted | **Yes** | No | No |
| Open source | **Yes** | No | No |
| Data ownership | **Full** | Vendor | Vendor |
| EXIF stripping | **Built-in** | Paid addon | Paid addon |

---

## Features

- **On-the-fly transforms** — resize, compress, convert format, blur, grayscale via URL params
- **ETag + HTTP caching** — 304 responses, `immutable` cache headers, browser-native caching
- **Redis transform cache** — processed images cached for 24h, sub-millisecond repeat requests
- **Storage adapters** — local filesystem or MinIO (S3-compatible), swap with one env var
- **EXIF stripping** — metadata removed by default for privacy
- **Folder organization** — group images into logical folders
- **Health endpoints** — `/ready`, `/live`, `/detailed` for container orchestration
- **Rate limiting** — built-in, configurable per environment
- **Docker first** — one `docker-compose up` brings everything up

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/manishdashsharma/imgo.git
cd imgo
cp .env.example .env
docker-compose up -d
```

Your API is running at `http://localhost:3000`.

### Local Development

**Prerequisites:** Node.js 20+, MongoDB, Redis

```bash
git clone https://github.com/manishdashsharma/imgo.git
cd imgo
npm install
cp .env.example .env
# edit .env with your MongoDB and Redis URLs
npm run dev
```

---

## Upload an Image

```bash
curl -X POST http://localhost:3000/v1/images/upload \
  -F "image=@photo.jpg" \
  -F "folder=products"
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "url": "/storage/products/550e8400-e29b-41d4-a716-446655440000.jpg",
      "folder": "products",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 245760,
      "width": 1920,
      "height": 1080
    }
  }
}
```

---

## Serve & Transform

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
# Thumbnail (200×200, WebP)
curl http://localhost:3000/v1/i/664f1a2b?w=200&h=200&format=webp

# High-quality banner (1200px wide, AVIF)
curl http://localhost:3000/v1/i/664f1a2b?w=1200&format=avif&q=90

# Blurred placeholder
curl http://localhost:3000/v1/i/664f1a2b?w=20&blur=5

# Grayscale avatar
curl http://localhost:3000/v1/i/664f1a2b?w=100&h=100&grayscale=true&format=webp

# Portrait crop
curl http://localhost:3000/v1/i/664f1a2b?w=400&h=600&fit=cover
```

---

## API Reference

### Images

#### Upload image
```
POST /v1/images/upload
Content-Type: multipart/form-data

Fields:
  image    File     Required. The image file.
  folder   string   Optional. Destination folder (default: "default")
```

#### List images
```
GET /v1/images?folder=products&page=1&limit=20
```

#### Get image metadata
```
GET /v1/images/:imageId
```

#### Delete image (soft)
```
POST /v1/images/delete
Content-Type: application/json

{ "imageId": "664f1a2b3c4d5e6f7a8b9c0d" }
```

---

### Folders

#### Create folder
```
POST /v1/folders/create
Content-Type: application/json

{ "name": "Products" }
```

#### List folders
```
GET /v1/folders?page=1&limit=20
```

#### Delete folder
```
POST /v1/folders/delete
Content-Type: application/json

{ "folderId": "664f1a2b3c4d5e6f7a8b9c0d" }
```

> Folders with active images cannot be deleted.

---

### Health

| Endpoint | Use case |
|----------|----------|
| `GET /v1/health` | Basic liveness |
| `GET /v1/health/live` | Kubernetes liveness probe |
| `GET /v1/health/ready` | Kubernetes readiness probe |
| `GET /v1/health/detailed` | MongoDB + Redis + storage status |
| `GET /v1/health/system` | Full system snapshot (saved to DB) |

---

## Configuration

Copy `.env.example` to `.env` and edit:

```env
ENV=production
PORT=3000

MONGODB_URL=mongodb://localhost:27017/imgo
REDIS_URL=redis://localhost:6379

# Storage: local | minio
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads

# MinIO (when STORAGE_DRIVER=minio)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=imgo

MAX_FILE_SIZE_MB=50
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml

CORS_ORIGIN=https://yourdomain.com
```

---

## Storage Adapters

Imgo ships with two storage adapters. Switch between them with `STORAGE_DRIVER`.

### Local filesystem (default)

Files are stored in `STORAGE_LOCAL_PATH` and served at `/storage/*`. Good for single-server setups.

```env
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
```

### MinIO (recommended for production)

MinIO is a self-hosted S3-compatible object store. The bucket is created automatically on startup.

```env
STORAGE_DRIVER=minio
MINIO_ENDPOINT=http://your-minio-host:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=imgo
```

MinIO's web dashboard is available at port `9001` when using `docker-compose`.

---

## Self-Hosting Guide

### VPS (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone and configure
git clone https://github.com/manishdashsharma/imgo.git
cd imgo
cp .env.example .env
nano .env   # set CORS_ORIGIN, credentials

# Start
docker-compose up -d

# Check logs
docker-compose logs -f imgo
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

---

## How Caching Works

```
Request → ETag match? → 304 Not Modified (instant)
        → Redis hit?  → Cached buffer served (fast)
        → Redis miss? → Sharp processes image → cache → serve
```

Each unique combination of image + transform params gets its own cache entry (24h TTL). EXIF data is always stripped before caching.

---

## Roadmap

| Version | Features |
|---------|----------|
| **v1.0** | Core API — upload, transform, folders, health |
| **v1.1** | Background removal, smart crop |
| **v1.2** | API key authentication |
| **v1.3** | Web dashboard — browse images, usage stats |
| **v2.0** | Multi-tenant support |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

- Found a bug? [Open an issue](https://github.com/manishdashsharma/imgo/issues/new?template=bug_report.md)
- Have a feature idea? [Start a discussion](https://github.com/manishdashsharma/imgo/discussions)
- Want to contribute? [Read the guide](CONTRIBUTING.md)

---

## License

MIT — use it, modify it, ship it. See [LICENSE](LICENSE).

---

**Built by [Manish Dash Sharma](https://manishdashsharma.site)** — Senior Software Engineer. Architecting AI-powered systems that scale. From GenAI integrations to full-stack solutions — turning complex problems into elegant code.

*Stop renting your image infrastructure. Own it.*
=======
# SelfKit 🚀

![Status](https://img.shields.io/badge/status-Development-yellow)

**The open-source, self-hosted image processing solution that puts you back in control.**

Stop paying $200+ monthly for ImageKit and Cloudinary. SelfKit gives you enterprise-grade image processing on your own infrastructure for free.

## Why SelfKit?

Small businesses and developers are tired of expensive image hosting services that charge based on bandwidth and transformations. A simple e-commerce site can quickly rack up hundreds of dollars monthly just for image processing.

**The Problem:**
- ImageKit: $59-$249/month + bandwidth costs
- Cloudinary: $99-$499/month + transformation fees  
- AWS S3 + Lambda: Complex setup, unexpected bills
- Basic hosting: No optimization, slow loading times

**The Solution:**
SelfKit is a Docker-based image processing microservice that you deploy once and own forever. Get all the features of premium services without the recurring costs.

## Features ✨

### 🔧 **Complete Image Processing**
- Automatic optimization and compression
- Multi-format support (JPEG, PNG, WebP, AVIF, GIF, SVG)
- Real-time resizing and transformation
- Batch processing capabilities
- EXIF data handling

### 🏗️ **Developer-First Design**
- RESTful API with comprehensive endpoints
- Docker deployment in under 5 minutes
- Built-in folder organization
- Comprehensive logging and monitoring
- Rate limiting and security features

### 💰 **Cost-Effective**
- One-time setup, no recurring fees
- Use your existing VPS/cloud infrastructure
- Scale vertically without per-image costs
- Open-source with MIT license

### 🛡️ **Privacy & Control**
- Your images stay on your servers
- Complete data ownership
- No third-party dependencies
- Customizable to your needs

## Quick Start

Deploy SelfKit in 3 commands:

```bash
# Pull and run SelfKit
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/images:/app/storage \
  --name selfkit \
  selfkit/selfkit:latest

# Your image API is now running at http://localhost:8080
# Upload your first image
curl -X POST -F "image=@photo.jpg" -F "folder=products" \
  http://localhost:8080/upload
```

## Who's Using SelfKit?

Perfect for:
- **E-commerce stores** managing product images
- **Digital agencies** serving multiple clients  
- **SaaS platforms** with user-generated content
- **Blogs and content sites** optimizing media
- **Mobile app backends** processing user uploads

## Comparison

| Feature | SelfKit | ImageKit | Cloudinary |
|---------|---------|----------|------------|
| Monthly Cost | $0 | $59-$249+ | $99-$499+ |
| Bandwidth Limits | None | 25-100GB | 25-100GB |
| Transformations | Unlimited | 1,000-10,000 | 25,000+ |
| Self-Hosted | ✅ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ |
| Data Control | ✅ | ❌ | ❌ |

## Roadmap 🗺️

- **v1.0**: Core image processing and API
- **v1.1**: Advanced transformations and filters
- **v1.2**: CDN integration options
- **v1.3**: Dashboard and analytics
- **v2.0**: Multi-tenant support

## Contributing

SelfKit is built by developers, for developers. We welcome contributions!

- 🐛 Found a bug? Open an issue
- 💡 Have a feature idea? Start a discussion
- 🚀 Want to contribute? Check our contributing guide

## Community & Support

- **GitHub**: [Issues and discussions](https://github.com/manishdashsharma/selfkit)
- **Documentation**: Coming soon...
- **Website**: Coming soon...

## License

MIT License - Use it, modify it, distribute it freely.

---

**Built with ❤️ by [Manish Dash Sharma](https://manishdashsharma.site/) at [EasyTech Innovate](https://easytechinnovate.site/)**

*Stop renting your image infrastructure. Own it with SelfKit.*
>>>>>>> 11fe95a425368d43aaa55f23713337356b66ebbf

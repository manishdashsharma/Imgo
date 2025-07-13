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

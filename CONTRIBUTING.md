# Contributing to Imgo

Thank you for taking the time to contribute. Imgo is built by the community, for the community — every bug report, feature suggestion, and pull request makes it better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Standards](#code-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Security Issues](#reporting-security-issues)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Set up** the development environment (see below)
4. **Create a branch** for your change
5. **Make your changes**, following the code standards
6. **Open a pull request**

---

## How to Contribute

### Reporting Bugs

Before opening a bug report, please check if the issue already exists. When filing a new bug:

- Use the **Bug Report** issue template
- Include your Node.js version, OS, and storage driver
- Provide a minimal reproduction — curl command or code snippet
- Attach relevant log output

### Suggesting Features

Feature requests are welcome. Please use the **Feature Request** template and explain:

- The problem you are trying to solve
- Why this belongs in Imgo core (vs. a plugin or separate tool)
- Any API design ideas you have

### Improving Documentation

Documentation improvements — typo fixes, better examples, clearer wording — are always welcome. No issue needed for small changes; just open a PR.

---

## Development Setup

### Prerequisites

- Node.js 20 or later
- MongoDB (local or Atlas)
- Redis (local or Docker)

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/imgo.git
cd imgo

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — at minimum set MONGODB_URL and REDIS_URL

# 4. Start the development server
npm run dev
```

### Running with Docker (easiest)

```bash
cp .env.example .env
docker-compose up -d
npm run dev   # runs only the Node.js server; MongoDB, Redis, MinIO are in Docker
```

### Useful commands

```bash
npm run dev        # start with hot reload
npm run lint       # check for lint errors
npm run lint:fix   # auto-fix lint errors
npm run format     # run prettier
```

---

## Project Structure

```
src/
├── config/
│   ├── connections.js   # MongoDB, Redis, MinIO startup
│   ├── redis.js         # CacheManager
│   └── index.js         # All env vars
├── modules/
│   ├── images/          # Upload, list, get, delete
│   ├── transform/       # Sharp processing + cache
│   ├── folders/         # Folder management
│   └── health/          # Health check endpoints
├── storage/
│   ├── adapter.js       # Factory — returns active adapter
│   ├── local.adapter.js # Filesystem storage
│   └── minio.adapter.js # MinIO / S3-compatible storage
├── models/              # Mongoose models
├── shared/              # Logger, response helpers, middleware
└── router/              # Route mounting
```

New features follow the existing module pattern:

```
src/modules/<name>/
  controllers/<name>.controller.js
  services/<name>.service.js
  routes/<name>.route.js
  validations/<name>.schema.js
  index.js
```

---

## Code Standards

Imgo has strict coding conventions. Please follow them or your PR will be asked to revise.

### The non-negotiables

- **No comments or JSDoc** — name things clearly instead
- **No `console.log`** — use `logger` from `src/shared/index.js`
- **ES Modules only** — `import/export`, never `require`
- **Only GET and POST routes** — no PUT, PATCH, DELETE
- **Soft deletes only** — set `isActive: false`, never hard delete
- **Always `.select()` on queries** — never fetch full documents
- **Always `.lean()` on read-only queries**
- **`Promise.all` for independent parallel queries**
- **No query inside a loop** — use `$in` or aggregate

### Response shape

All endpoints must return this exact shape:

```js
// Success
{ success: true, statusCode: 200, message: "...", data: { ... } }

// Error
{ success: false, statusCode: 404, message: "...", data: null }
```

Use the helpers from `src/shared/index.js`:
```js
import { httpResponse, httpError, responseMessage } from '../../../shared/index.js';
```

### Error throwing in services

```js
const error = new Error('Image not found');
error.statusCode = 404;
throw error;
```

### Linting

Run `npm run lint` before every commit. PRs with lint errors will not be merged.

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change with no behavior change |
| `perf` | Performance improvement |
| `chore` | Tooling, deps, config |

**Examples:**

```
feat(transform): add grayscale parameter support
fix(images): return 400 when no file is provided
docs: update quick start in README
chore: upgrade sharp to 0.34
```

---

## Pull Request Process

1. **One PR per concern** — keep PRs focused. A bug fix and a new feature should be separate PRs.
2. **Base against `main`** — always branch from and target `main`.
3. **Fill in the PR template** — describe what changed and why.
4. **Pass all checks** — lint must be clean. If tests exist, they must pass.
5. **No breaking changes without discussion** — open an issue first if your change affects the public API or existing behavior.
6. **Be responsive** — maintainers may request changes. Unresponsive PRs are closed after 30 days.

### PR title format

Follow the same convention as commits:
```
feat(transform): add smart crop endpoint
fix(health): redis status not shown in detailed check
```

---

## Adding a New Storage Adapter

Imgo's storage layer is designed for extensibility. To add a new adapter (e.g., AWS S3, GCS):

1. Create `src/storage/your-adapter.js`
2. Implement the interface:
   ```js
   class YourAdapter {
     async upload(buffer, key, mimeType) { /* returns { key, url } */ }
     async get(key)                       { /* returns Buffer */ }
     async delete(key)                    { /* returns void */ }
     async exists(key)                    { /* returns boolean */ }
   }
   ```
3. Register it in `src/storage/adapter.js`
4. Add the env vars to `.env.example` and `src/config/index.js`
5. Document it in `README.md`

---

## Reporting Security Issues

**Please do not open a public GitHub issue for security vulnerabilities.**

Read [SECURITY.md](SECURITY.md) for the responsible disclosure process.

---

## Questions?

Open a [GitHub Discussion](https://github.com/manishdashsharma/imgo/discussions) for anything that is not a bug or feature request.

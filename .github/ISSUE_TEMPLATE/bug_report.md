---
name: Bug Report
about: Report something that is broken or not working as expected
title: "fix: "
labels: bug
assignees: manishdashsharma
---

## Describe the bug

A clear and concise description of what the bug is.

## Steps to reproduce

1. 
2. 
3. 

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened.

## Reproduction

Paste the curl command or minimal code that reproduces the issue:

```bash
# example
curl -X POST http://localhost:3000/v1/images/upload \
  -F "image=@photo.jpg"
```

## Environment

- Imgo version / commit:
- Node.js version:
- OS:
- Storage driver: `local` / `minio`
- Redis available: yes / no

## Logs

Paste relevant log output:

```
paste logs here
```

## Additional context

Any other context about the problem.

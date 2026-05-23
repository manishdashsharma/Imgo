## What does this PR do?

<!-- One paragraph explaining the change and why it is needed. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor (no behavior change)
- [ ] Performance improvement
- [ ] Chore (deps, tooling, config)

## How to test

<!-- Paste the curl commands or steps a reviewer should follow to verify this works. -->

```bash
# example
curl -X POST http://localhost:3000/v1/images/upload \
  -F "image=@test.jpg"
```

## Checklist

- [ ] `npm run lint` passes with no errors
- [ ] I followed the code conventions in CONTRIBUTING.md (no comments, no console.log, ES modules, soft deletes)
- [ ] I have not added any breaking changes to existing API responses
- [ ] I updated `.env.example` if I added new environment variables
- [ ] I updated `README.md` if I added or changed API endpoints

## Related issues

<!-- Closes #123 -->

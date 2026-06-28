# NiceChunk CI Workflow Specification

NiceChunk does not currently publish `.github/workflows/*` because the available GitHub credential cannot create or update workflow files without the `workflow` scope.

This document defines the workflow that should be committed once a properly scoped credential is available. Until then, reviewers can run the same commands locally.

## Required Jobs

| Job | Purpose | Commands |
| --- | --- | --- |
| repository-health | Public hygiene, split generation, split self-containment, and dependency audit | `npm ci`, `node scripts/split-github-repos.mjs`, `npm run validate:repo`, `npm run validate:splits`, `npm run audit:deps` |
| core-tests | SDK, protocol helper, and representative plus wide-range deterministic worldgen fixtures | `npm ci`, `npm run test:core` |
| web-build | Browser route, asset compilation, and Chromium smoke audit | `npm ci`, `npx playwright install --with-deps chromium`, `npm run build`, `npm run audit:browser-smoke` |
| guardian-tests | Guardian C++ protocol and AOI checks | `cmake -S Guardian -B Guardian/build -DCMAKE_BUILD_TYPE=Release`, `cmake --build Guardian/build -j`, `npm run validate:guardian` |
| release-evidence | Machine-readable provenance snapshot | `npm run release:evidence` |

## Draft Workflow

Do not paste this into `.github/workflows/release-validation.yml` until the pushing credential has `workflow` scope.

```yaml
name: Release validation

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  repository-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: node scripts/split-github-repos.mjs
      - run: npm run validate:repo
      - run: npm run validate:splits
      - run: npm run audit:deps

  core-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test:core

  web-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run audit:browser-smoke

  guardian-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: cmake -S Guardian -B Guardian/build -DCMAKE_BUILD_TYPE=Release
      - run: cmake --build Guardian/build -j
      - run: npm run validate:guardian

  release-evidence:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run release:evidence
```

## Activation Checklist

Before committing the workflow file:

1. Use a token or GitHub App installation that has `workflow` scope.
2. Commit the workflow as `nicechunk <293527782+nicechunk@users.noreply.github.com>`.
3. Run the workflow on a test branch before relying on it for release gating.
4. Keep this document in sync with any workflow changes.

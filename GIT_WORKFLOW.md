# Git Branching Strategy & Workflow - Relaxio Spa CRM

This document outlines the Git branching strategy, code review policies, and release management workflows for the **Relaxio Spa Customer Relationship Management System**.

---

## 🌲 1. Branch Hierarchy & Structure

```
main (v1.0.0 Stable Production)
 ├── hotfix/v1.0.1-patch (Critical Hotfixes)
 └── develop (Active Pre-Release Branch for v1.1)
      ├── feature/v1.1-ai-assistant
      ├── feature/v1.1-whatsapp-api
      ├── feature/v1.1-appointments
      └── release/v1.1.0-rc1
```

### Primary Branches
- **`main`**: Represents production-ready code. Always reflects the latest stable version deployed to live servers. Direct commits are forbidden.
- **`develop`**: The primary integration branch for Version 1.1 development. Features are merged here after passing automated lint and build checks.

### Supporting Branches
- **`feature/*`**: Short-lived feature branches created off `develop` (e.g., `feature/v1.1-appointment-calendar`).
- **`release/*`**: Preparation branches for upcoming major/minor releases (e.g., `release/v1.1.0-rc1`).
- **`hotfix/*`**: Emergency patch branches created off `main` for critical production defects.

---

## 🔒 2. Branch Protection & Protection Rules

### `main` Branch Protection Rules
- **Require Pull Request**: At least 1 senior engineer or QA Lead approval required.
- **Require Status Checks**:
  - `npm run lint` MUST pass with 0 errors.
  - `npm run build` MUST complete cleanly with zero compilation errors.
- **Enforce Linear History**: Rebase and merge preferred; no untracked merge commits.

### `develop` Branch Protection Rules
- Require automated CI/CD pipeline pass prior to merging feature branches.

---

## 📝 3. Commit Message Conventions
Commits must follow the **Conventional Commits** standard:
- `feat(auth): add auto-logout session timeout monitor`
- `fix(invoicing): correct GST calculation rounding issue`
- `docs(api): update ARCHITECTURE.md with v1.1 feature flags`
- `refactor(context): optimize SpaDataContext re-render triggers`
- `sec(headers): enforce strict Content-Security-Policy in vercel.json`

---

## 🚀 4. Release Process Strategy
1. Cut `release/v1.1.0` branch from `develop`.
2. Conduct QA smoke test and regression verification.
3. Apply final release notes to `CHANGELOG.md` and `RELEASE_NOTES.md`.
4. Merge `release/v1.1.0` into `main` and tag with semantic version `v1.1.0`.
5. Back-merge `main` into `develop`.

# Change Log

All notable changes to the "bdd-step-architect" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- Git hooks via Husky (pre-commit, commit-msg, pre-push)
- Pre-commit hook runs `lint` and `compile` automatically
- Commit message validation via commitlint (conventional commits enforced)
- Pre-push hook validates branch naming convention (`feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`, `hotfix/`)
- `CONTRIBUTING.md` with full contribution workflow and branch protection rules
- `.github/pull_request_template.md` for standardized PRs
- `commitlint.config.js` with allowed commit types

### Changed
- `README.md` fully rewritten with project explanation, features, architecture, configuration, and open-source guidelines
- Project refactored to follow SOLID principles (interfaces, dependency injection, single responsibility)
- All hardcoded Gherkin keywords extracted to shared constants

## [0.0.1]

### Added
- Quick Fix code actions for `.feature` files
- Autocomplete from existing step definitions
- CodeLens overlay for `.ts` step definitions
- Smart import merging
- Data table detection
- Alias pattern support
- Typewriter and color morph animation
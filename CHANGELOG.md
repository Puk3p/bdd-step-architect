# Change Log

All notable changes to the "bdd-step-architect" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]
- *No unreleased changes at the moment.*

## [0.0.4] - The "Smart Assistant" Update

### Added
- **Go To Definition (F12):** Press `F12` or `Cmd/Ctrl + Click` on any Gherkin step in `.feature` files to instantly jump to its TypeScript definition.
- **Interactive Step Analytics:** CodeLens now shows `📊 Used in X scenarios (Click to view)`. Clicking it opens VS Code's native inline Peek View to see and navigate to all usages across `.feature` files.
- **Zero-Lag Scanning:** New `FeatureScanner` reads buffers directly from the file system for instant analytics without impacting editor memory.
- Git hooks via Husky (pre-commit, commit-msg, pre-push).
- Commit message validation via commitlint (conventional commits enforced).
- Pre-push hook validates branch naming convention (`feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`, `hotfix/`).
- `CONTRIBUTING.md` with full contribution workflow and branch protection rules.
- `.github/pull_request_template.md` for standardized PRs.

### Changed
- **Architecture:** Entire codebase refactored to follow strict SOLID principles (Interfaces, Dependency Injection, Single Responsibility).
- `README.md` fully rewritten with project explanation, features, architecture, configuration, and open-source guidelines.
- All hardcoded Gherkin keywords extracted to shared constants.

## [0.0.3] - Compatibility Fix

### Fixed
- **Engine Compatibility:** Downgraded VS Code engine requirement to `^1.105.0` to fix the "Not Compatible" installation error for users on older VS Code versions.
- Synchronized `@types/vscode` version with the engine requirement for execution stability.

### Added
- Automated CI/CD workflows via GitHub Actions for publishing to the Marketplace and creating GitHub Releases automatically on tag pushes.

## [0.0.2] - Enhanced Alias & UI Update

### Added
- Ghost Badges: Temporary floating badges for visual confirmation of auto-generated steps.
- UI dropdown for file selection now shows relative workspace paths for better readability.

### Changed
- Intelligent Alias Support: Upgraded regex engine for Endava-style aliases (`as party1`, `for session session2`).
- Cinematic Insertion V2: Smoother typewriter effect and color morphing animations.
- Unified Imports: Enhanced logic to prevent duplicate imports when merging `Given`, `When`, and `Then`.

## [0.0.1] - Initial Release

### Added
- Quick Fix code actions for generating step definitions from `.feature` files.
- Autocomplete suggestions from existing step definitions.
- CodeLens overlay for `.ts` step definitions (translates regex to human-readable format).
- Smart import merging.
- Data table detection and parameter insertion.
- Basic alias pattern support.
- Typewriter and color morph animation on step insertion.
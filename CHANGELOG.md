# Change Log

All notable changes to the "bdd-step-architect" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]
- *No unreleased changes at the moment.*

## [0.0.8] - The "Stability" Update

### Fixed
- **Branch Switch Step Explosion:** File watchers now use 500ms debouncing to prevent concurrent workspace scans. Previously, switching branches triggered hundreds of simultaneous `scanWorkspace()` calls, inflating the Step Catalog to ~70,000 duplicate entries.

## [0.0.7] - The "Dead Code Precision" Update

### Fixed
- **Dead Code Sweeper — Cucumber Expression Matching:** Step patterns using cucumber expressions (`{int}`, `{string}`, `{float}`, `{word}`) are now converted to their regex equivalents before matching against feature files. Previously, raw expressions like `{string}` were passed directly to `RegExp`, causing valid steps to be falsely reported as unused.
- **Dead Code Sweeper — Scenario Outline Support:** Feature lines containing `<placeholder>` parameters (from Scenario Outlines) are now matched using wildcard expansion. Steps used only in Scenario Outlines are no longer falsely reported as unused.
- **StepScanner Delimiter Pairing:** Separated regex-delimited (`/pattern/`) and string-delimited (`'pattern'`, `"pattern"`) step extraction into two distinct passes with proper delimiter pairing. This prevents pattern truncation when a regex step contains quote characters inside the pattern.

### Added
- **Clickable Diagnostics:** Unused steps are now reported as ⚠️ warnings in the VS Code Problems panel (`Ctrl+Shift+M`), allowing one-click navigation to the step definition. The Output Channel summary report is preserved alongside.

## [0.0.6] - The "Visibility & Discovery" Update

### Added
- **Feature Graph Visualizer:** A new webview panel that renders an interactive flow graph of any `.feature` file. Shows the Feature header, Background block, and Scenarios as connected cards with color-coded step nodes (Given=blue, When=yellow, Then=green, And=purple, But=orange). Includes collapse/expand controls, tags display, step grouping with action separators, line numbers, and a legend. Triggered via a graph icon in the editor title bar or from the command palette (`BDD: Visualize Feature Graph`).
- **Step Search (Quick Pick):** A new `🔍` search button in the Step Catalog sidebar title bar. Opens a fuzzy-search Quick Pick across all step definitions — search by keyword, pattern, or file name and jump directly to the definition. Also available via command palette (`BDD: Search Step Definitions`).
- **Feature File Caching:** `FeatureScanner` now pre-caches all parsed step lines from `.feature` files at startup. CodeLens resolution in `.ts` files is now near-instant instead of re-reading every feature file from disk on each call. A `.feature` file watcher auto-refreshes the cache on changes.

### Fixed
- **String-Delimited Step Definitions:** `BddCodeLensProvider` and `BddDefinitionProvider` now correctly match step definitions using string syntax (`'pattern'`, `"pattern"`) in addition to regex syntax (`/pattern/`). Previously, only regex-delimited steps were visible — string-based steps like `Then('the response httpCode should be {int}', ...)` were invisible to CodeLens and Go To Definition.

## [0.0.5] - The "God Mode" & Refactoring Update

### Added
- **The "God Button" (Bulk Step Generator):** A smart CodeLens now appears directly above the `Scenario:` keyword in `.feature` files. The extension automatically scans the scenario and, if it detects unimplemented steps (missing from TypeScript), displays a `✨ Generate X Missing Steps` button. One click lets you choose the target file, and the extension generates all the TypeScript boilerplate functions at once. No more one-by-one "Quick Fix" drudgery.
- **Global Step Rename (Smart Refactoring):** Right-click any step in the Step Catalog and select `✏️ Edit / Rename Step`. The extension doesn't just modify the regex in the `.ts` file — it scans every `.feature` file in the project and updates all references from the old step text to the new one. Clean, safe, global refactoring.
- **Dead Code Sweeper (Unused Step Report):** In large projects, orphan steps accumulate over time. A new command (and a `🗑️` button in the catalog toolbar) scans the entire workspace. The extension compares the TypeScript step dictionary with what's actually used in `.feature` files and generates a detailed report in the VS Code Output Channel, showing exact file paths and steps that can be safely deleted.
- **Test Data Teleporter (File Links):** Words written between quotes (without spaces) in `.feature` files (e.g., `Given a request from file "prtMandatoryFields"`) now become clickable links. Hold `Ctrl` / `Cmd` and click to automatically find the associated data file (`.json`, `.ts`, etc.) and open it in a split view panel.

### Changed
- **Smart Step Catalog (Teleport & UI Overhaul):** The sidebar catalog no longer inserts text — it now acts as a "Tree Map" of the project. Clicking a step in the catalog instantly teleports you to the exact line in the `.ts` file where it's implemented.
  - **Native color codes:** Catalog icons are now color-coded (Blue for Given, Yellow for When, Green for Then).
  - **Visible metadata:** The source file name is shown next to each step (e.g., `login.steps.ts`), and hovering displays an elegant Markdown popup with the clean regex pattern.
- **SOLID Architecture Cleanup:** Extracted 4 command handlers (`JumpToStepCommandHandler`, `RenameStepCommandHandler`, `BulkGenerateCommandHandler`, `OpenTestDataCommandHandler`) from `extension.ts`. Added `IGutterDecorator` and `IParameterHighlighter` interfaces. `extension.ts` reduced from 282 to 104 lines — now a pure orchestrator with zero business logic.
- **Codebase Cleanup:** Removed all comments, translated all Romanian text to English, fixed lint errors.

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
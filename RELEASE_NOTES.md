# 🚀 v0.0.7 — The "Dead Code Precision" Update

## 🐛 Bug Fixes

### Dead Code Sweeper — Cucumber Expression Matching
Step patterns using cucumber expressions (`{int}`, `{string}`, `{float}`, `{word}`) are now converted to their regex equivalents before matching against feature files.

Previously, raw expressions like `{string}` were passed directly to `RegExp`, causing valid steps to be **falsely reported as unused**.

### Dead Code Sweeper — Scenario Outline Support
Feature lines containing `<placeholder>` parameters (from Scenario Outlines) are now matched using wildcard expansion.

Steps used **only** in Scenario Outlines are no longer falsely reported as unused.

### StepScanner Delimiter Pairing
Separated regex-delimited (`/pattern/`) and string-delimited (`'pattern'`, `"pattern"`) step extraction into two distinct passes with proper delimiter pairing.

This prevents **pattern truncation** when a regex step contains quote characters inside the pattern (e.g. `/"(created|default)"/`), which previously caused `Error processing regex for step:` console errors.

---

## ✨ New Features

### Clickable Diagnostics (Problems Panel)
Unused steps are now reported as ⚠️ warnings in the VS Code **Problems panel** (`Ctrl+Shift+M`), allowing **one-click navigation** to the step definition.

The Output Channel summary report is preserved alongside for a full overview.

---

## 📦 Install

```
windsurf --install-extension bdd-step-architect-0.0.7.vsix
```

Or in Windsurf/VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`

---

**Full Changelog:** [v0.0.6...v0.0.7](https://github.com/Puk3p/bdd-step-architect/compare/v0.0.6...v0.0.7)

# 🚀 v0.0.8 — The "Stability" Update

## 🐛 Bug Fixes

### Branch Switch Step Explosion
File watchers now use **500ms debouncing** to prevent concurrent workspace scans.

Previously, switching branches triggered hundreds of simultaneous `scanWorkspace()` calls, inflating the Step Catalog to **~70,000 duplicate entries**. Now, rapid-fire file change events collapse into a single scan after the storm settles.

---

## 📦 Install

```
windsurf --install-extension bdd-step-architect-0.0.8.vsix
```

Or in Windsurf/VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`

---

**Full Changelog:** [v0.0.7...v0.0.8](https://github.com/Puk3p/bdd-step-architect/compare/v0.0.7...v0.0.8)

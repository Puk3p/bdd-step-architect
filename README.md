<h1 align="center">BDD Step Architect</h1>

<p align="center">
  <img src="icons/logo.png" alt="BDD Step Architect Logo" width="180" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VS%20Code-Extension-007ACC?style=for-the-badge&logo=visualstudiocode" />
  <img src="https://img.shields.io/badge/TypeScript-Powered-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-BDD-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" />
</p>

<p align="center">
  <strong>Smart BDD Assistant for Playwright and TypeScript</strong>
</p>

<p align="center">
  A VS Code extension that automates the creation of BDD step definitions from
  <code>.feature</code> files, so you can focus on writing tests instead of boilerplate.
</p>

<p align="center">
  Created by <strong>Lupu George</strong>
</p>

---

## What Is This?

If you work with **Behavior-Driven Development (BDD)** using Playwright and TypeScript, you know the pain: you write a Gherkin scenario in a `.feature` file, then you manually create the matching step definition in a `.ts` file — wiring up regex patterns, imports, and typed parameters by hand.

**BDD Step Architect eliminates that entirely.** It reads your Gherkin steps, generates production-ready TypeScript step definitions with correct regex, parameters, and imports — and inserts them into your codebase with a single click.

---

## Features

### Quick Fix Code Actions
Write a `Given`, `When`, `Then`, `And`, or `But` step in a `.feature` file and a **Quick Fix** lightbulb appears. Click it to generate the full step definition — regex pattern, typed parameters, data table support, and all necessary imports.

### Autocomplete Existing Steps
Start typing a Gherkin keyword in a `.feature` file and get **autocomplete suggestions** from all existing step definitions already in your project. No more duplicating steps by accident.

### CodeLens Overlay
Every step definition in your `.ts` files gets a **human-readable CodeLens** label above it, translating the raw regex into a readable format like `Given user logs in with {string} and {number}`.

### Smart Import Resolution
When a step is inserted, the extension automatically detects existing imports in the target file and **merges** the new keyword (`Given`, `When`, `Then`) into them — or creates the import if it doesn't exist.

### Animated Insertion
Step definitions are inserted with a **typewriter effect** and a **color morph animation** that flashes through the inserted code, giving you visual feedback that the step was generated.

### Data Table Detection
If your Gherkin step has a data table (lines starting with `|` beneath it), the generator automatically adds a `dataTable` parameter to the step definition.

### Alias Pattern Support
Patterns like `"as party1"` or `"for session session2"` at the end of a step are detected and transformed into **optional regex groups** with proper variable extraction.

---

## Configuration

This extension contributes the following settings via `bddStepArchitect.*`:

| Setting | Default | Description |
|---|---|---|
| `bddStepArchitect.stepsImportPath` | `src/steps/bdd` | The import path used for Gherkin keywords (`Given`, `When`, `Then`). |
| `bddStepArchitect.worldImportPath` | `src/support/worlds/UnifiedWorld` | The import path used for the `UnifiedWorld` interface/class. |

You can customize these in your VS Code settings (`settings.json` or the Settings UI) to match your project's structure.

---

## Project Architecture

```
src/
  interfaces/          Abstractions (SOLID: Interface Segregation + Dependency Inversion)
  core/                Domain logic — parsing, generation, scanning, shared constants
  services/            Infrastructure — config access, import resolution, file selection, animations
  commands/            Command handlers — orchestrates the insertStep command
  providers/           VS Code provider implementations (CodeAction, CodeLens, Completion)
  extension.ts         Composition root — wires all dependencies together
```

The codebase follows **SOLID principles**:
- **Single Responsibility** — each class has one job
- **Open/Closed** — keyword sets are externalized in constants
- **Interface Segregation** — narrow interfaces for every service
- **Dependency Inversion** — all consumers depend on abstractions, not concrete classes

---

## Getting Started

### Prerequisites
- **VS Code** `^1.110.0`
- **Node.js** `18.x` or later

### Install & Run
```bash
git clone https://github.com/Puk3p/bdd-step-architect.git
cd bdd-step-architect
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host.

---

## Contributing

**This is an open-source extension.** Anyone is welcome to contribute — whether it's a bug fix, a new feature, documentation improvement, or a refactor. Every contribution helps make this tool better for the BDD community.

**Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting any changes.** It contains the full contribution workflow, branch rules, and PR requirements.

### TL;DR for Contributors

1. **Fork** the repository
2. **Create a feature branch** from `main` (`feat/your-feature` or `fix/your-bug`)
3. Make your changes and ensure `npm run lint` and `npm test` pass
4. **Open a Pull Request** against `main`
5. Wait for CI to pass and at least **1 approval** before merge

> **Direct pushes to `main` are not allowed.** All changes must go through a Pull Request. This protects the stability of the extension for everyone.

---

## Branch Protection & CI/CD

The `main` branch is protected with the following rules:

- **No direct pushes** — all changes require a Pull Request
- **CI must pass** — the GitHub Actions workflow runs linting and tests on macOS, Ubuntu, and Windows before a PR can be merged
- **At least 1 review approval** is required
- **Branch must be up to date** with `main` before merging

The CI pipeline (`.github/workflows/ci.yml`) runs on every push and PR to `main`:
1. Checks out the code
2. Sets up Node.js 18.x
3. Installs dependencies (`npm ci`)
4. Runs the linter (`npm run lint`)
5. Runs the test suite (`npm test`)

---

## Release Notes

### 0.0.1
- Initial release
- Quick Fix code actions for `.feature` files
- Autocomplete from existing step definitions
- CodeLens overlay for `.ts` step definitions
- Smart import merging
- Data table detection
- Alias pattern support
- Typewriter + color morph animation

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

**Built with TypeScript, powered by VS Code API.**

# Contributing to BDD Step Architect

Thanks for your interest in contributing! This is an open-source VS Code extension and all contributions are welcome — bug fixes, new features, documentation, refactors, or ideas.

---

## Ground Rules

- **All changes go through Pull Requests.** Direct pushes to `main` are blocked.
- **CI must pass** before a PR can be merged (lint + tests on macOS, Ubuntu, Windows).
- **At least 1 code review approval** is required before merging.
- Keep your changes **focused** — one feature or fix per PR.
- Follow the existing code style and project architecture (SOLID principles, interfaces, dependency injection).

---

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/Puk3p/bdd-step-architect.git
cd bdd-step-architect
npm install
```

### 2. Create a Branch

Always branch off `main`. Use a clear naming convention:

| Type | Branch Name |
|---|---|
| New feature | `feat/short-description` |
| Bug fix | `fix/short-description` |
| Refactor | `refactor/short-description` |
| Documentation | `docs/short-description` |

```bash
git checkout -b feat/my-new-feature
```

### 3. Make Your Changes

- Follow the existing **project structure** (see README for architecture overview)
- All new classes should **implement an interface** from `src/interfaces/`
- All dependencies should be **injected via constructor**, not created internally
- Run lint and tests before committing:

```bash
npm run lint
npm test
```

### 4. Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for Scenario Outline parameters
fix: handle empty feature files without crashing
refactor: extract regex builder from GherkinParser
docs: update README with new configuration options
```

### 5. Open a Pull Request

- Push your branch to your fork
- Open a PR against `main` on the upstream repository
- Fill in the PR template (describe what you changed and why)
- Link any related issues

```bash
git push origin feat/my-new-feature
```

Then go to GitHub and click **"New Pull Request"**.

### 6. Code Review

- A maintainer will review your PR
- Address any requested changes by pushing new commits to your branch
- Once approved and CI passes, your PR will be merged

---

## Branch Protection Rules

The `main` branch enforces the following:

- **Require pull request before merging** — no direct commits
- **Require at least 1 approval** from a code reviewer
- **Require status checks to pass** — the CI workflow must succeed
- **Require branch to be up to date** — your branch must be rebased on latest `main`
- **No force pushes** to `main`

These rules exist to protect the stability of the extension and ensure every change is reviewed and tested.

---

## Development Workflow

### Build
```bash
npm run compile
```

### Watch (auto-recompile on save)
```bash
npm run watch
```

### Lint
```bash
npm run lint
```

### Test
```bash
npm test
```

### Run in VS Code
Press `F5` to launch the Extension Development Host with the extension loaded.

---

## Project Structure

```
src/
  interfaces/       Abstractions — one interface per service
  core/             Domain logic — GherkinParser, SnippetGenerator, StepScanner, constants
  services/         Infrastructure — ConfigProvider, ImportResolver, FileSelector, AnimationService
  commands/         Command handlers — InsertStepCommandHandler
  providers/        VS Code providers — CodeAction, CodeLens, Completion
  extension.ts      Composition root — wires everything together
```

**Key rules:**
- Providers depend on **interfaces**, never on concrete classes
- Configuration is accessed via `IConfigProvider`, never directly from `vscode.workspace`
- New Gherkin keywords go in `src/core/constants.ts`, not hardcoded in individual files

---

## Reporting Issues

If you find a bug or have a feature request, please [open an issue](../../issues) with:
- A clear title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your VS Code version and OS

---

## Thank You

Every contribution — no matter how small — makes this extension better for the entire BDD community. Thank you for helping out!

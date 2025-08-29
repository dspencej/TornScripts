# Repository Guidelines

## Project Structure & Module Organization
- scripts/: Tampermonkey/Greasemonkey userscripts (e.g., eviveButtonEnlarger.js, hospitalFilter.js).
- pyproject.toml: Repo metadata and tooling (Poetry, Ruff).
- .venv/: Local virtual environment (ignored in VCS).

## Build, Test, and Development Commands
- Install tooling (optional): poetry install — sets up Python env with Ruff.
- Lint/format: poetry run ruff check . and poetry run ruff format . — static checks and auto-format.
- Node tooling is not required; scripts run as browser userscripts.

## Coding Style & Naming Conventions
- JavaScript: prefer concise, vanilla JS; avoid heavy dependencies.
- Naming: lowerCamelCase for variables/functions; files use lowerCamelCase.js.
- Indentation: 4 spaces; keep lines short and readable.
- Userscript headers: include @name, @namespace, @version, @description, @match, @downloadURL, @updateURL, @grant, @run-at.

## Testing Guidelines
- Manual validation in Torn: load userscripts in Tampermonkey; verify on target pages.
- Keep side effects guarded (e.g., one-time actions per load); add console logs for traceability.
- Prefer CSS-based changes where possible; mutation observers should be minimal and scoped.

## Commit & Pull Request Guidelines
- Commit messages: <area>: <change> (e.g., eviveButtonEnlarger: fix headers, double size).
- PRs: describe scope, link related issues, include before/after notes or screenshots when UI changes.
- Keep diffs focused; avoid unrelated refactors.

## Security & Configuration Tips
- Avoid auto-click loops; guard actions with flags and visibility checks.
- Use !important sparingly if adding CSS. Respect site performance and DOM stability.
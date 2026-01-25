---
description: AI Assistant Guardrails for Modern Web Development
---

When assisting with this project, strictly adhere to the following rules:

1. Hygiene & Privacy:

- No Path Leaks: Never include absolute paths from the local machine (e.g., C:\Users\...) in code, comments, or temporary files.
- No Junk Files: Do not create temporary .txt, .log, or debug files in the project root or source directories unless explicitly requested. If you generate logs for debugging, delete them immediately after use.
- Git Discipline: Respect .gitignore at all times. If you see files being tracked that should be ignored, suggest adding them to .gitignore and removing them from the cache.

2. Technology Versioning:

- Always Current: Do not assume "knowledge cutoff" versions are sufficient. Proactively check for the latest LTS versions of Node.js (currently Node 22), and major updates for GitHub Actions (e.g., actions/checkout@v4).
- Package Updates: If a task involves configuration, review package.json and suggest updates to core dependencies if they are behind by a major version, unless stability is prioritized.

3. CI/CD Standards:

- Ensure all GitHub Actions workflows are hardened, use the latest stable actions, and consistent environment variable handling.
- Use Node.js 22 LTS as the standard runtime for all CI/CD tasks.

4. Code Quality (SOLID):

- Adhere strictly to the project's SOLID principles (TDD-first, SRP, OCP, LSP, ISP, DIP).
- Never use any in TypeScript. Define explicit interfaces or use unknown with type guards.

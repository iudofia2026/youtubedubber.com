# Repository Guidelines

## Project Structure & Module Organization
This Next.js 14 workspace centers on the App Router inside `app/`. Keep route entrypoints under `app/page.tsx`, `app/new/page.tsx`, and dynamic status pages at `app/jobs/[id]/page.tsx`. Shared widgets reside in `components/` (use `components/ui/` for shadcn primitives and `components/FileUpload.tsx`, `LanguageSelect.tsx`, etc.). Place HTTP helpers and state utilities in `lib/`, and co-locate shared type definitions in `types/`. Store static assets in `public/`, configuration in the repo root, and global styles in `app/globals.css`.

## Build, Test, and Development Commands
Run `npm install` once to set up dependencies. Use `npm run dev` for the local server at `http://localhost:3000`. Before merging, execute `npm run lint` to ensure ESLint + TypeScript cleanliness and `npm run build` to verify the app compiles. When tests are available, prefer `npm run test` (or `npm run test -- --watch`) to validate units and integration flows.

## Coding Style & Naming Conventions
Follow TypeScript strict mode; never add `any` unless justified in comments. Use 2-space indentation and keep JSX props on separate lines when they exceed ~80 characters. Name React components in PascalCase, hooks in camelCase prefixed with `use`, and files in lowercase-kebab except React components (`FileUpload.tsx`). Let Tailwind utility classes drive layout; reach for SCSS only if utilities cannot express the design.

## Testing Guidelines
Adopt Testing Library with Vitest or Jest for UI interactions. Co-locate page-specific tests under `tests/` mirroring the `app/` path (e.g., `tests/app/jobs/id.test.tsx`). Name test files with `.test.tsx` and mirror the component name. Aim for smoke coverage on every route plus interaction coverage for uploads, language selection, and progress simulation. Use `npm run test -- --coverage` before release candidates.

## Commit & Pull Request Guidelines
Existing history favors short, descriptive summaries (e.g., "Add untracked files before branch creation"). Continue with sentence-case messages that state intent and scope. One logical change per commit. Pull requests should include: purpose summary, key screenshots or clips for UI updates, linked issue or ticket, test plan (`npm run lint`, `npm run test`), and any deliberate-thinking transcript relevant to complex decisions.

## MCP & Agent Workflow
Use the deliberate-thinking MCP server to break down non-trivial tasks, document reasoning, and validate architecture choices. Capture the tool's insights in PR descriptions when they influenced design or debugging.

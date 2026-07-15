# Practice Lab

Interview-prep playground for senior frontend (React) live-coding rounds. Each task is implemented as a standalone page that simulates a timed interview problem — connecting to APIs, writing tests, infinite scroll, modal forms, debouncing, virtualization, reducers, etc.

## Response style

Keep answers short and to the point to minimize token usage. Skip preamble, recaps, and trailing summaries — let the diff or output speak for itself. Only expand when explicitly asked.

## Tech stack

- React 19 + TypeScript (strict mode)
- Vite (dev server, build)
- React Router v7 (one route per task)
- Vitest + React Testing Library + jsdom (tests colocated next to source as `*.test.ts(x)`)
- ESLint (flat config, `typescript-eslint` + react-hooks)

## Commands

- `npm run dev` — Vite dev server
- `npm test` — run Vitest (watch mode by default)
- `npm run lint` — ESLint
- `npm run build` — typecheck + production build

## Layout conventions

```
src/
  App.tsx           # route table — one <Route> per task
  main.tsx          # BrowserRouter entry
  pages/            # one page per interview task (e.g. ModalForm.tsx, Users.tsx)
  components/       # shared or task-scoped components
  reducers/         # reducers extracted from pages when state gets non-trivial
```

Rules when adding a new task:

1. Create a page in `src/pages/<TaskName>.tsx`.
2. Register a route for it in [src/App.tsx](src/App.tsx) (path usually `/<kebab-case>`).
3. Colocate tests as `<TaskName>.test.tsx` next to the source. Same for extracted reducers/components.
4. Keep each task self-contained — no cross-task imports. The point is to mirror a live-coding session where the file(s) for that problem stand alone.
5. Prefer the built-in React primitives (`useState`, `useReducer`, `useEffect`, refs, `IntersectionObserver`, `fetch`) unless the task explicitly calls for a library.

## Task source

Tasks will be tracked in `tasks.md` (to be added). Treat each entry there as a single interview problem → one page + tests.

## Testing notes

- Vitest is configured with `globals: true` and `environment: 'jsdom'` ([vite.config.ts](vite.config.ts)) — no need to import `describe`/`it`/`expect`.
- Use `@testing-library/react` for rendering and `@testing-library/jest-dom` matchers.
- When a task involves network calls, mock `fetch` in the test rather than hitting real endpoints.

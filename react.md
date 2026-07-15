# React Quick Reference (for a Vue dev)

A cheat sheet for live-coding rounds. Vue parallels in *italics*.

---

## Imports you'll actually type

```ts
import { useState, useEffect, useMemo, useCallback, useRef,
         useReducer, useContext, useId, useTransition,
         useDeferredValue, useLayoutEffect, memo, forwardRef,
         createContext, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink,
         useNavigate, useParams, useSearchParams } from 'react-router-dom';
```

---

## Components

```tsx
// Function component (the only kind you should write today)
type Props = { title: string; onClose?: () => void; children?: React.ReactNode };

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="modal">
      <h2>{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

- **JSX** is JavaScript: `{expr}` interpolates, `className` not `class`, `htmlFor` not `for`, `onClick` camelCase.
- **Children** = Vue's default slot. Named slots ≈ pass props that are React nodes (`header={<X/>}`).
- **Conditional render**: `{cond && <X/>}`, `{cond ? <A/> : <B/>}`. No `v-if`. See section below.
- **Lists**: `{items.map(i => <Row key={i.id} {...i}/>)}`. See section below.
- **Fragment**: `<>...</>` to return siblings without a wrapper.

---

## Conditional & list rendering

### `v-if` — render or don't

```tsx
{open && <Panel/>}                    // omit when falsy
{open ? <Panel/> : null}              // explicit, safer
{open ? <Panel/> : <Placeholder/>}    // v-if / v-else
```

**Gotcha:** `&&` returns the *left* value when falsy, and React renders `0` / `NaN`. Strings and `null`/`undefined`/`false` render nothing.

```tsx
{count && <Badge/>}        // ❌ renders "0" when count === 0
{count > 0 && <Badge/>}    // ✅
{!!count && <Badge/>}      // ✅
```

### `v-else-if` chains — early returns scale better than nested ternaries

```tsx
if (loading) return <Spinner/>;
if (error)   return <ErrorView msg={error}/>;
if (!items.length) return <Empty/>;
return <List items={items}/>;
```

For inline (e.g. inside JSX), an IIFE keeps it readable:
```tsx
{(() => {
  if (loading) return <Spinner/>;
  if (error)   return <ErrorView msg={error}/>;
  return <List items={items}/>;
})()}
```

### `v-show` — keep it mounted, just hide it

No directive. Use CSS:
```tsx
<div style={{ display: open ? 'block' : 'none' }}>...</div>
<div hidden={!open}>...</div>           // HTML attribute, same effect
```

`v-if` (unmount) vs `v-show` (hide) matters for:
- **Form state** — unmounting wipes inputs/scroll/focus.
- **Expensive children** — hide is cheaper than re-mounting.
- **Animations** — exit animations need the element to stay mounted (or use a transition lib).

### Lists with `.map`

```tsx
{items.map((item) => (
  <Row key={item.id} item={item}/>
))}
```

- **Always pass `key`.** Stable id, not array index — index keys break when the list reorders, animates, or has stateful inputs.
- **`.forEach` does not work.** JSX renders what an expression evaluates to. `.map` returns an array of elements; `.forEach` returns `undefined`.
- **Multiple elements per item** — wrap in `<>...</>`, but a Fragment can take a key with the long form: `<Fragment key={id}>...</Fragment>`.
- **Filtering** — chain it: `items.filter(visible).map(...)`. Don't use `if` inside `.map`'s callback to skip items; return `null` (rendered as nothing) or filter first.

### Empty state

`[].map(...)` renders nothing — silently. Always check explicitly:
```tsx
{items.length === 0 ? <Empty/> : items.map(...)}
```

---

## Hooks

### `useState` — *ref/reactive*

```tsx
const [count, setCount] = useState(0);
setCount(c => c + 1);              // functional update — use when new state depends on old
const [user, setUser] = useState<User | null>(null);
```

State updates are **async and batched**. Don't read `count` right after `setCount`.

### `useEffect` — *watchEffect / mounted+unmounted*

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);  // cleanup runs before next effect + on unmount
}, [tick]);                         // deps: [] = mount only, omit = every render
```

Lifecycle mapping:

| Vue                     | React                                        |
|-------------------------|----------------------------------------------|
| `onMounted`             | `useEffect(() => {...}, [])`                 |
| `onUnmounted`           | cleanup function in `useEffect`              |
| `onUpdated`             | `useEffect(() => {...})` (no deps)           |
| `watch(x, ...)`         | `useEffect(() => {...}, [x])`                |
| `watchEffect`           | `useEffect(() => {...})`                     |
| `onBeforeMount`/sync DOM| `useLayoutEffect` (runs before paint)        |

**Strict mode** double-invokes effects in dev — your cleanup must be idempotent. Use `AbortController` for fetches.

### `useMemo` — *computed*

```tsx
const sorted = useMemo(() => items.slice().sort(cmp), [items]);
```

Cache an expensive computation. Don't wrap cheap stuff — the bookkeeping costs more than the work.

### `useCallback` — memoized function reference

```tsx
const handleSelect = useCallback((id: string) => setSelected(id), []);
```

Use when passing callbacks to memoized children, or as effect/memo deps. Otherwise skip it.

### `useRef` — *template ref / non-reactive `ref`*

```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => inputRef.current?.focus(), []);

const renderCount = useRef(0);     // mutable box that doesn't trigger re-render
renderCount.current++;
```

Two uses: DOM access, and persisting a value across renders without re-rendering.

### `useReducer` — when state transitions get knotty

```tsx
type Action = { type: 'add'; item: Item } | { type: 'remove'; id: string };
function reducer(state: Item[], a: Action): Item[] { /* ... */ }
const [items, dispatch] = useReducer(reducer, []);
dispatch({ type: 'add', item });
```

Reach for it when you have multiple `useState` calls that change together, or complex transitions.

### `useContext` — *provide/inject*

```tsx
const ThemeCtx = createContext<'light' | 'dark'>('light');

<ThemeCtx.Provider value="dark"><App/></ThemeCtx.Provider>

const theme = useContext(ThemeCtx);
```

Every consumer re-renders on context value change. Split contexts or memoize the value.

### `useTransition` / `useDeferredValue` — keep UI responsive

```tsx
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(input));   // marks update as low-priority

const deferredQuery = useDeferredValue(query);  // lags behind during heavy renders
```

Use for typeahead/filter where the input must stay snappy while the list catches up.

### `useId` — stable unique ids for a11y

```tsx
const id = useId();
return <><label htmlFor={id}>Name</label><input id={id}/></>;
```

### `useLayoutEffect` — measure DOM before paint

Same API as `useEffect` but synchronous after DOM mutations, before browser paint. Use only for measuring/positioning; otherwise prefer `useEffect`.

---

## Patterns

### Controlled input

```tsx
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)}/>
```

### Form (React 19 actions)

```tsx
<form action={async (formData) => { await save(formData); }}>
  <input name="email"/>
  <button>Save</button>
</form>
```

### Debounce (no lib)

```tsx
const [q, setQ] = useState('');
useEffect(() => {
  const t = setTimeout(() => fetchResults(q), 300);
  return () => clearTimeout(t);
}, [q]);
```

### Fetch with cleanup

```tsx
useEffect(() => {
  const ac = new AbortController();
  fetch(url, { signal: ac.signal })
    .then(r => r.json()).then(setData)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => ac.abort();
}, [url]);
```

### Memoized child

```tsx
const Row = memo(function Row({ item, onSelect }: Props) { /* ... */ });
// onSelect must be stable (useCallback) for memo to actually skip renders.
```

### `forwardRef` (still useful pre-React-19; in 19, `ref` is a regular prop)

```tsx
const Input = forwardRef<HTMLInputElement, Props>((props, ref) =>
  <input ref={ref} {...props}/>
);
```

---

## Styling

### Inline (dynamic, scoped to one element)

```tsx
<div style={{ color: 'red', paddingTop: 8 }}/>   // camelCase keys, px assumed for numbers
```

### CSS file + className

```tsx
import './Modal.css';
<div className="modal modal--open"/>
```

### CSS Modules (locally scoped — *closest to Vue's `<style scoped>`*)

```tsx
import s from './Modal.module.css';
<div className={s.modal}/>
<div className={`${s.modal} ${open ? s.open : ''}`}/>
```

### Tailwind

```tsx
<div className="flex items-center gap-2 rounded-md bg-slate-800 p-4 text-white"/>
```

### CSS-in-JS (styled-components / emotion)

```tsx
import styled from 'styled-components';
const Btn = styled.button<{ primary?: boolean }>`
  background: ${p => p.primary ? '#0070f3' : '#eee'};
`;
<Btn primary>Save</Btn>
```

### Conditional classes — pick one

```tsx
className={['btn', open && 'btn--open', size === 'lg' && 'btn--lg'].filter(Boolean).join(' ')}
// or use `clsx` / `classnames` libs
```

---

## Gotchas (the ones that bite Vue devs)

- **State is immutable**: `setItems([...items, x])`, never `items.push(x)`. Same for objects: `setUser({ ...user, name })`.
- **No two-way binding**: there is no `v-model`. It's `value` + `onChange`. (React 19 has `defaultValue` for uncontrolled, and form actions, but not `v-model`.)
- **Re-renders propagate**: a parent state change re-renders all children unless they're `memo`'d AND their props are referentially stable.
- **Effects ≠ watchers**: an effect runs *after* render commits. Don't `setState` in an effect without a guard or you'll loop.
- **Refs aren't reactive**: changing `ref.current` does not re-render. That's the point — use state if you need a render.
- **Stale closure**: `useEffect(() => { setX(x + 1) }, [])` captures `x` from mount. Use functional updates or add to deps.
- **Keys**: index keys break reordering and animations. Use a stable id.
- **`useEffect` runs twice in dev** (Strict Mode) — write idempotent setup with cleanup.

---

## Router (v7 / RR DOM)

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/users/:id" element={<User/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>
</BrowserRouter>

const { id } = useParams();
const navigate = useNavigate(); navigate('/users/42');
const [params, setParams] = useSearchParams();
<Link to="/users/42">Open</Link>
```

---

## Testing (Vitest + RTL)

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits the form', async () => {
  const user = userEvent.setup();
  render(<Form onSubmit={onSubmit}/>);
  await user.type(screen.getByLabelText(/email/i), 'a@b.c');
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.c' });
});
```

Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (last resort).

---

## React 19 highlights

- `ref` is a regular prop on function components — `forwardRef` mostly retired.
- `<form action={fn}>` server-or-client action; pairs with `useActionState`, `useFormStatus`.
- `use(promise)` / `use(context)` — read promises and context conditionally.
- Document metadata (`<title>`, `<meta>`) hoisted from any component.
- Compiler (opt-in) auto-memoizes — fewer manual `useMemo`/`useCallback`.

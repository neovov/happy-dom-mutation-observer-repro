# happy-dom MutationObserver + fake timers hang reproduction

> [!WARNING]
> This repository has been mainly created by Claude

Minimal reproduction of tests hanging when using happy-dom >= 20.3.3 with vitest fake timers and React components that use `MutationObserver`.

## The issue

happy-dom 20.3.3 ([commit 54bf6e7](https://github.com/capricorn86/happy-dom/commit/54bf6e7), PR #1881) changed `MutationObserver` callback delivery from `setTimeout` (macrotask) to `queueMicrotask` (microtask).

This causes tests to hang indefinitely when all three conditions are met:

1. **Fake timers** are active (`vi.useFakeTimers()`)
2. A React component uses **`MutationObserver`** (common for dropdown/combobox positioning)
3. **`userEvent`** is used to interact with the component (e.g., `user.type()`)

### Root cause

- `@testing-library/dom`'s `waitFor` / `findBy*` queries use `MutationObserver` to detect DOM changes
- With `queueMicrotask`, mutation callbacks fire as microtasks (immediately after current task)
- This creates a tight loop: DOM mutation → microtask fires → React processes updates → more DOM mutations → more microtasks → never yields to the event loop
- With the old `setTimeout` behavior, mutation callbacks were macrotasks that fake timers could control, allowing `act()` to properly schedule and flush work

### Affected versions

- **Works:** happy-dom <= 20.3.2
- **Hangs:** happy-dom >= 20.3.3

## Reproduce

```bash
npm install
npm run test  # First test hangs, second test passes
```

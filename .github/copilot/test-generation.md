---
applyTo: "projects/ngx-signal-forms/src/**/*.spec.ts"
---

# Test Generation Instructions — ngx-signal-forms

## Test Framework
- Use **Jest** with `@angular/core/testing` (`TestBed`).
- Use `@testing-library/angular` for component tests.
- No `Jasmine` / `Karma` patterns.

## Naming
- Test file: `<name>.spec.ts` co-located with the source file.
- Describe block: full class/function name, e.g. `describe('SignalFormAdapter', ...)`.
- It block: starts with a verb, e.g. `it('returns null for unknown field name', ...)`.

## Testing Signals
```ts
// Always read signals inside TestBed.flushEffects() or within a reactive context
import { TestBed } from '@angular/core/testing';

it('computes isInvalid correctly', () => {
  TestBed.runInInjectionContext(() => {
    const touched = signal(true);
    const valid = signal(false);
    const isInvalid = computed(() => touched() && !valid());
    expect(isInvalid()).toBe(true);
  });
});
```

## Component Tests
- Always use `standalone: true` components.
- Provide DI tokens via `TestBed.configureTestingModule({ providers: [...] })`.
- Test signal inputs using `fixture.componentRef.setInput('name', value)`.
- Test outputs by subscribing to `outputRef.subscribe(spy)`.

## Coverage Requirements
- Every exported function/method in `core/` and `adapter/` must have at least one test.
- Every renderer directive must have an accessibility test (ARIA attributes present).
- Every error path in `submit()` must be tested (success, validation error, thrown exception).

## What NOT to do in tests
- Do not use `any` in test code.
- Do not use `fixture.debugElement.nativeElement` directly — use `screen.getByRole()` from Testing Library.
- Do not test implementation details — test observable behavior (signal values, DOM state, emitted outputs).
- Do not import from `@angular/forms/signals` in spec files — use the library's public API.

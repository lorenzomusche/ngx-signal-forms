# GitHub Copilot Instructions — ngx-signal-forms

## Project Overview

This is an **Angular library** (`ngx-signal-forms`) that provides a declarative, type-safe, reactive form system built on top of `@angular/forms/signals` (Angular 21+).
The library exposes a DI-token-driven architecture with polymorphic renderers.

## Technology Stack

- **Angular 21** (standalone components, signals, `@angular/forms/signals`)
- **TypeScript 5.5+** in strict mode
- **RxJS** only where signals are insufficient (interop only)
- Angular library build via `ng-packagr`

---

## TypeScript Rules

### Strict Mode — Always Enforced
- All code must compile with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUncheckedIndexedAccess: true`.
- Never use `any`. Prefer `unknown` when the type is truly dynamic, then narrow with type guards.
- Never use non-null assertion `!` unless you can prove non-nullability with a preceding guard.
- Avoid `as` type casts; prefer type narrowing or explicit generics.

### Immutability
- All public interface/type properties must be `readonly`.
- Use `ReadonlyArray<T>` instead of `T[]` for public API collections.
- Never mutate objects passed in from outside; create new instances instead.

### Generics & Type Safety
- Constrain generics: use `T extends object` for form model types.
- Use mapped types (`{ readonly [K in keyof T]: ... }`) rather than index signatures where possible.
- Prefer explicit return types on all exported functions and class methods.

### Naming Conventions
- Interfaces and types exported from this library are prefixed with `Ngx` (e.g., `NgxFieldState`, `NgxFormAdapter`).
- DI tokens: `SCREAMING_SNAKE_CASE` prefixed with `NGX_` (e.g., `NGX_FORM_ADAPTER`).
- Internal helpers: no prefix, camelCase.

---

## Angular 21 Rules

### Signals — Primary Reactive Primitive
- Use `signal()`, `computed()`, `effect()` from `@angular/core` as the default reactive mechanism.
- Never introduce `BehaviorSubject` or `Subject` for state that can be expressed with a signal.
- Signals exposed on public interfaces must be typed as `Signal<T>` (read-only) unless they need to be writable, in which case `WritableSignal<T>`.
- Avoid `toSignal()` / `toObservable()` conversions except in adapter boundaries.

### Standalone Components & Directives
- Every component and directive must be `standalone: true`.
- Do not create or use `NgModule`; the library is fully standalone.
- Import only what is used in the `imports` array of each component.

### Component Design
- Use `ChangeDetectionStrategy.OnPush` on every component — no exceptions.
- Prefer signal-based inputs (`input()`, `input.required()`) over `@Input()` decorator.
- Prefer signal-based outputs (`output()`) over `@Output()` + `EventEmitter`.
- Use `inject()` for dependency injection inside classes; avoid constructor parameter injection.

### DI Tokens (Core Pattern of This Library)
- Control renderers are provided/swapped via `InjectionToken`. Copilot must respect this pattern.
- When generating a new renderer directive, it must provide itself via `NGX_CONTROL_RENDERER` token using `providers: [{ provide: NGX_CONTROL_RENDERER, useExisting: ... }]`.
- When generating a new form adapter, it must implement `NgxFormAdapter<T>` and be provided via `NGX_FORM_ADAPTER`.

### Template Syntax (Angular 21)
- Use `@if`, `@for`, `@switch` block syntax — never `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use `@let` for local template variable bindings where appropriate.
- Signal reads in templates are done by calling the signal as a function: `{{ field().value() }}`.

---

## Architecture Rules

### Layer Isolation
- `core/types.ts` and `core/tokens.ts` are the **only files** allowed to import from `@angular/forms/signals`.
- All other files in the library must import types from `core/types.ts`, never directly from `@angular/forms/signals`.
- This isolates upstream API changes to a single boundary.

### Adapter Pattern
- `SignalFormAdapter` (in `adapter/`) is the sole consumer of `@angular/forms/signals` at runtime.
- New adapters must implement `NgxFormAdapter<T>` fully.
- `getField()` must return `null` (not throw) when a field name is not found.

### Renderer Pattern
- Renderers live in `renderers/` and are directives (not components) that attach to a host element.
- Each renderer must implement `NgxControlRendererConfig` via a `config` input.
- Renderers must not contain business logic — only presentation.

### File Structure Convention
```
projects/ngx-signal-forms/src/lib/
  adapter/      # SignalFormAdapter — sole @angular/forms/signals consumer
  control/      # ControlComponent — polymorphic host for renderers
  core/         # types.ts, tokens.ts — shared contracts
  form/         # NgxFormComponent — form host
  renderers/    # InputRenderer, CheckboxRenderer, SelectRenderer, etc.
```

---

## Production-Readiness Checklist

Copilot must flag or fix the following issues in every review:

### Code Quality
- [ ] No `console.log`, `console.warn`, `debugger` statements in library code.
- [ ] No `TODO` or `FIXME` comments in production paths without a linked issue.
- [ ] All exported symbols have JSDoc comments.
- [ ] No unused imports or variables (`noUnusedLocals: true`, `noUnusedParameters: true`).

### Performance
- [ ] No signal reads inside loops without memoisation — use `computed()` to cache derived values.
- [ ] No `effect()` calls that write to signals (causes circular updates) — use `computed()` instead.
- [ ] Renderer directives must be pure: no side-effects outside of Angular lifecycle hooks.

### Accessibility
- [ ] Every form control renderer must forward `aria-label`, `aria-describedby`, `aria-invalid`, and `aria-required` to the underlying native element.
- [ ] Interactive elements must be reachable via keyboard navigation.

### Security
- [ ] No direct DOM manipulation via `ElementRef.nativeElement` unless wrapped in a platform check (`isPlatformBrowser`).
- [ ] No `innerHTML` assignments — use Angular template bindings only.
- [ ] Validate all `unknown` payloads before use (type guards or Zod-like validators).

### API Surface
- [ ] All public API exports must go through `projects/ngx-signal-forms/src/public-api.ts`.
- [ ] Never export internal helpers or implementation details.
- [ ] Breaking changes to `NgxFormAdapter`, `NgxFieldState`, or DI tokens require a major semver bump.

---

## What Copilot Should NOT Do

- Do **not** suggest `NgModule`-based patterns.
- Do **not** use `@Input()` / `@Output()` decorators for new code — use signal-based equivalents.
- Do **not** import from `@angular/forms/signals` outside `adapter/` and `core/`.
- Do **not** use `any`, `object` (untyped), or `Function` types.
- Do **not** bypass `ChangeDetectionStrategy.OnPush` by calling `markForCheck()` unless in a clearly documented interop scenario.
- Do **not** add RxJS operators for logic that can be expressed purely with signals.

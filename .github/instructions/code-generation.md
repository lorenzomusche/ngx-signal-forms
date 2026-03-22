---
applyTo: "projects/ngx-signal-forms/src/**/*.ts,projects/ngx-signal-forms/src/**/*.html"
---

# Code Generation Instructions — ngx-signal-forms

See `.github/copilot-instructions.md` for the full project context, architecture rules, and production checklist.

When generating code for this repository, apply these rules without exception:

## TypeScript
- `strict: true` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` always in effect.
- No `any`. No untyped `object`. No `Function` type. No `{}` as a catch-all type.
- All public interface properties must be `readonly`. Collections must be `ReadonlyArray<T>`.
- Explicit return types on all exported functions and class methods.
- Use discriminated unions instead of multiple boolean flags.
- Use `infer` in conditional types instead of `as` casts.
- Use branded types (`Brand<T, B>`) for domain primitives exposed in public APIs.
- Always add `assertNever(x: never)` exhaustiveness check to switch chains over union types.

## Angular 21
- `standalone: true` on every component and directive. Zero `NgModule`.
- `ChangeDetectionStrategy.OnPush` on every component, no exceptions.
- Use `input()` / `input.required()` — never `@Input()`.
- Use `output()` — never `@Output()` + `EventEmitter`.
- Use `model()` for two-way bindings.
- Use `viewChild()` / `viewChildren()` / `contentChild()` — never `@ViewChild` / `@ContentChild`.
- Use `inject()` in field initializers — never constructor parameter injection.
- Use `signal()`, `computed()`, `linkedSignal()` for all state. Never `BehaviorSubject` for state.
- Never write `effect(() => { someSignal.set(...) })` — use `computed()` or `linkedSignal()` instead.
- Use `resource()` / `rxResource()` for async data, not manual signal + effect combos.
- Use `afterNextRender()` for DOM initialization — never `ngAfterViewInit`.
- Template: `@if`, `@for (x of y; track x.id)`, `@switch`, `@defer`, `@let` only.
- Never use `*ngIf`, `*ngFor`, `*ngSwitch`.

## Architecture
- Only `adapter/` and `core/` may import from `@angular/forms/signals`.
- All other files import types from `core/types.ts`.
- New renderers: directives in `renderers/`, provide via `NGX_CONTROL_RENDERER` token.
- New adapters: implement `NgxFormAdapter<T>` fully, provide via `NGX_FORM_ADAPTER` token.
- All public exports go through `public-api.ts` only.

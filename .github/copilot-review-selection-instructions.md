---
applyTo: "projects/ngx-signal-forms/src/**/*.ts,projects/ngx-signal-forms/src/**/*.html"
---

# Code Review Instructions — ngx-signal-forms

## Mandatory Fixes (must block merge)

- `any` type anywhere → replace with `unknown` + type guard.
- Missing `readonly` on public interface/type property → add it.
- Direct import from `@angular/forms/signals` outside `adapter/` or `core/` → redirect to `core/types.ts`.
- `*ngIf`, `*ngFor`, `*ngSwitch` in templates → replace with `@if`, `@for`, `@switch`.
- `@Input()` / `@Output()` decorators in new code → replace with `input()` / `output()`.
- `@ViewChild` / `@ContentChild` decorators → replace with `viewChild()` / `contentChild()`.
- `effect()` writing to a signal → refactor to `computed()` or `linkedSignal()`.
- `@for` block without `track` expression → add `track item.id` or appropriate unique key.
- Exported symbol without JSDoc → add minimal doc comment.
- `console.log` / `console.warn` / `debugger` in library source → remove.
- `NgModule` / `forRoot()` / `forChild()` → remove, use standalone + `provideX()`.
- Missing `standalone: true` on component or directive → add.
- Missing `ChangeDetectionStrategy.OnPush` on component → add.
- Non-null assertion `!` without preceding null-check → add guard or restructure.
- `as` type cast without preceding type predicate → add type guard.

## Warnings (should fix before merge)

- `TODO` / `FIXME` comment without a linked issue number.
- `toSignal()` without `{ requireSync: true }` when the stream is synchronous.
- `markForCheck()` without an explanatory inline comment.
- `ngAfterViewInit` for DOM initialization → suggest `afterNextRender()`.
- `BehaviorSubject` / `Subject` used for component state → suggest `signal()`.
- Signal read inside `@for` body that could be memoized with `computed()` outside.
- `Object.keys()` / `Object.entries()` in template expression → move to `computed()` in class.
- Renderer directive missing ARIA attribute forwarding (`aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-disabled`).
- Export not listed in `public-api.ts` → add or remove export.
- Missing `exactOptionalPropertyTypes` compliance (`prop?: T` treated as `T | undefined`).

## What Must Never Appear

- `any`, untyped `object`, `Function`, `{}` as types.
- `NgModule`, `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()`.
- `*ngIf`, `*ngFor`, `*ngSwitch`.
- `effect()` with signal writes inside.
- `@for` without `track`.
- Import from `@angular/forms/signals` outside `adapter/` + `core/`.
- `innerHTML` assignments.
- `detectChanges()` in production code.

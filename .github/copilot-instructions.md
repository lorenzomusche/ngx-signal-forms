# GitHub Copilot Instructions — ngx-signal-forms

## Project Overview

This is an **Angular 21 library** (`ngx-signal-forms`) — a declarative, type-safe, reactive form system built on `@angular/forms/signals`.
Architecture: DI-token-driven, polymorphic renderers, full signal reactivity, zero NgModule.

## Technology Stack

- **Angular 21** — standalone, signals, `@angular/forms/signals`, `@angular/core/rxjs-interop`
- **TypeScript 5.5+** strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **RxJS 7+** only at adapter boundary for interop
- Build: `ng-packagr`, partial Ivy compilation

---

## TYPESCRIPT — God-Level Rules

### Strict Baseline
- Compile flags required: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- Zero `any`. Use `unknown` + type guard narrowing. Never `as` cast without a preceding type predicate.
- Zero non-null assertion `!` without a proven preceding null-check in the same scope.
- Explicit return types on every exported function, method, and arrow function stored in a variable.

### Discriminated Unions over boolean flags
```ts
// BAD
interface State { loading: boolean; error: boolean; data?: string }
// GOOD
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: NgxFormError }
  | { status: 'success'; data: string };
```
Always prefer discriminated unions for multi-state types.

### Template Literal Types for field paths
```ts
// Use template literals to type form paths
type FieldPath<T, K extends keyof T = keyof T> = K extends string ? K : never;
```

### Branded / Opaque Types for domain values
```ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };
type FieldName = Brand<string, 'FieldName'>;
```
Use branded types to prevent misuse of raw primitives in public APIs.

### Immutability — Always
- All public interface/type properties: `readonly`.
- Collections: `ReadonlyArray<T>`, `ReadonlyMap<K,V>`, `ReadonlySet<T>`.
- Prefer `as const` assertions for static lookup tables.
- Never mutate input arguments; return new values.

### Generics
- Form model generics: `T extends Record<string, unknown>` (more precise than `T extends object`).
- Constrain renderer generics: `TValue = unknown` with explicit narrowing in implementation.
- Use `infer` in conditional types to extract nested types rather than manual casting.

### Exhaustiveness
```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}
// Always add to switch/if-else chains over union types
```

---

## ANGULAR 21 — God-Level Rules

### Signals — The Only State Primitive
- `signal()`, `computed()`, `linkedSignal()` for all mutable/derived state.
- `effect()` ONLY for side-effects that cannot be expressed declaratively (e.g., focus management, logging). Never use `effect()` to synchronize signals — use `computed()` or `linkedSignal()`.
- `toSignal()` allowed only in adapter layer with `{ requireSync: true }` where possible to avoid nullable initial values.
- `input()` / `input.required()` for all component/directive inputs — zero `@Input()`.
- `output()` for all outputs — zero `@Output()` + `EventEmitter`.
- `model()` for two-way bindings when needed.
- `viewChild()` / `viewChildren()` / `contentChild()` signal-based queries — zero `@ViewChild`.

### Computed Signal Patterns (preferred)
```ts
// Chain computed() instead of nested effects
const isFormReady = computed(() =>
  adapter.state.valid() && !adapter.state.pending() && !adapter.state.submitting()
);
```

### Resource API (Angular 21)
- Use `resource()` / `rxResource()` for async data loading instead of manual signal + effect combos.
- Always specify `defaultValue` to avoid `undefined` in templates.

### Standalone Architecture
- `standalone: true` everywhere. Zero `NgModule`.
- `imports` array: import only what is used. No wildcard modules.
- `providers` array: use `provideX()` functions, not object literals where available.

### Change Detection
- `ChangeDetectionStrategy.OnPush` on every component — mandatory.
- Never call `markForCheck()` unless in a documented RxJS interop scenario with a comment explaining why.
- Never call `detectChanges()` manually in production code.
- Use `afterNextRender()` / `afterRender()` for DOM-dependent initialization, not `ngAfterViewInit`.

### inject() Pattern
```ts
// ALWAYS use inject() — never constructor injection
class MyService {
  private readonly adapter = inject<NgxFormAdapter<unknown>>(NGX_FORM_ADAPTER);
}
```
- `inject()` in field initializers, not in constructor body.
- For optional deps: `inject(TOKEN, { optional: true })`.
- For host context: `inject(TOKEN, { host: true })`.

### DI Tokens — Core Library Pattern
- All renderer swapping happens through `InjectionToken`.
- New renderer directive must provide via: `providers: [{ provide: NGX_CONTROL_RENDERER, useExisting: forwardRef(() => MyRendererDirective) }]`.
- New adapter must implement `NgxFormAdapter<T>` fully and be provided via `NGX_FORM_ADAPTER`.
- `forwardRef()` required when token and class are in the same file to avoid circular refs at init.

### Template Syntax (Angular 21 only)
- `@if` / `@else` — never `*ngIf`
- `@for (item of items; track item.id)` — never `*ngFor`. Always specify `track`.
- `@switch` / `@case` / `@default` — never `*ngSwitch`
- `@defer` blocks for lazy-loaded renderer sections
- `@let` for complex signal-expression aliases in templates
- Signal reads: `{{ field().value() }}` — always invoke as function

### Performance Patterns
```ts
// Memoize expensive derived values with computed() outside loops
const fieldNames = computed(() => Object.keys(this.adapter.fields()));

// Use @defer for non-critical renderers
@defer (on viewport) {
  <ngx-control [field]="field" />
}
```

### Zoneless (future-proof)
- Write all components as if `zone.js` is absent: rely exclusively on signals and `AsyncPipe` / `push` pipe for reactivity.
- Do not rely on `setTimeout` or `Promise.resolve()` to trigger CD.

---

## ARCHITECTURE — Invariants

### Dependency Flow (strict)
```
renderers/ → core/types.ts
control/   → core/types.ts + core/tokens.ts
form/      → core/types.ts + core/tokens.ts
adapter/   → core/types.ts + @angular/forms/signals  (← ONLY file allowed)
core/      → @angular/core only
```
Violating this layering is a hard error. Copilot must not suggest imports that cross these boundaries.

### Adapter Contract
- `getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null` — returns `null` on missing field, never throws.
- `submit()` handles its own error catching; never let unhandled rejections escape.
- `markAllTouched()` must be synchronous.

### Renderer Contract
- Directives only, never components, for leaf renderers.
- Inputs: `config = input<NgxControlRendererConfig>({})`
- Must forward all ARIA attributes: `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-disabled`.
- Must support `disabled` state via the `NgxFieldState.disabled` signal.
- Must not emit events outside of the `output()` defined in `NgxControlRendererConfig`.

### Public API Surface
- All exports: `projects/ngx-signal-forms/src/public-api.ts` only.
- Never export implementation details, internal helpers, or adapter-internal types.
- Semver: any change to `NgxFormAdapter`, `NgxFieldState`, `NgxFieldTree`, or DI token shapes = MAJOR bump.

---

## CODE QUALITY — Production Checklist

Copilot flags/fixes ALL of the following on every review:

### Mandatory Fixes (block merge)
- `console.log` / `console.warn` / `debugger` in library source → remove.
- `any` type → replace with `unknown` + type guard.
- Missing `readonly` on public interface property → add.
- Direct import from `@angular/forms/signals` outside `adapter/` or `core/` → redirect to `core/types.ts`.
- `*ngIf` / `*ngFor` / `*ngSwitch` → replace with block syntax.
- `@Input()` / `@Output()` decorators in new code → replace with `input()` / `output()`.
- `@ViewChild` / `@ContentChild` decorators → replace with signal queries.
- `effect()` writing to a signal → refactor to `computed()` or `linkedSignal()`.
- Missing `track` in `@for` → add `track item.id` or appropriate key.
- Exported symbol without JSDoc → add minimal doc.

### Warnings (should fix)
- `TODO` / `FIXME` without linked issue number.
- `as` cast without preceding type guard.
- `markForCheck()` without explanatory comment.
- `toSignal()` without `{ requireSync: true }` when stream is sync-capable.
- Missing `exactOptionalPropertyTypes` violation (`prop?: T` used as `prop: T | undefined`).
- Renderer missing ARIA attribute forwarding.
- `ngAfterViewInit` used instead of `afterNextRender()`.

### Performance Flags
- Signal read inside `@for` loop body that could be `computed()` outside.
- `Object.keys()` / `Object.entries()` called directly in template expression — move to `computed()`.
- Multiple `effect()` registrations that could be one `computed()`.

---

## CODE GENERATION PATTERNS

When Copilot generates new code for this repo, always use these exact patterns:

### New Renderer Directive
```ts
import { Directive, inject, input } from '@angular/core';
import { NGX_CONTROL_RENDERER } from '../core/tokens';
import { NgxControlRendererConfig, NgxFieldRef } from '../core/types';

@Directive({
  selector: '[ngxMyRenderer]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_RENDERER, useExisting: NgxMyRendererDirective }],
})
export class NgxMyRendererDirective {
  readonly field = input.required<NgxFieldRef<unknown>>();
  readonly config = input<NgxControlRendererConfig>({});
}
```

### New Computed Derived State
```ts
// Always outside the template, in the component class
protected readonly isInvalid = computed(
  () => this.field()().touched() && !this.field()().valid()
);
```

### New Form Adapter
```ts
// Must implement NgxFormAdapter<T> fully
// Provide via: { provide: NGX_FORM_ADAPTER, useFactory: () => createSignalFormAdapter(options) }
```

### Error Handling in submit()
```ts
// Always catch and return NgxFormError[], never throw
async submit(action: SubmitAction<T>): Promise<void> {
  try {
    const errors = await action(this.getValue());
    if (errors?.length) this._lastErrors.set(errors);
  } catch (e) {
    this._lastErrors.set([{ path: null, kind: 'unknown', message: String(e) }]);
  }
}
```

---

## WHAT COPILOT MUST NEVER DO

- Suggest `NgModule`, `forRoot()`, `forChild()`.
- Use `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()` decorators.
- Import from `@angular/forms/signals` outside `adapter/` + `core/`.
- Use `any`, untyped `object`, `Function`, `{}` as types.
- Write `effect(() => { mySignal.set(...) })` — signal-write inside effect.
- Use `markForCheck()` or `detectChanges()` without a block comment.
- Use `*ngIf`, `*ngFor`, `*ngSwitch` template directives.
- Add RxJS pipelines for logic expressible with `computed()` / `linkedSignal()`.
- Export symbols not listed in `public-api.ts`.
- Skip `track` on `@for` loops.
- Use `ngAfterViewInit` for DOM initialization — use `afterNextRender()`.

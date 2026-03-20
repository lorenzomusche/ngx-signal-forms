# ngx-signal-forms

> Angular declarative form library built on the **Signal Forms API** — type-safe, reactive, renderer-pluggable via DI tokens.

[![Angular](https://img.shields.io/badge/Angular-21%2B-red)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Features

- **Declarative syntax** — `<ngx-control-text name="firstName" label="First Name" />`
- **Signal-first** — all state exposed as `Signal<T>`, no `Observable` boilerplate
- **8 built-in renderers** — text, number, date, select, multiselect, checkbox, toggle, textarea
- **Custom renderers** — extend `NgxBaseControl<T>` and register in your module
- **Schema validators** — `schemaRequired`, `schemaEmail`, `schemaMin`, `schemaMax`, `schemaMinLength`, `schemaMaxLength`, `schemaPattern`
- **Pure validators** — `required`, `minLength`, `email`, `pattern`, `min`, `max`, `compose`, `composeFirst`
- **Rich submit event** — `{ value, valid, errors, [RAW_FIELD_TREE_SYMBOL] }`
- **Adapter encapsulation** — `@angular/forms/signals` API never leaks to consumers
- **Inline errors** — `ngxInlineErrors` directive displays errors next to labels
- **Searchable select & multiselect** — built-in search with dropdown positioning (below → above → overlay)
- **Theming** — CSS custom properties with base and Material Design 3 themes
- **Full strict TypeScript** — no `any`, immutable arrays, functional composition

---

## Quick Start

### 1. Install

```bash
npm install ngx-signal-forms
```

### 2. Import theme

```scss
@import 'ngx-signal-forms/styles/ngx-signal-forms.css';
// Optional: Material Design 3 theme
@import 'ngx-signal-forms/styles/ngx-signal-forms-material.css';
```

### 3. Import components

```ts
import {
  NgxFormComponent,
  NgxTextComponent,
  NgxNumberComponent,
  NgxSelectComponent,
  NgxMultiselectComponent,
  NgxCheckboxComponent,
  NgxToggleComponent,
  NgxDateComponent,
  NgxTextareaComponent,
  NgxInlineErrorsDirective,
  NgxOptionDirective,
  createSignalFormAdapter,
  schemaRequired,
  schemaEmail,
  schemaMinLength,
} from 'ngx-signal-forms';

@Component({
  standalone: true,
  imports: [
    NgxFormComponent,
    NgxTextComponent,
    NgxNumberComponent,
    NgxSelectComponent,
    NgxMultiselectComponent,
    NgxCheckboxComponent,
    NgxToggleComponent,
    NgxDateComponent,
    NgxTextareaComponent,
    NgxInlineErrorsDirective,
    NgxOptionDirective,
  ],
})
```

### 4. Create adapter

```ts
interface MyForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
}

export class MyComponent {
  private readonly model = signal<MyForm>({
    firstName: '',
    lastName: '',
    email: '',
    country: null,
  });

  readonly adapter = createSignalFormAdapter({
    model: this.model,
    submitMode: 'valid-only',
    schema: (path) => {
      schemaRequired(path.firstName);
      schemaMinLength(path.firstName, 2);
      schemaRequired(path.lastName);
      schemaRequired(path.email);
      schemaEmail(path.email);
    },
  });
}
```

### 5. Template

```html
<ngx-form [adapter]="adapter" [action]="submitAction" (submitted)="onSubmitted($event)">

  <ngx-control-text name="firstName" label="First Name" ngxInlineErrors />
  <ngx-control-text name="lastName" label="Last Name" ngxInlineErrors />
  <ngx-control-text name="email" label="Email" ngxInlineErrors />

  <ngx-control-select
    name="country"
    label="Country"
    placeholder="Select a country…"
    [options]="countries"
    [searchable]="true"
  >
    <ng-template ngxOption let-opt>
      <strong>{{ opt.label }}</strong>
    </ng-template>
  </ngx-control-select>

  <button type="submit" [disabled]="!adapter.state.canSubmit()">Submit</button>

</ngx-form>
```

---

## Built-in Renderers

| Selector | Component | Value type |
|---|---|---|
| `ngx-control-text` | `NgxTextComponent` | `string` |
| `ngx-control-number` | `NgxNumberComponent` | `number \| null` |
| `ngx-control-date` | `NgxDateComponent` | `string \| null` |
| `ngx-control-select` | `NgxSelectComponent` | `TValue \| null` |
| `ngx-control-multiselect` | `NgxMultiselectComponent` | `ReadonlyArray<TValue>` |
| `ngx-control-checkbox` | `NgxCheckboxComponent` | `boolean` |
| `ngx-control-toggle` | `NgxToggleComponent` | `boolean` |
| `ngx-control-textarea` | `NgxTextareaComponent` | `string` |

---

## Submit Event

```ts
interface NgxFormSubmitEvent<T extends object> {
  readonly value: T;
  readonly valid: boolean;
  readonly errors: ReadonlyArray<NgxFormError>;
}
```

---

## Validators

### Schema-level (applied in adapter, powered by `@angular/forms/signals`)

```ts
import { schemaRequired, schemaEmail, schemaMin, schemaMax, schemaMinLength, schemaMaxLength } from 'ngx-signal-forms';

const adapter = createSignalFormAdapter({
  model: this.model,
  submitMode: 'valid-only',
  schema: (path) => {
    schemaRequired(path.name);
    schemaEmail(path.email);
    schemaMin(path.age, 0);
    schemaMax(path.age, 120);
  },
});
```

### Pure validators (standalone functions)

```ts
import { required, minLength, maxLength, email, pattern, min, max, compose, composeFirst } from 'ngx-signal-forms';

const nameValidators = compose(
  required('Name is required'),
  minLength(2),
  maxLength(50),
);
```

---

## Custom Renderer

Extend `NgxBaseControl<TValue>` to create a custom renderer:

```ts
@Component({
  selector: 'my-phone-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngx-renderer' },
  template: `
    <label [for]="fieldId">{{ label() }}</label>
    <input [id]="fieldId" type="tel" [value]="value()" (input)="onInput($event)" (blur)="markAsTouched()" />
  `,
})
export class PhoneComponent extends NgxBaseControl<string> {
  readonly label = input<string>('');
  protected readonly fieldId = `phone-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
    this.markAsDirty();
  }
}
```

---

## Architecture

```
NgxFormComponent                           (host, provides NGX_FORM_ADAPTER via DI)
  └─ createSignalFormAdapter()             (sole consumer of @angular/forms/signals)
      ├─ form(model, schema)               (Angular Signal Forms API)
      └─ wrapFieldRef() → NgxFieldRef<T>   (stable public contract)

ngx-control-text / select / multiselect / …   (standalone components)
  └─ NgxBaseControl<TValue>                    (abstract base, injects NGX_FORM_ADAPTER)
      ├─ fieldState → NgxFieldState<TValue>    (value, valid, touched, dirty, errors)
      └─ setValue() / markAsTouched() / markAsDirty()
```

### Dependency flow

```
renderers/  → control/ + core/types.ts
control/    → core/types.ts + core/tokens.ts
form/       → core/types.ts + core/tokens.ts
adapter/    → core/types.ts + @angular/forms/signals  (← ONLY file allowed)
core/       → @angular/core only
```

---

## Theming

Override CSS custom properties to create a custom theme:

```css
:root {
  --ngx-input-focus-color: #4361ee;
  --ngx-chip-selected-bg: #18181b;
  --ngx-select-dropdown-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  /* … see ngx-signal-forms.css for all properties */
}
```

A Material Design 3 theme is included: `ngx-signal-forms-material.css`.

---

## Build

```bash
ng build ngx-signal-forms
```

Requires Angular 21+ with `@angular/forms/signals` (experimental).

---

## License

MIT

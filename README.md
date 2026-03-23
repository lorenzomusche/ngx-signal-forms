# @ngx-signals/forms

> Angular declarative form library built on the **Signal Forms API** — type-safe, reactive, renderer-pluggable via DI tokens.

[![Angular](https://img.shields.io/badge/Angular-21%2B-red)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=flat&logo=github-sponsors)](https://github.com/sponsors/lorenzomusche)

---

## Table of Contents
- [Features](#features)
- [Why @ngx-signals/forms?](#why-ngx-signalsforms)
- [Quick Start](#quick-start)
- [Live Demo](#live-demo)
- [Built-in Renderers](#built-in-renderers)
- [Components & Features](#components--features)
  - [Text & Textarea](#text--textarea)
  - [Number & Slider](#number--slider)
  - [Date Picker](#date-picker)
  - [Date Range Picker](#date-range-picker)
  - [Time Picker](#time-picker)
  - [Multiselect Modes](#multiselect-modes)
  - [Checkbox & Toggle](#checkbox--toggle)
  - [Segmented Button](#segmented-button)
  - [File Upload](#file-upload)
  - [Radio Group](#radio-group)
  - [Chips & Custom Templates](#chips--custom-templates)
  - [Conditional Options](#conditional-options)
- [Validation](#validation)
  - [Schema-level](#schema-level)
  - [Pure Validators](#pure-validators)
- [Advanced](#advanced)
  - [Custom Renderer](#custom-renderer)
  - [Architecture](#architecture)
  - [Theming](#theming)
  - [Utilities](#utilities)
- [Build](#build)

---

## Features

- **Declarative syntax** — `<ngx-control-text name="firstName" label="First Name" />`
- **Signal-first** — all state exposed as `Signal<T>`, no `Observable` boilerplate
- **14 built-in renderers** — text, number, datepicker (M3), daterange, timepicker, select, multiselect, checkbox, toggle, textarea, radio, slider, file, segmented
- **Custom renderers** — extend `NgxBaseControl<T>` and register in your module
- **Schema validators** — `schemaRequired`, `schemaEmail`, `schemaMin`, `schemaMax`, `schemaMinLength`, `schemaMaxLength`, `schemaPattern`
- **Pure validators** — `required`, `minLength`, `email`, `pattern`, `min`, `max`, `compose`, `composeFirst`
- **Rich submit event** — `{ value, valid, errors, [RAW_FIELD_TREE_SYMBOL] }`
- **Adapter encapsulation** — `@angular/forms/signals` API never leaks to consumers
- **Inline errors** — `ngxInlineErrors` directive displays errors next to labels
- **Searchable select & multiselect** — built-in search with dropdown positioning
- **Chips & Custom Templates** — use `ngxOption` for custom items and `ngxChips` for visual selection
- **Date picker** — M3 calendar popup, ISO 8601 (`YYYY-MM-DD`) only, full keyboard nav
- **Date locale (i18n)** — `NGX_DATE_LOCALE` DI token with auto-detected browser locale and `buildDateLocale()` factory
- **Overlay positioning** — shared `computeOverlayPosition()` utility used by select, multiselect, and datepicker
- **Theming** — CSS custom properties with base and Material Design 3 themes
- **Full strict TypeScript** — no `any`, immutable arrays, functional composition

---

## Why @ngx-signals/forms?

Standard Angular Reactive Forms are powerful but can feel verbose and boilerplate-heavy, especially with the introduction of Signals.

| Feature                | @ngx-signals/forms                 | Reactive Forms (Standard)      |
| ---------------------- | ---------------------------------- | ------------------------------ |
| **Paradigm**           | Declarative Templates              | Imperative Code-first          |
| **Data Engine**        | Native Angular Signals             | RxJS Observables (or raw values)|
| **Renderer Pattern**   | Pluggable Components               | Generic `ControlValueAccessor` |
| **Validation**         | Unified Schema & Pure Functions    | Class-based / Async Validators |
| **Type-Safety**        | Strict End-to-End                  | Difficult manual typing        |
| **Boilerplate**        | Minimal (just use components)      | High (FormGroup/FormControl)   |

---

## Quick Start

### 1. Install

```bash
npm install @ngx-signals/forms
```

### 2. Import theme

```scss
@import "@ngx-signals/forms/styles/ngx-signal-forms.css";
// Optional: Material Design 3 theme
@import "@ngx-signals/forms/styles/ngx-signal-forms-material.css";
// Optional: iOS theme
@import "@ngx-signals/forms/styles/ngx-signal-forms-ios.css";
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
  NgxDatePickerComponent,
  NgxDateRangePickerComponent,
  NgxTimepickerComponent,
  NgxTextareaComponent,
  NgxRadioGroupComponent,
  NgxSliderComponent,
  NgxFileComponent,
  NgxSegmentedComponent,
  NgxInlineErrorsDirective,
  NgxOptionDirective,
  NgxChipsDirective,
  createSignalFormAdapter,
  ngxSchemaRequired,
  ngxSchemaEmail,
  ngxSchemaMinLength,
} from '@ngx-signals/forms';

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
    NgxDatePickerComponent,
    NgxDateRangePickerComponent,
    NgxTimepickerComponent,
    NgxTextareaComponent,
    NgxRadioGroupComponent,
    NgxSliderComponent,
    NgxFileComponent,
    NgxSegmentedComponent,
    NgxInlineErrorsDirective,
    NgxOptionDirective,
    NgxChipsDirective,
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
    firstName: "",
    lastName: "",
    email: "",
    country: null,
  });

  readonly adapter = createSignalFormAdapter({
    model: this.model,
    submitMode: "valid-only",
    schema: (path) => {
      ngxSchemaRequired(path.firstName);
      ngxSchemaMinLength(path.firstName, 2);
      ngxSchemaRequired(path.lastName);
      ngxSchemaRequired(path.email);
      ngxSchemaEmail(path.email);
    },
  });
}
```

### 5. Template

```html
<ngx-form
  [adapter]="adapter"
  [action]="submitAction"
  (submitted)="onSubmitted($event)"
>
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

## Live Demo

Explore the library in action with our interactive demo.

- **Source Code**: [projects/demo](file:///Users/lorenzo.local/projects/personale/ngx-signal-forms/projects/demo)
- **Local Run**:
  ```bash
  pnpm install
  pnpm start
  ```
  *Then navigate to `http://localhost:4200`*

---

## Built-in Renderers

| Selector                  | Component                 | Value type              |
| ------------------------- | ------------------------- | ----------------------- |
| `ngx-control-text`        | `NgxTextComponent`        | `string`                |
| `ngx-control-number`      | `NgxNumberComponent`      | `number \| null`        |
| `ngx-control-datepicker`  | `NgxDatePickerComponent`  | `string \| null`        |
| `ngx-control-daterange`   | `NgxDateRangePickerComponent` | `NgxDateRange \| null` |
| `ngx-control-timepicker`  | `NgxTimepickerComponent`  | `string \| null`        |
| `ngx-control-select`      | `NgxSelectComponent`      | `TValue \| null`        |
| `ngx-control-multiselect` | `NgxMultiselectComponent` | `ReadonlyArray<TValue>` |
| `ngx-control-checkbox`    | `NgxCheckboxComponent`    | `boolean`               |
| `ngx-control-toggle`      | `NgxToggleComponent`      | `boolean`               |
| `ngx-control-textarea`    | `NgxTextareaComponent`    | `string`                |
| `ngx-control-radio`       | `NgxRadioGroupComponent`  | `TValue \| null`        |
| `ngx-control-slider`      | `NgxSliderComponent`      | `number`                |
| `ngx-control-file`        | `NgxFileComponent`        | `File \| null`          |
| `ngx-control-segmented`   | `NgxSegmentedComponent`   | `TValue \| null`        |

---

## Components & Features

### Text & Textarea

Standard inputs for short and long-form text.

```html
<ngx-control-text
  name="firstName"
  label="First Name"
  placeholder="Enter your name"
/>

<ngx-control-textarea
  name="bio"
  label="Biography"
  [rows]="5"
  placeholder="Tell us about yourself..."
/>
```

### Number & Slider

Inputs for numeric values with optional range and step constraints.

```html
<ngx-control-number
  name="age"
  label="Age"
  [minValue]="0"
  [maxValue]="120"
  [showSpinButtons]="true"
/>

<ngx-control-slider
  name="volume"
  label="Volume"
  [min]="0"
  [max]="100"
  [step]="5"
  [showValue]="true"
/>
```

### Date Picker

The M3 date picker (`ngx-control-datepicker`) replaces the native `<input type="date">` with a text input + calendar popup. Values are always ISO 8601 strings (`YYYY-MM-DD`).

#### Keyboard navigation (M3 spec)

| Key                             | Action                        |
| ------------------------------- | ----------------------------- |
| `ArrowLeft / ArrowRight`        | Previous / next day           |
| `ArrowUp / ArrowDown`           | Same day previous / next week |
| `Home / End`                    | First / last day of month     |
| `PageUp / PageDown`             | Previous / next month         |
| `Shift+PageUp / Shift+PageDown` | Previous / next year          |
| `Enter / Space`                 | Select focused date           |
| `Escape`                        | Close calendar                |

```html
<ngx-control-datepicker
  name="birthDate"
  label="Date of Birth"
  minDate="1900-01-01"
  maxDate="2026-12-31"
/>
```

### Keyboard navigation (M3 spec)

| Key                             | Action                        |
| ------------------------------- | ----------------------------- |
| `ArrowLeft / ArrowRight`        | Previous / next day           |
| `ArrowUp / ArrowDown`           | Same day previous / next week |
| `Home / End`                    | First / last day of month     |
| `PageUp / PageDown`             | Previous / next month         |
| `Shift+PageUp / Shift+PageDown` | Previous / next year          |
| `Enter / Space`                 | Select focused date           |
| `Escape`                        | Close calendar                |

### i18n — Date locale

The date picker auto-detects the browser locale via `navigator.language`. Override globally or per-component:

```ts
import { NGX_DATE_LOCALE, buildDateLocale } from "@ngx-signals/forms";

// Global override
providers: [{ provide: NGX_DATE_LOCALE, useValue: buildDateLocale("it-IT") }];

// Custom first day of week (0 = Sunday, 1 = Monday)
providers: [
  { provide: NGX_DATE_LOCALE, useValue: buildDateLocale("en-US", 1) },
];
```

The locale provides: month names (short/long), day names (narrow/short), and first day of week — all generated from `Intl.DateTimeFormat` with zero locale data bundles.

### Modular architecture

The date picker is composed of 5 standalone components:

| Component                    | Responsibility                               |
| ---------------------------- | -------------------------------------------- |
| `NgxDatePickerComponent`     | Renderer (input + toggle + popup)            |
| `NgxCalendarComponent`       | Container (keyboard nav, view state)         |
| `NgxCalendarHeaderComponent` | Month/year label + prev/next buttons         |
| `NgxCalendarGridComponent`   | 6×7 day grid with weekday headers            |
| `NgxCalendarCellComponent`   | Single day cell (selection, today, disabled) |

All sub-components are exported and can be used standalone for custom calendar UIs.

### Date Range Picker

The `ngx-control-daterange` component provides a compact, two-input interface for selecting a start and end date, backed by a unified M3 range calendar popup. Like the standard date picker, it fully supports keyboard navigation.

```html
<ngx-control-daterange
  name="vacation"
  label="Vacation Period"
  minDate="2024-01-01"
/>
```

### Time Picker

The M3 time picker (`ngx-control-timepicker`) provides a visual clock overlay for selecting hours, minutes, and AM/PM. Values are strings in `hh:mm AM/PM` format.

```html
<ngx-control-timepicker
  name="alarm"
  label="Alarm Time"
/>
```

---

### Multiselect Modes

The `ngx-control-multiselect` component supports two interaction modes via the `mode` input:

- `single` (default): Options can be selected once. Selecting an already selected option removes it.
- `multi`: Counter-based selection. Options can be selected multiple times. Chips show a counter badge with increment/decrement buttons.

```html
<ngx-control-multiselect
  name="tags"
  label="Tags"
  [options]="tagOptions"
  mode="multi"
/>

### Checkbox & Toggle

Boolean inputs for flat and visual switch states.

```html
<ngx-control-checkbox
  name="agree"
  label="I agree to the terms and conditions"
/>

<ngx-control-toggle
  name="notifications"
  label="Enable push notifications"
/>
```

### Segmented Button

A modern alternative to radio buttons for small sets of options.

```html
<ngx-control-segmented
  name="frequency"
  label="Contact Frequency"
  [options]="frequencyOptions"
/>
```

### File Upload

Standalone file selection with drag & drop support and immediate event emission.

```html
<ngx-control-file
  name="resume"
  label="Upload Resume"
  accept=".pdf,.doc"
  (fileSelected)="onFileSelected($event)"
/>
```

The `fileSelected` event emits `File | File[] | null` immediately upon selection or clearing, useful for immediate uploads or client-side processing.

### Radio Group

Standard selection from a list of mutual-exclusive options.

```html
<ngx-control-radio
  name="preferredContact"
  label="Preferred Contact"
  [options]="contactOptions"
  layout="horizontal"
/>
```

### Chips & Custom Templates

Enhance `ngx-control-select` and `ngx-control-multiselect` with custom templates and chip-based selection.

### Custom Option Template
Use the `ngxOption` directive to customize how items look in the dropdown.

```html
<ngx-control-select name="country" label="Country" [options]="countries" [searchable]="true">
  <ng-template ngxOption let-opt>
    <span class="flag">{{ countryFlags[opt.value] }}</span> {{ opt.label }}
  </ng-template>
</ngx-control-select>
```

### Visual Chips
Use the `ngxChips` directive inside your custom template to render items as interactive chips.

```html
<ngx-control-multiselect name="interests" label="Interests" [options]="interestOptions">
  <ng-template ngxOption let-opt let-selected="selected">
    <span ngxChips [selected]="selected" [removable]="false">
      {{ opt.label }}
    </span>
  </ng-template>
</ngx-control-multiselect>
```

### Conditional Options

The `[ngxDependsOn]` directive allows you to create dependent form controls (like a Province select that filters based on a Country select) with minimal boilerplate. It works automatically with `ngx-control-select` and `ngx-control-multiselect`.

```html
<ngx-control-select name="country" [options]="countries" />

<ngx-control-select
  name="province"
  label="Province / State"
  [ngxDependsOn]="'country'"
  [ngxOptionsMap]="provincesByCountry"
/>
```

The options map can be a static record or a function:
```ts
// Static record
readonly provincesByCountry: Record<string, NgxSelectOption[]> = {
  it: [{ value: "RM", label: "Roma" }, /* ... */],
  us: [{ value: "CA", label: "California" }, /* ... */],
};

// Or a dynamic function
readonly getProvinces = (country: string) => fetchProvincesFor(country);
```
When the parent field changes, the dependent control automatically updates its options and safely clears its existing selection to prevent data mismatch.

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

## Validation

### Schema-level (applied in adapter, powered by `@angular/forms/signals`)

```ts
import {
  schemaRequired,
  schemaEmail,
  schemaMin,
  schemaMax,
  schemaMinLength,
  schemaMaxLength,
} from "@ngx-signals/forms";

const adapter = createSignalFormAdapter({
  model: this.model,
  submitMode: "valid-only",
  schema: (path) => {
    ngxSchemaRequired(path.name);
    ngxSchemaEmail(path.email);
    ngxSchemaMin(path.age, 0);
    ngxSchemaMax(path.age, 120);
  },
});
```

### Pure validators (standalone functions)

```ts
import {
  ngxRequired,
  ngxMinLength,
  ngxMaxLength,
  ngxEmail,
  ngxPattern,
  ngxMin,
  ngxMax,
  ngxCompose,
  ngxComposeFirst,
} from "@ngx-signals/forms";

const nameValidators = ngxCompose(
  ngxRequired("Name is required"),
  ngxMinLength(2),
  ngxMaxLength(50),
);
```

---

## Advanced

### Custom Renderer

Extend `NgxBaseControl<TValue>` to create a custom renderer:

```ts
@Component({
  selector: "my-phone-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer" },
  template: `
    <label [for]="fieldId">{{ label() }}</label>
    <input
      [id]="fieldId"
      type="tel"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
    />
  `,
})
export class PhoneComponent extends NgxBaseControl<string> {
  readonly label = input<string>("");
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
renderers/    → control/ + core/
control/      → core/types.ts + core/tokens.ts
form/         → core/types.ts + core/tokens.ts
adapter/      → core/types.ts + @angular/forms/signals  (← ONLY file allowed)
core/         → @angular/core only
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

## Utilities

### `ngxFormSerialize(value: any): any`

Converts a form model into a JSON-serializable object. It automatically maps native `File` and `File[]` objects into descriptive strings (e.g., `"[File: resume.pdf (12345 bytes)]"`) to prevent them from appearing as empty `{}` when using `JSON.stringify`.

```ts
import { ngxFormSerialize } from '@ngx-signals/forms';

const serialized = ngxFormSerialize(adapter.getValue());
console.log(JSON.stringify(serialized, null, 2));
```

---

## Build

```bash
ng build @ngx-signals/forms
```

Requires Angular 21+ with `@angular/forms/signals` (experimental).

---

## License

MIT

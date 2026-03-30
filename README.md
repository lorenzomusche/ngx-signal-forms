# @ngx-signals/forms

> **Declarative, signal-driven form library for Angular.** Built on the experimental **Signal Forms API**, it provides a type-safe, reactive, and highly accessible way to build modern forms with Material Design 3 (M3) aesthetics.

[![Angular](https://img.shields.io/badge/Angular-21%2B-red)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=flat&logo=github-sponsors)](https://github.com/sponsors/lorenzomusche)

---

## ⚡ Live Demo

Try the library immediately on **StackBlitz**:
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/stackblitz-starters-m5n2dffd)

---

## 🚀 Key Features

- **Signals-First**: True reactive state management using native Angular Signals.
- **Two Usage Modes**: Choose between **Declarative** (zero boilerplate) or **Explicit Adapter** (maximum control).
- **15+ Built-in Renderers**: From text and selects to M3-spec DatePickers, TimePickers, and Color pickers.
- **Declarative Validation**: Apply rules directly in templates using directives like `ngxRequired`, `ngxEmail`, etc.
- **Rich UI Toolkit**: Support for Floating Labels, Prefixes/Suffixes, Supporting Text, and Inline Errors.
- **Material Design 3**: Pixel-perfect adherence to M3 specs for interactions, states, and accessibility.
- **Maximum A11y**: Built-in ARIA management, keyboard navigation, and screen reader announcements.
- **Full Strict Type-Safety**: End-to-end typing for your form models.
- **Form Serialization**: Safely serialize form values, including `File` objects.

---

## ⚡️ Quick Start (Local Development)

To get the project up and running locally for development or to explore the demo:

```bash
# 1. Install dependencies and build the library
npm run setup

# 2. Start the demo application
npm start
```

---

## 📦 Installation

```bash
npm install @ngx-signals/forms
```

### 2. Import Styles
Add the library styles to your `angular.json` file. We recommend using the **base** and **default** styles for the full design experience:

```json
"styles": [
  "src/styles.scss",
  "node_modules/@ngx-signals/forms/styles/base.css",
  "node_modules/@ngx-signals/forms/styles/default.css"
],
```

Recommended combinations:
- **Core (Required)**: `@ngx-signals/forms/styles/base.css`
- **Minimalist**: `@ngx-signals/forms/styles/default.css`
- **Material 3 Look**: `@ngx-signals/forms/styles/material.css`
- **iOS Aesthetic**: `@ngx-signals/forms/styles/ios.css`
- **Ionic Support**: `@ngx-signals/forms/styles/ionic.css`

---

## 🛠 Usage Modes

### 1. Declarative Mode (Recommended)
Zero boilerplate. Define your form structure, values, and validation rules directly in the template.

```html
<ngx-form [formValue]="{ speed: 50 }" (submitted)="save($event)">
  <ngx-control-text name="username" label="Username" ngxRequired ngxMinLength="3" />
  
  <ngx-control-slider name="speed" label="Max Speed" [min]="0" [max]="100" />

  <button type="submit">Save</button>
</ngx-form>
```

### 2. Explicit Adapter Mode
Full control. Create an adapter in your component for complex logic, cross-field validation, or manual state manipulation.

```ts
interface MyForm { name: string; age: number; }

export class Component {
  readonly model = signal<MyForm>({ name: '', age: 18 });
  
  readonly adapter = createSignalFormAdapter({
    model: this.model,
    schema: (path) => {
      ngxSchemaRequired(path.name);
      ngxSchemaMin(path.age, 18);
    }
  });
}
```

```html
<ngx-form [adapter]="adapter">
  <ngx-control-text name="name" label="Full Name" />
  <ngx-control-number name="age" label="Age" />
</ngx-form>
```

---

## 🎨 Component Catalog

| Selector | Component | Value Type |
| :--- | :--- | :--- |
| `ngx-control-text` | `NgxTextComponent` | `string` |
| `ngx-control-number` | `NgxNumberComponent` | `number \| null` |
| `ngx-control-datepicker` | `NgxDatePickerComponent` | `string (ISO)` |
| `ngx-control-daterange` | `NgxDateRangePickerComponent` | `NgxDateRange` |
| `ngx-control-timepicker` | `NgxTimepickerComponent` | `string (HH:mm AM/PM)` |
| `ngx-control-select` | `NgxSelectComponent` | `TValue \| null` |
| `ngx-control-multiselect` | `NgxMultiselectComponent` | `TValue[]` |
| `ngx-control-colors` | `NgxColorsComponent` | `string (Hex)` |
| `ngx-control-checkbox` | `NgxCheckboxComponent` | `boolean` |
| `ngx-control-toggle` | `NgxToggleComponent` | `boolean` |
| `ngx-control-radio` | `NgxRadioGroupComponent` | `TValue \| null` |
| `ngx-control-segmented` | `NgxSegmentedButtonComponent` | `TValue \| null` |
| `ngx-control-slider` | `NgxSliderComponent` | `number` |
| `ngx-control-textarea` | `NgxTextareaComponent` | `string` |
| `ngx-control-file` | `NgxFileComponent` | `File \| null` |

---

## ✨ UI Enhancements

Every control supports rich UI decorations to match modern Design Systems:

### Prefixes & Suffixes
Add icons or text before or after the input.
```html
<ngx-control-text name="price" label="Price">
  <span ngxPrefix>$</span>
  <span ngxSuffix>.00</span>
</ngx-control-text>
```

### Floating Labels & Supporting Text
Enable Material-style floating labels and provide helper text.
```html
<ngx-form [ngxFloatingLabels]="true" [ngxFloatingLabelsDensity]="-2">
  <ngx-control-text name="email" label="Email">
    <small ngxSupportingText>We'll never share your email.</small>
  </ngx-control-text>
</ngx-form>
```

### Inline Errors
Show errors immediately via the `ngxInlineErrors` directive.
```html
<ngx-control-text name="password" label="Password" ngxInlineErrors />
```

---

## ✅ Validation

You have three ways to validate your forms:

1.  **Directives (Declarative)**: `ngxRequired`, `ngxEmail`, `ngxMinLength`, `ngxMaxLength`, `ngxPattern`, `ngxMin`, `ngxMax`.
2.  **Pure Functions**: Use `ngxCompose` and `ngxRequired()` with `createSignalFormAdapter`.
3.  **Schema Debounce**: `ngxSchemaDebounce(path.field, 300)` to delay validation checks.

---

## ♿️ Accessibility (a11y)

The library is built on top of **Material Design 3** accessibility patterns:
- **Keyboard Navigation**: Full support for DatePickers, Selects, and TimePickers (Arrow keys, Space, Enter, Escape).
- **Screen Reader Announcements**: `NgxA11yAnnouncer` service integrated into all overlays.
- **Dynamic ARIA**: Automatic management of `aria-invalid`, `aria-required`, `aria-expanded`, and `aria-activedescendant`.
- **Focus Management**: Robust "roving focus" and visual focus indicators.

---

## 🌍 I18n — Date Locale

The DatePicker automatically detects the browser locale. You can override it via DI:

```ts
providers: [
  { provide: NGX_DATE_LOCALE, useValue: buildDateLocale("it-IT", 1) } // 1 = Monday
]
```

---

## 🛠 Advanced Features

### Conditional Options
Effortlessly link two selectors (e.g., Country -> Province).
```html
<ngx-control-select name="country" [options]="countries" />
<ngx-control-select 
  name="province" 
  [ngxDependsOn]="'country'" 
  [ngxOptionsMap]="provincesByCountry" 
/>
```

### Form Serialization
Safely serialize form values, including `File` objects.
```ts
const data = ngxFormSerialize(adapter.getValue());
```

---

## 🏗 Compatibility

- **Requirements**: Angular 21+ (with `@angular/forms/signals`).

---

## 📄 License

MIT © [Lorenzo Muschella](https://github.com/lorenzomusche)

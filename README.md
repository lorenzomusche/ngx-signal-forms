# ngx-signal-forms

> Angular declarative form library built on the **Signal Forms API** — type-safe, reactive, renderer-pluggable via DI tokens.

[![Angular](https://img.shields.io/badge/Angular-21%2B-red)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Features

- **Declarative syntax** — `<ngx-control text name="firstName" />`
- **Signal-first** — all state exposed as `Signal<T>`, no `Observable` boilerplate
- **Polymorphic control** — one `<ngx-control>` host, renderer injected via DI token (no boolean flags)
- **7 built-in renderers** — text, select, multiselect (checkbox, `ReadonlyArray<TValue>`), checkbox, number, date, textarea
- **Custom renderers** — extend `ControlDirective<T>` and provide `NGX_CONTROL_DIRECTIVE`
- **Pure validator functions** — `required`, `minLength`, `email`, `pattern`, `min`, `max`, `compose`
- **Rich submit event** — `{ value, valid, errors, [RAW_FIELD_TREE_SYMBOL] }`
- **Adapter encapsulation** — `@angular/forms/signals` API never leaks to consumers
- **Full strict TypeScript** — no `any`, immutable arrays, functional composition

---

## Quick Start

### 1. Import

```ts
import {
  NgxFormComponent,
  ControlComponent,
  TextRendererDirective,
  SelectRendererDirective,
  MultiselectRendererDirective,
  required,
  minLength,
  compose,
} from 'ngx-signal-forms';

@Component({
  imports: [
    NgxFormComponent,
    ControlComponent,
    TextRendererDirective,
    SelectRendererDirective,
    MultiselectRendererDirective,
  ],
})
```

### 2. Template

```html
<ngx-form [action]="onSubmit" (submitted)="handleResult($event)">

  <!-- Text input -->
  <ngx-control text name="firstName" label="Nome" [validators]="firstNameValidators" />
  <ngx-control text name="lastName"  label="Cognome" />

  <!-- Select -->
  <ngx-control select name="province" label="Provincia" [options]="provinces" />

  <!-- Multiselect with custom option template -->
  <ngx-control multiselect name="tags" [options]="tagOptions">
    <ng-template #optionTpl let-opt>
      <strong>{{ opt.label }}</strong>
    </ng-template>
  </ngx-control>

  <!-- Submit button reacts to form validity signal -->
  <button type="submit" formActions [disabled]="!formContext.valid()">Invia</button>

</ngx-form>
```

### 3. Component

```ts
export class MyFormComponent {
  readonly firstNameValidators = compose(
    required(),
    minLength(2),
  );

  readonly provinces: NgxSelectOption<string>[] = [
    { value: 'MI', label: 'Milano' },
    { value: 'RM', label: 'Roma' },
  ];

  async onSubmit(value: MyFormModel): Promise<readonly string[]> {
    const result = await this.myService.save(value);
    return result.errors ?? [];
  }

  handleResult(event: NgxFormSubmitEvent<MyFormModel>): void {
    console.log('valid:', event.valid);
    console.log('value:', event.value);
    console.log('errors:', event.errors);
  }
}
```

---

## Submit Event Shape

```ts
interface NgxFormSubmitEvent<T> {
  value: T;                        // form model
  valid: boolean;                  // all fields valid
  errors: readonly string[];       // global submit errors
  [RAW_FIELD_TREE_SYMBOL]: ...;    // raw signal tree (adapter/controllers only)
}
```

---

## Built-in Validators

```ts
import { required, minLength, maxLength, email, pattern, min, max, compose, composeFirst } from 'ngx-signal-forms';

const nameValidators = compose(
  required('Nome obbligatorio'),
  minLength(2),
  maxLength(50),
);
```

---

## Custom Renderer

```ts
@Directive({
  selector: 'ngx-control[phone]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_DIRECTIVE, useExisting: PhoneRendererDirective }],
  template: `<input type="tel" ... />`,
})
export class PhoneRendererDirective extends ControlDirective<string> {
  readonly name = input.required<string>();
  readonly validators = input<readonly ValidatorFn<string>[]>([]);
  get fieldName() { return this.name(); }
  readonly value = signal('');
}
```

---

## Architecture

```
NgxFormComponent
  └─ SignalFormAdapter          (sole consumer of @angular/forms/signals)
      └─ NGX_FORM_REGISTRY      (DI token for field registration)

ngx-control[text|select|...]   (ControlComponent + renderer directive)
  └─ ControlDirective<TValue>  (abstract base, registers to registry)
  └─ NGX_CONTROL_DIRECTIVE     (DI token resolves the active renderer)
```

---

## Build

```bash
ng build ngx-signal-forms
```

Requires Angular 21+ with `@angular/forms/signals` (experimental).

---

## License

MIT

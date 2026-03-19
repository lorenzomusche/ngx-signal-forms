/**
 * Public API Surface of ngx-signal-forms
 *
 * Only expose what consumers need — the @angular/forms/signals
 * internals are encapsulated behind createSignalFormAdapter().
 *
 * Naming convention: all exported symbols use the Ngx prefix.
 */

// ─── Core types ──────────────────────────────────────────────────────────────
export type {
  // Field-level
  NgxFieldState,
  NgxFieldRef,
  NgxFieldTree,
  NgxFieldError,
  // Form-level
  NgxFormError,
  NgxFormState,
  NgxFormAdapter,
  NgxFormSubmitEvent,
  NgxSubmitMode,
  // Control / renderer helpers
  NgxControlOption,
  NgxControlRendererConfig,
} from './lib/core/types';

// ─── DI tokens & interfaces ───────────────────────────────────────────────────
export {
  NGX_FORM_ADAPTER,
  NGX_CONTROL_RENDERER,
  RAW_FIELD_TREE_SYMBOL,
} from './lib/core/tokens';

export type { NgxControlRenderer } from './lib/core/tokens';

// ─── Adapter factory (sole consumer of @angular/forms/signals) ───────────────
export {
  createSignalFormAdapter,
} from './lib/adapter/signal-form-adapter';

export type {
  SignalFormAdapterOptions,
  NgxFormAdapterWithEvent,
} from './lib/adapter/signal-form-adapter';

// ─── Form component ───────────────────────────────────────────────────────────
export { NgxFormComponent } from './lib/form/ngx-form.component';

// ─── Control (host + base directive + DI token) ───────────────────────────────
export { ControlComponent } from './lib/control/control.component';
export {
  ControlDirective,
  NGX_CONTROL_DIRECTIVE,
  RAW_CONTROL_SYMBOL,
} from './lib/control/control.directive';

// ─── Built-in renderer directives ────────────────────────────────────────────
export { TextRendererDirective }        from './lib/renderers/text-renderer.directive';
export { SelectRendererDirective }      from './lib/renderers/select-renderer.directive';
export { MultiselectRendererDirective } from './lib/renderers/multiselect-renderer.directive';
export { CheckboxRendererDirective }    from './lib/renderers/checkbox-renderer.directive';
export { NumberRendererDirective }      from './lib/renderers/number-renderer.directive';
export { DateRendererDirective }        from './lib/renderers/date-renderer.directive';
export { TextareaRendererDirective }    from './lib/renderers/textarea-renderer.directive';

// ─── Built-in validators (pure functions) ────────────────────────────────────
export {
  required,
  minLength,
  maxLength,
  email,
  pattern,
  min,
  max,
  compose,
  composeFirst,
} from './lib/core/validators';

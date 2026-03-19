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
  // Control / renderer helpers
  NgxControlOption,
  NgxControlRendererConfig,
  NgxFieldConfig,
  NgxFieldError,
  NgxFieldRef,
  // Field-level
  NgxFieldState,
  NgxFieldTree,
  NgxFormAdapter,
  // Form context (optional)
  NgxFormContext,
  // Form-level
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEvent,
  NgxSelectOption,
  NgxSubmitMode,
  // Validator
  ValidatorFn,
} from "./lib/core/types";

// ─── DI tokens ────────────────────────────────────────────────────────────────
export {
  NGX_FORM_ADAPTER,
  NGX_INLINE_ERRORS,
  RAW_FIELD_TREE_SYMBOL,
} from "./lib/core/tokens";

// ─── Adapter factory (sole consumer of @angular/forms/signals) ───────────────
export { createSignalFormAdapter } from "./lib/adapter/signal-form-adapter";

export type {
  NgxFormAdapterWithEvent,
  SignalFormAdapterOptions,
} from "./lib/adapter/signal-form-adapter";

// ─── Form component ───────────────────────────────────────────────────────────
export { NgxFormComponent } from "./lib/form/ngx-form.component";

// ─── Control base class & optional wrapper ───────────────────────────────────
export { ControlComponent } from "./lib/control/control.component";
export { NgxBaseControl } from "./lib/control/control.directive";
export { NgxInlineErrorsDirective } from "./lib/control/inline-errors.directive";
export { NgxOptionDirective } from "./lib/control/option.directive";

// ─── Built-in renderer components ────────────────────────────────────────────
export { NgxCheckboxComponent } from "./lib/renderers/checkbox-renderer.directive";
export { NgxDateComponent } from "./lib/renderers/date-renderer.directive";
export { NgxMultiselectComponent } from "./lib/renderers/multiselect-renderer.directive";
export { NgxNumberComponent } from "./lib/renderers/number-renderer.directive";
export { NgxSelectComponent } from "./lib/renderers/select-renderer.directive";
export { NgxTextComponent } from "./lib/renderers/text-renderer.directive";
export { NgxTextareaComponent } from "./lib/renderers/textarea-renderer.directive";
export { NgxToggleComponent } from "./lib/renderers/toggle-renderer.directive";

// ─── Built-in validators (pure functions) ────────────────────────────────────
export {
  compose,
  composeFirst,
  email,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
} from "./lib/core/validators";

// ─── Angular forms/signals validator re-exports (schema-level) ───────────────
export {
  debounce as schemaDebounce,
  email as schemaEmail,
  max as schemaMax,
  maxLength as schemaMaxLength,
  min as schemaMin,
  minLength as schemaMinLength,
  pattern as schemaPattern,
  required as schemaRequired,
} from "./lib/adapter/signal-form-adapter";

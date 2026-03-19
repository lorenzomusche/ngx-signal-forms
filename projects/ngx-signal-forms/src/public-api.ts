/**
 * Public API Surface of ngx-signal-forms
 *
 * Only expose what consumers need — the @angular/forms/signals
 * internals are encapsulated behind SignalFormAdapter.
 */

// ---- Core types -------------------------------------------------------------
export type {
  NgxFormSubmitEvent,
  NgxFormContext,
  NgxFieldRegistration,
  NgxFieldConfig,
  NgxSelectOption,
  ValidatorFn,
  NgxControlState,
  NgxFormRegistry,
} from './lib/core/types';

// ---- Core tokens (for advanced consumers/controllers) -----------------------
export { NGX_FORM_CONTEXT, NGX_FORM_REGISTRY } from './lib/core/tokens';

// ---- Form component ---------------------------------------------------------
export { NgxFormComponent } from './lib/form/ngx-form.component';

// ---- Control ----------------------------------------------------------------
export { ControlComponent } from './lib/control/control.component';
export { ControlDirective, NGX_CONTROL_DIRECTIVE, RAW_CONTROL_SYMBOL } from './lib/control/control.directive';

// ---- Renderer directives ----------------------------------------------------
export { TextRendererDirective } from './lib/renderers/text-renderer.directive';
export { SelectRendererDirective } from './lib/renderers/select-renderer.directive';
export { MultiselectRendererDirective } from './lib/renderers/multiselect-renderer.directive';
export { CheckboxRendererDirective } from './lib/renderers/checkbox-renderer.directive';
export { NumberRendererDirective } from './lib/renderers/number-renderer.directive';
export { DateRendererDirective } from './lib/renderers/date-renderer.directive';
export { TextareaRendererDirective } from './lib/renderers/textarea-renderer.directive';

// ---- Adapter (exported for DI overrides only) -------------------------------
export { SignalFormAdapter } from './lib/adapter/signal-form-adapter';

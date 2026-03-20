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
  ValidatorFn
} from "./lib/core/types";

// ─── DI tokens ────────────────────────────────────────────────────────────────
export { NGX_FORM_ADAPTER, NGX_INLINE_ERRORS } from "./lib/core/tokens";

export { RAW_FIELD_TREE_SYMBOL } from "./lib/core/types";

// ─── Date locale (i18n) ──────────────────────────────────────────────────────
export { buildDateLocale, NGX_DATE_LOCALE } from "./lib/core/date-locale";
export type { NgxDateLocale } from "./lib/core/date-locale";

// ─── Date utilities (ISO) ────────────────────────────────────────────────────
export {
  formatIsoDate,
  today as isoToday,
  parseIsoDate
} from "./lib/core/date-utils";
export type { CalendarCell, CalendarDate } from "./lib/core/date-utils";

// ─── Overlay positioning ─────────────────────────────────────────────────────
export { computeOverlayPosition } from "./lib/core/overlay-position";
export type {
  OverlayPosition,
  OverlayPositionConfig
} from "./lib/core/overlay-position";

// ─── Adapter factory (sole consumer of @angular/forms/signals) ───────────────
export { createSignalFormAdapter } from "./lib/adapter/signal-form-adapter";

export type {
  NgxFormAdapterWithEvent,
  SignalFormAdapterOptions
} from "./lib/adapter/signal-form-adapter";

// ─── Form component ───────────────────────────────────────────────────────────
export { NgxFormComponent } from "./lib/form/ngx-form.component";

// ─── Control base class & optional wrapper ───────────────────────────────────
export { NgxControlComponent } from "./lib/control/control.component";
export { NgxBaseControl } from "./lib/control/control.directive";
export { NgxErrorListComponent } from "./lib/control/error-list.component";
export { NgxInlineErrorIconComponent } from "./lib/control/inline-error-icon.component";
export { NgxInlineErrorsDirective } from "./lib/control/inline-errors.directive";
export { NgxOptionDirective } from "./lib/control/option.directive";

// ─── Built-in renderer components ────────────────────────────────────────────
export { NgxCheckboxComponent } from "./lib/renderers/checkbox/checkbox-renderer.component";
export { NgxCalendarCellComponent } from "./lib/renderers/datepicker/calendar-cell.component";
export { NgxCalendarGridComponent } from "./lib/renderers/datepicker/calendar-grid.component";
export { NgxCalendarHeaderComponent } from "./lib/renderers/datepicker/calendar-header.component";
export { NgxCalendarComponent } from "./lib/renderers/datepicker/calendar.component";
export { NgxDatePickerComponent } from "./lib/renderers/datepicker/datepicker.component";
export { NgxMultiselectComponent } from "./lib/renderers/multiselect/multiselect-renderer.component";
export { NgxNumberComponent } from "./lib/renderers/number/number-renderer.component";
export { NgxSelectComponent } from "./lib/renderers/select/select-renderer.component";
export { NgxTextComponent } from "./lib/renderers/text/text-renderer.component";
export { NgxTextareaComponent } from "./lib/renderers/textarea/textarea-renderer.component";
export { NgxToggleComponent } from "./lib/renderers/toggle/toggle-renderer.component";

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
  required
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
  required as schemaRequired
} from "./lib/adapter/signal-form-adapter";


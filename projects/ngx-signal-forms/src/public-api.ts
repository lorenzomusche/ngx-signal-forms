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
  // Date range
  NgxDateRange,
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
  NgxOptionsControl,
  NgxSelectOption,
  NgxSubmitMode,
  // Validator
  ValidatorFn,
} from "./lib/core/types";

// ─── DI tokens ────────────────────────────────────────────────────────────────
export {
  NGX_DECLARATIVE_REGISTRY,
  NGX_FORM_ADAPTER,
  NGX_INLINE_ERRORS,
} from "./lib/core/tokens";

export { RAW_FIELD_TREE_SYMBOL } from "./lib/core/types";

// ─── Date locale (i18n) ──────────────────────────────────────────────────────
export { buildDateLocale, NGX_DATE_LOCALE } from "./lib/core/date-locale";
export type { NgxDateLocale } from "./lib/core/date-locale";

// ─── Date utilities (ISO) ────────────────────────────────────────────────────
export {
  formatIsoDate,
  today as isoToday,
  parseIsoDate,
} from "./lib/core/date-utils";
export type { CalendarCell, CalendarDate } from "./lib/core/date-utils";

// ─── Time utilities (HH:MM AM/PM) ────────────────────────────────────────────
export {
  buildTimeString,
  formatTime as formatTimeString,
  parseTime,
} from "./lib/core/time-utils";
export type { ParsedTime } from "./lib/core/time-utils";

// ─── Overlay positioning ─────────────────────────────────────────────────────
export { computeOverlayPosition } from "./lib/core/overlay-position";
export type {
  ComputedPosition,
  OverlayAlignment,
  OverlayAnchor,
  OverlayPosition,
  OverlayPositionConfig,
} from "./lib/core/overlay-position";

// ─── Declarative adapter ──────────────────────────────────────────────────────
export { NgxDeclarativeAdapter } from "./lib/core/declarative-form-adapter";
export type { NgxDeclarativeRegistry } from "./lib/core/declarative-form-adapter";

// ─── Adapter factory (sole consumer of @angular/forms/signals) ───────────────
export { createSignalFormAdapter } from "./lib/adapter/signal-form-adapter";

export type {
  SignalFormAdapterOptions,
} from "./lib/adapter/signal-form-adapter";

// ─── Form component ───────────────────────────────────────────────────────────
export { NgxFormComponent } from "./lib/form/ngx-form.component";

// ─── Control base class & optional wrapper ───────────────────────────────────
export { NgxControlComponent } from "./lib/control/control.component";
export { NgxBaseControl } from "./lib/control/control.directive";
export { NgxOverlayControl } from "./lib/core/overlay-control.directive";
export { NgxOptionsOverlayControl } from "./lib/core/options-overlay-control.directive";
export { NgxControlLabelComponent } from "./lib/control/ngx-control-label.component";
export { NgxErrorListComponent } from "./lib/control/error-list.component";
export { NgxPrefixDirective } from "./lib/control/prefix.directive";
export { NgxSuffixDirective } from "./lib/control/suffix.directive";
export { NgxSupportingTextDirective } from "./lib/control/supporting-text.directive";
export { NgxInlineErrorIconComponent } from "./lib/control/inline-error-icon.component";
export { NgxInlineErrorsDirective } from "./lib/control/inline-errors.directive";
export { NgxConditionalOptionsDirective } from "./lib/control/conditional-options.directive";
export { NgxOptionDirective } from "./lib/control/option.directive";
export { NgxChipsDirective } from "./lib/control/chips.directive";
export { NgxFloatingLabelsDirective } from "./lib/form/ngx-floating-labels.directive";
export { NGX_FLOATING_LABELS } from "./lib/core/tokens";

// ─── Built-in renderer components ────────────────────────────────────────────
export { NgxCheckboxComponent } from "./lib/renderers/checkbox/checkbox-renderer.component";
export { NgxCalendarCellComponent } from "./lib/renderers/datepicker/calendar-cell.component";
export { NgxCalendarGridComponent } from "./lib/renderers/datepicker/calendar-grid.component";
export { NgxCalendarHeaderComponent } from "./lib/renderers/datepicker/calendar-header.component";
export { NgxCalendarComponent } from "./lib/renderers/datepicker/calendar.component";
export { NgxDatePickerComponent } from "./lib/renderers/datepicker/datepicker.component";
export { NgxDateRangePickerComponent } from "./lib/renderers/datepicker/daterange-renderer.component";
export { NgxRangeCalendarGridComponent } from "./lib/renderers/datepicker/range-calendar-grid.component";
export { NgxRangeCalendarComponent } from "./lib/renderers/datepicker/range-calendar.component";
export { NgxMultiselectComponent } from "./lib/renderers/multiselect/multiselect-renderer.component";
export { NgxNumberComponent } from "./lib/renderers/number/number-renderer.component";
export { NgxSelectComponent } from "./lib/renderers/select/select-renderer.component";
export { NgxTextComponent } from "./lib/renderers/text/text-renderer.component";
export { NgxTextareaComponent } from "./lib/renderers/textarea/textarea-renderer.component";
export { NgxToggleComponent } from "./lib/renderers/toggle/toggle-renderer.component";
export { NgxRadioGroupComponent } from "./lib/renderers/radio/radio-group-renderer.component";
export { NgxSliderComponent } from "./lib/renderers/slider/slider-renderer.component";
export { NgxFileComponent } from "./lib/renderers/file/file-renderer.component";
export { NgxSegmentedButtonComponent } from "./lib/renderers/segmented-button/segmented-button-renderer.component";
export { NgxColorsComponent } from "./lib/renderers/colors/colors-renderer.component";


// Timepicker (Material 3)
export { NgxTimepickerComponent } from "./lib/renderers/timepicker";

// Utilities
export { NgxA11yAnnouncer } from "./lib/core/a11y-announcer";
export { ngxFormSerialize } from "./lib/core/utils";
export { filterOptionsByQuery } from "./lib/core/options-utils";

// ─── Built-in validators (pure functions) ────────────────────────────────────
export {
  compose as ngxCompose,
  composeFirst as ngxComposeFirst,
  email as ngxEmail,
  max as ngxMax,
  maxLength as ngxMaxLength,
  min as ngxMin,
  minLength as ngxMinLength,
  pattern as ngxPattern,
  required as ngxRequired,
} from "./lib/core/validators";

// ─── Declarative validator directives ────────────────────────────────────────
export {
  NgxEmailDirective,
  NgxMaxDirective,
  NgxMaxLengthDirective,
  NgxMinDirective,
  NgxMinLengthDirective,
  NgxPatternDirective,
  NgxRequiredDirective,
} from "./lib/validators/directives";

// ─── Angular forms/signals validator re-exports (schema-level) ───────────────
export {
  ngxSchemaDebounce,
  ngxSchemaEmail,
  ngxSchemaMax,
  ngxSchemaMaxLength,
  ngxSchemaMin,
  ngxSchemaMinLength,
  ngxSchemaPattern,
  ngxSchemaRequired,
} from "./lib/adapter/signal-form-adapter";

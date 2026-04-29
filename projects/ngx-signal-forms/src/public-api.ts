/**
 * Public API Surface of ngx-signal-forms
 *
 * Core components and utilities for signal-driven forms.
 * Consumes @angular/forms/signals internally and provides a stable,
 * simplified surface for Angular applications.
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
  ValidatorFn
} from "./lib/core/types";

// ─── DI tokens ────────────────────────────────────────────────────────────────
export {
  NGX_DECLARATIVE_REGISTRY,
  NGX_FLOATING_LABELS_DEFAULT,
  NGX_FLOATING_LABELS_DENSITY_DEFAULT,
  NGX_FORM_ADAPTER,
  NGX_INLINE_ERRORS
} from "./lib/core/tokens";

// ─── UI string i18n ──────────────────────────────────────────────────────────
export { NGX_I18N_MESSAGES, NGX_I18N_MESSAGES_DEFAULT } from "./lib/core/i18n";
export type { NgxI18nMessages } from "./lib/core/i18n";

// ─── Date locale (i18n) ──────────────────────────────────────────────────────
export { buildDateLocale, NGX_DATE_LOCALE } from "./lib/core/date-locale";
export type { NgxDateLocale } from "./lib/core/date-locale";

// ─── Date utilities (ISO) ────────────────────────────────────────────────────
export {
  addDays, addMonths,
  addYears, buildMonthGrid, compareDates,
  // Date arithmetic utilities
  daysInMonth,
  firstWeekday, formatIsoDate, isDateBetween, isDateInRange, today as isoToday, isSameDay, orderDates, parseIsoDate
} from "./lib/core/date-utils";
export type { CalendarCell, CalendarDate } from "./lib/core/date-utils";

// ─── Time utilities (HH:MM AM/PM) ────────────────────────────────────────────
export {
  angleToHour,
  angleToMinute, buildTimeString,
  formatTime as formatTimeString,
  // Time arithmetic utilities
  getCurrentTime, getPointerCoords, hourToAngle,
  minuteToAngle, parseTime, pointerAngle
} from "./lib/core/time-utils";
export type { ParsedTime } from "./lib/core/time-utils";

// ─── Overlay positioning ─────────────────────────────────────────────────────
export {
  computeCoordsForAnchor, computeOverlayPosition,
  // Overlay helper utilities
  getOverlayStyles
} from "./lib/core/overlay-position";
export type {
  ComputedPosition,
  OverlayAlignment,
  OverlayAnchor,
  OverlayPosition,
  OverlayPositionConfig
} from "./lib/core/overlay-position";

// ─── Declarative adapter ──────────────────────────────────────────────────────
export { NgxDeclarativeAdapter } from "./lib/core/declarative-form-adapter";
export type { NgxDeclarativeRegistry } from "./lib/core/declarative-form-adapter";

// ─── Form component ───────────────────────────────────────────────────────────
export { NgxFormComponent } from "./lib/form/ngx-form.component";
export { NgxFormArrayComponent } from "./lib/form-array/ngx-form-array.component";

// ─── Control base class & optional wrapper ───────────────────────────────────
export { NgxChipsDirective } from "./lib/control/chips.directive";
export { NgxConditionalOptionsDirective } from "./lib/control/conditional-options.directive";
export { NgxControlComponent } from "./lib/control/control.component";
export { NgxBaseControl } from "./lib/control/control.directive";
export { NgxErrorListComponent } from "./lib/control/error-list.component";
export { NgxInlineErrorIconComponent } from "./lib/control/inline-error-icon.component";
export { NgxInlineErrorsDirective } from "./lib/control/inline-errors.directive";
export { NgxControlLabelComponent } from "./lib/control/ngx-control-label.component";
export { NgxOptionDirective } from "./lib/control/option.directive";
export { NgxPrefixDirective } from "./lib/control/prefix.directive";
export { NgxSuffixDirective } from "./lib/control/suffix.directive";
export { NgxSupportingTextDirective } from "./lib/control/supporting-text.directive";
export { NgxGlassDirective } from "./lib/core/directives/glass.directive";
export { NgxOptionsOverlayControl } from "./lib/core/options-overlay-control.directive";
export { NgxOverlayControl } from "./lib/core/overlay-control.directive";
export { NGX_FLOATING_LABELS } from "./lib/core/tokens";
export { NgxFloatingLabelsDirective } from "./lib/form/ngx-floating-labels.directive";

// ─── Built-in renderer components ────────────────────────────────────────────
export { NgxCheckboxComponent } from "./lib/renderers/checkbox/checkbox-renderer.component";
export { NgxColorsComponent } from "./lib/renderers/colors/colors-renderer.component";
export { NgxCalendarCellComponent } from "./lib/renderers/datepicker/calendar-cell.component";
export { NgxCalendarGridComponent } from "./lib/renderers/datepicker/calendar-grid.component";
export { NgxCalendarHeaderComponent } from "./lib/renderers/datepicker/calendar-header.component";
export { NgxCalendarComponent } from "./lib/renderers/datepicker/calendar.component";
export { NgxDatePickerComponent } from "./lib/renderers/datepicker/datepicker.component";
export { NgxDateRangePickerComponent } from "./lib/renderers/datepicker/daterange-renderer.component";
export { NgxRangeCalendarGridComponent } from "./lib/renderers/datepicker/range-calendar-grid.component";
export { NgxRangeCalendarComponent } from "./lib/renderers/datepicker/range-calendar.component";
export { NgxFileComponent } from "./lib/renderers/file/file-renderer.component";
export { NgxMultiselectComponent } from "./lib/renderers/multiselect/multiselect-renderer.component";
export { NgxNumberComponent } from "./lib/renderers/number/number-renderer.component";
export { NgxRadioGroupComponent } from "./lib/renderers/radio/radio-group-renderer.component";
export { NgxSegmentedButtonComponent } from "./lib/renderers/segmented-button/segmented-button-renderer.component";
export { NgxSelectComponent } from "./lib/renderers/select/select-renderer.component";
export { NgxSliderComponent } from "./lib/renderers/slider/slider-renderer.component";
export { NgxTextComponent } from "./lib/renderers/text/text-renderer.component";
export { NgxTextareaComponent } from "./lib/renderers/textarea/textarea-renderer.component";
export { NgxToggleComponent } from "./lib/renderers/toggle/toggle-renderer.component";


// Timepicker (Material 3)
export { NgxTimepickerComponent } from "./lib/renderers/timepicker";

// ─── Icon system ─────────────────────────────────────────────────────────────
export { NgxIconComponent } from "./lib/control/ngx-icon.component";
export { NGX_ICONS } from "./lib/core/icons";
export type { NgxIconName } from "./lib/core/icons";

// Utilities
export { NgxA11yAnnouncer } from "./lib/core/a11y-announcer";
export { filterOptionsByQuery } from "./lib/core/options-utils";
export { ngxFormSerialize } from "./lib/core/utils";

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
  required as ngxRequired
} from "./lib/core/validators";

// ─── Declarative validator directives ────────────────────────────────────────
export {
  NgxDisabledDirective, NgxEmailDirective,
  NgxMaxDirective,
  NgxMaxLengthDirective,
  NgxMinDirective,
  NgxMinLengthDirective,
  NgxPatternDirective,
  NgxRequiredDirective
} from "./lib/validators/directives";

// ─── Angular forms/signals validator re-exports (schema-level) ───────────────
// These are currently not exposed as they were tied to the legacy adapter.
// Declarative validators are preferred via directives.

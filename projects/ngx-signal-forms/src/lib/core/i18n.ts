import { InjectionToken } from "@angular/core";

/**
 * All static UI strings used by ngx-signal-forms renderers.
 * Override by providing `NGX_I18N_MESSAGES` at the root or component level.
 *
 * @example
 * providers: [{ provide: NGX_I18N_MESSAGES, useValue: { ...NGX_I18N_MESSAGES_DEFAULT, noResults: 'Nessun risultato' } }]
 */
export interface NgxI18nMessages {
  readonly searchPlaceholder: string;
  readonly noResults: string;
  readonly colorPresetsHeader: string;
  readonly selectColorPrefix: string;
  readonly timepickerOpenLabel: string;
  readonly timepickerCancel: string;
  readonly timepickerConfirm: string;
  readonly datepickerToggleLabel: string;
  readonly datepickerCancel: string;
  readonly datepickerConfirm: string;
  readonly datepickerSelectFallback: string;
}

/** Default English strings. Replace individual keys by spreading over this. */
export const NGX_I18N_MESSAGES_DEFAULT: NgxI18nMessages = {
  searchPlaceholder: "Search\u2026",
  noResults: "No results",
  colorPresetsHeader: "Presets",
  selectColorPrefix: "Select color",
  timepickerOpenLabel: "Open time picker",
  timepickerCancel: "Cancel",
  timepickerConfirm: "OK",
  datepickerToggleLabel: "Toggle calendar",
  datepickerCancel: "Cancel",
  datepickerConfirm: "OK",
  datepickerSelectFallback: "Select date",
} as const;

/**
 * DI token for UI string overrides.
 * Has a root-level factory so no explicit `provide` is needed for the defaults.
 */
export const NGX_I18N_MESSAGES = new InjectionToken<NgxI18nMessages>(
  "NGX_I18N_MESSAGES",
  { providedIn: "root", factory: () => NGX_I18N_MESSAGES_DEFAULT },
);

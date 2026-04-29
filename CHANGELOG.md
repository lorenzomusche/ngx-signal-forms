# Change Log

All notable changes to the `ngx-signal-forms` library will be documented in this file.

## [2.1.1] - 2026-04-29

### Added

- **`NgxFormArrayComponent`**: Support for dynamic lists in declarative forms.
- **`NgxTextComponent`**: Added `type` and `autocomplete` inputs to support various input types and browser autofill.

### Fixed

- **Select & Multiselect**: 
    - Improved value matching using loose equality and string conversion for better compatibility with numeric/string IDs.
    - Fixed native `select` styling and placeholder visibility in floating label mode.
    - Improved custom trigger template support.
- **Floating Labels**: Refined logic for label positioning and visibility in various states.

### Refactored

- **Core Overlay**: Enhanced `OptionsOverlayControl` and `OverlayPanel` for smoother interaction and better accessibility.
- **Control Logic**: Internal improvements to `ControlDirective` for more robust state management.

## [2.1.0] - 2026-04-14

### Breaking Changes

- **`RAW_FIELD_TREE_SYMBOL`** removed — the power-user escape hatch is no longer exported. Remove any reference to it from consumer code.
- **`NgxFormSubmitEventInternal`** removed — use `NgxFormSubmitEvent<T>` directly.
- **`NgxFieldTree<T>`** no longer wraps `SchemaPathTree<T>` from `@angular/forms/signals`. It is now a locally-defined mapped type; the shape is identical but it no longer leaks Angular internals into the public API surface.

### Added

- **`NgxDisabledDirective`** (`[ngxDisabled]`): declaratively disable a named field inside an `NgxFormComponent` without touching the adapter. Accepts a boolean input with `booleanAttribute` transform.
- **`NGX_FLOATING_LABELS_DEFAULT`** DI token: root-level boolean override for the default state of `ngxFloatingLabels` (default `false`).
- **`NGX_FLOATING_LABELS_DENSITY_DEFAULT`** DI token: root-level number override for the floating-labels density (default `-2` = 48 px).
- **`NGX_I18N_MESSAGES` / `NGX_I18N_MESSAGES_DEFAULT`** tokens + **`NgxI18nMessages`** interface: replace all hard-coded UI strings (aria labels, button captions, etc.) with injectable i18n messages.
- **`NgxOverlayPanelComponent`**: shared overlay panel extracted from renderer implementations; provides consistent positioning, animation and a11y across datepicker, timepicker, select and multiselect.
- **`NgxDeclarativeRegistry`**: new `setDisabled()`, `setReadonly()` and `removeField()` methods — used by directives to control field state declaratively.
- **`NgxFormComponent`**: exposes `removeField()`, `setDisabled()`, `setReadonly()` as public methods.
- **Date utilities** newly exported: `addDays`, `addMonths`, `addYears`, `buildMonthGrid`, `compareDates`, `daysInMonth`, `firstWeekday`, `isDateBetween`, `isDateInRange`, `isSameDay`, `orderDates`, `CalendarCell`, `CalendarDate`.
- **Jest test target**: `ng test ngx-signal-forms` wired up via `@angular-devkit/build-angular:jest`; `tsconfig.spec.json` added.

### Changed

- **`signal-form-adapter.ts` removed**: `NgxDeclarativeAdapter` (in `declarative-form-adapter.ts`) is now the single adapter implementation. No public API change for consumers using the declarative API.
- **`NgxFloatingLabelsDirective`**: default values for `ngxFloatingLabels` and `ngxFloatingLabelsDensity` are now read from the new DI tokens instead of being hardcoded.
- **Renderers** (datepicker, daterange, timepicker, select, multiselect, colors): migrated to `NgxOverlayPanelComponent`, removing duplicated overlay markup and positioning logic from each renderer.
- **`NgxDeclarativeRegistry.addValidators()`** signature tightened: accepts `ReadonlyArray<ValidatorFn<T>>` with a proper generic parameter, eliminating internal `any` casts.

### Reworked

- **Styles**: Complete CSS architecture rewrite using a 3-tier custom-property token system:
  - **Tier 1 – System** (`--ngx-signal-form-sys-color-*`, `--ngx-signal-form-sys-shape-*`, `--ngx-signal-form-sys-typescale-*`): semantic design decisions (color, shape radii, typography scale, state-layer opacities).
  - **Tier 2 – Component** (`--ngx-signal-form-comp-*`): per-component overrides that reference sys tokens.
  - **Tier 3 – Bridge aliases** (`--ngx-primary`, `--ngx-on-surface`, etc.): short-form variables consumed by all component CSS. Fully back-compatible with 2.0.x custom overrides.
- **Styles**: CSS `@layer` stack rationalised to four ordered layers (`ngx.tokens` → `ngx.base` → `ngx.components` → `ngx.themes`), eliminating specificity conflicts and making theme overrides trivially safe.

### Fixed (Styles)

- Dark-mode support consolidated into a single `@media (prefers-color-scheme: dark)` block inside `ngx.tokens` — overrides cascade automatically to all components.
- Reduced-motion support via CSS custom properties (`--ngx-checkbox-transition`, `--ngx-toggle-transition`, etc.) — a single `@media (prefers-reduced-motion)` block disables all animated transitions.
- Theme override files (`ngx-signal-forms-material.css`, `ngx-signal-forms-ios.css`, `ngx-signal-forms-ionic.css`) now operate exclusively inside the `ngx.themes` layer.

## [2.0.3] - 2026-03-30

### Fixed

- **Build**: Fixed path normalization for build artifacts and standardized exports.

## [2.0.2] - 2026-03-30

### Added

- **Styles**: Implemented high-fidelity iOS 26 Liquid Glass material system.
- **Styles**: Safari-optimized density (140px blur, 450% saturation).
- **Styles**: Chrome-brilliance fix with sRGB interpolation and brightness boost.
- **Styles**: Standardized Apple system font stack (-apple-system / SF Pro).
- **Styles**: Enhanced demo card with independent glass layer for overlay stability.

## [2.0.1] - 2026-03-27

### Fixed

- **Multiselect**: Added null checks to prevent errors when the form value is reset to null or undefined.
- **Styles**: Adjusted padding of error messages to improve visual alignment with inputs.

## [2.0.0] - 2026-03-27

### Added

- **New Declarative API**: Introduced `NgxDeclarativeAdapter` for a more flexible and robust form definition.
- **Form Components**:
  - `NgxTimepickerComponent`: Full Material 3 timepicker implementation.
  - `NgxColorsComponent`: Color selection component with Material 3 palette.
  - `NgxSegmentedButtonComponent`: Segmented button toggle.
  - `NgxSliderComponent`: Single and range slider support.
  - `NgxFileComponent`: File upload control.
  - `NgxRadioGroupComponent`: Radio button group.
  - `NgxToggleComponent`: Switch/Toggle control.
- **Core Improvements**:
  - New ISO date/time utility functions (`formatIsoDate`, `parseIsoDate`, `buildTimeString`, `parseTime`).
  - Overlay positioning logic for custom menus and pickers.
  - Accessibility (A11y) announcer service for better screen reader support.
  - Flexible label, prefix, suffix, and supporting text directives.
- **Styles**: Added Material 3, iOS, and Ionic-inspired themes.

### Changed

- **Optimization**: Significant Performance improvements for large-scale forms using Angular Signals.
- **Exports**: Cleaned up the public API to expose only necessary symbols with the `Ngx` prefix.

### Deprecated

- `createSignalFormAdapter`: Now deprecated in favor of the new declarative API. It will be removed in a future major release.

---

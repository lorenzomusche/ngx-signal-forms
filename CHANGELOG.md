# Change Log

All notable changes to the `ngx-signal-forms` library will be documented in this file.

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

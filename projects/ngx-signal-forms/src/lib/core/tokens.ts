import { InjectionToken } from "@angular/core";
import type { NgxDeclarativeRegistry } from "./declarative-form-adapter";
import { NgxFormAdapter, NgxOptionsControl } from "./types";

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by renderer components to resolve FieldRefs.
 */
export const NGX_FORM_ADAPTER = new InjectionToken<
  NgxFormAdapter<Record<string, unknown>>
>("NGX_FORM_ADAPTER");

/**
 * When provided on an element injector, renderers display errors
 * inline next to the label rather than as a block below the input.
 */
export const NGX_INLINE_ERRORS = new InjectionToken<boolean>(
  "NGX_INLINE_ERRORS",
);

/**
 * Provided by select/multiselect renderers to allow conditional directives
 * to push filtered options back into the component.
 */
export const NGX_OPTIONS_CONTROL = new InjectionToken<NgxOptionsControl<unknown>>(
  "NGX_OPTIONS_CONTROL",
);

/**
 * Provided by NgxFloatingLabelsDirective to enable floating labels globally on a form.
 */
export const NGX_FLOATING_LABELS = new InjectionToken<
  import("../form/ngx-floating-labels.directive").NgxFloatingLabelsDirective
>("NGX_FLOATING_LABELS");

/**
 * Global default for whether floating labels are enabled.
 * Override at application root to change the default for all forms.
 * Defaults to `false` (floating labels opt-in via `ngxFloatingLabels` directive).
 */
export const NGX_FLOATING_LABELS_DEFAULT = new InjectionToken<boolean>(
  "NGX_FLOATING_LABELS_DEFAULT",
  { providedIn: "root", factory: () => false },
);

/**
 * Global default density for floating labels.
 * Replicates M3 density semantics: 0 = standard 56px, negative values compact.
 * Defaults to `-2` (48px, balanced compactness).
 */
export const NGX_FLOATING_LABELS_DENSITY_DEFAULT = new InjectionToken<number>(
  "NGX_FLOATING_LABELS_DENSITY_DEFAULT",
  { providedIn: "root", factory: () => -2 },
);

/**
 * Provided by NgxFormComponent in declarative mode (no explicit [adapter] input).
 * Validator directives inject this to register their rules on specific fields.
 */
export const NGX_DECLARATIVE_REGISTRY = new InjectionToken<NgxDeclarativeRegistry>(
  "NGX_DECLARATIVE_REGISTRY",
);


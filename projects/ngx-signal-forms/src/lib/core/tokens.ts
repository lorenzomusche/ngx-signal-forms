import { InjectionToken } from "@angular/core";
import { NgxFormAdapter } from "./types";
import { NgxOptionsControl } from "./types";
import type { NgxDeclarativeRegistry } from "./declarative-form-adapter";

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
 * Provided by NgxFormComponent in declarative mode (no explicit [adapter] input).
 * Validator directives inject this to register their rules on specific fields.
 */
export const NGX_DECLARATIVE_REGISTRY = new InjectionToken<NgxDeclarativeRegistry>(
  "NGX_DECLARATIVE_REGISTRY",
);


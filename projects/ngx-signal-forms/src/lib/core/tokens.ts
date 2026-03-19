import { InjectionToken } from "@angular/core";
import { NgxFormAdapter } from "./types";

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by renderer components to resolve FieldRefs.
 */
export const NGX_FORM_ADAPTER = new InjectionToken<
  NgxFormAdapter<Record<string, unknown>>
>("NGX_FORM_ADAPTER");

/**
 * Symbol for accessing the raw Angular FieldTree from NgxFormSubmitEvent.
 * Power-user escape hatch — use sparingly.
 */
export const RAW_FIELD_TREE_SYMBOL: unique symbol =
  Symbol("NGX_RAW_FIELD_TREE");

/**
 * When provided on an element injector, renderers display errors
 * inline next to the label rather than as a block below the input.
 */
export const NGX_INLINE_ERRORS = new InjectionToken<boolean>(
  "NGX_INLINE_ERRORS",
);

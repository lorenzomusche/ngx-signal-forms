import { InjectionToken } from '@angular/core';
import {
  NgxFormAdapter,
  NgxFieldRef,
  NgxControlRendererConfig,
  NgxFormContext,
  NgxFieldRegistration,
} from './types';

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by ControlDirective to register field state with the form.
 */
export const NGX_FORM_REGISTRY = new InjectionToken<NgxFormRegistry>(
  'NGX_FORM_REGISTRY'
);

/** Interface implemented by SignalFormAdapter (the registry). */
export interface NgxFormRegistry {
  register<TValue>(field: NgxFieldRegistration<TValue>): void;
}

/**
 * Scoped to NgxFormComponent via providers[].
 * Provides form-level state (valid, submitting, etc.) to descendant controls.
 */
export const NGX_FORM_CONTEXT = new InjectionToken<NgxFormContext>(
  'NGX_FORM_CONTEXT'
);

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by ControlComponent to resolve FieldRefs.
 */
export const NGX_FORM_ADAPTER = new InjectionToken<NgxFormAdapter<object>>(
  'NGX_FORM_ADAPTER'
);

/**
 * Provided by each renderer directive via useExisting.
 * ControlComponent injects this with { self: true } to get
 * the concrete renderer sitting on the same host element.
 */
export const NGX_CONTROL_RENDERER = new InjectionToken<NgxControlRenderer<unknown>>(
  'NGX_CONTROL_RENDERER'
);

/**
 * Contract every renderer directive must implement.
 * ControlComponent calls bind() passing the resolved FieldRef + config.
 */
export interface NgxControlRenderer<TValue = unknown> {
  bind(fieldRef: NgxFieldRef<TValue>, config: NgxControlRendererConfig): void;
}

/**
 * Symbol for accessing the raw Angular FieldTree from NgxFormSubmitEvent.
 * Power-user escape hatch — use sparingly.
 */
export const RAW_FIELD_TREE_SYMBOL: unique symbol = Symbol('NGX_RAW_FIELD_TREE');

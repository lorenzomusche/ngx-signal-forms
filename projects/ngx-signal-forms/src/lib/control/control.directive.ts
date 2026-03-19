import {
  Directive,
  inject,
  InjectionToken,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { NGX_FORM_REGISTRY } from '../core/tokens';
import { NgxControlState, NgxFieldRegistration, ValidatorFn } from '../core/types';

/** Symbol for internal raw-field access (adapter/controllers only) */
export const RAW_CONTROL_SYMBOL: unique symbol = Symbol('NgxRawControl');

/**
 * Abstract base directive for all renderer directives.
 * Registers the field with the parent SignalFormAdapter.
 */
@Directive()
export abstract class ControlDirective<TValue = unknown> implements OnInit {
  protected readonly registry = inject(NGX_FORM_REGISTRY, { optional: true });

  abstract readonly fieldName: string;
  abstract readonly value: WritableSignal<TValue>;
  abstract readonly validators: readonly ValidatorFn<TValue>[];

  readonly errors: WritableSignal<readonly string[]> = signal([]);
  readonly touched: WritableSignal<boolean> = signal(false);
  readonly dirty: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    if (!this.registry) return;
    const reg: NgxFieldRegistration<TValue> = {
      name: this.fieldName,
      value: this.value,
      errors: this.errors,
      touched: this.touched,
      dirty: this.dirty,
      validators: this.validators,
    };
    this.registry.register(reg);
  }

  markAsTouched(): void { this.touched.set(true); }
  markAsDirty(): void { this.dirty.set(true); }

  /** Raw state accessor — for adapter/controllers via Symbol */
  get [RAW_CONTROL_SYMBOL](): NgxControlState<TValue> {
    return {
      value: this.value(),
      errors: this.errors,
      touched: this.touched,
      dirty: this.dirty,
    };
  }
}

/** DI token: ControlComponent uses this to inject the active renderer */
export const NGX_CONTROL_DIRECTIVE = new InjectionToken<ControlDirective>(
  'NGX_CONTROL_DIRECTIVE'
);

/**
 * signal-form-adapter.ts
 *
 * THE ONLY FILE that imports from @angular/forms/signals.
 * If Angular changes the Signal Forms API, only this file needs updating.
 */
import { computed, Signal, signal, WritableSignal } from '@angular/core';
import {
  form,
  required as ngRequired,
  email as ngEmail,
  min as ngMin,
  max as ngMax,
  minLength as ngMinLength,
  maxLength as ngMaxLength,
  pattern as ngPattern,
  debounce as ngDebounce,
} from '@angular/forms/signals';

import {
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFieldRef,
  NgxFieldState,
  NgxFieldTree,
  NgxSubmitMode,
  NgxFormSubmitEvent,
} from '../core/types';
import { RAW_FIELD_TREE_SYMBOL } from '../core/tokens';

// ─── Validator re-exports ────────────────────────────────────────────────────────────
// Consumers import validators from us, never from @angular/forms/signals

export const required = ngRequired;
export const email = ngEmail;
export const min = ngMin;
export const max = ngMax;
export const minLength = ngMinLength;
export const maxLength = ngMaxLength;
export const pattern = ngPattern;
export const debounce = ngDebounce;

// ─── Adapter Factory ────────────────────────────────────────────────────────────

export interface SignalFormAdapterOptions<T extends object> {
  model: Signal<T>;
  schema?: (schemaPath: NgxFieldTree<T>) => void;
  submitMode: NgxSubmitMode;
}

export type NgxFormAdapterWithEvent<T extends object> =
  NgxFormAdapter<T> & {
    buildSubmitEvent(value: T): NgxFormSubmitEvent<T>;
  };

export function createSignalFormAdapter<T extends object>(
  options: SignalFormAdapterOptions<T>
): NgxFormAdapterWithEvent<T> {
  const { model, schema, submitMode } = options;

  // ① Create FieldTree via Angular's form() — isolated here
  const rawFieldTree = schema
    ? form(model as WritableSignal<T>, schema as (path: any) => void)
    : form(model as WritableSignal<T>);

  const fieldKeys = Object.keys(rawFieldTree) as Array<keyof T>;

  // ② Internal writable signals
  const _submitting = signal(false);
  const _submitCount = signal(0);
  const _lastSubmitErrors = signal<ReadonlyArray<NgxFormError>>([]);

  // ③ Derived signals from all fields
  const _valid = computed(() =>
    fieldKeys.every((k) => (rawFieldTree[k] as any)().valid())
  );
  const _pending = computed(() =>
    fieldKeys.some((k) => (rawFieldTree[k] as any)().pending())
  );
  const _canSubmit = computed(() => {
    if (_submitting()) return false;
    if (submitMode === 'valid-only') return _valid() && !_pending();
    if (submitMode === 'always') return true;
    return false; // 'manual'
  });

  const state: NgxFormState = {
    valid: _valid,
    pending: _pending,
    submitting: _submitting.asReadonly(),
    submitCount: _submitCount.asReadonly(),
    canSubmit: _canSubmit,
    lastSubmitErrors: _lastSubmitErrors.asReadonly(),
  };

  // ④ Wrap Angular FieldRef -> NgxFieldRef (stable contract)
  function wrapFieldRef<TValue>(angularRef: any): NgxFieldRef<TValue> {
    return (): NgxFieldState<TValue> => {
      const s = angularRef();
      return {
        value: s.value,
        valid: computed(() => s.valid()),
        touched: computed(() => s.touched()),
        dirty: computed(() => s.dirty()),
        disabled: computed(() => s.disabled()),
        readonly: computed(() => s.readonly()),
        pending: computed(() => s.pending()),
        errors: computed(() =>
          (s.errors() ?? []).map((e: any) => ({
            kind: e.kind,
            message: e.message,
            payload: e.payload,
          }))
        ),
      };
    };
  }

  function getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null {
    const ref = rawFieldTree[name];
    return ref ? wrapFieldRef<T[K]>(ref) : null;
  }

  function errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>> {
    const ref = rawFieldTree[path as keyof T];
    if (!ref) {
      return computed(() => _lastSubmitErrors().filter((e) => e.path === path));
    }
    return computed(() =>
      ((ref as any)().errors() ?? []).map((e: any) => ({
        path: path as string,
        kind: e.kind,
        message: e.message,
        payload: e.payload,
      }))
    );
  }

  function markAllTouched(): void {
    fieldKeys.forEach((k) => {
      const s = (rawFieldTree[k] as any)();
      if (!s.touched()) {
        s.value.set(s.value());
      }
    });
  }

  async function submit(
    action: (value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void
  ): Promise<void> {
    if (submitMode === 'valid-only' && !_valid()) {
      markAllTouched();
      return;
    }
    if (_submitting()) return;

    _submitting.set(true);
    _submitCount.update((c) => c + 1);
    _lastSubmitErrors.set([]);

    try {
      const value = model();
      const errors = await action(value);
      if (Array.isArray(errors) && errors.length > 0) {
        _lastSubmitErrors.set(errors);
      }
    } finally {
      _submitting.set(false);
    }
  }

  function buildSubmitEvent(value: T): NgxFormSubmitEvent<T> {
    return {
      value,
      valid: _valid(),
      errors: _lastSubmitErrors(),
      [RAW_FIELD_TREE_SYMBOL]: rawFieldTree,
    } as NgxFormSubmitEvent<T>;
  }

  return { state, getField, errorsFor, submit, markAllTouched, buildSubmitEvent };
}

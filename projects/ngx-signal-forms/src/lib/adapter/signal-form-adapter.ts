/**
 * signal-form-adapter.ts
 *
 * THE ONLY FILE that imports from @angular/forms/signals.
 * If Angular changes the Signal Forms API, only this file needs updating.
 */
import { computed, Signal, signal, WritableSignal } from "@angular/core";
import {
  form,
  debounce as ngDebounce,
  email as ngEmail,
  max as ngMax,
  maxLength as ngMaxLength,
  min as ngMin,
  minLength as ngMinLength,
  pattern as ngPattern,
  required as ngRequired,
} from "@angular/forms/signals";

import {
  NgxFieldError,
  NgxFieldRef,
  NgxFieldState,
  NgxFieldTree,
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEventInternal,
  NgxSubmitMode,
  RAW_FIELD_TREE_SYMBOL,
} from "../core/types";

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

// ─── Internal type for raw Angular field state ───────────────────────────────────

/** Shape returned by Angular's form() field signal — typed as unknown to avoid any. */
interface RawAngularFieldState {
  readonly value: WritableSignal<unknown>;
  readonly valid: Signal<boolean>;
  readonly touched: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly readonly: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly errors: Signal<ReadonlyArray<Record<string, unknown>> | null>;
}

// ─── Adapter Factory ────────────────────────────────────────────────────────────

/** Configuration for {@link createSignalFormAdapter}. */
export interface SignalFormAdapterOptions<T extends object> {
  /** Writable signal holding the form model. */
  readonly model: WritableSignal<T>;
  /** Schema function that declares validators via Angular's schema API. */
  readonly schema?: (schemaPath: NgxFieldTree<T>) => void;
  /** Controls when the form may be submitted. */
  readonly submitMode: NgxSubmitMode;
}

/** Adapter with an additional `buildSubmitEvent` helper. */
export type NgxFormAdapterWithEvent<T extends object> = NgxFormAdapter<T> & {
  buildSubmitEvent(value: T): NgxFormSubmitEventInternal<T>;
};

/** Create a signal-driven form adapter from the given options. */
export function createSignalFormAdapter<T extends object>(
  options: SignalFormAdapterOptions<T>,
): NgxFormAdapterWithEvent<T> {
  const { model, schema, submitMode } = options;

  // ① Create FieldTree via Angular's form() — isolated here
  const rawFieldTree = (schema
    ? form(model, schema)
    : form(model)) as unknown as Record<string, () => RawAngularFieldState>;

  const fieldKeys = Object.keys(rawFieldTree) as Array<keyof T & string>;

  // ② Internal writable signals
  const _submitting = signal(false);
  const _submitCount = signal(0);
  const _lastSubmitErrors = signal<ReadonlyArray<NgxFormError>>([]);

  // ③ Derived signals from all fields
  const _valid = computed(() =>
    fieldKeys.every((k) => {
      const ref = rawFieldTree[k];
      return ref !== undefined ? ref().valid() : true;
    }),
  );
  const _pending = computed(() =>
    fieldKeys.some((k) => {
      const ref = rawFieldTree[k];
      return ref !== undefined ? ref().pending() : false;
    }),
  );
  const _canSubmit = computed(() => {
    if (_submitting()) return false;
    if (submitMode === "valid-only") return _valid() && !_pending();
    if (submitMode === "always") return true;
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

  // ④ Default error messages by kind (when Angular doesn't provide one)
  const defaultMessages: Record<
    string,
    (e: Record<string, unknown>) => string
  > = {
    required: () => "This field is required",
    email: () => "Invalid email address",
    min: (e) => `Value must be at least ${String(e["min"] ?? "")}`,
    max: (e) => `Value must be at most ${String(e["max"] ?? "")}`,
    minLength: (e) =>
      `Must be at least ${String(e["minLength"] ?? "")} characters`,
    maxLength: (e) =>
      `Must be at most ${String(e["maxLength"] ?? "")} characters`,
    pattern: () => "Invalid format",
  };

  function resolveErrorMessage(e: Record<string, unknown>): string {
    const message = e["message"];
    if (typeof message === "string" && message.length > 0) return message;

    const kind = String(e["kind"] ?? "");
    const fallback = defaultMessages[kind];
    return fallback ? fallback(e) : kind;
  }

  // ⑤ Memoized field ref cache
  const fieldCache = new Map<string, NgxFieldRef<unknown>>();

  function wrapFieldRef<TValue>(
    angularRef: () => RawAngularFieldState,
  ): NgxFieldRef<TValue> {
    const rawState = angularRef();

    const wrappedErrors = computed<ReadonlyArray<NgxFieldError>>(() => {
      const raw = rawState.errors() ?? [];
      return raw.map((e: Record<string, unknown>) => ({
        kind: String(e["kind"] ?? ""),
        message: resolveErrorMessage(e),
        payload: e["payload"],
      }));
    });

    // Bridge touched/dirty: start from Angular's value, allow local override
    const _touched = signal(rawState.touched());
    const _dirty = signal(rawState.dirty());

    const fieldState: NgxFieldState<TValue> = {
      value: rawState.value as WritableSignal<TValue>,
      valid: rawState.valid,
      touched: _touched,
      dirty: _dirty,
      disabled: rawState.disabled,
      readonly: rawState.readonly,
      pending: rawState.pending,
      errors: wrappedErrors,
    };

    return () => fieldState;
  }

  function getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null {
    const key = name as string;
    const cached = fieldCache.get(key);
    if (cached) return cached as NgxFieldRef<T[K]>;

    const ref = rawFieldTree[key];
    if (!ref) return null;

    const wrapped = wrapFieldRef<T[K]>(ref);
    fieldCache.set(key, wrapped as NgxFieldRef<unknown>);
    return wrapped;
  }

  function getValue(): T {
    return model();
  }

  function errorsFor(
    path: keyof T | string,
  ): Signal<ReadonlyArray<NgxFormError>> {
    const key = path as string;
    const fieldRef = getField(key as keyof T);
    if (!fieldRef) {
      return computed(() =>
        _lastSubmitErrors().filter((e: NgxFormError) => e.path === key),
      );
    }
    return computed(() =>
      fieldRef()
        .errors()
        .map((e: NgxFieldError) => ({
          path: key,
          kind: e.kind,
          message: e.message,
          payload: e.payload,
        })),
    );
  }

  function markAllTouched(): void {
    for (const k of fieldKeys) {
      const ref = getField(k as keyof T);
      if (ref) {
        ref().touched.set(true);
      }
    }
  }

  async function submit(
    action: (
      value: T,
    ) => Promise<NgxFormError[] | void> | NgxFormError[] | void,
  ): Promise<void> {
    if (submitMode === "valid-only" && !_valid()) {
      markAllTouched();
      return;
    }
    if (_submitting()) return;

    _submitting.set(true);
    _submitCount.update((count: number) => count + 1);
    _lastSubmitErrors.set([]);

    try {
      const value = model();
      const errors = await action(value);
      if (Array.isArray(errors) && errors.length > 0) {
        _lastSubmitErrors.set(errors);
      }
    } catch (e: unknown) {
      _lastSubmitErrors.set([
        { path: null, kind: "unknown", message: String(e) },
      ]);
    } finally {
      _submitting.set(false);
    }
  }

  function buildSubmitEvent(value: T): NgxFormSubmitEventInternal<T> {
    return {
      value,
      valid: _valid(),
      errors: _lastSubmitErrors(),
      [RAW_FIELD_TREE_SYMBOL]: rawFieldTree,
    };
  }

  return {
    state,
    getValue,
    getField,
    errorsFor,
    submit,
    markAllTouched,
    buildSubmitEvent,
  };
}

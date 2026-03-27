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

// Module-level registry and key tracker for required-field detection.
// We use a stack so nested forms still work correctly.
const _requiredRegistryStack: Array<Set<string>> = [];

function _getActiveRequiredRegistry(): Set<string> | undefined {
  return _requiredRegistryStack[_requiredRegistryStack.length - 1];
}

// Tracks the last property name accessed on our schema proxy.
// Set by the `pathTree` Proxy's `get` trap, consumed by `ngxSchemaRequired`.
let _lastAccessedKey: string | undefined;

// ─── Validator re-exports ────────────────────────────────────────────────────────────
// Consumers import validators from us, never from @angular/forms/signals

/**
 * Drop-in replacement for Angular's `required` schema validator.
 * When used with `ngx-signal-forms`, the label asterisk will always be
 * visible — even after the user fills the field.
 *
 * Usage:
 *   ngxSchemaRequired(schema.firstName)
 */
export const ngxSchemaRequired = (path: any) => {
  // The pathTree Proxy records the last property name accessed
  // (e.g. 'firstName') immediately before this call. We consume it here.
  const registry = _getActiveRequiredRegistry();
  if (registry && _lastAccessedKey) {
    registry.add(_lastAccessedKey);
    _lastAccessedKey = undefined; // Consume so it doesn't bleed into the next call
  }
  return ngRequired(path); // Pass the REAL Angular path node — unmodified
};
export const ngxSchemaEmail = ngEmail;
export const ngxSchemaMin = ngMin;
export const ngxSchemaMax = ngMax;
export const ngxSchemaMinLength = ngMinLength;
export const ngxSchemaMaxLength = ngMaxLength;
export const ngxSchemaPattern = ngPattern;
export const ngxSchemaDebounce = ngDebounce;


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

/** Create a signal-driven form adapter from the given options. 
 * @deprecated since 2.0.0, use the new declarative API instead
*/
export function createSignalFormAdapter<T extends object>(
  options: SignalFormAdapterOptions<T>,
): NgxFormAdapter<T> {
  const { model, schema, submitMode } = options;

  // Capture initial value for reset()
  const _initialValue = { ...model() };

  const requiredFields = new Set<string>();

  // ① Create FieldTree via Angular's form() — isolated here.
  // We pass the REAL pathTree untouched to schema (so Angular validators work),
  // but we pre-build a Map<pathObject, fieldKey> so ngxSchemaRequired can
  // identify which field was marked required by comparing object identity.
  const rawFieldTree = (schema
    ? form(model, (pathTree: any) => {
      // Wrap pathTree in a thin Proxy that records which property is accessed.
      // The Proxy does NOT modify the returned value — it returns the REAL
      // Angular FieldPathNode so all validators work without modification.
      // ngxSchemaRequired reads `_lastAccessedKey` to identify the field name.
      const tracked = new Proxy(pathTree, {
        get(target, prop, receiver) {
          if (typeof prop === "string") {
            _lastAccessedKey = prop; // Record property name (e.g. 'firstName')
          }
          return Reflect.get(target, prop, receiver); // REAL value — unmodified
        },
      });

      const registry = new Set<string>();
      _requiredRegistryStack.push(registry);
      try {
        schema(tracked); // user accesses tracked.firstName → key recorded
      } finally {
        _requiredRegistryStack.pop();
        _lastAccessedKey = undefined; // Clean up
      }

      // Merge into outer requiredFields
      registry.forEach(k => requiredFields.add(k));
    })
    : form(model)) as unknown as Record<string, () => RawAngularFieldState>;


  // ② Internal writable signals
  const _submitting = signal(false);
  const _submitCount = signal(0);
  const _lastSubmitErrors = signal<ReadonlyArray<NgxFormError>>([]);

  // ② Reactive value signal
  const value = computed(() => model());

  // ③ Derived signals from all fields
  // Note: we use Object.keys(rawFieldTree) directly in computations to avoid circular init issues
  const _valid = computed(() =>
    Object.keys(rawFieldTree).every((k) => {
      const ref = rawFieldTree[k];
      return ref !== undefined ? ref().valid() : true;
    }),
  );
  const _pending = computed(() =>
    Object.keys(rawFieldTree).some((k) => {
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
    name: string,
    angularRef: () => RawAngularFieldState,
  ): NgxFieldRef<TValue> {
    const rawState = angularRef();
    const _touched = signal(rawState.touched());
    const _dirty = signal(rawState.dirty());

    const wrappedErrors = computed<ReadonlyArray<NgxFieldError>>(() => {
      const raw = rawState.errors() ?? [];
      return raw.map((e: Record<string, unknown>) => ({
        kind: String(e["kind"] ?? ""),
        message: resolveErrorMessage(e),
        payload: e["payload"],
      }));
    });

    // We deduce 'required' by checking the marked set OR if it currently has a required error
    const isRequired = computed(() => {
      if (requiredFields.has(name)) return true;
      const errs = wrappedErrors();
      return errs.some(e => e.kind === "required");
    });



    const fieldState: NgxFieldState<TValue> = {
      value: rawState.value as WritableSignal<TValue>,
      valid: rawState.valid,
      touched: _touched,
      dirty: _dirty,
      disabled: rawState.disabled,
      readonly: rawState.readonly,
      pending: rawState.pending,
      required: isRequired,
      errors: wrappedErrors,
    };

    return () => fieldState;
  }

  function getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null {
    const rawRef = rawFieldTree[name as string];
    if (!rawRef) return null;

    let memo = fieldCache.get(name as string);
    if (!memo) {
      memo = wrapFieldRef(name as string, rawRef);
      fieldCache.set(name as string, memo);
    }
    return memo as NgxFieldRef<T[K]>;
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
    const keys = Object.keys(rawFieldTree);
    for (const k of keys) {
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
    if (submitMode === "manual" || (submitMode === "valid-only" && !_valid())) {
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

  function buildSubmitEvent(snapshot: T): NgxFormSubmitEventInternal<T> {
    return {
      value: snapshot,
      valid: _valid(),
      errors: _lastSubmitErrors(),
      [RAW_FIELD_TREE_SYMBOL]: rawFieldTree,
    };
  }

  function patchValue(partial: Partial<T>): void {
    model.update(v => ({ ...v, ...partial }));
  }

  function setValue(newValue: T): void {
    model.set(newValue);
  }

  function reset(): void {
    model.set({ ..._initialValue } as T);
    // Reset touched/dirty for all wrapped fields
    fieldCache.forEach((ref) => {
      const state = ref();
      state.touched.set(false);
      state.dirty.set(false);
    });
  }

  return {
    state,
    value,
    getValue,
    getField,
    errorsFor,
    submit,
    markAllTouched,
    buildSubmitEvent,
    patchValue,
    setValue,
    reset,
  };
}

import { computed, signal, Signal, untracked, WritableSignal } from "@angular/core";
import {
  NgxFieldError,
  NgxFieldRef,
  NgxFieldState,
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEvent,
  NgxSubmitMode,
  ValidatorFn,
} from "./types";

// ...existing code...


// ─── Registry interface ───────────────────────────────────────────────────────

export interface NgxDeclarativeRegistry {
  /**
   * Registers type-specific validators for a named field.
   * The generic parameter `T` lets directive call sites pass typed validators
   * without casting. The adapter stores them as `ValidatorFn<unknown>` internally
   * (safe because the field value will always be of the correct type at runtime).
   */
  addValidators<T>(name: string, validators: ReadonlyArray<ValidatorFn<T>>, isRequired?: boolean): void;
  setInitialValue(name: string, value: unknown): void;
  setDisabled(name: string, disabled: Signal<boolean>): void;
  setReadonly(name: string, readonly: Signal<boolean>): void;
  removeField(name: string): void;
}

// ─── Internal field record ────────────────────────────────────────────────────

interface DeclarativeFieldRecord {
  readonly state: NgxFieldState<unknown>;
  readonly validators: WritableSignal<ReadonlyArray<ValidatorFn<unknown>>>;
  readonly required: WritableSignal<boolean>;
  readonly disabled: WritableSignal<Signal<boolean>>;
  readonly readonly: WritableSignal<Signal<boolean>>;
}

// ─── Declarative Adapter ──────────────────────────────────────────────────────

/**
 * Adapter used when <ngx-form> is used without an explicit [adapter] input.
 *
 * Fields are created lazily on first getField() call.
 * Validators are registered by directive instructions and update the
 * reactive `validators` signal, so `errors` recomputes automatically.
 */
export class NgxDeclarativeAdapter
  implements NgxFormAdapter<Record<string, unknown>>, NgxDeclarativeRegistry {
  private readonly _fields = new Map<string, DeclarativeFieldRecord>();
  /** Reactive list of field names — drives state.valid computation. */
  private readonly _fieldNames = signal<readonly string[]>([]);
  private readonly _initialValues = new Map<string, unknown>();

  private readonly _submitting = signal(false);
  private readonly _submitCount = signal(0);
  private readonly _lastSubmitErrors = signal<ReadonlyArray<NgxFormError>>([]);

  readonly state: NgxFormState;

  /** Reactive signal emitting the current form value on every field change. */
  readonly value: Signal<Record<string, unknown>>;

  constructor(
    private readonly _formValue: Signal<Record<string, unknown> | undefined>,
    private readonly _submitMode: Signal<NgxSubmitMode> = signal("valid-only"),
  ) {
    const valid = computed(() =>
      this._fieldNames().length === 0
        ? true
        : this._fieldNames().every(n => this._fields.get(n)?.state.valid() ?? true),
    );
    this.state = {
      valid,
      pending: signal(false),
      submitting: this._submitting,
      submitCount: this._submitCount,
      canSubmit: computed(() => {
        if (this._submitting()) return false;
        const mode = this._submitMode();
        if (mode === "valid-only") return valid();
        if (mode === "always") return true;
        return false; // manual
      }),
      lastSubmitErrors: this._lastSubmitErrors,
    };
    this.value = computed(() =>
      Object.fromEntries(
        this._fieldNames().map(n => [n, this._fields.get(n)?.state.value() ?? null]),
      ),
    );
  }

  /**
   * Removes a field from the registry and updates the reactive field name list.
   * Called automatically when controls are destroyed via DestroyRef.
   */
  removeField(name: string): void {
    if (this._fields.has(name)) {
      this._fields.delete(name);
      untracked(() => this._fieldNames.update(names => names.filter(n => n !== name)));
      this._initialValues.delete(name);
    }
  }

  // ── NgxDeclarativeRegistry ──────────────────────────────────────────────────

  setInitialValue(name: string, value: unknown): void {
    this._initialValues.set(name, value);
    // Update existing field value if already created
    const rec = this._fields.get(name);
    if (rec) {
      (rec.state.value as WritableSignal<unknown>).set(value);
    }
  }

  addValidators<T>(name: string, validators: ReadonlyArray<ValidatorFn<T>>, isRequired = false): void {
    const rec = this._getOrCreate(name);
    // Cast from ValidatorFn<T> to ValidatorFn<unknown> at the storage boundary.
    // Safe: the field value is always of type T at runtime (the directive and field
    // are wired together by the `name` attribute). TypeScript cannot verify this
    // without contravariant widening support, so we cast once here.
    rec.validators.update(v => [...v, ...(validators as ReadonlyArray<ValidatorFn<unknown>>)]);
    if (isRequired) rec.required.set(true);
  }

  setDisabled(name: string, disabled: Signal<boolean>): void {
    this._getOrCreate(name).disabled.set(disabled);
  }

  setReadonly(name: string, readonly: Signal<boolean>): void {
    this._getOrCreate(name).readonly.set(readonly);
  }

  // ── NgxFormAdapter ──────────────────────────────────────────────────────────

  getField(name: string): NgxFieldRef<unknown> | null {
    const rec = this._getOrCreate(name);
    return () => rec.state;
  }

  getValue(): Record<string, unknown> {
    return Object.fromEntries(
      Array.from(this._fields.entries()).map(([n, r]) => [n, r.state.value()]),
    );
  }

  errorsFor(path: string): Signal<ReadonlyArray<NgxFormError>> {
    return computed(() =>
      (this._fields.get(path)?.state.errors() ?? []).map(e => ({
        ...e,
        path,
      })),
    );
  }

  markAllTouched(): void {
    this._fields.forEach(r => (r.state.touched as WritableSignal<boolean>).set(true));
  }

  patchValue(partial: Partial<Record<string, unknown>>): void {
    for (const [key, val] of Object.entries(partial)) {
      const rec = this._getOrCreate(key);
      (rec.state.value as WritableSignal<unknown>).set(val);
    }
  }

  setValue(value: Record<string, unknown>): void {
    for (const [key, val] of Object.entries(value)) {
      const rec = this._getOrCreate(key);
      (rec.state.value as WritableSignal<unknown>).set(val);
    }
  }

  reset(): void {
    this._fields.forEach((rec, name) => {
      // Only restore explicit per-control [initialValue]; [formValue] is a prefill seed,
      // not a reset target. Fields without an explicit initialValue go back to null.
      const iv = this._initialValues.has(name)
        ? this._initialValues.get(name)
        : null;
      (rec.state.value as WritableSignal<unknown>).set(iv as unknown);
      (rec.state.touched as WritableSignal<boolean>).set(false);
      (rec.state.dirty as WritableSignal<boolean>).set(false);
    });
  }

  buildSubmitEvent(
    value: Record<string, unknown>,
  ): NgxFormSubmitEvent<Record<string, unknown>> {
    return {
      value,
      valid: this.state.valid(),
      errors: [...this._lastSubmitErrors()],
    };
  }

  async submit(
    action: (
      v: Record<string, unknown>,
    ) => Promise<NgxFormError[] | void> | NgxFormError[] | void,
  ): Promise<void> {
    if (!this.state.canSubmit()) {
      this.markAllTouched();
      return;
    }
    this._submitting.set(true);
    this._submitCount.update(n => n + 1);
    try {
      const errors = await action(this.getValue());
      this._lastSubmitErrors.set(errors ?? []);
    } catch (e: unknown) {
      this._lastSubmitErrors.set([{
        path: null,
        kind: 'unknown',
        message: e instanceof Error ? e.message : String(e),
      }]);
    } finally {
      this._submitting.set(false);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _getOrCreate(name: string): DeclarativeFieldRecord {
    let rec = this._fields.get(name);
    if (!rec) {
      rec = this._createFieldRecord(name);
      this._fields.set(name, rec);
      untracked(() => this._fieldNames.update(names => [...names, name]));
    }
    return rec;
  }

  private _createFieldRecord(name: string): DeclarativeFieldRecord {
    // Use untracked to avoid creating reactive dependencies on _formValue
    // when called from inside a computed.
    const initialValue =
      this._initialValues.get(name) ??
      untracked(() => this._formValue())?.[name] ??
      null;

    const value = signal<unknown>(initialValue);
    const touched = signal(false);
    const dirty = signal(false);
    const required = signal(false);
    // Dynamic signals provided by directives, defaulting to false.
    const disabledSignal = signal<Signal<boolean>>(signal(false));
    const readonlySignal = signal<Signal<boolean>>(signal(false));

    const validators = signal<ReadonlyArray<ValidatorFn<unknown>>>([]);

    const errors = computed(() =>
      validators().flatMap(v =>
        v(value()).map(
          message => ({ kind: "validation", message }) as NgxFieldError,
        ),
      ),
    );

    const state: NgxFieldState<unknown> = {
      value,
      touched,
      dirty,
      required: required.asReadonly(),
      valid: computed(() => errors().length === 0),
      errors,
      disabled: computed(() => disabledSignal()()),
      readonly: computed(() => readonlySignal()()),
      pending: signal(false),
    };

    return {
      state,
      validators,
      required,
      disabled: disabledSignal,
      readonly: readonlySignal,
    };
  }
}

import { computed, signal, Signal, untracked, WritableSignal } from "@angular/core";
import {
  NgxFieldError,
  NgxFieldRef,
  NgxFieldState,
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEventInternal,
  NgxSubmitMode,
  ValidatorFn,
} from "./types";
import { RAW_FIELD_TREE_SYMBOL } from "./types";

// ─── Registry interface ───────────────────────────────────────────────────────

/**
 * Provided by NgxFormComponent in declarative mode.
 * Validator directives inject this to register their rules.
 */
export interface NgxDeclarativeRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addValidators(name: string, validators: ValidatorFn<any>[], isRequired?: boolean): void;
  setInitialValue(name: string, value: unknown): void;
}

// ─── Internal field record ────────────────────────────────────────────────────

interface DeclarativeFieldRecord {
  state: NgxFieldState<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validators: WritableSignal<ValidatorFn<any>[]>;
  required: WritableSignal<boolean>;
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
  implements NgxFormAdapter<Record<string, unknown>>, NgxDeclarativeRegistry
{
  private readonly _fields = new Map<string, DeclarativeFieldRecord>();
  /** Reactive list of field names — drives state.valid computation. */
  private readonly _fieldNames = signal<string[]>([]);
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
        : this._fieldNames().every(n => this._fields.get(n)!.state.valid()),
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
        this._fieldNames().map(n => [n, this._fields.get(n)!.state.value()]),
      ),
    );
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addValidators(name: string, validators: ValidatorFn<any>[], isRequired = false): void {
    const rec = this._getOrCreate(name);
    rec.validators.update(v => [...v, ...validators]);
    if (isRequired) rec.required.set(true);
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
  ): NgxFormSubmitEventInternal<Record<string, unknown>> {
    return {
      value,
      valid: this.state.valid(),
      errors: [...this._lastSubmitErrors()],
      [RAW_FIELD_TREE_SYMBOL]: null,
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
    } finally {
      this._submitting.set(false);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _getOrCreate(name: string): DeclarativeFieldRecord {
    if (!this._fields.has(name)) {
      // Use untracked to avoid: (1) creating reactive dependencies on _formValue
      // when called from inside a computed, (2) writing to _fieldNames inside a computed.
      const initialValue =
        this._initialValues.get(name) ??
        untracked(() => this._formValue())?.[name] ??
        null;

      const value = signal<unknown>(initialValue);
      const touched = signal(false);
      const dirty = signal(false);
      const required = signal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validators = signal<ValidatorFn<any>[]>([]);

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
        required,
        valid: computed(() => errors().length === 0),
        errors,
        disabled: signal(false),
        readonly: signal(false),
        pending: signal(false),
      };

      this._fields.set(name, { state, validators, required });
      untracked(() => this._fieldNames.update(names => [...names, name]));
    }
    return this._fields.get(name)!;
  }
}

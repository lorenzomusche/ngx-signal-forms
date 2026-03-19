import { Signal, WritableSignal } from "@angular/core";
import { SchemaPathTree } from "@angular/forms/signals";

// ─── Validator ───────────────────────────────────────────────────────────────

/**
 * Pure validator function type.
 * Receives the current field value and returns an array of error strings
 * (empty array = valid).
 */
export type ValidatorFn<TValue = unknown> = (
  value: TValue,
) => readonly string[];

// ─── Field State ─────────────────────────────────────────────────────────────

/**
 * Mirrors the FieldState exposed by @angular/forms/signals.
 * Stable public contract — isolated from upstream API changes.
 */
export interface NgxFieldState<TValue> {
  readonly value: WritableSignal<TValue>;
  readonly valid: Signal<boolean>;
  readonly touched: WritableSignal<boolean>;
  readonly dirty: WritableSignal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly readonly: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly errors: Signal<ReadonlyArray<NgxFieldError>>;
}

/** Callable that returns the FieldState for a field. */
export type NgxFieldRef<TValue> = () => NgxFieldState<TValue>;

/** Mirrors the shape of the form model. */
export type NgxFieldTree<T> = SchemaPathTree<T>;

// ─── Errors ───────────────────────────────────────────────────────────────────
export interface NgxFieldError {
  readonly kind: string;
  readonly message: string;
  readonly payload?: unknown;
}

export interface NgxFormError {
  /** Field path (e.g. 'email') — null means global form error */
  readonly path: string | null;
  readonly kind: string;
  readonly message: string;
  readonly payload?: unknown;
}

// ─── Submit ───────────────────────────────────────────────────────────────────
export type NgxSubmitMode =
  | "valid-only" // submit blocked if form is invalid
  | "always" // submit fires even if invalid
  | "manual"; // library never auto-submits

export interface NgxFormSubmitEvent<T extends object> {
  readonly value: T;
  readonly valid: boolean;
  readonly errors: ReadonlyArray<NgxFormError>;
}

// ─── Control Options ─────────────────────────────────────────────────────────
export interface NgxControlOption<TValue = string> {
  readonly value: TValue;
  readonly label: string;
  readonly disabled?: boolean;
}

/** Alias for NgxControlOption — used by select/multiselect renderers. */
export type NgxSelectOption<TValue = string> = NgxControlOption<TValue>;

// ─── Renderer Config ─────────────────────────────────────────────────────────
export interface NgxControlRendererConfig {
  readonly label?: string;
  readonly hint?: string;
  readonly placeholder?: string;
  readonly options?: ReadonlyArray<NgxControlOption<unknown>>;
}

// ─── Form State & Adapter ─────────────────────────────────────────────────────
export interface NgxFormState {
  readonly valid: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly submitting: Signal<boolean>;
  readonly submitCount: Signal<number>;
  readonly canSubmit: Signal<boolean>;
  readonly lastSubmitErrors: Signal<ReadonlyArray<NgxFormError>>;
}

export interface NgxFormAdapter<T extends object> {
  readonly state: NgxFormState;
  getValue(): T;
  getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null;
  errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>>;
  submit(
    action: (
      value: T,
    ) => Promise<NgxFormError[] | void> | NgxFormError[] | void,
  ): Promise<void>;
  markAllTouched(): void;
}

// ─── Form Context (provided to child controls via DI) ─────────────────────────
export interface NgxFormContext {
  readonly valid: Signal<boolean>;
  readonly submitting: Signal<boolean>;
  readonly submitCount: Signal<number>;
  readonly lastSubmitErrors: Signal<ReadonlyArray<NgxFormError>>;
}

// ─── Field Config ─────────────────────────────────────────────────────────────
export interface NgxFieldConfig<TValue = unknown> {
  readonly name: string;
  readonly validators?: ReadonlyArray<ValidatorFn<TValue>>;
  readonly initialValue?: TValue;
}

// ─── Control State (internal signal state per field) ─────────────────────────

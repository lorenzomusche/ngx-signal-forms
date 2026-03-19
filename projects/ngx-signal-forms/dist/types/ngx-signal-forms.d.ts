import * as _angular_core from '@angular/core';
import { Signal, WritableSignal, InjectionToken, InputSignal } from '@angular/core';
import { SchemaPathTree, debounce as debounce$1, email as email$2, max as max$2, maxLength as maxLength$2, min as min$2, minLength as minLength$2, pattern as pattern$2, required as required$2 } from '@angular/forms/signals';

/**
 * Pure validator function type.
 * Receives the current field value and returns an array of error strings
 * (empty array = valid).
 */
type ValidatorFn<TValue = unknown> = (value: TValue) => readonly string[];
/**
 * Mirrors the FieldState exposed by @angular/forms/signals.
 * Stable public contract — isolated from upstream API changes.
 */
interface NgxFieldState<TValue> {
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
type NgxFieldRef<TValue> = () => NgxFieldState<TValue>;
/** Mirrors the shape of the form model. */
type NgxFieldTree<T> = SchemaPathTree<T>;
interface NgxFieldError {
    readonly kind: string;
    readonly message: string;
    readonly payload?: unknown;
}
interface NgxFormError {
    /** Field path (e.g. 'email') — null means global form error */
    readonly path: string | null;
    readonly kind: string;
    readonly message: string;
    readonly payload?: unknown;
}
type NgxSubmitMode = "valid-only" | "always" | "manual";
interface NgxFormSubmitEvent<T extends object> {
    readonly value: T;
    readonly valid: boolean;
    readonly errors: ReadonlyArray<NgxFormError>;
}
interface NgxControlOption<TValue = string> {
    readonly value: TValue;
    readonly label: string;
    readonly disabled?: boolean;
}
/** Alias for NgxControlOption — used by select/multiselect renderers. */
type NgxSelectOption<TValue = string> = NgxControlOption<TValue>;
interface NgxControlRendererConfig {
    readonly label?: string;
    readonly hint?: string;
    readonly placeholder?: string;
    readonly options?: ReadonlyArray<NgxControlOption<unknown>>;
}
interface NgxFormState {
    readonly valid: Signal<boolean>;
    readonly pending: Signal<boolean>;
    readonly submitting: Signal<boolean>;
    readonly submitCount: Signal<number>;
    readonly canSubmit: Signal<boolean>;
    readonly lastSubmitErrors: Signal<ReadonlyArray<NgxFormError>>;
}
interface NgxFormAdapter<T extends object> {
    readonly state: NgxFormState;
    getValue(): T;
    getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null;
    errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>>;
    submit(action: (value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void): Promise<void>;
    markAllTouched(): void;
}
interface NgxFormContext {
    readonly valid: Signal<boolean>;
    readonly submitting: Signal<boolean>;
    readonly submitCount: Signal<number>;
    readonly lastSubmitErrors: Signal<ReadonlyArray<NgxFormError>>;
}
interface NgxFieldConfig<TValue = unknown> {
    readonly name: string;
    readonly validators?: ReadonlyArray<ValidatorFn<TValue>>;
    readonly initialValue?: TValue;
}

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by renderer components to resolve FieldRefs.
 */
declare const NGX_FORM_ADAPTER: InjectionToken<NgxFormAdapter<Record<string, unknown>>>;
/**
 * Symbol for accessing the raw Angular FieldTree from NgxFormSubmitEvent.
 * Power-user escape hatch — use sparingly.
 */
declare const RAW_FIELD_TREE_SYMBOL: unique symbol;
/**
 * When provided on an element injector, renderers display errors
 * inline next to the label rather than as a block below the input.
 */
declare const NGX_INLINE_ERRORS: InjectionToken<boolean>;

/**
 * signal-form-adapter.ts
 *
 * THE ONLY FILE that imports from @angular/forms/signals.
 * If Angular changes the Signal Forms API, only this file needs updating.
 */

declare const required$1: typeof required$2;
declare const email$1: typeof email$2;
declare const min$1: typeof min$2;
declare const max$1: typeof max$2;
declare const minLength$1: typeof minLength$2;
declare const maxLength$1: typeof maxLength$2;
declare const pattern$1: typeof pattern$2;
declare const debounce: typeof debounce$1;
interface SignalFormAdapterOptions<T extends object> {
    readonly model: Signal<T>;
    readonly schema?: (schemaPath: NgxFieldTree<T>) => void;
    readonly submitMode: NgxSubmitMode;
}
type NgxFormAdapterWithEvent<T extends object> = NgxFormAdapter<T> & {
    buildSubmitEvent(value: T): NgxFormSubmitEvent<T>;
};
declare function createSignalFormAdapter<T extends object>(options: SignalFormAdapterOptions<T>): NgxFormAdapterWithEvent<T>;

/**
 * Host component for a declarative signal-driven form.
 *
 * Provides the adapter to all descendant renderer components via DI.
 *
 * Usage:
 * ```html
 * <ngx-form [adapter]="adapter" [action]="onSubmit" (submitted)="handle($event)">
 *   <ngx-text name="firstName" label="First Name" />
 *   <ngx-select name="province" [options]="provinces" />
 *   <button type="submit">Submit</button>
 * </ngx-form>
 * ```
 */
declare class NgxFormComponent<T extends Record<string, unknown>> implements NgxFormAdapter<T> {
    readonly adapter: _angular_core.InputSignal<NgxFormAdapter<T>>;
    readonly action: _angular_core.InputSignal<(value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void>;
    readonly submitted: _angular_core.OutputEmitterRef<NgxFormSubmitEvent<T>>;
    get state(): NgxFormState;
    getValue(): T;
    getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null;
    errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>>;
    submit(action: (value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void): Promise<void>;
    markAllTouched(): void;
    protected handleSubmit(): Promise<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxFormComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxFormComponent<any>, "ngx-form", never, { "adapter": { "alias": "adapter"; "required": true; "isSignal": true; }; "action": { "alias": "action"; "required": false; "isSignal": true; }; }, { "submitted": "submitted"; }, never, ["*"], true, never>;
}

/**
 * Optional wrapper component for form controls.
 *
 * Provides a styled container with data-field attribute.
 * Error display is handled by each renderer component directly.
 *
 * Usage:
 * ```html
 * <ngx-control name="firstName">
 *   <ngx-text name="firstName" label="First Name" />
 * </ngx-control>
 * ```
 */
declare class ControlComponent {
    readonly name: _angular_core.InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ControlComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ControlComponent, "ngx-control", never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

/**
 * Abstract base class for all renderer components.
 *
 * Injects the nearest NgxFormAdapter (provided by NgxFormComponent)
 * and resolves the field state by name. Provides convenience computed
 * signals that concrete renderers bind in their templates.
 */
declare abstract class NgxBaseControl<TValue = unknown> {
    /** Concrete renderers must declare: `readonly name = input.required<string>();` */
    readonly name: InputSignal<string>;
    private readonly adapter;
    /** True when NgxInlineErrorsDirective is applied to this element. */
    protected readonly inlineErrors: boolean;
    /** Resolved field state — reactive to name() changes. */
    protected readonly fieldState: Signal<NgxFieldState<TValue>>;
    protected readonly value: Signal<TValue>;
    protected readonly errors: Signal<ReadonlyArray<NgxFieldError>>;
    protected readonly touched: Signal<boolean>;
    protected readonly dirty: Signal<boolean>;
    protected readonly isDisabled: Signal<boolean>;
    protected readonly isValid: Signal<boolean>;
    protected readonly hasErrors: Signal<boolean>;
    /** Error messages joined as a single string for inline display. */
    protected readonly inlineErrorText: Signal<string>;
    protected setValue(newValue: TValue): void;
    protected markAsTouched(): void;
    protected markAsDirty(): void;
    /** Generate a unique ID for template label/input association. */
    protected static nextId(): number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxBaseControl<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NgxBaseControl<any>, never, never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Attribute directive that switches a renderer to inline error display.
 *
 * When applied to a renderer component, errors are shown in parentheses
 * next to the label instead of as a block below the input.
 *
 * ```html
 * <ngx-text name="email" label="Email" ngxInlineErrors />
 * ```
 */
declare class NgxInlineErrorsDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxInlineErrorsDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NgxInlineErrorsDirective, "[ngxInlineErrors]", never, {}, {}, never, never, true, never>;
}

/**
 * Checkbox renderer component.
 *
 * ```html
 * <ngx-checkbox name="acceptTerms" label="I accept the terms" />
 * ```
 */
declare class NgxCheckboxComponent extends NgxBaseControl<boolean> {
    readonly label: _angular_core.InputSignal<string>;
    protected readonly fieldId: string;
    protected onChange(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxCheckboxComponent, "ngx-checkbox", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Date input renderer component.
 *
 * ```html
 * <ngx-date name="birthDate" label="Date of Birth" />
 * ```
 */
declare class NgxDateComponent extends NgxBaseControl<string | null> {
    readonly label: _angular_core.InputSignal<string>;
    readonly minDate: _angular_core.InputSignal<string>;
    readonly maxDate: _angular_core.InputSignal<string>;
    protected readonly fieldId: string;
    protected onChange(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDateComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxDateComponent, "ngx-date", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Multiselect renderer component.
 * Renders a list of checkboxes and delivers ReadonlyArray<TValue>.
 *
 * ```html
 * <ngx-multiselect name="tags" label="Tags" [options]="tagOptions" />
 * ```
 */
declare class NgxMultiselectComponent<TValue = string> extends NgxBaseControl<ReadonlyArray<TValue>> {
    readonly label: _angular_core.InputSignal<string>;
    readonly options: _angular_core.InputSignal<readonly NgxSelectOption<TValue>[]>;
    /** Check whether a given option value is currently selected. */
    protected isSelected(optValue: TValue): boolean;
    protected onToggle(optValue: TValue, event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxMultiselectComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxMultiselectComponent<any>, "ngx-multiselect", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Number input renderer component.
 *
 * ```html
 * <ngx-number name="age" label="Age" [min]="0" [max]="120" />
 * ```
 */
declare class NgxNumberComponent extends NgxBaseControl<number | null> {
    readonly label: _angular_core.InputSignal<string>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly minValue: _angular_core.InputSignal<number>;
    readonly maxValue: _angular_core.InputSignal<number>;
    readonly step: _angular_core.InputSignal<number>;
    protected readonly fieldId: string;
    protected onInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxNumberComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxNumberComponent, "ngx-number", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "minValue": { "alias": "minValue"; "required": false; "isSignal": true; }; "maxValue": { "alias": "maxValue"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Select renderer component.
 *
 * ```html
 * <ngx-select name="province" label="Province" [options]="provinces" />
 * ```
 */
declare class NgxSelectComponent<TValue = string> extends NgxBaseControl<TValue | null> {
    readonly label: _angular_core.InputSignal<string>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly options: _angular_core.InputSignal<readonly NgxSelectOption<TValue>[]>;
    protected readonly fieldId: string;
    protected onChange(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxSelectComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxSelectComponent<any>, "ngx-select", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Text input renderer component.
 *
 * ```html
 * <ngx-text name="firstName" label="First Name" placeholder="Enter name" />
 * ```
 */
declare class NgxTextComponent extends NgxBaseControl<string> {
    readonly name: _angular_core.InputSignal<string>;
    readonly label: _angular_core.InputSignal<string>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly ariaRequired: _angular_core.InputSignal<boolean>;
    protected readonly fieldId: string;
    protected onInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxTextComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxTextComponent, "ngx-text", never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "ariaRequired": { "alias": "ariaRequired"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Textarea renderer component.
 *
 * ```html
 * <ngx-textarea name="bio" label="Biography" [rows]="6" />
 * ```
 */
declare class NgxTextareaComponent extends NgxBaseControl<string> {
    readonly name: _angular_core.InputSignal<string>;
    readonly label: _angular_core.InputSignal<string>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly rows: _angular_core.InputSignal<number>;
    protected readonly fieldId: string;
    protected onInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxTextareaComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxTextareaComponent, "ngx-textarea", never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Built-in pure validator functions.
 * All validators are pure functions — they receive a value and return
 * an array of error strings (empty = valid).
 *
 * Compose multiple validators with `compose()`.
 */
/** Fail if value is null, undefined, empty string, or empty array */
declare const required: <T>(message?: string) => ValidatorFn<T>;
/** Minimum string/array length */
declare const minLength: (min: number, message?: string) => ValidatorFn<string | readonly unknown[]>;
/** Maximum string/array length */
declare const maxLength: (max: number, message?: string) => ValidatorFn<string | readonly unknown[]>;
/** Email format validator */
declare const email: (message?: string) => ValidatorFn<string | null>;
/** RegExp pattern validator */
declare const pattern: (regex: RegExp, message?: string) => ValidatorFn<string | null>;
/** Numeric minimum */
declare const min: (minimum: number, message?: string) => ValidatorFn<number | null>;
/** Numeric maximum */
declare const max: (maximum: number, message?: string) => ValidatorFn<number | null>;
/**
 * Compose multiple validators into one.
 * Runs all validators and merges errors (stops on first error if `bail` = true).
 */
declare const compose: <T>(...validators: readonly ValidatorFn<T>[]) => ValidatorFn<T>;
/** Same as compose but stops at first failing validator */
declare const composeFirst: <T>(...validators: readonly ValidatorFn<T>[]) => ValidatorFn<T>;

export { ControlComponent, NGX_FORM_ADAPTER, NGX_INLINE_ERRORS, NgxBaseControl, NgxCheckboxComponent, NgxDateComponent, NgxFormComponent, NgxInlineErrorsDirective, NgxMultiselectComponent, NgxNumberComponent, NgxSelectComponent, NgxTextComponent, NgxTextareaComponent, RAW_FIELD_TREE_SYMBOL, compose, composeFirst, createSignalFormAdapter, email, max, maxLength, min, minLength, pattern, required, debounce as schemaDebounce, email$1 as schemaEmail, max$1 as schemaMax, maxLength$1 as schemaMaxLength, min$1 as schemaMin, minLength$1 as schemaMinLength, pattern$1 as schemaPattern, required$1 as schemaRequired };
export type { NgxControlOption, NgxControlRendererConfig, NgxFieldConfig, NgxFieldError, NgxFieldRef, NgxFieldState, NgxFieldTree, NgxFormAdapter, NgxFormAdapterWithEvent, NgxFormContext, NgxFormError, NgxFormState, NgxFormSubmitEvent, NgxSelectOption, NgxSubmitMode, SignalFormAdapterOptions, ValidatorFn };

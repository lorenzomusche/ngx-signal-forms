import * as i0 from '@angular/core';
import { InjectionToken, signal, computed, input, output, forwardRef, ChangeDetectionStrategy, Component, inject, Directive } from '@angular/core';
import { required as required$2, email as email$2, min as min$2, max as max$2, minLength as minLength$2, maxLength as maxLength$2, pattern as pattern$2, debounce as debounce$1, form } from '@angular/forms/signals';

/**
 * Scoped to NgxFormComponent via providers[].
 * Injected by renderer components to resolve FieldRefs.
 */
const NGX_FORM_ADAPTER = new InjectionToken("NGX_FORM_ADAPTER");
/**
 * Symbol for accessing the raw Angular FieldTree from NgxFormSubmitEvent.
 * Power-user escape hatch — use sparingly.
 */
const RAW_FIELD_TREE_SYMBOL = Symbol("NGX_RAW_FIELD_TREE");
/**
 * When provided on an element injector, renderers display errors
 * inline next to the label rather than as a block below the input.
 */
const NGX_INLINE_ERRORS = new InjectionToken("NGX_INLINE_ERRORS");

/**
 * signal-form-adapter.ts
 *
 * THE ONLY FILE that imports from @angular/forms/signals.
 * If Angular changes the Signal Forms API, only this file needs updating.
 */
// ─── Validator re-exports ────────────────────────────────────────────────────────────
// Consumers import validators from us, never from @angular/forms/signals
const required$1 = required$2;
const email$1 = email$2;
const min$1 = min$2;
const max$1 = max$2;
const minLength$1 = minLength$2;
const maxLength$1 = maxLength$2;
const pattern$1 = pattern$2;
const debounce = debounce$1;
function createSignalFormAdapter(options) {
    const { model, schema, submitMode } = options;
    // ① Create FieldTree via Angular's form() — isolated here
    const rawFieldTree = schema
        ? form(model, schema)
        : form(model);
    const fieldKeys = Object.keys(rawFieldTree);
    // ② Internal writable signals
    const _submitting = signal(false, ...(ngDevMode ? [{ debugName: "_submitting" }] : /* istanbul ignore next */ []));
    const _submitCount = signal(0, ...(ngDevMode ? [{ debugName: "_submitCount" }] : /* istanbul ignore next */ []));
    const _lastSubmitErrors = signal([], ...(ngDevMode ? [{ debugName: "_lastSubmitErrors" }] : /* istanbul ignore next */ []));
    // ③ Derived signals from all fields
    const _valid = computed(() => fieldKeys.every((k) => {
        const ref = rawFieldTree[k];
        return ref !== undefined ? ref().valid() : true;
    }), ...(ngDevMode ? [{ debugName: "_valid" }] : /* istanbul ignore next */ []));
    const _pending = computed(() => fieldKeys.some((k) => {
        const ref = rawFieldTree[k];
        return ref !== undefined ? ref().pending() : false;
    }), ...(ngDevMode ? [{ debugName: "_pending" }] : /* istanbul ignore next */ []));
    const _canSubmit = computed(() => {
        if (_submitting())
            return false;
        if (submitMode === "valid-only")
            return _valid() && !_pending();
        if (submitMode === "always")
            return true;
        return false; // 'manual'
    }, ...(ngDevMode ? [{ debugName: "_canSubmit" }] : /* istanbul ignore next */ []));
    const state = {
        valid: _valid,
        pending: _pending,
        submitting: _submitting.asReadonly(),
        submitCount: _submitCount.asReadonly(),
        canSubmit: _canSubmit,
        lastSubmitErrors: _lastSubmitErrors.asReadonly(),
    };
    // ④ Default error messages by kind (when Angular doesn't provide one)
    const defaultMessages = {
        required: () => "This field is required",
        email: () => "Invalid email address",
        min: (e) => `Value must be at least ${String(e["min"] ?? "")}`,
        max: (e) => `Value must be at most ${String(e["max"] ?? "")}`,
        minLength: (e) => `Must be at least ${String(e["minLength"] ?? "")} characters`,
        maxLength: (e) => `Must be at most ${String(e["maxLength"] ?? "")} characters`,
        pattern: () => "Invalid format",
    };
    function resolveErrorMessage(e) {
        const message = e["message"];
        if (typeof message === "string" && message.length > 0)
            return message;
        const kind = String(e["kind"] ?? "");
        const fallback = defaultMessages[kind];
        return fallback ? fallback(e) : kind;
    }
    // ⑤ Memoized field ref cache
    const fieldCache = new Map();
    function wrapFieldRef(angularRef) {
        const rawState = angularRef();
        const _touched = signal(false, ...(ngDevMode ? [{ debugName: "_touched" }] : /* istanbul ignore next */ []));
        const _dirty = signal(false, ...(ngDevMode ? [{ debugName: "_dirty" }] : /* istanbul ignore next */ []));
        const wrappedErrors = computed(() => {
            const raw = rawState.errors() ?? [];
            return raw.map((e) => ({
                kind: String(e["kind"] ?? ""),
                message: resolveErrorMessage(e),
                payload: e["payload"],
            }));
        }, ...(ngDevMode ? [{ debugName: "wrappedErrors" }] : /* istanbul ignore next */ []));
        const fieldState = {
            value: rawState.value,
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
    function getField(name) {
        const key = name;
        const cached = fieldCache.get(key);
        if (cached)
            return cached;
        const ref = rawFieldTree[key];
        if (!ref)
            return null;
        const wrapped = wrapFieldRef(ref);
        fieldCache.set(key, wrapped);
        return wrapped;
    }
    function getValue() {
        return model();
    }
    function errorsFor(path) {
        const key = path;
        const fieldRef = getField(key);
        if (!fieldRef) {
            return computed(() => _lastSubmitErrors().filter((e) => e.path === key));
        }
        return computed(() => fieldRef()
            .errors()
            .map((e) => ({
            path: key,
            kind: e.kind,
            message: e.message,
            payload: e.payload,
        })));
    }
    function markAllTouched() {
        for (const k of fieldKeys) {
            const ref = getField(k);
            if (ref) {
                ref().touched.set(true);
            }
        }
    }
    async function submit(action) {
        if (submitMode === "valid-only" && !_valid()) {
            markAllTouched();
            return;
        }
        if (_submitting())
            return;
        _submitting.set(true);
        _submitCount.update((count) => count + 1);
        _lastSubmitErrors.set([]);
        try {
            const value = model();
            const errors = await action(value);
            if (Array.isArray(errors) && errors.length > 0) {
                _lastSubmitErrors.set(errors);
            }
        }
        catch (e) {
            _lastSubmitErrors.set([
                { path: null, kind: "unknown", message: String(e) },
            ]);
        }
        finally {
            _submitting.set(false);
        }
    }
    function buildSubmitEvent(value) {
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
class NgxFormComponent {
    // ── Inputs ──────────────────────────────────────────────────────────────────
    adapter = input.required(...(ngDevMode ? [{ debugName: "adapter" }] : /* istanbul ignore next */ []));
    action = input(undefined, ...(ngDevMode ? [{ debugName: "action" }] : /* istanbul ignore next */ []));
    // ── Outputs ─────────────────────────────────────────────────────────────────
    submitted = output();
    // ── NgxFormAdapter delegation ───────────────────────────────────────────────
    get state() {
        return this.adapter().state;
    }
    getValue() {
        return this.adapter().getValue();
    }
    getField(name) {
        return this.adapter().getField(name);
    }
    errorsFor(path) {
        return this.adapter().errorsFor(path);
    }
    async submit(action) {
        return this.adapter().submit(action);
    }
    markAllTouched() {
        this.adapter().markAllTouched();
    }
    // ── Template handler ────────────────────────────────────────────────────────
    async handleSubmit() {
        const act = this.action();
        if (!act)
            return;
        await this.submit(act);
        this.submitted.emit({
            value: this.getValue(),
            valid: this.state.valid(),
            errors: [...this.state.lastSubmitErrors()],
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxFormComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "21.2.5", type: NgxFormComponent, isStandalone: true, selector: "ngx-form", inputs: { adapter: { classPropertyName: "adapter", publicName: "adapter", isSignal: true, isRequired: true, transformFunction: null }, action: { classPropertyName: "action", publicName: "action", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { submitted: "submitted" }, providers: [
            {
                provide: NGX_FORM_ADAPTER,
                useExisting: forwardRef(() => NgxFormComponent),
            },
        ], ngImport: i0, template: `
    <form (submit)="$event.preventDefault(); handleSubmit()" novalidate>
      <ng-content />
    </form>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxFormComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-form",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <form (submit)="$event.preventDefault(); handleSubmit()" novalidate>
      <ng-content />
    </form>
  `,
                    providers: [
                        {
                            provide: NGX_FORM_ADAPTER,
                            useExisting: forwardRef(() => NgxFormComponent),
                        },
                    ],
                }]
        }], propDecorators: { adapter: [{ type: i0.Input, args: [{ isSignal: true, alias: "adapter", required: true }] }], action: [{ type: i0.Input, args: [{ isSignal: true, alias: "action", required: false }] }], submitted: [{ type: i0.Output, args: ["submitted"] }] } });

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
class ControlComponent {
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: ControlComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "21.2.5", type: ControlComponent, isStandalone: true, selector: "ngx-control", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "attr.data-field": "name()" } }, ngImport: i0, template: `
    <div class="ngx-control">
      <ng-content />
    </div>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: ControlComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-control",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ngx-control">
      <ng-content />
    </div>
  `,
                    host: {
                        "[attr.data-field]": "name()",
                    },
                }]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] } });

/** Global counter for generating unique field IDs. */
let _nextFieldId = 0;
/**
 * Abstract base class for all renderer components.
 *
 * Injects the nearest NgxFormAdapter (provided by NgxFormComponent)
 * and resolves the field state by name. Provides convenience computed
 * signals that concrete renderers bind in their templates.
 */
class NgxBaseControl {
    /** Concrete renderers must declare: `readonly name = input.required<string>();` */
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    adapter = inject(NGX_FORM_ADAPTER);
    /** True when NgxInlineErrorsDirective is applied to this element. */
    inlineErrors = inject(NGX_INLINE_ERRORS, { self: true, optional: true }) ?? false;
    /** Resolved field state — reactive to name() changes. */
    fieldState = computed(() => {
        const n = this.name();
        const ref = this.adapter.getField(n);
        if (!ref) {
            throw new Error(`[ngx-signal-forms] Field "${n}" not found in form adapter`);
        }
        return ref();
    }, ...(ngDevMode ? [{ debugName: "fieldState" }] : /* istanbul ignore next */ []));
    // ── Convenience signals for templates ───────────────────────────────────────
    value = computed(() => this.fieldState().value(), ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    errors = computed(() => this.fieldState().errors(), ...(ngDevMode ? [{ debugName: "errors" }] : /* istanbul ignore next */ []));
    touched = computed(() => this.fieldState().touched(), ...(ngDevMode ? [{ debugName: "touched" }] : /* istanbul ignore next */ []));
    dirty = computed(() => this.fieldState().dirty(), ...(ngDevMode ? [{ debugName: "dirty" }] : /* istanbul ignore next */ []));
    isDisabled = computed(() => this.fieldState().disabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : /* istanbul ignore next */ []));
    isValid = computed(() => this.fieldState().valid(), ...(ngDevMode ? [{ debugName: "isValid" }] : /* istanbul ignore next */ []));
    hasErrors = computed(() => this.errors().length > 0, ...(ngDevMode ? [{ debugName: "hasErrors" }] : /* istanbul ignore next */ []));
    /** Error messages joined as a single string for inline display. */
    inlineErrorText = computed(() => this.errors()
        .map((e) => e.message)
        .join(", "), ...(ngDevMode ? [{ debugName: "inlineErrorText" }] : /* istanbul ignore next */ []));
    // ── Mutation helpers ────────────────────────────────────────────────────────
    setValue(newValue) {
        this.fieldState().value.set(newValue);
    }
    markAsTouched() {
        this.fieldState().touched.set(true);
    }
    markAsDirty() {
        this.fieldState().dirty.set(true);
    }
    /** Generate a unique ID for template label/input association. */
    static nextId() {
        return _nextFieldId++;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxBaseControl, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.2.5", type: NgxBaseControl, isStandalone: true, inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxBaseControl, decorators: [{
            type: Directive
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] } });

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
class NgxInlineErrorsDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxInlineErrorsDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.2.5", type: NgxInlineErrorsDirective, isStandalone: true, selector: "[ngxInlineErrors]", host: { classAttribute: "ngx-inline-errors" }, providers: [{ provide: NGX_INLINE_ERRORS, useValue: true }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxInlineErrorsDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxInlineErrors]",
                    standalone: true,
                    host: { class: "ngx-inline-errors" },
                    providers: [{ provide: NGX_INLINE_ERRORS, useValue: true }],
                }]
        }] });

/**
 * Checkbox renderer component.
 *
 * ```html
 * <ngx-checkbox name="acceptTerms" label="I accept the terms" />
 * ```
 */
class NgxCheckboxComponent extends NgxBaseControl {
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-checkbox-${NgxBaseControl.nextId()}`;
    onChange(event) {
        this.setValue(event.target.checked);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxCheckboxComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxCheckboxComponent, isStandalone: true, selector: "ngx-checkbox", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--checkbox" }, usesInheritance: true, ngImport: i0, template: `
    <label class="ngx-checkbox">
      <input
        type="checkbox"
        [id]="fieldId"
        [checked]="value()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-label]="label() || null"
      />
      @if (label()) {
        <span>
          {{ label() }}
          @if (inlineErrors && touched() && hasErrors()) {
            <span
              class="ngx-control__inline-errors"
              role="alert"
              aria-live="polite"
            >
              ({{ inlineErrorText() }})
            </span>
          }
        </span>
      }
    </label>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxCheckboxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-checkbox",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--checkbox" },
                    template: `
    <label class="ngx-checkbox">
      <input
        type="checkbox"
        [id]="fieldId"
        [checked]="value()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-label]="label() || null"
      />
      @if (label()) {
        <span>
          {{ label() }}
          @if (inlineErrors && touched() && hasErrors()) {
            <span
              class="ngx-control__inline-errors"
              role="alert"
              aria-live="polite"
            >
              ({{ inlineErrorText() }})
            </span>
          }
        </span>
      }
    </label>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * Date input renderer component.
 *
 * ```html
 * <ngx-date name="birthDate" label="Date of Birth" />
 * ```
 */
class NgxDateComponent extends NgxBaseControl {
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    minDate = input(null, ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
    maxDate = input(null, ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-date-${NgxBaseControl.nextId()}`;
    onChange(event) {
        const raw = event.target.value;
        this.setValue(raw || null);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxDateComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxDateComponent, isStandalone: true, selector: "ngx-date", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--date" }, usesInheritance: true, ngImport: i0, template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="date"
      [value]="value() ?? ''"
      [disabled]="isDisabled()"
      [min]="minDate() ?? ''"
      [max]="maxDate() ?? ''"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxDateComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-date",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--date" },
                    template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="date"
      [value]="value() ?? ''"
      [disabled]="isDisabled()"
      [min]="minDate() ?? ''"
      [max]="maxDate() ?? ''"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }] } });

/**
 * Multiselect renderer component.
 * Renders a list of checkboxes and delivers ReadonlyArray<TValue>.
 *
 * ```html
 * <ngx-multiselect name="tags" label="Tags" [options]="tagOptions" />
 * ```
 */
class NgxMultiselectComponent extends NgxBaseControl {
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    options = input([], ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    /** Check whether a given option value is currently selected. */
    isSelected(optValue) {
        return this.value().includes(optValue);
    }
    onToggle(optValue, event) {
        const checked = event.target.checked;
        const current = this.value();
        const next = checked
            ? [...current, optValue]
            : current.filter((v) => v !== optValue);
        this.setValue(next);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxMultiselectComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxMultiselectComponent, isStandalone: true, selector: "ngx-multiselect", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--multiselect" }, usesInheritance: true, ngImport: i0, template: `
    <fieldset [disabled]="isDisabled()">
      @if (label()) {
        <legend>
          {{ label() }}
          @if (inlineErrors && touched() && hasErrors()) {
            <span
              class="ngx-control__inline-errors"
              role="alert"
              aria-live="polite"
            >
              ({{ inlineErrorText() }})
            </span>
          }
        </legend>
      }
      @for (opt of options(); track opt.value) {
        <label class="ngx-multiselect__option">
          <input
            type="checkbox"
            [checked]="isSelected(opt.value)"
            (change)="onToggle(opt.value, $event)"
            (blur)="markAsTouched()"
          />
          {{ opt.label }}
        </label>
      }
    </fieldset>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul class="ngx-control__errors" role="alert" aria-live="polite">
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxMultiselectComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-multiselect",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--multiselect" },
                    template: `
    <fieldset [disabled]="isDisabled()">
      @if (label()) {
        <legend>
          {{ label() }}
          @if (inlineErrors && touched() && hasErrors()) {
            <span
              class="ngx-control__inline-errors"
              role="alert"
              aria-live="polite"
            >
              ({{ inlineErrorText() }})
            </span>
          }
        </legend>
      }
      @for (opt of options(); track opt.value) {
        <label class="ngx-multiselect__option">
          <input
            type="checkbox"
            [checked]="isSelected(opt.value)"
            (change)="onToggle(opt.value, $event)"
            (blur)="markAsTouched()"
          />
          {{ opt.label }}
        </label>
      }
    </fieldset>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul class="ngx-control__errors" role="alert" aria-live="polite">
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }] } });

/**
 * Number input renderer component.
 *
 * ```html
 * <ngx-number name="age" label="Age" [min]="0" [max]="120" />
 * ```
 */
class NgxNumberComponent extends NgxBaseControl {
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    placeholder = input("", ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    minValue = input(null, ...(ngDevMode ? [{ debugName: "minValue" }] : /* istanbul ignore next */ []));
    maxValue = input(null, ...(ngDevMode ? [{ debugName: "maxValue" }] : /* istanbul ignore next */ []));
    step = input(1, ...(ngDevMode ? [{ debugName: "step" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-number-${NgxBaseControl.nextId()}`;
    onInput(event) {
        const raw = event.target.value;
        this.setValue(raw === "" ? null : Number(raw));
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxNumberComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxNumberComponent, isStandalone: true, selector: "ngx-number", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, minValue: { classPropertyName: "minValue", publicName: "minValue", isSignal: true, isRequired: false, transformFunction: null }, maxValue: { classPropertyName: "maxValue", publicName: "maxValue", isSignal: true, isRequired: false, transformFunction: null }, step: { classPropertyName: "step", publicName: "step", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--number" }, usesInheritance: true, ngImport: i0, template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="number"
      [placeholder]="placeholder()"
      [value]="value() ?? ''"
      [disabled]="isDisabled()"
      [min]="minValue()"
      [max]="maxValue()"
      [step]="step()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxNumberComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-number",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--number" },
                    template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="number"
      [placeholder]="placeholder()"
      [value]="value() ?? ''"
      [disabled]="isDisabled()"
      [min]="minValue()"
      [max]="maxValue()"
      [step]="step()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], minValue: [{ type: i0.Input, args: [{ isSignal: true, alias: "minValue", required: false }] }], maxValue: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxValue", required: false }] }], step: [{ type: i0.Input, args: [{ isSignal: true, alias: "step", required: false }] }] } });

/**
 * Select renderer component.
 *
 * ```html
 * <ngx-select name="province" label="Province" [options]="provinces" />
 * ```
 */
class NgxSelectComponent extends NgxBaseControl {
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    placeholder = input("", ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    options = input([], ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-select-${NgxBaseControl.nextId()}`;
    onChange(event) {
        const target = event.target;
        const matched = this.options().find((o) => String(o.value) === target.value);
        this.setValue(matched?.value ?? null);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxSelectComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxSelectComponent, isStandalone: true, selector: "ngx-select", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--select" }, usesInheritance: true, ngImport: i0, template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <select
      [id]="fieldId"
      [disabled]="isDisabled()"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    >
      @if (placeholder()) {
        <option value="" disabled [selected]="value() === null">
          {{ placeholder() }}
        </option>
      }
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value" [selected]="opt.value === value()">
          {{ opt.label }}
        </option>
      }
    </select>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxSelectComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-select",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--select" },
                    template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <select
      [id]="fieldId"
      [disabled]="isDisabled()"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    >
      @if (placeholder()) {
        <option value="" disabled [selected]="value() === null">
          {{ placeholder() }}
        </option>
      }
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value" [selected]="opt.value === value()">
          {{ opt.label }}
        </option>
      }
    </select>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }] } });

/**
 * Text input renderer component.
 *
 * ```html
 * <ngx-text name="firstName" label="First Name" placeholder="Enter name" />
 * ```
 */
class NgxTextComponent extends NgxBaseControl {
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    placeholder = input("", ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    ariaRequired = input(false, ...(ngDevMode ? [{ debugName: "ariaRequired" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-text-${NgxBaseControl.nextId()}`;
    onInput(event) {
        const target = event.target;
        this.setValue(target.value);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxTextComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxTextComponent, isStandalone: true, selector: "ngx-text", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, ariaRequired: { classPropertyName: "ariaRequired", publicName: "ariaRequired", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--text" }, usesInheritance: true, ngImport: i0, template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="text"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="isDisabled()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxTextComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-text",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--text" },
                    template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <input
      [id]="fieldId"
      type="text"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="isDisabled()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], ariaRequired: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaRequired", required: false }] }] } });

/**
 * Textarea renderer component.
 *
 * ```html
 * <ngx-textarea name="bio" label="Biography" [rows]="6" />
 * ```
 */
class NgxTextareaComponent extends NgxBaseControl {
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    label = input("", ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    placeholder = input("", ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    rows = input(4, ...(ngDevMode ? [{ debugName: "rows" }] : /* istanbul ignore next */ []));
    fieldId = `ngx-textarea-${NgxBaseControl.nextId()}`;
    onInput(event) {
        this.setValue(event.target.value);
        this.markAsDirty();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxTextareaComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.5", type: NgxTextareaComponent, isStandalone: true, selector: "ngx-textarea", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, rows: { classPropertyName: "rows", publicName: "rows", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "ngx-renderer ngx-renderer--textarea" }, usesInheritance: true, ngImport: i0, template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <textarea
      [id]="fieldId"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [rows]="rows()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
      >{{ value() }}</textarea
    >
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: NgxTextareaComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-textarea",
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { class: "ngx-renderer ngx-renderer--textarea" },
                    template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <textarea
      [id]="fieldId"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [rows]="rows()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
      >{{ value() }}</textarea
    >
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
                }]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], rows: [{ type: i0.Input, args: [{ isSignal: true, alias: "rows", required: false }] }] } });

/**
 * Built-in pure validator functions.
 * All validators are pure functions — they receive a value and return
 * an array of error strings (empty = valid).
 *
 * Compose multiple validators with `compose()`.
 */
/** Fail if value is null, undefined, empty string, or empty array */
const required = (message = 'This field is required') => (value) => {
    if (value === null || value === undefined)
        return [message];
    if (typeof value === 'string' && value.trim() === '')
        return [message];
    if (Array.isArray(value) && value.length === 0)
        return [message];
    return [];
};
/** Minimum string/array length */
const minLength = (min, message) => (value) => {
    const len = value?.length ?? 0;
    return len < min
        ? [message ?? `Minimum length is ${min}`]
        : [];
};
/** Maximum string/array length */
const maxLength = (max, message) => (value) => {
    const len = value?.length ?? 0;
    return len > max
        ? [message ?? `Maximum length is ${max}`]
        : [];
};
/** Email format validator */
const email = (message = 'Invalid email address') => (value) => {
    if (!value)
        return [];
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? [] : [message];
};
/** RegExp pattern validator */
const pattern = (regex, message = 'Invalid format') => (value) => {
    if (!value)
        return [];
    return regex.test(value) ? [] : [message];
};
/** Numeric minimum */
const min = (minimum, message) => (value) => {
    if (value === null || value === undefined)
        return [];
    return value < minimum
        ? [message ?? `Minimum value is ${minimum}`]
        : [];
};
/** Numeric maximum */
const max = (maximum, message) => (value) => {
    if (value === null || value === undefined)
        return [];
    return value > maximum
        ? [message ?? `Maximum value is ${maximum}`]
        : [];
};
/**
 * Compose multiple validators into one.
 * Runs all validators and merges errors (stops on first error if `bail` = true).
 */
const compose = (...validators) => (value) => validators.flatMap(v => v(value));
/** Same as compose but stops at first failing validator */
const composeFirst = (...validators) => (value) => {
    for (const v of validators) {
        const errors = v(value);
        if (errors.length > 0)
            return errors;
    }
    return [];
};

/**
 * Public API Surface of ngx-signal-forms
 *
 * Only expose what consumers need — the @angular/forms/signals
 * internals are encapsulated behind createSignalFormAdapter().
 *
 * Naming convention: all exported symbols use the Ngx prefix.
 */
// ─── DI tokens ────────────────────────────────────────────────────────────────

/**
 * Generated bundle index. Do not edit.
 */

export { ControlComponent, NGX_FORM_ADAPTER, NGX_INLINE_ERRORS, NgxBaseControl, NgxCheckboxComponent, NgxDateComponent, NgxFormComponent, NgxInlineErrorsDirective, NgxMultiselectComponent, NgxNumberComponent, NgxSelectComponent, NgxTextComponent, NgxTextareaComponent, RAW_FIELD_TREE_SYMBOL, compose, composeFirst, createSignalFormAdapter, email, max, maxLength, min, minLength, pattern, required, debounce as schemaDebounce, email$1 as schemaEmail, max$1 as schemaMax, maxLength$1 as schemaMaxLength, min$1 as schemaMin, minLength$1 as schemaMinLength, pattern$1 as schemaPattern, required$1 as schemaRequired };
//# sourceMappingURL=ngx-signal-forms.mjs.map

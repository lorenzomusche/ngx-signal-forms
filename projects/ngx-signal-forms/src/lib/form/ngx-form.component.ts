import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  Signal,
} from "@angular/core";
import {
  NgxDeclarativeAdapter,
  NgxDeclarativeRegistry,
} from "../core/declarative-form-adapter";
import { NGX_DECLARATIVE_REGISTRY, NGX_FORM_ADAPTER } from "../core/tokens";
import {
  NgxFieldRef,
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEvent,
  NgxSubmitMode,
  ValidatorFn,
} from "../core/types";

/**
 * Host component for a declarative signal-driven form.
 *
 * Provides the adapter to all descendant renderer components via DI.
 *
 * **Explicit adapter mode** (existing API, unchanged):
 * ```html
 * <ngx-form [adapter]="adapter" (submitted)="handle($event)">…</ngx-form>
 * ```
 *
 * **Declarative mode** (no adapter needed):
 * ```html
 * <ngx-form [formValue]="{ age: 18 }" (submitted)="handle($event)">
 *   <ngx-control-text name="email" ngxRequired ngxEmail />
 *   <ngx-control-number name="age" [ngxMin]="18" />
 * </ngx-form>
 * ```
 */
@Component({
  selector: "ngx-form",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="$event.preventDefault(); handleSubmit()" novalidate>
      <ng-content />
    </form>
  `,
  styles: [`
    form {
      display: var(--ngx-form-display, block);
      flex-direction: var(--ngx-form-flex-direction, column);
      flex: var(--ngx-form-flex, initial);
      min-height: var(--ngx-form-min-height, auto);
      overflow: var(--ngx-form-overflow, visible);
    }
  `],
  providers: [
    {
      provide: NGX_FORM_ADAPTER,
      useExisting: forwardRef(() => NgxFormComponent),
    },
    {
      provide: NGX_DECLARATIVE_REGISTRY,
      useExisting: forwardRef(() => NgxFormComponent),
    },
  ],
})
export class NgxFormComponent<
  T extends Record<string, unknown>,
> implements NgxFormAdapter<T>, NgxDeclarativeRegistry {
  // ── Inputs ──────────────────────────────────────────────────────────────────

  /** Explicit adapter — if omitted the form creates one automatically. */
  readonly adapter = input<NgxFormAdapter<T>>();

  readonly action = input<
    | ((value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void)
    | undefined
  >(undefined);

  /**
   * Default values for declarative mode.
   * Per-control [initialValue] takes precedence over this.
   */
  readonly formValue = input<Partial<Record<string, unknown>>>();

  /** Submit behaviour for declarative mode (ignored when adapter is provided). */
  readonly submitMode = input<NgxSubmitMode>("valid-only");

  // ── Outputs ─────────────────────────────────────────────────────────────────
  readonly submitted = output<NgxFormSubmitEvent<T>>();

  // ── Internal declarative adapter ─────────────────────────────────────────────
  private readonly _declarativeAdapter: NgxDeclarativeAdapter;

  constructor() {
    this._declarativeAdapter = new NgxDeclarativeAdapter(
      computed(() => this.formValue()),
      computed(() => this.submitMode()),
    );
  }

  removeField(name: string): void {
    this._declarativeAdapter.removeField(name);
  }

  /** Active adapter: explicit [adapter] input or the internal declarative one. */
  private get _active(): NgxFormAdapter<T> {
    return (this.adapter() ?? this._declarativeAdapter) as NgxFormAdapter<T>;
  }

  // ── NgxDeclarativeRegistry ────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addValidators(name: string, validators: ValidatorFn<any>[], isRequired?: boolean): void {
    this._declarativeAdapter.addValidators(name, validators, isRequired);
  }

  setInitialValue(name: string, value: unknown): void {
    this._declarativeAdapter.setInitialValue(name, value);
  }

  setDisabled(name: string, disabled: Signal<boolean>): void {
    this._declarativeAdapter.setDisabled(name, disabled);
  }

  setReadonly(name: string, readonly: Signal<boolean>): void {
    this._declarativeAdapter.setReadonly(name, readonly);
  }

  // ── NgxFormAdapter delegation ───────────────────────────────────────────────

  get state(): NgxFormState {
    return this._active.state;
  }

  get value(): Signal<T> {
    return this._active.value;
  }

  getValue(): T {
    return this._active.getValue();
  }

  getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null {
    return this._active.getField(name);
  }

  errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>> {
    return this._active.errorsFor(path);
  }

  async submit(
    action: (
      value: T,
    ) => Promise<NgxFormError[] | void> | NgxFormError[] | void,
  ): Promise<void> {
    return this._active.submit(action);
  }

  markAllTouched(): void {
    this._active.markAllTouched();
  }

  buildSubmitEvent(value: T): NgxFormSubmitEvent<T> {
    return this._active.buildSubmitEvent(value);
  }

  patchValue(partial: Partial<T>): void {
    this._active.patchValue(partial);
  }

  setValue(value: T): void {
    this._active.setValue(value);
  }

  reset(): void {
    this._active.reset();
  }

  // ── Template handler ────────────────────────────────────────────────────────

  protected async handleSubmit(): Promise<void> {
    const act = this.action();
    if (act) {
      // Classic mode: delegate to adapter submit (handles canSubmit + submitting state)
      await this.submit(act);
    } else {
      // Declarative mode: validate manually, then emit
      if (!this.state.canSubmit()) {
        this.markAllTouched();
        return;
      }
    }
    this.submitted.emit(this._active.buildSubmitEvent(this.getValue()));
  }
}

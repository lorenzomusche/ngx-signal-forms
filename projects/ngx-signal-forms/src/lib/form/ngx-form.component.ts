import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  Signal,
} from "@angular/core";
import { NGX_FORM_ADAPTER } from "../core/tokens";
import {
  NgxFieldRef,
  NgxFormAdapter,
  NgxFormError,
  NgxFormState,
  NgxFormSubmitEvent,
  NgxFormSubmitEventInternal,
} from "../core/types";

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
@Component({
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
})
export class NgxFormComponent<
  T extends Record<string, unknown>,
> implements NgxFormAdapter<T> {
  // ── Inputs ──────────────────────────────────────────────────────────────────
  readonly adapter = input.required<NgxFormAdapter<T>>();
  readonly action = input<
    | ((value: T) => Promise<NgxFormError[] | void> | NgxFormError[] | void)
    | undefined
  >(undefined);

  // ── Outputs ─────────────────────────────────────────────────────────────────
  readonly submitted = output<NgxFormSubmitEvent<T>>();

  // ── NgxFormAdapter delegation ───────────────────────────────────────────────

  get state(): NgxFormState {
    return this.adapter().state;
  }

  getValue(): T {
    return this.adapter().getValue();
  }

  getField<K extends keyof T>(name: K): NgxFieldRef<T[K]> | null {
    return this.adapter().getField(name);
  }

  errorsFor(path: keyof T | string): Signal<ReadonlyArray<NgxFormError>> {
    return this.adapter().errorsFor(path);
  }

  async submit(
    action: (
      value: T,
    ) => Promise<NgxFormError[] | void> | NgxFormError[] | void,
  ): Promise<void> {
    return this.adapter().submit(action);
  }

  markAllTouched(): void {
    this.adapter().markAllTouched();
  }

  buildSubmitEvent(value: T): NgxFormSubmitEventInternal<T> {
    return this.adapter().buildSubmitEvent(value);
  }

  // ── Template handler ────────────────────────────────────────────────────────

  protected async handleSubmit(): Promise<void> {
    const act = this.action();
    if (!act) return;

    await this.submit(act);
    this.submitted.emit(this.adapter().buildSubmitEvent(this.getValue()));
  }
}

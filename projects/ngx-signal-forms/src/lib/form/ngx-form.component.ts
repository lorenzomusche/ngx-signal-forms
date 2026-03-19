import {
  Component,
  contentChildren,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { SignalFormAdapter } from '../adapter/signal-form-adapter';
import { NGX_FORM_CONTEXT, NGX_FORM_REGISTRY } from '../core/tokens';
import {
  NgxFieldConfig,
  NgxFormContext,
  NgxFormSubmitEvent,
  ValidatorFn,
} from '../core/types';
import { ControlDirective } from '../control/control.directive';

/**
 * Host component for a declarative signal-driven form.
 *
 * Usage:
 * ```html
 * <ngx-form [action]="onSubmit" (submitted)="handle($event)">
 *   <control text name="firstName" />
 *   <control select name="province" [options]="provinces" />
 * </ngx-form>
 * ```
 */
@Component({
  selector: 'ngx-form',
  standalone: true,
  template: `
    <form (submit)="$event.preventDefault(); handleSubmit()" novalidate>
      <ng-content />
      <ng-content select="[formActions]" />
    </form>
  `,
  providers: [
    SignalFormAdapter,
    {
      provide: NGX_FORM_REGISTRY,
      useFactory: () => inject(SignalFormAdapter),
    },
    {
      provide: NGX_FORM_CONTEXT,
      useFactory: (): NgxFormContext<unknown> => {
        const adapter = inject(SignalFormAdapter);
        return {
          valid: adapter.valid,
          submitting: adapter.submitting,
          submitCount: adapter.submitCount,
          lastSubmitErrors: adapter.lastSubmitErrors,
        };
      },
    },
  ],
})
export class NgxFormComponent<T extends Record<string, unknown>> implements OnDestroy {
  // ---- inputs ----------------------------------------------------------------
  readonly action = input.required<(value: T) => Promise<readonly string[]> | Promise<void>>();
  readonly validators = input<readonly ValidatorFn<T>[]>([]);

  // ---- outputs ---------------------------------------------------------------
  readonly submitted = output<NgxFormSubmitEvent<T>>();

  // ---- internals -------------------------------------------------------------
  private readonly adapter = inject(SignalFormAdapter);
  private readonly controls = contentChildren(ControlDirective);

  private readonly _submitEffect = effect(() => {
    const lastEvent = this.adapter.lastSubmitEvent();
    if (lastEvent !== null) {
      this.submitted.emit(lastEvent as NgxFormSubmitEvent<T>);
    }
  });

  // ---- public API ------------------------------------------------------------
  /** Programmatic submit trigger */
  submit(): void {
    this.handleSubmit();
  }

  // ---- lifecycle -------------------------------------------------------------
  ngOnDestroy(): void {
    this.adapter.destroy();
  }

  // ---- private ---------------------------------------------------------------
  protected handleSubmit(): void {
    this.adapter.submit(this.action() as Parameters<SignalFormAdapter['submit']>[0]);
  }
}

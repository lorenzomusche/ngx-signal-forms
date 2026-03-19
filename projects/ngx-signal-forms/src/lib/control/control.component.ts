import {
  Component,
  computed,
  inject,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  ControlDirective,
  NGX_CONTROL_DIRECTIVE,
} from './control.directive';
import { ValidatorFn } from '../core/types';

/**
 * Polymorphic host component for form controls.
 *
 * The active renderer is injected via NGX_CONTROL_DIRECTIVE token —
 * this avoids boolean flags and centralises rendering logic in
 * dedicated renderer directives (TextRendererDirective, etc.).
 *
 * Usage:
 * ```html
 * <ngx-control text name="firstName" />
 * <ngx-control select name="province" [options]="provinces" />
 * ```
 */
@Component({
  selector: 'ngx-control',
  standalone: true,
  template: `
    <div class="ngx-control" [class.ngx-control--invalid]="hasErrors()" [class.ngx-control--touched]="isTouched()">
      <ng-content />
      @if (showErrors() && hasErrors()) {
        <ul class="ngx-control__errors" role="alert" aria-live="polite">
          @for (err of renderer().errors(); track err) {
            <li class="ngx-control__error">{{ err }}</li>
          }
        </ul>
      }
    </div>
  `,
  host: {
    '[attr.data-field]': 'name()',
  },
})
export class ControlComponent {
  // ---- inputs ----------------------------------------------------------------
  readonly name = input.required<string>();
  readonly showErrors = input<boolean>(true);
  readonly validators = input<readonly ValidatorFn<unknown>[]>([]);

  // ---- renderer (injected by renderer directive on the same host) ------------
  readonly renderer = inject<ControlDirective>(NGX_CONTROL_DIRECTIVE, {
    self: true,
    optional: true,
  }) as unknown as { (): ControlDirective } & ControlDirective;

  // Expose renderer signals as computed for the template
  protected readonly hasErrors = computed(() =>
    (this.renderer as unknown as ControlDirective)?.errors()?.length > 0
  );

  protected readonly isTouched = computed(() =>
    (this.renderer as unknown as ControlDirective)?.touched() ?? false
  );
}

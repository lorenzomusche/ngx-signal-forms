import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

/**
 * Checkbox renderer component.
 *
 * ```html
 * <ngx-checkbox name="acceptTerms" label="I accept the terms" />
 * ```
 */
@Component({
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
})
export class NgxCheckboxComponent extends NgxBaseControl<boolean> {
  readonly label = input<string>("");

  protected readonly fieldId = `ngx-checkbox-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.markAsDirty();
  }
}

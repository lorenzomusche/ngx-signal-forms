import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

/**
 * Toggle (switch) renderer component.
 *
 * Renders a styled on/off switch bound to a boolean field.
 *
 * ```html
 * <ngx-control-toggle name="darkMode" label="Dark Mode" />
 * ```
 */
@Component({
  selector: "ngx-control-toggle",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--toggle" },
  template: `
    <label class="ngx-toggle">
      <input
        type="checkbox"
        role="switch"
        [id]="fieldId"
        [checked]="value()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-checked]="value()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-disabled]="effectiveAriaDisabled()"
        [attr.aria-label]="label() || null"
      />
      <span class="ngx-toggle__track" aria-hidden="true">
        <span class="ngx-toggle__thumb"></span>
      </span>
      @if (label()) {
        <span class="ngx-toggle__label">
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
export class NgxToggleComponent extends NgxBaseControl<boolean> {
  readonly label = input<string>("");

  protected readonly fieldId = `ngx-control-toggle-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.markAsDirty();
  }
}

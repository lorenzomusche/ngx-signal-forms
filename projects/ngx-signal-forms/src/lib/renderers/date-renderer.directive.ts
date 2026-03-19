import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

/**
 * Date input renderer component.
 *
 * ```html
 * <ngx-date name="birthDate" label="Date of Birth" />
 * ```
 */
@Component({
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
})
export class NgxDateComponent extends NgxBaseControl<string | null> {
  readonly label = input<string>("");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);

  protected readonly fieldId = `ngx-date-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(raw || null);
    this.markAsDirty();
  }
}

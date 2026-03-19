import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

/**
 * Number input renderer component.
 *
 * ```html
 * <ngx-control-number name="age" label="Age" [min]="0" [max]="120" />
 * ```
 */
@Component({
  selector: "ngx-control-number",
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
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
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
export class NgxNumberComponent extends NgxBaseControl<number | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly minValue = input<number | null>(null);
  readonly maxValue = input<number | null>(null);
  readonly step = input<number>(1);

  protected readonly fieldId = `ngx-control-number-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(raw === "" ? null : Number(raw));
    this.markAsDirty();
  }
}

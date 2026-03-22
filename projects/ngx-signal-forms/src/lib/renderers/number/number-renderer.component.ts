import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import { NgxNumberSpinButtonsDirective } from "./number-spin-buttons.directive";

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
  imports: [
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
    NgxNumberSpinButtonsDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--number" },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
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
      [ngxNumberSpinButtons]="showSpinButtons()"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxNumberComponent extends NgxBaseControl<number | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly minValue = input<number | null>(null);
  readonly maxValue = input<number | null>(null);
  readonly step = input<number>(1);

  /**
   * If true, enables custom spin buttons via directive.
   */
  readonly showSpinButtons = input<boolean>(false);

  protected readonly fieldId = `ngx-control-number-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(raw === "" ? null : Number(raw));
    this.markAsDirty();
  }
}

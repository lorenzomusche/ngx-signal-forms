import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxNumberSpinButtonsDirective } from "./number-spin-buttons.directive";

/**
 * Number input renderer component.
 */
@Component({
  selector: "ngx-control-number",
  standalone: true,
  imports: [
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxNumberSpinButtonsDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--number",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />
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
  readonly placeholder = input<string>("");
  readonly minValue = input<number | null>(null);
  readonly maxValue = input<number | null>(null);
  readonly step = input<number>(1);
  readonly showSpinButtons = input<boolean>(false);

  protected readonly fieldId = `ngx-control-number-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(raw === "" ? null : Number(raw));
    this.markAsDirty();
  }
}

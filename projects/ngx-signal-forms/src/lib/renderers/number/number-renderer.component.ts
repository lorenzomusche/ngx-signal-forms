import { NgTemplateOutlet } from "@angular/common";
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
    NgTemplateOutlet,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxNumberSpinButtonsDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--number",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="value() !== null"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />
    <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">
      @if (prefix(); as p) {
        <div class="ngx-input-prefix">
          <ng-container [ngTemplateOutlet]="p.template" />
        </div>
      }
      <input
        [id]="fieldId"
        type="number"
        [step]="step()"
        [min]="minValue()"
        [max]="maxValue()"
        [placeholder]="placeholder()"
        [value]="value() ?? ''"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired() || isRequired()"
        [attr.aria-disabled]="effectiveAriaDisabled()"
        [attr.aria-label]="label() || null"
        [ngxNumberSpinButtons]="showSpinButtons()"
      />
      @if (suffix(); as s) {
        <div class="ngx-input-suffix">
          <ng-container [ngTemplateOutlet]="s.template" />
        </div>
      }
    </div>

    @if (supportingText(); as st) {
      <div class="ngx-supporting-text">
        <ng-container [ngTemplateOutlet]="st.template" />
      </div>
    }
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

import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxSelectOption } from "../../core/types";

/**
 * Radio Group renderer component.
 */
@Component({
  selector: "ngx-control-radio",
  standalone: true,
  imports: [NgTemplateOutlet, NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 
    class: "ngx-renderer ngx-renderer--radio-group",
    "[class.ngx-renderer--touched]": "touched()",
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

    <div
      class="ngx-radio-group"
      [class.ngx-radio-group--horizontal]="layout() === 'horizontal'"
      role="radiogroup"
      [attr.aria-labelledby]="label() ? fieldId + '-label' : null"
    >
      @for (opt of options(); track opt.value) {
        <label class="ngx-radio-item" [class.ngx-radio-item--disabled]="isDisabled()">
          <input
            type="radio"
            [name]="fieldId"
            [value]="opt.value"
            [checked]="value() === opt.value"
            [disabled]="isDisabled()"
            (change)="onSelectionChange(opt.value)"
            (blur)="markAsTouched()"
            [attr.aria-invalid]="hasErrors()"
            [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
            [attr.aria-required]="ariaRequired()"
          />
          <span class="ngx-radio-circle"></span>
          <span class="ngx-radio-label">{{ opt.label }}</span>
        </label>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    } @else if (supportingText(); as st) {
      <div class="ngx-supporting-text">
        <ng-container [ngTemplateOutlet]="st.template" />
      </div>
    }
  `,
})
export class NgxRadioGroupComponent<TValue = unknown> extends NgxBaseControl<TValue | null> {
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly layout  = input<"vertical" | "horizontal">("vertical");

  protected readonly fieldId = `ngx-control-radio-${NgxBaseControl.nextId()}`;

  protected onSelectionChange(value: TValue): void {
    if (this.isDisabled()) return;
    this.setValue(value);
    this.markAsDirty();
  }
}

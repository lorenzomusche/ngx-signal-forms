import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import { NgxSelectOption } from "../../core/types";

/**
 * Radio Group renderer component.
 *
 * ```html
 * <ngx-control-radio 
 *   name="paymentMethod" 
 *   label="Payment Method" 
 *   [options]="paymentOptions" 
 * />
 * ```
 */
@Component({
  selector: "ngx-control-radio",
  standalone: true,
  imports: [NgxInlineErrorIconComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--radio-group" },
  template: `
    @if (label()) {
      <label class="ngx-radio-group-label" [id]="fieldId + '-label'">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

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
    }
  `,
})
export class NgxRadioGroupComponent<TValue = any> extends NgxBaseControl<TValue | null> {
  readonly label   = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly layout  = input<"vertical" | "horizontal">("vertical");

  protected readonly fieldId = `ngx-control-radio-${NgxBaseControl.nextId()}`;

  protected onSelectionChange(value: TValue): void {
    if (this.isDisabled()) return;
    this.setValue(value);
    this.markAsDirty();
  }
}

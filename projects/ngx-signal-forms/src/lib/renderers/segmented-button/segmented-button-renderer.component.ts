import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignalWithTransform } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NgxSelectOption } from "../../core/types";

/**
 * Segmented Button renderer component.
 */
@Component({
  selector: "ngx-control-segmented",
  standalone: true,
  imports: [NgTemplateOutlet, NgxControlLabelComponent, NgxErrorListComponent, NgxIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 
    class: "ngx-renderer ngx-renderer--segmented", 
    "[class.ngx-renderer--touched]": "touched()",
    "[style.width]": "fullWidth() ? '100%' : 'fit-content'" 
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
      class="ngx-segmented"
      role="radiogroup"
      [attr.aria-labelledby]="label() ? fieldId + '-label' : null"
    >
      @for (opt of options(); track opt.value; let first = $first; let last = $last) {
        <button
          type="button"
          class="ngx-segmented__button"
          [class.ngx-segmented__button--first]="first"
          [class.ngx-segmented__button--last]="last"
          [class.ngx-segmented__button--selected]="value() === opt.value"
          [disabled]="isDisabled()"
          (click)="onSelect(opt.value)"
          (blur)="markAsTouched()"
          role="radio"
          [attr.aria-checked]="value() === opt.value"
          [attr.aria-disabled]="isDisabled()"
        >
          @if (value() === opt.value) {
            <ngx-icon name="CHECKMARK" class="ngx-segmented__check" />
          }
          <span class="ngx-segmented__text">{{ opt.label }}</span>
        </button>
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
export class NgxSegmentedButtonComponent<TValue = any> extends NgxBaseControl<TValue | null> {
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);

  public readonly fullWidth: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly fieldId = `ngx-control-segmented-${NgxBaseControl.nextId()}`;

  protected onSelect(value: TValue): void {
    if (this.isDisabled()) return;
    this.setValue(value);
    this.markAsDirty();
  }
}

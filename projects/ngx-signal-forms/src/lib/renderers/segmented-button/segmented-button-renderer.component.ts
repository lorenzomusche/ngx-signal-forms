import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxSelectOption } from "../../core/types";

/**
 * Segmented Button renderer component.
 */
@Component({
  selector: "ngx-control-segmented",
  standalone: true,
  imports: [NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--segmented" },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId + '-label'"
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
            <svg class="ngx-segmented__check" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          }
          <span class="ngx-segmented__text">{{ opt.label }}</span>
        </button>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxSegmentedButtonComponent<TValue = any> extends NgxBaseControl<TValue | null> {
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);

  protected readonly fieldId = `ngx-control-segmented-${NgxBaseControl.nextId()}`;

  protected onSelect(value: TValue): void {
    if (this.isDisabled()) return;
    this.setValue(value);
    this.markAsDirty();
  }
}

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * Slider renderer component.
 */
@Component({
  selector: "ngx-control-slider",
  standalone: true,
  imports: [NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--slider",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="true"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    <div class="ngx-slider-container">
      <input
        #rangeInput
        type="range"
        class="ngx-slider"
        [id]="fieldId"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
      />
      @if (showValue()) {
        <span class="ngx-slider-value">{{ value() }}</span>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxSliderComponent extends NgxBaseControl<number> {
  readonly min       = input<number>(0);
  readonly max       = input<number>(100);
  readonly step      = input<number>(1);
  readonly showValue = input<boolean>(true);

  protected readonly fieldId = `ngx-control-slider-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.setValue(val);
  }

  protected onChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.setValue(val);
    this.markAsDirty();
  }
}

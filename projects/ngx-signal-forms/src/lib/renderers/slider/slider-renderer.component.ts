import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";

/**
 * Slider renderer component.
 *
 * ```html
 * <ngx-control-slider 
 *   name="volume" 
 *   label="Volume" 
 *   [min]="0" 
 *   [max]="100" 
 * />
 * ```
 */
@Component({
  selector: "ngx-control-slider",
  standalone: true,
  imports: [NgxInlineErrorIconComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--slider" },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

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
  readonly label     = input<string>("");
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

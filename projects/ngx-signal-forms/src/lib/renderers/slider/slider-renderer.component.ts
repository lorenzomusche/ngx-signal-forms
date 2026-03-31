import { NgTemplateOutlet } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, viewChild, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * Slider renderer component.
 */
@Component({
  selector: "ngx-control-slider",
  standalone: true,
  imports: [NgTemplateOutlet, NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--slider",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
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
export class NgxSliderComponent extends NgxBaseControl<number> {
  readonly min       = input<number>(0);
  readonly max       = input<number>(100);
  readonly step      = input<number>(1);
  readonly showValue = input<boolean>(true);

  private readonly rangeInput = viewChild<ElementRef<HTMLInputElement>>('rangeInput');

  protected readonly fieldId = `ngx-control-slider-${NgxBaseControl.nextId()}`;

  constructor() {
    super();
    afterNextRender(() => {
      this.updateFillPct(this.value() ?? this.min(), this.min(), this.max());
    });
  }

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.setValue(val);
    this.updateFillPct(val, this.min(), this.max());
  }

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.setValue(val);
    this.markAsDirty();
    this.updateFillPct(val, this.min(), this.max());
  }

  private updateFillPct(value: number, min: number, max: number): void {
    const el = this.rangeInput()?.nativeElement;
    if (!el) return;
    const pct = max !== min ? ((value - min) / (max - min)) * 100 : 0;
    el.style.setProperty('--ngx-slider-fill-pct', `${pct}%`);
  }
}

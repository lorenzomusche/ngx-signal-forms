import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, input, InputSignalWithTransform, viewChild } from "@angular/core";
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
    "[style.width]": "fullWidth() ? '100%' : 'fit-content'",
    "[style.--ngx-segments-count]": "segmentsCount()"
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
      #track
      class="ngx-segmented"
      role="radiogroup"
      [attr.aria-labelledby]="label() ? fieldId + '-label' : null"
      (pointerdown)="onTrackPointerDown($event)"
      (pointermove)="onTrackPointerMove($event)"
      (pointerup)="onTrackPointerUp()"
      (pointercancel)="onTrackPointerUp()"
    >
      @for (opt of options(); track opt.value; let first = $first; let last = $last; let i = $index) {
        <button
          type="button"
          class="ngx-segmented__button"
          [class.ngx-segmented__button--first]="first"
          [class.ngx-segmented__button--last]="last"
          [class.ngx-segmented__button--selected]="value() === opt.value"
          [disabled]="isDisabled()"
          [attr.data-seg-index]="i"
          (click)="onSelect(opt.value)"
          (blur)="markAsTouched()"
          role="radio"
          [attr.aria-checked]="value() === opt.value"
          [attr.aria-disabled]="isDisabled()"
        >
          <ngx-icon
            name="CHECKMARK"
            class="ngx-segmented__check"
            [style.visibility]="value() === opt.value ? 'visible' : 'hidden'"
            [attr.aria-hidden]="value() !== opt.value"
          />
          <span class="ngx-segmented__text" [attr.data-text]="opt.label">{{ opt.label }}</span>
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
export class NgxSegmentedButtonComponent<TValue = unknown> extends NgxBaseControl<TValue | null> {
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);

  public readonly fullWidth: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly fieldId = `ngx-control-segmented-${NgxBaseControl.nextId()}`;

  protected readonly segmentsCount = computed(() => this.options().length);

  private readonly track = viewChild<ElementRef<HTMLElement>>("track");
  private isDragging = false;

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.isDisabled() || event.button !== 0) return;
    this.isDragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updateSelectionFromPointer(event);
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    if (!this.isDragging || this.isDisabled()) return;
    this.updateSelectionFromPointer(event);
  }

  protected onTrackPointerUp(): void {
    this.isDragging = false;
    this.markAsTouched();
  }

  private updateSelectionFromPointer(event: PointerEvent): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) return;

    const rect = trackEl.getBoundingClientRect();
    const count = this.segmentsCount();
    if (count === 0) return;

    const relativeX = event.clientX - rect.left;
    const segmentWidth = rect.width / count;
    let index = Math.floor(relativeX / segmentWidth);

    // Clamp index
    index = Math.max(0, Math.min(index, count - 1));

    const option = this.options()[index];
    if (option && this.value() !== option.value) {
      this.onSelect(option.value);
    }
  }

  protected onSelect(value: TValue): void {
    if (this.isDisabled()) return;
    this.setValue(value);
    this.markAsDirty();
  }
}

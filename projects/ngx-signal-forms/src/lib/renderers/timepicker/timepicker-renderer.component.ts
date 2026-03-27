import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { getCurrentTime } from "../../core/time-utils";
import { NgxTimepickerClockComponent } from "./timepicker-clock.component";

/**
 * Timepicker renderer — M3-style input with clock overlay.
 */
@Component({
  selector: "ngx-control-timepicker",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxTimepickerClockComponent,
    NgxIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './timepicker-renderer.component.scss',
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--timepicker",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
    "(document:click)": "onDocumentClick($event)",
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

    <div class="ngx-timepicker" #wrapper>
      <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">
        @if (prefix(); as p) {
           <div class="ngx-input-prefix">
             <ng-container [ngTemplateOutlet]="p.template" />
           </div>
        }
        <input
          #inputEl
          type="text"
          [id]="fieldId"
          class="ngx-timepicker__input"
          [value]="value() || ''"
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          (focus)="onInputFocus($event)"
          (blur)="onInputBlur()"
          (keydown.arrowdown)="openOverlay($event); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <div class="ngx-input-suffix">
          @if (suffix(); as s) {
            <ng-container [ngTemplateOutlet]="s.template" />
          } @else {
            <button
              type="button"
              class="ngx-timepicker__toggle"
              [disabled]="isDisabled()"
              aria-label="Open time picker"
              tabindex="-1"
              (click)="toggleOverlay($event)"
            >
              <ngx-icon name="CLOCK" class="ngx-timepicker__icon" />
            </button>
          }
        </div>
      </div>

      @if (open()) {
        @if (position() === "overlay") {
          <div class="ngx-timepicker__backdrop" (click)="closeOverlay()"></div>
        }
        <div
          class="ngx-timepicker__popup"
          [class.ngx-timepicker__popup--above]="position() === 'above'"
          [class.ngx-timepicker__popup--overlay]="position() === 'overlay'"
          [class.ngx-timepicker__popup--right]="alignment() === 'right'"
        >
          <ngx-timepicker-clock
            [value]="draftValue()"
            [disabled]="isDisabled()"
            (timePicked)="onTimePicked($event)"
            (cancelClicked)="closeOverlay()"
            (confirmClicked)="confirmPicker()"
          />
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
export class NgxTimepickerComponent extends NgxOverlayControl<string | null> {
  readonly placeholder = input<string>("hh:mm AM/PM");
  protected override readonly minSpace = 440;
  protected override readonly minWidth = 320;

  protected readonly fieldId = `ngx-control-timepicker-${NgxBaseControl.nextId()}`;
  protected readonly draftValue = signal<string | null>(null);

  protected override onBeforeOpen(): void {
    // If empty, default to current system time so 'OK' button picks it immediately.
    this.draftValue.set(this.value() || getCurrentTime());
  }

  protected onTimePicked(time: string): void {
    this.draftValue.set(time);
  }

  protected confirmPicker(): void {
    const draft = this.draftValue();
    if (draft !== this.value()) {
      this.setValue(draft);
      this.markAsDirty();
    }
    this.closeOverlay();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.trim().toUpperCase();
    if (!raw) {
      this.setValue(null);
      this.markAsDirty();
      return;
    }
    const match = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/.exec(raw);
    if (match) {
      const hour = match[1]!.padStart(2, "0");
      const minute = match[2]!;
      const ampm = match[3]!;
      const formatted = `${hour}:${minute} ${ampm}`;
      if (this.value() !== formatted) {
        this.setValue(formatted);
        this.markAsDirty();
      }
    } else {
      // Don't clear the input while typing!
      // Only reset the underlying value if it's invalid
      if (this.value() !== null) {
        this.setValue(null);
      }
    }
  }

  protected onInputFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (
      !input.value ||
      input.value === "00:00 AM" ||
      input.value === "00:00 PM"
    ) {
      setTimeout(() => input.select(), 0);
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
  }
}

import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  signal,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NGX_I18N_MESSAGES } from "../../core/i18n";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { NgxOverlayPanelComponent } from "../../core/overlay-panel.component";
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
    NgxOverlayPanelComponent,
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
              [attr.aria-label]="i18n.timepickerOpenLabel"
              tabindex="-1"
              (click)="toggleOverlay($event)"
            >
              <ngx-icon name="CLOCK" class="ngx-timepicker__icon" />
            </button>
          }
        </div>
      </div>

      <ngx-overlay-panel
        [open]="open()"
        [position]="position()"
        [alignment]="alignment()"
        [coords]="coords()"
        [maxHeight]="maxHeight()"
        [hasBackdrop]="position() === 'overlay'"
        [widthMode]="'auto-content'"
        [panelClass]="'ngx-timepicker__popup'"
        (close)="closeOverlay()"
      >
        <ngx-timepicker-clock
          [value]="draftValue()"
          [disabled]="isDisabled()"
          (timePicked)="onTimePicked($event)"
          (cancelClicked)="closeOverlay()"
          (confirmClicked)="confirmPicker()"
        />
      </ngx-overlay-panel>
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
  protected readonly i18n = inject(NGX_I18N_MESSAGES);
  readonly placeholder = input<string>("hh:mm AM/PM");
  protected override readonly minSpace = 450;

  protected readonly fieldId = `ngx-control-timepicker-${NgxBaseControl.nextId()}`;
  protected readonly draftValue = signal<string | null>(null);
  private readonly injector = inject(Injector);

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
      afterNextRender(() => input.select(), { injector: this.injector });
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
  }
}

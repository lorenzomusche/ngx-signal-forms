import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { CalendarDate, formatIsoDate, parseIsoDate } from "../../core/date-utils";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { NgxCalendarComponent } from "./calendar.component";

/**
 * Date picker renderer — M3-style docked calendar picker.
 * Integrated with NgxControlLabelComponent.
 */
@Component({
  selector: "ngx-control-datepicker",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxCalendarComponent,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--datepicker",
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

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">
        @if (prefix(); as p) {
           <div class="ngx-input-prefix">
             <ng-container [ngTemplateOutlet]="p.template" />
           </div>
        }
        <input
          [id]="fieldId"
          type="text"
          class="ngx-datepicker__input"
          [placeholder]="placeholder()"
          [value]="displayValue()"
          [disabled]="isDisabled()"
          readonly
          (click)="toggleOverlay()"
          (blur)="markAsTouched()"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired() || isRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
        />
        <div class="ngx-input-suffix">
           @if (suffix(); as s) {
             <ng-container [ngTemplateOutlet]="s.template" />
           } @else {
             <button
                type="button"
                class="ngx-datepicker__toggle"
                [disabled]="isDisabled()"
                (click)="toggleOverlay()"
                aria-label="Toggle calendar"
              >
                 <ngx-icon name="CALENDAR" class="ngx-datepicker__icon" />
              </button>
           }
        </div>
      </div>

      @if (open()) {
        @if (position() === "overlay") {
          <div class="ngx-datepicker__backdrop" (click)="closeOverlay()"></div>
        }
        <div
          class="ngx-datepicker__popup"
          [class.ngx-datepicker__popup--above]="position() === 'above'"
          [class.ngx-datepicker__popup--overlay]="position() === 'overlay'"
          [class.ngx-datepicker__popup--right]="alignment() === 'right'"
        >
          <ngx-calendar
            #calendar
            [selectedDate]="parsedSelectedDate()"
            [minDate]="parsedMinDate()"
            [maxDate]="parsedMaxDate()"
            [ariaLabel]="label() ? 'Choose ' + label() : 'Choose date'"
            (datePicked)="onDatePicked($event)"
            (closed)="closeOverlay()"
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
export class NgxDatePickerComponent extends NgxOverlayControl<string | null> {
  readonly placeholder = input<string>("YYYY-MM-DD");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  protected override readonly minSpace = 380;
  protected override readonly minWidth = 320;

  protected readonly fieldId = `ngx-control-datepicker-${NgxBaseControl.nextId()}`;

  private readonly calendarRef = viewChild<NgxCalendarComponent>("calendar");

  // ── Derived state ───────────────────────────────────────────────────────────

  protected readonly displayValue = computed((): string => {
    const v = this.value();
    if (!v) return "";
    return v.substring(0, 10);
  });

  protected readonly parsedSelectedDate = computed((): CalendarDate | null =>
    parseIsoDate(this.value()),
  );

  protected readonly parsedMinDate = computed((): CalendarDate | null =>
    parseIsoDate(this.minDate()),
  );

  protected readonly parsedMaxDate = computed((): CalendarDate | null =>
    parseIsoDate(this.maxDate()),
  );

  protected override onBeforeOpen(): void {
    setTimeout(() => {
      const cal = this.calendarRef();
      if (!cal) return;
      cal.syncView(this.parsedSelectedDate());
      cal.focusFocusedDate();
    }, 0);
  }

  protected onDatePicked(date: CalendarDate): void {
    const isoString = formatIsoDate(date);
    this.setValue(isoString);
    this.markAsDirty();
    this.closeOverlay();
  }

  protected onInputChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (!raw) {
      this.setValue(null);
      this.markAsDirty();
      return;
    }
    const parsed = parseIsoDate(raw);
    if (parsed) {
      const isoString = formatIsoDate(parsed);
      this.setValue(isoString);
      this.markAsDirty();
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
  }
}

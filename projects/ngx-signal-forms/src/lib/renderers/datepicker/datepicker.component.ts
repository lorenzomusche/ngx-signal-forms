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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--datepicker",
    "[class.ngx-inline-errors]": "inlineErrors",
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
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V6c0-1.1.89-2 2-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z"/>
</svg>
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

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxDatePickerComponent extends NgxOverlayControl<string | null> {
  readonly placeholder = input<string>("YYYY-MM-DD");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);

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

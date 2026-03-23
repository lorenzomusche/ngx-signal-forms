import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
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
    NgxCalendarComponent,
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--datepicker",
    "[class.ngx-inline-errors]": "inlineErrors",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    @if (label()) {
      <label [for]="fieldId" class="ngx-label">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-datepicker__input-group">
        <input
          #inputEl
          type="text"
          [id]="fieldId"
          class="ngx-datepicker__input"
          [value]="displayValue()"
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          (blur)="onInputBlur()"
          (keydown.arrowdown)="openOverlay(); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <button
          type="button"
          class="ngx-datepicker__toggle"
          [disabled]="isDisabled()"
          aria-label="Open calendar"
          tabindex="-1"
          (click)="toggleOverlay()"
        >
          <svg
            class="ngx-datepicker__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
            />
          </svg>
        </button>
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

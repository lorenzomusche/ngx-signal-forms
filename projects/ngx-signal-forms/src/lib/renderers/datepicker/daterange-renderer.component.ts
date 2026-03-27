import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { NGX_DATE_LOCALE } from "../../core/date-locale";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import {
  CalendarDate,
  compareDates,
  formatIsoDate,
  parseIsoDate,
} from "../../core/date-utils";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { NgxDateRange } from "../../core/types";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NgxRangeCalendarComponent } from "./range-calendar.component";

/**
 * Date range picker renderer — compact two-input calendar picker
 * for selecting a start and end date. Integrated with NgxControlLabelComponent.
 */
@Component({
  selector: "ngx-control-daterange",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxRangeCalendarComponent,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--datepicker ngx-renderer--daterange",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    @if (label()) {
      <ngx-control-label
        [label]="label()"
        [forId]="fieldId + '-start'"
        [required]="isRequired()"
        [filled]="true"
        [showInlineError]="inlineErrors && touched() && hasErrors()"
        [errorText]="inlineErrorText()"
      />
    }

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-input-wrapper ngx-daterange__group" [class.ngx-input-wrapper--disabled]="isDisabled()">
        <input
          #startInput
          type="text"
          [id]="fieldId + '-start'"
          class="ngx-datepicker__input ngx-daterange__input"
          [value]="displayStart()"
          [disabled]="isDisabled()"
          [placeholder]="startPlaceholder()"
          (input)="onStartInput($event)"
          (blur)="onStartBlur($event)"
          (focus)="lastFocused.set('start')"
          (keydown.arrowdown)="openOverlay($event); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="(label() || 'Date range') + ' start'"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <span class="ngx-daterange__sep" aria-hidden="true">–</span>
        <input
          #endInput
          type="text"
          [id]="fieldId + '-end'"
          class="ngx-datepicker__input ngx-daterange__input"
          [value]="displayEnd()"
          [disabled]="isDisabled()"
          [placeholder]="endPlaceholder()"
          (input)="onEndInput($event)"
          (blur)="onEndBlur($event)"
          (focus)="lastFocused.set('end')"
          (keydown.arrowdown)="openOverlay($event); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="(label() || 'Date range') + ' end'"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <div class="ngx-input-suffix">
          <button
            type="button"
            class="ngx-datepicker__toggle"
            [disabled]="isDisabled()"
            aria-label="Open calendar"
            tabindex="-1"
            (click)="toggleOverlay($event)"
          >
           <ngx-icon name="CALENDAR" class="ngx-datepicker__icon" />
          </button>
        </div>
      </div>

      @if (open()) {
        @if (variant() === "modal" || position() === "overlay") {
          <div class="ngx-datepicker__backdrop" (click)="closeOverlay()"></div>
        }
        <div
          class="ngx-datepicker__popup"
          [class.ngx-datepicker__popup--modal]="variant() === 'modal' || position() === 'overlay'"
          [class.ngx-datepicker__popup--above]="position() === 'above' && variant() !== 'modal'"
          [class.ngx-datepicker__popup--right]="alignment() === 'right' && variant() !== 'modal'"
        >
          @if (variant() === 'modal') {
             <div class="ngx-datepicker__modal-header">
                <span class="ngx-datepicker__modal-label">{{ label() || 'Select range' }}</span>
                <span class="ngx-datepicker__modal-value">{{ modalDisplayValue() }}</span>
             </div>
          }

          <ngx-range-calendar
            #calendar
            [rangeStart]="variant() === 'modal' ? tempStart() : parsedStart()"
            [rangeEnd]="variant() === 'modal' ? tempEnd() : parsedEnd()"
            [minDate]="parsedMinDate()"
            [maxDate]="parsedMaxDate()"
            [ariaLabel]="label() ? 'Choose ' + label() : 'Choose date range'"
            (rangePicked)="onRangePicked($event)"
            (closed)="closeOverlay()"
          />

          @if (variant() === 'modal') {
             <div class="ngx-datepicker__actions">
                <button type="button" class="ngx-datepicker__action-btn" (click)="closeOverlay()">Cancel</button>
                <button type="button" class="ngx-datepicker__action-btn ngx-datepicker__action-btn--primary" (click)="applySelection()">OK</button>
             </div>
          }
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
export class NgxDateRangePickerComponent extends NgxOverlayControl<NgxDateRange | null> {
  readonly startPlaceholder = input<string>("Start");
  readonly endPlaceholder = input<string>("End");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly variant = input<"docked" | "modal">("docked");

  protected override readonly minSpace = 350;
  protected override readonly minWidth = 330;

  protected readonly fieldId = `ngx-daterange-${NgxBaseControl.nextId()}`;

  /** Which input was last focused — drives calendar sync. */
  protected readonly lastFocused = signal<"start" | "end">("start");

  private readonly calendarRef =
    viewChild<NgxRangeCalendarComponent>("calendar");

  private readonly locale = inject(NGX_DATE_LOCALE);

  // ── Derived state ─────────────────────────────────────────────────────────────

  protected readonly tempStart = signal<CalendarDate | null>(null);
  protected readonly tempEnd = signal<CalendarDate | null>(null);

  protected readonly displayStart = computed((): string => {
    const v = this.value()?.start;
    return v ? v.substring(0, 10) : "";
  });

  protected readonly displayEnd = computed((): string => {
    const v = this.value()?.end;
    return v ? v.substring(0, 10) : "";
  });

  protected readonly modalDisplayValue = computed((): string => {
    const s = this.tempStart() ?? this.parsedStart();
    const e = this.tempEnd() ?? this.parsedEnd();

    if (!s) return "Select range";

    const format = (d: CalendarDate) => {
      try {
        const date = new Date(d.year, d.month - 1, d.day);
        return new Intl.DateTimeFormat(this.locale.locale, {
          month: "short",
          day: "numeric",
        }).format(date);
      } catch {
        return "";
      }
    };

    const startStr = format(s);
    if (!e) return `${startStr} – ...`;
    const endStr = format(e);
    return `${startStr} – ${endStr}`;
  });

  protected readonly parsedStart = computed((): CalendarDate | null =>
    parseIsoDate(this.value()?.start),
  );

  protected readonly parsedEnd = computed((): CalendarDate | null =>
    parseIsoDate(this.value()?.end),
  );

  protected readonly parsedMinDate = computed((): CalendarDate | null =>
    parseIsoDate(this.minDate()),
  );

  protected readonly parsedMaxDate = computed((): CalendarDate | null =>
    parseIsoDate(this.maxDate()),
  );

  /** Sync calendar view to current value after DOM renders. */
  protected override onBeforeOpen(): void {
    this.tempStart.set(this.parsedStart());
    this.tempEnd.set(this.parsedEnd());
    setTimeout(() => {
      const cal = this.calendarRef();
      if (!cal) return;
      cal.syncView(this.tempStart(), this.tempEnd());
      cal.focusFocusedDate();
    }, 0);
  }

  // ── Range picked from calendar ───────────────────────────────────────────────

  protected applySelection(): void {
    const s = this.tempStart();
    const e = this.tempEnd();
    if (s && e) {
      this.onRangePicked({ start: s, end: e }, true);
    } else {
      this.closeOverlay();
    }
  }

  protected onRangePicked(
    range: {
      readonly start: CalendarDate;
      readonly end: CalendarDate;
    },
    forceApply = false,
  ): void {
    if (this.variant() === "modal" && !forceApply) {
      this.tempStart.set(range.start);
      this.tempEnd.set(range.end);
      return;
    }
    this.setValue({
      start: formatIsoDate(range.start),
      end: formatIsoDate(range.end),
    });
    this.markAsDirty();
    this.closeOverlay();
  }

  // ── Start input handling ─────────────────────────────────────────────────────

  protected onStartInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const current = this.value() ?? { start: null, end: null };
    if (!raw) {
      this.commitRange(null, current.end);
      return;
    }
    const parsed = parseIsoDate(raw);
    if (parsed) {
      this.commitRange(formatIsoDate(parsed), current.end);
    }
  }

  protected onStartBlur(event: FocusEvent): void {
    this.markAsTouched();
    const el = event.target as HTMLInputElement;
    el.value = this.displayStart();
  }

  // ── End input handling ───────────────────────────────────────────────────────

  protected onEndInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const current = this.value() ?? { start: null, end: null };
    if (!raw) {
      this.commitRange(current.start, null);
      return;
    }
    const parsed = parseIsoDate(raw);
    if (parsed) {
      this.commitRange(current.start, formatIsoDate(parsed));
    }
  }

  protected onEndBlur(event: FocusEvent): void {
    this.markAsTouched();
    const el = event.target as HTMLInputElement;
    el.value = this.displayEnd();
  }

  // ── Commit with end ≥ start enforcement ──────────────────────────────────────

  /**
   * Commit the range, enforcing end >= start.
   */
  private commitRange(start: string | null, end: string | null): void {
    const s = parseIsoDate(start);
    const e = parseIsoDate(end);

    let finalStart = start;
    let finalEnd = end;

    if (s && e && compareDates(e, s) < 0) {
      finalEnd = finalStart;
    }

    this.setValue({ start: finalStart, end: finalEnd });
    this.markAsDirty();
  }
}

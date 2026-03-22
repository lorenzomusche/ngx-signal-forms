import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import {
  CalendarDate,
  compareDates,
  formatIsoDate,
  parseIsoDate,
} from "../../core/date-utils";
import {
  computeOverlayPosition,
  OverlayPosition,
} from "../../core/overlay-position";
import { NgxDateRange } from "../../core/types";
import { NgxRangeCalendarComponent } from "./range-calendar.component";

/**
 * Date range picker renderer — compact two-input calendar picker
 * for selecting a start and end date.
 *
 * Two narrow inputs are placed side-by-side with a thin separator,
 * keeping the overall footprint close to a regular datepicker.
 * Each input is independently editable; the end date is automatically
 * clamped so it can never be before the start date.
 *
 * The field value is an `NgxDateRange` object with `start` and `end`
 * ISO `YYYY-MM-DD` strings (both nullable while the user is mid-selection).
 *
 * ```html
 * <ngx-control-daterange
 *   name="travelDates"
 *   label="Travel dates"
 *   minDate="2026-01-01"
 *   maxDate="2027-12-31"
 * />
 * ```
 */
@Component({
  selector: "ngx-control-daterange",
  standalone: true,
  imports: [
    NgxRangeCalendarComponent,
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--datepicker ngx-renderer--daterange",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    @if (label()) {
      <label [for]="fieldId + '-start'">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-datepicker__input-group ngx-daterange__group">
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
          (keydown.arrowdown)="openCalendar(); $event.preventDefault()"
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
          (keydown.arrowdown)="openCalendar(); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="(label() || 'Date range') + ' end'"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <span class="spacer"></span>
        <button
          type="button"
          class="ngx-datepicker__toggle"
          [disabled]="isDisabled()"
          aria-label="Open calendar"
          tabindex="-1"
          (click)="toggleCalendar()"
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
          <div class="ngx-datepicker__backdrop" (click)="closeCalendar()"></div>
        }
        <div
          class="ngx-datepicker__popup"
          [class.ngx-datepicker__popup--above]="position() === 'above'"
          [class.ngx-datepicker__popup--overlay]="position() === 'overlay'"
        >
          <ngx-range-calendar
            #calendar
            [rangeStart]="parsedStart()"
            [rangeEnd]="parsedEnd()"
            [minDate]="parsedMinDate()"
            [maxDate]="parsedMaxDate()"
            [ariaLabel]="label() ? 'Choose ' + label() : 'Choose date range'"
            (rangePicked)="onRangePicked($event)"
            (closed)="closeCalendar()"
          />
        </div>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxDateRangePickerComponent extends NgxBaseControl<NgxDateRange | null> {
  readonly label = input<string>("");
  readonly startPlaceholder = input<string>("Start");
  readonly endPlaceholder = input<string>("End");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);

  protected readonly fieldId = `ngx-daterange-${NgxBaseControl.nextId()}`;

  /** Whether the calendar popup is open. */
  protected readonly open = signal(false);
  /** Computed popup position. */
  protected readonly position = signal<OverlayPosition>("below");
  /** Which input was last focused — drives calendar sync. */
  protected readonly lastFocused = signal<"start" | "end">("start");

  private readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");
  private readonly calendarRef =
    viewChild<NgxRangeCalendarComponent>("calendar");
  private readonly hostRef = inject(ElementRef);

  // ── Derived state ─────────────────────────────────────────────────────────────

  protected readonly displayStart = computed((): string => {
    const v = this.value()?.start;
    return v ? v.substring(0, 10) : "";
  });

  protected readonly displayEnd = computed((): string => {
    const v = this.value()?.end;
    return v ? v.substring(0, 10) : "";
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

  // ── Calendar open/close ──────────────────────────────────────────────────────

  protected toggleCalendar(): void {
    if (this.isDisabled()) return;
    if (this.open()) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  protected openCalendar(): void {
    if (this.isDisabled() || this.open()) return;
    this.open.set(true);
    this.position.set(
      computeOverlayPosition(this.hostRef.nativeElement as HTMLElement),
    );
    setTimeout(
      () => this.calendarRef()?.syncView(this.parsedStart(), this.parsedEnd()),
      0,
    );
  }

  protected closeCalendar(): void {
    this.open.set(false);
  }

  // ── Range picked from calendar ───────────────────────────────────────────────

  protected onRangePicked(range: {
    readonly start: CalendarDate;
    readonly end: CalendarDate;
  }): void {
    this.setValue({
      start: formatIsoDate(range.start),
      end: formatIsoDate(range.end),
    });
    this.markAsDirty();
    this.closeCalendar();
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
    // Re-display the canonical value (clamp visual)
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

    // Clamp: if both are set and end < start → set end = start
    if (s && e && compareDates(e, s) < 0) {
      finalEnd = finalStart;
    }

    this.setValue({ start: finalStart, end: finalEnd });
    this.markAsDirty();
  }

  // ── Click outside ────────────────────────────────────────────────────────────

  protected onDocumentClick(event: Event): void {
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.closeCalendar();
    }
  }
}

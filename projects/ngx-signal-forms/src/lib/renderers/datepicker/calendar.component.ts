import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import {
  addDays,
  addMonths,
  CalendarDate,
  daysInMonth,
  today,
} from "../../core/date-utils";
import { NgxCalendarGridComponent } from "./calendar-grid.component";
import { NgxCalendarHeaderComponent } from "./calendar-header.component";

/**
 * Calendar container — orchestrates header navigation, grid rendering,
 * keyboard navigation, and date selection.
 *
 * This component owns the "current view" state (year/month) and the
 * focused-date for roving keyboard navigation. It does **not** manage
 * the form field value — that responsibility stays in the renderer.
 *
 * ```html
 * <ngx-calendar
 *   [selectedDate]="selected"
 *   [minDate]="min"
 *   [maxDate]="max"
 *   (datePicked)="onPick($event)"
 * />
 * ```
 */
@Component({
  selector: "ngx-calendar",
  standalone: true,
  imports: [NgxCalendarHeaderComponent, NgxCalendarGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-datepicker__calendar",
    role: "dialog",
    "aria-modal": "true",
    "[attr.aria-label]": "ariaLabel()",
    "(keydown)": "onKeydown($event)",
  },
  template: `
    <ngx-calendar-header
      [year]="viewYear()"
      [month]="viewMonth()"
      (previousMonth)="goToPreviousMonth()"
      (nextMonth)="goToNextMonth()"
    />
    <ngx-calendar-grid
      [year]="viewYear()"
      [month]="viewMonth()"
      [selectedDate]="selectedDate()"
      [focusedDate]="focusedDate()"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      (datePicked)="onDatePicked($event)"
    />
  `,
})
export class NgxCalendarComponent {
  readonly selectedDate = input<CalendarDate | null>(null);
  readonly minDate = input<CalendarDate | null>(null);
  readonly maxDate = input<CalendarDate | null>(null);
  /** Accessible label for the dialog. */
  readonly ariaLabel = input<string>("Choose date");

  /** Emits when the user confirms a date. */
  readonly datePicked = output<CalendarDate>();
  /** Emits on Escape — parent must close the popup. */
  readonly closed = output<void>();

  // ── View state ──────────────────────────────────────────────────────────────

  /** Year currently displayed. */
  protected readonly viewYear = signal(today().year);
  /** Month (1-based) currently displayed. */
  protected readonly viewMonth = signal(today().month);
  /** Date that has keyboard focus (roving tabindex). */
  protected readonly focusedDate = signal<CalendarDate>(today());

  /**
   * Sync the view to the selected date when the popup opens.
   * Called by the parent renderer after opening.
   */
  syncView(date: CalendarDate | null): void {
    const d = date ?? today();
    this.viewYear.set(d.year);
    this.viewMonth.set(d.month);
    this.focusedDate.set(d);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  protected goToPreviousMonth(): void {
    this.navigateMonth(-1);
  }

  protected goToNextMonth(): void {
    this.navigateMonth(1);
  }

  private navigateMonth(delta: number): void {
    const moved = addMonths(
      { year: this.viewYear(), month: this.viewMonth(), day: 1 },
      delta,
    );
    this.viewYear.set(moved.year);
    this.viewMonth.set(moved.month);
    // Move focus to same day (clamped) in new month
    const focused = this.focusedDate();
    const newFocused = addMonths(focused, delta);
    this.focusedDate.set(newFocused);
  }

  // ── Date picked ─────────────────────────────────────────────────────────────

  protected onDatePicked(date: CalendarDate): void {
    this.focusedDate.set(date);
    this.datePicked.emit(date);
  }

  // ── Keyboard navigation (M3 spec) ──────────────────────────────────────────

  protected onKeydown(event: KeyboardEvent): void {
    const focused = this.focusedDate();
    let next: CalendarDate | null = null;

    switch (event.key) {
      case "ArrowLeft":
        next = addDays(focused, -1);
        break;
      case "ArrowRight":
        next = addDays(focused, 1);
        break;
      case "ArrowUp":
        next = addDays(focused, -7);
        break;
      case "ArrowDown":
        next = addDays(focused, 7);
        break;
      case "PageUp":
        next = event.shiftKey
          ? { year: focused.year - 1, month: focused.month, day: focused.day }
          : addMonths(focused, -1);
        break;
      case "PageDown":
        next = event.shiftKey
          ? { year: focused.year + 1, month: focused.month, day: focused.day }
          : addMonths(focused, 1);
        break;
      case "Home":
        next = { year: focused.year, month: focused.month, day: 1 };
        break;
      case "End": {
        const lastDay = daysInMonth(focused.year, focused.month);
        next = { year: focused.year, month: focused.month, day: lastDay };
        break;
      }
      case "Escape":
        event.preventDefault();
        this.closed.emit();
        return;
      default:
        return; // Don't prevent default for unhandled keys
    }

    if (next) {
      event.preventDefault();
      this.focusedDate.set(next);
      // Ensure the view follows the focused date
      if (next.year !== this.viewYear() || next.month !== this.viewMonth()) {
        this.viewYear.set(next.year);
        this.viewMonth.set(next.month);
      }
    }
  }
}

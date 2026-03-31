import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  addDays,
  addMonths,
  CalendarDate,
  daysInMonth,
  isDateInRange,
  today,
} from "../../core/date-utils";
import { NgxCalendarGridComponent } from "./calendar-grid.component";
import { NgxCalendarHeaderComponent } from "./calendar-header.component";
import { NgxMonthPickerComponent } from "./month-picker.component";
import { NgxYearPickerComponent } from "./year-picker.component";

type CalendarView = "calendar" | "month" | "year";

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
  imports: [
    NgxCalendarHeaderComponent,
    NgxCalendarGridComponent,
    NgxMonthPickerComponent,
    NgxYearPickerComponent,
  ],
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
      (toggleView)="onToggleView()"
    />

    @if (view() === "calendar") {
      <ngx-calendar-grid
        [year]="viewYear()"
        [month]="viewMonth()"
        [selectedDate]="selectedDate()"
        [focusedDate]="focusedDate()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        (datePicked)="onDatePicked($event)"
      />
    } @else if (view() === "month") {
      <ngx-month-picker
        [viewYear]="viewYear()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        [currentMonth]="viewMonth()"
        (monthSelected)="onMonthSelected($event)"
      />
    } @else if (view() === "year") {
      <ngx-year-picker
        [currentYear]="viewYear()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        (yearSelected)="onYearSelected($event)"
      />
    }

  `,
})
export class NgxCalendarComponent {
  readonly selectedDate = input<CalendarDate | null>(null);
  readonly minDate = input<CalendarDate | null>(null);
  readonly maxDate = input<CalendarDate | null>(null);

  protected readonly view = signal<CalendarView>("calendar");

  private readonly grid = viewChild(NgxCalendarGridComponent);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const date = this.focusedDate();
      // We use a small timeout to ensure the grid has rendered the new date
      // before we try to focus it.
      afterNextRender(() => this.grid()?.focusDate(date), { injector: this.injector });
    });
  }

  /** Manually focuses the currently focused date cell. */
  focusFocusedDate(): void {
    const focused = this.focusedDate();
    this.grid()?.focusDate(focused);
  }
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
   * Resets view to 'calendar'.
   */
  syncView(date: CalendarDate | null): void {
    const d = date ?? today();
    this.viewYear.set(d.year);
    this.viewMonth.set(d.month);
    this.focusedDate.set(d);
    this.view.set("calendar");
  }

  protected onToggleView(): void {
    const current = this.view();
    if (current === "calendar") {
      this.view.set("year");
    } else {
      this.view.set("calendar");
    }
  }

  protected onMonthSelected(month: number): void {
    this.viewMonth.set(month);
    this.view.set("calendar");
    // Update focused date to same day in new month
    const focused = this.focusedDate();
    this.focusedDate.set({ ...focused, month });
  }

  protected onYearSelected(year: number): void {
    this.viewYear.set(year);
    this.view.set("month");
    // Update focused date to same day in new year
    const focused = this.focusedDate();
    this.focusedDate.set({ ...focused, year });
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
      case "Enter":
      case " ":
        if (isDateInRange(focused, this.minDate(), this.maxDate())) {
          event.preventDefault();
          this.onDatePicked(focused);
        }
        return;
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

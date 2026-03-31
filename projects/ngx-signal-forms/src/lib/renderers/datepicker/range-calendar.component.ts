import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
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
  compareDates,
  daysInMonth,
  today,
} from "../../core/date-utils";
import { NgxCalendarHeaderComponent } from "./calendar-header.component";
import { NgxRangeCalendarGridComponent } from "./range-calendar-grid.component";
import { NgxMonthPickerComponent } from "./month-picker.component";
import { NgxYearPickerComponent } from "./year-picker.component";

/** Selection phase for range picking. */
type RangePhase = "pick-start" | "pick-end";

type CalendarView = "calendar" | "month" | "year";

/**
 * Range calendar container — orchestrates header navigation, grid rendering,
 * keyboard navigation, and two-step date range selection.
 */
@Component({
  selector: "ngx-range-calendar",
  standalone: true,
  imports: [
    NgxCalendarHeaderComponent,
    NgxRangeCalendarGridComponent,
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
      <ngx-range-calendar-grid
        [year]="viewYear()"
        [month]="viewMonth()"
        [rangeStart]="pendingStart()"
        [rangeEnd]="pendingEnd()"
        [hoverDate]="hoverDate()"
        [focusedDate]="focusedDate()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        (datePicked)="onDatePicked($event)"
        (dateHovered)="onDateHovered($event)"
      />
      <div class="ngx-daterange__hint" aria-live="polite">
        {{ phaseHint() }}
      </div>
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
export class NgxRangeCalendarComponent {
  readonly rangeStart = input<CalendarDate | null>(null);
  readonly rangeEnd = input<CalendarDate | null>(null);
  readonly minDate = input<CalendarDate | null>(null);
  readonly maxDate = input<CalendarDate | null>(null);
  readonly ariaLabel = input<string>("Choose date range");

  readonly rangePicked = output<{
    readonly start: CalendarDate;
    readonly end: CalendarDate;
  }>();
  readonly closed = output<void>();

  private readonly grid = viewChild(NgxRangeCalendarGridComponent);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const date = this.focusedDate();
      afterNextRender(() => this.grid()?.focusDate(date), { injector: this.injector });
    });
  }

  focusFocusedDate(): void {
    const focused = this.focusedDate();
    this.grid()?.focusDate(focused);
  }

  // ── View state ───────────────────────────────────────────────────────────────

  protected readonly view = signal<CalendarView>("calendar");
  protected readonly viewYear = signal(today().year);
  protected readonly viewMonth = signal(today().month);
  protected readonly focusedDate = signal<CalendarDate>(today());
  protected readonly hoverDate = signal<CalendarDate | null>(null);

  private readonly phase = signal<RangePhase>("pick-start");
  protected readonly pendingStart = signal<CalendarDate | null>(null);
  protected readonly pendingEnd = signal<CalendarDate | null>(null);

  protected readonly phaseHint = computed((): string =>
    this.phase() === "pick-start"
      ? "Click to set the start date"
      : "Click to set the end date",
  );

  syncView(start: CalendarDate | null, end: CalendarDate | null): void {
    const d = start ?? today();
    this.viewYear.set(d.year);
    this.viewMonth.set(d.month);
    this.focusedDate.set(d);
    this.pendingStart.set(start);
    this.pendingEnd.set(end);
    this.phase.set(start && !end ? "pick-end" : "pick-start");
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
    const focused = this.focusedDate();
    this.focusedDate.set({ ...focused, month });
  }

  protected onYearSelected(year: number): void {
    this.viewYear.set(year);
    this.view.set("month");
    const focused = this.focusedDate();
    this.focusedDate.set({ ...focused, year });
  }

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
    const newFocused = addMonths(this.focusedDate(), delta);
    this.focusedDate.set(newFocused);
  }

  protected onDatePicked(date: CalendarDate): void {
    this.focusedDate.set(date);

    if (this.phase() === "pick-start") {
      this.pendingStart.set(date);
      this.pendingEnd.set(null);
      this.phase.set("pick-end");
    } else {
      const start = this.pendingStart();
      if (!start) {
        this.pendingStart.set(date);
        this.phase.set("pick-end");
        return;
      }
      const [s, e] =
        compareDates(start, date) <= 0 ? [start, date] : [date, start];
      this.pendingStart.set(s);
      this.pendingEnd.set(e);
      this.rangePicked.emit({ start: s, end: e });
    }
  }

  protected onDateHovered(date: CalendarDate): void {
    if (this.phase() === "pick-end") {
      this.hoverDate.set(date);
    }
  }

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
      case "Enter":
      case " ":
        event.preventDefault();
        this.onDatePicked(focused);
        return;
      case "Escape":
        event.preventDefault();
        this.closed.emit();
        return;
      default:
        return;
    }

    if (next) {
      event.preventDefault();
      this.focusedDate.set(next);
      if (next.year !== this.viewYear() || next.month !== this.viewMonth()) {
        this.viewYear.set(next.year);
        this.viewMonth.set(next.month);
      }
      if (this.phase() === "pick-end") {
        this.hoverDate.set(next);
      }
    }
  }
}

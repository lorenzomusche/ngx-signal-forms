import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { NGX_DATE_LOCALE } from "../../core/date-locale";

/**
 * Calendar header — displays the current month/year label and
 * navigation arrows (prev/next month).
 *
 * ```html
 * <ngx-calendar-header
 *   [year]="2026"
 *   [month]="3"
 *   (previousMonth)="goPrev()"
 *   (nextMonth)="goNext()"
 * />
 * ```
 */
@Component({
  selector: "ngx-calendar-header",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-datepicker__header" },
  template: `
    <button
      type="button"
      class="ngx-datepicker__nav-btn"
      aria-label="Previous month"
      (click)="previousMonth.emit()"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <span class="ngx-datepicker__title" aria-live="polite">
      {{ monthLabel() }} {{ year() }}
    </span>

    <button
      type="button"
      class="ngx-datepicker__nav-btn"
      aria-label="Next month"
      (click)="nextMonth.emit()"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  `,
})
export class NgxCalendarHeaderComponent {
  readonly year = input.required<number>();
  /** 1-based month (1 = January). */
  readonly month = input.required<number>();

  readonly previousMonth = output<void>();
  readonly nextMonth = output<void>();

  private readonly locale = inject(NGX_DATE_LOCALE);

  /** Localized month name (e.g. "March", "Marzo"). */
  protected readonly monthLabel = computed(
    (): string => this.locale.monthNamesLong[this.month() - 1] ?? "",
  );
}

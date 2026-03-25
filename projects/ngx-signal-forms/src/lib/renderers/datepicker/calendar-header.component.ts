import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { NGX_DATE_LOCALE } from "../../core/date-locale";
import { NgxIconComponent } from "../../control/ngx-icon.component";

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
  imports: [NgxIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-datepicker__header" },
  template: `
    <div class="ngx-datepicker__header-label">
      <button
        type="button"
        class="ngx-datepicker__view-toggle"
        (click)="toggleView.emit()"
        [attr.aria-label]="'Change view, currently ' + monthLabel() + ' ' + year()"
      >
        <span class="ngx-datepicker__title">
          {{ monthLabel() }} {{ year() }}
        </span>
        <ngx-icon name="CHEVRON_DOWN" class="ngx-datepicker__view-icon" />
      </button>
    </div>

    <div class="ngx-datepicker__header-nav">
      <button
        type="button"
        class="ngx-datepicker__nav-btn"
        aria-label="Previous month"
        (click)="previousMonth.emit()"
      >
        <ngx-icon name="CHEVRON_LEFT" />
      </button>

      <button
        type="button"
        class="ngx-datepicker__nav-btn"
        aria-label="Next month"
        (click)="nextMonth.emit()"
      >
        <ngx-icon name="CHEVRON_RIGHT" />
      </button>
    </div>
  `,
})
export class NgxCalendarHeaderComponent {
  readonly year = input.required<number>();
  /** 1-based month (1 = January). */
  readonly month = input.required<number>();

  readonly previousMonth = output<void>();
  readonly nextMonth = output<void>();
  readonly toggleView = output<void>();

  private readonly locale = inject(NGX_DATE_LOCALE);

  /** Localized month name (e.g. "March", "Marzo"). */
  protected readonly monthLabel = computed(
    (): string => this.locale.monthNamesLong[this.month() - 1] ?? "",
  );
}

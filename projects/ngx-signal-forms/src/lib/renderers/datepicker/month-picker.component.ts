import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { NGX_DATE_LOCALE } from "../../core/date-locale";

@Component({
  selector: "ngx-month-picker",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-datepicker__month-picker" },
  template: `
    @for (monthName of months(); track $index) {
      <button
        type="button"
        class="ngx-datepicker__month-cell"
        [class.ngx-datepicker__month-cell--selected]="currentMonth() === $index + 1"
        (click)="monthSelected.emit($index + 1)"
      >
        {{ monthName }}
      </button>
    }
  `,
})
export class NgxMonthPickerComponent {
  readonly currentMonth = input.required<number>();
  readonly monthSelected = output<number>();

  private readonly locale = inject(NGX_DATE_LOCALE);

  protected readonly months = computed(() => this.locale.monthNamesShort);
}

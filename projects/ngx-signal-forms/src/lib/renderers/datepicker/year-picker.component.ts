import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";

@Component({
  selector: "ngx-year-picker",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-datepicker__year-picker" },
  template: `
    <div class="ngx-datepicker__year-grid">
      @for (yearNum of years(); track $index) {
        <button
          type="button"
          class="ngx-datepicker__year-cell"
          [class.ngx-datepicker__year-cell--selected]="currentYear() === yearNum"
          (click)="yearSelected.emit(yearNum)"
        >
          {{ yearNum }}
        </button>
      }
    </div>
  `,
})
export class NgxYearPickerComponent {
  readonly currentYear = input.required<number>();
  readonly yearSelected = output<number>();

  protected readonly years = computed(() => {
    const cur = this.currentYear();
    const start = Math.floor(cur / 10) * 10 - 20; // 24 years centered
    const result: number[] = [];
    for (let i = 0; i < 24; i++) {
       result.push(start + i);
    }
    return result;
  });
}

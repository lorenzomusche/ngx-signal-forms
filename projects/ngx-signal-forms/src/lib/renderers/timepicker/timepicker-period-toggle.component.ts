import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  selector: "ngx-timepicker-period-toggle",
  standalone: true,
  template: `
    <div class="ngx-timepicker-period-toggle" [class.ngx-timepicker-period-toggle--compact]="compact()">
      <button
        type="button"
        class="ngx-timepicker-period-btn"
        [class.ngx-timepicker-period-btn--selected]="period() === 'AM'"
        [disabled]="disabled()"
        (click)="periodChange.emit('AM')"
      >
        AM
      </button>
      <button
        type="button"
        class="ngx-timepicker-period-btn"
        [class.ngx-timepicker-period-btn--selected]="period() === 'PM'"
        [disabled]="disabled()"
        (click)="periodChange.emit('PM')"
      >
        PM
      </button>
    </div>
  `,
  styleUrls: ["./timepicker-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTimepickerPeriodToggleComponent {
  readonly period   = input.required<'AM' | 'PM'>();
  readonly disabled = input<boolean>(false);
  readonly compact  = input<boolean>(false);
  readonly periodChange = output<'AM' | 'PM'>();
}

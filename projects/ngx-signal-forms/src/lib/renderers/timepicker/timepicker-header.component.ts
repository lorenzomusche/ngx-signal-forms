import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { NgxTimepickerSegmentComponent } from "./timepicker-segment.component";
import { NgxTimepickerPeriodToggleComponent } from "./timepicker-period-toggle.component";

@Component({
  selector: "ngx-timepicker-header",
  standalone: true,
  imports: [NgxTimepickerSegmentComponent, NgxTimepickerPeriodToggleComponent],
  template: `
    <div class="ngx-timepicker-header">
      <div class="ngx-timepicker-fields">
        <ngx-timepicker-segment
          [value]="hour()"
          label="Hour"
          [active]="focusedField() === 'hour'"
          [disabled]="disabled()"
          [readonly]="viewMode() === 'dial'"
          [showLabel]="viewMode() === 'input'"
          (inputChange)="hourInput.emit($event)"
          (focused)="fieldFocus.emit('hour')"
          (clicked)="fieldClick.emit('hour')"
        />

        <span class="ngx-timepicker-separator">:</span>

        <ngx-timepicker-segment
          [value]="minute()"
          label="Minute"
          [active]="focusedField() === 'minute'"
          [disabled]="disabled()"
          [readonly]="viewMode() === 'dial'"
          [showLabel]="viewMode() === 'input'"
          (inputChange)="minuteInput.emit($event)"
          (focused)="fieldFocus.emit('minute')"
          (clicked)="fieldClick.emit('minute')"
        />
      </div>

      <ngx-timepicker-period-toggle
        [period]="period()"
        [disabled]="disabled()"
        (periodChange)="periodChange.emit($event)"
      />
    </div>
  `,
  styleUrls: ["./timepicker-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTimepickerHeaderComponent {
  readonly hour = input.required<string>();
  readonly minute = input.required<string>();
  readonly period = input.required<'AM' | 'PM'>();
  readonly focusedField = input.required<'hour' | 'minute'>();
  readonly viewMode = input.required<'input' | 'dial'>();
  readonly disabled = input<boolean>(false);

  readonly hourInput = output<Event>();
  readonly minuteInput = output<Event>();
  readonly fieldFocus = output<'hour' | 'minute'>();
  readonly fieldClick = output<'hour' | 'minute'>();
  readonly periodChange = output<'AM' | 'PM'>();
}

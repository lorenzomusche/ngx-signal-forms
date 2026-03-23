import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from "@angular/core";
import { CalendarCell, CalendarDate } from "../../core/date-utils";

/**
 * A single day cell in the calendar grid.
 *
 * Handles rendering, selection highlight, today indicator,
 * disabled state, and click/keyboard interaction.
 *
 * ```html
 * <ngx-calendar-cell
 *   [cell]="cell"
 *   [isSelected]="true"
 *   [isToday]="false"
 *   [isFocused]="false"
 *   [isDisabled]="false"
 *   (picked)="onPick($event)"
 * />
 * ```
 */
@Component({
  selector: "ngx-calendar-cell",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-datepicker__cell",
    "[class.ngx-datepicker__cell--outside]": "!cell().inMonth",
    "[class.ngx-datepicker__cell--today]": "isToday()",
    "[class.ngx-datepicker__cell--selected]": "isSelected()",
    "[class.ngx-datepicker__cell--focused]": "isFocused()",
    "[class.ngx-datepicker__cell--disabled]": "isDisabled()",
    role: "gridcell",
    "[attr.aria-selected]": "isSelected()",
    "[attr.aria-disabled]": "isDisabled()",
    "[attr.aria-current]": "isToday() ? 'date' : null",
    "[attr.tabindex]": "isFocused() ? 0 : -1",
    "(click)": "onSelect()",
    "(keydown.enter)": "onSelect()",
    "(keydown.space)": "onSelect(); $event.preventDefault()",
  },
  template: `{{ cell().date.day }}`,
})
export class NgxCalendarCellComponent {
  readonly cell = input.required<CalendarCell>();
  readonly isSelected = input<boolean>(false);
  readonly isToday = input<boolean>(false);
  readonly isFocused = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);

  /** Emits the picked date when the cell is activated. */
  readonly picked = output<CalendarDate>();

  private readonly elementRef = inject(ElementRef);

  /** Focuses the host element of this cell. */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  protected onSelect(): void {
    if (!this.isDisabled()) {
      this.picked.emit(this.cell().date);
    }
  }
}

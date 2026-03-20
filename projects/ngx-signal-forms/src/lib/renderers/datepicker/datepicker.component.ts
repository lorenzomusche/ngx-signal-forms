import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import { CalendarDate, formatIsoDate, parseIsoDate } from "../../core/date-utils";
import {
  computeOverlayPosition,
  OverlayPosition,
} from "../../core/overlay-position";
import { NgxCalendarComponent } from "./calendar.component";

/**
 * Date picker renderer — M3-style docked calendar picker.
 *
 * Replaces the native `<input type="date">` with a text input + calendar
 * popup. Works exclusively with ISO `YYYY-MM-DD` strings.
 *
 * ```html
 * <ngx-control-datepicker
 *   name="birthDate"
 *   label="Date of Birth"
 *   minDate="1900-01-01"
 *   maxDate="2026-12-31"
 * />
 * ```
 */
@Component({
  selector: "ngx-control-datepicker",
  standalone: true,
  imports: [
    NgxCalendarComponent,
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--datepicker",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-datepicker__input-group">
        <input
          #inputEl
          type="text"
          [id]="fieldId"
          class="ngx-datepicker__input"
          [value]="displayValue()"
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          (blur)="onInputBlur()"
          (keydown.arrowdown)="openCalendar(); $event.preventDefault()"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          autocomplete="off"
        />
        <button
          type="button"
          class="ngx-datepicker__toggle"
          [disabled]="isDisabled()"
          aria-label="Open calendar"
          tabindex="-1"
          (click)="toggleCalendar()"
        >
          <svg
            class="ngx-datepicker__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
            />
          </svg>
        </button>
      </div>

      @if (open()) {
        @if (position() === "overlay") {
          <div class="ngx-datepicker__backdrop" (click)="closeCalendar()"></div>
        }
        <div
          class="ngx-datepicker__popup"
          [class.ngx-datepicker__popup--above]="position() === 'above'"
          [class.ngx-datepicker__popup--overlay]="position() === 'overlay'"
        >
          <ngx-calendar
            #calendar
            [selectedDate]="parsedSelectedDate()"
            [minDate]="parsedMinDate()"
            [maxDate]="parsedMaxDate()"
            [ariaLabel]="label() ? 'Choose ' + label() : 'Choose date'"
            (datePicked)="onDatePicked($event)"
            (closed)="closeCalendar()"
          />
        </div>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxDatePickerComponent extends NgxBaseControl<string | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("YYYY-MM-DD");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);

  protected readonly fieldId = `ngx-control-datepicker-${NgxBaseControl.nextId()}`;

  /** Whether the calendar popup is open. */
  protected readonly open = signal(false);
  /** Computed popup position. */
  protected readonly position = signal<OverlayPosition>("below");

  private readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");
  private readonly calendarRef = viewChild<NgxCalendarComponent>("calendar");
  private readonly hostRef = inject(ElementRef);

  // ── Derived state ───────────────────────────────────────────────────────────

  /** The display value in the text input. */
  protected readonly displayValue = computed((): string => this.value() ?? "");

  /** Parse the current field value into a CalendarDate. */
  protected readonly parsedSelectedDate = computed((): CalendarDate | null =>
    parseIsoDate(this.value()),
  );

  protected readonly parsedMinDate = computed((): CalendarDate | null =>
    parseIsoDate(this.minDate()),
  );

  protected readonly parsedMaxDate = computed((): CalendarDate | null =>
    parseIsoDate(this.maxDate()),
  );

  // ── Calendar open/close ─────────────────────────────────────────────────────

  protected toggleCalendar(): void {
    if (this.isDisabled()) return;
    if (this.open()) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  protected openCalendar(): void {
    if (this.isDisabled() || this.open()) return;
    this.open.set(true);
    this.position.set(
      computeOverlayPosition(this.hostRef.nativeElement as HTMLElement),
    );
    // Sync calendar view to current value after DOM renders
    setTimeout(
      () => this.calendarRef()?.syncView(this.parsedSelectedDate()),
      0,
    );
  }

  protected closeCalendar(): void {
    this.open.set(false);
  }

  // ── Date picked from calendar ───────────────────────────────────────────────

  protected onDatePicked(date: CalendarDate): void {
    this.setValue(formatIsoDate(date));
    this.markAsDirty();
    this.closeCalendar();
  }

  // ── Text input handling ─────────────────────────────────────────────────────

  protected onInputChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (!raw) {
      this.setValue(null);
      this.markAsDirty();
      return;
    }
    // Only commit when the input looks like a valid ISO date
    const parsed = parseIsoDate(raw);
    if (parsed) {
      this.setValue(formatIsoDate(parsed));
      this.markAsDirty();
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
    // If the popup isn't open, validate the raw input
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(document.activeElement)) {
      // Let the field value stand as-is; validation will catch bad input
    }
  }

  // ── Click outside ───────────────────────────────────────────────────────────

  protected onDocumentClick(event: Event): void {
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.closeCalendar();
    }
  }
}

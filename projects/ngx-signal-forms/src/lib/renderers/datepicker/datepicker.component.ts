import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NGX_DATE_LOCALE } from "../../core/date-locale";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import {
  CalendarDate,
  formatIsoDate,
  parseIsoDate,
  today,
} from "../../core/date-utils";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { NgxCalendarComponent } from "./calendar.component";

/**
 * Date picker renderer — M3-style docked calendar picker.
 * Integrated with NgxControlLabelComponent.
 */
@Component({
  selector: "ngx-control-datepicker",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxCalendarComponent,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--datepicker",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="value() !== null"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    <div class="ngx-datepicker" #wrapper>
      <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">
        @if (prefix(); as p) {
           <div class="ngx-input-prefix">
             <ng-container [ngTemplateOutlet]="p.template" />
           </div>
        }
        <input
          [id]="fieldId"
          type="text"
          class="ngx-datepicker__input"
          [placeholder]="placeholder()"
          [value]="displayValue()"
          [disabled]="isDisabled()"
          readonly
          (click)="toggleOverlay()"
          (blur)="markAsTouched()"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'dialog'"
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired() || isRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
        />
        <div class="ngx-input-suffix">
           @if (suffix(); as s) {
             <ng-container [ngTemplateOutlet]="s.template" />
           } @else {
             <button
                type="button"
                class="ngx-datepicker__toggle"
                [disabled]="isDisabled()"
                (click)="toggleOverlay()"
                aria-label="Toggle calendar"
              >
                 <ngx-icon name="CALENDAR" class="ngx-datepicker__icon" />
              </button>
           }
        </div>
      </div>

      @if (open()) {
        @if (variant() === 'modal' || position() === "overlay") {
          <div class="ngx-datepicker__backdrop" (click)="closeOverlay()"></div>
        }
        <div
          class="ngx-datepicker__popup"
          [class.ngx-datepicker__popup--modal]="variant() === 'modal' || position() === 'overlay'"
          [class.ngx-datepicker__popup--above]="position() === 'above' && variant() !== 'modal'"
          [class.ngx-datepicker__popup--right]="alignment() === 'right' && variant() !== 'modal'"
        >
          @if (variant() === 'modal') {
             <div class="ngx-datepicker__modal-header">
                <span class="ngx-datepicker__modal-label">{{ label() || 'Select date' }}</span>
                <span class="ngx-datepicker__modal-value">{{ modalDisplayValue() }}</span>
             </div>
          }

          <ngx-calendar
            #calendar
            [selectedDate]="variant() === 'modal' ? tempSelectedDate() : parsedSelectedDate()"
            [minDate]="parsedMinDate()"
            [maxDate]="parsedMaxDate()"
            [ariaLabel]="label() ? 'Choose ' + label() : 'Choose date'"
            (datePicked)="onDatePicked($event)"
            (closed)="closeOverlay()"
          />

          @if (variant() === 'modal') {
             <div class="ngx-datepicker__actions">
                <button type="button" class="ngx-datepicker__action-btn" (click)="closeOverlay()">Cancel</button>
                <button type="button" class="ngx-datepicker__action-btn ngx-datepicker__action-btn--primary" (click)="applySelection()">OK</button>
             </div>
          }
        </div>
      }
    </div>

    @if (supportingText(); as st) {
      <div class="ngx-supporting-text">
        <ng-container [ngTemplateOutlet]="st.template" />
      </div>
    }
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxDatePickerComponent extends NgxOverlayControl<string | null> {
  readonly placeholder = input<string>("YYYY-MM-DD");
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly variant = input<"docked" | "modal">("docked");

  protected override readonly minSpace = 380;
  protected override readonly minWidth = 320;

  protected readonly fieldId = `ngx-control-datepicker-${NgxBaseControl.nextId()}`;

  private readonly calendarRef = viewChild<NgxCalendarComponent>("calendar");
  private readonly locale = inject(NGX_DATE_LOCALE);

  // ── Derived state ───────────────────────────────────────────────────────────

  protected readonly tempSelectedDate = signal<CalendarDate | null>(null);

  protected readonly displayValue = computed((): string => {
    const v = this.value();
    if (!v) return "";
    return v.substring(0, 10);
  });

  protected readonly modalDisplayValue = computed((): string => {
    try {
      const d = this.tempSelectedDate() ?? this.parsedSelectedDate() ?? today();
      const date = new Date(d.year, d.month - 1, d.day);
      return new Intl.DateTimeFormat(this.locale.locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return "Select date";
    }
  });

  protected readonly parsedSelectedDate = computed((): CalendarDate | null =>
    parseIsoDate(this.value()),
  );

  protected readonly parsedMinDate = computed((): CalendarDate | null =>
    parseIsoDate(this.minDate()),
  );

  protected readonly parsedMaxDate = computed((): CalendarDate | null =>
    parseIsoDate(this.maxDate()),
  );

  protected override onBeforeOpen(): void {
    this.tempSelectedDate.set(this.parsedSelectedDate());
    setTimeout(() => {
      const cal = this.calendarRef();
      if (!cal) return;
      cal.syncView(this.tempSelectedDate());
      cal.focusFocusedDate();
    }, 0);
  }

  protected applySelection(): void {
    const d = this.tempSelectedDate();
    if (d) {
      this.onDatePicked(d, true);
    } else {
      this.closeOverlay();
    }
  }

  protected onDatePicked(date: CalendarDate, forceApply = false): void {
    if (this.variant() === "modal" && !forceApply) {
      this.tempSelectedDate.set(date);
      return;
    }
    const isoString = formatIsoDate(date);
    this.setValue(isoString);
    this.markAsDirty();
    this.closeOverlay();
  }

  protected onInputChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (!raw) {
      this.setValue(null);
      this.markAsDirty();
      return;
    }
    const parsed = parseIsoDate(raw);
    if (parsed) {
      const isoString = formatIsoDate(parsed);
      this.setValue(isoString);
      this.markAsDirty();
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
  }
}

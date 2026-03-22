import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import {
  computeOverlayPosition,
  OverlayPosition,
} from "../../core/overlay-position";
import { NgxTimepickerClockComponent } from "./timepicker-clock.component";

/**
 * Timepicker renderer — M3-style input with clock overlay.
 */
@Component({
  selector: "ngx-control-timepicker",
  standalone: true,
  imports: [
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
    NgxTimepickerClockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--timepicker",
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

    <div class="ngx-timepicker" #wrapper>
      <div class="ngx-timepicker__input-group">
        <input
          #inputEl
          type="text"
          [id]="fieldId"
          class="ngx-timepicker__input"
          [value]="value() || ''"
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          (blur)="onInputBlur()"
          (keydown.arrowdown)="openPicker(); $event.preventDefault()"
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
          class="ngx-timepicker__toggle"
          [disabled]="isDisabled()"
          aria-label="Open time picker"
          tabindex="-1"
          (click)="togglePicker()"
        >
          <svg
            class="ngx-timepicker__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      @if (open()) {
        @if (position() === "overlay") {
          <div class="ngx-timepicker__backdrop" (click)="closePicker()"></div>
        }
        <div
          class="ngx-timepicker__popup"
          [class.ngx-timepicker__popup--above]="position() === 'above'"
          [class.ngx-timepicker__popup--overlay]="position() === 'overlay'"
        >
          <ngx-timepicker-clock
            [value]="draftValue()"
            [disabled]="isDisabled()"
            (timePicked)="onTimePicked($event)"
            (cancelClicked)="closePicker()"
            (confirmClicked)="confirmPicker()"
          />
        </div>
      }
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
  styles: [`
    :host { display: block; }
    .ngx-timepicker { position: relative; }
    .ngx-timepicker__input-group {
      display: flex;
      align-items: center;
      position: relative;
    }
    .ngx-timepicker__input {
      flex: 1;
      width: 100%;
    }
    .ngx-timepicker__toggle {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      color: var(--ngx-input-icon-color);
      border-radius: 4px;
    }
    .ngx-timepicker__toggle:hover:not(:disabled) {
      background: var(--ngx-surface-container-highest-hover, rgba(0,0,0,0.06));
    }
    .ngx-timepicker__icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    .ngx-timepicker__popup {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;
      margin-top: 0.25rem;
    }
    .ngx-timepicker__popup--above {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 0.25rem;
    }
    .ngx-timepicker__popup--overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
    }
    .ngx-timepicker__backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      background: rgba(0,0,0,0.1);
    }
  `]
})
export class NgxTimepickerComponent extends NgxBaseControl<string | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("hh:mm AM/PM");

  protected readonly fieldId = `ngx-control-timepicker-${NgxBaseControl.nextId()}`;
  protected readonly open = signal(false);
  protected readonly position = signal<OverlayPosition>("below");
  protected readonly draftValue = signal<string | null>(null);

  private readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");
  private readonly hostRef = inject(ElementRef);

  protected togglePicker(): void {
    if (this.isDisabled()) return;
    this.open() ? this.closePicker() : this.openPicker();
  }

  protected openPicker(): void {
    if (this.isDisabled() || this.open()) return;
    this.draftValue.set(this.value());
    this.open.set(true);
    this.position.set(computeOverlayPosition(this.hostRef.nativeElement));
  }

  protected closePicker(): void {
    this.open.set(false);
  }

  protected onTimePicked(time: string): void {
    this.draftValue.set(time);
  }

  protected confirmPicker(): void {
    const draft = this.draftValue();
    if (draft !== this.value()) {
      this.setValue(draft);
      this.markAsDirty();
    }
    this.closePicker();
  }


  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.trim().toUpperCase();
    // Se vuoto, resetta
    if (!raw) {
      this.setValue(null);
      this.markAsDirty();
      return;
    }
    // Regex: ora 1-12, minuti 0-59, AM/PM obbligatorio
    const match = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/.exec(raw);
    if (match) {
      // Normalizza formato: HH:MM AM/PM
      const hour = match[1]!.padStart(2, "0");
      const minute = match[2]!;
      const ampm = match[3]!;
      this.setValue(`${hour}:${minute} ${ampm}`);
      this.markAsDirty();
    } else {
      // Se input non valido, resetta
      this.setValue(null);
      input.value = "";
    }
  }

  // UX: seleziona tutto il testo se il valore è 00 o vuoto quando si mette focus
  protected onInputFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value === "00:00 AM" || input.value === "00:00 PM") {
      setTimeout(() => input.select(), 0);
    }
  }

  protected onInputBlur(): void {
    this.markAsTouched();
  }

  protected onDocumentClick(event: Event): void {
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.closePicker();
    }
  }
}

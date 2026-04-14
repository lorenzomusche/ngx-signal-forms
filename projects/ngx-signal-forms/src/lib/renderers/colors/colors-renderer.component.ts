import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";

import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NGX_I18N_MESSAGES } from "../../core/i18n";
import { NgxOverlayControl } from "../../core/overlay-control.directive";
import { NgxOverlayPanelComponent } from "../../core/overlay-panel.component";

/**
 * Color picker renderer component.
 *
 * ```html
 * <ngx-control-colors name="primaryColor" label="Brand Color" />
 * ```
 */
@Component({
  selector: "ngx-control-colors",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgxIconComponent,
    NgxOverlayPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--colors",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
    "(document:click)": "onDocumentClick($event)",
  },

  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="hexInputId"
      [required]="isRequired()"
      [filled]="!!value()"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    <div class="ngx-colors" #wrapper [class.ngx-colors--open]="open()">
      <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">

        <!-- Color Preview -->
        <div class="ngx-input-wrapper__inliner">
          <button
            type="button"
            class="ngx-colors__primary-picker"
            [disabled]="isDisabled()"
            [attr.aria-expanded]="open()"
            aria-haspopup="dialog"
            [attr.aria-label]="i18n.colorPresetsHeader"
            (click)="toggleOverlay($event); $event.stopPropagation()"
          >
            <div
              class="ngx-colors__preview-swatch"
              [style.background-color]="value() || '#4361ee'"
            ></div>
            <!-- Native input is purely visual; the HEX text input is the accessible control -->
            <input
              [id]="fieldId"
              type="color"
              aria-hidden="true"
              tabindex="-1"
              [value]="value() || '#4361ee'"
              [disabled]="isDisabled()"
              (input)="onInput($event)"
              (click)="toggleOverlay($event); $event.stopPropagation(); $event.preventDefault()"
              class="ngx-colors__native-hidden"
            />
          </button>

          <!-- Input: HEX (accessible control) -->
          <input
            [id]="hexInputId"
            type="text"
            [value]="value()"
            [placeholder]="placeholder()"
            [disabled]="isDisabled()"
            [attr.aria-label]="label() || 'Color hex value'"
            [attr.aria-invalid]="touched() && hasErrors() ? 'true' : null"
            [attr.aria-describedby]="touched() && hasErrors() ? fieldId + '-errors' : null"
            [attr.aria-required]="isRequired() ? 'true' : null"
            [attr.aria-disabled]="isDisabled() ? 'true' : null"
            (input)="onTextInput($event)"
            (blur)="markAsTouched()"
            class="ngx-colors__hex-input"
            spellcheck="false"
          />

          <!-- Suffix: Presets Toggle -->
          <button
            type="button"
            class="ngx-input-suffix ngx-colors__toggle-area"
            [disabled]="isDisabled()"
            [attr.aria-expanded]="open()"
            aria-haspopup="listbox"
            [attr.aria-label]="i18n.colorPresetsHeader"
            (click)="toggleOverlay($event); $event.stopPropagation()"
          >
            <ngx-icon name="CHEVRON_DOWN" class="ngx-select__arrow" [class.ngx-select__arrow--open]="open()" />
          </button>
        </div>
      </div>

      <ngx-overlay-panel
        [open]="open()"
        [position]="position()"
        [alignment]="alignment()"
        [coords]="coords()"
        [maxHeight]="maxHeight()"
        [hasBackdrop]="position() === 'overlay'"
        [widthMode]="'auto-content'"
        (close)="closeOverlay()"
      >
        <div
          class="ngx-colors__dropdown"
          [class.ngx-colors__dropdown--above]="position() === 'above'"
          [class.ngx-colors__dropdown--overlay]="position() === 'overlay'"
        >
          <div class="ngx-colors__dropdown-header" aria-hidden="true">{{ i18n.colorPresetsHeader }}</div>
          <div
            class="ngx-colors__presets"
            role="listbox"
            [attr.aria-label]="i18n.colorPresetsHeader"
          >
            @for (color of presets(); track color) {
              <button
                type="button"
                role="option"
                class="ngx-color-swatch"
                [style.--color]="color"
                [class.ngx-color-swatch--active]="value() === color"
                [attr.aria-selected]="value() === color"
                [attr.aria-label]="i18n.selectColorPrefix + ' ' + color"
                (click)="selectColor(color)"
              ></button>
            }
          </div>
        </div>
      </ngx-overlay-panel>
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    } @else if (supportingText(); as st) {
      <div class="ngx-supporting-text">
        <ng-container [ngTemplateOutlet]="st.template" />
      </div>
    }
  `
})
export class NgxColorsComponent extends NgxOverlayControl<string> {

  protected readonly i18n = inject(NGX_I18N_MESSAGES);

  readonly placeholder = input<string>("#000000");
  readonly presets = input<readonly string[]>([
    "#4361ee", "#7209b7", "#f72585", "#4cc9f0", "#4895ef",
    "#18181b", "#ffffff", "#e63946", "#f59e0b", "#10b981"
  ]);

  protected readonly fieldId = `ngx-control-colors-${NgxBaseControl.nextId()}`;
  /** Separate id for the HEX text input — the accessible label target. */
  protected readonly hexInputId = `${this.fieldId}-hex`;

  protected override onBeforeOpen(): void {
    // Sync logic if needed
  }

  protected onBlur(event: FocusEvent): void {
    // Use relatedTarget to check where focus is going. When null
    // (click on non-focusable element), onDocumentClick handles closing.
    const next = event.relatedTarget as Node | null;
    if (next && !this.wrapperRef()?.nativeElement.contains(next)) {
      this.closeOverlay();
      this.markAsTouched();
    }
  }


  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateValue(target.value);
  }

  protected onTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let val = target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(val)) {
      this.updateValue(val);
    }
  }

  protected selectColor(color: string): void {
    if (this.isDisabled()) return;
    this.updateValue(color);
    this.markAsTouched();
  }

  private updateValue(val: string): void {
    this.setValue(val);
    this.markAsDirty();
  }
}

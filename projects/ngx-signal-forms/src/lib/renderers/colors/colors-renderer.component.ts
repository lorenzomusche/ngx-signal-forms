import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

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
  imports: [NgTemplateOutlet, NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--colors",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="!!value()"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />
    
    <div class="ngx-colors-container">
      <div class="ngx-colors-presets">
        @for (color of presets(); track color) {
          <button
            type="button"
            class="ngx-color-swatch"
            [style.--color]="color"
            [class.ngx-color-swatch--active]="value() === color"
            (click)="selectColor(color)"
            [attr.aria-label]="'Select color ' + color"
          ></button>

        }
      </div>

      <div class="ngx-colors-custom">
        <div class="ngx-input-wrapper" [class.ngx-input-wrapper--disabled]="isDisabled()">
          <input
            [id]="fieldId"
            type="color"
            [value]="value() || '#4361ee'"
            [disabled]="isDisabled()"
            (input)="onInput($event)"
            (blur)="markAsTouched()"
            class="ngx-color-input-native"
          />
          <input
            type="text"
            [value]="value()"
            [placeholder]="placeholder()"
            (input)="onTextInput($event)"
            [disabled]="isDisabled()"
            class="ngx-color-input-text"
            spellcheck="false"
          />
        </div>
      </div>
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
export class NgxColorsComponent extends NgxBaseControl<string> {


  readonly placeholder = input<string>("#000000");
  readonly presets = input<string[]>([
    "#4361ee", "#7209b7", "#f72585", "#4cc9f0", "#4895ef", 
    "#18181b", "#ffffff", "#e63946", "#f59e0b", "#10b981"
  ]);

  protected readonly fieldId = `ngx-control-colors-${NgxBaseControl.nextId()}`;

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

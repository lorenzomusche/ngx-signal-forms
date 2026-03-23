import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";

/**
 * Toggle (switch) renderer component.
 */
@Component({
  selector: "ngx-control-toggle",
  standalone: true,
  imports: [NgxInlineErrorIconComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--toggle" },
  template: `
    <label class="ngx-toggle">
      <input
        type="checkbox"
        role="switch"
        [id]="fieldId"
        [checked]="value()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-checked]="value()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-disabled]="effectiveAriaDisabled()"
        [attr.aria-label]="label() || null"
      />
      <span class="ngx-toggle__track" aria-hidden="true">
        <span class="ngx-toggle__thumb"></span>
      </span>
      @if (label()) {
        <span class="ngx-toggle__label">
          {{ label() }}
          @if (isRequired()) {
            <span class="ngx-label__required" aria-hidden="true">*</span>
          }
          @if (inlineErrors && touched() && hasErrors()) {
            <ngx-inline-error-icon [errorText]="inlineErrorText()" />
          }
        </span>
      }
    </label>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxToggleComponent extends NgxBaseControl<boolean> {
  protected readonly fieldId = `ngx-control-toggle-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.markAsDirty();
  }
}

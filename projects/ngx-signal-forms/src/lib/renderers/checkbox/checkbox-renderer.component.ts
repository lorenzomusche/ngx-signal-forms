import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * Checkbox renderer component.
 *
 * ```html
 * <ngx-control-checkbox name="acceptTerms" label="I accept the terms" />
 * ```
 */
@Component({
  selector: "ngx-control-checkbox",
  standalone: true,
  imports: [NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--checkbox" },
  template: `
    <label class="ngx-checkbox">
      <input
        type="checkbox"
        [id]="fieldId"
        [checked]="value()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-disabled]="effectiveAriaDisabled()"
        [attr.aria-label]="label() || null"
      />
      <span
        class="ngx-label"
        [title]="(inlineErrors && touched() && hasErrors()) ? inlineErrorText() : null"
      >
        {{ label() }}
        @if (label() && isRequired()) {
          <span class="ngx-label__required" aria-hidden="true">*</span>
        }
      </span>
    </label>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxCheckboxComponent extends NgxBaseControl<boolean> {
  protected readonly fieldId = `ngx-control-checkbox-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.markAsDirty();
  }
}

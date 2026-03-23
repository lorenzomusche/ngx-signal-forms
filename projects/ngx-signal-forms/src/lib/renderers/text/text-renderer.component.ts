import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * Text input renderer component.
 *
 * ```html
 * <ngx-control-text name="firstName" label="First Name" placeholder="Enter name" />
 * ```
 */
@Component({
  selector: "ngx-control-text",
  standalone: true,
  imports: [NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--text",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />
    <input
      [id]="fieldId"
      type="text"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="isDisabled()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
      [attr.aria-label]="label() || null"
    />
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxTextComponent extends NgxBaseControl<string> {
  readonly placeholder = input<string>("");

  protected readonly fieldId = `ngx-control-text-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(target.value);
    this.markAsDirty();
  }
}

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * Textarea renderer component.
 */
@Component({
  selector: "ngx-control-textarea",
  standalone: true,
  imports: [NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--textarea",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />
    <textarea
      [id]="fieldId"
      class="ngx-textarea"
      [placeholder]="placeholder()"
      [value]="value() || ''"
      [disabled]="isDisabled()"
      [rows]="rows()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
      [attr.aria-label]="label() || null"
    ></textarea>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxTextareaComponent extends NgxBaseControl<string | null> {
  readonly placeholder = input<string>("");
  readonly rows = input<number>(3);

  protected readonly fieldId = `ngx-control-textarea-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.setValue(target.value);
    this.markAsDirty();
  }
}

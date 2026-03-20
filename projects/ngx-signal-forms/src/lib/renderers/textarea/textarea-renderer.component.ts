import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";

/**
 * Textarea renderer component.
 *
 * ```html
 * <ngx-control-textarea name="bio" label="Biography" [rows]="6" />
 * ```
 */
@Component({
  selector: "ngx-control-textarea",
  standalone: true,
  imports: [NgxInlineErrorIconComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--textarea" },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }
    <textarea
      [id]="fieldId"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [rows]="rows()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
      [attr.aria-label]="label() || null"
      >{{ value() }}</textarea
    >
    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxTextareaComponent extends NgxBaseControl<string> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly rows = input<number>(4);

  protected readonly fieldId = `ngx-control-textarea-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
    this.markAsDirty();
  }
}

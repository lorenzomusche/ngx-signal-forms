import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--textarea" },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
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
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
})
export class NgxTextareaComponent extends NgxBaseControl<string> {
  readonly name = input.required<string>();
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly rows = input<number>(4);

  protected readonly fieldId = `ngx-control-textarea-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
    this.markAsDirty();
  }
}

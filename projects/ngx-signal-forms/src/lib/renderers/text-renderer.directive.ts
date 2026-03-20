import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--text" },
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
export class NgxTextComponent extends NgxBaseControl<string> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");

  protected readonly fieldId = `ngx-control-text-${NgxBaseControl.nextId()}`;

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(target.value);
    this.markAsDirty();
  }
}

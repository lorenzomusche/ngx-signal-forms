import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxFieldError } from "../core/types";

/**
 * Block error list displayed below a form control.
 *
 * Renders a `<ul>` of validation error messages. Used when
 * `ngxInlineErrors` is **not** applied to a renderer.
 *
 * ```html
 * <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
 * ```
 */
@Component({
  selector: "ngx-error-list",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: "display: contents" },
  template: `
    <ul
      [id]="fieldId() + '-errors'"
      class="ngx-control__errors"
      role="alert"
      aria-live="polite"
    >
      @for (err of errors(); track $index) {
        <li class="ngx-control__error">{{ err.message }}</li>
      }
    </ul>
  `,
})
export class NgxErrorListComponent {
  readonly fieldId = input.required<string>();
  readonly errors = input.required<ReadonlyArray<NgxFieldError>>();
}

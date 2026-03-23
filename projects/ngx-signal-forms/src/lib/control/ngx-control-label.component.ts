import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxInlineErrorIconComponent } from "./inline-error-icon.component";

/**
 * Shared label + optional inline-error-icon block.
 *
 * Eliminates the duplicated `@if (label()) { <label>...</label> }` pattern
 * that was copy-pasted across every renderer component.
 *
 * ```html
 * <ngx-control-label
 *   [label]="label()"
 *   [forId]="fieldId"
 *   [showInlineError]="inlineErrors && touched() && hasErrors()"
 *   [errorText]="inlineErrorText()"
 * />
 * ```
 */
@Component({
  selector: "ngx-control-label",
  standalone: true,
  imports: [NgxInlineErrorIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: "display: contents" },
  template: `
    @if (label()) {
      <label [for]="forId()" class="ngx-label">
        {{ label() }}
        @if (showInlineError()) {
          <ngx-inline-error-icon [errorText]="errorText()" />
        }
      </label>
    }
  `,
})
export class NgxControlLabelComponent {
  /** The label text. If empty, renders nothing. */
  readonly label = input<string>("");

  /** The `id` of the input this label is associated with (maps to `[for]`). */
  readonly forId = input<string>("");

  /** When `true`, the inline error icon is rendered inside the label. */
  readonly showInlineError = input<boolean>(false);

  /** Error text passed to the inline error icon tooltip. */
  readonly errorText = input<string>("");
}

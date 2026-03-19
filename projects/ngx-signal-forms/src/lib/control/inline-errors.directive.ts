import { Directive } from "@angular/core";
import { NGX_INLINE_ERRORS } from "../core/tokens";

/**
 * Attribute directive that switches a renderer to inline error display.
 *
 * When applied to a renderer component, errors are shown in parentheses
 * next to the label instead of as a block below the input.
 *
 * ```html
 * <ngx-control-text name="email" label="Email" ngxInlineErrors />
 * ```
 */
@Directive({
  selector: "[ngxInlineErrors]",
  standalone: true,
  host: { class: "ngx-inline-errors" },
  providers: [{ provide: NGX_INLINE_ERRORS, useValue: true }],
})
export class NgxInlineErrorsDirective {}

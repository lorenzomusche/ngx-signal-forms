import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxIconComponent } from "./ngx-icon.component";

/**
 * Inline error icon with hover/focus tooltip.
 *
 * Renders a warning triangle SVG that reveals the error message on
 * hover or keyboard focus. Used inside labels when `ngxInlineErrors`
 * is applied to a renderer.
 *
 * ```html
 * <ngx-inline-error-icon [errorText]="inlineErrorText()" />
 * ```
 */
@Component({
  selector: "ngx-inline-error-icon",
  standalone: true,
  imports: [NgxIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-control__inline-errors",
    role: "alert",
    "aria-live": "polite",
    tabindex: "0",
  },
  template: `
    <ngx-icon name="ERROR" class="ngx-control__inline-errors-icon" style="vertical-align: middle; margin-top: -1px; width: 0.85em; height: 0.85em;" />
    <span class="ngx-control__inline-errors-tooltip">{{ errorText() }}</span>
  `,
})
export class NgxInlineErrorIconComponent {
  readonly errorText = input.required<string>();
}

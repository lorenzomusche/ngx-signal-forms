import { ChangeDetectionStrategy, Component, input } from "@angular/core";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-control__inline-errors",
    role: "alert",
    "aria-live": "polite",
    tabindex: "0",
  },
  template: `
    <svg
      class="ngx-control__inline-errors-icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M10 2L1 18h18L10 2zm0 12a1 1 0 110 2 1 1 0 010-2zm-1-7h2v5h-2V7z"
      />
    </svg>
    <span class="ngx-control__inline-errors-tooltip">{{ errorText() }}</span>
  `,
})
export class NgxInlineErrorIconComponent {
  readonly errorText = input.required<string>();
}

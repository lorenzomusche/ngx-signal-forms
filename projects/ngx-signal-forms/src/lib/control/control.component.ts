import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/**
 * Optional wrapper component for form controls.
 *
 * Provides a styled container with data-field attribute.
 * Error display is handled by each renderer component directly.
 *
 * Usage:
 * ```html
 * <ngx-control name="firstName">
 *   <ngx-text name="firstName" label="First Name" />
 * </ngx-control>
 * ```
 */
@Component({
  selector: "ngx-control",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-control">
      <ng-content />
    </div>
  `,
  host: {
    "[attr.data-field]": "name()",
  },
})
export class ControlComponent {
  readonly name = input.required<string>();
}

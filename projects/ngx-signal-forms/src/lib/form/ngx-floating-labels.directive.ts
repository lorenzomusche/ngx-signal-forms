import { Directive, effect, ElementRef, forwardRef, inject, input } from "@angular/core";
import { NGX_FLOATING_LABELS, NGX_FLOATING_LABELS_DEFAULT, NGX_FLOATING_LABELS_DENSITY_DEFAULT } from "../core/tokens";

/**
 * Opt-in directive to enable Material-style floating labels for all descendant
 * ngx-signal-forms controls.
 *
 * Usage:
 * ```html
 * <ngx-form [ngxFloatingLabels]="true" [ngxFloatingLabelsDensity]="-3">
 *   ...
 * </ngx-form>
 * ```
 */
@Directive({
  selector: "ngx-form[ngxFloatingLabels], form[ngxFloatingLabels]",
  standalone: true,
  providers: [
    {
      provide: NGX_FLOATING_LABELS,
      useExisting: forwardRef(() => NgxFloatingLabelsDirective),
    },
  ],
})
export class NgxFloatingLabelsDirective {
  /** Enables or disables floating labels for descendants. Defaults to the value of `NGX_FLOATING_LABELS_DEFAULT`. */
  readonly ngxFloatingLabels = input<boolean>(inject(NGX_FLOATING_LABELS_DEFAULT));

  /** 
   * Density scaling for the floating labels, replicating M3 density behavior. 
   * 0 is standard M3 (56px), negative values make it more compact.
   * Defaults to the value of `NGX_FLOATING_LABELS_DENSITY_DEFAULT`.
   */
  readonly ngxFloatingLabelsDensity = input<number>(inject(NGX_FLOATING_LABELS_DENSITY_DEFAULT));

  constructor() {
    const el = inject(ElementRef);
    effect(() => {
      // Set the density custom property on the host element so it trickles down
      el.nativeElement.style.setProperty(
        "--ngx-floating-density",
        this.ngxFloatingLabelsDensity().toString()
      );
    });
  }
}

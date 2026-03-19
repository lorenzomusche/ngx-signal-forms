import { Directive } from "@angular/core";

/**
 * Structural directive to mark an `<ng-template>` as the custom option
 * template for `NgxSelectComponent`.
 *
 * The template receives the option as implicit context.
 *
 * ```html
 * <ngx-control-select name="country" [options]="countries">
 *   <ng-template ngxOption let-opt>
 *     {{ opt.value | uppercase }} — {{ opt.label }}
 *   </ng-template>
 * </ngx-control-select>
 * ```
 */
@Directive({
  selector: "[ngxOption]",
  standalone: true,
})
export class NgxOptionDirective {}

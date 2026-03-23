import { Directive, input } from "@angular/core";

/**
 * Chips Directive to enhance select/multiselect options.
 * 
 * Provides Material 3 styling and behavior for "Input Chips" or "Filter Chips".
 */
@Directive({
  selector: "[ngxChips]",
  standalone: true,
  host: {
    class: "ngx-chip",
    "[class.ngx-chip--selected]": "selected()",
    "[class.ngx-chip--removable]": "removable()",
  }
})
export class NgxChipsDirective {
  /** Whether the chip is currently selected/active. */
  readonly selected = input<boolean>(false);
  
  /** Whether the chip shows a removal (X) icon. */
  readonly removable = input<boolean>(true);
}

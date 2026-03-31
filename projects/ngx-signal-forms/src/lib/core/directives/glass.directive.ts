import { Directive, input } from "@angular/core";

/**
 * NgxGlassDirective
 *
 * Applies a "Liquid Glass" effect to the host element using backdrop-filters,
 * semi-transparent backgrounds, and specular highlights.
 *
 * The visual appearance is driven by CSS variables (--ngx-glass-*) which are
 * defined in the theme layer (e.g., ngx-signal-forms-ios.css).
 *
 * Usage:
 * <div ngxGlass [intensity]="'high'">...</div>
 */
@Directive({
  selector: "[ngxGlass]",
  standalone: true,
  host: {
    "class": "ngx-glass-effect",
    "[class.ngx-glass-effect--low]": "intensity() === 'low'",
    "[class.ngx-glass-effect--medium]": "intensity() === 'medium'",
    "[class.ngx-glass-effect--high]": "intensity() === 'high'",
    "[style.--ngx-glass-filter-override]": "blur()",
    "[style.--ngx-glass-bg-override]": "glassColor()"
  },
})
export class NgxGlassDirective {
  /** Optional override for the blur amount (e.g., '10px' or 'blur(10px)') */
  readonly blur = input<string | undefined>(undefined);

  /** Intensity of the glass effect. Themes can use this to adjust blur/opacity. */
  readonly intensity = input<"low" | "medium" | "high">("medium");

  /** Optional background color override to tint the glass. */
  readonly glassColor = input<string | undefined>(undefined);
}

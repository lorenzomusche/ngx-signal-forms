import { Directive, TemplateRef } from "@angular/core";

/**
 * Marks a template or element as an input prefix (leading content).
 */
@Directive({
  selector: "[ngxPrefix]",
  standalone: true,
})
export class NgxPrefixDirective {
  constructor(public readonly template: TemplateRef<any>) {}
}

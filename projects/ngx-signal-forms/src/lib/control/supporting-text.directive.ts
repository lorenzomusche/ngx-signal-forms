import { Directive, TemplateRef } from "@angular/core";

/**
 * Marks a template or element as supporting text (helper text).
 */
@Directive({
  selector: "[ngxSupportingText]",
  standalone: true,
})
export class NgxSupportingTextDirective {
  constructor(public readonly template: TemplateRef<any>) {}
}

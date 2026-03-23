import { Directive, TemplateRef } from "@angular/core";

/**
 * Marks a template or element as an input suffix (trailing content).
 */
@Directive({
  selector: "[ngxSuffix]",
  standalone: true,
})
export class NgxSuffixDirective {
  constructor(public readonly template: TemplateRef<any>) {}
}

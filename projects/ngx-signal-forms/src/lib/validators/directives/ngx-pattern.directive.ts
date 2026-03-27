import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { pattern } from "../../core/validators";

/**
 * Validates a RegExp pattern in declarative mode.
 *
 * ```html
 * <ngx-control-text name="code" [ngxPattern]="codeRegex" />
 * <ngx-control-text name="code" [ngxPattern]="codeRegex" ngxPatternMessage="Formato non valido" />
 * ```
 */
@Directive({ selector: "[ngxPattern]", standalone: true })
export class NgxPatternDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  readonly ngxPattern = input.required<RegExp | string>();
  readonly ngxPatternMessage = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    const raw = this.ngxPattern();
    const regex = raw instanceof RegExp ? raw : new RegExp(raw);
    this.registry.addValidators(this.fieldName, [
      pattern(regex, this.ngxPatternMessage()),
    ]);
  }
}

import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { email } from "../../core/validators";

/**
 * Validates e-mail format in declarative mode.
 *
 * ```html
 * <ngx-control-text name="email" ngxEmail />
 * <ngx-control-text name="email" [ngxEmail]="'Formato non valido'" />
 * ```
 */
@Directive({ selector: "[ngxEmail]", standalone: true })
export class NgxEmailDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  /** Optional custom error message. */
  readonly ngxEmail = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [email(this.ngxEmail())]);
  }
}

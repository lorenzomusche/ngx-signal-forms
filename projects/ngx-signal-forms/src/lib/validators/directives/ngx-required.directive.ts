import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { required } from "../../core/validators";

/**
 * Marks a control as required in declarative mode.
 *
 * ```html
 * <ngx-control-text name="email" ngxRequired />
 * <ngx-control-text name="email" [ngxRequired]="'Email obbligatoria'" />
 * ```
 */
@Directive({ selector: "[ngxRequired]", standalone: true })
export class NgxRequiredDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  /** Optional custom error message — pass as binding: [ngxRequired]="'...'" */
  readonly ngxRequired = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [required(this.ngxRequired())], true);
  }
}

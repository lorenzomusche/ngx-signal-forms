import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { max } from "../../core/validators";

/**
 * Validates numeric maximum in declarative mode.
 *
 * ```html
 * <ngx-control-number name="age" [ngxMax]="99" />
 * <ngx-control-number name="age" [ngxMax]="99" ngxMaxMessage="Valore troppo alto" />
 * ```
 */
@Directive({ selector: "[ngxMax]", standalone: true })
export class NgxMaxDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  readonly ngxMax = input.required<number | string>();
  readonly ngxMaxMessage = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [
      max(Number(this.ngxMax()), this.ngxMaxMessage()),
    ]);
  }
}

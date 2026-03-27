import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { min } from "../../core/validators";

/**
 * Validates numeric minimum in declarative mode.
 *
 * ```html
 * <ngx-control-number name="age" [ngxMin]="18" />
 * <ngx-control-number name="age" [ngxMin]="18" ngxMinMessage="Devi essere maggiorenne" />
 * ```
 */
@Directive({ selector: "[ngxMin]", standalone: true })
export class NgxMinDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  readonly ngxMin = input.required<number | string>();
  readonly ngxMinMessage = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [
      min(Number(this.ngxMin()), this.ngxMinMessage()),
    ]);
  }
}

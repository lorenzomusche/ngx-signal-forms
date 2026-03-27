import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { minLength } from "../../core/validators";

/**
 * Validates minimum length in declarative mode.
 *
 * ```html
 * <ngx-control-text name="username" [ngxMinLength]="3" />
 * <ngx-control-text name="username" [ngxMinLength]="3" ngxMinLengthMessage="Troppo corto" />
 * ```
 */
@Directive({ selector: "[ngxMinLength]", standalone: true })
export class NgxMinLengthDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  readonly ngxMinLength = input.required<number | string>();
  readonly ngxMinLengthMessage = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [
      minLength(Number(this.ngxMinLength()), this.ngxMinLengthMessage()),
    ]);
  }
}

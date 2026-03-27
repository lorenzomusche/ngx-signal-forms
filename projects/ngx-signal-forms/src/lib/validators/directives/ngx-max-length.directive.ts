import { Directive, HostAttributeToken, inject, input, OnInit } from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";
import { maxLength } from "../../core/validators";

/**
 * Validates maximum length in declarative mode.
 *
 * ```html
 * <ngx-control-text name="bio" [ngxMaxLength]="200" />
 * <ngx-control-text name="bio" [ngxMaxLength]="200" ngxMaxLengthMessage="Troppo lungo" />
 * ```
 */
@Directive({ selector: "[ngxMaxLength]", standalone: true })
export class NgxMaxLengthDirective implements OnInit {
  private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, { optional: true });
  private readonly fieldName = inject(new HostAttributeToken("name"), { optional: true });

  readonly ngxMaxLength = input.required<number | string>();
  readonly ngxMaxLengthMessage = input<string | undefined>(undefined);

  ngOnInit(): void {
    if (!this.registry || !this.fieldName) return;
    this.registry.addValidators(this.fieldName, [
      maxLength(Number(this.ngxMaxLength()), this.ngxMaxLengthMessage()),
    ]);
  }
}

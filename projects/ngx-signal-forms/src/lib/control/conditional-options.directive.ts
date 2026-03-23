import { Directive, effect, inject, input } from "@angular/core";
import { NGX_FORM_ADAPTER, NGX_OPTIONS_CONTROL } from "../core/tokens";
import { NgxOptionsControl, NgxSelectOption } from "../core/types";

/**
 * Directive that automatically filters options of a host select/multiselect
 * based on the value of another field in the same form.
 *
 * Usage:
 * ```html
 * <ngx-select name="country" [options]="countries" />
 * <ngx-select name="province"
 *   [ngxDependsOn]="'country'"
 *   [ngxOptionsMap]="provincesByCountry" />
 * ```
 */
@Directive({
  selector: "[ngxDependsOn]",
  standalone: true,
})
export class NgxConditionalOptionsDirective<TValue = unknown> {
  /** Name of the form field that this control depends on. */
  readonly ngxDependsOn = input.required<string>();

  /**
   * Map of options keyed by the dependent field's value,
   * or a function that returns options given the value.
   */
  readonly ngxOptionsMap = input.required<
    | Record<string | number, readonly NgxSelectOption<TValue>[]>
    | ((val: any) => readonly NgxSelectOption<TValue>[])
  >();

  private readonly adapter = inject(NGX_FORM_ADAPTER);
  private readonly host = inject<NgxOptionsControl<TValue>>(NGX_OPTIONS_CONTROL, {
    host: true,
    optional: true,
  });

  private previousVal: any;

  constructor() {
    effect(() => {
      const depName = this.ngxDependsOn();
      const map = this.ngxOptionsMap();
      if (!depName || !map || !this.host) return;

      const depField = this.adapter.getField(depName);
      if (!depField) return;

      const val = depField().value();
      const options =
        typeof map === "function" ? map(val) : map[String(val || "")];

      this.host.overrideOptions.set(options || []);

      if (this.previousVal !== undefined && this.previousVal !== val) {
        this.host.resetSelection();
      }
      this.previousVal = val;
    });
  }
}

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";
import { NgxSelectOption } from "../core/types";

/**
 * Select renderer component.
 *
 * ```html
 * <ngx-select name="province" label="Province" [options]="provinces" />
 * ```
 */
@Component({
  selector: "ngx-select",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--select" },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <span
            class="ngx-control__inline-errors"
            role="alert"
            aria-live="polite"
          >
            ({{ inlineErrorText() }})
          </span>
        }
      </label>
    }
    <select
      [id]="fieldId"
      [disabled]="isDisabled()"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-label]="label() || null"
    >
      @if (placeholder()) {
        <option value="" disabled [selected]="value() === null">
          {{ placeholder() }}
        </option>
      }
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value" [selected]="opt.value === value()">
          {{ opt.label }}
        </option>
      }
    </select>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul
        [id]="fieldId + '-errors'"
        class="ngx-control__errors"
        role="alert"
        aria-live="polite"
      >
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
})
export class NgxSelectComponent<
  TValue = string,
> extends NgxBaseControl<TValue | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);

  protected readonly fieldId = `ngx-select-${NgxBaseControl.nextId()}`;

  protected onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const matched = this.options().find(
      (o: NgxSelectOption<TValue>) => String(o.value) === target.value,
    );
    this.setValue(matched?.value ?? null);
    this.markAsDirty();
  }
}

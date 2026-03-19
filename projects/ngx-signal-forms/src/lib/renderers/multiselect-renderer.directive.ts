import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";
import { NgxSelectOption } from "../core/types";

/**
 * Multiselect renderer component.
 * Renders a list of checkboxes and delivers ReadonlyArray<TValue>.
 *
 * ```html
 * <ngx-multiselect name="tags" label="Tags" [options]="tagOptions" />
 * ```
 */
@Component({
  selector: "ngx-multiselect",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--multiselect" },
  template: `
    <fieldset [disabled]="isDisabled()">
      @if (label()) {
        <legend>
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
        </legend>
      }
      @for (opt of options(); track opt.value) {
        <label class="ngx-multiselect__option">
          <input
            type="checkbox"
            [checked]="isSelected(opt.value)"
            (change)="onToggle(opt.value, $event)"
            (blur)="markAsTouched()"
          />
          {{ opt.label }}
        </label>
      }
    </fieldset>
    @if (!inlineErrors && touched() && hasErrors()) {
      <ul class="ngx-control__errors" role="alert" aria-live="polite">
        @for (err of errors(); track $index) {
          <li class="ngx-control__error">{{ err.message }}</li>
        }
      </ul>
    }
  `,
})
export class NgxMultiselectComponent<TValue = string> extends NgxBaseControl<
  ReadonlyArray<TValue>
> {
  readonly label = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);

  /** Check whether a given option value is currently selected. */
  protected isSelected(optValue: TValue): boolean {
    return this.value().includes(optValue);
  }

  protected onToggle(optValue: TValue, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.value();
    const next: ReadonlyArray<TValue> = checked
      ? [...current, optValue]
      : current.filter((v) => v !== optValue);
    this.setValue(next);
    this.markAsDirty();
  }
}

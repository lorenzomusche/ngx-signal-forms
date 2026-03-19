import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";
import { NgxSelectOption } from "../core/types";

/**
 * Multiselect renderer component.
 * Renders selectable filter chips and delivers ReadonlyArray<TValue>.
 *
 * ```html
 * <ngx-control-multiselect name="tags" label="Tags" [options]="tagOptions" />
 * ```
 */
@Component({
  selector: "ngx-control-multiselect",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "ngx-renderer ngx-renderer--multiselect" },
  template: `
    @if (label()) {
      <label class="ngx-multiselect__label">
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
    @if (searchable()) {
      <input
        type="text"
        class="ngx-multiselect__search"
        placeholder="Search…"
        autocomplete="off"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
      />
    }
    <div
      class="ngx-multiselect__options"
      role="group"
      [attr.aria-label]="label() || null"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
    >
      @for (opt of filteredOptions(); track opt.value) {
        <button
          type="button"
          class="ngx-chip"
          [class.ngx-chip--selected]="isSelected(opt.value)"
          [disabled]="isDisabled()"
          [title]="opt.label"
          [attr.aria-pressed]="isSelected(opt.value)"
          (click)="onToggle(opt.value)"
          (blur)="markAsTouched()"
        >
          @if (isSelected(opt.value)) {
            <svg class="ngx-chip__check" viewBox="0 0 18 18" aria-hidden="true">
              <polyline points="3.5 9.5 7 13 14.5 5.5" />
            </svg>
          }
          <span class="ngx-chip__label">{{ opt.label }}</span>
        </button>
      }
    </div>
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
export class NgxMultiselectComponent<TValue = string> extends NgxBaseControl<
  ReadonlyArray<TValue>
> {
  readonly label = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly searchable = input<boolean>(false);

  /** Search query for filtering visible chips. */
  protected readonly searchQuery = signal("");

  /** Options filtered by the current search query. */
  protected readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(query));
  });

  protected readonly fieldId = `ngx-control-multiselect-${NgxBaseControl.nextId()}`;

  /** Check whether a given option value is currently selected. */
  protected isSelected(optValue: TValue): boolean {
    return this.value().includes(optValue);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected onToggle(optValue: TValue): void {
    const current = this.value();
    const next: ReadonlyArray<TValue> = current.includes(optValue)
      ? current.filter((v) => v !== optValue)
      : [...current, optValue];
    this.setValue(next);
    this.markAsDirty();
  }
}

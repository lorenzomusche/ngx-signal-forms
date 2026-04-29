import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  linkedSignal,
  Signal,
  WritableSignal,
} from "@angular/core";
import { NgxFormComponent } from "../form/ngx-form.component";

/**
 * Pure state-manager for a dynamically-sized list of repeating sub-forms.
 *
 * Manages the items array (add/remove) and collects values/validity from
 * `<ngx-form>` content children. The consumer renders the forms directly
 * in its own template so Angular DI works correctly for renderer components.
 *
 * Usage:
 * ```html
 * <ngx-form-array #arr [initialItems]="items">
 *   @for (item of arr.items(); track item._id; let idx = $index) {
 *     <ngx-form [formValue]="item.value">
 *       <ngx-control-text name="nome" label="Nome" />
 *       <button type="button" (click)="arr.remove(idx)">Remove</button>
 *     </ngx-form>
 *   }
 * </ngx-form-array>
 * <button (click)="arr.add()">Add</button>
 * ```
 *
 * Read results with `arr.getValue()` and validity with `arr.isValid()`.
 */
@Component({
  selector: "ngx-form-array",
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class NgxFormArrayComponent<T extends Record<string, unknown>> {
  /** Seed values for the initial rows. Re-setting this input resets all rows. */
  readonly initialItems = input<readonly T[]>([]);

  private _nextId = 0;

  /**
   * Reactive items list — bind this in the consumer's `@for` to drive the rows.
   * Each entry carries a stable `_id` for `track` and the row `value`.
   */
  readonly items: WritableSignal<Array<{ _id: number; value: T }>> =
    linkedSignal(() =>
      this.initialItems().map((v) => ({ _id: this._nextId++, value: v })),
    );

  /** All `<ngx-form>` content children, in DOM order. */
  private readonly _forms = contentChildren(NgxFormComponent);

  /** Aggregated validity signal — `true` when every row form is valid. */
  readonly state: Signal<{ valid: boolean }> = computed(() => ({
    valid: this._forms().every((f) => f.state.valid()),
  }));

  /** Returns `true` when every row form is valid. */
  isValid(): boolean {
    return this._forms().every((f) => f.state.valid());
  }

  /** Collects and returns the current value of every row form, in DOM order. */
  getValue(): T[] {
    return this._forms().map((f) => f.getValue() as T);
  }

  /** Appends a new row pre-filled with the given partial value. */
  add(value: Partial<T> = {}): void {
    this.items.update((rows) => [
      ...rows,
      { _id: this._nextId++, value: value as T },
    ]);
  }

  /** Removes the row at the given index. */
  remove(index: number): void {
    this.items.update((rows) => rows.filter((_, i) => i !== index));
  }
}


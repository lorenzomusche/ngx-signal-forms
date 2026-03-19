import {
  computed,
  contentChildren,
  Directive,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { NgxSelectOption, ValidatorFn } from '../core/types';

/**
 * Multiselect renderer directive.
 * Renders a list of checkboxes and delivers ReadonlyArray<TValue>.
 *
 * Supports optional item template via ng-template projection.
 *
 * ```html
 * <ngx-control multiselect name="tags" [options]="tagOptions">
 *   <ng-template #optionTpl let-opt>
 *     <strong>{{ opt.label }}</strong>
 *   </ng-template>
 * </ngx-control>
 * ```
 */
@Directive({
  selector: 'ngx-control[multiselect]',
  standalone: true,
  providers: [
    { provide: NGX_CONTROL_DIRECTIVE, useExisting: MultiselectRendererDirective },
  ],
  host: { class: 'ngx-renderer ngx-renderer--multiselect' },
  template: `
    <fieldset>
      <legend *ngIf="label()">{{ label() }}</legend>
      @for (opt of options(); track opt.value) {
        <label class="ngx-multiselect__option">
          <input
            type="checkbox"
            [checked]="isSelected(opt.value)"
            (change)="onToggle(opt.value, $event)"
            (blur)="markAsTouched()"
          />
          <ng-container
            *ngTemplateOutlet="optionTemplate() ?? defaultTpl; context: { $implicit: opt }"
          />
          <ng-template #defaultTpl let-o>{{ o.label }}</ng-template>
        </label>
      }
    </fieldset>
  `,
})
export class MultiselectRendererDirective<TValue = string>
  extends ControlDirective<ReadonlyArray<TValue>> {

  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly optionTemplate = input<import('@angular/core').TemplateRef<{ $implicit: NgxSelectOption<TValue> }> | null>(null);
  readonly validators = input<readonly ValidatorFn<ReadonlyArray<TValue>>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<ReadonlyArray<TValue>> = signal<ReadonlyArray<TValue>>([]);

  isSelected(optValue: TValue): boolean {
    return this.value().includes(optValue);
  }

  onToggle(optValue: TValue, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.value();
    const next: ReadonlyArray<TValue> = checked
      ? [...current, optValue]
      : current.filter(v => v !== optValue);
    this.value.set(next);
    this.markAsDirty();
  }
}

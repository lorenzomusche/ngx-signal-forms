import {
  Directive,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { NgxSelectOption, ValidatorFn } from '../core/types';

/**
 * Select renderer directive.
 *
 * ```html
 * <ngx-control select name="province" [options]="provinces" />
 * ```
 */
@Directive({
  selector: 'ngx-control[select]',
  standalone: true,
  providers: [
    { provide: NGX_CONTROL_DIRECTIVE, useExisting: SelectRendererDirective },
  ],
  host: { class: 'ngx-renderer ngx-renderer--select' },
  template: `
    <label *ngIf="label()" [for]="_id">{{ label() }}</label>
    <select
      [id]="_id"
      [disabled]="disabled()"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="errors().length > 0"
    >
      <option *ngIf="placeholder()" value="" disabled [selected]="!value()">{{ placeholder() }}</option>
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value" [selected]="opt.value === value()">{{ opt.label }}</option>
      }
    </select>
  `,
})
export class SelectRendererDirective<TValue = string> extends ControlDirective<TValue | null> {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly validators = input<readonly ValidatorFn<TValue | null>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<TValue | null> = signal(null);

  protected readonly _id = `ngx-select-${Math.random().toString(36).slice(2)}`;

  protected onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const matched = this.options().find(o => String(o.value) === target.value);
    this.value.set(matched?.value ?? null);
    this.markAsDirty();
  }
}

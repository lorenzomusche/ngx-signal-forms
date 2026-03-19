import { Directive, input, signal, WritableSignal } from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { ValidatorFn } from '../core/types';

@Directive({
  selector: 'ngx-control[date]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_DIRECTIVE, useExisting: DateRendererDirective }],
  host: { class: 'ngx-renderer ngx-renderer--date' },
  template: `
    <label *ngIf="label()" [for]="_id">{{ label() }}</label>
    <input
      [id]="_id"
      type="date"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      [min]="min() ?? ''"
      [max]="max() ?? ''"
      (change)="onChange($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="errors().length > 0"
    />
  `,
})
export class DateRendererDirective extends ControlDirective<string | null> {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly validators = input<readonly ValidatorFn<string | null>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<string | null> = signal(null);

  protected readonly _id = `ngx-date-${Math.random().toString(36).slice(2)}`;

  protected onChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw || null);
    this.markAsDirty();
  }
}

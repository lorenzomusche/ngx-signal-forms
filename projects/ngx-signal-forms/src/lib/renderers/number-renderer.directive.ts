import { Directive, input, signal, WritableSignal } from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { ValidatorFn } from '../core/types';

@Directive({
  selector: 'ngx-control[number]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_DIRECTIVE, useExisting: NumberRendererDirective }],
  host: { class: 'ngx-renderer ngx-renderer--number' },
  template: `
    <label *ngIf="label()" [for]="_id">{{ label() }}</label>
    <input
      [id]="_id"
      type="number"
      [placeholder]="placeholder()"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      [min]="min() ?? null"
      [max]="max() ?? null"
      [step]="step()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="errors().length > 0"
    />
  `,
})
export class NumberRendererDirective extends ControlDirective<number | null> {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input<number>(1);
  readonly validators = input<readonly ValidatorFn<number | null>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<number | null> = signal(null);

  protected readonly _id = `ngx-number-${Math.random().toString(36).slice(2)}`;

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw === '' ? null : Number(raw));
    this.markAsDirty();
  }
}

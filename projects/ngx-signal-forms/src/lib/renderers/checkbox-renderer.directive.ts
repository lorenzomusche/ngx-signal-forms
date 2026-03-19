import { Directive, input, signal, WritableSignal } from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { ValidatorFn } from '../core/types';

@Directive({
  selector: 'ngx-control[checkbox]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_DIRECTIVE, useExisting: CheckboxRendererDirective }],
  host: { class: 'ngx-renderer ngx-renderer--checkbox' },
  template: `
    <label class="ngx-checkbox">
      <input
        type="checkbox"
        [id]="_id"
        [checked]="value()"
        [disabled]="disabled()"
        (change)="onChange($event)"
        (blur)="markAsTouched()"
      />
      <span *ngIf="label()">{{ label() }}</span>
    </label>
  `,
})
export class CheckboxRendererDirective extends ControlDirective<boolean> {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly validators = input<readonly ValidatorFn<boolean>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<boolean> = signal(false);

  protected readonly _id = `ngx-checkbox-${Math.random().toString(36).slice(2)}`;

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLInputElement).checked);
    this.markAsDirty();
  }
}

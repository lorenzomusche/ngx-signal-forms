import { Directive, input, signal, WritableSignal } from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { ValidatorFn } from '../core/types';

@Directive({
  selector: 'ngx-control[textarea]',
  standalone: true,
  providers: [{ provide: NGX_CONTROL_DIRECTIVE, useExisting: TextareaRendererDirective }],
  host: { class: 'ngx-renderer ngx-renderer--textarea' },
  template: `
    <label *ngIf="label()" [for]="_id">{{ label() }}</label>
    <textarea
      [id]="_id"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [rows]="rows()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="errors().length > 0"
    >{{ value() }}</textarea>
  `,
})
export class TextareaRendererDirective extends ControlDirective<string> {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly rows = input<number>(4);
  readonly validators = input<readonly ValidatorFn<string>[]>([]);

  get fieldName(): string { return this.name(); }
  readonly value: WritableSignal<string> = signal('');

  protected readonly _id = `ngx-textarea-${Math.random().toString(36).slice(2)}`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
    this.markAsDirty();
  }
}

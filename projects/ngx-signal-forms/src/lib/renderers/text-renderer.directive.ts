import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import { ControlDirective, NGX_CONTROL_DIRECTIVE } from '../control/control.directive';
import { ValidatorFn } from '../core/types';

/**
 * Text renderer directive.
 * Attach to <ngx-control> to render a native text input.
 *
 * ```html
 * <ngx-control text name="firstName" />
 * ```
 */
@Directive({
  selector: 'ngx-control[text]',
  standalone: true,
  providers: [
    { provide: NGX_CONTROL_DIRECTIVE, useExisting: TextRendererDirective },
  ],
  host: {
    class: 'ngx-renderer ngx-renderer--text',
  },
  template: `
    <label *ngIf="label()" [for]="_id">{{ label() }}</label>
    <input
      [id]="_id"
      type="text"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="onInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-invalid]="errors().length > 0"
      [attr.aria-describedby]="_id + '-errors'"
    />
  `,
})
export class TextRendererDirective extends ControlDirective<string> {
  // ---- inputs ----------------------------------------------------------------
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly validators = input<readonly ValidatorFn<string>[]>([]);

  // ---- ControlDirective impl -------------------------------------------------
  get fieldName(): string { return this.name(); }

  readonly value: WritableSignal<string> = signal('');

  // ---- private ---------------------------------------------------------------
  protected readonly _id = `ngx-text-${Math.random().toString(36).slice(2)}`;

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.markAsDirty();
  }
}

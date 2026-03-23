import {
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  Signal,
} from "@angular/core";
import { NGX_FORM_ADAPTER, NGX_INLINE_ERRORS } from "../core/tokens";
import { NgxFieldError, NgxFieldState, NgxFormAdapter } from "../core/types";

/** Global counter for generating unique field IDs. */
let _nextFieldId = 0;

/**
 * Abstract base class for all renderer components.
 *
 * Injects the nearest NgxFormAdapter (provided by NgxFormComponent)
 * and resolves the field state by name. Provides convenience computed
 * signals that concrete renderers bind in their templates.
 */
@Directive()
export abstract class NgxBaseControl<TValue = unknown> {
  /** Concrete renderers must declare: `readonly name = input.required<string>();` */
  public readonly name: InputSignal<string> = input.required<string>();

  /** The label text for the form control. */
  public readonly label = input<string>("");

  private readonly adapter: NgxFormAdapter<Record<string, unknown>> =
    inject<NgxFormAdapter<Record<string, unknown>>>(NGX_FORM_ADAPTER);

  /** True when NgxInlineErrorsDirective is applied to this element. */
  protected readonly inlineErrors: boolean =
    inject(NGX_INLINE_ERRORS, { self: true, optional: true }) ?? false;

  /** Marks the field as required for assistive technology. */
  readonly ariaRequired = input<boolean>(false);

  /** Marks the field as disabled for assistive technology (auto-derived from field state). */
  readonly ariaDisabled = input<boolean | undefined>(undefined);

  /** Resolved field state — reactive to name() changes. */
  protected readonly fieldState: Signal<NgxFieldState<TValue>> = computed(
    () => {
      const n = this.name();
      const ref = this.adapter.getField(n);
      if (!ref) {
        throw new Error(
          `[ngx-signal-forms] Field "${n}" not found in form adapter`,
        );
      }
      return ref() as NgxFieldState<TValue>;
    },
  );

  // ── Convenience signals for templates ───────────────────────────────────────

  protected readonly value: Signal<TValue> = computed(() =>
    this.fieldState().value(),
  );
  protected readonly errors: Signal<ReadonlyArray<NgxFieldError>> = computed(
    () => this.fieldState().errors(),
  );
  protected readonly touched: Signal<boolean> = computed(() =>
    this.fieldState().touched(),
  );
  protected readonly dirty: Signal<boolean> = computed(() =>
    this.fieldState().dirty(),
  );
  protected readonly isDisabled: Signal<boolean> = computed(() =>
    this.fieldState().disabled(),
  );
  protected readonly isValid: Signal<boolean> = computed(() =>
    this.fieldState().valid(),
  );
  protected readonly hasErrors: Signal<boolean> = computed(
    () => this.errors().length > 0,
  );
  /** Effective aria-disabled: explicit input overrides field state. */
  protected readonly effectiveAriaDisabled: Signal<boolean> = computed(
    () => this.ariaDisabled() ?? this.isDisabled(),
  );
  /** Error messages joined as a single string for inline display. */
  protected readonly inlineErrorText: Signal<string> = computed(() =>
    this.errors()
      .map((e: NgxFieldError) => e.message)
      .join(", "),
  );

  // ── Mutation helpers ────────────────────────────────────────────────────────

  protected setValue(newValue: TValue): void {
    this.fieldState().value.set(newValue);
  }

  protected markAsTouched(): void {
    this.fieldState().touched.set(true);
  }

  protected markAsDirty(): void {
    this.fieldState().dirty.set(true);
  }

  /** Generate a unique ID for template label/input association. */
  protected static nextId(): number {
    return _nextFieldId++;
  }
}

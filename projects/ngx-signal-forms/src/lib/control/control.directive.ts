import {
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  Signal
} from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY, NGX_FLOATING_LABELS, NGX_FORM_ADAPTER, NGX_INLINE_ERRORS } from "../core/tokens";
import { NgxFieldError, NgxFieldState, NgxFormAdapter } from "../core/types";
import { NgxPrefixDirective } from "./prefix.directive";
import { NgxSuffixDirective } from "./suffix.directive";
import { NgxSupportingTextDirective } from "./supporting-text.directive";

/** Global counter for generating unique field IDs. */
let _nextFieldId = 0;

/**
 * Abstract base class for all renderer components.
 *
 * Injects the nearest NgxFormAdapter (provided by NgxFormComponent)
 * and resolves the field state by name. Provides convenience computed
 * signals that concrete renderers bind in their templates.
 */
@Directive({
  host: {
    "[class.ngx-renderer--touched]": "touched()",
  },
})
export abstract class NgxBaseControl<TValue = unknown> implements OnInit, OnDestroy {
  protected readonly hostElement = inject(ElementRef<HTMLElement>);
  private prefixObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      const hasPrefix = !!this.prefix();
      const isFloating = this.isFloatingLabel();

      this.prefixObserver?.disconnect();

      if (hasPrefix && isFloating) {
        // Aspettiamo che il DOM venga aggiornato dal blocco @if (prefix())
        requestAnimationFrame(() => {
          const host = this.hostElement.nativeElement;
          const prefixEl = host.querySelector('.ngx-input-prefix') as HTMLElement;

          if (prefixEl && typeof ResizeObserver !== 'undefined') {
            this.prefixObserver = new ResizeObserver((entries) => {
              const target = entries[0]?.target as HTMLElement | undefined;
              if (target) {
                // Calcolo esatto perfetto (Larghezza reale nel DOM)
                const width = target.offsetWidth;
                // Impostiamo la variabile CSS sul componente host, delegando il gap al CSS
                host.style.setProperty('--ngx-label-left-offset', `calc(${width}px + var(--ngx-fl-input-padding-with-prefix, 0.75rem))`);
              }
            });
            this.prefixObserver.observe(prefixEl);
          }
        });
      } else {
        this.hostElement.nativeElement.style.removeProperty('--ngx-label-left-offset');
      }
    });
  }
  /** Concrete renderers must declare: `readonly name = input.required<string>();` */
  public readonly name: InputSignal<string> = input.required<string>();

  /** The label text for the form control. */
  public readonly label = input<string>("");

  /** Opt-in or opt-out of floating labels on a per-control basis, overriding the form-level directive. */
  public readonly floatingLabel = input<boolean | undefined>(undefined);

  /**
   * Optional initial value for declarative mode.
   * Takes precedence over [formValue] set on the parent <ngx-form>.
   */
  readonly initialValue = input<unknown>(undefined);

  private readonly adapter: NgxFormAdapter<Record<string, unknown>> =
    inject<NgxFormAdapter<Record<string, unknown>>>(NGX_FORM_ADAPTER);

  private readonly _declarativeRegistry = inject(NGX_DECLARATIVE_REGISTRY, {
    optional: true,
  });

  /** True when NgxInlineErrorsDirective is applied to this element. */
  protected readonly inlineErrors: boolean =
    inject(NGX_INLINE_ERRORS, { self: true, optional: true }) ?? false;

  private readonly globalFloatingLabels = inject(NGX_FLOATING_LABELS, {
    optional: true,
  });

  /** Marks the field as required for assistive technology. */
  readonly ariaRequired = input<boolean>(false);

  /** Marks the field as disabled for assistive technology (auto-derived from field state). */
  readonly ariaDisabled = input<boolean | undefined>(undefined);


  /** Leading content (icon/text) provided via `ngxPrefix` directive. */
  protected readonly prefix = contentChild(NgxPrefixDirective);

  /** Trailing content (icon/text/button) provided via `ngxSuffix` directive. */
  protected readonly suffix = contentChild(NgxSuffixDirective);

  /** Supporting text (helper text) provided via `ngxSupportingText` directive. */
  protected readonly supportingText = contentChild(NgxSupportingTextDirective);

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
  /** Whether the field is required (deduced from validators). */
  protected readonly isRequired: Signal<boolean> = computed(() =>
    this.fieldState().required(),
  );
  /** Error messages joined as a single string for inline display. */
  protected readonly inlineErrorText: Signal<string> = computed(() =>
    this.errors()
      .map((e: NgxFieldError) => e.message)
      .filter((msg) => !!msg && msg.trim() !== "")
      .join(", "),
  );

  /** Whether the field should display a floating label. */
  protected readonly isFloatingLabel: Signal<boolean> = computed(() => {
    const local = this.floatingLabel();
    if (local !== undefined) {
      return local;
    }
    return this.globalFloatingLabels?.ngxFloatingLabels() ?? false;
  });

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

  ngOnInit(): void {
    const iv = this.initialValue();
    if (this._declarativeRegistry && iv !== undefined) {
      this._declarativeRegistry.setInitialValue(this.name(), iv);
    }
  }

  ngOnDestroy(): void {
    this.prefixObserver?.disconnect();
  }
}
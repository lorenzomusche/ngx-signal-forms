import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  input,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxOptionDirective } from "../../control/option.directive";
import { NgxOptionsOverlayControl } from "../../core/options-overlay-control.directive";
import { filterOptionsByQuery } from "../../core/options-utils";
import { NGX_OPTIONS_CONTROL } from "../../core/tokens";
import { NgxOptionsControl } from "../../core/types";

/**
 * Multiselect renderer component.
 * Renders selectable filter chips and delivers ReadonlyArray<TValue>.
 */
@Component({
  selector: "ngx-control-multiselect",
  standalone: true,
  imports: [
    NgxControlLabelComponent,
    NgxErrorListComponent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NGX_OPTIONS_CONTROL,
      useExisting: forwardRef(() => NgxMultiselectComponent),
    },
  ],
  host: {
    class: "ngx-renderer ngx-renderer--multiselect",
    "[class.ngx-inline-errors]": "inlineErrors",
    "[class.ngx-renderer--touched]": "touched()",
    "(document:keydown.escape)": "open() && closeOverlay()",
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
  <div class="ngx-multiselect__label">
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="!!value() && value()!.length > 0"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    @if (label() || searchable()) {
      <div class="ngx-multiselect__header" #wrapper>
        @if (searchable()) {
          <button
            type="button"
            class="ngx-multiselect__search-btn"
            [disabled]="isDisabled()"
            (click)="openOverlay()"
            aria-label="Search options"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="12.5" y1="12.5" x2="17" y2="17" />
            </svg>
          </button>
        }
      </div>
    }
  </div>

    <div
      class="ngx-multiselect__options"
      role="group"
      [attr.aria-label]="label() || null"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
    >
      @for (opt of effectiveOptions(); track opt.value) {
        @if (optionTpl(); as tpl) {
           <button
            type="button"
            class="ngx-chip-wrapper"
            [disabled]="isDisabled()"
            (click)="onToggle(opt.value)"
          >
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="{ $implicit: opt, selected: isSelected(opt.value) }"
            />
          </button>
        } @else {
          @if (mode() === "multi") {
            <div
              class="ngx-chip ngx-chip--counter"
              [class.ngx-chip--selected]="countOf(opt.value) > 0"
              [title]="opt.label"
            >
              <button
                type="button"
                class="ngx-chip__btn"
                [disabled]="isDisabled() || countOf(opt.value) === 0"
                (click)="decrement(opt.value)"
                aria-label="Decrease"
              >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <line x1="3" y1="6" x2="9" y2="6" />
                </svg>
              </button>
              <span class="ngx-chip__label">{{ opt.label }}</span>
              <span class="ngx-chip__count">&times;{{ countOf(opt.value) }}</span>
              <button
                type="button"
                class="ngx-chip__btn"
                [disabled]="isDisabled()"
                (click)="increment(opt.value)"
                aria-label="Increase"
              >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <line x1="3" y1="6" x2="9" y2="6" />
                  <line x1="6" y1="3" x2="6" y2="9" />
                </svg>
              </button>
            </div>
          } @else {
            <button
              type="button"
              class="ngx-chip"
              [class.ngx-chip--selected]="isSelected(opt.value)"
              [disabled]="isDisabled()"
              [title]="opt.label"
              [attr.aria-pressed]="isSelected(opt.value)"
              (click)="onToggle(opt.value)"
              (blur)="markAsTouched()"
            >
              @if (isSelected(opt.value)) {
                <svg
                  class="ngx-chip__check"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <polyline points="3.5 9.5 7 13 14.5 5.5" />
                </svg>
              }
              <span class="ngx-chip__label">{{ opt.label }}</span>
            </button>
          }
        }
      }
    </div>

    @if (open()) {
      <div class="ngx-multiselect-overlay" (click)="closeOverlay()"></div>
      <div
        class="ngx-multiselect-overlay__panel"
        [class.ngx-multiselect-overlay__panel--above]="position() === 'above'"
        [class.ngx-multiselect-overlay__panel--overlay]="position() === 'overlay'"
        [style.top.px]="position() === 'above' || position() === 'overlay' ? null : panelTop()"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-label="Search options"
      >
        <input
          #overlayInput
          type="text"
          class="ngx-multiselect-overlay__input"
          placeholder="Search…"
          autocomplete="off"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          (keydown.escape)="closeOverlay()"
        />
        <div class="ngx-multiselect__options ngx-multiselect-overlay__grid">
          @for (opt of searchResults(); track opt.value; let i = $index) {
            @if (mode() === "multi") {
              <div
                class="ngx-chip ngx-chip--counter"
                [class.ngx-chip--selected]="countOf(opt.value) > 0"
              >
                <button
                  type="button"
                  class="ngx-chip__btn"
                  (click)="decrement(opt.value)"
                  [disabled]="countOf(opt.value) === 0"
                  aria-label="Decrease"
                >
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <line x1="3" y1="6" x2="9" y2="6" />
                  </svg>
                </button>
                <span class="ngx-chip__label">{{
                  opt.label
                }}</span>
                <span class="ngx-chip__count"
                  >&times;{{ countOf(opt.value) }}</span
                >
                <button
                  type="button"
                  class="ngx-chip__btn"
                  (click)="increment(opt.value)"
                  aria-label="Increase"
                >
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <line x1="3" y1="6" x2="9" y2="6" />
                    <line x1="6" y1="3" x2="6" y2="9" />
                  </svg>
                </button>
              </div>
            } @else {
              <button
                type="button"
                class="ngx-chip"
                [class.ngx-chip--selected]="isSelected(opt.value)"
                (click)="onOverlaySelect(opt.value)"
              >
                @if (isSelected(opt.value)) {
                  <svg
                    class="ngx-chip__check"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                  >
                    <polyline points="3.5 9.5 7 13 14.5 5.5" />
                  </svg>
                }
                <span class="ngx-chip__label">{{ opt.label }}</span>
              </button>
            }
          } @empty {
            <span class="ngx-multiselect-overlay__empty">No results</span>
          }
        </div>
      </div>
    }

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxMultiselectComponent<TValue = string>
  extends NgxOptionsOverlayControl<ReadonlyArray<TValue>, TValue>
  implements NgxOptionsControl<TValue> {
  readonly mode = input<"single" | "multi">("single");

  /** Custom option template provided via `<ng-template ngxOption>`. */
  protected readonly optionTpl = contentChild(NgxOptionDirective, {
    read: TemplateRef,
  });

  protected readonly fieldId = `ngx-control-multiselect-${NgxBaseControl.nextId()}`;

  /** Options available in the search overlay (filtered by query + mode). */
  protected readonly searchResults = computed(() => {
    let opts = this.effectiveOptions();
    if (this.mode() === "single") {
      const selected = this.selectedSet();
      opts = opts.filter((o) => !selected.has(o.value));
    }
    return filterOptionsByQuery(opts, this.searchQuery());
  });

  private readonly overlayInputRef =
    viewChild<ElementRef<HTMLInputElement>>("overlayInput");

  /** Top offset in pixels — top edge of .ngx-multiselect__options relative to host. */
  protected readonly panelTop = signal(0);

  /** Pre-computed count map for multi-mode. */
  protected readonly counts = computed(() => {
    const map = new Map<TValue, number>();
    for (const v of this.value()) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return map;
  });

  /** Pre-computed selection set for single-mode. */
  protected readonly selectedSet = computed(() => new Set(this.value()));

  // ── Overlay hooks ───────────────────────────────────────────────────────────

  protected override onBeforeOpen(): void {
    this.searchQuery.set("");
    const host = this.hostRef.nativeElement as HTMLElement;
    const optionsEl = host.querySelector(".ngx-multiselect__options");

    if (optionsEl) {
      const hostRect = host.getBoundingClientRect();
      const optionsRect = optionsEl.getBoundingClientRect();
      this.panelTop.set(optionsRect.top - hostRect.top);
    }

    setTimeout(() => this.overlayInputRef()?.nativeElement.focus(), 0);
  }

  // ── Single-mode helpers ─────────────────────────────────────────────────────

  protected isSelected(optValue: TValue): boolean {
    return this.selectedSet().has(optValue);
  }

  protected onToggle(optValue: TValue): void {
    const current = this.value();
    const next: ReadonlyArray<TValue> = current.includes(optValue)
      ? current.filter((v) => v !== optValue)
      : [...current, optValue];
    this.setValue(next);
    this.markAsDirty();
  }

  // ── Multi-mode (counter) helpers ────────────────────────────────────────────

  protected countOf(optValue: TValue): number {
    return this.counts().get(optValue) ?? 0;
  }

  protected increment(optValue: TValue): void {
    this.setValue([...this.value(), optValue]);
    this.markAsDirty();
  }

  protected decrement(optValue: TValue): void {
    const arr = [...this.value()];
    const idx = arr.indexOf(optValue);
    if (idx >= 0) {
      arr.splice(idx, 1);
      this.setValue(arr);
      this.markAsDirty();
    }
  }

  // ── Search overlay ──────────────────────────────────────────────────────────

  public resetSelection(): void {
    this.setValue([]);
    this.markAsDirty();
  }

  protected onOverlaySelect(optValue: TValue): void {
    if (this.mode() === "single") {
      if (!this.value().includes(optValue)) {
        this.setValue([...this.value(), optValue]);
        this.markAsDirty();
      }
      if (this.searchResults().length === 0) {
        this.closeOverlay();
      }
    } else {
      this.increment(optValue);
    }
  }
}

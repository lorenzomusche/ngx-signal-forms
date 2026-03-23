import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  contentChild,
  TemplateRef,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxInlineErrorIconComponent } from "../../control/inline-error-icon.component";
import { NgxOptionDirective } from "../../control/option.directive";
import {
  computeOverlayPosition,
  OverlayPosition,
} from "../../core/overlay-position";
import { NgxSelectOption } from "../../core/types";

/**
 * Multiselect renderer component.
 * Renders selectable filter chips and delivers ReadonlyArray<TValue>.
 *
 * Supports two modes:
 * - `'single'` (default): each option selected at most once.
 * - `'multi'`: counter-based — options can be selected multiple times;
 *   chips show a count badge with increment / decrement controls.
 *
 * When `searchable` is true, a search icon opens a full-screen overlay
 * where options float around a centered search input.
 *
 * ```html
 * <ngx-control-multiselect name="tags" label="Tags"
 *   [options]="tagOptions" [searchable]="true" mode="multi" />
 * ```
 */
@Component({
  selector: "ngx-control-multiselect",
  standalone: true,
  imports: [
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
    NgTemplateOutlet,
    NgxOptionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--multiselect",
    "(document:keydown.escape)": "searchOpen() && closeSearch()",
  },
  template: `
    @if (label() || searchable()) {
      <div class="ngx-multiselect__header">
        @if (label()) {
          <label class="ngx-multiselect__label">
            {{ label() }}
            @if (inlineErrors && touched() && hasErrors()) {
              <ngx-inline-error-icon [errorText]="inlineErrorText()" />
            }
          </label>
        }
        @if (searchable()) {
          <button
            type="button"
            class="ngx-multiselect__search-btn"
            [disabled]="isDisabled()"
            (click)="openSearch()"
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

    <div
      class="ngx-multiselect__options"
      role="group"
      [attr.aria-label]="label() || null"
      [attr.aria-invalid]="hasErrors()"
      [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-disabled]="effectiveAriaDisabled()"
    >
      @for (opt of options(); track opt.value) {
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

    @if (searchOpen()) {
      <div class="ngx-multiselect-overlay" (click)="closeSearch()"></div>
      <div
        class="ngx-multiselect-overlay__panel"
        [class.ngx-multiselect-overlay__panel--above]="dropUp()"
        [class.ngx-multiselect-overlay__panel--overlay]="overlayMode()"
        [style.top.px]="dropUp() || overlayMode() ? null : panelTop()"
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
          (keydown.escape)="closeSearch()"
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
export class NgxMultiselectComponent<TValue = string> extends NgxBaseControl<
  ReadonlyArray<TValue>
> {
  readonly label = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly searchable = input<boolean>(false);
  readonly mode = input<"single" | "multi">("single");

  /** Custom option template provided via `<ng-template ngxOption>`. */
  protected readonly optionTpl = contentChild(NgxOptionDirective, {
    read: TemplateRef,
  });

  protected readonly fieldId = `ngx-control-multiselect-${NgxBaseControl.nextId()}`;

  /** Whether the search overlay is open. */
  protected readonly searchOpen = signal(false);

  /** Current search query in the overlay. */
  protected readonly searchQuery = signal("");

  /** Options available in the search overlay (filtered by query + mode). */
  protected readonly searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let opts = this.options();
    if (this.mode() === "single") {
      const selected = this.selectedSet();
      opts = opts.filter((o) => !selected.has(o.value));
    }
    if (!query) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(query));
  });

  private readonly overlayInputRef =
    viewChild<ElementRef<HTMLInputElement>>("overlayInput");

  private readonly hostRef = inject(ElementRef);

  /** Whether the panel should open above the controller. */
  protected readonly dropUp = signal(false);

  /** Whether the panel renders as a centered overlay (no space above or below). */
  protected readonly overlayMode = signal(false);

  /** Resolved overlay position. */
  private readonly overlayPosition = signal<OverlayPosition>("below");

  /** Top offset in pixels — top edge of .ngx-multiselect__options relative to host. */
  protected readonly panelTop = signal(0);

  /** Pre-computed count map for multi-mode (avoids O(n\u00d7m) in template). */
  protected readonly counts = computed(() => {
    const map = new Map<TValue, number>();
    for (const v of this.value()) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return map;
  });

  /** Pre-computed selection set for single-mode (avoids O(n) per chip). */
  protected readonly selectedSet = computed(() => new Set(this.value()));

  // ── Single-mode helpers ─────────────────────────────────────────────────────

  /** Check whether a given option value is currently selected. */
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

  /** Count how many times a value appears in the current selection. */
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

  protected openSearch(): void {
    this.searchQuery.set("");
    const host = this.hostRef.nativeElement as HTMLElement;
    const optionsEl = host.querySelector(".ngx-multiselect__options");
    const spaceAnchor = (optionsEl ?? host) as HTMLElement;
    const pos = computeOverlayPosition(spaceAnchor);
    this.overlayPosition.set(pos);
    this.dropUp.set(pos === "above");
    this.overlayMode.set(pos === "overlay");
    // Measure the top of the options container relative to the host
    if (optionsEl) {
      const hostRect = host.getBoundingClientRect();
      const optionsRect = optionsEl.getBoundingClientRect();
      this.panelTop.set(optionsRect.top - hostRect.top);
    }
    this.searchOpen.set(true);
    setTimeout(() => this.overlayInputRef()?.nativeElement.focus(), 0);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected onOverlaySelect(optValue: TValue): void {
    if (this.mode() === "single") {
      if (!this.value().includes(optValue)) {
        this.setValue([...this.value(), optValue]);
        this.markAsDirty();
      }
      // Close only when no more options are available
      if (this.searchResults().length === 0) {
        this.searchOpen.set(false);
      }
    } else {
      this.increment(optValue);
    }
  }
}

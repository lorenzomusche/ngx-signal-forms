import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  output,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxErrorListComponent } from "../../control/error-list.component";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxIconComponent } from "../../control/ngx-icon.component";
import { NgxOptionDirective } from "../../control/option.directive";
import { NgxOptionsOverlayControl } from "../../core/options-overlay-control.directive";
import { filterOptionsByQuery } from "../../core/options-utils";
import { NgxOverlayPanelComponent } from "../../core/overlay-panel.component";
import { NGX_OPTIONS_CONTROL } from "../../core/tokens";
import { NGX_I18N_MESSAGES } from "../../core/i18n";
import { NgxOptionsControl, NgxSelectOption } from "../../core/types";

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
    NgxIconComponent,
    NgxOverlayPanelComponent,
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
    // onDocumentClick is overridden below to use the host element
    // rather than the narrower #wrapper reference from NgxOverlayControl.
    "(document:click)": "onDocumentClick($event)",
  },
  template: `
    <div class="ngx-multiselect" #wrapper [class.ngx-multiselect--open]="open()">
      <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="!!value() && value()!.length > 0"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    @if (label() || searchable()) {
      <div class="ngx-multiselect__header">
        @if (searchable()) {
          <button
            type="button"
            class="ngx-multiselect__search-btn"
            [disabled]="isDisabled()"
            (click)="toggleOverlay($event)"
            aria-label="Search options"
          >
            <ngx-icon name="SEARCH" />
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
      @for (opt of filteredOptions(); track opt.value) {
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
                <ngx-icon name="MINUS" />
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
                <ngx-icon name="PLUS" />
              </button>
            </div>
          } @else {
            <button
              type="button"
              class="ngx-chip ngx-chip--centered"
              [class.ngx-chip--selected]="isSelected(opt.value)"
              [disabled]="isDisabled()"
              [title]="opt.label"
              [attr.aria-pressed]="isSelected(opt.value)"
              (click)="onToggle(opt.value)"
              (blur)="markAsTouched()"
            >
              <ngx-icon name="CHECKMARK" class="ngx-chip__check" />
              <span class="ngx-chip__label">{{ opt.label }}</span>
            </button>
          }
        }
      }
    </div>

    <ngx-overlay-panel
      [open]="open()"
      [position]="position()"
      [alignment]="alignment()"
      [coords]="coords()"
      [maxHeight]="maxHeight()"
      [hasBackdrop]="position() === 'overlay'"
      [widthMode]="'match-anchor'"
      [panelClass]="'ngx-multiselect-overlay__panel'"
      (close)="closeOverlay()"
    >
      <input
        #overlayInput
        type="text"
        class="ngx-multiselect-overlay__input"
        [placeholder]="i18n.searchPlaceholder"
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
                <ngx-icon name="MINUS" />
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
                <ngx-icon name="PLUS" />
              </button>
            </div>
          } @else {
            <button
              type="button"
              class="ngx-chip"
              [class.ngx-chip--selected]="isSelected(opt.value)"
              (click)="onOverlaySelect(opt.value)"
            >
              <span class="ngx-chip__label">{{ opt.label }}</span>
            </button>
          }
        } @empty {
          <span class="ngx-multiselect-overlay__empty">{{ i18n.noResults }}</span>
        }
      </div>
    </ngx-overlay-panel>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    } @else if (supportingText(); as st) {
      <div class="ngx-supporting-text">
        <ng-container [ngTemplateOutlet]="st.template" />
      </div>
    }
  `,
})
export class NgxMultiselectComponent<TValue = string>
  extends NgxOptionsOverlayControl<ReadonlyArray<TValue>, TValue>
  implements NgxOptionsControl<TValue> {
  protected readonly i18n = inject(NGX_I18N_MESSAGES);
  protected override readonly minSpace = 250;
  private readonly injector = inject(Injector);

  readonly mode = input<"single" | "multi">("single");
  readonly selectionChange = output<NgxSelectOption<TValue>>();

  /**
   * Optional filter predicate applied to options before display.
   * Receives the option *value* and returns `true` to show the option.
   * When absent, all options are shown.
   */
  readonly filterFn = input<((value: TValue) => boolean) | undefined>(undefined);

  /** Custom option template provided via `<ng-template ngxOption>`. */
  protected readonly optionTpl = contentChild(NgxOptionDirective, {
    read: TemplateRef,
  });

  protected readonly fieldId = `ngx-control-multiselect-${NgxBaseControl.nextId()}`;

  /** Options after applying the optional `filterFn` predicate. */
  protected readonly filteredOptions = computed(() => {
    const fn = this.filterFn();
    return fn ? this.effectiveOptions().filter((o) => fn(o.value)) : this.effectiveOptions();
  });

  /** Options available in the search overlay (filtered by predicate + query + mode). */
  protected readonly searchResults = computed(() => {
    let opts = this.filteredOptions();
    if (this.mode() === "single") {
      const selected = this.selectedSet();
      opts = opts.filter((o) => !selected.has(o.value));
    }
    return filterOptionsByQuery(opts, this.searchQuery());
  });

  private readonly overlayInputRef =
    viewChild<ElementRef<HTMLInputElement>>("overlayInput");

  /** Pre-computed count map for multi-mode. */
  protected readonly counts = computed(() => {
    const map = new Map<TValue, number>();
    for (const v of this.value() ?? []) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return map;
  });

  /** Pre-computed selection set for single-mode. */
  protected readonly selectedSet = computed(() => new Set(this.value() ?? []));

  // ── Overlay hooks ───────────────────────────────────────────────────────────

  protected override onBeforeOpen(): void {
    this.searchQuery.set("");
    afterNextRender(() => this.overlayInputRef()?.nativeElement.focus(), { injector: this.injector });
  }

  /**
   * Override to check against the full host element rather than the narrow
   * #wrapper (header div). The overlay panel is a DOM child of the host even
   * when position:fixed, so host.contains() correctly excludes panel clicks.
   */
  protected override onDocumentClick(event: Event): void {
    if (!this.hostRef.nativeElement.contains(event.target as Node)) {
      this.closeOverlay();
    }
  }

  // ── Single-mode helpers ─────────────────────────────────────────────────────

  protected isSelected(optValue: TValue): boolean {
    return this.selectedSet().has(optValue);
  }

  protected onToggle(optValue: TValue): void {
    const current = this.value() ?? [];
    const next: ReadonlyArray<TValue> = current.includes(optValue)
      ? current.filter((v) => v !== optValue)
      : [...current, optValue];
    this.setValue(next);
    this.markAsDirty();

    const matched = this.effectiveOptions().find((o) => o.value === optValue);
    if (matched) this.selectionChange.emit(matched);
  }

  // ── Multi-mode (counter) helpers ────────────────────────────────────────────

  protected countOf(optValue: TValue): number {
    return this.counts().get(optValue) ?? 0;
  }

  protected increment(optValue: TValue): void {
    this.setValue([...(this.value() ?? []), optValue]);
    this.markAsDirty();

    const matched = this.effectiveOptions().find((o) => o.value === optValue);
    if (matched) this.selectionChange.emit(matched);
  }

  protected decrement(optValue: TValue): void {
    const arr = [...(this.value() ?? [])];
    const idx = arr.indexOf(optValue);
    if (idx >= 0) {
      arr.splice(idx, 1);
      this.setValue(arr);
      this.markAsDirty();

      const matched = this.effectiveOptions().find((o) => o.value === optValue);
      if (matched) this.selectionChange.emit(matched);
    }
  }

  // ── Search overlay ──────────────────────────────────────────────────────────

  public resetSelection(): void {
    this.setValue([]);
    this.markAsDirty();
  }

  protected onOverlaySelect(optValue: TValue): void {
    if (this.mode() === "single") {
      const current = this.value() ?? [];
      if (!current.includes(optValue)) {
        this.setValue([...current, optValue]);
        this.markAsDirty();
        const matched = this.effectiveOptions().find((o) => o.value === optValue);
        if (matched) this.selectionChange.emit(matched);
      }
      if (this.searchResults().length === 0) {
        this.closeOverlay();
      }
    } else {
      this.increment(optValue);
    }
  }
}

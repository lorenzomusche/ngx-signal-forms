import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
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
 * Select renderer component.
 *
 * When a custom `<ng-template ngxOption>` is provided, renders a fully custom
 * dropdown with HTML content in options. Otherwise falls back to a native
 * `<select>` element.
 *
 * ```html
 * <ngx-control-select name="country" [options]="countries">
 *   <ng-template ngxOption let-opt>
 *     <span class="flag">{{ flags[opt.value] }}</span> {{ opt.label }}
 *   </ng-template>
 * </ngx-control-select>
 * ```
 */
@Component({
  selector: "ngx-control-select",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxInlineErrorIconComponent,
    NgxErrorListComponent,
    NgxOptionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ngx-renderer ngx-renderer--select",
    "(document:click)": "onDocumentClick($event)",
    "(keydown)": "onKeydown($event)",
  },
  template: `
    @if (label()) {
      <label [for]="fieldId">
        {{ label() }}
        @if (inlineErrors && touched() && hasErrors()) {
          <ngx-inline-error-icon [errorText]="inlineErrorText()" />
        }
      </label>
    }

    @if (optionTpl(); as tpl) {
      <!-- Custom dropdown -->
      <div class="ngx-select" #wrapper>
        <button
          type="button"
          class="ngx-select__trigger"
          [id]="fieldId"
          [disabled]="isDisabled()"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-activedescendant]="
            activeIndex() >= 0 ? fieldId + '-opt-' + activeIndex() : null
          "
          [attr.aria-invalid]="hasErrors()"
          [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-disabled]="effectiveAriaDisabled()"
          [attr.aria-label]="label() || null"
          (click)="toggleOpen()"
          (blur)="onBlur()"
        >
          @if (selectedOption(); as sel) {
            <span class="ngx-select__value">
              <ng-container
                [ngTemplateOutlet]="tpl"
                [ngTemplateOutletContext]="{ $implicit: sel, selected: true }"
              />
            </span>
          } @else {
            <span class="ngx-select__placeholder">{{ placeholder() }}</span>
          }
          <span class="ngx-select__arrow" aria-hidden="true">▾</span>
        </button>

        @if (open()) {
          @if (overlayMode()) {
            <div
              class="ngx-select__overlay-backdrop"
              (click)="open.set(false)"
            ></div>
          }
          <div
            class="ngx-select__dropdown"
            [class.ngx-select__dropdown--above]="dropUp()"
            [class.ngx-select__dropdown--overlay]="overlayMode()"
          >
            @if (searchable()) {
              <input
                #searchInput
                type="text"
                class="ngx-select__search"
                placeholder="Search…"
                autocomplete="off"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
              />
            }
            <ul
              class="ngx-select__list"
              role="listbox"
              [attr.aria-labelledby]="fieldId"
            >
              @for (opt of filteredOptions(); track opt.value; let i = $index) {
                <li
                  [id]="fieldId + '-opt-' + i"
                  role="option"
                  class="ngx-select__option"
                  [class.ngx-select__option--active]="activeIndex() === i"
                  [class.ngx-select__option--selected]="opt.value === value()"
                  [attr.aria-selected]="opt.value === value()"
                  (mouseenter)="activeIndex.set(i)"
                  (click)="selectOption(opt)"
                >
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{
                      $implicit: opt,
                      selected: opt.value === value()
                    }"
                  />
                </li>
              } @empty {
                <li class="ngx-select__no-results" role="presentation">
                  No results
                </li>
              }
            </ul>
          </div>
        }
      </div>
    } @else {
      <!-- Native select fallback -->
      <select
        [id]="fieldId"
        [disabled]="isDisabled()"
        (change)="onNativeChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-disabled]="effectiveAriaDisabled()"
        [attr.aria-label]="label() || null"
      >
        @if (placeholder()) {
          <option value="" disabled [selected]="value() === null">
            {{ placeholder() }}
          </option>
        }
        @for (opt of options(); track opt.value; let i = $index) {
          <option [value]="i" [selected]="opt.value === value()">
            {{ opt.label }}
          </option>
        }
      </select>
    }

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxSelectComponent<
  TValue = string,
> extends NgxBaseControl<TValue | null> {
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly options = input<readonly NgxSelectOption<TValue>[]>([]);
  readonly searchable = input<boolean>(false);

  /** Custom option template provided via `<ng-template ngxOption>`. */
  protected readonly optionTpl = contentChild(NgxOptionDirective, {
    read: TemplateRef,
  });

  protected readonly fieldId = `ngx-control-select-${NgxBaseControl.nextId()}`;

  /** Whether the custom dropdown is open. */
  protected readonly open = signal(false);

  /** Resolved position for the dropdown popup. */
  protected readonly position = signal<OverlayPosition>("below");

  /** Whether the dropdown opens above the trigger. */
  protected readonly dropUp = computed(() => this.position() === "above");

  /** Whether the dropdown renders as a centered overlay (no space above or below). */
  protected readonly overlayMode = computed(
    () => this.position() === "overlay",
  );

  /** Index of the keyboard-active option (for arrow navigation). */
  protected readonly activeIndex = signal(-1);

  /** The currently selected option object (for rendering in trigger). */
  protected readonly selectedOption = computed<NgxSelectOption<TValue> | null>(
    () => {
      const v = this.value();
      if (v === null) return null;
      return (
        this.options().find((o: NgxSelectOption<TValue>) => o.value === v) ??
        null
      );
    },
  );

  /** Search query for filtering options. */
  protected readonly searchQuery = signal("");

  /** Options filtered by the current search query. */
  protected readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(query));
  });

  private readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");
  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");
  private readonly hostRef = inject(ElementRef);

  // ── Custom dropdown interactions ────────────────────────────────────────────

  protected toggleOpen(): void {
    if (this.isDisabled()) return;
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.searchQuery.set("");
      const filtered = this.filteredOptions();
      const idx = filtered.findIndex(
        (o: NgxSelectOption<TValue>) => o.value === this.value(),
      );
      this.activeIndex.set(idx >= 0 ? idx : 0);
      this.position.set(
        computeOverlayPosition(this.hostRef.nativeElement as HTMLElement),
      );
      // Focus search input after DOM renders
      if (this.searchable()) {
        setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
      }
    }
  }

  protected selectOption(opt: NgxSelectOption<TValue>): void {
    this.setValue(opt.value);
    this.markAsDirty();
    this.open.set(false);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.activeIndex.set(0);
  }

  protected onBlur(): void {
    // Delay to allow click on option to register before closing
    setTimeout(() => {
      if (!this.wrapperRef()?.nativeElement.contains(document.activeElement)) {
        this.open.set(false);
        this.markAsTouched();
      }
    }, 150);
  }

  protected onDocumentClick(event: Event): void {
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;
    const opts = this.filteredOptions();
    const idx = this.activeIndex();
    const isSearchFocused =
      this.searchInputRef()?.nativeElement === document.activeElement;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.activeIndex.set(Math.min(idx + 1, opts.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        this.activeIndex.set(Math.max(idx - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (idx >= 0 && idx < opts.length) {
          const opt = opts[idx];
          if (opt) this.selectOption(opt);
        }
        break;
      case " ":
        if (!isSearchFocused) {
          event.preventDefault();
          if (idx >= 0 && idx < opts.length) {
            const opt = opts[idx];
            if (opt) this.selectOption(opt);
          }
        }
        break;
      case "Escape":
        event.preventDefault();
        this.open.set(false);
        break;
    }
  }

  // ── Native select fallback ──────────────────────────────────────────────────

  protected onNativeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = Number(target.value);
    const matched = this.options()[index];
    this.setValue(matched?.value ?? null);
    this.markAsDirty();
  }
}

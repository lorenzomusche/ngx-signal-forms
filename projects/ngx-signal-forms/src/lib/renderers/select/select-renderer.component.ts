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
import { NgxOptionsControl, NgxSelectOption } from "../../core/types";

/**
 * Select renderer component.
 *
 * When a custom `<ng-template ngxOption>` is provided, renders a fully custom
 * dropdown with HTML content in options. Otherwise falls back to a native
 * `<select>` element.
 */
@Component({
  selector: "ngx-control-select",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxControlLabelComponent,
    NgxErrorListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NGX_OPTIONS_CONTROL,
      useExisting: forwardRef(() => NgxSelectComponent),
    },
  ],
  host: {
    class: "ngx-renderer ngx-renderer--select",
    "[class.ngx-inline-errors]": "inlineErrors",
    "(document:click)": "onDocumentClick($event)",
    "(keydown)": "onKeydown($event)",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

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
          (click)="toggleOverlay()"
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
              (click)="closeOverlay()"
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
        @for (opt of effectiveOptions(); track opt.value; let i = $index) {
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
export class NgxSelectComponent<TValue = string>
  extends NgxOptionsOverlayControl<TValue | null, TValue>
  implements NgxOptionsControl<TValue> {
  readonly placeholder = input<string>("");

  /** Custom option template provided via `<ng-template ngxOption>`. */
  protected readonly optionTpl = contentChild(NgxOptionDirective, {
    read: TemplateRef,
  });

  protected readonly fieldId = `ngx-control-select-${NgxBaseControl.nextId()}`;

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
        this.effectiveOptions().find(
          (o: NgxSelectOption<TValue>) => o.value === v,
        ) ?? null
      );
    },
  );

  /** Options filtered by the current search query. */
  protected readonly filteredOptions = computed(() =>
    filterOptionsByQuery(this.effectiveOptions(), this.searchQuery()),
  );

  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");

  // ── Custom dropdown interactions ────────────────────────────────────────────

  protected override onBeforeOpen(): void {
    this.searchQuery.set("");
    const filtered = this.filteredOptions();
    const idx = filtered.findIndex(
      (o: NgxSelectOption<TValue>) => o.value === this.value(),
    );
    this.activeIndex.set(idx >= 0 ? idx : 0);

    // Focus search input after DOM renders
    if (this.searchable()) {
      setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
    }
  }

  protected selectOption(opt: NgxSelectOption<TValue>): void {
    this.setValue(opt.value);
    this.markAsDirty();
    this.closeOverlay();
  }

  protected onBlur(): void {
    // Delay to allow click on option to register before closing
    setTimeout(() => {
      if (!this.wrapperRef()?.nativeElement.contains(document.activeElement)) {
        this.closeOverlay();
        this.markAsTouched();
      }
    }, 150);
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
        this.closeOverlay();
        break;
    }
  }

  // ── Native select fallback ──────────────────────────────────────────────────

  public resetSelection(): void {
    this.setValue(null);
    this.markAsDirty();
  }

  protected onNativeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = Number(target.value);
    const matched = this.effectiveOptions()[index];
    this.setValue(matched?.value ?? null);
    this.markAsDirty();
  }
}

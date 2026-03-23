import { computed, Directive, input, signal } from "@angular/core";
import { NgxOverlayControl } from "./overlay-control.directive";
import { NgxOptionsControl, NgxSelectOption } from "./types";

/**
 * Abstract base class for controls that have both an overlay and a list of options.
 *
 * Centralizes:
 * - `options` input
 * - `searchable` input
 * - `overrideOptions` signal (for dynamic/conditional options)
 * - `searchQuery` signal
 * - `effectiveOptions` computed (merges input + override)
 * - `resetSelection` logic
 */
@Directive()
export abstract class NgxOptionsOverlayControl<TValue, TOptionValue = any>
  extends NgxOverlayControl<TValue>
  implements NgxOptionsControl<TOptionValue>
{
  /** The list of options available for selection. */
  readonly options = input<readonly NgxSelectOption<TOptionValue>[]>([]);

  /** Whether a search input should be displayed in the dropdown/overlay. */
  readonly searchable = input<boolean>(false);

  /** Internal options override (used by conditional/filter directives). */
  public readonly overrideOptions =
    signal<readonly NgxSelectOption<TOptionValue>[] | null>(null);

  /** Current search query string. */
  protected readonly searchQuery = signal("");

  /**
   * Effective options used for rendering: uses `overrideOptions` if provided,
   * otherwise falls back to the `options` input.
   */
  protected readonly effectiveOptions = computed(
    () => this.overrideOptions() ?? this.options(),
  );

  /** Reset the control value to its empty state. */
  public abstract resetSelection(): void;

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}

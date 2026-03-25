import {
  Directive,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { NgxBaseControl } from "../control/control.directive";
import { NgxA11yAnnouncer } from "./a11y-announcer";
import {
  ComputedPosition,
  computeOverlayPosition,
  OverlayAlignment,
  OverlayPosition,
} from "./overlay-position";

/**
 * Abstract base class for components that have an overlay popup (select, pickers).
 *
 * Handles:
 * - Open/close state management via `open` signal.
 * - Dynamic positioning (above/below/overlay) via `computeOverlayPosition`.
 * - Outside click detection to close the popup.
 * - `wrapper` viewChild for position calculations.
 */
@Directive({
  host: {
    "[class.ngx-renderer--open]": "open()",
    "[style.--ngx-overlay-top.px]": "coords().top",
    "[style.--ngx-overlay-bottom.px]": "coords().bottom",
    "[style.--ngx-overlay-left.px]": "coords().left",
    "[style.--ngx-overlay-right.px]": "coords().right",
    "[style.--ngx-overlay-width.px]": "coords().width",
    "[style.will-change]": "open() ? 'top, left, bottom, right' : null",
  },
})
export abstract class NgxOverlayControl<TValue> extends NgxBaseControl<TValue> {
  /** Signal tracking if the overlay is currently open. */
  protected readonly open = signal(false);

  /** Computed position of the overlay (below, above, or fixed overlay for mobile). */
  protected readonly position = signal<OverlayPosition>("below");

  /** Computed alignment of the overlay (left, right). */
  protected readonly alignment = signal<OverlayAlignment>("left");

  /** Viewport coordinates for fixed positioning. */
  protected readonly coords = signal<ComputedPosition["coords"]>({ width: 0 });

  /** The wrapper element used to anchor the overlay and detect outside clicks. */
  protected readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");

  /** Reference to the host element for position calculation. */
  protected readonly hostRef = inject(ElementRef);

  protected readonly announcer = inject(NgxA11yAnnouncer);

  /** Toggles the overlay state. */
  protected toggleOverlay(): void {
    if (this.isDisabled()) return;
    this.open() ? this.closeOverlay() : this.openOverlay();
  }

  /** Minimum space required below or above to anchor the overlay. Default 128px. */
  protected readonly minSpace: number = 128;

  /** Minimum horizontal space required for the overlay. Default 250px. */
  protected readonly minWidth: number = 250;

  /** Preferred horizontal alignment. Default 'left'. */
  protected readonly preferredAlignment: OverlayAlignment = "left";

  /** Preferred vertical position. Defaults to 'below'. */
  protected readonly preferredPosition: "above" | "below" = "below";


  /** Opens the overlay and recalculates its position. */
  protected openOverlay(): void {
    if (this.isDisabled() || this.open()) return;
    this.onBeforeOpen();
    this.open.set(true);

    const result = computeOverlayPosition(this.hostRef.nativeElement, {
      minSpace: this.minSpace,
      minWidth: this.minWidth,
      preferredAlignment: this.preferredAlignment,
      preferredPosition: this.preferredPosition,
    });


    this.position.set(result.position);
    this.alignment.set(result.alignment);
    this.coords.set(result.coords);
    this.announcer.announce("Popup opened");

    // Keep fixed position anchored during scroll
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("resize", this.handleResize);
  }

  private scrollFrameId: number | null = null;
  protected readonly handleScroll = (_event: Event) => {
    if (!this.open()) return;

    if (this.scrollFrameId) {
      cancelAnimationFrame(this.scrollFrameId);
    }

    this.scrollFrameId = requestAnimationFrame(() => {
      this.updatePosition();
      this.scrollFrameId = null;
    });
  };

  protected readonly handleResize = () => {
    if (this.open()) this.closeOverlay();
  };

  /** Recalculates the position of the currently open overlay. */
  protected updatePosition(): void {
    if (!this.open()) return;

    const result = computeOverlayPosition(this.hostRef.nativeElement, {
      minSpace: this.minSpace,
      minWidth: this.minWidth,
      preferredAlignment: this.preferredAlignment,
      preferredPosition: this.preferredPosition,
    });

    this.position.set(result.position);
    this.alignment.set(result.alignment);
    this.coords.set(result.coords);
  }

  /** Closes the overlay. */
  protected closeOverlay(): void {
    if (!this.open()) return;
    this.open.set(false);
    window.removeEventListener("scroll", this.handleScroll, true);
    window.removeEventListener("resize", this.handleResize);
    this.announcer.announce("Popup closed");
  }

  /**
   * Hook called just before the overlay opens.
   * Useful for syncing draft values or search queries.
   */
  protected onBeforeOpen(): void { }

  /**
   * Host listener for document clicks.
   * Closes the overlay if the click is outside the wrapper element.
   */
  protected onDocumentClick(event: Event): void {
    const el = this.wrapperRef()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.closeOverlay();
    }
  }
}

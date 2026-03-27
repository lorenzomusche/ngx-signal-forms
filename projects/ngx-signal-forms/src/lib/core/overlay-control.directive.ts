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
  computeCoordsForAnchor,
  computeOverlayPosition,
  OverlayAlignment,
  OverlayAnchor,
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
    "[style.--ngx-overlay-max-height.px]": "maxHeight()",
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

  /**
   * Max-height of the overlay panel in px, frozen at open time.
   * Set once in openOverlay(), never updated during scroll.
   * Exposed as --ngx-overlay-max-height on the host.
   */
  protected readonly maxHeight = signal(0);

  /** The wrapper element used to anchor the overlay and detect outside clicks. */
  protected readonly wrapperRef = viewChild<ElementRef<HTMLElement>>("wrapper");

  /** Reference to the host element for position calculation. */
  protected readonly hostRef = inject(ElementRef);

  protected readonly announcer = inject(NgxA11yAnnouncer);

  /**
   * Override to provide a custom anchor for overlay positioning.
   *
   * - Return an `HTMLElement` for live rect computation + scroll-aware space.
   * - Return a `DOMRect` for a virtual/custom anchor area (viewport-only space).
   * - Return `null` (default) to use the host element.
   *
   * @example
   * // Anchor to a specific inner element instead of the whole host:
   * protected override overlayAnchor(): OverlayAnchor | null {
   *   return this.inputRef()?.nativeElement ?? null;
   * }
   *
   * @example
   * // Anchor to a custom area:
   * protected override overlayAnchor(): OverlayAnchor | null {
   *   return new DOMRect(x, y, width, height);
   * }
   */
  protected overlayAnchor(): OverlayAnchor | null {
    return null;
  }

  private get anchor(): OverlayAnchor {
    return this.overlayAnchor() ?? this.hostRef.nativeElement;
  }

  /**
   * Toggles the overlay state.
   * Pass the triggering UIEvent (mouse, touch, keyboard) so the popup can
   * anchor to the correct corner and resolve the scroll ancestor via event.target.
   */
  protected toggleOverlay(event?: Event): void {
    if (this.isDisabled()) return;
    this.open() ? this.closeOverlay() : this.openOverlay(event);
  }

  /** Minimum space required below or above to anchor the overlay. Default 128px. */
  protected readonly minSpace: number = 128;

  /** Minimum horizontal space required for the overlay. Default 250px. */
  protected readonly minWidth: number = 250;

  /** Preferred vertical position. Defaults to 'below'. */
  protected readonly preferredPosition: "above" | "below" = "below";


  /** Opens the overlay and recalculates its position. */
  protected openOverlay(event?: Event): void {
    if (this.isDisabled() || this.open()) return;
    this.onBeforeOpen();
    this.open.set(true);

    // Extract domRef from event.target for scroll-ancestor traversal (all event types).
    const domRef = event?.target instanceof HTMLElement ? event.target : undefined;
    // Extract horizontal coordinate for corner selection:
    // mouse → clientX; touch → first touch point; keyboard → undefined (falls back to center).
    let clickX: number | undefined;
    if (event instanceof MouseEvent) {
      clickX = event.clientX;
    } else if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
      clickX = event.touches[0]?.clientX;
    }

    const result = computeOverlayPosition(this.anchor, {
      minSpace: this.minSpace,
      minWidth: this.minWidth,
      preferredPosition: this.preferredPosition,
      ...(clickX !== undefined && { clickX }),
      ...(domRef && { domRef }),
    });


    this.position.set(result.position);
    this.alignment.set(result.alignment);
    this.coords.set(result.coords);

    // Freeze max-height at open time so the panel keeps its size during scroll.
    const vh = document.documentElement.clientHeight;
    const { coords, position } = result;
    let mh: number;
    if (position === "below" && coords.top !== undefined) {
      mh = vh - coords.top - 12;
    } else if (position === "above" && coords.bottom !== undefined) {
      mh = vh - coords.bottom - 12;
    } else {
      mh = Math.round(vh * 0.7); // centered modal: 70vh
    }
    this.maxHeight.set(Math.max(0, mh));

    this.announcer.announce("Popup opened");

    // Non-modal overlays follow the container during scroll,
    // keeping the same corner chosen at open time.
    if (result.position !== "overlay") {
      window.addEventListener("scroll", this.handleScroll, { capture: true, passive: true });
    }
    window.addEventListener("resize", this.handleResize);
  }

  private scrollFrameId: number | null = null;

  protected readonly handleScroll = () => {
    if (!this.open()) return;
    if (this.scrollFrameId !== null) cancelAnimationFrame(this.scrollFrameId);
    this.scrollFrameId = requestAnimationFrame(() => {
      this.scrollFrameId = null;
      // Update position only — maxHeight is frozen at open time and never changes.
      this.coords.set(
        computeCoordsForAnchor(this.anchor, this.position(), this.alignment()),
      );
    });
  };

  protected readonly handleResize = () => {
    if (this.open()) this.closeOverlay();
  };

  /** Recalculates the position of the currently open overlay. */
  protected updatePosition(): void {
    if (!this.open()) return;

    const result = computeOverlayPosition(this.anchor, {
      minSpace: this.minSpace,
      minWidth: this.minWidth,
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
    if (this.scrollFrameId !== null) {
      cancelAnimationFrame(this.scrollFrameId);
      this.scrollFrameId = null;
    }
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

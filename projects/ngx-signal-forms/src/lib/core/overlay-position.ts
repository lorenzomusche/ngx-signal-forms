/**
 * Lightweight overlay positioning — inspired by CDK Overlay but stripped
 * to the essentials needed by ngx-signal-forms dropdowns.
 *
 * Corner-selection strategy (two-pass):
 *   Pass 1 — viewport-visible space only:
 *     1. Determine the "closest" horizontal corner from the click origin
 *        (clickX). If clickX is in the right half of the trigger → right-align;
 *        otherwise left-align. Falls back to trigger center when no clickX.
 *     2. Try preferred Y (below by default) before the other.
 *     3. For each Y slot, try closest corner first, then the opposite.
 *   Pass 2 — scroll-aware space (counts scroll room as usable):
 *     Same priority order as pass 1. Only available when anchor is an HTMLElement
 *     (DOMRect anchors have no DOM ancestor to traverse).
 *   Fallback — centered modal if no corner fits in either pass.
 *
 * NOTE: all viewport width/height measurements use clientWidth/clientHeight
 * (excludes scrollbar) rather than innerWidth/innerHeight (includes scrollbar)
 * to avoid a systematic ~16px right-offset on pages with a visible scrollbar.
 *
 * Once a corner is chosen it is locked; scroll updates use
 * `computeCoordsForAnchor` to follow the trigger without re-running this
 * selection algorithm.
 */

/** Resolved position strategy for the popup. */
export type OverlayPosition = "below" | "above" | "overlay";
/** Horizontal alignment relative to the trigger. */
export type OverlayAlignment = "left" | "right";

/**
 * Anchor for overlay positioning: either a live DOM element (rect is computed
 * at call time via getBoundingClientRect) or a pre-computed DOMRect (useful for
 * virtual / custom anchor areas not tied to a specific element).
 *
 * When a DOMRect is used, scroll-aware space is not available (no DOM ancestor
 * to traverse); the algorithm uses viewport-only space in both passes.
 */
export type OverlayAnchor = HTMLElement | DOMRect;

/** Result of an overlay position calculation. */
export interface ComputedPosition {
  readonly position: OverlayPosition;
  readonly alignment: OverlayAlignment;
  /** Viewport coordinates for fixed positioning. */
  readonly coords: {
    readonly top?: number | undefined;
    readonly bottom?: number | undefined;
    readonly left?: number | undefined;
    readonly right?: number | undefined;
    readonly width: number;
  };
}

/** Configuration for overlay positioning. */
export interface OverlayPositionConfig {
  /** Minimum viewport space (px) required to place the popup below or above. */
  readonly minSpace?: number;
  /** Minimum horizontal viewport space (px) required for the popup. */
  readonly minWidth?: number;
  /** Preferred vertical position. Defaults to 'below'. */
  readonly preferredPosition?: "above" | "below";
  /**
   * Horizontal coordinate (clientX) of the event that triggered the overlay.
   * Used to determine which horizontal corner of the trigger to anchor to:
   * if clickX falls in the right half of the trigger → right-align (popup grows
   * leftward), otherwise left-align. When omitted, falls back to trigger center.
   */
  readonly clickX?: number;
  /**
   * DOM element used as a reference for scroll-ancestor traversal in pass 2.
   * Required when the anchor is a DOMRect (which has no DOM position); in that
   * case pass the event.target so the nearest scrollable container can be found.
   * Ignored when the anchor is already an HTMLElement.
   */
  readonly domRef?: HTMLElement;
}

const DEFAULT_MIN_SPACE = 128;
const DEFAULT_MIN_WIDTH = 250;

/** Gap in pixels between the trigger edge and the popup. */
const POPUP_GAP = 4;

/** Extract a DOMRect from an OverlayAnchor. */
function getRect(anchor: OverlayAnchor): DOMRect {
  return anchor instanceof HTMLElement ? anchor.getBoundingClientRect() : anchor;
}

/**
 * Find the nearest scrollable ancestor of an element.
 * Returns the document root if no other scrollable ancestor is found.
 */
function findScrollableAncestor(el: HTMLElement): HTMLElement {
  let parent = el.parentElement;
  while (parent && parent !== document.documentElement) {
    const { overflow, overflowY } = window.getComputedStyle(parent);
    if (/auto|scroll/.test(overflow + overflowY)) return parent;
    parent = parent.parentElement;
  }
  return document.documentElement;
}

/**
 * Compute the total available space above and below the anchor,
 * including any remaining scroll space in the nearest scrollable ancestor.
 *
 * When the anchor is a DOMRect, `domRef` is used for ancestor traversal.
 * If neither is an HTMLElement, falls back to viewport-only space.
 */
function scrollAwareSpace(
  anchor: OverlayAnchor,
  domRef?: HTMLElement,
): { above: number; below: number } {
  const rect = getRect(anchor);
  const vh = document.documentElement.clientHeight;

  // Resolve the element to use for ancestor traversal:
  // prefer the anchor itself if it's an HTMLElement, otherwise fall back to domRef.
  const el = anchor instanceof HTMLElement ? anchor : domRef;

  if (!el) {
    // No DOM reference available: viewport-only space.
    return {
      below: Math.max(0, vh - rect.bottom),
      above: Math.max(0, rect.top),
    };
  }

  const ancestor = findScrollableAncestor(el);

  if (ancestor === document.documentElement) {
    const scrollRemBelow = ancestor.scrollHeight - window.scrollY - vh;
    const scrollRemAbove = window.scrollY;
    return {
      below: Math.max(0, vh - rect.bottom) + Math.max(0, scrollRemBelow),
      above: Math.max(0, rect.top) + Math.max(0, scrollRemAbove),
    };
  }

  // Nested scrollable container
  const ancestorRect = ancestor.getBoundingClientRect();
  const scrollRemBelow = ancestor.scrollHeight - ancestor.scrollTop - ancestor.clientHeight;
  const scrollRemAbove = ancestor.scrollTop;
  return {
    below: Math.max(0, ancestorRect.bottom - rect.bottom) + Math.max(0, scrollRemBelow),
    above: Math.max(0, rect.top - ancestorRect.top) + Math.max(0, scrollRemAbove),
  };
}

/**
 * Recompute only the viewport coordinates for an already-chosen corner,
 * without re-running the corner-selection algorithm.
 *
 * Used during scroll to keep the overlay solidary with its anchor corner
 * without switching corners.
 */
export function computeCoordsForAnchor(
  anchor: OverlayAnchor,
  position: OverlayPosition,
  alignment: OverlayAlignment,
): ComputedPosition["coords"] {
  const rect = getRect(anchor);
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  return {
    width: rect.width,
    top: position === "below" ? rect.bottom + POPUP_GAP : undefined,
    bottom: position === "above" ? vh - rect.top + POPUP_GAP : undefined,
    left: alignment === "left" ? rect.left : undefined,
    right: alignment === "right" ? vw - rect.right : undefined,
  };
}

/**
 * Compute the best overlay position for a popup relative to an anchor.
 *
 * @param anchor  An HTMLElement (live rect + scroll-aware space) or a DOMRect
 *                (static rect, viewport-only space). Use DOMRect for virtual
 *                anchor areas not tied to a specific DOM element.
 * @param config  Optional configuration overrides.
 * @returns       The computed `ComputedPosition`.
 */
export function computeOverlayPosition(
  anchor: OverlayAnchor,
  config?: OverlayPositionConfig,
): ComputedPosition {
  const minSpace = config?.minSpace ?? DEFAULT_MIN_SPACE;
  const minWidth = config?.minWidth ?? DEFAULT_MIN_WIDTH;
  const prefPos = config?.preferredPosition ?? "below";

  const rect = getRect(anchor);
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // ── Closest horizontal corner ────────────────────────────────────────────
  const referenceX = config?.clickX ?? rect.left + rect.width / 2;
  const triggerMidX = rect.left + rect.width / 2;
  const closestAlign: OverlayAlignment = referenceX >= triggerMidX ? "right" : "left";
  const otherAlign: OverlayAlignment = closestAlign === "left" ? "right" : "left";

  const positions: Array<"below" | "above"> =
    prefPos === "below" ? ["below", "above"] : ["above", "below"];

  const fitsLeft = rect.left + minWidth <= vw - 12;
  const fitsRight = rect.right >= minWidth + 12;

  function tryCorners(spaceBelow: number, spaceAbove: number): ComputedPosition | null {
    for (const pos of positions) {
      const fitsVertical = pos === "below" ? spaceBelow >= minSpace : spaceAbove >= minSpace;
      if (!fitsVertical) continue;

      for (const align of [closestAlign, otherAlign]) {
        const fitsHorizontal = align === "left" ? fitsLeft : fitsRight;
        if (fitsHorizontal) {
          return {
            position: pos,
            alignment: align,
            coords: computeCoordsForAnchor(anchor, pos, align),
          };
        }
      }
    }
    return null;
  }

  // ── Pass 1: viewport-visible space only ──────────────────────────────────
  const viewportBelow = Math.max(0, vh - rect.bottom);
  const viewportAbove = Math.max(0, rect.top);
  const pass1 = tryCorners(viewportBelow, viewportAbove);
  if (pass1) return pass1;

  // ── Pass 2: scroll-aware space ───────────────────────────────────────────
  const scrollSpace = scrollAwareSpace(anchor, config?.domRef);
  const pass2 = tryCorners(scrollSpace.below, scrollSpace.above);
  if (pass2) return pass2;

  // ── Fallback: centered modal ─────────────────────────────────────────────
  return {
    position: "overlay",
    alignment: "left",
    coords: { width: rect.width },
  };
}

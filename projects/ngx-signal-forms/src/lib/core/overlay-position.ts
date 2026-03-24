/**
 * Lightweight overlay positioning — inspired by CDK Overlay but stripped
 * to the essentials needed by ngx-signal-forms dropdowns.
 *
 * Computes where to place a popup relative to a trigger element,
 * choosing between "below", "above", or "centered overlay" based on
 * available viewport space.
 */

/** Resolved position strategy for the popup. */
export type OverlayPosition = "below" | "above" | "overlay";
/** Horizontal alignment relative to the trigger. */
export type OverlayAlignment = "left" | "right";

/** Result of an overlay position calculation. */
export interface ComputedPosition {
  readonly position: OverlayPosition;
  readonly alignment: OverlayAlignment;
}

/** Configuration for overlay positioning. */
export interface OverlayPositionConfig {
  /** Minimum viewport space (px) required to place the popup below or above. */
  readonly minSpace?: number;
  /** Minimum horizontal viewport space (px) required for the popup. */
  readonly minWidth?: number;
  /** Preferred horizontal alignment. */
  readonly preferredAlignment?: OverlayAlignment;
}

const DEFAULT_MIN_SPACE = 128;
const DEFAULT_MIN_WIDTH = 250;

/**
 * Compute the best overlay position for a popup relative to a trigger.
 *
 * Strategy:
 *   1. Evaluate Vertical Slot (Below then Above).
 *   2. For each slot, try Horizontal alignment (Prefer requested alignment, then fallback to other).
 *   3. If a slot fits both vertically and horizontally → Return it.
 *   4. If no anchored slot fits → `'overlay'` (centered).
 *
 * @param triggerElement The element the popup is anchored to.
 * @param config         Optional configuration overrides.
 * @returns              The computed `ComputedPosition`.
 */
export function computeOverlayPosition(
  triggerElement: HTMLElement,
  config?: OverlayPositionConfig,
): ComputedPosition {
  const minSpace = config?.minSpace ?? DEFAULT_MIN_SPACE;
  const minWidth = config?.minWidth ?? DEFAULT_MIN_WIDTH;
  const pref = config?.preferredAlignment ?? "left";
  const rect = triggerElement.getBoundingClientRect();

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const fitsBelow = spaceBelow >= minSpace;
  const fitsAbove = spaceAbove >= minSpace;

  const fitsLeft = rect.left + minWidth <= window.innerWidth - 12;
  const fitsRight = rect.right >= minWidth + 12;

  // Attempt each vertical slot
  for (const pos of ["below", "above"] as const) {
    const fitsVertical = pos === "below" ? fitsBelow : fitsAbove;
    if (fitsVertical) {
      if (pref === "left") {
        if (fitsLeft) return { position: pos, alignment: "left" };
        if (fitsRight) return { position: pos, alignment: "right" };
      } else {
        if (fitsRight) return { position: pos, alignment: "right" };
        if (fitsLeft) return { position: pos, alignment: "left" };
      }
    }
  }

  // Fallback to Centered Overlay
  return { position: "overlay", alignment: "left" };
}

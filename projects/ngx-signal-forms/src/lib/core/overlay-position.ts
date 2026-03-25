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
  /** Viewport coordinates for fixed positioning fallback. */
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
  /** Preferred horizontal alignment. */
  readonly preferredAlignment?: OverlayAlignment;
  /** Preferred vertical position. Defaults to 'below'. */
  readonly preferredPosition?: "above" | "below";
}

const DEFAULT_MIN_SPACE = 128;
const DEFAULT_MIN_WIDTH = 250;

/**
 * Compute the best overlay position for a popup relative to a trigger.
 *
 * Strategy:
 *   1. Evaluate Vertical Slots (User preference, then fallback to other).
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
  const prefAlign = config?.preferredAlignment ?? "left";
  const prefPos = config?.preferredPosition ?? "below";

  const rect = triggerElement.getBoundingClientRect();

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const fitsBelow = spaceBelow >= minSpace;
  const fitsAbove = spaceAbove >= minSpace;

  const fitsLeft = rect.left + minWidth <= window.innerWidth - 12;
  const fitsRight = rect.right >= minWidth + 12;

  // Horizontal preference order
  const alignments: OverlayAlignment[] =
    prefAlign === "left" ? ["left", "right"] : ["right", "left"];

  // Vertical preference order
  const positions: OverlayPosition[] =
    prefPos === "below" ? ["below", "above"] : ["above", "below"];

  // Attempt each vertical slot in order of preference
  for (const pos of positions) {
    const fitsVertical = pos === "below" ? fitsBelow : fitsAbove;
    if (fitsVertical) {
      for (const align of alignments) {
        const fitsHorizontal = align === "left" ? fitsLeft : fitsRight;
        if (fitsHorizontal) {
          return {
            position: pos,
            alignment: align,
            coords: {
              width: rect.width,
              top: pos === "below" ? rect.bottom : undefined,
              bottom: pos === "above" ? window.innerHeight - rect.top : undefined,
              left: align === "left" ? rect.left : undefined,
              right: align === "right" ? window.innerWidth - rect.right : undefined,
            },
          };
        }
      }
    }
  }

  // Fallback to Centered Overlay
  return {
    position: "overlay",
    alignment: "left",
    coords: {
      width: rect.width,
    },
  };
}


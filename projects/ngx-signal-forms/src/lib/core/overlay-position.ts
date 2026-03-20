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

/** Configuration for overlay positioning. */
export interface OverlayPositionConfig {
  /** Minimum viewport space (px) required to place the popup below or above. */
  readonly minSpace?: number;
}

const DEFAULT_MIN_SPACE = 128;

/**
 * Compute the best overlay position for a popup relative to a trigger.
 *
 * Strategy:
 *   1. If enough space below → `'below'`
 *   2. Else if enough space above → `'above'`
 *   3. Else → `'overlay'` (centered in viewport)
 *
 * @param triggerElement The element the popup is anchored to.
 * @param config         Optional configuration overrides.
 * @returns              The computed `OverlayPosition`.
 */
export function computeOverlayPosition(
  triggerElement: HTMLElement,
  config?: OverlayPositionConfig,
): OverlayPosition {
  const minSpace = config?.minSpace ?? DEFAULT_MIN_SPACE;
  const rect = triggerElement.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  if (spaceBelow >= minSpace) return "below";
  if (spaceAbove >= minSpace) return "above";
  return "overlay";
}

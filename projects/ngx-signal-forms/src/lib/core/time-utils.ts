/**
 * Pure utility functions for 12-hour time string manipulation.
 *
 * Time values are represented as `"HH:MM AM/PM"` strings.
 * All helpers are side-effect-free and return new values.
 */

export interface ParsedTime {
  readonly hour: number;   // 1-12
  readonly minute: number; // 0-59
  readonly period: 'AM' | 'PM';
}

const TIME_RE = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;

// ── Parsing / Formatting ─────────────────────────────────────────────────────

/** Parse a `"HH:MM AM/PM"` string. Returns `null` on invalid input. */
export function parseTime(value: string | null | undefined): ParsedTime | null {
  if (!value) return null;
  const m = TIME_RE.exec(value);
  if (!m) return null;
  const hour   = Number(m[1]);
  const minute = Number(m[2]);
  const period = m[3]!.toUpperCase() as 'AM' | 'PM';
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  return { hour, minute, period };
}

/** Format a `ParsedTime` to a canonical `"HH:MM AM"` string. */
export function formatTime(t: ParsedTime): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')} ${t.period}`;
}

/** Build a formatted time string from parts, with safe defaults. */
export function buildTimeString(
  hour: number | string,
  minute: number | string,
  period: 'AM' | 'PM',
): string {
  const h = typeof hour   === 'number' ? hour   : parseInt(hour,   10) || 12;
  const m = typeof minute === 'number' ? minute : parseInt(minute, 10) || 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// ── Angle / Selection helpers ─────────────────────────────────────────────────

/** Convert an hour (1–12) to a dial angle in degrees (0 = 12 o'clock). */
export function hourToAngle(hour: number): number {
  return (hour % 12) * 30;
}

/** Convert a minute (0–59) to a dial angle in degrees (0 = 12 o'clock). */
export function minuteToAngle(minute: number): number {
  return minute * 6;
}

/**
 * Snap an arbitrary angle to the nearest hour position.
 * Returns hours 1–12.
 */
export function angleToHour(angle: number): number {
  let h = Math.round(angle / 30);
  if (h === 0 || h === 12) return 12;
  if (h < 0) h += 12;
  return h;
}

/**
 * Snap an arbitrary angle to the nearest 5-minute step.
 * Returns minutes 0–55.
 */
export function angleToMinute(angle: number): number {
  let m = Math.round(angle / 6);
  if (m < 0) m += 60;
  if (m >= 60) m = 0;
  return m;
}

/**
 * Calculate the angle (0–360°, 0 = 12 o'clock, clockwise) from the center
 * of an element to a pointer event's coordinates.
 */
export function pointerAngle(
  rect: DOMRect,
  clientX: number,
  clientY: number,
): number {
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  let theta = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  theta += 90;          // shift: 3 o'clock → 12 o'clock is 0
  if (theta < 0) theta += 360;
  return theta;
}

/**
 * Extract touch or mouse coordinates from an event.
 * Returns `null` if the event has no touches (e.g. touchend with 0 touches).
 */
export function getPointerCoords(
  event: MouseEvent | TouchEvent,
): { clientX: number; clientY: number } | null {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return null;
    return { clientX: touch.clientX, clientY: touch.clientY };
  }
  const me = event as MouseEvent;
  return { clientX: me.clientX, clientY: me.clientY };
}

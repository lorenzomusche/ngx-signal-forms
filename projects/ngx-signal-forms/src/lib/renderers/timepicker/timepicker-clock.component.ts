import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NgxTimepickerHeaderComponent } from "./timepicker-header.component";
import {
  angleToHour,
  angleToMinute,
  buildTimeString,
  formatTime,
  getPointerCoords,
  hourToAngle,
  minuteToAngle,
  parseTime,
  pointerAngle,
} from "../../core/time-utils";

/**
 * Dumb UI component for the Material 3 Timepicker Clock/Input.
 * Emits `timePicked` on every change, but does NOT commit until the parent
 * calls `confirmClicked`.
 */
@Component({
  selector: "ngx-timepicker-clock",
  standalone: true,
  imports: [NgxTimepickerHeaderComponent],
  templateUrl: "./timepicker-clock.component.html",
  styleUrls: ["./timepicker-renderer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:mousemove)": "onDragMove($event)",
    "(document:touchmove)": "onDragMove($event)",
    "(document:mouseup)":   "onDragEnd()",
    "(document:touchend)":  "onDragEnd()",
  },
})
export class NgxTimepickerClockComponent {
  protected readonly Math = Math;
  readonly value        = input<string | null>(null);
  readonly disabled     = input<boolean>(false);
  readonly timePicked   = output<string>();
  readonly cancelClicked  = output<void>();
  readonly confirmClicked = output<void>();

  protected readonly viewMode    = signal<"input" | "dial">("input");
  protected readonly focusedField = signal<"hour" | "minute">("hour");
  protected readonly isDragging   = signal(false);
  protected readonly dragAngle    = signal<number | null>(null);

  /** Tracks the field that was active when drag *started*, so
   *  onDragMove always uses the same field until the drag ends. */
  private dragField: "hour" | "minute" = "hour";

  private readonly dialFaceRef = viewChild<ElementRef<HTMLElement>>("dialFace");

  // ── Parsing helpers ────────────────────────────────────────────────────────

  protected readonly parsed = computed(() => parseTime(this.value()));

  protected readonly numericHour = computed(() => {
    const p = this.parsed();
    return p ? p.hour : 12;
  });

  protected readonly numericMinute = computed(() => {
    const p = this.parsed();
    return p ? p.minute : 0;
  });

  protected readonly hourDisplay = computed(() =>
    String(this.numericHour()).padStart(2, "0"),
  );

  protected readonly minuteDisplay = computed(() =>
    String(this.numericMinute()).padStart(2, "0"),
  );

  protected readonly periodDisplay = computed(() => {
    const p = this.parsed();
    return p ? p.period : "AM";
  });

  protected readonly timeString = computed(() => {
    const p = this.parsed();
    return p ? formatTime(p) : "00:00 AM";
  });

  // ── Hand rotation ──────────────────────────────────────────────────────────

  protected readonly handRotation = computed(() => {
    if (this.isDragging() && this.dragAngle() !== null) {
      return this.dragAngle()!;
    }
    const p = this.parsed();
    if (!p) return 0;
    return this.focusedField() === "minute"
      ? minuteToAngle(p.minute)
      : hourToAngle(p.hour);
  });

  // ── Input variant handlers ─────────────────────────────────────────────────

  protected onHourInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value;
    
    // Treat empty as 0
    const h = raw === "" ? 0 : parseInt(raw, 10);
    
    // Valid hours are 1-12 or 0 (which we'll treat as a "reset" state that buildTimeString/formatTime handles)
    if (isNaN(h) || h < 0 || h > 12) {
      target.value = this.hourDisplay();
      return;
    }

    this.focusedField.set("hour");
    const p = this.parsed();
    this.timePicked.emit(buildTimeString(h, p?.minute ?? 0, p?.period ?? "AM"));
  }

  protected onMinuteInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value;

    // Treat empty as 0
    const m = raw === "" ? 0 : parseInt(raw, 10);

    if (isNaN(m) || m < 0 || m > 59) {
      target.value = this.minuteDisplay();
      return;
    }

    this.focusedField.set("minute");
    const p = this.parsed();
    this.timePicked.emit(buildTimeString(p?.hour ?? 12, m, p?.period ?? "AM"));
  }

  protected togglePeriod(period: "AM" | "PM"): void {
    if (this.disabled()) return;
    const p = this.parsed();
    this.timePicked.emit(buildTimeString(p?.hour ?? 12, p?.minute ?? 0, period));
  }

  protected setViewMode(mode: "input" | "dial"): void {
    this.viewMode.set(mode);
  }

  // ── Dial click (tap without drag) ──────────────────────────────────────────

  protected onDialNumberClick(value: number): void {
    if (this.disabled()) return;
    const p = this.parsed();
    if (this.focusedField() === "hour") {
      this.timePicked.emit(buildTimeString(value, p?.minute ?? 0, p?.period ?? "AM"));
      // Auto-switch to minutes after tapping an hour
      setTimeout(() => this.focusedField.set("minute"), 200);
    } else {
      this.timePicked.emit(buildTimeString(p?.hour ?? 12, value, p?.period ?? "AM"));
    }
  }

  // ── Drag interaction ───────────────────────────────────────────────────────

  protected onDragStart(event: MouseEvent | TouchEvent): void {
    if (this.disabled() || this.viewMode() !== "dial") return;
    if (event.cancelable) event.preventDefault();
    // Snapshot the current field so the whole drag uses a consistent mode
    this.dragField = this.focusedField();
    this.isDragging.set(true);
    this.updateAngle(event);
  }

  protected onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging() || this.viewMode() !== "dial") return;
    if (event.cancelable) event.preventDefault();
    this.updateAngle(event);

    const angle = this.dragAngle();
    if (angle === null) return;

    const p = this.parsed();
    let newTime: string;

    if (this.dragField === "minute") {
      const min = angleToMinute(angle);
      newTime = buildTimeString(p?.hour ?? 12, min, p?.period ?? "AM");
    } else {
      const hour = angleToHour(angle);
      newTime = buildTimeString(hour, p?.minute ?? 0, p?.period ?? "AM");
    }

    this.timePicked.emit(newTime);
  }

  protected onDragEnd(): void {
    if (!this.isDragging()) return;

    // Snap to nearest value and emit final position
    const angle = this.dragAngle();
    if (angle !== null) {
      const p = this.parsed();
      let finalTime: string;
      if (this.dragField === "minute") {
        finalTime = buildTimeString(p?.hour ?? 12, angleToMinute(angle), p?.period ?? "AM");
      } else {
        finalTime = buildTimeString(angleToHour(angle), p?.minute ?? 0, p?.period ?? "AM");
        // Auto-switch to minutes after selecting an hour via drag
        setTimeout(() => this.focusedField.set("minute"), 300);
      }
      this.timePicked.emit(finalTime);
    }

    this.isDragging.set(false);
    this.dragAngle.set(null);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private updateAngle(event: MouseEvent | TouchEvent): void {
    const el = this.dialFaceRef()?.nativeElement;
    if (!el) return;
    const coords = getPointerCoords(event);
    if (!coords) return;
    this.dragAngle.set(pointerAngle(el.getBoundingClientRect(), coords.clientX, coords.clientY));
  }
}

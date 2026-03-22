import { Directive, ElementRef, input, OnInit, Renderer2 } from "@angular/core";

/**
 * @description
 * Directive that adds custom design-system spin buttons to a number input.
 * Usage: <input type="number" [ngxNumberSpinButtons]="true" />
 *
 * - No mutation of input args
 * - No any, no !, no as, no ViewChild
 * - All public properties readonly
 * - No side effects in constructor
 * - No effect() or signals (not needed)
 * - ARIA/keyboard accessible
 */
@Directive({
  selector: "[ngxNumberSpinButtons]",
  standalone: true,
})
export class NgxNumberSpinButtonsDirective implements OnInit {
  /** Enables custom spin buttons if true. */
  readonly ngxNumberSpinButtons = input.required<boolean | string>();

  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const enabled = this.ngxNumberSpinButtons();
    if (enabled === false || enabled === "false") return;
    const input = this.el.nativeElement;
    const wrapper = this.renderer.createElement("span");
    this.renderer.setStyle(wrapper, "position", "relative");
    this.renderer.setStyle(input, "paddingRight", "2.5em");
    this.renderer.insertBefore(input.parentNode, wrapper, input);
    this.renderer.appendChild(wrapper, input);

    // Up button
    const upBtn = this.renderer.createElement("button");
    this.renderer.addClass(upBtn, "ngx-spin-btn");
    this.renderer.addClass(upBtn, "ngx-spin-btn-up");
    upBtn.type = "button";
    upBtn.tabIndex = -1;
    upBtn.setAttribute("aria-label", "Incrementa");
    upBtn.innerHTML = `<svg width='1em' height='1em' viewBox='0 0 16 16'><polyline points='4,10 8,6 12,10' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round'/></svg>`;
    this.renderer.setStyle(upBtn, "position", "absolute");
    this.renderer.setStyle(upBtn, "right", "0.25em");
    this.renderer.setStyle(upBtn, "top", "0.15em");
    this.renderer.setStyle(upBtn, "background", "none");
    this.renderer.setStyle(upBtn, "border", "none");
    this.renderer.setStyle(upBtn, "padding", "0.15em");
    this.renderer.setStyle(upBtn, "cursor", "pointer");
    this.renderer.setStyle(upBtn, "z-index", "2");
    this.renderer.appendChild(wrapper, upBtn);

    // Down button
    const downBtn = this.renderer.createElement("button");
    this.renderer.addClass(downBtn, "ngx-spin-btn");
    this.renderer.addClass(downBtn, "ngx-spin-btn-down");
    downBtn.type = "button";
    downBtn.tabIndex = -1;
    downBtn.setAttribute("aria-label", "Decrementa");
    downBtn.innerHTML = `<svg width='1em' height='1em' viewBox='0 0 16 16'><polyline points='4,6 8,10 12,6' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round'/></svg>`;
    this.renderer.setStyle(downBtn, "position", "absolute");
    this.renderer.setStyle(downBtn, "right", "0.25em");
    this.renderer.setStyle(downBtn, "bottom", "0.15em");
    this.renderer.setStyle(downBtn, "background", "none");
    this.renderer.setStyle(downBtn, "border", "none");
    this.renderer.setStyle(downBtn, "padding", "0.15em");
    this.renderer.setStyle(downBtn, "cursor", "pointer");
    this.renderer.setStyle(downBtn, "z-index", "2");
    this.renderer.appendChild(wrapper, downBtn);

    upBtn.addEventListener("click", () => this.step(input, +1));
    downBtn.addEventListener("click", () => this.step(input, -1));
  }

  private step(input: HTMLInputElement, dir: 1 | -1): void {
    const step = Number(input.step) || 1;
    const min = input.min !== "" ? Number(input.min) : -Infinity;
    const max = input.max !== "" ? Number(input.max) : +Infinity;
    let value = input.value === "" ? 0 : Number(input.value);
    value = Math.max(min, Math.min(max, value + dir * step));
    input.value = String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

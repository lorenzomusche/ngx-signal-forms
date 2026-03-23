import { Injectable, OnDestroy } from "@angular/core";

/**
 * A simple, zero-dependency live announcer for sending polite
 * messages to screen readers when UI state changes (e.g. popups open/close).
 */
@Injectable({ providedIn: "root" })
export class NgxA11yAnnouncer implements OnDestroy {
  private ariaLiveElement: HTMLElement | null = null;

  constructor() {
    if (typeof document !== "undefined") {
      this.ariaLiveElement = document.createElement("div");
      // Visually hidden
      this.ariaLiveElement.setAttribute(
        "style",
        "position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;",
      );
      this.ariaLiveElement.setAttribute("aria-live", "polite");
      this.ariaLiveElement.setAttribute("aria-atomic", "true");
      document.body.appendChild(this.ariaLiveElement);
    }
  }

  /**
   * Announces a message to screen readers.
   */
  announce(message: string): void {
    if (!this.ariaLiveElement) return;
    
    // Clear content first to ensure the screen reader detects the change
    this.ariaLiveElement.textContent = "";
    setTimeout(() => {
      if (this.ariaLiveElement) {
        this.ariaLiveElement.textContent = message;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.ariaLiveElement && this.ariaLiveElement.parentNode) {
      this.ariaLiveElement.parentNode.removeChild(this.ariaLiveElement);
    }
    this.ariaLiveElement = null;
  }
}

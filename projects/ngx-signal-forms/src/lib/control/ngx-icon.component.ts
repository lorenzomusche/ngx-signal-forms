import { ChangeDetectionStrategy, Component, input, computed, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NGX_ICONS, NgxIconName } from "../core/icons";

/**
 * Lightweight component to render SVGs from the shared icon library.
 */
@Component({
  selector: "ngx-icon",
  standalone: true,
  template: `
    @if (iconData(); as data) {
      <svg
        [attr.viewBox]="data.viewBox"
        fill="none"
        stroke="currentColor"
        stroke-width="0"
        xmlns="http://www.w3.org/2000/svg"
        [innerHTML]="safeContent()"
        aria-hidden="true"
      ></svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 1;
    }
    svg {
      width: 1em;
      height: 1em;
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Name of the icon to render from the NGX_ICONS registry. */
  readonly name = input.required<NgxIconName>();

  protected readonly iconData = computed(() => NGX_ICONS[this.name()]);

  protected readonly safeContent = computed((): SafeHtml => 
    this.sanitizer.bypassSecurityTrustHtml(this.iconData().content)
  );
}

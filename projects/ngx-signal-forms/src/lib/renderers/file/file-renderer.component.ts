import { ChangeDetectionStrategy, Component, computed, input, viewChild, ElementRef, signal, output } from "@angular/core";
import { NgxBaseControl } from "../../control/control.directive";
import { NgxControlLabelComponent } from "../../control/ngx-control-label.component";
import { NgxErrorListComponent } from "../../control/error-list.component";

/**
 * File Upload renderer component.
 */
@Component({
  selector: "ngx-control-file",
  standalone: true,
  imports: [NgxControlLabelComponent, NgxErrorListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ngx-floating-label]": "isFloatingLabel()",
    class: "ngx-renderer ngx-renderer--file",
    "[class.ngx-inline-errors]": "inlineErrors",
  },
  template: `
    <ngx-control-label
      [label]="label()"
      [forId]="fieldId"
      [required]="isRequired()"
      [filled]="fileNames().length > 0"
      [showInlineError]="inlineErrors && touched() && hasErrors()"
      [errorText]="inlineErrorText()"
    />

    <div
      class="ngx-file-container"
      [class.ngx-file-container--dragover]="dragOver()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragOver.set(false)"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        class="ngx-file-input"
        [id]="fieldId"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="isDisabled()"
        (change)="onFileChange($event)"
        (blur)="markAsTouched()"
        [attr.aria-invalid]="hasErrors()"
        [attr.aria-describedby]="hasErrors() ? fieldId + '-errors' : null"
        [attr.aria-required]="ariaRequired()"
      />

      <div class="ngx-file-content">
        <button
          type="button"
          class="ngx-file-button"
          (click)="fileInput.click()"
          [disabled]="isDisabled()"
        >
          <svg viewBox="0 0 24 24" class="ngx-file-icon" aria-hidden="true">
            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
          </svg>
          {{ multiple() ? 'Select Files' : 'Select File' }}
        </button>

        <div class="ngx-file-info">
          @if (fileNames().length > 0) {
            <ul class="ngx-file-list">
              @for (name of fileNames(); track name) {
                <li class="ngx-file-item">
                   <span class="ngx-file-name">{{ name }}</span>
                </li>
              }
            </ul>
            <button
              type="button"
              class="ngx-file-clear"
              (click)="clear()"
              [disabled]="isDisabled()"
              aria-label="Clear selection"
            >
              &times;
            </button>
          } @else {
            <span class="ngx-file-placeholder">No file selected</span>
          }
        </div>
      </div>
    </div>

    @if (!inlineErrors && touched() && hasErrors()) {
      <ngx-error-list [fieldId]="fieldId" [errors]="errors()" />
    }
  `,
})
export class NgxFileComponent extends NgxBaseControl<File | File[] | null> {
  readonly accept   = input<string>("");
  readonly multiple = input<boolean>(false);
  readonly fileSelected = output<File | File[] | null>();

  protected readonly fieldId = `ngx-control-file-${NgxBaseControl.nextId()}`;
  protected readonly dragOver = signal(false);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>("fileInput");

  protected readonly fileNames = computed(() => {
    const val = this.value();
    if (!val) return [];
    if (Array.isArray(val)) return val.map(f => f.name);
    return [val.name];
  });

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFiles(input.files);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.isDisabled()) return;
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.isDisabled()) return;
    this.processFiles(event.dataTransfer?.files || null);
  }

  protected clear(): void {
    if (this.isDisabled()) return;
    this.setValue(null);
    this.markAsDirty();
    if (this.fileInput()) {
      this.fileInput()!.nativeElement.value = "";
    }
    this.fileSelected.emit(null);
  }

  private processFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;

    if (this.multiple()) {
      this.setValue(Array.from(files));
    } else {
      this.setValue(files[0]!);
    }
    this.markAsDirty();
    this.markAsTouched();
    this.fileSelected.emit(this.value());
  }
}

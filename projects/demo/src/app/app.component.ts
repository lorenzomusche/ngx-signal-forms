import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  createSignalFormAdapter,
  NgxCheckboxComponent,
  NgxDateComponent,
  NgxFormAdapter,
  NgxFormComponent,
  NgxFormError,
  NgxFormSubmitEvent,
  NgxInlineErrorsDirective,
  NgxMultiselectComponent,
  NgxNumberComponent,
  NgxSelectComponent,
  NgxSelectOption,
  NgxTextareaComponent,
  NgxTextComponent,
  schemaEmail,
  schemaMax,
  schemaMaxLength,
  schemaMin,
  schemaMinLength,
  schemaRequired,
} from "ngx-signal-forms";

interface ContactForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  birthDate: string | null;
  country: string | null;
  bio: string;
  interests: ReadonlyArray<string>;
  acceptTerms: boolean;
}

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgxFormComponent,
    NgxTextComponent,
    NgxNumberComponent,
    NgxSelectComponent,
    NgxCheckboxComponent,
    NgxTextareaComponent,
    NgxDateComponent,
    NgxMultiselectComponent,
    NgxInlineErrorsDirective,
  ],
  template: `
    <div class="demo-card">
      <h1>ngx-signal-forms Demo</h1>
      <p class="subtitle">
        A declarative, type-safe, reactive form system built on Angular Signals.
      </p>

      <ngx-form
        [adapter]="adapter"
        [action]="submitAction"
        (submitted)="onSubmitted($event)"
      >
        <ngx-text
          name="firstName"
          label="First Name"
          placeholder="John"
          [ariaRequired]="true"
          ngxInlineErrors
        />

        <ngx-text
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          [ariaRequired]="true"
          ngxInlineErrors
        />

        <ngx-text
          name="email"
          label="Email"
          placeholder="john.doe&#64;example.com"
          ngxInlineErrors
        />

        <ngx-number
          name="age"
          label="Age"
          placeholder="25"
          [minValue]="0"
          [maxValue]="120"
        />

        <ngx-date name="birthDate" label="Date of Birth" />

        <ngx-select
          name="country"
          label="Country"
          placeholder="Select a country…"
          [options]="countries"
        />

        <ngx-textarea
          name="bio"
          label="Bio"
          placeholder="Tell us about yourself…"
          [rows]="4"
        />

        <ngx-multiselect
          name="interests"
          label="Interests"
          [options]="interestOptions"
        />

        <ngx-checkbox
          name="acceptTerms"
          label="I accept the terms and conditions"
        />

        <button type="submit" [disabled]="!adapter.state.canSubmit()">
          @if (adapter.state.submitting()) {
            Submitting…
          } @else {
            Submit
          }
        </button>
      </ngx-form>

      @if (lastSubmitResult()) {
        <div class="submit-result">
          <strong>Submitted successfully!</strong>
          <pre>{{ lastSubmitResult() }}</pre>
        </div>
      }
    </div>
  `,
})
export class AppComponent {
  // ── Form model (writable signal) ────────────────────────────────────────────

  private readonly model = signal<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    age: null,
    birthDate: null,
    country: null,
    bio: "",
    interests: [],
    acceptTerms: false,
  });

  // ── Adapter ─────────────────────────────────────────────────────────────────

  readonly adapter: NgxFormAdapter<ContactForm> = createSignalFormAdapter({
    model: this.model,
    submitMode: "valid-only",
    schema: (path) => {
      // firstName: required, 2–50 chars
      schemaRequired(path.firstName);
      schemaMinLength(path.firstName, 2, {
        message: "First name must be at least 2 characters",
      });
      schemaMaxLength(path.firstName, 50);

      // lastName: required, 2–50 chars
      schemaRequired(path.lastName);
      schemaMinLength(path.lastName, 2, {
        message: "Last name must be at least 2 characters",
      });
      schemaMaxLength(path.lastName, 50);

      // email: required + email format
      schemaRequired(path.email);
      schemaEmail(path.email);

      // age: between 0 and 120
      schemaMin(path.age, 0);
      schemaMax(path.age, 120);

      // bio: max 500 chars
      schemaMaxLength(path.bio, 500);
    },
  });

  // ── Select / multiselect options ────────────────────────────────────────────

  readonly countries: readonly NgxSelectOption[] = [
    { value: "it", label: "Italy" },
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "es", label: "Spain" },
    { value: "jp", label: "Japan" },
  ];

  readonly interestOptions: readonly NgxSelectOption[] = [
    { value: "angular", label: "Angular" },
    { value: "signals", label: "Signals" },
    { value: "rxjs", label: "RxJS" },
    { value: "typescript", label: "TypeScript" },
    { value: "testing", label: "Testing" },
  ];

  // ── Submit handling ─────────────────────────────────────────────────────────

  readonly lastSubmitResult = signal<string | null>(null);

  readonly submitAction = async (
    value: ContactForm,
  ): Promise<NgxFormError[] | void> => {
    // Simulate async server call
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    this.lastSubmitResult.set(JSON.stringify(value, null, 2));
  };

  onSubmitted(event: NgxFormSubmitEvent<ContactForm>): void {
    console.log("Form submitted:", event);
  }
}

import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  createSignalFormAdapter,
  NgxCheckboxComponent,
  NgxChipsDirective,
  NgxDatePickerComponent,
  NgxDateRange,
  NgxDateRangePickerComponent,
  NgxFileComponent,
  NgxFormAdapter,
  NgxFormComponent,
  NgxFormError,
  ngxFormSerialize,
  NgxFormSubmitEvent,
  NgxInlineErrorsDirective,
  NgxMultiselectComponent,
  NgxNumberComponent,
  NgxOptionDirective,
  NgxRadioGroupComponent,
  ngxSchemaEmail,
  ngxSchemaMax,
  ngxSchemaMaxLength,
  ngxSchemaMin,
  ngxSchemaMinLength,
  ngxSchemaRequired,
  NgxSegmentedButtonComponent,
  NgxSelectComponent,
  NgxSelectOption,
  NgxSliderComponent,
  NgxTextareaComponent,
  NgxTextComponent,
  NgxTimepickerComponent,
  NgxToggleComponent,
} from "ngx-signal-forms";

interface ContactForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  birthDate: string | null;
  appointmentTime: string | null;
  bio: string;
  interests: ReadonlyArray<string>;
  travelDates: NgxDateRange | null;
  newsletter: boolean;
  acceptTerms: boolean;
  preferredContact: "email" | "phone" | "sms";
  satisfaction: number;
  resume: File | null;
  frequency: "daily" | "weekly" | "monthly";
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
    NgxDatePickerComponent,
    NgxDateRangePickerComponent,
    NgxMultiselectComponent,
    NgxInlineErrorsDirective,
    NgxToggleComponent,
    NgxOptionDirective,
    NgxTimepickerComponent,
    NgxRadioGroupComponent,
    NgxSliderComponent,
    NgxFileComponent,
    NgxSegmentedButtonComponent,
    NgxChipsDirective,
  ],
  template: `
    <div class="demo-card">
      <h1>ngx-signal-forms Demo</h1>
      <p class="subtitle">
        A declarative, type-safe, reactive form system built on Angular Signals.
      </p>

      <section style="margin-bottom: 2rem;">
        <ngx-form
          [adapter]="adapter"
          [action]="submitAction"
          (submitted)="onSubmitted($event)"
        >
          <div class="form-row">
            <ngx-control-text
              name="firstName"
              label="First Name"
              placeholder="John"
              [ariaRequired]="true"
              ngxInlineErrors
            />

            <ngx-control-text
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              [ariaRequired]="true"
              ngxInlineErrors
            />
          </div>

          <div class="form-row">
            <ngx-control-text
              name="email"
              label="Email"
              placeholder="john.doe&#64;example.com"
              [ariaRequired]="true"
              ngxInlineErrors
            />

            <ngx-control-number
              name="age"
              label="Age"
              placeholder="25"
              [minValue]="0"
              [maxValue]="120"
            />
          </div>

          <div class="form-row">
            <ngx-control-datepicker name="birthDate" label="Date of Birth" />

            <ngx-control-timepicker
              name="appointmentTime"
              label="Appointment Time"
            />
          </div>

          <ngx-control-daterange
            name="travelDates"
            label="Travel Dates"
            minDate="2026-01-01"
            maxDate="2027-12-31"
          />

          <ngx-control-multiselect
            name="interests"
            label="Interests"
            [options]="interestOptions"
            [searchable]="true"
            mode="multi"
          ></ngx-control-multiselect>

          <ngx-control-select
            name="country"
            label="Country"
            placeholder="Select a country…"
            [options]="countries"
            [searchable]="true"
          >
            <ng-template ngxOption let-opt>
              <span style="margin-right: 0.5rem">{{
                countryFlags[opt.value]
              }}</span>
              {{ opt.label }}
            </ng-template>
          </ngx-control-select>

          <ngx-control-textarea
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself…"
            [rows]="3"
          />

          <div class="form-row">
            <ngx-control-checkbox
              name="acceptTerms"
              label="I accept the terms and conditions"
            />

            <ngx-control-toggle
              name="newsletter"
              label="Subscribe to newsletter"
            />
          </div>

          <ngx-control-radio
            name="preferredContact"
            label="Preferred Contact Method"
            [options]="contactOptions"
            layout="horizontal"
          />

          <ngx-control-slider
            name="satisfaction"
            label="Rate your experience"
            [min]="1"
            [max]="10"
            [step]="1"
          />

          <ngx-control-file
            name="resume"
            label="Upload Resume (PDF only)"
            accept=".pdf"
            (fileSelected)="onFileSelected($event)"
          />

          <ngx-control-segmented
            name="frequency"
            label="Contact Frequency"
            [options]="frequencyOptions"
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
      </section>
    </div>
  `,
})
export class AppComponent {
  // ── Form model (writable signal) ────────────────────────────────────────────

  private readonly model = signal<ContactForm>({
    firstName: "lorenzo",
    lastName: "muscherà",
    email: "lorenzo.muschera@sonounamailinesistente.it",
    age: null,
    birthDate: null,
    country: null,
    appointmentTime: null,
    bio: "",
    interests: ["testing"],
    travelDates: null,
    newsletter: false,
    acceptTerms: false,
    preferredContact: "email",
    satisfaction: 5,
    resume: null,
    frequency: "weekly",
  });

  // ── Adapter ─────────────────────────────────────────────────────────────────

  readonly adapter: NgxFormAdapter<ContactForm> = createSignalFormAdapter({
    model: this.model,
    submitMode: "valid-only",
    schema: (path) => {
      // firstName: required, 2–50 chars
      ngxSchemaRequired(path.firstName);
      ngxSchemaMinLength(path.firstName, 2, {
        message: "First name must be at least 2 characters",
      });
      ngxSchemaMaxLength(path.firstName, 50);

      // lastName: required, 2–50 chars
      ngxSchemaRequired(path.lastName);
      ngxSchemaMinLength(path.lastName, 2, {
        message: "Last name must be at least 2 characters",
      });
      ngxSchemaMaxLength(path.lastName, 50);

      // email: required + email format
      ngxSchemaRequired(path.email);
      ngxSchemaEmail(path.email);

      // age: between 0 and 120
      ngxSchemaMin(path.age, 0);
      ngxSchemaMax(path.age, 120);

      // bio: max 500 chars
      ngxSchemaMaxLength(path.bio, 500);

      // preferredContact: required
      ngxSchemaRequired(path.preferredContact);
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

  readonly countryFlags: Record<string, string> = {
    it: "🇮🇹",
    us: "🇺🇸",
    uk: "🇬🇧",
    de: "🇩🇪",
    fr: "🇫🇷",
    es: "🇪🇸",
    jp: "🇯🇵",
  };

  readonly interestOptions: readonly NgxSelectOption[] = [
    { value: "angular", label: "Angular" },
    { value: "signals", label: "Signals" },
    { value: "rxjs", label: "RxJS" },
    { value: "typescript", label: "TypeScript" },
    { value: "testing", label: "Testing" },
    { value: "ngrx", label: "NgRx" },
    { value: "ssr", label: "SSR" },
    { value: "a11y", label: "Accessibility" },
    { value: "perf", label: "Performance" },
    { value: "animations", label: "Animations" },
    { value: "pwa", label: "PWA" },
    { value: "graphql", label: "GraphQL" },
    { value: "docker", label: "Docker" },
    { value: "ci-cd", label: "CI/CD" },
  ];

  readonly contactOptions: readonly NgxSelectOption[] = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "sms", label: "SMS" },
  ];

  readonly frequencyOptions: readonly NgxSelectOption[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  // ── Submit handling ─────────────────────────────────────────────────────────

  readonly lastSubmitResult = signal<string | null>(null);

  readonly submitAction = async (
    value: ContactForm,
  ): Promise<NgxFormError[] | void> => {
    // Ported serialization logic to lib/core/utils.ts as ngxFormSerialize
    this.lastSubmitResult.set(JSON.stringify(ngxFormSerialize(value), null, 2));
    console.log("Form submitted with value:", value);
  };
  
  onFileSelected(file: File | File[] | null): void {
    console.log("File selected before submit:", file);
  }

  onSubmitted(_event: NgxFormSubmitEvent<ContactForm>): void {
    // Event can be inspected during development via browser devtools
  }
}

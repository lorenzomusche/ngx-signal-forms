import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import {
  createSignalFormAdapter,
  NgxCheckboxComponent,
  NgxConditionalOptionsDirective,
  NgxDatePickerComponent,
  NgxDateRange,
  NgxDateRangePickerComponent,
  NgxFileComponent,
  NgxFloatingLabelsDirective,
  NgxFormAdapter,
  NgxFormComponent,
  NgxFormError,
  ngxFormSerialize,
  NgxFormSubmitEvent,
  NgxInlineErrorsDirective,
  NgxMultiselectComponent,
  NgxNumberComponent,
  NgxOptionDirective,
  NgxPrefixDirective,
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
  NgxSuffixDirective,
  NgxSupportingTextDirective,
  NgxTextareaComponent,
  NgxTextComponent,
  NgxTimepickerComponent,
  NgxToggleComponent
} from "ngx-signal-forms";

interface ContactForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  country: string | null;
  province: string | null;
  visitedProvinces: ReadonlyArray<string>;
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
  // Demo configuration
  theme: "material" | "ios" | "ionic";
  density: number;
  floating: boolean;
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
    NgxPrefixDirective,
    NgxSuffixDirective,
    NgxSupportingTextDirective,
    NgxConditionalOptionsDirective,
    NgxFloatingLabelsDirective,
    NgxOptionDirective
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
          [ngxFloatingLabels]="config().floating"
          [ngxFloatingLabelsDensity]="config().density"
          (submitted)="onSubmitted($event)"
          [class]="'theme-' + config().theme"
        >
          <header class="demo-config" style="margin-bottom: 2.5rem; padding: 1.5rem; background: var(--ngx-surface-container); border-radius: 12px; border: 1px dashed var(--ngx-outline-variant);">
            <h2 style="margin: 0 0 1rem; font-size: 1rem; font-weight: 500;">Live Theme & Rules Playground</h2>
            
            <div class="form-row">
              <ngx-control-multiselect
                name="theme"
                label="Visual Theme"
                [options]="themeOptions"
                mode="single"
              >
                <ng-template ngxOption let-opt>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>{{ themeIcons[opt.value] }}</span>
                    <strong>{{ opt.label }}</strong>
                  </div>
                </ng-template>
              </ngx-control-multiselect>

              <ngx-control-segmented
                name="density"
                label="Layout Density"
                [options]="densityOptions"
              />
            </div>

            <div style="margin-top: 1rem; display: flex; gap: 2rem;">
              <ngx-control-toggle
                name="floating"
                label="Enable Floating Labels"
              />
            </div>
          </header>

          <div class="form-row">
            <ngx-control-text
              name="firstName"
              label="First Name"
              placeholder="John"
              ngxInlineErrors
            />

            <ngx-control-text
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              ngxInlineErrors
            >
              <ng-template ngxPrefix>👤</ng-template>
              <div *ngxSupportingText>Full name as per ID</div>
            </ngx-control-text>

          </div>

          <div class="form-row">
            <ngx-control-text
              name="email"
              label="Email"
              placeholder="john.doe&#64;example.com"
              ngxInlineErrors
            >
              <button *ngxSuffix type="button" (click)="0" style="background:none; border:none; cursor:pointer;">📧</button>
            </ngx-control-text>


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

          <ngx-control-select
            name="province"
            label="Province / State"
            placeholder="Select a province…"
            [ngxDependsOn]="'country'"
            [ngxOptionsMap]="provincesByCountry"
          />

          <ngx-control-multiselect
            name="visitedProvinces"
            label="Visited Provinces"
            [ngxDependsOn]="'country'"
            [ngxOptionsMap]="provincesByCountry"
            [searchable]="true"
            mode="multi"
          />

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
    country: "it",
    province: "RM",
    visitedProvinces: [],
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
    theme: "material",
    density: -2,
    floating: true,
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

  /** Configuration derived from the form model for reactive binding */
  readonly config = computed(() => ({
    theme: this.adapter.getField("theme")!()?.value() as "material" | "ios" | "ionic",
    density: this.adapter.getField("density")!()?.value() as number,
    floating: this.adapter.getField("floating")!()?.value() as boolean,
  }));

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

  readonly provincesByCountry: Record<string, NgxSelectOption[]> = {
    it: [
      { value: "RM", label: "Roma" },
      { value: "MI", label: "Milano" },
      { value: "NA", label: "Napoli" },
      { value: "TO", label: "Torino" },
    ],
    us: [
      { value: "CA", label: "California" },
      { value: "NY", label: "New York" },
      { value: "TX", label: "Texas" },
      { value: "FL", label: "Florida" },
    ],
    uk: [
      { value: "LDN", label: "London" },
      { value: "MAN", label: "Manchester" },
      { value: "BIR", label: "Birmingham" },
    ],
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

  readonly themeOptions: readonly NgxSelectOption[] = [
    { value: "material", label: "Material 3" },
    { value: "ios", label: "iOS Design" },
    { value: "ionic", label: "Ionic Solid" },
  ];

  readonly themeIcons: Record<string, string> = {
    material: "🎨",
    ios: "🍎",
    ionic: "⚡",
  };

  readonly densityOptions: readonly NgxSelectOption<number>[] = [
    { value: 0, label: "Standard" },
    { value: -2, label: "Compact" },
    { value: -3, label: "Ultra" },
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

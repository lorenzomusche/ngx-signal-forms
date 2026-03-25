import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import {
  createSignalFormAdapter,
  NgxCheckboxComponent,
  NgxColorsComponent,
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
  NgxToggleComponent,
} from "@ngx-signals/forms";


interface DesignSystemForm extends Record<string, unknown> {
  theme: "default" | "material" | "ios" | "ionic";
  primaryColor: string;
  density: number;
  floating: boolean;
}


interface ContactForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  country: string | null;
  province: string | null;
  provinceMs: ReadonlyArray<string>;
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
    NgxColorsComponent,
    NgxPrefixDirective,
    NgxSuffixDirective,
    NgxSupportingTextDirective,
    NgxConditionalOptionsDirective,
    NgxFloatingLabelsDirective,
    NgxOptionDirective
  ],
  template: `
    <main class="demo-card">
      <h1>ngx-signal-forms Demo</h1>
      <p class="subtitle">
        A declarative, type-safe, reactive form system built on Angular Signals.
      </p>

      <section style="margin-bottom: 2rem;">
          <details 
            class="playground-accordion"
            style="margin-bottom: 2rem; border-radius: 12px; border: 1px solid var(--ngx-outline-variant); background: var(--ngx-surface-container);"
            [open]="false"
          >

            <summary style="padding: 1rem 1.25rem; list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: var(--ngx-surface); font-size: 0.8125rem; font-weight: 700; color: var(--ngx-primary); transition: background 0.2s;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1rem;">🎨</span>
                <span>Design System Inspector</span>
              </div>
              <div style="font-size: 0.65rem; color: var(--ngx-on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em;">Configurazione Real-time</div>
            </summary>

            <div 
              class="demo-config" 
              style="padding: 1.5rem; background: var(--ngx-surface); border-top: 1px solid var(--ngx-outline-variant); position: relative;"
            >
              <!-- Decorative accent bar -->
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--ngx-primary);"></div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <div style="padding-right: 1.5rem;">
                  <h4 style="margin: 0 0 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ngx-primary); font-weight: 800;">
                    Real-time Theme Engine
                  </h4>
                  <p style="margin: 0; font-size: 0.8125rem; color: var(--ngx-on-surface-variant);">
                    Modifica istantaneamente l'esperienza visiva
                  </p>
                </div>
              </div>


               <ngx-form #designSystemForm
          [adapter]="designSystemAdapter"
          [ngxFloatingLabels]="designSystemConfig().floating"
        >
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start;">
                 <ngx-control-colors
                  name="primaryColor"
                  label="Brand Primary Color"
                  ngxInlineErrors
                />
                
                <ngx-control-select
                  name="theme"
                  label="Design System Theme"
                  [options]="themeOptions"
                  ngxInlineErrors
                >
                  <ng-template ngxOption let-opt>
                    {{ opt.label }}
                  </ng-template>
                </ngx-control-select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; margin-top: 1rem;">
                <ngx-control-toggle
                  name="floating"
                  label="Interactive Floating Labels"
                />
                
                <ngx-control-segmented
                  name="density"
                  label="Layout Density"
                  [options]="densityOptions"
                />
              </div>
            </ngx-form>
            </div>
          </details>

          <ngx-form
          [adapter]="adapter"
          [action]="submitAction"
          [ngxFloatingLabels]="designSystemConfig().floating"
          [ngxFloatingLabelsDensity]="designSystemConfig().density"
          (submitted)="onSubmitted($event)"
        >

          <div class="form-row">
            <ngx-control-text
              name="firstName"
              label="First Name"
              placeholder="John"
              ngxInlineErrors
            >
              <div *ngxSupportingText>Enter your given name</div>
            </ngx-control-text>

            <ngx-control-text
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              ngxInlineErrors
            >
              <ng-template ngxPrefix>👤</ng-template>
              <div *ngxSupportingText>Enter your legal family name</div>
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
              <div *ngxSupportingText>We'll never share your email</div>
            </ngx-control-text>


            <ngx-control-number
              name="age"
              label="Age"
              placeholder="25"
              [minValue]="0"
              [maxValue]="120"
            >
              <div *ngxSupportingText>Must be between 0 and 120</div>
            </ngx-control-number>
          </div>

          <div class="form-row">
            <ngx-control-datepicker name="birthDate" label="Date of Birth">
              <div *ngxSupportingText>Select from the calendar</div>
            </ngx-control-datepicker>

            <ngx-control-timepicker
              name="appointmentTime"
              label="Appointment Time"
            >
              <div *ngxSupportingText>Pick a slot for your visit</div>
            </ngx-control-timepicker>
          </div>

          <ngx-control-daterange
            name="travelDates"
            label="Travel Dates"
            minDate="2026-01-01"
            maxDate="2027-12-31"
          >
            <div *ngxSupportingText>Select start and end dates</div>
          </ngx-control-daterange>

          <ngx-control-multiselect
            name="interests"
            label="Interests"
            [options]="interestOptions"
            [searchable]="true"
            mode="multi"
          >
             <div *ngxSupportingText>Choose your favorite topics</div>
          </ngx-control-multiselect>

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
            <div *ngxSupportingText>Used for regional settings</div>
          </ngx-control-select>

          <ngx-control-select
            name="province"
            label="Province / State (Select)"
            placeholder="Select a province…"
            [ngxDependsOn]="'country'"
            [ngxOptionsMap]="provincesByCountry"
          >
            <div *ngxSupportingText>Dependent on Country selection</div>
          </ngx-control-select>

          <ngx-control-multiselect
            name="provinceMs"
            label="Province / State (MultiSelect)"
            [ngxDependsOn]="'country'"
            [ngxOptionsMap]="provincesByCountry"
            [searchable]="true"
          >
            <div *ngxSupportingText>Select multiple regions</div>
          </ngx-control-multiselect>

          <ngx-control-textarea
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself…"
            [rows]="3"
          >
            <div *ngxSupportingText>Maximum 500 characters</div>
          </ngx-control-textarea>

          <div class="form-row">
            <ngx-control-checkbox
              name="acceptTerms"
              label="I accept the terms and conditions"
            >
              <div *ngxSupportingText>Legal requirement</div>
            </ngx-control-checkbox>

            <ngx-control-toggle
              name="newsletter"
              label="Subscribe to newsletter"
            >
              <div *ngxSupportingText>Occasional marketing updates</div>
            </ngx-control-toggle>
          </div>

          <ngx-control-radio
            name="preferredContact"
            label="Preferred Contact Method"
            [options]="contactOptions"
            layout="horizontal"
          >
            <div *ngxSupportingText>How should we reach you?</div>
          </ngx-control-radio>

          <ngx-control-slider
            name="satisfaction"
            label="Rate your experience"
            [min]="1"
            [max]="10"
            [step]="1"
          >
            <div *ngxSupportingText>1 = Poor, 10 = Excellent</div>
          </ngx-control-slider>

          <ngx-control-file
            name="resume"
            label="Upload Resume (PDF only)"
            accept=".pdf"
            (fileSelected)="onFileSelected($event)"
          >
            <div *ngxSupportingText>Only PDF files are accepted</div>
          </ngx-control-file>

          <ngx-control-segmented
            name="frequency"
            label="Contact Frequency"
            [options]="frequencyOptions"
          >
            <div *ngxSupportingText>Delivery schedule for messages</div>
          </ngx-control-segmented>

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
    </main>
  `,
})
export class AppComponent {

  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const config = this.designSystemConfig();
      const theme = config.theme;
      const primaryColor = config.primaryColor;

      // ── Update Theme Stylesheet ──
      const link = this.document.getElementById("ngx-theme-link") as HTMLLinkElement;
      if (link) {
        const filename =
          theme === "default"
            ? "ngx-signal-forms.css"
            : `ngx-signal-forms-${theme}.css`;
        link.href = `styles/${filename}`;
      }

      // ── Update Primary Color Variable ──
      // This triggers all color-mix calculations in ngx-signal-forms.css
      this.document.documentElement.style.setProperty("--ngx-primary", primaryColor);
    });
  }

  // ── Form model (writable signal) ────────────────────────────────────────────

  private readonly designSystemModel = signal<DesignSystemForm>({
    theme: "material",
    primaryColor: "#18181b",
    density: -3,
    floating: false,
  });


  private readonly model = signal<ContactForm>({
    firstName: "lorenzo",
    lastName: "muscherà",
    email: "lorenzo.muschera@sonounamailinesistente.it",
    age: null,
    birthDate: null,
    country: "it",
    province: "RM",
    provinceMs: ["RM"],
    appointmentTime: null,
    bio: "",
    interests: ["testing"],
    travelDates: null,
    newsletter: false,
    acceptTerms: false,
    preferredContact: "email",
    satisfaction: 5,
    resume: null,
    frequency: "weekly"
  });

  // ── Adapter ─────────────────────────────────────────────────────────────────

  readonly designSystemAdapter: NgxFormAdapter<DesignSystemForm> = createSignalFormAdapter({
    model: this.designSystemModel,
    submitMode: "valid-only",
  });

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
  readonly designSystemConfig = computed(() => ({
    theme: this.designSystemAdapter.getField("theme")!()?.value() as DesignSystemForm["theme"],
    primaryColor: this.designSystemAdapter.getField("primaryColor")!()?.value() as string,
    density: this.designSystemAdapter.getField("density")!()?.value() as number,
    floating: this.designSystemAdapter.getField("floating")!()?.value() as boolean,
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
    { value: "default", label: "📄 Base Theme" },
    { value: "material", label: "🎨 Material 3" },
    { value: "ios", label: "🍎 iOS Design" },
    { value: "ionic", label: "⚡ Ionic Solid" },
  ];

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

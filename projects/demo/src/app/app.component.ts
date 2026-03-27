import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import {
  NgxCheckboxComponent,
  NgxColorsComponent,
  NgxConditionalOptionsDirective,
  NgxDatePickerComponent,
  NgxDateRangePickerComponent,
  NgxEmailDirective,
  NgxFileComponent,
  NgxFloatingLabelsDirective,
  NgxFormComponent,
  ngxFormSerialize,
  NgxFormSubmitEvent,
  NgxInlineErrorsDirective,
  NgxMaxDirective,
  NgxMaxLengthDirective,
  NgxMinDirective,
  NgxMinLengthDirective,
  NgxMultiselectComponent,
  NgxNumberComponent,
  NgxOptionDirective,
  NgxPrefixDirective,
  NgxRadioGroupComponent,
  NgxRequiredDirective,
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
} from "@ngx-signals/forms-compiled";

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
    // Declarative validator directives
    NgxRequiredDirective,
    NgxEmailDirective,
    NgxMinDirective,
    NgxMaxDirective,
    NgxMinLengthDirective,
    NgxMaxLengthDirective,
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

              <ngx-form #dsForm [formValue]="initialDesignSystemValues"
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

          <ngx-form #contactForm
            [formValue]="initialContactValues"
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
              ngxRequired
              [ngxMinLength]="2"
              [ngxMaxLength]="50"
            >
              <div *ngxSupportingText>Enter your given name</div>
            </ngx-control-text>

            <ngx-control-text
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              ngxInlineErrors
              ngxRequired
              [ngxMinLength]="2"
              [ngxMaxLength]="50"
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
              ngxRequired
              ngxEmail
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
              [ngxMin]="0"
              [ngxMax]="120"
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
            [ngxMaxLength]="500"
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
            ngxRequired
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

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-top: 0.5rem;">
            <button type="submit" [disabled]="!contactForm.state.canSubmit()">
              @if (contactForm.state.submitting()) {
                Submitting…
              } @else {
                Submit
              }
            </button>

            <button type="button" (click)="contactForm.reset()">
              Reset
            </button>

            <button type="button" (click)="patchContactForm(contactForm)">
              Patch (name → Demo User)
            </button>
          </div>
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

  // ── Design System form — read field values via ViewChild ─────────────────────

  readonly designSystemFormRef =
    viewChild<NgxFormComponent<Record<string, unknown>>>("dsForm");

  readonly designSystemConfig = computed(() => {
    const form = this.designSystemFormRef();
    return {
      theme: (form?.getField("theme")?.()?.value() ?? "default") as
        | "default"
        | "material"
        | "ios"
        | "ionic",
      primaryColor: (form?.getField("primaryColor")?.()?.value() ??
        "#18181b") as string,
      density: (form?.getField("density")?.()?.value() ?? -3) as number,
      floating: (form?.getField("floating")?.()?.value() ?? false) as boolean,
    };
  });

  constructor() {
    effect(() => {
      const config = this.designSystemConfig();

      const link = this.document.getElementById(
        "ngx-theme-link",
      ) as HTMLLinkElement;
      if (link) {
        const filename =
          config.theme === "default"
            ? "ngx-signal-forms.css"
            : `ngx-signal-forms-${config.theme}.css`;
        link.href = `styles/${filename}`;
      }

      this.document.documentElement.style.setProperty(
        "--ngx-signal-form-sys-color-primary",
        config.primaryColor,
      );
    });
  }

  // ── Initial values ────────────────────────────────────────────────────────────

  readonly initialDesignSystemValues = {
    theme: "default",
    primaryColor: "#18181b",
    density: -3,
    floating: false,
  };

  readonly initialContactValues = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    country: "it",
    province: "RM",
    provinceMs: ["RM"],
    interests: ["testing"],
    newsletter: false,
    acceptTerms: false,
    preferredContact: "email",
    satisfaction: 5,
    frequency: "weekly",
  };

  // ── Select / multiselect options ─────────────────────────────────────────────

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

  // ── Submit handling ──────────────────────────────────────────────────────────

  readonly lastSubmitResult = signal<string | null>(null);

  onSubmitted(event: NgxFormSubmitEvent<Record<string, unknown>>): void {
    this.lastSubmitResult.set(
      JSON.stringify(ngxFormSerialize(event.value), null, 2),
    );
    console.log("Form submitted with value:", event.value);
  }

  onFileSelected(file: File | File[] | null): void {
    console.log("File selected before submit:", file);
  }

  patchContactForm(form: NgxFormComponent<Record<string, unknown>>): void {
    form.patchValue({ firstName: "Demo", lastName: "User", email: "demo@example.com" });
  }
}

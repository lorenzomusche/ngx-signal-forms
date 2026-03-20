import { UpperCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  createSignalFormAdapter,
  NgxCheckboxComponent,
  NgxDatePickerComponent,
  NgxFormAdapter,
  NgxFormComponent,
  NgxFormError,
  NgxFormSubmitEvent,
  NgxInlineErrorsDirective,
  NgxMultiselectComponent,
  NgxNumberComponent,
  NgxOptionDirective,
  NgxSelectComponent,
  NgxSelectOption,
  NgxTextareaComponent,
  NgxTextComponent,
  NgxToggleComponent,
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
  newsletter: boolean;
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
    NgxDatePickerComponent,
    NgxMultiselectComponent,
    NgxInlineErrorsDirective,
    NgxToggleComponent,
    NgxOptionDirective,
    UpperCasePipe,
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

        <ngx-control-text
          name="email"
          label="Email"
          placeholder="john.doe&#64;example.com"
          [ariaRequired]="true"
          ngxInlineErrors
        />

        <div class="form-row">
          <ngx-control-number
            name="age"
            label="Age"
            placeholder="25"
            [minValue]="0"
            [maxValue]="120"
          />

          <ngx-control-datepicker name="birthDate" label="Date of Birth" />
        </div>

        <ngx-control-multiselect
          name="interests"
          label="Interests"
          [options]="interestOptions"
          [searchable]="true"
          mode="multi"
        />

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
            <strong>{{ opt.label }}</strong>
            <small style="margin-left: auto; color: #888">{{
              opt.value | uppercase
            }}</small>
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
    firstName: "lorenzo",
    lastName: "muscherà",
    email: "lorenzo.muschera@sonounamailinesistente.it",
    age: null,
    birthDate: null,
    country: null,
    bio: "",
    interests: ["testing"],
    newsletter: false,
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

  // ── Submit handling ─────────────────────────────────────────────────────────

  readonly lastSubmitResult = signal<string | null>(null);

  readonly submitAction = async (
    value: ContactForm,
  ): Promise<NgxFormError[] | void> => {
    // Simulate async server call
    this.lastSubmitResult.set(JSON.stringify(value, null, 2));
  };

  onSubmitted(_event: NgxFormSubmitEvent<ContactForm>): void {
    // Event can be inspected during development via browser devtools
  }
}

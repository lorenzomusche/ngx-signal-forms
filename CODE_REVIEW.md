# ngx-signal-forms — Code Review & Optimization Report

> Generato automaticamente, verificato manualmente.
> Priorità: 🔴 High · 🟡 Medium · 🟢 Low · ✅ Già OK

---

## 1. TypeScript / Angular

### 🔴 `setTimeout(..., 0)` → `afterNextRender()`

Sostituire i `setTimeout(fn, 0)` usati per coordinare il DOM con `afterNextRender()` (Angular 17+). Evita timing-dependency e funziona correttamente con SSR.

- [ ] `select-renderer.component.ts:275` — focus su searchInputRef dopo apertura dropdown
- [ ] `select-renderer.component.ts:287` — posizionamento dropdown dopo apertura
- [ ] `multiselect-renderer.component.ts:271` — focus su overlayInputRef
- [ ] `datepicker.component.ts:198-203` — sync calendario dopo apertura
- [ ] `daterange-renderer.component.ts:244` — sync range picker dopo apertura
- [ ] `calendar.component.ts:111` — focus su cella data
- [ ] `range-calendar.component.ts:111` — idem per range
- [ ] `year-picker.component.ts:45` — scroll anno selezionato in vista
- [ ] `colors-renderer.component.ts:147` — focus input colore
- [ ] `timepicker-renderer.component.ts:185` — focus segmento ora

**Pattern di sostituzione:**
```typescript
// Prima
setTimeout(() => this.inputRef()?.nativeElement.focus(), 0);

// Dopo
afterNextRender(() => this.inputRef()?.nativeElement.focus());
```

> **Nota:** NON sostituire i seguenti `setTimeout` che usano delay > 0ms intenzionali:
> - `timepicker-clock.component.ts:162` — `setTimeout(() => ..., 200)` — UX auto-switch ore→minuti dopo tap
> - `timepicker-clock.component.ts:214` — `setTimeout(() => ..., 300)` — UX auto-switch ore→minuti dopo drag
> - `a11y-announcer.ts:33` — timing critico per screen reader `aria-live`

---

### 🟡 `@ViewChild` + `AfterViewInit` → `viewChild()` signal

- [ ] `slider-renderer.component.ts:69` — usa `@ViewChild` mentre tutti gli altri componenti usano `viewChild()`. Migrare per coerenza:

```typescript
// Prima
@ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLElement>;
ngAfterViewInit() { ... }

// Dopo
readonly sliderTrack = viewChild<ElementRef<HTMLElement>>('sliderTrack');
// Usare effect() o computed() per reagire al valore
```

---

### 🟡 `TValue = any` → constraint generico

- [ ] `radio-group-renderer.component.ts:65` — `export class NgxRadioGroupComponent<TValue = any>`
- [ ] `segmented-button-renderer.component.ts:79` — `export class NgxSegmentedButtonComponent<TValue = any>`

Sostituire `any` con `unknown` o aggiungere un constraint appropriato (`string | number | boolean`).

---

### 🟢 Segmented pointer move — RAF throttle

- [ ] `segmented-button-renderer.component.ts` — `pointermove` chiama `getBoundingClientRect()` a ogni evento durante il drag. Il handler ha già un early return `if (!this.isDragging)` e il segnale non si aggiorna se il segmento non cambia, quindi l'impatto reale è minimo. Opzionalmente aggiungere RAF throttle:

```typescript
private rafId: number | null = null;

onTrackPointerMove(e: PointerEvent): void {
  if (this.rafId !== null) return;
  this.rafId = requestAnimationFrame(() => {
    this.updateSelectionFromPointer(e);
    this.rafId = null;
  });
}
```

---

### 🟢 Timepicker clock — document listeners persistenti

- [ ] `timepicker-clock.component.ts` — I host listeners `(document:mousemove)` e `(document:touchmove)` sono registrati per tutta la vita del componente. Valutare registrazione manuale solo durante il drag per ridurre event listeners globali.

---

## 2. CSS / Temi

### 🔴 `!important` — refactoring architetturale con `@layer`

200+ `!important` nel solo tema iOS, causati dalla mancanza di cascade layering. I temi devono vincere sul CSS base ma non hanno priorità strutturale.

**Soluzione:** Introdurre `@layer` per strutturare la cascade:

```css
/* ngx-signal-forms.css (base) */
@layer ngx-base, ngx-components, ngx-states;

/* ngx-signal-forms-ios.css (tema) */
@layer ngx-theme {
  /* Tutte le regole del tema — vincono automaticamente sui layer precedenti */
}
```

- [ ] Wrappare le regole del CSS base in `@layer ngx-base, ngx-components, ngx-states`
- [ ] Wrappare ogni tema in `@layer ngx-theme`
- [ ] Rimuovere progressivamente gli `!important` ora superflui
- [ ] Verificare che non ci siano regressioni visive su tutti e 3 i temi

> **Nota:** Questo è un refactoring significativo. Procedere per tema, partendo dal Material (più semplice), poi Ionic, poi iOS.

---

### 🟡 `transform: translateX` invece di `left` per `::before` segmented

- [ ] Tutti i temi — il cursore segmented usa `left: calc(...)` che forza reflow. `transform` è GPU-accelerato.

```css
/* Prima */
left: calc(3px + var(--ngx-selected-index) * (...));

/* Dopo */
left: 0;
transform: translateX(calc(3px + var(--ngx-selected-index) * (...)));
```

---

### 🟡 Spacing inconsistencies tra temi

Questi token hanno valori discordanti tra temi senza una motivazione evidente:

| Token | base/material | iOS | Ionic |
|-------|--------------|-----|-------|
| `--ngx-checkbox-gap` | `0.75rem` | `0.5rem` | `0.75rem` |
| `--ngx-toggle-gap` | `0.75rem` | `0.625rem` | (ereditato) |
| `--ngx-input-padding` (H) | `1rem` | `0.75rem` | `1rem` |
| `--ngx-multiselect-padding` (V) | `0.5rem` | `0.25rem` | `0.375rem` |
| `--ngx-renderer-margin-bottom` | `1rem` | `0.375rem` | `0.5rem` |
| `--ngx-datepicker-popup-padding` | `1.25rem` | `0.5rem` | — |

- [ ] Decidere se le variazioni iOS/Ionic sono intenzionali o errori di portage
- [ ] Commentare con `/* intentional override */` dove la differenza è voluta
- [ ] Allineare i valori accidentalmente discordanti

---

### 🟡 Naming duale per toggle thumb

- [ ] `ngx-signal-forms.css` usa `--ngx-toggle-thumb-size` (singolo valore, thumb quadrato)
- [ ] `ngx-signal-forms-ios.css` usa `--ngx-toggle-thumb-width` + `--ngx-toggle-thumb-height` (separati, thumb rettangolare)

Standardizzare su `width`+`height` ovunque. Per i temi con thumb quadrato, definire entrambi con lo stesso valore.

---

### 🟡 Datepicker cell-size: mix di unità

- [ ] `ngx-signal-forms-base.css:17` — `--ngx-signal-form-comp-date-picker-cell-size: 2.5rem`
- [ ] `ngx-signal-forms-ios.css:214` — `--ngx-datepicker-cell-size: 2.25rem`
- [ ] `ngx-signal-forms-material.css:87` — `--ngx-datepicker-cell-size: 40px`

Mix di `rem` e `px`. Unificare l'unità (preferire `rem`).

---

### 🟡 `:has()` selector explosion (segmented iOS)

- [ ] `ngx-signal-forms-ios.css:1366-1390` — 7 regole `:has(.ngx-segmented__button--selected:nth-child(N))` per posizionare il cursore. Il componente già setta `--ngx-segments-count` via JS. Aggiungere anche `--ngx-selected-index` dal componente e usare un singolo `calc()` per il `left`/`transform`.

---

### 🟢 Border radius: token inconsistenti tra temi

| Componente | iOS | Material | Ionic |
|-----------|-----|----------|-------|
| Input | `12px` | `4px` | `4px 4px 0 0` |
| Segmented | `16px` | `8px` | — |
| Select popup | `28px` | `8px` | — |
| Datepicker popup | `20px` | `20px` | — |

- [ ] Definire token semantici: `--ngx-corner-xs`, `--ngx-corner-sm`, `--ngx-corner-lg`
- [ ] I temi sovrascrivono solo i token, non i valori inline

---

### 🟢 `@supports` duplicati in iOS

- [ ] iOS ha 3 blocchi `@supports (backdrop-filter: blur(1px))` separati (L837, L1175, L1224) — consolidare in 1

---

### 🟢 Dark mode `@media` sparsi

- [ ] Tutti i temi — le regole `@media (prefers-color-scheme: dark)` sono distribuite nel file. Raggrupparle in fondo per leggibilità.

---

### 🟢 iOS duplicate gradient (segmented)

- [ ] `ngx-signal-forms-ios.css:1327-1354` — gradiente glass del segmented definito sia in `::before` che in un vecchio blocco `@supports`. Rimuovere il blocco `@supports` ridondante.

---

## 3. Bundle Size

### 🟡 CSS iOS: 58.8KB per un singolo tema

- [ ] Il file `ngx-signal-forms-ios.css` è il secondo più grande della libreria (58.8KB). Analizzare e ridurre:
  - Consolidare i 3 blocchi `@supports` duplicati (~200 bytes gzip)
  - Rimuovere gradiente segmented duplicato
  - Consolidare regole dark mode sparse

---

## 4. Struttura / Spunti

### 🟢 Demo `app.component.ts` — 555 righe

- [ ] `projects/demo/src/app/app.component.ts` — troppo grande per un componente demo. Splittare in sub-component per sezione (DatepickerDemo, TimepickerDemo, etc.).

---

### 🟢 `linkedSignal()` e `resource()` — non usati

- Valutare `linkedSignal()` per sincronizzazioni bi-direzionali tra campi correlati (es. date start/end nel range picker)
- Valutare `resource()` per opzioni caricate async in select/multiselect

---

## 5. ✅ Già corretto — Non toccare

| Pattern | Status |
|---------|--------|
| `ChangeDetectionStrategy.OnPush` su tutti i componenti | ✅ |
| `inject()` invece di constructor injection | ✅ |
| `input()` / `output()` / `viewChild()` (tranne slider) | ✅ |
| `track` su tutti i `@for` | ✅ |
| Zero RxJS subscriptions (solo signal) | ✅ |
| `strict: true` + tutti i flag strict TypeScript | ✅ |
| `@angular/forms/signals` isolato in un solo file | ✅ |
| Nessun wildcard import (`import *`) | ✅ |
| Nessuna circular dependency | ✅ |

---

## Stima impatto

| Fix | Beneficio |
|-----|-----------|
| `@layer` + rimozione `!important` | −2-5KB gzip, cascade pulita, manutenibilità |
| `afterNextRender` (10 occorrenze) | compatibilità SSR + correttezza |
| `transform` vs `left` | +1-2fps, no reflow |
| `:has()` → `--ngx-selected-index` | −~300 bytes gzip, 7 regole in meno |
| Consolidamento `@supports` iOS | −~200 bytes gzip |
| Rimozione gradiente duplicato | −~100 bytes gzip |

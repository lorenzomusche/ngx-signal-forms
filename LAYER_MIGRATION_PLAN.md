# CSS `@layer` Migration + Theme Visual Fixes

Migrazione dell'architettura CSS a `@layer` per eliminare tutti i 240 `!important` e risolvere le inconsistenze visive nei temi Material, iOS Liquid Glass e Base.

## User Review Required

> [!IMPORTANT]
> **Strategia `@layer`:** I layer CSS definiscono una gerarchia di specificità dichiarativa. I layer definiti *prima* hanno priorità *inferiore*. Questo significa che il tema iOS può sovrascrivere il base **senza** `!important`, semplicemente essendo in un layer successivo.

> [!WARNING]
> **Breaking change per i consumer:** Se un utente carica `ngx-signal-forms-ios.css` o `ngx-signal-forms-material.css`, il codice interno ora usa `@layer`. Eventuali CSS custom dell'utente che NON sono in un layer avranno automaticamente priorità superiore a tutti i layer (comportamento by-spec), rendendo il sistema più facile da customizzare. Questo è un **miglioramento** ma va documentato.

> [!CAUTION]
> **Demo: il `<link id="ngx-theme-link">` in `index.html`** carica i CSS tematici come foglio separato. I temi Material/iOS contengono `@import './ngx-signal-forms.css'` all'interno. Questo funziona perché il browser risolve l'import prima di applicare il layer ordering. Tuttavia, il file `ngx-signal-forms-base.css` è caricato anche via `angular.json > styles[]`. Occorre verificare che non ci siano conflitti di doppio-caricamento dei token M3.

## Proposed Changes

### Fase 1: Layer Architecture (3 file CSS)

L'ordine dei layer (dal più debole al più forte):

```css
@layer ngx-tokens, ngx-base, ngx-theme;
```

- **`ngx-tokens`**: Custom properties (:root), design tokens
- **`ngx-base`**: Tutti gli stili strutturali e funzionali del base theme
- **`ngx-theme`**: Override del tema specifico (Material, iOS, Ionic)

CSS non inserito in alcun layer (es. custom CSS dell'utente) vince su tutti.

---

#### [MODIFY] [ngx-signal-forms.css](file:///Users/lorenzo.local/projects/test/ngx-signal-forms/projects/ngx-signal-forms/src/styles/ngx-signal-forms.css)
- **Linea 1:** Aggiungere `@layer ngx-tokens, ngx-base;` come dichiarazione di ordine
- Wrappare il blocco `:root` (L85-321) in `@layer ngx-tokens { ... }`
- Wrappare il blocco `@media (prefers-color-scheme: dark) :root` (L556-562) in `@layer ngx-tokens { ... }`
- Wrappare tutti gli stili strutturali (L1-56, L323-555, L564-2746) in `@layer ngx-base { ... }`
- **Rimuovere tutti i `!important`** (51 occorrenze) — ora non più necessari grazie alla gerarchia dei layer

---

#### [MODIFY] [ngx-signal-forms-material.css](file:///Users/lorenzo.local/projects/test/ngx-signal-forms/projects/ngx-signal-forms/src/styles/ngx-signal-forms-material.css)
- **Linea 1:** Mantenere `@import './ngx-signal-forms.css';` (importa i layer `ngx-tokens` e `ngx-base`)
- **Linea 2:** Wrappare tutto il contenuto del file in `@layer ngx-theme { ... }`
- **Rimuovere tutti i `!important`** (29 occorrenze)
- **Fix visivi:**
  - Assicurare che il datepicker cell-size sia `2.5rem`
  - Verificare allineamento floating label con density `-3`

---

#### [MODIFY] [ngx-signal-forms-ios.css](file:///Users/lorenzo.local/projects/test/ngx-signal-forms/projects/ngx-signal-forms/src/styles/ngx-signal-forms-ios.css)
- **Linea 27:** Mantenere `@import './ngx-signal-forms.css';`
- **Linea 28:** Wrappare tutto il contenuto del file in `@layer ngx-theme { ... }`
- **Rimuovere tutti i `!important`** (160 occorrenze!) — la ragione principale per cui ne ha così tanti è che il base theme ha la stessa specificità e solo `!important` poteva vincere; con i layer, `ngx-theme` vince automaticamente su `ngx-base`
- **Consolidare** i 3 blocchi `@supports (backdrop-filter)` in una sezione unica
- **Fix visivi Liquid Glass:**
  - Ridurre l'aggressività del blur nelle glass overlay (attualmente troppo "lattiginoso")
  - Uniformare il timepicker con il datepicker (stesse dimensioni popup, stessi bordi glass)
  - Verificare il posizionamento degli overlay (timepicker, select, datepicker, color picker) nei 3 livelli di density

---

### Fase 2: Fix Visivi Cross-Theme

#### Allineamento e Spacing

| Componente | Issue | Fix |
|---|---|---|
| **Timepicker iOS** | Non coerente col resto della UI — diversa forma/dimensione overlay | Appliare stessi parametri glass del datepicker popup |
| **Floating Label density -3** | Label può sovrapporsi al testo in density ultra-compact | Verificare `--ngx-fl-label-active-top` con density -3 |
| **Select dropdown iOS** | Bordi del dropdown non allineati al trigger | Verificare `width: var(--ngx-overlay-width)` |
| **Overlay posizionamento** | Nei 3 temi devono avere la stessa logica di posizionamento fixed | Unificare la regola `.ngx-renderer--open` |

#### Glass Effects iOS

- **Aggiungere classe `.ngx-ios-glass`** applicata dal TypeScript a tutti gli overlay aperti — questa classe abilita il backdrop-filter senza bisogno di duplicare i selettori CSS per 5 diversi componenti overlay
- **Ridurre blur** da `blur(8px)` a `blur(6px)` per evitare effetto "latte"
- **Aumentare `saturate()`** da 200% a 240% per compensare

---

## Open Questions

> [!IMPORTANT]
> 1. **Classe `.ngx-ios-glass` per gli overlay:** Vuoi che la classe venga aggiunta dinamicamente dal TypeScript (nel `overlay-control.directive.ts`) oppure preferisci mantenerla puramente CSS con i selettori composti come adesso?

> [!IMPORTANT]
> 2. **Temi Ionic:** Il file `ngx-signal-forms-ionic.css` (8KB) va incluso nella migrazione `@layer` o è un tema secondario che possiamo migrare dopo?

> [!IMPORTANT]
> 3. **Ordine di priorità:** Vuoi che proceda prima con la migrazione `@layer` (architettura pulita, rimozione `!important`) oppure prima con i fix visivi (cosa vedi subito) e poi l'architettura?

## Verification Plan

### Automated Tests
- `pnpm build` — verifica compilazione
- `ng build demo` — verifica che la demo si compili con i nuovi layer

### Manual Verification (Browser Subagent per ogni tema)
1. **Tema Default:** Aprire demo → verificare tutti i controlli funzionanti
2. **Tema Material:** Cambiare tema nel "Design System Inspector" → verificare stili Material
3. **Tema iOS:** Cambiare tema → verificare:
   - Liquid Glass sugli overlay (datepicker, timepicker, select, multiselect, color picker)
   - Glass non "lattiginoso" — trasparenza cristallina
   - Allineamento floating labels a tutte le density
4. **Tutti i temi:** Verificare che overlay/dropdown funzionino con `position: fixed`
5. **Screenshot comparativi** prima/dopo per documentare i miglioramenti

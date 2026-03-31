# 🌀 Ralph Loop Protocol — ngx-signal-forms

## Attivazione

Per avviare un Ralph Loop, scrivi nel chat:

```
/ralph <descrizione del task>
```

L'AI leggerà questo protocollo, creerà una sessione in `.ralph/` e inizierà il loop autonomo.

---

## Ambiente di Lavoro (Workspace Temporaneo)

- **Cartella `.ralph/`**: Root dedicata al Ralph Loop. Mai committata (esclusa da `.gitignore`).
- **Session ID**: Ad ogni loop crea una sottocartella `.ralph/<YYYY-MM-DD_HHMM>/`.
  - Es: `.ralph/2026-03-31_1430/`
- **File di sessione obbligatori**:
  - `.ralph/<session-id>/plan.md` — stato persistente del loop (schema obbligatorio sotto)
  - `.ralph/<session-id>/scratch.md` — appunti liberi, log di errori, diff sperimentali

---

## Schema Obbligatorio del `plan.md`

Ogni `plan.md` DEVE rispettare questa struttura. L'AI deve aggiornarlo **prima di ogni nuova iterazione**.

```markdown
## Status: IN_PROGRESS | DONE | BLOCKED

## Session ID: <YYYY-MM-DD_HHMM>

## Task (prompt originale dell'utente)
<copia esatta del prompt>

## Definition of Done (DoD)
<criteri verificabili che segnano la fine del loop>
Esempio:
- [ ] `pnpm build` termina senza errori
- [ ] `pnpm lint` esce con codice 0
- [ ] I test specificati passano

## Completed Steps
- [x] Step 1: ...
- [x] Step 2: ...

## Current Step
- [/] Step N: <descrizione precisa dello step in corso>

## Next Steps
- [ ] Step N+1: ...
- [ ] Step N+2: ...

## Errors Log
### Tentativo <N> — <timestamp>
**Errore**: <output grezzo>
**Analisi**: <causa identificata>
**Fix applicato**: <cosa è cambiato>

## Iteration Count: <N> / 10
```

---

## Gestione del Contesto (Context Window Management)

Per evitare allucinazioni e "Lost in the Middle" su cronologie troppo lunghe:

- **Persistenza su file (External Memory)**: Prima di ogni nuova iterazione, l'AI DEVE aggiornare `plan.md` con lo stato corrente, i passi completati e l'errors log.
- **Minimizzazione del contesto**: A ogni ripresa, l'AI carica **esclusivamente**:
  1. `RALPH.md` (questo file)
  2. `.ralph/<session-id>/plan.md`
  3. I file sorgente strettamente necessari allo step corrente
  Non caricare file non pertinenti allo step attivo.
- **Nessun `/clear` automatico**: L'isolamento del contesto si ottiene tramite la disciplina di lettura, non tramite comandi di sistema non garantiti.

---

## Fasi del Ralph Loop (Agentic Iteration)

### 1. Bootstrap (solo al primo avvio)

- Crea la cartella `.ralph/<session-id>/`.
- Crea `plan.md` con schema completo.
- Identifica la **Definition of Done** dal prompt dell'utente.
- Definisce la lista iniziale degli step.

### 2. Loop Autonomo

L'AI cicla in totale autonomia sulle seguenti operazioni:

1. **Plan** — Leggi `plan.md`. Identifica il `Current Step`. Se è il primo ciclo, genera la lista completa degli step.
2. **Act** — Applica le modifiche ai file del progetto o esegui comandi shell.
3. **Verify** — Esegui i comandi di verifica appropriati (vedi sezione "Comandi di Verifica" sotto).
4. **Handle Errors** — Se ci sono errori: analizza, scrivi nell'Errors Log di `plan.md`, incrementa `Iteration Count`, ri-parti da **Plan**.
5. **Proceed** — Se la verifica ha successo: spunta lo step in `plan.md`, aggiorna `Current Step`, continua al prossimo.

### 3. Guardrail: Limite Massimo di Iterazioni

> ⚠️ **Regola hard**: se `Iteration Count` raggiunge **10**, il loop si interrompe automaticamente.

Al raggiungimento del limite:
- Imposta `Status: BLOCKED` nel `plan.md`.
- Scrivi un riepilogo dell'ultimo errore irrisolto.
- Notifica l'utente con il messaggio:
  ```
  🔴 RALPH BLOCKED — Raggiunto il limite di 10 iterazioni.
  Step bloccato: <nome step>
  Ultimo errore: <sintesi errore>
  Azione richiesta: intervenire manualmente e rieseguire /ralph con contesto aggiornato.
  ```

### 4. Escalation Umana (prima del limite)

Se durante il loop emerge un caso **non risolvibile autonomamente** (permessi mancanti, ambiguità architetturale, decisione di design non specificata), l'AI deve:
- Impostare `Status: BLOCKED` nel `plan.md`.
- Interrompere il loop **immediatamente** (non aspettare il limite di 10).
- Chiedere all'utente l'informazione specifica, con contesto minimo:
  ```
  🟡 RALPH PAUSED — Input umano richiesto.
  Domanda: <domanda precisa e contestualizzata>
  Una volta risposto, esegui /ralph resume per riprendere.
  ```

### 5. Conclusione del Loop

- Esci dal loop SOLO quando tutti gli step della DoD sono verificati e spuntati.
- Imposta `Status: DONE` nel `plan.md`.
- Notifica l'utente:
  ```
  ✅ RALPH DONE — Loop completato con successo.
  Session: <session-id>
  Steps completati: <N>
  Iterazioni totali: <N>
  ```

---

## Strategia Git

Durante il loop, gestisci i commit così:

- **Non committare in loop** — lavora su file modificati finché lo step non è verificato.
- **Commit atomico per step** — quando uno step passa la verifica, esegui un commit atomico con messaggio Conventional Commits (vedi `.github/copilot-commit-message-instructions.md`).
  - Esempio: `fix(renderers): forward aria-invalid to native input`
- **Commit finale** — al completamento del loop, se non ci sono commit intermedi, esegui un unico commit descrittivo della feature/fix completa.
- **Non fare `git push`** automaticamente — lascia sempre all'utente la decisione di pushare.

---

## Comandi di Verifica (ngx-signal-forms)

Usa questi comandi nella fase **Verify** del loop, in base al tipo di modifica:

| Tipo di modifica | Comando |
|---|---|
| Build libreria | `pnpm build` |
| Lint | `pnpm lint` (o `ng lint`) |
| Type-check | `npx tsc --noEmit -p tsconfig.json` |
| Test | `pnpm test` |
| Dev server | già in esecuzione (`pnpm start`) — valida a occhio nel browser |

La DoD **deve includere almeno uno** di questi comandi come criterio oggettivo.

---

## Convenzioni del Progetto (Regole Sempre Attive nel Loop)

Il loop deve rispettare in ogni modifica le regole definite in `.github/copilot-instructions.md`. Riassunto critico:

- **TypeScript strict**: zero `any`, zero `!` senza null-check, return types espliciti ovunque.
- **Segnali Angular 21**: usa `signal()`, `computed()`, `linkedSignal()`. Mai `@Input()`, `@Output()`, `@ViewChild()`.
- **Standalone-only**: nessun `NgModule`. `imports` minimali e espliciti.
- **Template Angular 21**: usa `@if`, `@for (track ...)`, `@switch`. Mai `*ngIf`, `*ngFor`, `*ngSwitch`.
- **OnPush obbligatorio**: `ChangeDetectionStrategy.OnPush` su ogni componente.
- **Nessun `console.log`** nel codice libreria.
- **Commit Conventional**: `<type>(<scope>): <descrizione>` — vedi `.github/copilot-commit-message-instructions.md`.

---

## Comandi Ralph

| Comando | Azione |
|---|---|
| `/ralph <task>` | Avvia un nuovo loop con il task specificato |
| `/ralph resume` | Riprende un loop in stato `IN_PROGRESS` o `BLOCKED` dalla sessione più recente |
| `/ralph status` | Mostra il `plan.md` della sessione corrente senza eseguire nulla |
| `/ralph abort` | Interrompe il loop attivo e imposta `Status: ABORTED` |

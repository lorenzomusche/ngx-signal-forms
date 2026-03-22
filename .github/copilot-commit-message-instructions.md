# Commit Message Instructions — ngx-signal-forms

Generate commit messages following the **Conventional Commits** specification.

## Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

## Types

| Type       | When to use                                 |
| ---------- | ------------------------------------------- |
| `feat`     | New feature or exported symbol              |
| `fix`      | Bug fix                                     |
| `chore`    | Tooling, config, dependency updates         |
| `refactor` | Code restructure without behavior change    |
| `test`     | Adding or fixing tests                      |
| `docs`     | Documentation only                          |
| `perf`     | Performance improvement                     |
| `build`    | Build system changes (ng-packagr, tsconfig) |
| `ci`       | CI/CD pipeline changes                      |

## Scopes

Use the library layer or component name:

- `adapter` — SignalFormAdapter changes
- `core` — types.ts / tokens.ts
- `control` — ControlComponent
- `form` — NgxFormComponent
- `renderers` — any renderer directive
- `public-api` — export surface changes
- `deps` — dependency updates
- `config` — tsconfig, ng-packagr, jest config

## Rules

- Short description: imperative mood, lowercase, no period, max 72 chars.
- Body: explain _why_, not _what_. Wrap at 100 chars.
- Footer: reference issues as `Closes #123` or `Refs #456`.
- Breaking changes: add `!` after scope and `BREAKING CHANGE:` in footer.

## Examples

```
feat(adapter): add linkedSignal support for field sync
fix(renderers): forward aria-invalid to native input element
refactor(core): replace T extends object with Record<string, unknown>
perf(control): memoize fieldNames with computed() to avoid loop re-reads
chore(config): upgrade to Angular 21.1 and TypeScript 5.6
```

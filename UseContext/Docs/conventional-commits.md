# Conventional Commits — `feat`, `fix`, and Friends

The `feat`, `fix`, etc. prefixes in commit messages come from the **Conventional Commits** specification.

## Common Prefixes

| Prefix | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring, no feature/fix |
| `test` | Adding/updating tests |
| `chore` | Build, tooling, config changes |
| `perf` | Performance improvement |

## Format

```
<type>(<scope>): <short description>
```

Example: `feat(UseContext): add login and like functionality`

## Why Use This Convention

- Automated changelogs (tools can parse prefixes)
- Semantic versioning (e.g., `feat` = minor bump, `fix` = patch bump)
- Readable git history at a glance
- Scoped changes: the `(scope)` part tells you which module/area was affected


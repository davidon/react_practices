# GitHub Copilot Modes — Edit vs Plan vs Agent

These are **GitHub Copilot Chat modes** in your IDE.

## Comparison

| Mode | What it does |
|---|---|
| **Edit** | Directly modifies files in your workspace. You describe what to change, it applies edits inline. No back-and-forth — just applies code changes. |
| **Plan** | Analyzes your request and produces a **step-by-step plan** of what changes to make and where, without immediately applying them. You review the plan first, then can accept/apply it. |
| **Agent** | Autonomous mode — reads files, runs terminal commands, creates/edits multiple files, iterates on errors, and can execute multi-step tasks end-to-end. Most capable but uses more context. |

## Capabilities

| Capability | Edit | Agent |
|---|---|---|
| Read/edit files | ✅ | ✅ |
| Create new files | ✅ | ✅ |
| Read terminal output | ❌ | ✅ |
| Run terminal commands | ❌ | ✅ |
| Run tests & iterate on failures | ❌ | ✅ |
| Git operations | ❌ | ✅ |
| Multi-step autonomous reasoning | ❌ | ✅ |
| Context window usage | Lower | Higher |

## When to Use What

- **Edit** — you know exactly which file(s) to change, want a quick scoped modification
- **Plan** — you want to review what will change before applying
- **Agent** — multi-file, multi-step tasks; "figure it out yourself"

**Rule of thumb:** Agent can do everything Edit can, plus more. If you can point to the file and describe the exact change, use Edit. If you'd say "figure it out," use Agent.


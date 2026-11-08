# GoAround Development Prompt Archive

Welcome to the permanent prompt archive for **GoAround**, a curated, realistic local outing-planning product for Pune.

This directory serves as the immutable project history and audit trail of all development instructions, feature specifications, architecture designs, bug fixes, and integration tasks given during the creation and evolution of GoAround.

---

## 1. Purpose & Core Principles

1. **Complete Traceability**: Every major architectural decision, feature addition, and bug fix is grounded in the exact instructions that generated it.
2. **Fidelity to Original Intent**: Prompts are preserved verbatim without paraphrasing, omitting requirements, or rewriting history.
3. **Pre-Implementation Archival**: Prompts are saved in `prompts/` **before** code changes begin.
4. **Immutability & Versioning**: Historical prompt files are never overwritten. When requirements change or evolve, a new dated markdown file is created and cross-linked to earlier files.
5. **Zero Credential Archival**: Private keys, database passwords, OAuth tokens, and `.env` secrets are **never** committed or stored in this archive. Any accidental credentials must be redacted (`[REDACTED]`).

---

## 2. Directory Structure & File Naming

All prompt files live in this directory (`prompts/`) using ISO 8601 date prefixes followed by descriptive, kebab-case task slugs:

```text
prompts/
├── README.md                                    # Archive documentation and standard operating procedure
├── YYYY-MM-DD-<task-or-feature-name>.md         # Specific prompt record
```

### Examples:
- `2026-10-18-project-inspection-and-architecture.md`
- `2026-10-19-destination-data-integration.md`
- `2026-10-19-google-maps-directions.md`
- `2026-10-19-prompt-archive-setup.md`
- `2026-10-20-supabase-permissions-fix.md`

---

## 3. Required Document Schema

Every archived prompt file must follow this standardized schema:

```markdown
# [Task Title]

- **Date**: YYYY-MM-DD
- **Feature / Task**: [Feature or task name]
- **Status**: planned | in progress | completed | blocked
- **Related Prompts**: [Optional links to previous or superseding prompt files]

---

## Original Prompt

> [Exact, unedited text of the user prompt, preserved without changing requirements]

---

## Implementation Summary

- [Brief summary of the work executed once completed]

## Changed / Created Files

- `path/to/file1.ext`
- `path/to/file2.ext`

## Verification & Notes

- [Validation steps, tests executed, or outstanding manual steps]
```

---

## 4. Status Definitions

| Status | Meaning |
| :--- | :--- |
| `planned` | Prompt recorded and queued; implementation has not started. |
| `in progress` | Implementation actively underway. |
| `completed` | Feature/task implemented, verified, and files documented. |
| `blocked` | Implementation paused pending external credentials, clarification, or dependencies. |

---

## 5. Security & Secret Management

- **`.env` files**: All local environment files (`.env`, `.env.local`, `.env.*`) are excluded in `.gitignore`.
- **`.env.example`**: Kept at the project root with placeholder values to document required environment variables.
- **Redaction**: If a user prompt contains a live secret or key, it is redacted with `[REDACTED]` prior to archiving.
- **Git Backup**: The `prompts/` directory is tracked under Git alongside application code, ensuring prompt history is backed up to GitHub repositories together with the source code.

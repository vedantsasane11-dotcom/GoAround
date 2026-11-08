# Permanent Prompt Archive Setup for GoAround

- **Date**: 2026-10-19
- **Feature / Task**: Permanent Prompt Archive System & Secret Sanitization
- **Status**: completed
- **Related Prompts**:
  - [2026-10-19-destination-data-integration.md](./2026-10-19-destination-data-integration.md)
  - [2026-10-19-google-maps-directions.md](./2026-10-19-google-maps-directions.md)

---

## Original Prompt

```text
We need to establish a permanent prompt archive for the GoAround project.

### Goal
Whenever I provide a prompt for you to implement or modify something in GoAround, preserve the exact prompt in the project so we have a history and backup of our development instructions.

### Requirements

1. Create a `prompts/` directory in the project root, alongside `src/`, `package.json`, and other project files.

2. Create `prompts/README.md` explaining how the prompt archive is organized.

3. Save every substantial prompt I give you for project work, including feature implementation, bug fixes, UI changes, backend/database changes, and integrations. Save the original prompt text before beginning the requested implementation.

4. Use descriptive filenames with dates, for example:
   - `2026-10-19-google-maps-directions.md`
   - `2026-10-19-supabase-permissions-fix.md`
   - `2026-10-20-destination-data-integration.md`

5. Each archived prompt should contain:
   - Date
   - Feature or task name
   - Original prompt text, preserved without changing its requirements
   - Status: planned, in progress, completed, or blocked
   - A brief implementation result and relevant changed files, added after the task is completed

6. Archive the Google Maps Get Directions prompt we already discussed, using the original prompt text available in our conversation or development context. Do not invent missing prompt text; report it if you cannot recover the original.

7. For future substantial prompts, archive them before implementation. Do not overwrite previous prompts. If requirements change, save a new version or a new dated file and link it to the previous one.

8. Do not archive secrets, API keys, passwords, access tokens, private credentials, or the contents of `.env`. Redact any accidental secrets before saving.

9. Keep the prompt archive inside the Git repository so it can be backed up through GitHub alongside the source code.

10. Check `.gitignore` to make sure `.env` and other local secret files are excluded from Git. Keep `.env.example` with placeholder values so developers know which environment variables are required.

### Safety and scope
- Inspect the existing repository before making changes.
- Do not rewrite the application or change unrelated features.
- Do not delete existing project files or overwrite existing prompts.
- Do not commit or push changes automatically.
- At the end, report the files created, the Git status, and any issues preventing safe backup.

From now on, follow this prompt-archiving procedure for GoAround development work.
```

---

## Implementation Summary

1. **Created Archive Directory**: Initialized `prompts/` at the root of `GoAround`.
2. **Created README.md**: Established standard operating procedure, naming conventions, required document schema, status lifecycle, and strict secret protection rules in `prompts/README.md`.
3. **Audited & Created Environment Template**: Created `.env.example` with sanitized placeholders (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and verified `.gitignore` excludes `.env*` to prevent credential leakage.
4. **Isolated Project Git Repository**: Initialized isolated git repository for `GoAround` (`main` branch) to prevent Git from traversing up to `C:\Users\USER` and tracking home directory files. Verified `.env` and `node_modules/` are strictly ignored.
5. **Archived Historic & Queued Prompts**: Captured 2026-10-18 architecture inspection, 2026-10-19 destination data integration, this archive setup prompt, and prepared the Google Maps directions prompt file with status reporting.

## Changed / Created Files

- `prompts/README.md`
- `prompts/2026-10-18-project-inspection-and-architecture.md`
- `prompts/2026-10-19-destination-data-integration.md`
- `prompts/2026-10-19-google-maps-directions.md`
- `prompts/2026-10-19-prompt-archive-setup.md`
- `.env.example`
- `.git/` (project-level Git initialization)

## Verification & Notes

- `.env` confirmed ignored by Git status.
- Git repository isolated to `GoAround/`.
- No automated commits or pushes performed.

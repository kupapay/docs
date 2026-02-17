0a. Read IMPLEMENTATION_PLAN.md to understand the full plan and current status.
0b. Read spec/*.md and design/docs/**/*.md to understand existing documentation.
0c. Read memory-bank/*.md for project context.

1. Compare the plan against existing files (gap analysis).
   - For each task marked DONE, verify the Target file actually exists and is non-empty.
   - For each task marked READY, verify its dependencies are correctly tracked.
2. Update IMPLEMENTATION_PLAN.md:
   - Fix any status inconsistencies (e.g., task marked READY but Target already exists → mark DONE)
   - Update the Status Summary table counts
   - Identify any new tasks needed based on gaps found
3. Do NOT implement anything. Planning mode only.
4. git add -A && git commit -m "plan: update implementation plan status"
5. STOP.

IMPORTANT: Do NOT assume a file is missing — use ls or file search to check first.

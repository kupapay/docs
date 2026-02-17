0a. Read IMPLEMENTATION_PLAN.md.
0b. Read memory-bank/*.md for context.
0c. Read relevant spec/*.md files.

1. Find the FIRST task with Status: READY whose dependencies are all DONE.
2. Execute it following the exact Instructions in that task.
3. If the task says to use an agent (e.g., @specification, @gem-documentation-writer),
   follow the agent's instructions yourself — you ARE that agent for this iteration.
4. Write output to the exact Target path specified.
5. Run the Validate check. If it fails, fix the output.
6. Update IMPLEMENTATION_PLAN.md: change Status: READY → Status: DONE, add Completed: date.
7. git add -A && git commit -m "docs: [TASK-ID] [short description]"
8. STOP. Do not start the next task.

RULES:
- Read ONLY the Source files listed for that task.
- Write complete content, no placeholders or stubs.
- Include Mermaid diagrams where specified.
- Follow MkDocs Material conventions (admonitions, tabs, etc.).
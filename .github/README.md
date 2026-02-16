# KutaPay — AI Tooling Index

Resources sourced from [github/awesome-copilot](https://github.com/github/awesome-copilot) to accelerate architecture, security, and development workflows for KutaPay's fiscal compliance infrastructure.

## Plugins (12)

Full plugin bundles in `plugins/`. Each contains agents, prompts, and/or instructions that work together.

| Plugin | Purpose |
|--------|---------|
| `software-engineering-team` | Virtual engineering team — security reviewer, architect, technical writer, DevOps/CI, PM, UX designer, responsible AI |
| `project-planning` | Epic breakdown, implementation plans, technical spikes, task planning |
| `testing-automation` | TDD red/green/refactor cycle, Playwright testing |
| `database-data-management` | PostgreSQL and SQL Server review, optimization |
| `security-best-practices` | OWASP security review, accessibility, performance |
| `context-engineering` | Multi-file context mapping, refactor planning |
| `technical-spike` | Research unknowns — DGI API, crypto algorithms, hardware choices |
| `gem-team` | Multi-agent orchestration (researcher → planner → implementer → reviewer → docs) |
| `rug-agentic-workflow` | 3-agent workflow (orchestrator + SWE + QA) with quality gates |
| `edge-ai-tasks` | Task planning and research for intermediate-expert level tasks |
| `structured-autonomy` | Premium planning with thrifty implementation for autonomous sessions |
| `devops-oncall` | Dockerfile generation, incident triage, Azure diagnostics |

## Standalone Agents (7)

Individual agent files in `agents/`.

| Agent | Purpose |
|-------|---------|
| `specification.agent.md` | Generate fiscal API and USB protocol specifications |
| `adr-generator.agent.md` | Document architectural decisions (trust boundary, crypto, etc.) |
| `expert-cpp-software-engineer.agent.md` | Firmware and embedded MCU development |
| `blueprint-mode.agent.md` | Structured, rigorous workflow execution |
| `critical-thinking.agent.md` | Stress-test design assumptions |
| `devils-advocate.agent.md` | Challenge fiscal compliance decisions |
| `custom-agent-foundry.agent.md` | Build KutaPay-specific custom agents |

## Standalone Prompts (2)

Task-specific prompts in `prompts/`.

| Prompt | Purpose |
|--------|---------|
| `create-agentsmd.prompt.md` | Generate KutaPay's AGENTS.md |
| `copilot-instructions-blueprint-generator.prompt.md` | Auto-generate or refine copilot-instructions.md |

## Standalone Instructions (10)

Coding standards applied to matching file patterns. Located in `instructions/`.

| Instruction | Applies To | Purpose |
|-------------|-----------|---------|
| `security-and-owasp` | `*` | OWASP Top 10 secure coding rules |
| `code-review-generic` | `**` | Language-agnostic code review standards |
| `memory-bank` | `**` | Context persistence across coding sessions |
| `spec-driven-workflow-v1` | `**` | Requirements → design → tasks pipeline |
| `performance-optimization` | `*` | POS and API performance rules |
| `makefile` | `**/Makefile, ...` | GNU Make best practices |
| `cmake-vcpkg` | `**/*.cmake, ...` | C++ firmware builds with CMake/vcpkg |
| `shell` | `**/*.sh` | Shell scripting for deployment/build scripts |
| `object-calisthenics` | `**/*.{cs,ts,java}` | Clean domain model (invoice/tax engine) |
| `localization` | `**/*.md` | French/Lingala localization for DRC |

## Skills (2)

Agent skills with bundled assets in `skills/`.

| Skill | Purpose |
|-------|---------|
| `plantuml-ascii` | Generate PlantUML ASCII architecture diagrams |
| `excalidraw-diagram-generator` | Generate visual Excalidraw diagrams (includes 8 templates + helper scripts) |

## Hooks (2)

Automated workflows triggered during development. Located in `hooks/`.

| Hook | Purpose |
|------|---------|
| `session-auto-commit` | Auto-commits and pushes when a Copilot session ends |
| `session-logger` | Logs all session activity for audit trail (critical for security-sensitive dev) |

## Cookbook

Complete Copilot SDK cookbook in `cookbook/copilot-sdk/` with runnable recipes in 4 languages (Go, Python, Node.js/TypeScript, .NET):

| Recipe | Purpose |
|--------|---------|
| `ralph-loop` | Autonomous AI coding loops — agent picks tasks, implements, validates, commits, repeats |
| `error-handling` | Graceful error handling, timeouts, cleanup |
| `multiple-sessions` | Manage multiple independent conversations |
| `managing-local-files` | AI-powered file organization |
| `pr-visualization` | Interactive PR age charts via GitHub MCP Server |
| `persisting-sessions` | Save and resume sessions across restarts |
| `accessibility-report` | WCAG accessibility reports via Playwright MCP |

## Adding Language-Specific Resources

Tech stack is not yet decided. When chosen, add the relevant instruction files from awesome-copilot:

- **Python**: `python.instructions.md`
- **TypeScript**: `typescript-5-es2022.instructions.md`
- **Rust**: `rust.instructions.md`
- **Go**: `go.instructions.md`
- **React**: `reactjs.instructions.md`
- **Next.js**: `nextjs.instructions.md`
- **NestJS**: `nestjs.instructions.md`

See the [awesome-copilot instructions directory](https://github.com/github/awesome-copilot/tree/main/instructions) for the full list.

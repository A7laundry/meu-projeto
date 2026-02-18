# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

Synkra AIOS — an AI-Orchestrated meta-framework for full-stack development. It is a **greenfield project installation** (v4.2.13), not a traditional application. The actual product code to be developed lives in `docs/stories/` and is built through AI agent workflows.

## Commands

All scripts are defined in `.aios-core/package.json` (the framework core):

```bash
# From .aios-core/ directory
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # unit + integration
npm run test:unit   # jest tests/unit
npm run test:integration  # jest tests/integration
npm run build       # node ../tools/build-core.js
```

The framework CLI binary: `.aios-core/bin/aios-core.js`

## Architecture

### Directory Map

```
.aios-core/           # Framework runtime (48MB) — READ-ONLY, managed by AIOS
  constitution.md     # 6 inviolable principles (Principles I–VI)
  core-config.yaml    # Project configuration (type, PRD paths, feature flags)
  development/
    agents/           # 12 agent persona definitions (Markdown+YAML)
    tasks/            # 198 executable task workflows
    workflows/        # Multi-step workflow compositions
    templates/        # Document and code templates
    checklists/       # Validation checklists
  core/               # 26 subsystem modules (orchestration, permissions, elicitation, etc.)
  data/               # entity-registry.yaml, learned-patterns.yaml, workflow-patterns.yaml

.claude/              # Claude Code configuration
  CLAUDE.md           # Development rules (loaded as project instructions)
  rules/              # 6 rule files (agent-authority, story-lifecycle, workflow-execution, etc.)
  commands/AIOS/      # Skill definitions for Claude Code

docs/                 # Project documentation (created as stories are worked)
  stories/            # Development stories (source of all implementation work)
  prd/                # Product requirement shards
  architecture/       # Architecture shards
  qa/                 # QA gates and CodeRabbit reports
```

### Constitution Principles (`.aios-core/constitution.md`)

Six inviolable principles enforced via automated gates:

| # | Principle | Key Rule |
|---|-----------|----------|
| I | CLI First | All features work via CLI before any UI |
| II | Agent Authority | Each agent has exclusive operations (e.g., only @devops can `git push`) |
| III | Story-Driven | No code written without a story with acceptance criteria |
| IV | No Invention | Specs trace to FR-*, NFR-*, CON-*, or research findings only |
| V | Quality First | lint + typecheck + test + build must all pass before push |
| VI | Absolute Imports | Use `@/` alias, not relative `../../../` paths |

### Agent System

12 agents defined in `.aios-core/development/agents/`. Activated via `@agent-name` syntax.

| Agent | Role | Exclusive Authority |
|-------|------|---------------------|
| @devops (Gage) | DevOps/Release | `git push`, `gh pr create`, releases, MCP management |
| @dev (Dex) | Implementation | `git add`, `git commit`, code, story file updates |
| @pm (Morgan) | Product Manager | `*execute-epic`, `*create-epic`, spec pipeline |
| @po (Pax) | Product Owner | `*validate-story-draft`, story status transitions |
| @sm (River) | Story Manager | `*draft`, `*create-story` |
| @qa | QA | Quality verdicts, gate decisions |
| @architect (Aria) | Architecture | Tech selection, design decisions |
| @data-engineer (Dara) | Database | Schema DDL, RLS policies, migrations |
| @analyst | Research | Complexity assessment, research phase |
| @aios-master | Framework governance | Override agent boundaries |

### Task System

Tasks in `.aios-core/development/tasks/` are executable workflow units. Each defines inputs, outputs, pre/post-conditions, and elicitation points. Key tasks:

- `create-next-story.md` — @sm creates story from epic
- `validate-next-story.md` — @po runs 10-point checklist
- `dev-develop-story.md` — @dev implements (Interactive/YOLO/Pre-Flight modes)
- `qa-gate.md` — @qa runs 7 quality checks

### Primary Workflow (Story Development Cycle)

```
@sm *draft → @po *validate-story-draft → @dev *develop → @qa *qa-gate → @devops *push
Draft      →      Ready               →  InProgress    →  InReview    →  Done
```

### MCP Infrastructure

MCPs are managed exclusively by @devops:
- **playwright** — browser automation (direct in Claude Code)
- **desktop-commander** (docker-gateway) — Docker container operations
- **EXA**, **Context7**, **Apify** — run inside Docker via docker-gateway

See `.claude/rules/mcp-usage.md` for tool selection rules (prefer native Claude Code tools over docker-gateway for local operations).

## Key Configuration Files

- `.aios-core/core-config.yaml` — project type, PRD/architecture paths, feature flags
- `.aios-core/data/entity-registry.yaml` — IDS artifact registry (REUSE > ADAPT > CREATE)
- `.env` / `.env.example` — LLM providers, Supabase, GitHub token, integrations
- `.claude/settings.json` — Claude Code IDE settings

## IDS Principle (Incremental Development System)

Before creating any new artifact, consult `.aios-core/data/entity-registry.yaml`:
- **REUSE** (≥90% match): use as-is
- **ADAPT** (60–89%): modify ≤30% of original, document changes
- **CREATE** (<60%): justify with `evaluated_patterns`, `rejection_reasons`, register within 24h

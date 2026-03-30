# Claude Code Configuration - RuFlo V3

## Token Economy (Highest Priority — Always Enforced)

- **No preambles.** Never say "I'll now...", "Let me...", "I will...". Act immediately.
- **No post-task summaries** unless explicitly asked.
- **No restating** the user's request back to them.
- Read only the **specific lines needed** — always use `offset`+`limit` on files over 100 lines.
- **Never re-read** files already in context. Never read files you won't modify.
- Use **Grep over Read** for searching content. Use **Glob before Read** to confirm a file exists.
- Prefer **Edit over Write** — Edit sends only the diff; Write sends the full file.
- **One tool type per message** — batch all Reads together, all Edits together, all Bash together.
- Stop after the task is done. No follow-up suggestions unless asked.
- When reporting results, be **specific and brief** — no padding, no filler sentences.

## Behavioral Rules

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create *.md or README files
- NEVER save working files or tests to root
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- After spawning a swarm: STOP — do not check status, trust agents to return

## File Organization

Root is off-limits. Use: `/src` code · `/tests` tests · `/docs` docs · `/config` config · `/scripts` scripts · `/examples` examples

## Project Architecture

- Domain-Driven Design with bounded contexts
- Files under 500 lines
- Typed interfaces for all public APIs
- TDD London School (mock-first) for new code
- Event sourcing for state changes
- Input validation at system boundaries
- Swarm config: topology `hierarchical-mesh` · maxAgents `15` · memory `hybrid` · HNSW on · Neural on

## Build & Test

```bash
npm run build  # build
npm test       # test
npm run lint   # lint
```

- Run tests after every code change. Verify build before committing.

## Security

- No hardcoded keys, secrets, or credentials
- No .env commits
- Validate input at system boundaries; sanitize file paths
- Run `npx @claude-flow/cli@latest security scan` after security-related changes

## Concurrency — 1 Message = All Related Operations

- Batch ALL todos in ONE TodoWrite call (5-10+ items minimum)
- Spawn ALL agents in ONE message via Task tool
- Batch ALL file reads/writes/edits in ONE message
- Batch ALL Bash commands in ONE message

## Swarm Orchestration

- Init via CLI tools; execution via Task tool — never CLI alone
- MUST call CLI tools AND Task tool in ONE message for complex work
- `run_in_background: true` on all agent Task calls
- After spawning: STOP — no polling, no status checks — review results when they arrive

### Model Routing (ADR-026)

- **Tier 1** — Agent Booster (WASM): simple transforms (var→const, add types), $0, <1ms — skip LLM
- **Tier 2** — Haiku: low-complexity tasks (<30% complexity), ~$0.0002
- **Tier 3** — Sonnet/Opus: architecture, security, complex reasoning (>30%)
- Check `[AGENT_BOOSTER_AVAILABLE]` before spawning — use Edit directly if available

### Swarm Anti-Drift

- Topology: hierarchical · maxAgents: 8 · strategy: specialized · consensus: raft
- Shared memory namespace across all agents
- Frequent checkpoints via `post-task` hooks

## CLI Reference

Full CLI commands, agent types, and memory syntax: `.claude/docs/cli-reference.md`
MCP setup: `claude mcp add claude-flow -- npx -y @claude-flow/cli@latest`

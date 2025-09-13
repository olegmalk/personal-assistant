---
id: PA-005
title: API endpoint design and orchestration logic
priority: high
agent: core
created: 2025-09-13
---

## Description
Design API structure for ChatGPT integration with agent orchestration

## Requirements
- Single orchestrator endpoint accepting semi-structured queries
- Route to appropriate agent (tmux, second-brain, time)
- OpenAPI schema for ChatGPT Actions
- Response format standardization

## Context from Decisions
- No session management needed (single user)
- Tmux sessions manage their own Claude Code history
- Build locally first, manual ChatGPT testing

## Design Questions
1. Query parsing strategy
2. Agent selection logic
3. Error handling patterns
4. Response streaming vs batch
5. OpenAPI spec generation

## Notes
Separate planning session needed before implementation
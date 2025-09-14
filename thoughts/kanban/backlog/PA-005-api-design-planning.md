---
id: PA-005
title: Implement Diablo orchestrator endpoint
priority: high
agent: diablo
created: 2025-09-13
updated: 2025-01-14
---

## Description
Implement the Diablo orchestrator API endpoint that receives natural language from ChatGPT and routes to appropriate agents.

## Requirements
- Single `/chat` endpoint for natural language
- Route requests to Souei/Raphael/Shuna agents
- Manage conversation context in YAML
- Return structured responses
- Never make technical decisions (only route)

## Context from PA-006 Design
- Natural language interface
- No rigid structure required
- Context stored in `thoughts/orchestrator/context.yaml`
- Response format: `{"status": "...", "message": "..."}`
- OpenAPI spec already created

## Implementation Tasks
1. Create `/chat` endpoint in Elysia
2. Implement Claude Code SDK for Diablo
3. Context management system
4. Agent routing logic
5. Error handling

## Notes
Design already complete in PA-006. Ready for implementation.
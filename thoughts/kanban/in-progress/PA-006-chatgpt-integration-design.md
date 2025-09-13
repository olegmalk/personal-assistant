---
id: PA-006
title: ChatGPT Integration & Conversation Flow Design
priority: high
agent: core
created: 2025-09-13
---

## Description
Design the conversation flow and integration patterns between ChatGPT and the Personal Assistant API

## Key Design Points from User

### Explicit Invocation Pattern
- Not all ChatGPT requests go to API
- User explicitly triggers API calls with natural language:
  - "What tmux sessions available?"
  - "What is the status of session-x?"
  - "Tell the agent to [action]"

### Conversation Flow
1. User asks ChatGPT about local state
2. ChatGPT invokes API to get information
3. ChatGPT presents info to user
4. User may request action through ChatGPT
5. ChatGPT sends action to API
6. API confirms acceptance or asks clarification
7. ChatGPT relays confirmation/questions back

### Agent Architecture
- **Personal Assistant Agent**: Main orchestrator running in Claude Code session
  - Maintains conversation context
  - Tracks sub-agent calls and responses
  - Makes decisions (not just data relay)

### Sub-Agents
- **tmux agent**: Manages tmux sessions
- **second-brain agent**: Needs natural naming for easy invocation
- **time agent**: ROI calculations

### Context Management
- Personal Assistant maintains minimal conversation history
- Tracks which sub-agents were called and their responses
- Special endpoint to clear context on user request
- Reactive mode (no proactive suggestions)

## Design Decisions ✅

1. **Agent Names** (Tensura themed):
   - **Diablo**: Claude Code orchestrator
   - **Souei**: Tmux intelligence & command
   - **Raphael**: Knowledge/second brain
   - **Shuna**: Time/ROI management

2. **API Response Format**: Structured JSON with agent/action/result/data
3. **Context Scope**: Last 10 exchanges per agent, 1-hour timeout
4. **Error Handling**: Via result field and human-readable messages
5. **Action Confirmation**: Write ops for Souei, spawning for Diablo
6. **Sub-Agent Routing**: Natural language patterns documented
7. **State Persistence**: thoughts/orchestrator/context.json (1MB rotating)

**Decision documented in**: thoughts/kanban/decisions/2025-01-13-chatgpt-integration-architecture.md

## Technical Requirements
- OpenAPI spec for ChatGPT Actions
- Request/response schemas for each agent type
- Context storage mechanism
- Clear error messages for ChatGPT to interpret

## Notes
Dedicated design session needed to detail:
- Exact conversation patterns
- API endpoint structure
- Context management strategy
- Sub-agent communication protocol
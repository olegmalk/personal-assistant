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

## Design Questions to Address

1. **Second Brain Naming**: What natural name for knowledge agent?
2. **API Response Format**: Structure for confirmations/clarifications
3. **Context Scope**: How much history to maintain?
4. **Error Handling**: How to handle agent failures gracefully?
5. **Action Confirmation**: Which actions need explicit confirmation?
6. **Sub-Agent Routing**: Natural language patterns for each agent
7. **State Persistence**: How to maintain context across API restarts?

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
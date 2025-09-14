# ChatGPT Integration Architecture Decision

**Date**: 2025-09-13
**Status**: Approved
**Ticket**: PA-006

## Context

Designing the integration between ChatGPT and the Personal Assistant API to enable natural language control of local development environment through specialized agents.

## Decision

### Agent Architecture & Naming

Using Tensura (That Time I Got Reincarnated as a Slime) themed agents for clarity and memorable interaction:

1. **Diablo** - Claude Code Orchestrator
   - Manages different Claude Code instances across tmux sessions
   - Coordinates complex multi-agent operations
   - Routes requests to appropriate sub-agents
   - Maintains conversation context

2. **Souei** - Tmux Intelligence & Command Agent
   - Monitors all tmux sessions (intelligence gathering)
   - Sends commands to specific sessions (directing operatives)
   - Reports session status and output
   - Manages the "shadow network" of terminals

3. **Raphael** - Knowledge/Second Brain Agent
   - Stores and retrieves project knowledge
   - Answers questions from accumulated wisdom
   - Manages the knowledge base
   - Provides analytical insights

4. **Shuna** - Time/ROI Management Agent
   - Tracks time spent on tasks
   - Calculates ROI for activities
   - Manages resource allocation insights
   - Provides value analysis

### API Response Format

```json
{
  "agent": "diablo|souei|raphael|shuna",
  "action": "query|execute|confirm",
  "result": "success|pending|needs_confirmation|error",
  "data": {
    // Agent-specific response data
  },
  "message": "Human-readable message for ChatGPT",
  "next_actions": ["optional", "suggested", "actions"],
  "context_id": "session-uuid"
}
```

### Context Management

**Diablo** maintains conversation context with:
- Last 10 exchanges per agent
- Auto-clear after 1 hour idle
- Explicit `/clear-context` endpoint
- Persistence in `thoughts/orchestrator/context.json`
- Max 1MB file size with auto-rotation

### Action Confirmation Rules

- **Diablo**: Confirms before spawning new Claude Code instances
- **Souei**: Confirms all write operations (commands to tmux)
- **Raphael**: Confirms only delete operations
- **Shuna**: No confirmations (read-only analytics)

### Natural Language Routing Patterns

**Diablo Triggers**:
- "ask the agent to..."
- "what's the status of agent..."
- "coordinate..."
- "spawn Claude Code for..."

**Souei Triggers**:
- "check tmux sessions"
- "what's running in terminal..."
- "send command to session..."
- "show output from..."

**Raphael Triggers**:
- "what do we know about..."
- "remember that..."
- "find notes on..."
- "search knowledge for..."

**Shuna Triggers**:
- "ROI for..."
- "time spent on..."
- "value analysis of..."
- "track time for..."

### OpenAPI Endpoints

```yaml
/orchestrate:
  post:
    description: Main entry point for Diablo

/agents/souei:
  get: List tmux sessions
  post: Send command to session

/agents/raphael:
  get: Query knowledge
  post: Store knowledge

/agents/shuna:
  get: Get time/ROI metrics
  post: Track time entry

/context:
  get: Retrieve current context
  delete: Clear conversation context
```

## Consequences

### Positive
- Clear agent responsibilities with memorable names
- Natural conversation flow through Diablo's orchestration
- Explicit user control over actions
- Traceable context and decision history

### Negative
- Requires users to learn agent names/roles
- Additional orchestration layer adds complexity
- Context persistence needs careful management

## Implementation Notes

1. Start with Diablo orchestrator and basic routing
2. Implement Souei for tmux control (highest immediate value)
3. Add Raphael for knowledge management
4. Integrate Shuna for time tracking

## References
- PA-006: ChatGPT Integration Design ticket
- VISION.md: Overall architecture vision
- Tensura character roles for agent naming consistency
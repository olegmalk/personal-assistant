# Personal Assistant API - Vision

## Core Concept
A personal orchestration layer between ChatGPT and my local development environment, allowing natural language control of tmux sessions, knowledge management, and time optimization.

## Primary Workflow
```
Me → ChatGPT → Personal Assistant API → Sub-Agents → Local Resources
```

## Architecture Overview

### Personal Assistant Agent (Orchestrator)
- **Core**: LLM (Claude) with persistent conversation context
- Runs as dedicated Claude Code session
- Routes requests to appropriate sub-agents
- Makes autonomous decisions based on context
- Maintains conversation history across API calls
- Context reset via dedicated `/api/clear-context` endpoint
- Provides confirmations and clarification requests back to ChatGPT

### Sub-Agents

#### 1. tmux Agent
- **Purpose**: Manage tmux sessions (primarily Claude Code sessions)
- **Capabilities**:
  - List available sessions
  - Read session output/status
  - Send commands to sessions
  - Track context across sessions

#### 2. Second Brain Agent (naming TBD)
- **Purpose**: Knowledge management and retrieval
- **Capabilities**:
  - Store insights/learnings
  - Search existing knowledge
  - Organize with metadata
  - Version tracking

#### 3. Time/ROI Agent
- **Purpose**: Optimize time usage and activity ROI
- **Capabilities**:
  - Calculate free time availability
  - Score activities by ROI
  - Track actual vs planned time
  - Identify high-value time slots

## Interaction Model

### Explicit Invocation
- User explicitly requests API interaction through ChatGPT
- Natural language patterns trigger specific agents
- Examples:
  - "What tmux sessions are available?"
  - "What's the status of session-x?"
  - "Save this insight to my second brain"
  - "How much free time do I have today?"

### Conversation Flow
1. User asks ChatGPT question requiring local info
2. ChatGPT recognizes pattern and calls API
3. API routes to appropriate sub-agent
4. Sub-agent executes and returns data
5. API formats response for ChatGPT
6. ChatGPT presents information naturally
7. User may request follow-up actions
8. API confirms or requests clarification

### Context Management
- LLM (Claude) maintains conversation context across API calls
- Persistent memory of all interactions within session
- Tracks sub-agent calls and their responses
- Context cleared only via explicit `/api/clear-context` endpoint
- Enables multi-turn conversations through ChatGPT
- Reactive only (no proactive suggestions)

## Key Principles

1. **Invisible Infrastructure**: API complexity hidden behind natural conversation
2. **Explicit Control**: User maintains full control over when API is invoked
3. **Single User**: No multi-tenancy, optimized for personal use
4. **Local First**: All data and processing on personal VM
5. **LLM-Powered Orchestration**: Claude maintains persistent context across all API calls
6. **Autonomous Decision Making**: LLM makes decisions, not just data relay
7. **Stateful Conversations**: Context persists until explicitly cleared

## Success Metrics
- Seamless ChatGPT conversation without mentioning "API"
- Quick access to development session state
- Efficient knowledge capture and retrieval
- Clear visibility into time allocation
- Reduced context switching between tools

## Next Steps
1. Design ChatGPT integration patterns (PA-006)
2. Implement tmux session reader (PA-001)
3. Implement tmux command sender (PA-002)
4. Design second brain structure (PA-003)
5. Build time ROI calculator (PA-004)

## Open Questions
- Natural name for second brain agent
- Optimal context retention period
- Action confirmation thresholds
- Integration with existing tools
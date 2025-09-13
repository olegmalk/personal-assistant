# Decision: Claude Code SDK Language Selection

**Date**: 2025-09-13
**Status**: Approved
**Stakeholders**: Self

## Decision
Use **TypeScript SDK** (`@anthropic/claude-code-sdk`) for Personal Assistant API

## Context
Need to integrate Claude Code as the orchestrator LLM for the Personal Assistant API. Claude Code SDK provides programmatic control over Claude with persistent context management.

## Options Considered

### 1. TypeScript SDK (chosen)
- **NPM Package**: `@anthropic/claude-code-sdk`
- Native TypeScript support with type safety
- Perfect fit with Bun/Elysia stack
- Seamless integration with existing codebase

### 2. Python SDK
- Good for data science workflows
- Would require separate Python service
- Additional complexity for no benefit

### 3. Headless Mode (CLI)
- Good for bash scripts
- Lacks programmatic control needed
- Would require process spawning overhead

## Decision Factors

### Why TypeScript SDK
- **Stack Alignment**: Already using Bun + TypeScript
- **Type Safety**: Full TypeScript types for Claude Code operations
- **Performance**: Direct in-process execution vs subprocess spawning
- **Tool Integration**: Native support for all Claude Code tools
- **Context Management**: Built-in persistent conversation handling

### Key Features Available
- `query()` function for LLM interactions
- Streaming and non-streaming modes
- Tool permissions control (Read, Write, Bash, etc.)
- Hook system for lifecycle events
- Automatic context compaction
- MCP server support

## Implementation Notes

### Installation
```bash
bun add @anthropic/claude-code-sdk
```

### Basic Usage Pattern
```typescript
import { query } from '@anthropic/claude-code-sdk'

// Personal Assistant orchestrator
const response = await query({
  prompt: userRequest,
  options: {
    cwd: '/home/vmuser/dev/personal-assistant',
    tools: ['Read', 'Write', 'Bash', 'Task'],
    systemPrompt: 'You are the Personal Assistant orchestrator...'
  }
})
```

### Context Persistence
- SDK maintains conversation context automatically
- Implement `/api/clear-context` to reset SDK session
- Each API instance maintains its own Claude context

## Tradeoffs Accepted
- Dependency on Anthropic SDK updates
- Need to manage API key securely
- Context window limitations (managed by SDK)

## Benefits Achieved
- Single language stack (TypeScript throughout)
- Type-safe Claude Code integration
- Built-in context management
- Rich tool ecosystem access
- Production-ready error handling
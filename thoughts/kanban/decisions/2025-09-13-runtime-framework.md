# Decision: Runtime & Framework Selection

**Date**: 2025-09-13
**Status**: Approved
**Stakeholders**: Self (single-user system)

## Decision
Use **Bun** runtime with **Elysia** framework

## Context
Building personal assistant API to orchestrate:
- tmux session management
- Second brain (knowledge base)
- Time/ROI optimization
- ChatGPT custom GPT integration

## Options Considered

### Runtime
1. **Node.js**: Mature, everywhere, slow
2. **Deno**: Secure, good DX, smaller ecosystem
3. **Bun**: Fast, batteries included, growing ecosystem

### Framework
1. **Hono**: Multi-runtime, mature, unopinionated
2. **Elysia**: Bun-native, opinionated, batteries included

## Decision Factors

### Why Bun
- Fastest JS runtime
- Native TypeScript
- Built-in SQLite, test runner, bundler
- Great for single-machine deployment
- PM2 compatible for uptime

### Why Elysia over Hono
- **Bun-native optimizations**: Direct syscalls, no compatibility layers
- **Batteries included**: Validation, WebSocket, OpenAPI built-in
- **Opinionated**: Faster development for solo project
- **Type safety**: Automatic inference, no manual typing

### Tradeoffs Accepted
- Less mature than Hono (acceptable for personal project)
- Bun lock-in (fine, not planning multi-runtime)
- Smaller community (manageable for single developer)

## Implementation Notes
- Use Elysia's built-in validation instead of Zod
- Leverage native WebSocket for real-time features
- Use built-in OpenAPI generation for ChatGPT integration
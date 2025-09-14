# Decision Log Index

## Format
Each decision gets a file: `YYYY-MM-DD-{topic}.md`

## Decisions

### 2025-09-13: Runtime & Framework
**Choice**: Bun + Elysia
**Reason**: Bun-native performance, batteries included, opinionated
**File**: [2025-09-13-runtime-framework.md](./2025-09-13-runtime-framework.md)

### 2025-09-13: SSL Certificate Strategy
**Choice**: Let's Encrypt + certbot
**Reason**: Free, trusted, Elysia native SSL support
**File**: [2025-09-13-ssl-certificate.md](./2025-09-13-ssl-certificate.md)

### 2025-09-13: Claude Code SDK Language
**Choice**: TypeScript SDK
**Reason**: Type safety, stack alignment, built-in context management
**File**: [2025-09-13-claude-sdk-selection.md](./2025-09-13-claude-sdk-selection.md)

### 2025-09-13: ChatGPT Integration Architecture
**Choice**: Agent-based architecture with Tensura naming
**Reason**: Clear responsibilities, memorable names, natural conversation flow
**File**: [2025-09-13-chatgpt-integration-architecture.md](./2025-09-13-chatgpt-integration-architecture.md)
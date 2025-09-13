# Claude Code TypeScript SDK Documentation

**Fetched**: 2025-09-13
**Source**: https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript
**Updated**: 2025-09-13 (Added Max subscription integration details)

## Installation

```bash
npm install @anthropic-ai/claude-code
# or
bun add @anthropic-ai/claude-code
```

**Note**: The actual npm package is `@anthropic-ai/claude-code`, not `@anthropic/claude-code-sdk`

## Core API

### `query()` Function

Primary method for interacting with Claude Code. Returns an async generator that streams messages.

```typescript
import { query } from '@anthropic/claude-code-sdk'

function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query
```

#### Basic Usage

```typescript
const response = await query({
  prompt: "Write a function to calculate fibonacci numbers",
  options: {
    model: 'claude-3-5-sonnet-20241022',
    cwd: process.cwd(),
  }
})

// Get full response
const result = await response.result()
console.log(result.text)
```

#### Streaming Usage

```typescript
for await (const message of response) {
  if (message.type === 'text') {
    console.log(message.content)
  }
}
```

### Configuration Options

```typescript
interface Options {
  // Model selection
  model?: string;

  // Working directory
  cwd?: string;

  // Environment variables
  env?: Record<string, string>;

  // System prompt
  systemPrompt?: string;

  // Permission mode
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';

  // Tool restrictions
  allowedTools?: string[];

  // MCP server configuration
  mcpServers?: McpServerConfig[];

  // Hooks for lifecycle events
  hooks?: Hooks;

  // Runtime executable
  executable?: 'node' | 'bun' | 'deno';
}
```

## Tools

### Built-in Tools

The SDK provides access to Claude Code's built-in tools:

- **Bash**: Execute shell commands
- **Read**: Read file contents
- **Write**: Write files
- **Edit**: Edit existing files
- **MultiEdit**: Multiple edits in one operation
- **Glob**: File pattern matching
- **Grep**: Search file contents
- **Task**: Spawn sub-agents
- **WebSearch**: Search the web
- **WebFetch**: Fetch web content
- **TodoWrite**: Manage task lists
- **NotebookEdit**: Edit Jupyter notebooks

### Tool Permissions

Control which tools are available:

```typescript
const response = await query({
  prompt: "Analyze this codebase",
  options: {
    allowedTools: ['Read', 'Glob', 'Grep'],  // Read-only access
  }
})
```

## Hooks System

Hooks allow custom callbacks at various lifecycle points:

```typescript
interface Hooks {
  onToolExecution?: (info: ToolExecutionInfo) => void | Promise<void>;
  onMessage?: (message: Message) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
}
```

### Example with Hooks

```typescript
const response = await query({
  prompt: "Create a new React component",
  options: {
    hooks: {
      onToolExecution: async (info) => {
        console.log(`Executing tool: ${info.toolName}`);
        console.log(`Arguments:`, info.arguments);
      },
      onMessage: (message) => {
        if (message.type === 'text') {
          console.log(`Claude: ${message.content}`);
        }
      },
      onError: (error) => {
        console.error('Error occurred:', error);
      },
      onComplete: () => {
        console.log('Query completed');
      }
    }
  }
})
```

## MCP (Model Context Protocol) Support

### Creating Custom Tools

```typescript
import { tool } from '@anthropic/claude-code-sdk'
import { z } from 'zod'

const customTool = tool(
  'database_query',
  'Execute a database query',
  {
    query: z.string().describe('SQL query to execute'),
    database: z.string().optional().describe('Database name')
  },
  async (args) => {
    // Tool implementation
    const result = await executeQuery(args.query, args.database);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    };
  }
)
```

### Creating MCP Server

```typescript
import { createSdkMcpServer } from '@anthropic/claude-code-sdk'

const mcpServer = createSdkMcpServer({
  name: 'custom-tools',
  version: '1.0.0',
  tools: [customTool]
})

// Use in query
const response = await query({
  prompt: "Query the user database",
  options: {
    mcpServers: [mcpServer]
  }
})
```

## Advanced Patterns

### Conversation Context

The SDK maintains conversation context automatically:

```typescript
// First query
const response1 = await query({
  prompt: "Create a function to sort an array"
})

// Follow-up query (context maintained)
const response2 = await query({
  prompt: "Now add error handling to it"
})
```

### Planning Mode

Use planning mode to get a plan without execution:

```typescript
const response = await query({
  prompt: "Refactor this application",
  options: {
    permissionMode: 'plan'  // Won't execute, just plans
  }
})
```

### Auto-Accept Edits

Bypass confirmation prompts for file edits:

```typescript
const response = await query({
  prompt: "Fix all linting errors",
  options: {
    permissionMode: 'acceptEdits'  // Auto-accept all edits
  }
})
```

## Error Handling

```typescript
try {
  const response = await query({
    prompt: "Complex task",
    options: { /* ... */ }
  })

  const result = await response.result()
} catch (error) {
  if (error.code === 'CONTEXT_LIMIT_EXCEEDED') {
    // Handle context limit
  } else if (error.code === 'TOOL_EXECUTION_FAILED') {
    // Handle tool failure
  }
}
```

## Result Methods

The Query object provides several methods to retrieve results:

```typescript
const response = query({ prompt: "..." })

// Get complete result
const fullResult = await response.result()
console.log(fullResult.text)           // Full text response
console.log(fullResult.toolCalls)      // Tool executions
console.log(fullResult.messages)       // All messages

// Get only text
const text = await response.text()

// Get raw messages
const messages = await response.messages()
```

## Authentication

### Using Max/Pro Subscription (No API Key Required)

**The SDK automatically uses your Claude Code CLI authentication!** If you have Claude Code CLI authenticated with your Max or Pro subscription, the SDK will use it without needing an API key.

```typescript
import { query } from '@anthropic-ai/claude-code';

// No API key needed - uses Claude Code subscription
const response = query({
  prompt: "What is 2 + 2?",
  options: {
    // Will use your Max subscription's Opus 4 model automatically
  }
});

for await (const message of response) {
  if (message.type === 'result') {
    console.log('Answer:', message.result); // "4"
  }
}
```

When using subscription auth:
- `apiKeySource` will be `"none"`
- Models available based on your subscription (Opus 4 for Max)
- Usage counts against your 5-hour rolling limit
- Cost shown but charged to subscription, not billed separately

### Using API Key (Alternative)

If you prefer to use an API key instead:
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

Optional configuration:
```bash
export CLAUDE_CODE_MODEL="claude-3-5-sonnet-20241022"
export CLAUDE_CODE_CWD="/path/to/project"
```

## Best Practices

1. **Context Management**: The SDK handles context automatically, but be mindful of context limits
2. **Tool Permissions**: Restrict tools to minimum necessary for security
3. **Error Handling**: Always implement proper error handling for production
4. **Streaming**: Use streaming for real-time feedback in interactive applications
5. **Hooks**: Leverage hooks for logging, monitoring, and debugging

## TypeScript Types

Key types exported by the SDK:

```typescript
import type {
  Query,
  Options,
  Hooks,
  ToolExecutionInfo,
  Message,
  SDKUserMessage,
  CallToolResult,
  PermissionMode
} from '@anthropic/claude-code-sdk'
```

## Limitations

- Context window limits apply (managed automatically by SDK)
- Some tools require specific permissions
- MCP servers must be configured before use
- Rate limits apply based on API plan
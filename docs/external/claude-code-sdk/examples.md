# Claude Code SDK Examples

**Created**: 2025-09-13

## Basic Usage with Max Subscription

### Simple Query

```typescript
#!/usr/bin/env bun

import { query } from '@anthropic-ai/claude-code';

async function simpleQuery() {
  const response = query({
    prompt: "What is 2 + 2?",
    options: {
      permissionMode: 'plan', // Use plan mode to avoid file operations
    }
  });

  for await (const message of response) {
    if (message.type === 'result') {
      console.log('Answer:', message.result);
    }
  }
}

simpleQuery();
```

### Checking Authentication Status

```typescript
import { query } from '@anthropic-ai/claude-code';

async function checkAuth() {
  const response = query({
    prompt: "Test",
    options: {
      permissionMode: 'plan',
    }
  });

  for await (const message of response) {
    if (message.type === 'system' && message.subtype === 'init') {
      console.log('API Key Source:', message.apiKeySource); // "none" for subscription
      console.log('Model:', message.model); // "claude-opus-4-20250514" for Max
      console.log('Available tools:', message.tools);
    }
  }
}
```

### Processing Messages

```typescript
import { query } from '@anthropic-ai/claude-code';

async function processMessages() {
  const response = query({
    prompt: "Explain async iterators in TypeScript",
    options: {
      permissionMode: 'plan',
    }
  });

  for await (const message of response) {
    switch (message.type) {
      case 'system':
        if (message.subtype === 'init') {
          console.log('Session initialized:', message.session_id);
        }
        break;

      case 'assistant':
        // Assistant's response chunks
        if (message.message?.content) {
          for (const content of message.message.content) {
            if (content.type === 'text') {
              console.log('Claude:', content.text);
            }
          }
        }
        break;

      case 'result':
        console.log('Final result:', message.result);
        console.log('Duration:', message.duration_ms, 'ms');
        console.log('Tokens used:', message.usage);
        break;
    }
  }
}
```

### With File Operations

```typescript
import { query } from '@anthropic-ai/claude-code';

async function fileOperations() {
  const response = query({
    prompt: "Read the package.json file and tell me the project name",
    options: {
      cwd: '/home/vmuser/dev/personal-assistant',
      allowedTools: ['Read'], // Limit to read-only
    }
  });

  for await (const message of response) {
    if (message.type === 'result') {
      console.log('Project info:', message.result);
    }
  }
}
```

### Error Handling

```typescript
import { query } from '@anthropic-ai/claude-code';

async function withErrorHandling() {
  try {
    const response = query({
      prompt: "Complex task",
      options: {
        permissionMode: 'plan',
      }
    });

    for await (const message of response) {
      if (message.type === 'error') {
        console.error('Error occurred:', message);
      }
      if (message.type === 'result' && message.is_error) {
        console.error('Task failed:', message.result);
      }
    }
  } catch (error) {
    console.error('Query failed:', error);
  }
}
```

## Personal Assistant Integration Example

```typescript
import { query } from '@anthropic-ai/claude-code';
import { Elysia } from 'elysia';

const app = new Elysia()
  .post('/api/agent', async ({ body, headers }) => {
    // Check API key
    const apiKey = headers['x-api-key'];
    const validKey = process.env.API_KEY;
    if (!apiKey || apiKey !== validKey) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create Claude Code query with user's request
    const response = query({
      prompt: body.prompt,
      options: {
        cwd: process.cwd(),
        permissionMode: 'plan', // Start in plan mode for safety
        systemPrompt: `You are the Personal Assistant orchestrator.
          Route requests to appropriate sub-agents:
          - tmux: Session management
          - second-brain: Knowledge storage
          - time: ROI calculations`,
      }
    });

    // Collect full response
    let result = '';
    for await (const message of response) {
      if (message.type === 'result') {
        result = message.result;
      }
    }

    return {
      response: result,
      timestamp: new Date().toISOString()
    };
  })
  .listen(11111);
```

## Notes

- The SDK uses your Claude Code CLI authentication automatically
- No API key needed when Claude Code is authenticated
- Usage counts against your subscription limits (5-hour rolling window)
- Models available depend on your subscription tier (Max gets Opus 4)
- Cost is shown but charged to subscription, not billed separately
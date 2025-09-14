---
id: PA-001
title: Implement Souei tmux session management agents
priority: high
agent: souei
created: 2025-09-13
updated: 2025-01-14
---

## Description
Implement Souei agents - one instance per tmux session (alpha/beta/gamma) - with full monitoring and control capabilities.

## Requirements

### Session Monitoring
- List session status and running processes
- Read current pane output
- Monitor command execution results
- Provide intelligent analysis of output (not just raw data)

### Command Execution
- Send commands to Claude Code orchestrator in session
- Execute shell commands directly when needed
- Handle multi-round conversations with orchestrator
- Support special keys (Enter, Ctrl-C, etc.)
- Intelligent command decisions based on user intent

### Notification System
- Send notifications via ntfy.sh when user input needed
- Use session-specific channels
- Never include sensitive information in notifications
- Can request but never expose passwords/secrets

## Context
- Three Souei instances (one per session)
- Each instance manages only its own session
- Autonomously decides how to fulfill user requests
- Works with Claude Code orchestrator in each session
- Called by Diablo to handle tmux-related requests

## Technical Notes
- Use `tmux capture-pane` for reading
- Use `tmux send-keys` for commands
- Parse and analyze output intelligently
- Handle escape sequences
- Support command sequencing for conversations
- Implement notification system with security rules

## Implementation Approach
1. Create base Souei class with tmux capabilities
2. Instantiate three instances (alpha, beta, gamma)
3. Implement intelligent analysis and decision-making
4. Add multi-round conversation support
5. Integrate notification system
---
id: PA-002
title: Implement Souei's tmux command execution capability
priority: high
agent: souei
created: 2025-09-13
updated: 2025-01-14
---

## Description
Implement the command execution functionality that Souei instances need to control their assigned sessions (alpha/beta/gamma).

## Requirements
- Send commands to Claude Code orchestrator in session
- Execute shell commands directly when needed
- Handle multi-round conversations with orchestrator
- Support special keys (Enter, Ctrl-C, etc.)
- Intelligent command decisions based on user intent

## Context
- Part of Souei's implementation (one instance per session)
- Souei autonomously decides what commands to run
- Must support dialogue with Claude Code orchestrator
- Each Souei instance only controls its own session

## Technical Notes
- Use `tmux send-keys`
- Escape special characters properly
- Handle command sequencing for conversations
- Support both direct commands and orchestrator interactions
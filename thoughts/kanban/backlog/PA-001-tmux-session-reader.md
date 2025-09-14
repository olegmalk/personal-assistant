---
id: PA-001
title: Implement Souei's tmux session reading capability
priority: high
agent: souei
created: 2025-09-13
updated: 2025-01-14
---

## Description
Implement the tmux session reading functionality that Souei instances need to monitor their assigned sessions (alpha/beta/gamma).

## Requirements
- List session status and running processes
- Read current pane output
- Monitor command execution results
- Provide intelligent analysis of output (not just raw data)

## Context
- Part of Souei's implementation (one instance per session)
- Souei needs this to provide intelligence to Diablo
- Must work with Claude Code orchestrator in each session

## Technical Notes
- Use `tmux capture-pane` for reading
- Parse and analyze output intelligently
- Handle escape sequences
- Each Souei instance only monitors its own session
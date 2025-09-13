---
id: PA-001
title: Implement tmux session reader
priority: high
agent: tmux
created: 2025-09-13
---

## Description
Create agent to read output from existing tmux sessions

## Requirements
- List available sessions
- Read current pane content
- Handle multiple panes
- Return structured output

## Technical Notes
- Use `tmux capture-pane` for reading
- Parse session/window/pane hierarchy
- Handle escape sequences
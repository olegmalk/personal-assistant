---
id: PA-002
title: Implement tmux command sender
priority: high
agent: tmux
created: 2025-09-13
---

## Description
Send commands/text to specific tmux sessions

## Requirements
- Target specific session/window/pane
- Send keys/commands
- Handle special keys (Enter, Ctrl-C, etc.)
- Queue commands if needed

## Technical Notes
- Use `tmux send-keys`
- Escape special characters
- Add delay between commands if needed
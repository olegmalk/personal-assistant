# Agent Prompts Documentation

This directory contains the system prompts for each agent in the Personal Assistant system.

## Agent Files
- `diablo.md` - Claude Code orchestrator (Sonnet 4)
- `souei.md` - Tmux intelligence & command agent
- `raphael.md` - Knowledge/second brain agent
- `shuna.md` - Time/ROI management agent

## Prompt Structure
Each agent prompt contains:
1. Role definition
2. Core responsibilities
3. Operating rules
4. Context management approach
5. Communication patterns
6. Example interactions

## Testing
Prompts can be tested by:
1. Direct invocation in Claude Code
2. API endpoint testing
3. ChatGPT integration testing

## Updates
When updating prompts:
1. Test in isolation first
2. Document changes in git commit
3. Update this README if structure changes
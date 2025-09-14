# Active Memory - Personal Assistant Project

**Last Updated**: 2025-09-14
**Session Focus**: ChatGPT integration design and architecture refinement

## 🎯 Current Focus
- PA-006 ChatGPT integration design - DONE
- Ready to implement Diablo orchestrator endpoint
- All agent prompts documented and simplified

## ✅ Recently Completed (Last 7 Days)
- [x] **2025-09-13**: Git repository initialized
- [x] **2025-09-13**: Bun + Elysia framework setup
- [x] **2025-09-13**: SSL certificate for b.mlkv.org configured
- [x] **2025-09-13**: PM2 configured with auto-restart
- [x] **2025-09-13**: Secure API key implementation
- [x] **2025-09-13**: GitHub repository created and pushed
- [x] **2025-09-13**: Created VISION.md with architecture overview
- [x] **2025-09-13**: Selected TypeScript SDK for Claude Code integration
- [x] **2025-09-13**: Discovered SDK works with Max subscription (no API key needed!)
- [x] **2025-09-13**: Established external docs pattern in docs/external/
- [x] **2025-09-13**: Updated all agents with documentation requirements
- [x] **2025-09-13**: Designed ChatGPT integration architecture with Tensura agents
- [x] **2025-09-13**: Created agent prompts (Diablo, Souei, Raphael, Shuna)
- [x] **2025-09-13**: Defined natural language API interface
- [x] **2025-09-13**: Updated OpenAPI spec for ChatGPT Actions
- [x] **2025-09-14**: Refined all agent prompts (removed confusing examples)
- [x] **2025-09-14**: Added Souei multi-round conversation & notification capabilities
- [x] **2025-09-14**: Clarified Raphael scope (no troubleshooting/observability)
- [x] **2025-09-14**: Consolidated backlog tickets (one per agent)

## 🚀 Trajectory (Next Steps)
1. **Immediate**: Implement Diablo orchestrator endpoint
2. **Next**: Set up Claude Code SDK for agent instances
3. **Following**: Create Souei instances for tmux sessions
4. **Then**: Test ChatGPT integration end-to-end

## 📝 Context Notes
- **Domain**: b.mlkv.org:11111
- **API Key**: Stored in .env (256-bit secure)
- **Architecture**: LLM orchestrator with persistent context
- **Claude Code SDK**: Uses Max subscription, no API key needed
- **Documentation**: External libs must be documented in docs/external/
- **Agents**: Diablo (orchestrator), Souei (tmux), Raphael (knowledge), Shuna (time/ROI)
- **API Design**: Single natural /chat endpoint, YAML context storage

## 🔄 Archive Routine
When this section gets too large (>20 items), move completed items older than 7 days to `thoughts/kanban/archive/YYYY-MM-archive.md`

## 💭 Open Questions
- How should ChatGPT structure queries to the agent?
- Which tmux sessions need management?
- What metadata should second brain entries contain?

---
*This file maintains continuity between Claude sessions. Update at session start/end.*
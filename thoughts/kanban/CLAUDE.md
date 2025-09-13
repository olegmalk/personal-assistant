# Personal Assistant Kanban Workflow

## Ticket States
- **backlog**: Ideas and future work not ready to start
- **todo**: Ready to implement, requirements clear
- **in-progress**: Currently being worked on
- **blocked**: Waiting on external dependency or decision
- **testing**: Implementation complete, needs verification
- **done**: Fully complete and verified

## Ticket Format
```yaml
id: PA-{number}
title: Brief description
priority: high|medium|low
agent: tmux|second-brain|time|core
created: YYYY-MM-DD
```

## Rules
1. One ticket per feature/bug
2. Move tickets as status changes
3. Document blockers clearly
4. Test before marking done
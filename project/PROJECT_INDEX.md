# SecretTalk Project Index

## Project Status
Foundation

## Architecture Modules

| Module | Purpose | Status |
|---------|---------|--------|
| ai | Artificial Intelligence subsystem | Active |
| memory | Long-term memory subsystem | Active |
| database | Database layer | Active |
| config | Project configuration | Foundation |
| core | Application core | Foundation |
| deployment | Deployment & Infrastructure | Foundation |
| docs | Product documentation | Foundation |
| project | Project architecture & decisions | Foundation |
| security | Project security | Foundation |
| services | Shared business services (non-AI) | Foundation |

---

## Module Notes

### ai/
Contains all AI-related components:
- AI Service
- Prompt Builder
- Context Builder
- OpenRouter Client
- Response Parser
- AI Configuration

### memory/
Responsible for long-term memory.

### database/
Responsible for database access.

### services/
Contains shared business services that are **not** part of the AI subsystem.

---

## Architecture Rules

1. One module = one responsibility.
2. New modules are created only after checking for duplicates.
3. AI functionality belongs only to the `ai/` module.
4. Project architecture is documented before implementation.

---

## Version

0.2

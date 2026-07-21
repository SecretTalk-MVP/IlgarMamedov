
# Memory Engine

Version: 0.1

Status: Draft

---

## Purpose

Memory Engine is responsible for providing Esko with relevant memories.

Memory Engine never generates responses.

Memory Engine only:

- stores memories;
- retrieves memories;
- summarizes conversations;
- provides relevant context to AI.

---

## Principles

1. Memory belongs to the user.

2. Memory Engine never changes Esko's personality.

3. Memory Engine never invents memories.

4. Only relevant memories should be provided.

5. Long conversations must be summarized.

6. Memory must survive bot restart.

7. PostgreSQL is the source of truth.

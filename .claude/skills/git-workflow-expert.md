# Git Workflow Expert Skill

**Goal:** Maintain a clean, traceable, and conflict-free version history.

## Steps

1.  **Branching Strategy:**
    *   Use descriptive branch names (e.g., `feat/`, `fix/`, `refactor/`).
    *   Ensure work is done in isolation and synced regularly with the main branch.
2.  **Atomic Commits:**
    *   Group changes into small, logical commits with clear messages.
    *   Use the "Conventional Commits" format (e.g., `feat: ...`, `fix: ...`).
3.  **Conflict Management:**
    *   Perform regular rebases or merges from main to stay up-to-date.
    *   Resolve conflicts proactively and verify with tests.
4.  **Review Readiness:**
    *   Ensure the branch is clean of temporary logs, comments, or debug code.
    *   Provide a summarizing PR description with the "Why" and "What".

## Rules

*   **No "WIP" Commits on Main:** Main branch must always be in a deployable state.
*   **Tests Must Pass:** Never push a branch that doesn't pass CI/local build.
*   **Linear History:** Prefer rebasing over merging to keep the history clean.
*   **Sign-off:** All significant changes must go through a code review (Paula).

## Expected Output

*   Clean, professional Git history with clear traceability of all changes.

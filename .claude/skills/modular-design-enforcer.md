# Modular Design Enforcer Skill

**Goal:** Build a highly maintainable and decoupled system using Domain-Driven Design.

## Steps

1.  **Domain Mapping:**
    *   Identify which domain (Commerce, Admin, Users) a component/logic belongs to.
    *   Enforce directory boundaries: no leaking cross-domain logic.
2.  **Internal APIs:**
    *   Define clear `index.ts` entry points for every module.
    *   Keep implementation details private; export only what's necessary.
3.  **Dependency Control:**
    *   Audit imports to prevent circular dependencies.
    *   Ensure low-level utilities don't depend on high-level domain components.
4.  **Abstraction Review:**
    *   Extract shared components into a common UI library.
    *   Ensure domain logic is isolated from UI components where possible.

## Rules

*   **Single Responsibility:** Each module must have one clear reason to change.
*   **Loose Coupling:** Minimize dependencies between different domain modules.
*   **Strict Boundaries:** Use linting or directory structure to prevent boundary violations.
*   **Standardize:** Always use the project's standard structure for new features.

## Expected Output

*   Decoupled, modular codebase with clear domain boundaries and clean APIs.

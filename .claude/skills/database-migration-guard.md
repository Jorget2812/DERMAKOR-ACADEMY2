# Database Migration Guard Skill

**Goal:** Perform safe, non-destructive database updates with zero downtime.

## Steps

1.  **Impact Analysis:**
    *   Evaluate how a migration affects running application instances.
    *   Check for potential data loss during transformations.
2.  **Safe DDL/DML:**
    *   Use non-blocking operations for table modifications.
    *   Implement "Add-then-Remove" strategy for column renames.
3.  **Rollback Planning:**
    *   Every migration script must have a corresponding rollback script.
    *   Verify the rollback works in a staging environment.
4.  **Supabase Sync:**
    *   Ensure `src/lib/supabase/types.ts` is updated after the migration.
    *   Check for RLS policy impact for New/Modified tables.

## Rules

*   **No Destructive Changes:** Avoid `DROP COLUMN` in the same migration as an `ADD`.
*   **Test in Isolation:** Run migrations against a local clone first.
*   **Backup First:** Ensure a fresh backup exists before running against Prod.
*   **Log Migrations:** Record migration IDs and effects in `memory/decisions.md`.

## Expected Output

*   Successful, verified database update with zero application disruption.

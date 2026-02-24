/**
 * Academy access control utilities.
 * These are pure functions — NOT server actions.
 */

export type CourseAccessLevel = 'PUBLIC' | 'STANDARD' | 'PREMIUM' | 'PAID'
export type LessonAccessLevel = 'INHERIT' | 'PUBLIC' | 'STANDARD' | 'PREMIUM' | 'PAID'
export type UserLevel = 'NONE' | 'STANDARD' | 'PREMIUM'

/**
 * Check if a user at the given level can access content at the given level.
 */
export function canAccessLevel(userLevel: string, contentLevel: string): boolean {
    if (contentLevel === 'PUBLIC') return true
    if (contentLevel === 'STANDARD') return ['STANDARD', 'PREMIUM'].includes(userLevel)
    if (contentLevel === 'PREMIUM') return userLevel === 'PREMIUM'
    if (contentLevel === 'PAID') return false // unlocked manually by admin
    return false
}

/**
 * Get which access levels to query (include higher for preview/lock UI).
 */
export function getAccessibleLevels(includeHigherForPreview = false): string[] {
    if (includeHigherForPreview) return ['PUBLIC', 'STANDARD', 'PREMIUM', 'PAID']
    return ['PUBLIC']
}

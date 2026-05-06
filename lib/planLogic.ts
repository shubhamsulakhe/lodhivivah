// lib/planLogic.ts
// Wedly plan access control — single source of truth

export type Plan = 'free' | 'silver' | 'gold'

export interface PlanAccess {
  canBrowseAllCommunities: boolean
  canSeePhotos:            boolean
  canViewContact:          boolean
  interestsPerDay:         number
  canChat:                 boolean
  canVoiceCall:            boolean
  canSeeProfileViewers:    boolean
  profilesPerDay:          number
  canBrowseOtherGender:    boolean
}

export function getPlanAccess(plan: Plan): PlanAccess {
  switch(plan) {
    case 'gold': return {
      canBrowseAllCommunities: true,   // GOLD ONLY
      canSeePhotos:            true,
      canViewContact:          true,
      interestsPerDay:         999,
      canChat:                 true,
      canVoiceCall:            true,
      canSeeProfileViewers:    true,
      profilesPerDay:          999,
      canBrowseOtherGender:    true,
    }
    case 'silver': return {
      canBrowseAllCommunities: false,  // Own community only
      canSeePhotos:            true,
      canViewContact:          true,
      interestsPerDay:         999,
      canChat:                 true,
      canVoiceCall:            false,
      canSeeProfileViewers:    false,
      profilesPerDay:          999,
      canBrowseOtherGender:    true,
    }
    default: return {              // Free
      canBrowseAllCommunities: false,  // Own community only
      canSeePhotos:            false,  // Blurred
      canViewContact:          false,
      interestsPerDay:         2,
      canChat:                 true,   // On mutual match
      canVoiceCall:            false,
      canSeeProfileViewers:    false,
      profilesPerDay:          10,
      canBrowseOtherGender:    true,
    }
  }
}

export const PLAN_LABELS: Record<Plan, string> = {
  free:   'Free',
  silver: 'Silver',
  gold:   'Gold ✦',
}

export const PLAN_FEATURES = {
  free: [
    '✓ Browse own community (10/day)',
    '✓ Send 2 interests/day',
    '✓ Chat on mutual match',
    '✗ Photos blurred',
    '✗ Contacts locked',
  ],
  silver: [
    '✓ Browse own community (unlimited)',
    '✓ Unlimited interests',
    '✓ View contacts on match',
    '✓ See photos clearly',
    '✗ All communities (Gold only)',
    '✗ Voice calls (Gold only)',
  ],
  gold: [
    '✓ Browse ALL communities',
    '✓ Unlimited everything',
    '✓ Voice calls',
    '✓ See profile viewers',
    '✓ Featured placement',
    '✓ All Silver features',
  ],
}
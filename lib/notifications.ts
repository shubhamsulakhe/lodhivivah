// lib/notifications.ts
// Central notification system — call these from anywhere

import { supabase } from '@/lib/supabase/client'

type NotifType =
  | 'interest_received'
  | 'interest_accepted'
  | 'new_message'
  | 'profile_approved'
  | 'profile_rejected'
  | 'plan_upgraded'
  | 'profile_viewed'
  | 'profile_created'
  | 'complete_profile'

export async function notify(
  userId: string,
  type:   NotifType,
  title:  string,
  body:   string,
  link:   string
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId, type, title, body, link, read: false
    })
  } catch(e) {
    console.error('Notification failed:', e)
  }
}

// Pre-built notification functions
export const Notifications = {

  interestReceived: async (receiverId: string, senderName: string, senderId: string) => {
    await notify(receiverId, 'interest_received',
      `💝 ${senderName} ने आपको interest भेजा!`,
      'Profile देखें और accept या reject करें',
      `/profiles/${senderId}`
    )
  },

  interestAccepted: async (senderId: string, acceptorName: string, chatId: string) => {
    await notify(senderId, 'interest_accepted',
      `🎉 ${acceptorName} ने आपका interest accept किया!`,
      'अब आप chat कर सकते हैं। Say hello!',
      `/chat/${chatId}`
    )
  },

  newMessage: async (receiverId: string, senderName: string, chatId: string, preview: string) => {
    await notify(receiverId, 'new_message',
      `💬 ${senderName} का message`,
      preview.length > 60 ? preview.slice(0, 60) + '…' : preview,
      `/chat/${chatId}`
    )
  },

  profileApproved: async (profileId: string) => {
    await notify(profileId, 'profile_approved',
      '✅ Profile Approved!',
      'आपकी profile live है। Matches browse करें!',
      '/profiles'
    )
  },

  profileRejected: async (profileId: string, reason: string) => {
    await notify(profileId, 'profile_rejected',
      '⚠️ Profile update needed',
      reason || 'Clear photo और complete details के साथ update करें',
      '/profile/edit'
    )
  },

  completeProfile: async (profileId: string, missingField: string) => {
    await notify(profileId, 'complete_profile',
      '📝 Profile incomplete',
      `${missingField} add करें — ज्यादा matches पाएं!`,
      '/profile/edit'
    )
  },

  planUpgraded: async (profileId: string, plan: string, months: number) => {
    await notify(profileId, 'plan_upgraded',
      `👑 ${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan Active!`,
      `${months} month${months>1?'s':''} के लिए premium features enjoy करें`,
      '/profiles'
    )
  },

  profileViewed: async (viewedId: string, viewerName: string, viewerId: string) => {
    await notify(viewedId, 'profile_viewed',
      `👀 ${viewerName} ने आपकी profile देखी`,
      'देखें कौन है — Gold plan से profile viewers देखें',
      `/profiles/${viewerId}`
    )
  },
}
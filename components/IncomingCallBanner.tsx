'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Phone, PhoneOff } from 'lucide-react'

interface IncomingCall {
  id: string
  caller_id: string
  room_url: string
  caller_name: string
  caller_photo: string
}

export default function IncomingCallBanner() {
  const [call, setCall]       = useState<IncomingCall | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mounted  = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    init()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return
    setProfileId(profile.id)

    const channel = supabase.channel(`calls-${profile.id}-${Date.now()}`)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT', schema: 'public',
        table: 'calls',
        filter: `receiver_id=eq.${profile.id}`,
      },
      async (payload) => {
        const newCall = payload.new as any
        if (newCall.status !== 'ringing') return

        // Get caller info
        const { data: caller } = await supabase
          .from('profiles')
          .select('name, photo_url')
          .eq('id', newCall.caller_id)
          .single()

        setCall({
          id:           newCall.id,
          caller_id:    newCall.caller_id,
          room_url:     newCall.room_url,
          caller_name:  caller?.name || 'Someone',
          caller_photo: caller?.photo_url || '',
        })

        // Auto reject after 30 seconds
        timerRef.current = setTimeout(() => {
          handleReject(newCall.id)
        }, 30000)
      }
    ).subscribe()
  }

  async function handleAccept() {
    if (!call) return
    if (timerRef.current) clearTimeout(timerRef.current)

    await supabase.from('calls')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', call.id)

    window.open(call.room_url, '_blank')
    setCall(null)
  }

  async function handleReject(callId?: string) {
    const id = callId || call?.id
    if (!id) return
    if (timerRef.current) clearTimeout(timerRef.current)

    await supabase.from('calls')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)

    setCall(null)
  }

  if (!call) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4">
      <div className="bg-stone-900 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideDown 0.3s ease' }}>

        {/* Pulsing ring animation */}
        <div className="relative bg-gradient-to-b from-stone-800 to-stone-900 px-6 pt-6 pb-5">
          <div className="flex items-center gap-4">
            {/* Avatar with pulse */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"/>
              <div className="absolute -inset-2 rounded-full bg-green-500/20 animate-pulse"/>
              {call.caller_photo ? (
                <img src={call.caller_photo}
                  className="w-14 h-14 rounded-full object-cover relative z-10 border-2 border-stone-700"
                  alt=""/>
              ) : (
                <div className="w-14 h-14 rounded-full bg-stone-700 flex items-center justify-center
                                relative z-10 text-white text-xl font-bold border-2 border-stone-600">
                  {call.caller_name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-0.5">
                Incoming call
              </p>
              <p className="text-white font-bold text-lg leading-tight truncate">
                {call.caller_name}
              </p>
              <p className="text-stone-400 text-sm flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"/>
                Voice call via Wedly
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-5">
            {/* Reject */}
            <button onClick={() => handleReject()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500
                         hover:bg-red-600 text-white font-semibold py-3.5 rounded-2xl
                         transition-colors">
              <PhoneOff className="w-5 h-5"/>
              Decline
            </button>

            {/* Accept */}
            <button onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500
                         hover:bg-green-600 text-white font-semibold py-3.5 rounded-2xl
                         transition-colors">
              <Phone className="w-5 h-5"/>
              Accept
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
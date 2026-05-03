'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Bell, Heart, MessageCircle, CheckCircle, X, User } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen]                   = useState(false)
  const [profileId, setProfileId]         = useState<string | null>(null)
  const ref     = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    loadProfile()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return
    setProfileId(profile.id)
    loadNotifications(profile.id)

const channel = supabase.channel(`notif-${profile.id}-${Date.now()}`)

channel.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${profile.id}`,
  },
  payload => {
    setNotifications(prev => [payload.new as Notification, ...prev])
  }
).subscribe()

return () => { supabase.removeChannel(channel)
}
 }

  async function loadNotifications(pid: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', pid)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }

  async function markAllRead() {
    if (!profileId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profileId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    if (diff < 60000)    return 'Just now'
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return `${Math.floor(diff/86400000)}d ago`
  }

  function getIcon(type: string) {
    switch(type) {
      case 'interest_received': return <Heart className="w-4 h-4 text-pink-500"/>
      case 'interest_accepted': return <CheckCircle className="w-4 h-4 text-emerald-500"/>
      case 'new_message':       return <MessageCircle className="w-4 h-4 text-orange-500"/>
      case 'profile_approved':  return <User className="w-4 h-4 text-blue-500"/>
      default:                  return <Bell className="w-4 h-4 text-stone-400"/>
    }
  }

  function getIconBg(type: string) {
    switch(type) {
      case 'interest_received': return 'bg-pink-50'
      case 'interest_accepted': return 'bg-emerald-50'
      case 'new_message':       return 'bg-orange-50'
      case 'profile_approved':  return 'bg-blue-50'
      default:                  return 'bg-stone-50'
    }
  }

  const unread = notifications.filter(n => !n.read).length

  if (!profileId) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center
                   hover:bg-stone-100 transition-colors text-stone-600">
        <Bell className="w-5 h-5"/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white
                           text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border
                        border-stone-200 shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs font-bold
                                 px-2 py-0.5 rounded-full">{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-stone-500"/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2"/>
                <p className="text-stone-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => { markRead(n.id); setOpen(false) }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50
                              transition-colors border-b border-stone-50 last:border-0
                              ${!n.read ? 'bg-orange-50/50' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                   flex-shrink-0 mt-0.5 ${getIconBg(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-stone-400 mt-0.5 truncate">{n.body}</p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"/>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
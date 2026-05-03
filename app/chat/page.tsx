'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
    MessageCircle, Search, Crown, CheckCheck,
    Check, Circle, Lock
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Chat {
    id: string
    other_profile: {
        id: string
        name: string
        photo_url: string
        city: string
        state: string
        date_of_birth: string
        plan: string
        is_premium: boolean
        gender: string
    } | null
    last_message: string
    last_message_at: string
    last_sender_id: string
    my_profile_id: string
    unread_count: number
    is_blocked: boolean
    is_unmatched: boolean
}

export default function ChatListPage() {
    const router = useRouter()
    const [chats, setChats] = useState<Chat[]>([])
    const [filtered, setFiltered] = useState<Chat[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [myProfile, setMyProfile] = useState<any>(null)
    const [tab, setTab] = useState<'all' | 'unread'>('all')

    useEffect(() => { loadChats() }, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(
            chats.filter(c =>
                !q ||
                c.other_profile?.name?.toLowerCase().includes(q) ||
                c.other_profile?.city?.toLowerCase().includes(q)
            )
        )
    }, [search, chats])

async function loadChats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) { router.push('/register'); return }
  setMyProfile(profile)

  const { data: chatData, error } = await supabase
    .from('chats')
    .select('*')
    .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
    .order('last_message_at', { ascending: false })

if (error) {
  console.error('Chat load error FULL:', JSON.stringify(error))
  toast.error(error.message || 'Failed to load chats')
  setLoading(false)
  return
}

  const enriched = await Promise.all((chatData || []).map(async (chat) => {
    const otherId = chat.user1_id === profile.id ? chat.user2_id : chat.user1_id

    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('id,name,photo_url,city,state,date_of_birth,plan,is_premium,gender')
      .eq('id', otherId)
      .single()

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('chat_id', chat.id)
      .eq('read', false)
      .neq('sender_id', profile.id)

    const { data: blockData } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${profile.id})`)
      .maybeSingle()

    return {
      id:              chat.id,
      other_profile:   otherProfile,
      last_message:    chat.last_message,
      last_message_at: chat.last_message_at,
      last_sender_id:  chat.last_sender_id,
      my_profile_id:   profile.id,
      unread_count:    count || 0,
      is_blocked:      !!blockData,
      is_unmatched:    false,
    }
  }))

  const valid = enriched.filter(c => c.other_profile) as Chat[]
  setChats(valid)
  setFiltered(valid)
  setLoading(false)
}

    function formatTime(ts: string) {
        if (!ts) return ''
        const d = new Date(ts)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday: 'short' })
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

   function getInitial(name: string | undefined) { return name?.charAt(0)?.toUpperCase() || '?' }

    const avatarColors: Record<string, string> = {
        A: '#fce7f3,#9d174d', B: '#ede9fe,#4c1d95', C: '#d1fae5,#065f46',
        D: '#fef9c3,#713f12', E: '#dbeafe,#1e40af', F: '#fce7f3,#9d174d',
        G: '#d1fae5,#065f46', H: '#ede9fe,#4c1d95', I: '#fef9c3,#713f12',
        J: '#dbeafe,#1e40af', K: '#fce7f3,#9d174d', L: '#d1fae5,#065f46',
        M: '#ede9fe,#4c1d95', N: '#fef9c3,#713f12', O: '#dbeafe,#1e40af',
        P: '#fce7f3,#9d174d', Q: '#d1fae5,#065f46', R: '#ede9fe,#4c1d95',
        S: '#d1fae5,#065f46', T: '#fef9c3,#713f12', U: '#dbeafe,#1e40af',
        V: '#fce7f3,#9d174d', W: '#ede9fe,#4c1d95', X: '#d1fae5,#065f46',
        Y: '#fef9c3,#713f12', Z: '#dbeafe,#1e40af',
    }

    function getAvatarStyle(name: string | undefined) {
        const key = name?.charAt(0)?.toUpperCase() || 'A'
        const [bg, color] = (avatarColors[key] || '#f1f5f9,#475569').split(',')
        return { backgroundColor: bg, color }
    }

    const displayChats = tab === 'unread'
        ? filtered.filter(c => c.unread_count > 0)
        : filtered

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-0 sm:px-4 pt-20 pb-8">

                {/* Header */}
                <div className="bg-white sm:rounded-2xl border-b sm:border border-stone-200 overflow-hidden">

                    {/* Top bar */}
                    <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-white font-bold text-xl tracking-tight">Messages</h1>
                                <p className="text-orange-100 text-xs mt-0.5">
                                    {chats.filter(c => c.unread_count > 0).length} unread conversations
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search conversations…"
                                className="w-full bg-white/20 border border-white/25 text-white placeholder:text-white/60
                           rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none
                           focus:bg-white/30 focus:border-white/40 transition-all"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-stone-100 bg-white">
                        {[
                            { id: 'all', label: 'All chats', count: chats.length },
                            { id: 'unread', label: 'Unread', count: chats.filter(c => c.unread_count > 0).length },
                        ].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as any)}
                                className={`flex-1 py-3 text-sm font-semibold transition-all
                  border-b-2 flex items-center justify-center gap-2
                  ${tab === t.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
                                {t.label}
                                {t.count > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                    ${tab === t.id
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-stone-100 text-stone-500'}`}>
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Chat list */}
                    {loading ? (
                        <div className="py-16 text-center">
                            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-stone-400 text-sm">Loading conversations…</p>
                        </div>
                    ) : displayChats.length === 0 ? (
                        <div className="py-16 text-center px-8">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-orange-300" />
                            </div>
                            <p className="text-stone-700 font-semibold mb-1">
                                {search ? 'No results found' : 'No conversations yet'}
                            </p>
                            <p className="text-stone-400 text-sm mb-5">
                                {search
                                    ? 'Try searching with a different name'
                                    : 'Accept an interest to start chatting with your matches'}
                            </p>
                            {!search && (
                                <Link href="/profiles"
                                    className="inline-flex items-center gap-2 bg-orange-500 text-white
                             text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
                                    Browse profiles →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {displayChats.filter(c => c.other_profile).map(chat => (
                                <Link key={chat.id}
                                    href={chat.is_blocked ? '#' : `/chat/${chat.id}`}
                                    className={`flex items-center gap-3 px-5 py-4 transition-colors group
                    ${chat.is_blocked
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-orange-50/50 cursor-pointer'}`}>

                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {chat.other_profile?.photo_url ? (
                                            <img src={chat.other_profile?.photo_url || ''}
                                                className="w-12 h-12 rounded-full object-cover"
                                                alt={chat.other_profile?.name} />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center
                                      text-base font-bold"
                                                style={getAvatarStyle(chat.other_profile?.name)}>
                                                {getInitial(chat.other_profile?.name)}
                                            </div>
                                        )}
                                        {/* Online dot — show randomly for demo */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400
                                    rounded-full border-2 border-white"/>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-semibold text-sm truncate
                        ${chat.unread_count > 0 ? 'text-stone-900' : 'text-stone-700'}`}>
                                                {chat.other_profile?.name}
                                            </span>
                                            {chat.other_profile?.plan === 'gold' && (
                                                <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
                                            )}
                                            {chat.is_blocked && (
                                                <span className="text-xs text-red-500 flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Blocked
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {chat.last_sender_id === chat.my_profile_id && !chat.is_blocked && (
                                                chat.unread_count === 0
                                                    ? <CheckCheck className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                                    : <Check className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                                            )}
                                            <span className={`text-xs truncate
                        ${chat.is_blocked
                                                    ? 'text-red-500'
                                                    : chat.unread_count > 0
                                                        ? 'text-stone-600 font-medium'
                                                        : 'text-stone-400'}`}>
                                                {chat.is_blocked
                                                    ? 'Chat disabled'
                                                    : chat.last_message || 'Start the conversation…'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <span className="text-xs text-stone-400">
                                            {formatTime(chat.last_message_at)}
                                        </span>
                                        {chat.unread_count > 0 && (
                                            <span className="bg-orange-500 text-white text-xs font-bold
                                       rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Premium nudge for free users */}
                {myProfile && !myProfile.is_premium && (
                    <div className="mx-4 sm:mx-0 mt-4 bg-gradient-to-r from-orange-50 to-amber-50
                          border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Crown className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-stone-800">Unlock unlimited chats</p>
                            <p className="text-xs text-stone-500">Upgrade to Silver or Gold plan</p>
                        </div>
                        <Link href="/premium"
                            className="bg-orange-500 text-white text-xs font-bold px-4 py-2
                         rounded-xl hover:bg-orange-600 transition-colors flex-shrink-0">
                            Upgrade
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
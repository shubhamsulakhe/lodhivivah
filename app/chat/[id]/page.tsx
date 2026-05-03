'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    ArrowLeft, Phone, MoreVertical, Send, Paperclip,
    Smile, CheckCheck, Check, Crown,
    UserX, HeartOff, X
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'


interface Message {
    id: string
    chat_id: string
    sender_id: string
    content: string
    read: boolean
    created_at: string
}

interface Profile {
    id: string
    name: string
    photo_url: string
    city: string
    state: string
    date_of_birth: string
    plan: string
    is_premium: boolean
    gender: string
    education: string
    occupation: string
    gotra: string
}

export default function ChatPage() {
    const [showEmoji, setShowEmoji] = useState(false)
    const [showAttach, setShowAttach] = useState(false)
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const chatId = params?.id as string

    const [messages, setMessages] = useState<Message[]>([])
    const [newMsg, setNewMsg] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [myProfile, setMyProfile] = useState<any>(null)
    const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
    const [showMenu, setShowMenu] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)
    const [isOnline, setIsOnline] = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const channelRef = useRef<any>(null)
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'accepted' | 'rejected'>('idle')
    const [activeCallId, setActiveCallId] = useState<string | null>(null)
    const callChannelRef = useRef<any>(null)

    useEffect(() => {
        if (!chatId) return
        initChat()
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [chatId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    async function initChat() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: profile } = await supabase
            .from('profiles').select('*').eq('user_id', user.id).single()
        if (!profile) { router.push('/register'); return }
        setMyProfile(profile)

        const { data: chatData } = await supabase
            .from('chats').select('*').eq('id', chatId).single()
        if (!chatData) { router.push('/chat'); return }

        const otherId = chatData.user1_id === profile.id ? chatData.user2_id : chatData.user1_id
        const { data: other } = await supabase
            .from('profiles').select('*').eq('id', otherId).single()
        setOtherProfile(other)
        setIsOnline(Math.random() > 0.4)

        const { data: blockData } = await supabase
            .from('blocks')
            .select('id')
            .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${profile.id})`)
            .maybeSingle()
        setIsBlocked(!!blockData)

        const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .limit(100)
        setMessages(msgs || [])
        setLoading(false)

        await supabase
            .from('messages')
            .update({ read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', profile.id)
            .eq('read', false)

        // Setup realtime — only once
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
        }

        channelRef.current = supabase
            .channel(`chat-${chatId}-${Date.now()}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                async (payload) => {
                    const newMessage = payload.new as Message
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMessage.id)) return prev
                        return [...prev, newMessage]
                    })
                    if (newMessage.sender_id !== profile.id) {
                        await supabase.from('messages').update({ read: true }).eq('id', newMessage.id)
                    }
                }
            )
            .subscribe()
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: string) {
        toast.success(`${type === 'image' ? '📷 Photo' : '📄 Document'} sharing coming soon!`)
        setShowAttach(false)
    }
    async function startCall() {
        if (!myProfile || !otherProfile) return
        if (callStatus === 'calling') {
            toast.error('Call already in progress')
            return
        }

        const roomName = `wedly-${chatId.slice(0, 8)}-${Date.now()}`
        const roomUrl = `https://meet.jit.si/${roomName}`

        setCallStatus('calling')
        callStatusRef.current = 'calling'

        // Insert call record
        const { data: callData, error } = await supabase.from('calls').insert({
            chat_id: chatId,
            caller_id: myProfile.id,
            receiver_id: otherProfile.id,
            room_url: roomUrl,
            status: 'ringing',
        }).select().single()

        if (error) {
            toast.error('Failed to start call')
            setCallStatus('idle')
            callStatusRef.current = 'idle'
            return
        }

        setActiveCallId(callData.id)

        // Send message in chat
        await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: myProfile.id,
            content: `📞 Voice call started`,
            read: false,
        })

        await supabase.from('chats').update({
            last_message: '📞 Voice call started',
            last_message_at: new Date().toISOString(),
            last_sender_id: myProfile.id,
        }).eq('id', chatId)

        // Open Jitsi
        window.open(roomUrl, '_blank')

        toast.success(`📞 Calling ${otherProfile.name}…`, { duration: 4000 })

        // Listen for accept/reject
        if (callChannelRef.current) supabase.removeChannel(callChannelRef.current)

        callChannelRef.current = supabase
            .channel(`call-status-${callData.id}-${Date.now()}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${callData.id}` },
                (payload) => {
                    const updated = payload.new as any
                    if (updated.status === 'accepted') {
                        toast.success(`${otherProfile.name} accepted the call! ✅`)
                        setCallStatus('accepted')
                        callStatusRef.current = 'accepted'
                    } else if (updated.status === 'rejected') {
                        toast.error(`${otherProfile.name} declined the call`)
                        setCallStatus('idle')
                        callStatusRef.current = 'idle'
                    } else if (updated.status === 'missed') {
                        toast.error('Call not answered')
                        setCallStatus('idle')
                        callStatusRef.current = 'idle'
                    }
                }
            )
            .subscribe()

        // Auto end call after 30s if no answer
        setTimeout(async () => {
            if (callStatusRef.current === 'calling' && callData.id) {
                await supabase.from('calls')
                    .update({ status: 'missed' })
                    .eq('id', callData.id)
                    .eq('status', 'ringing')
                setCallStatus('idle')
                callStatusRef.current = 'idle'
            }
        }, 30000)
    }

    const callStatusRef = useRef<string>('idle')

    async function sendMessage() {
        const text = newMsg.trim()
        if (!text || sending || isBlocked || !myProfile) return

        setNewMsg('')
        setSending(true)

        const { error } = await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: myProfile.id,
            content: text,
            read: false,
        })

        if (error) {
            toast.error('Failed to send message')
            setNewMsg(text)
            setSending(false)
            return
        }

        await supabase.from('chats').update({
            last_message: text,
            last_message_at: new Date().toISOString(),
            last_sender_id: myProfile.id,
        }).eq('id', chatId)

        setSending(false)
        inputRef.current?.focus()
    }

    async function handleUnmatch() {
        if (!confirm(`Unmatch with ${otherProfile?.name}? This will delete the chat permanently.`)) return
        await supabase.from('chats').delete().eq('id', chatId)
        await supabase.from('interests').delete()
            .or(`and(sender_id.eq.${myProfile.id},receiver_id.eq.${otherProfile?.id}),and(sender_id.eq.${otherProfile?.id},receiver_id.eq.${myProfile.id})`)
        toast.success('Unmatched')
        router.push('/chat')
    }

    async function handleBlock() {
        if (!confirm(`Block ${otherProfile?.name}? They won't be able to contact you.`)) return
        await supabase.from('blocks').insert({ blocker_id: myProfile.id, blocked_id: otherProfile?.id })
        await supabase.from('chats').delete().eq('id', chatId)
        await supabase.from('interests').delete()
            .or(`and(sender_id.eq.${myProfile.id},receiver_id.eq.${otherProfile?.id}),and(sender_id.eq.${otherProfile?.id},receiver_id.eq.${myProfile.id})`)
        toast.success(`${otherProfile?.name} blocked`)
        router.push('/chat')
    }

    function formatTime(ts: string) {
        return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    function formatDate(ts: string) {
        const d = new Date(ts)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === today.toDateString()) return 'Today'
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    function groupByDate() {
        const groups: { date: string; messages: Message[] }[] = []
        messages.forEach(msg => {
            const date = formatDate(msg.created_at)
            const last = groups[groups.length - 1]
            if (last && last.date === date) last.messages.push(msg)
            else groups.push({ date, messages: [msg] })
        })
        return groups
    }

    const avColors: Record<string, [string, string]> = {
        A: ['#fce7f3', '#9d174d'], B: ['#ede9fe', '#4c1d95'], C: ['#d1fae5', '#065f46'],
        D: ['#fef9c3', '#713f12'], E: ['#dbeafe', '#1e40af'], M: ['#fce7f3', '#9d174d'],
        P: ['#fce7f3', '#9d174d'], R: ['#ede9fe', '#4c1d95'], S: ['#d1fae5', '#065f46'],
    }
    const k = otherProfile?.name?.charAt(0)?.toUpperCase() || 'A'
    const [avBg, avColor] = avColors[k] || ['#f1f5f9', '#475569']

    const isGold = myProfile?.plan === 'gold' && otherProfile?.plan === 'gold'

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Loading chat…</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-screen bg-stone-50">

            {/* HEADER */}
            <div className="flex-shrink-0 bg-white border-b border-stone-200 px-4 py-3
                      flex items-center gap-3 shadow-sm">
                <Link href="/chat"
                    className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center
                     transition-colors text-stone-600 flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <button onClick={() => setShowProfile(true)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="relative flex-shrink-0">
                        {otherProfile?.photo_url ? (
                            <img src={otherProfile.photo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ background: avBg, color: avColor }}>
                                {otherProfile?.name?.charAt(0)}
                            </div>
                        )}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-900 text-sm truncate">{otherProfile?.name}</span>
                            {otherProfile?.plan === 'gold' && (
                                <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-stone-400">
                            {isOnline
                                ? <span className="text-emerald-500 font-medium">Online</span>
                                : `${otherProfile?.city}, ${otherProfile?.state}`}
                        </p>
                    </div>
                </button>

                <div className="flex items-center gap-1">
                    {isGold && (
                        <button
                            onClick={startCall}
                            title="Voice call — Gold only"
                            className={`w-9 h-9 rounded-full flex items-center justify-center
               transition-colors flex-shrink-0
               ${callStatus === 'calling'
                                    ? 'bg-green-100 text-green-600 animate-pulse'
                                    : 'hover:bg-stone-100 text-stone-600'}`}>
                            <Phone className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setShowMenu(p => !p)}
                            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center
                         justify-center text-stone-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl border
                              border-stone-200 shadow-xl z-50 py-1.5 overflow-hidden">
                                <button onClick={() => { setShowProfile(true); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm
                             text-stone-700 hover:bg-stone-50 transition-colors text-left">
                                    View profile
                                </button>
                                <div className="h-px bg-stone-100 mx-3" />
                                <button onClick={() => { handleUnmatch(); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm
                             text-orange-600 hover:bg-orange-50 transition-colors text-left">
                                    <HeartOff className="w-4 h-4" /> Unmatch
                                </button>
                                <button onClick={() => { handleBlock(); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm
                             text-red-600 hover:bg-red-50 transition-colors text-left">
                                    <UserX className="w-4 h-4" /> Block and report
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MATCH BANNER */}
            {messages.length === 0 && !isBlocked && (
                <div className="flex-shrink-0 bg-orange-50 border-b border-orange-100 px-4 py-3
                        flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">🎉</span>
                    <div>
                        <p className="text-sm font-semibold text-orange-800">
                            You matched with {otherProfile?.name}!
                        </p>
                        <p className="text-xs text-orange-600">Say hello and start your conversation.</p>
                    </div>
                </div>
            )}

            {isBlocked && (
                <div className="flex-shrink-0 bg-red-50 border-b border-red-100 px-4 py-3">
                    <p className="text-sm text-red-700 text-center">This conversation is no longer available.</p>
                </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-4"
                style={{ background: '#faf7f4' }}>
                {groupByDate().map(group => (
                    <div key={group.date}>
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-stone-200" />
                            <span className="text-xs text-stone-400 font-medium px-3 py-1
                               bg-stone-100 rounded-full flex-shrink-0">{group.date}</span>
                            <div className="flex-1 h-px bg-stone-200" />
                        </div>
                        <div className="space-y-1">
                            {group.messages.map((msg, idx) => {
                                const isMe = msg.sender_id === myProfile?.id
                                const prev = group.messages[idx - 1]
                                const showAv = !isMe && (!prev || prev.sender_id !== msg.sender_id)
                                return (
                                    <div key={msg.id}
                                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-7 h-7 flex-shrink-0">
                                            {!isMe && showAv && (
                                                otherProfile?.photo_url
                                                    ? <img src={otherProfile.photo_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                                                    : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                                        style={{ background: avBg, color: avColor }}>
                                                        {otherProfile?.name?.charAt(0)}
                                                    </div>
                                            )}
                                        </div>
                                        <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 text-sm leading-relaxed
                        ${isMe
                                                    ? 'bg-orange-500 text-white rounded-2xl rounded-br-sm'
                                                    : 'bg-white text-stone-800 rounded-2xl rounded-bl-sm border border-stone-100 shadow-sm'}`}>
                                                {msg.content}
                                            </div>
                                            <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-xs text-stone-400">{formatTime(msg.created_at)}</span>
                                                {isMe && (
                                                    msg.read
                                                        ? <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                                                        : <Check className="w-3.5 h-3.5 text-stone-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                {messages.length === 0 && !isBlocked && (
                    <div className="text-center py-12">
                        <p className="text-stone-400 text-sm">No messages yet — say hello! 👋</p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
            {/* INPUT BAR */}
            {!isBlocked ? (
                <div className="flex-shrink-0 bg-white border-t border-stone-200">

                    {/* Emoji picker */}
                    {showEmoji && (
                        <div className="px-4 py-3 border-b border-stone-100">
                            <div className="flex flex-wrap gap-2">
                                {['😊', '😍', '🙏', '💑', '❤️', '👍', '😄', '🎉', '💝', '✨', '🌹', '💐',
                                    '😂', '🤗', '😘', '💪', '🙌', '👏', '🥰', '😇', '💫', '🌟', '🎊', '🙈'].map(e => (
                                        <button key={e} onClick={() => setNewMsg(prev => prev + e)}
                                            className="text-xl hover:scale-125 transition-transform">
                                            {e}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Attachment options */}
                    {showAttach && (
                        <div className="px-4 py-3 border-b border-stone-100 flex gap-4">
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    <span className="text-xl">📷</span>
                                </div>
                                <span className="text-xs text-stone-500">Photo</span>
                                <input type="file" accept="image/*" className="hidden"
                                    onChange={e => handleFileUpload(e, 'image')} />
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <span className="text-xl">📄</span>
                                </div>
                                <span className="text-xs text-stone-500">Document</span>
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                                    onChange={e => handleFileUpload(e, 'document')} />
                            </label>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-4 py-3">
                        <button
                            onClick={() => { setShowEmoji(p => !p); setShowAttach(false) }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center
                   transition-colors flex-shrink-0
                   ${showEmoji
                                    ? 'bg-orange-100 text-orange-500'
                                    : 'hover:bg-stone-100 text-stone-400'}`}>
                            <Smile className="w-5 h-5" />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                            onFocus={() => { setShowEmoji(false); setShowAttach(false) }}
                            placeholder="Type a message…"
                            className="flex-1 bg-stone-100 border border-transparent rounded-2xl px-4 py-2.5
                   text-sm text-stone-800 outline-none focus:border-orange-300 focus:bg-white
                   transition-all placeholder:text-stone-400"
                        />
                        <button
                            onClick={() => { setShowAttach(p => !p); setShowEmoji(false) }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center
                   transition-colors flex-shrink-0
                   ${showAttach
                                    ? 'bg-orange-100 text-orange-500'
                                    : 'hover:bg-stone-100 text-stone-400'}`}>
                            <Paperclip className="w-5 h-5" />
                        </button>
                        {newMsg.trim() ? (
                            <button onClick={sendMessage} disabled={sending}
                                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full
                     flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-60">
                                {sending
                                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    : <Send className="w-4 h-4" />
                                }
                            </button>
                        ) : (
                            <div className="w-9 h-9 flex-shrink-0" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-shrink-0 bg-stone-100 border-t border-stone-200 px-4 py-4 text-center">
                    <p className="text-stone-500 text-sm">You can no longer send messages here.</p>
                </div>
            )}

            {/* PROFILE DRAWER */}
            {showProfile && otherProfile && (
                <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowProfile(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl
                          max-h-[85vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-stone-100">
                            <h3 className="font-bold text-stone-900 text-lg">Profile</h3>
                            <button onClick={() => setShowProfile(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                                <X className="w-4 h-4 text-stone-600" />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="flex items-start gap-4 mb-5">
                                {otherProfile.photo_url ? (
                                    <img src={otherProfile.photo_url}
                                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" alt="" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                                  text-2xl font-bold flex-shrink-0"
                                        style={{ background: avBg, color: avColor }}>
                                        {otherProfile.name?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-lg font-bold text-stone-900">{otherProfile.name}</h2>
                                        {otherProfile.plan === 'gold' && (
                                            <span className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700
                                       border border-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                                                <Crown className="w-3 h-3" /> Gold
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-stone-500 text-sm mt-1">
                                        {otherProfile.date_of_birth ? `${getAge(otherProfile.date_of_birth)} yrs · ` : ''}
                                        {otherProfile.city}, {otherProfile.state}
                                    </p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {otherProfile.occupation && (
                                            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200
                                       px-2.5 py-1 rounded-full font-medium">
                                                {otherProfile.occupation}
                                            </span>
                                        )}
                                        <span className="text-xs bg-green-50 text-green-700 border border-green-200
                                     px-2.5 py-1 rounded-full font-medium">✓ Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-0 mb-5">
                                {[
                                    { label: 'Education', val: otherProfile.education },
                                    { label: 'Occupation', val: otherProfile.occupation },
                                    { label: 'Gotra', val: otherProfile.gotra },
                                    { label: 'Location', val: `${otherProfile.city}, ${otherProfile.state}` },
                                ].filter(r => r.val).map(({ label, val }) => (
                                    <div key={label} className="flex items-center justify-between py-3
                                              border-b border-stone-100 last:border-0">
                                        <span className="text-sm text-stone-400">{label}</span>
                                        <span className="text-sm font-medium text-stone-800">{val}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Link href={`/profiles/${otherProfile.id}`}
                                    className="flex-1 py-3 bg-stone-100 text-stone-700 text-sm font-semibold
                             rounded-xl text-center hover:bg-stone-200 transition-colors">
                                    Full profile
                                </Link>
                                <button onClick={() => setShowProfile(false)}
                                    className="flex-1 py-3 bg-orange-500 text-white text-sm font-semibold
                             rounded-xl hover:bg-orange-600 transition-colors">
                                    Continue chat →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
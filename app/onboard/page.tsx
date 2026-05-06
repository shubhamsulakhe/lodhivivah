'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import {
    ArrowRight, ArrowLeft, Check, Loader2,
    Camera, MapPin, X, Plus
} from 'lucide-react'
import { STATES, EDUCATION, OCCUPATION, GOTRA, HEIGHTS } from '@/lib/utils'
import toast from 'react-hot-toast'

const COMMUNITIES = [
    { value: 'lodhi_kshatriya', label: 'Lodhi Kshatriya', hindi: 'लोधी क्षत्रिय', active: true },
    { value: 'pawar', label: 'Pawar Samaj', hindi: 'पवार समाज', active: true },
    { value: 'kirar', label: 'Kirar Samaj', hindi: 'किरार समाज', active: true },
    { value: 'kurmi', label: 'Kurmi Samaj', hindi: 'कुर्मी समाज', active: true },
    { value: 'teli', label: 'Teli Samaj', hindi: 'तेली समाज', active: true },
    { value: 'yadav', label: 'Yadav Samaj', hindi: 'यादव समाज', active: true },
    { value: 'gond', label: 'Gond Samaj', hindi: 'गोंड समाज', active: true },
    { value: 'rajput', label: 'Rajput Samaj', hindi: 'राजपूत समाज', active: false },
    { value: 'brahmin', label: 'Brahmin Samaj', hindi: 'ब्राह्मण समाज', active: false },
    { value: 'kshatriya', label: 'Kshatriya Samaj', hindi: 'क्षत्रिय समाज', active: false },
    { value: 'other', label: 'Other Community', hindi: 'अन्य समाज', active: true },
]

type StepId = 'community' | 'basic' | 'location' | 'photo' | 'career'

const STEPS: { id: StepId; label: string; hindi: string; required: boolean }[] = [
    { id: 'community', label: 'Your Samaj', hindi: 'आपका समाज', required: true },
    { id: 'basic', label: 'About You', hindi: 'आपके बारे में', required: true },
    { id: 'location', label: 'Your City', hindi: 'आपका शहर', required: true },
    { id: 'photo', label: 'Your Photo', hindi: 'आपकी फोटो', required: false },
    { id: 'career', label: 'Work & Study', hindi: 'काम और पढ़ाई', required: false },
]

export default function OnboardPage() {
    const router = useRouter()
    const [stepIdx, setStepIdx] = useState(0)
    const [saving, setSaving] = useState(false)
    const [profileId, setProfileId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [userName, setUserName] = useState('')

    const [form, setForm] = useState({
        community: '',
        gender: 'male',
        name: '',
        date_of_birth: '',
        phone: '',
        city: '',
        state: '',
        district: '',
        education: '',
        occupation: '',
        annual_income: '',
        gotra: '',
        height_cm: '',
        marital_status: 'never_married',
        photo_url: '',
    })

    function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

    useEffect(() => {
        // Must be logged in
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push('/login'); return }
            setUserId(user.id)
            // Pre-fill name from Google if available
            if (user.user_metadata?.full_name) {
                setForm(p => ({ ...p, name: user.user_metadata.full_name }))
            }
            setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')

            // Check if profile already exists → go to dashboard
            supabase.from('profiles').select('id, onboarding_tier')
                .eq('user_id', user.id).single()
                .then(({ data }) => {
                    if (data) {
                        setProfileId(data.id)
                        // If already tier 2+ send to dashboard
                        if (data.onboarding_tier >= 2) {
                            router.push('/dashboard')
                        }
                    }
                })
        })
    }, [])

    const currentStep = STEPS[stepIdx]

    function canContinue() {
        if (currentStep.id === 'community') return !!form.community && !!form.gender
        if (currentStep.id === 'basic') return !!form.name && !!form.date_of_birth && !!form.phone
        if (currentStep.id === 'location') return !!form.city && !!form.state
        return true
    }

    function calcScore() {
        let s = 0
        if (form.name) s += 8
        if (form.community) s += 8
        if (form.gender) s += 8
        if (form.date_of_birth) s += 8
        if (form.phone) s += 8
        if (form.photo_url) s += 12
        if (form.city) s += 8
        if (form.occupation) s += 8
        if (form.education) s += 7
        if (form.gotra) s += 5
        return s
    }

    async function saveToDb() {
        if (!userId) return
        const completeness = calcScore()
        const onboarding_tier = completeness >= 47 ? 3 : completeness >= 32 ? 2 : 1

        const payload: any = {
            user_id: userId,
            community: form.community || null,
            gender: form.gender,
            name: form.name || null,
            date_of_birth: form.date_of_birth || null,
            phone: form.phone || null,
            whatsapp: form.phone || null,
            city: form.city || null,
            state: form.state || null,
            district: form.district || null,
            education: form.education || null,
            occupation: form.occupation || null,
            annual_income: form.annual_income || null,
            gotra: form.gotra || null,
            height_cm: Number(form.height_cm) || null,
            marital_status: form.marital_status,
            photo_url: form.photo_url || null,
            status: completeness >= 47 ? 'pending' : 'incomplete',
            plan: 'free',
            is_premium: false,
            completeness,
            onboarding_tier,
        }

        if (profileId) {
            await supabase.from('profiles').update(payload).eq('id', profileId)
        } else {
            const { data, error } = await supabase
                .from('profiles').insert(payload).select('id').single()
            if (!error && data) {
                setProfileId(data.id)

                // Send notification to admin via notifications table
                try {
                    await supabase.from('notifications').insert({
                        user_id: data.id,
                        type: 'profile_created',
                        title: `New profile: ${form.name || 'Unknown'} (${form.community || 'No community'})`,
                        body: `${form.city || ''} · ${form.gender} · ${completeness}% complete`,
                        link: `/admin`,
                        read: false,
                    })
                }
                catch (_) { } // Don't fail if notifications fail
            }
        }
        return true
    }

    async function handleNext() {
        if (!canContinue() && currentStep.required) return
        setSaving(true)
        await saveToDb()
        setSaving(false)

        if (stepIdx < STEPS.length - 1) {
            setStepIdx(p => p + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            await saveToDb()
            const score = calcScore()
            if (score >= 47) {
                toast.success('Profile submitted for review! 🎉 You\'ll be notified once approved.')
            } else {
                toast.success('Profile saved! Complete more details to get better matches.')
            }
            router.push('/dashboard?new=1')
        }
    }

    async function handleSkip() {
        setSaving(true)
        await saveToDb()
        setSaving(false)
        if (stepIdx < STEPS.length - 1) {
            setStepIdx(p => p + 1)
        } else {
            router.push('/dashboard?new=1')
        }
    }

    async function handleSkipAll() {
        setSaving(true)
        await saveToDb()
        setSaving(false)
        toast('Profile saved! You can complete it later from dashboard.', { icon: '💾' })
        router.push('/dashboard?new=1')
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !userId) return
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
        setUploading(true)
        try {
            const ext = file.name.split('.').pop()
            const pid = profileId || userId
            const path = `${pid}/photo_${Date.now()}.${ext}`
            const { error } = await supabase.storage
                .from('profile-photos').upload(path, file, { upsert: true })
            if (error) throw error
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos').getPublicUrl(path)
            set('photo_url', publicUrl)
            setPhotos(p => [publicUrl, ...p.slice(0, 4)])

            if (profileId) {
                await supabase.from('profile_photos').insert({
                    profile_id: profileId, photo_url: publicUrl,
                    is_primary: photos.length === 0, sort_order: photos.length,
                })
                await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', profileId)
            }
            toast.success('Photo uploaded! 📸')
        } catch (e: any) {
            toast.error('Upload failed — check storage settings')
        } finally { setUploading(false) }
    }

    const score = calcScore()
    const progress = Math.round((stepIdx / STEPS.length) * 100)

    return (
        <div className="min-h-screen bg-[#fffaf6]">

            {/* Top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <Logo size="sm" />
                    <div className="flex items-center gap-3">
                        {/* Progress */}
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#c2410c] to-orange-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(progress, 5)}%` }} />
                            </div>
                            <span className="text-xs text-stone-400 font-medium">
                                {stepIdx + 1}/{STEPS.length}
                            </span>
                        </div>
                        <button onClick={handleSkipAll}
                            className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors">
                            Save & exit
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-8">

                {/* Step header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        {stepIdx > 0 && (
                            <button onClick={() => setStepIdx(p => p - 1)}
                                className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center
                           hover:bg-stone-200 transition-colors text-stone-600">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-[#431407]"
                                style={{ fontFamily: 'Georgia,serif' }}>
                                {stepIdx === 0 && userName ? `Hi${userName ? `, ${userName.split(' ')[0]}` : ''}! 👋` : currentStep.label}
                            </h1>
                            <p className="text-orange-500 text-xs font-medium mt-0.5">{currentStep.hindi}</p>
                        </div>
                    </div>
                    {stepIdx === 0 && (
                        <p className="text-stone-400 text-sm mt-2 ml-0">
                            Let's set up your profile in a few quick steps.
                        </p>
                    )}
                    {!currentStep.required && (
                        <div className="flex items-center gap-2 mt-2 bg-blue-50 border border-blue-100
                            px-3 py-2 rounded-xl w-fit">
                            <span className="text-[11px] text-blue-600 font-medium">
                                Optional — more info = more matches
                            </span>
                        </div>
                    )}
                </div>

                {/* Profile strength indicator */}
                {score > 0 && (
                    <div className={`rounded-2xl p-3.5 mb-5 border flex items-center gap-3
            ${score >= 60 ? 'bg-emerald-50 border-emerald-200' : score >= 35 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-stone-700">Profile Strength</span>
                                <span className={`text-xs font-black ${score >= 60 ? 'text-emerald-600' : score >= 35 ? 'text-orange-600' : 'text-red-600'}`}>
                                    {score}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${score}%`, background: score >= 60 ? '#22c55e' : score >= 35 ? '#f97316' : '#ef4444' }} />
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-500 max-w-[100px] leading-tight flex-shrink-0">
                            {score < 35 ? 'Add more to be visible' : score < 60 ? 'Getting better!' : '✅ Great profile!'}
                        </p>
                    </div>
                )}

                {/* Form card */}
                <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-5 sm:p-7">

                    {/* COMMUNITY */}
                    {currentStep.id === 'community' && (
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-3">
                                    Select Your Community · अपना समाज चुनें *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMMUNITIES.map(c => (
                                        <button key={c.value} type="button" onClick={() => set('community', c.value)}
                                            className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all
                        ${form.community === c.value
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-stone-200 bg-white hover:border-orange-300'}`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0
                        ${c.active ? 'bg-emerald-400' : 'bg-stone-300'}`} />
                                            <div className="min-w-0">
                                                <div className={`text-sm font-semibold truncate
                          ${form.community === c.value ? 'text-orange-700' : 'text-stone-800'}`}>
                                                    {c.label}
                                                </div>
                                                <div className="text-[10px] text-stone-400">{c.hindi}</div>
                                            </div>
                                            {form.community === c.value && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500
                                        rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-3">
                                    I am a · मैं हूँ *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ v: 'male', e: '🤵', l: 'Groom', h: 'दूल्हा' }, { v: 'female', e: '👰', l: 'Bride', h: 'दुल्हन' }].map(g => (
                                        <button key={g.v} type="button" onClick={() => set('gender', g.v)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                        ${form.gender === g.v
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-stone-200 bg-white hover:border-orange-300'}`}>
                                            <span className="text-2xl">{g.e}</span>
                                            <div>
                                                <div className={`font-semibold text-sm ${form.gender === g.v ? 'text-orange-700' : 'text-stone-800'}`}>{g.l}</div>
                                                <div className="text-[10px] text-stone-400">{g.h}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.community && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <p className="text-emerald-700 font-semibold text-sm">
                                            You'll browse {COMMUNITIES.find(c => c.value === form.community)?.label} profiles first
                                        </p>
                                    </div>
                                    <p className="text-emerald-600 text-xs ml-6 mt-1">
                                        Silver/Gold members can browse all communities
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* BASIC */}
                    {currentStep.id === 'basic' && (
                        <div className="space-y-4">
                            <div>
                                <label className="label">Full Name · पूरा नाम *</label>
                                <input value={form.name} onChange={e => set('name', e.target.value)}
                                    placeholder="Rahul Kumar" className="input" autoFocus />
                            </div>
                            <div>
                                <label className="label">Date of Birth · जन्म तिथि *</label>
                                <input type="date" value={form.date_of_birth}
                                    onChange={e => set('date_of_birth', e.target.value)}
                                    max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    className="input" />
                                {form.date_of_birth && (
                                    <p className="text-xs text-orange-500 mt-1 font-medium">
                                        Age: {new Date().getFullYear() - new Date(form.date_of_birth).getFullYear()} years
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="label">Mobile · मोबाइल *</label>
                                <div className="flex gap-2">
                                    <div className="input w-16 flex-shrink-0 text-center font-medium text-stone-600 bg-stone-50">+91</div>
                                    <input type="tel" value={form.phone} maxLength={10}
                                        onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
                                        placeholder="10-digit number" className="input flex-1" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Marital Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[{ v: 'never_married', l: 'Single', h: 'अविवाहित' }, { v: 'divorced', l: 'Divorced', h: 'तलाकशुदा' }, { v: 'widowed', l: 'Widowed', h: 'विधवा' }].map(m => (
                                        <button key={m.v} type="button" onClick={() => set('marital_status', m.v)}
                                            className={`py-2.5 rounded-xl border text-xs font-medium transition-all
                        ${form.marital_status === m.v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600'}`}>
                                            {m.l}<div className="text-[9px] opacity-60">{m.h}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label">Gotra · गोत्र <span className="text-stone-400 font-normal">(optional)</span></label>
                                <select value={form.gotra} onChange={e => set('gotra', e.target.value)} className="input">
                                    <option value="">Select Gotra</option>
                                    {GOTRA?.map((g: any) => <option key={g?.value || g} value={g?.value || g}>{g?.label || g}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* LOCATION */}
                    {currentStep.id === 'location' && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                                <p className="text-xs text-orange-700">
                                    📍 Profiles near your city get 3x more matches. Be specific!
                                </p>
                            </div>
                            <div>
                                <label className="label">State · राज्य *</label>
                                <select value={form.state} onChange={e => set('state', e.target.value)} className="input">
                                    <option value="">Select State</option>
                                    {STATES?.map((s: any) => <option key={s?.value || s} value={s?.value || s}>{s?.label || s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">City · शहर *</label>
                                <input value={form.city} onChange={e => set('city', e.target.value)}
                                    placeholder="Balaghat / Jabalpur / Nagpur" className="input" />
                            </div>
                            <div>
                                <label className="label">District · जिला <span className="text-stone-400 font-normal">(optional)</span></label>
                                <input value={form.district} onChange={e => set('district', e.target.value)}
                                    placeholder="Balaghat" className="input" />
                            </div>
                        </div>
                    )}

                    {/* PHOTO */}
                    {currentStep.id === 'photo' && (
                        <div className="space-y-5">
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">📸</div>
                                    <div>
                                        <p className="text-sm font-bold text-orange-800">Profiles with photo get 5x more matches</p>
                                        <p className="text-xs text-orange-700/80 mt-1">
                                            Photos visible only to verified members. Up to 5 photos. Clear face photo works best.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <label className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col
                                  items-center justify-center cursor-pointer transition-all
                  ${uploading ? 'border-orange-300 bg-orange-50 cursor-wait' : photos.length < 5 ? 'border-stone-300 hover:border-orange-400 hover:bg-orange-50/50' : 'border-stone-200 opacity-50 cursor-not-allowed'}`}>
                                    {uploading
                                        ? <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                        : <>
                                            <Camera className="w-6 h-6 text-stone-400 mb-1" />
                                            <span className="text-[10px] text-stone-400 font-medium text-center px-1">
                                                {photos.length === 0 ? 'Add photo' : 'Add more'}
                                            </span>
                                            <Plus className="w-4 h-4 text-stone-300 mt-1" />
                                        </>
                                    }
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={handlePhotoUpload}
                                        disabled={uploading || photos.length >= 5} />
                                </label>

                                {photos.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border-2 border-orange-200">
                                        <img src={url} className="w-full h-full object-cover" alt="" />
                                        {i === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 py-1 text-center">
                                                <span className="text-[9px] font-bold text-white">PRIMARY</span>
                                            </div>
                                        )}
                                        <button onClick={() => {
                                            setPhotos(p => p.filter(ph => ph !== url))
                                            if (form.photo_url === url) set('photo_url', photos.filter(ph => ph !== url)[0] || '')
                                        }}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full
                                 flex items-center justify-center shadow">
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-stone-400 text-center">{photos.length}/5 photos</p>
                        </div>
                    )}

                    {/* CAREER */}
                    {currentStep.id === 'career' && (
                        <div className="space-y-4">
                            <div>
                                <label className="label">Education · शिक्षा</label>
                                <select value={form.education} onChange={e => set('education', e.target.value)} className="input">
                                    <option value="">Select Education</option>
                                    {EDUCATION?.map((e: any) => <option key={e?.value || e} value={e?.value || e}>{e?.label || e}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Occupation · व्यवसाय</label>
                                <select value={form.occupation} onChange={e => set('occupation', e.target.value)} className="input">
                                    <option value="">Select Occupation</option>
                                    {OCCUPATION?.map((o: any) => <option key={o?.value || o} value={o?.value || o}>{o?.label || o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Height · ऊंचाई</label>
                                <select value={form.height_cm} onChange={e => set('height_cm', e.target.value)} className="input">
                                    <option value="">Select Height</option>
                                    {HEIGHTS?.map((h: any) => <option key={h?.value || h} value={h?.value || h}>{h?.label || h}</option>)}
                                </select>
                            </div>

                            {/* Final score display */}
                            <div className={`rounded-2xl p-4 border-2 mt-2
                ${score >= 60 ? 'bg-emerald-50 border-emerald-300' : score >= 40 ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-stone-800 text-sm">Your Profile Score</span>
                                    <span className={`font-black text-xl ${score >= 60 ? 'text-emerald-600' : score >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                                        {score}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                                    <div className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${score}%`, background: score >= 60 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444' }} />
                                </div>
                                <p className={`text-xs font-medium ${score >= 60 ? 'text-emerald-700' : score >= 40 ? 'text-orange-700' : 'text-red-600'}`}>
                                    {score >= 60
                                        ? '✅ Your profile will be visible to all matches!'
                                        : score >= 40
                                            ? '🌟 Profile will be submitted for admin review'
                                            : '⚠️ Add a photo and city for better visibility'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-7 pt-6 border-t border-stone-100">
                        {!currentStep.required && stepIdx < STEPS.length - 1 && (
                            <button onClick={handleSkip} disabled={saving}
                                className="px-4 py-3 text-stone-400 hover:text-stone-600 text-sm font-medium
                           border border-stone-200 rounded-2xl transition-all hover:border-stone-300">
                                Skip
                            </button>
                        )}
                        <button onClick={handleNext}
                            disabled={(!canContinue() && currentStep.required) || saving}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                          font-bold text-sm transition-all
                ${(canContinue() || !currentStep.required) && !saving
                                    ? 'bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5'
                                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}>
                            {saving
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : stepIdx === STEPS.length - 1
                                    ? <><Check className="w-4 h-4" /> Submit Profile</>
                                    : <>Save & Continue <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-2 mt-5">
                    {STEPS.map((s, i) => (
                        <button key={s.id} onClick={() => i < stepIdx && setStepIdx(i)}
                            className={`transition-all duration-300
                ${i === stepIdx ? 'w-6 h-2 bg-orange-500 rounded-full' : i < stepIdx ? 'w-2 h-2 bg-emerald-400 rounded-full' : 'w-2 h-2 bg-stone-200 rounded-full'}`} />
                    ))}
                </div>

                <p className="text-center text-[11px] text-stone-400 mt-3">
                    💾 Auto-saved · You can complete your profile anytime from dashboard
                </p>
            </div>
        </div>
    )
}
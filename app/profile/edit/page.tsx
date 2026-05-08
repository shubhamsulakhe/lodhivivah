'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Save, Camera, Loader2, ArrowLeft,
  Check, AlertCircle, Trash2
} from 'lucide-react'
import { STATES, EDUCATION, OCCUPATION, GOTRA, INCOME, HEIGHTS } from '@/lib/utils'
import toast from 'react-hot-toast'

const COMMUNITIES = [
  { value: 'lodhi_kshatriya', label: 'Lodhi Kshatriya · लोधी क्षत्रिय' },
  { value: 'yadav', label: 'Yadav Samaj · यादव समाज' },
  { value: 'kurmi', label: 'Kurmi Samaj · कुर्मी समाज' },
  { value: 'kirar', label: 'Kirar Samaj · किरार समाज' },
  { value: 'teli', label: 'Teli Samaj · तेली समाज' },
  { value: 'rajput', label: 'Rajput Samaj · राजपूत समाज' },
  { value: 'brahmin', label: 'Brahmin Samaj · ब्राह्मण समाज' },
  { value: 'kshatriya', label: 'Kshatriya Samaj · क्षत्रिय समाज' },
  { value: 'other', label: 'Other Community · अन्य' },
]

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', hindi: 'बुनियादी जानकारी' },
  { id: 'family', label: 'Family', hindi: 'परिवार' },
  { id: 'career', label: 'Education', hindi: 'शिक्षा' },
  { id: 'location', label: 'Location', hindi: 'स्थान' },
  { id: 'about', label: 'About', hindi: 'बारे में' },
]

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [activeSection, setActiveSection] = useState('basic')
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
    if (!prof) { router.push('/register'); return }
    setProfile(prof)
    setForm({ ...prof })
    setLoading(false)
  }

  function update(k: string, v: any) { setForm((p: any) => ({ ...p, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        name: form.name,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        community: form.community,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        gotra: form.gotra,
        height_cm: form.height_cm,
        complexion: form.complexion,
        marital_status: form.marital_status,
        father_name: form.father_name,
        mother_name: form.mother_name,
        brothers: Number(form.brothers) || 0,
        sisters: Number(form.sisters) || 0,
        family_type: form.family_type,
        family_status: form.family_status,
        education: form.education,
        occupation: form.occupation,
        annual_income: form.annual_income,
        about_me: form.about_me,
        city: form.city,
        state: form.state,
        district: form.district,
      }).eq('id', profile.id)
      if (error) throw error
      toast.success('Profile updated! ✅')
      router.push('/dashboard')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return }
    setPhotoUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/photo.${ext}`
      const { error: upErr } = await supabase.storage
        .from('profile-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('profiles')
        .update({ photo_url: publicUrl }).eq('id', profile.id)
      if (dbErr) throw dbErr
      setForm((p: any) => ({ ...p, photo_url: publicUrl }))
      toast.success('Photo updated! 📸')
    } catch (e: any) {
      toast.error('Photo upload failed. Check storage bucket permissions.')
    } finally { setPhotoUploading(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  const inputClass = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 outline-none focus:border-orange-400 focus:bg-white transition-all bg-[#fffaf6] placeholder:text-stone-400"
  const selectClass = inputClass
  const labelClass = "block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide"

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar />
      <div className="pt-20 pb-16 max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center
                         justify-center hover:bg-stone-50 transition-colors text-stone-600">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#431407]"
                style={{ fontFamily: 'Georgia,serif' }}>Edit Profile</h1>
              <p className="text-orange-500 text-xs font-medium">प्रोफाइल सुधारें</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#c2410c] hover:bg-[#9a3412] text-white
                       font-bold text-sm px-5 py-2.5 rounded-xl transition-all
                       shadow-md shadow-orange-200 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 mb-5 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {form.photo_url ? (
              <img src={form.photo_url}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-100"
                alt="Profile" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-orange-200
                              flex items-center justify-center text-2xl font-black text-orange-400">
                {form.name?.charAt(0)}
              </div>
            )}
            {photoUploading && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm mb-1">Profile Photo</p>
            <p className="text-stone-400 text-xs mb-3">Clear face photo works best. Max 5MB.</p>
            <label className="flex items-center gap-2 bg-orange-50 border border-orange-200
                               text-orange-700 text-xs font-bold px-4 py-2.5 rounded-xl
                               cursor-pointer hover:bg-orange-100 transition-colors w-fit">
              <Camera className="w-3.5 h-3.5" />
              {form.photo_url ? 'Change Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Section tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 hide-scrollbar">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${activeSection === s.id
                  ? 'bg-[#c2410c] text-white shadow-md shadow-orange-200'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-orange-300'}`}>
              {s.label}
              <span className={`block text-[9px] mt-0.5 ${activeSection === s.id ? 'text-orange-200' : 'text-stone-400'}`}>
                {s.hindi}
              </span>
            </button>
          ))}
        </div>

        {/* Form sections */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">

          {/* BASIC */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <h2 className="font-bold text-stone-800 mb-4">Basic Information · बुनियादी जानकारी</h2>
              <div>
                <label className={labelClass}>Full Name · पूरा नाम *</label>
                <input value={form.name || ''} onChange={e => update('name', e.target.value)}
                  placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender · लिंग *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'male', l: 'Male · पुरुष' }, { v: 'female', l: 'Female · महिला' }].map(g => (
                    <button key={g.v} type="button" onClick={() => update('gender', g.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all
                        ${form.gender === g.v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600'}`}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Date of Birth · जन्म तिथि</label>
                <input type="date" value={form.date_of_birth || ''}
                  onChange={e => update('date_of_birth', e.target.value)}
                  max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Community · समाज</label>
                <select value={form.community || ''} onChange={e => update('community', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Community</option>
                  {COMMUNITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Gotra · गोत्र</label>
                <select value={form.gotra || ''} onChange={e => update('gotra', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Gotra</option>
                  {GOTRA?.map((g: string) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Mobile · मोबाइल</label>
                <div className="flex gap-2">
                  <div className="border border-stone-200 rounded-xl px-3 py-3 text-sm font-medium
                  text-stone-600 bg-stone-50 flex-shrink-0 flex items-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={form.phone || ''}
                    maxLength={10}
                    onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Height · ऊंचाई</label>
                <select value={form.height_cm || ''} onChange={e => update('height_cm', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Height</option>
                  {HEIGHTS?.map((h: any) => (
                    <option key={typeof h === 'object' ? h.value : h} value={typeof h === 'object' ? h.value : h}>
                      {typeof h === 'object' ? h.label : h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Marital Status · वैवाहिक स्थिति</label>
                <select value={form.marital_status || ''} onChange={e => update('marital_status', e.target.value)}
                  className={selectClass}>
                  <option value="never_married">Never Married · अविवाहित</option>
                  <option value="divorced">Divorced · तलाकशुदा</option>
                  <option value="widowed">Widowed · विधवा/विधुर</option>
                </select>
              </div>
            </div>
          )}

          {/* FAMILY */}
          {activeSection === 'family' && (
            <div className="space-y-4">
              <h2 className="font-bold text-stone-800 mb-4">Family Details · परिवार</h2>
              <div>
                <label className={labelClass}>Father's Name · पिता का नाम</label>
                <input value={form.father_name || ''} onChange={e => update('father_name', e.target.value)}
                  placeholder="Ram Kumar" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mother's Name · माता का नाम</label>
                <input value={form.mother_name || ''} onChange={e => update('mother_name', e.target.value)}
                  placeholder="Sita Devi" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Brothers · भाई</label>
                  <input type="number" min={0} max={10} value={form.brothers ?? 0}
                    onChange={e => update('brothers', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sisters · बहन</label>
                  <input type="number" min={0} max={10} value={form.sisters ?? 0}
                    onChange={e => update('sisters', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Family Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'nuclear', l: 'Nuclear · एकल' }, { v: 'joint', l: 'Joint · संयुक्त' }].map(t => (
                    <button key={t.v} type="button" onClick={() => update('family_type', t.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all
                        ${form.family_type === t.v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600'}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CAREER */}
          {activeSection === 'career' && (
            <div className="space-y-4">
              <h2 className="font-bold text-stone-800 mb-4">Education & Career · शिक्षा और करियर</h2>
              <div>
                <label className={labelClass}>Education · शिक्षा</label>
                <select value={form.education || ''} onChange={e => update('education', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Education</option>
                  {EDUCATION?.map((e: string) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Occupation · व्यवसाय</label>
                <select value={form.occupation || ''} onChange={e => update('occupation', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Occupation</option>
                  {OCCUPATION?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Annual Income · वार्षिक आय</label>
                <select value={form.annual_income || ''} onChange={e => update('annual_income', e.target.value)}
                  className={selectClass}>
                  <option value="">Select Income</option>
                  {INCOME?.map((i: string) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* LOCATION */}
          {activeSection === 'location' && (
            <div className="space-y-4">
              <h2 className="font-bold text-stone-800 mb-4">Location · स्थान</h2>
              <div>
                <label className={labelClass}>State · राज्य</label>
                <select value={form.state || ''} onChange={e => update('state', e.target.value)}
                  className={selectClass}>
                  <option value="">Select State</option>
                  {STATES?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City · शहर</label>
                <input value={form.city || ''} onChange={e => update('city', e.target.value)}
                  placeholder="Jabalpur" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>District · जिला</label>
                <input value={form.district || ''} onChange={e => update('district', e.target.value)}
                  placeholder="Jabalpur" className={inputClass} />
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeSection === 'about' && (
            <div className="space-y-4">
              <h2 className="font-bold text-stone-800 mb-4">About You · अपने बारे में</h2>
              <div>
                <label className={labelClass}>About Yourself</label>
                <textarea value={form.about_me || ''}
                  onChange={e => update('about_me', e.target.value)}
                  rows={6}
                  placeholder="Write about yourself, your family background, hobbies, and what you're looking for in a life partner…"
                  className={`${inputClass} resize-none leading-relaxed`} />
                <p className="text-xs text-stone-400 mt-1.5">{(form.about_me || '').length} characters</p>
              </div>

              {/* Danger zone */}
              <div className="mt-8 pt-6 border-t border-red-100">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Danger Zone</p>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure? This will permanently delete your profile and cannot be undone.')) return
                    await supabase.from('profiles').delete().eq('id', profile.id)
                    await supabase.auth.signOut()
                    router.push('/')
                    toast.success('Account deleted.')
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-xs
                             font-semibold border border-red-200 hover:border-red-300 px-4 py-2.5
                             rounded-xl transition-all hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete my account
                </button>
              </div>
            </div>
          )}

          {/* Save button at bottom */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex gap-3">
            <button onClick={() => router.back()}
              className="px-5 py-3 bg-stone-100 text-stone-600 font-semibold text-sm
                         rounded-xl hover:bg-stone-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#c2410c]
                         hover:bg-[#9a3412] text-white font-bold text-sm py-3 rounded-xl
                         transition-colors disabled:opacity-60">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Check className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
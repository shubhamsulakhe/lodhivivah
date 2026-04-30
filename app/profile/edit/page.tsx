'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Save, Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  EDUCATION, OCCUPATION, STATES, MP_DISTRICTS,
  CG_DISTRICTS, MH_DISTRICTS, UP_DISTRICTS,
  RJ_DISTRICTS, GOTRA, INCOME, HEIGHTS
} from '@/lib/utils'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [photoFile, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPreview] = useState('')

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (!data) { router.push('/register'); return }
    setProfile(data)
    setPreview(data.photo_url || '')
    setLoading(false)
  }

  const set = (k: string, v: any) => setProfile((p: any) => ({ ...p, [k]: v }))

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5_000_000) { toast.error('Photo 5MB से छोटी होनी चाहिए'); return }
    setPhoto(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    setSaving(true)
    try {
      let photo_url = profile.photo_url

      // Upload new photo if selected
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/profile.${ext}`
        const { error: upErr } = await supabase.storage
          .from('profile-photos').upload(path, photoFile, { upsert: true })
        if (!upErr) {
          const { data: u } = supabase.storage.from('profile-photos').getPublicUrl(path)
          photo_url = u.publicUrl
        }
      }

      const { error } = await supabase.from('profiles').update({
        name: profile.name,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        height_cm: Number(profile.height_cm),
        complexion: profile.complexion,
        marital_status: profile.marital_status,
        about_me: profile.about_me,
        education: profile.education,
        education_detail: profile.education_detail,
        occupation: profile.occupation,
        occupation_detail: profile.occupation_detail,
        annual_income: profile.annual_income,
        father_name: profile.father_name,
        father_occupation: profile.father_occupation,
        mother_name: profile.mother_name,
        gotra: profile.gotra,
        manglik: profile.manglik,
        city: profile.city,
        district: profile.district,
        state: profile.state,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        photo_url,
      }).eq('user_id', userId)

      if (error) throw error
      toast.success('Profile update हो गई! ✅')
      router.push('/dashboard')
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <><Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" />
      </div></>
  )

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">
        <div className="container py-8 max-w-2xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-saffron-600 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-stone-900 mb-8">Edit Profile ✏️</h1>

          <div className="space-y-6">

            {/* Photo */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 mb-4">Profile Photo</h2>
              <div className="flex items-center gap-5">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-saffron-200" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl">
                    {profile.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    <Upload className="w-4 h-4" /> Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                  <p className="text-stone-400 text-xs mt-2">JPG, PNG. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 mb-4">Personal Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={profile.name || ''} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" className="input" value={profile.date_of_birth || ''}
                      onChange={e => set('date_of_birth', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Height</label>
                    <select className="select" value={profile.height_cm || 160}
                      onChange={e => set('height_cm', Number(e.target.value))}>
                      {HEIGHTS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Complexion</label>
                    <select className="select" value={profile.complexion || 'fair'} onChange={e => set('complexion', e.target.value)}>
                      {[['very_fair', 'Very Fair'], ['fair', 'Fair'], ['wheatish', 'Wheatish'], ['dark', 'Dark']].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Marital Status</label>
                    <select className="select" value={profile.marital_status || 'never_married'} onChange={e => set('marital_status', e.target.value)}>
                      {[
                        ['never_married', 'Never Married'],
                        ['divorced', 'Divorced'],
                        ['widowed', profile?.gender === 'male' ? 'Widower' : 'Widowed'],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* ADD GENDER SECTION HERE ↓ */}
                <div>
                  <label className="label">Your Identity / आपकी पहचान</label>
                  <p className="text-xs text-stone-400 mb-3">
                    Who are you? <span className="text-stone-300">— आप कौन हैं?</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['female', '♀ Bride', 'वधु', 'from-pink-400 to-rose-500'],
                      ['male', '♂ Groom', 'वर', 'from-blue-400 to-blue-600'],
                    ].map(([v, lbl, hindi, grad]) => (
                      <button key={v} type="button" onClick={() => set('gender', v)}
                        className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200
          ${profile.gender === v
                            ? `bg-gradient-to-br ${grad} text-white border-transparent shadow-md`
                            : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'}`}>
                        <span className="block">{lbl}</span>
                        <span className={`block text-xs font-medium mt-0.5
          ${profile.gender === v ? 'text-white/80' : 'text-stone-400'}`}>
                          {hindi}
                        </span>
                      </button>
                    ))}
                  </div>
                  {profile.gender && (
                    <div className={`mt-3 p-3 rounded-xl flex items-center gap-2.5
      ${profile.gender === 'female'
                        ? 'bg-pink-50 border border-pink-200 text-pink-700'
                        : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                      <span className="text-xl">{profile.gender === 'female' ? '♀' : '♂'}</span>
                      <div>
                        <p className="font-bold text-sm">
                          {profile.gender === 'female' ? 'I am Bride' : 'I am Groom'}
                          <span className="font-normal opacity-70 ml-1.5">
                            {profile.gender === 'female' ? '— मैं वधु हूँ' : '— मैं वर हूँ'}
                          </span>
                        </p>
                        <p className="text-xs opacity-70 mt-0.5">
                          {profile.gender === 'female'
                            ? 'Shown to Grooms — वरों को दिखेगी'
                            : 'Shown to Brides — वधुओं को दिखेगी'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">About Yourself</label>
                  <textarea className="input resize-none" rows={3} value={profile.about_me || ''}
                    onChange={e => set('about_me', e.target.value)}
                    placeholder="अपने बारे में कुछ लिखें..." />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 mb-4">Education & Career</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Education</label>
                  <select className="select" value={profile.education || ''} onChange={e => set('education', e.target.value)}>
                    <option value="">Select</option>
                    {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Education Details</label>
                  <input className="input" value={profile.education_detail || ''}
                    placeholder="e.g. B.Tech from NIT Jabalpur"
                    onChange={e => set('education_detail', e.target.value)} />
                </div>
                <div>
                  <label className="label">Occupation</label>
                  <select className="select" value={profile.occupation || ''} onChange={e => set('occupation', e.target.value)}>
                    <option value="">Select</option>
                    {OCCUPATION.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Work Details</label>
                  <input className="input" value={profile.occupation_detail || ''}
                    placeholder="e.g. Software Engineer at TCS, Pune"
                    onChange={e => set('occupation_detail', e.target.value)} />
                </div>
                <div>
                  <label className="label">Annual Income</label>
                  <select className="select" value={profile.annual_income || ''} onChange={e => set('annual_income', e.target.value)}>
                    <option value="">Select</option>
                    {INCOME.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 mb-4">Family Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Father's Name</label>
                    <input className="input" value={profile.father_name || ''} onChange={e => set('father_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Father's Occupation</label>
                    <select className="select" value={profile.father_occupation || ''} onChange={e => set('father_occupation', e.target.value)}>
                      <option value="">Select</option>
                      {OCCUPATION.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Mother's Name</label>
                  <input className="input" value={profile.mother_name || ''} onChange={e => set('mother_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Gotra</label>
                  <select className="select" value={profile.gotra || ''} onChange={e => set('gotra', e.target.value)}>
                    <option value="">Select</option>
                    {GOTRA.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 bg-saffron-50 border border-saffron-100 rounded-2xl p-4">
                  <input type="checkbox" id="manglik" className="w-5 h-5 accent-saffron-500"
                    checked={profile.manglik || false} onChange={e => set('manglik', e.target.checked)} />
                  <label htmlFor="manglik" className="font-semibold text-stone-700 cursor-pointer">
                    मांगलिक (Manglik)
                  </label>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 mb-4">Location & Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">State</label>
                  <select className="select" value={profile.state || 'Madhya Pradesh'} onChange={e => set('state', e.target.value)}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">District</label>
                    <select className="select" value={profile.district || ''}
                      onChange={e => set('district', e.target.value)}>
                      <option value="">Select district</option>
                      {profile.state === 'Madhya Pradesh' && MP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      {profile.state === 'Chhattisgarh' && CG_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      {profile.state === 'Maharashtra' && MH_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      {profile.state === 'Uttar Pradesh' && UP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      {profile.state === 'Rajasthan' && RJ_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      {!['Madhya Pradesh', 'Chhattisgarh', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan']
                        .includes(profile.state) && <option value="Other">Other</option>}
                    </select>
                  </div>
                  <div>
                    <label className="label">City / Village</label>
                    <input className="input" value={profile.city || ''} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Mobile Number</label>
                    <input className="input" value={profile.phone || ''} maxLength={10}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label className="label">WhatsApp</label>
                    <input className="input" value={profile.whatsapp || ''} maxLength={10}
                      onChange={e => set('whatsapp', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button onClick={handleSave} disabled={saving}
              className="btn btn-primary btn-lg w-full justify-center">
              {saving
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                : <><Save className="w-5 h-5" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check, Loader2, Upload, ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'
import { EDUCATION, OCCUPATION, STATES, MP_DISTRICTS, GOTRA, INCOME, HEIGHTS } from '@/lib/utils'

const STEPS = [
  { id: 0, title: 'Account',    icon: '👤', desc: 'Login details' },
  { id: 1, title: 'Personal',   icon: '📋', desc: 'Personal info' },
  { id: 2, title: 'Education',  icon: '🎓', desc: 'Career info' },
  { id: 3, title: 'Family',     icon: '👨‍👩‍👧', desc: 'Family details' },
  { id: 4, title: 'Location',   icon: '📍', desc: 'Where you live' },
  { id: 5, title: 'Photo',      icon: '📸', desc: 'Upload photo' },
]

const INIT = {
  email:'', password:'', confirm_password:'',
  name:'', gender:'female', date_of_birth:'', height_cm:160,
  complexion:'fair', marital_status:'never_married', about_me:'',
  education:'', education_detail:'', occupation:'', occupation_detail:'', annual_income:'',
  father_name:'', father_occupation:'', mother_name:'', gotra:'', manglik:false,
  city:'', district:'', state:'Madhya Pradesh', phone:'', whatsapp:'',
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState(INIT)
  const [loading, setLoading]   = useState(false)
  const [photoFile, setPhoto]   = useState<File|null>(null)
  const [photoUrl, setPhotoUrl] = useState('')

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  function validate(): boolean {
    if (step === 0) {
      if (!form.email || !form.password) { toast.error('Email और Password जरूरी है'); return false }
      if (form.password.length < 6) { toast.error('Password कम से कम 6 characters का होना चाहिए'); return false }
      if (form.password !== form.confirm_password) { toast.error('Passwords match नहीं होते'); return false }
    }
    if (step === 1) {
      if (!form.name || !form.date_of_birth) { toast.error('नाम और जन्म तारीख जरूरी है'); return false }
    }
    if (step === 2) {
      if (!form.education || !form.occupation) { toast.error('Education और Occupation जरूरी है'); return false }
    }
    if (step === 3) {
      if (!form.father_name) { toast.error('पिताजी का नाम जरूरी है'); return false }
    }
    if (step === 4) {
      if (!form.phone || form.phone.length < 10) { toast.error('सही mobile number डालें'); return false }
      if (!form.city || !form.district) { toast.error('City और District जरूरी है'); return false }
    }
    return true
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5_000_000) { toast.error('Photo 5MB से छोटी होनी चाहिए'); return }
    setPhoto(f)
    setPhotoUrl(URL.createObjectURL(f))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      // 1. Create auth account
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { name: form.name, phone: form.phone } }
      })
      if (authErr) throw authErr
      const uid = authData.user?.id
      if (!uid) throw new Error('Account creation failed')

      // 2. Upload photo
      let photo_url = ''
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const { error: upErr } = await supabase.storage
          .from('profile-photos')
          .upload(`${uid}/profile.${ext}`, photoFile, { upsert: true })
        if (!upErr) {
          const { data: u } = supabase.storage.from('profile-photos').getPublicUrl(`${uid}/profile.${ext}`)
          photo_url = u.publicUrl
        }
      }

      // 3. Create profile
      const { error: profErr } = await supabase.from('profiles').insert({
        user_id: uid,
        name: form.name, gender: form.gender,
        date_of_birth: form.date_of_birth, height_cm: Number(form.height_cm),
        complexion: form.complexion, marital_status: form.marital_status, about_me: form.about_me,
        education: form.education, education_detail: form.education_detail,
        occupation: form.occupation, occupation_detail: form.occupation_detail,
        annual_income: form.annual_income,
        father_name: form.father_name, father_occupation: form.father_occupation,
        mother_name: form.mother_name, gotra: form.gotra, manglik: form.manglik,
        city: form.city, district: form.district, state: form.state,
        phone: form.phone, whatsapp: form.whatsapp || form.phone,
        photo_url, status: 'pending',
      })
      if (profErr) throw profErr

      toast.success('Registration successful! Profile review में है 🎉')
      router.push('/dashboard?new=1')
    } catch (e: any) {
      toast.error(e.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (!validate()) return
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size="sm"/>
          <Link href="/login" className="text-sm text-stone-500 hover:text-saffron-600 transition-colors">
            Already registered? Login
          </Link>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-saffron-500 text-white shadow-glow' : 'bg-stone-200 text-stone-400'}`}>
                  {i < step ? <Check className="w-4 h-4"/> : s.icon}
                </div>
                <span className={`text-[10px] mt-1 hidden sm:block font-semibold
                  ${i === step ? 'text-saffron-600' : 'text-stone-400'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-saffron-600 to-saffron-400 rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }}/>
          </div>
          <p className="text-right text-xs text-stone-400 mt-1">Step {step+1} of {STEPS.length}</p>
        </div>

        {/* Form card */}
        <div className="card p-7">
          <h2 className="text-xl font-black text-stone-900 mb-1">
            {STEPS[step].icon} {STEPS[step].title}
          </h2>
          <p className="text-stone-400 text-sm mb-7">{STEPS[step].desc}</p>

          {/* ── STEP 0: Account ─────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input" placeholder="your@email.com"
                  value={form.email} onChange={e => set('email', e.target.value)}/>
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input" placeholder="Minimum 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)}/>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className="input" placeholder="Re-enter password"
                  value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}/>
              </div>
            </div>
          )}

          {/* ── STEP 1: Personal ────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input type="text" className="input" placeholder="Your full name"
                  value={form.name} onChange={e => set('name', e.target.value)}/>
              </div>
              <div>
                <label className="label">Profile For *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[['female','♀ Bride (वधू)','from-pink-400 to-rose-500'],['male','♂ Groom (वर)','from-blue-400 to-blue-600']].map(([v,lbl,grad]) => (
                    <button key={v} type="button" onClick={() => set('gender', v)}
                      className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all
                        ${form.gender === v
                          ? `bg-gradient-to-br ${grad} text-white border-transparent shadow-md`
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth *</label>
                  <input type="date" className="input"
                    max={new Date(Date.now() - 18*365*24*60*60*1000).toISOString().split('T')[0]}
                    value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)}/>
                </div>
                <div>
                  <label className="label">Height</label>
                  <select className="select" value={form.height_cm} onChange={e => set('height_cm', Number(e.target.value))}>
                    {HEIGHTS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Complexion</label>
                  <select className="select" value={form.complexion} onChange={e => set('complexion', e.target.value)}>
                    {[['very_fair','Very Fair'],['fair','Fair'],['wheatish','Wheatish'],['dark','Dark']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Marital Status</label>
                  <select className="select" value={form.marital_status} onChange={e => set('marital_status', e.target.value)}>
                    {[['never_married','Never Married'],['divorced','Divorced'],['widowed','Widowed']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">About Yourself</label>
                <textarea className="input resize-none" rows={3}
                  placeholder="अपने बारे में कुछ लिखें — interests, lifestyle..."
                  value={form.about_me} onChange={e => set('about_me', e.target.value)}/>
              </div>
            </div>
          )}

          {/* ── STEP 2: Education ───────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Highest Education *</label>
                <select className="select" value={form.education} onChange={e => set('education', e.target.value)}>
                  <option value="">Select education</option>
                  {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Education Details</label>
                <input type="text" className="input" placeholder="e.g. B.Tech CSE from NIT Jabalpur"
                  value={form.education_detail} onChange={e => set('education_detail', e.target.value)}/>
              </div>
              <div>
                <label className="label">Occupation *</label>
                <select className="select" value={form.occupation} onChange={e => set('occupation', e.target.value)}>
                  <option value="">Select occupation</option>
                  {OCCUPATION.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Occupation Details</label>
                <input type="text" className="input" placeholder="e.g. Software Engineer at TCS, Pune"
                  value={form.occupation_detail} onChange={e => set('occupation_detail', e.target.value)}/>
              </div>
              <div>
                <label className="label">Annual Income</label>
                <select className="select" value={form.annual_income} onChange={e => set('annual_income', e.target.value)}>
                  <option value="">Select income range</option>
                  {INCOME.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 3: Family ──────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Father's Name *</label>
                  <input type="text" className="input" placeholder="पिताजी का नाम"
                    value={form.father_name} onChange={e => set('father_name', e.target.value)}/>
                </div>
                <div>
                  <label className="label">Father's Occupation</label>
                  <select className="select" value={form.father_occupation} onChange={e => set('father_occupation', e.target.value)}>
                    <option value="">Select</option>
                    {OCCUPATION.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Mother's Name</label>
                <input type="text" className="input" placeholder="माताजी का नाम"
                  value={form.mother_name} onChange={e => set('mother_name', e.target.value)}/>
              </div>
              <div>
                <label className="label">Gotra</label>
                <select className="select" value={form.gotra} onChange={e => set('gotra', e.target.value)}>
                  <option value="">Select gotra</option>
                  {GOTRA.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 bg-saffron-50 border border-saffron-100 rounded-2xl p-4">
                <input type="checkbox" id="manglik" className="w-5 h-5 accent-saffron-500 rounded"
                  checked={form.manglik} onChange={e => set('manglik', e.target.checked)}/>
                <label htmlFor="manglik" className="text-stone-700 font-semibold cursor-pointer">
                  मांगलिक (Manglik)
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 4: Location ────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="label">Mobile Number *</label>
                <div className="flex gap-2">
                  <span className="input w-16 text-center bg-stone-50 flex-shrink-0">+91</span>
                  <input type="tel" className="input flex-1" maxLength={10} placeholder="10-digit mobile number"
                    value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,''))}/>
                </div>
              </div>
              <div>
                <label className="label">WhatsApp Number</label>
                <div className="flex gap-2">
                  <span className="input w-16 text-center bg-stone-50 flex-shrink-0">+91</span>
                  <input type="tel" className="input flex-1" maxLength={10} placeholder="Same as mobile (optional)"
                    value={form.whatsapp} onChange={e => set('whatsapp', e.target.value.replace(/\D/g,''))}/>
                </div>
              </div>
              <div>
                <label className="label">State *</label>
                <select className="select" value={form.state} onChange={e => set('state', e.target.value)}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">District *</label>
                  {form.state === 'Madhya Pradesh' ? (
                    <select className="select" value={form.district} onChange={e => set('district', e.target.value)}>
                      <option value="">Select district</option>
                      {MP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="input" placeholder="District name"
                      value={form.district} onChange={e => set('district', e.target.value)}/>
                  )}
                </div>
                <div>
                  <label className="label">City / Village *</label>
                  <input type="text" className="input" placeholder="City or village"
                    value={form.city} onChange={e => set('city', e.target.value)}/>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Photo ───────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center">
                {photoUrl ? (
                  <div className="relative mb-4">
                    <img src={photoUrl} alt="Preview"
                      className="w-40 h-40 rounded-3xl object-cover border-4 border-saffron-200 shadow-xl"/>
                    <button type="button" onClick={() => { setPhotoUrl(''); setPhoto(null) }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full text-lg font-bold flex items-center justify-center shadow-md">
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300
                                  flex flex-col items-center justify-center mb-4 text-stone-400">
                    <span className="text-4xl">📷</span>
                    <span className="text-xs mt-2">No photo</span>
                  </div>
                )}
                <label className="btn btn-outline btn-sm cursor-pointer">
                  <Upload className="w-4 h-4"/>
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                </label>
                <p className="text-xs text-stone-400 mt-2">JPG, PNG. Max 5MB. साफ चेहरे की photo लगाएं।</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="font-bold text-emerald-800 mb-2">✅ Almost there!</p>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Profile 24 hours में review होगा</li>
                  <li>• Approve होने पर notification मिलेगी</li>
                  <li>• Photo लगाने से ज्यादा responses मिलते हैं</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s-1)}
                className="btn btn-outline btn-md">
                <ChevronLeft className="w-4 h-4"/> Back
              </button>
            )}
            <button type="button" onClick={next} disabled={loading}
              className="btn btn-primary btn-md flex-1 justify-center">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin"/>
                : step === STEPS.length-1
                  ? <><Check className="w-4 h-4"/> Submit Profile</>
                  : <>Next <ChevronRight className="w-4 h-4"/></>
              }
            </button>
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-stone-400">
          Already registered?{' '}
          <Link href="/login" className="text-saffron-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

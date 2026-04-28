'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check, Loader2, Upload, ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'
import { EDUCATION, OCCUPATION, STATES, MP_DISTRICTS, GOTRA, INCOME, HEIGHTS } from '@/lib/utils'
import { Suspense } from 'react'

const STEPS = [
  { id: 0, title: 'Personal',   icon: '👤', desc: 'Basic information' },
  { id: 1, title: 'Education',  icon: '🎓', desc: 'Education & career' },
  { id: 2, title: 'Family',     icon: '👨‍👩‍👧', desc: 'Family details' },
  { id: 3, title: 'Location',   icon: '📍', desc: 'Where you live' },
  { id: 4, title: 'Photo',      icon: '📸', desc: 'Profile photo' },
]

const INIT = {
  name:'', gender:'female', date_of_birth:'', height_cm:160,
  complexion:'fair', marital_status:'never_married', about_me:'',
  education:'', education_detail:'', occupation:'', occupation_detail:'', annual_income:'',
  father_name:'', father_occupation:'', mother_name:'', gotra:'', manglik:false,
  city:'', district:'', state:'Madhya Pradesh', phone:'', whatsapp:'',
}

function RegisterContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState(INIT)
  const [loading, setLoading]   = useState(false)
  const [checkingAuth, setChecking] = useState(true)
  const [photoFile, setPhoto]   = useState<File|null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [userId, setUserId]     = useState('')

  // Check if user is logged in (came from login flow)
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please verify your email first')
      router.push('/login')
      return
    }
    setUserId(user.id)

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (existing) {
      router.push('/dashboard')
      return
    }

    // Pre-fill email info
    setChecking(false)
  }

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5_000_000) { toast.error('Photo must be under 5MB'); return }
    setPhoto(f)
    setPhotoUrl(URL.createObjectURL(f))
  }

  function validate(): boolean {
    if (step === 0) {
      if (!form.name) { toast.error('Please enter your full name'); return false }
      if (!form.date_of_birth) { toast.error('Please enter date of birth'); return false }
    }
    if (step === 1) {
      if (!form.education) { toast.error('Please select education'); return false }
      if (!form.occupation) { toast.error('Please select occupation'); return false }
    }
    if (step === 2) {
      if (!form.father_name) { toast.error("Please enter father's name"); return false }
    }
    if (step === 3) {
      if (!form.phone || form.phone.length < 10) { toast.error('Enter valid 10-digit mobile number'); return false }
      if (!form.city || !form.district) { toast.error('Please enter city and district'); return false }
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      let photo_url = ''
      if (photoFile && userId) {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/profile.${ext}`
        const { error: upErr } = await supabase.storage
          .from('profile-photos').upload(path, photoFile, { upsert: true })
        if (!upErr) {
          const { data: u } = supabase.storage.from('profile-photos').getPublicUrl(path)
          photo_url = u.publicUrl
        }
      }

      const { error } = await supabase.from('profiles').insert({
        user_id: userId,
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
      if (error) throw error

      toast.success('Profile submitted! Under review. 🎉')
      router.push('/dashboard?new=1')
    } catch (e: any) {
      toast.error(e.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (!validate()) return
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  if (checkingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-stone-500">Verifying your account...</p>
      </div>
    </div>
  )

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size="sm"/>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4"/>
            Email Verified
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                 transition-all duration-300 shadow-sm
                  ${i < step  ? 'bg-emerald-500 text-white'
                  : i === step ? 'bg-saffron-500 text-white shadow-glow scale-110'
                  : 'bg-stone-200 text-stone-400'}`}>
                  {i < step ? <Check className="w-5 h-5"/> : s.icon}
                </div>
                <span className={`text-xs mt-1.5 hidden sm:block font-semibold
                  ${i === step ? 'text-saffron-600' : i < step ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-saffron-600 to-saffron-400 rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }}/>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-stone-400">Step {step+1} of {STEPS.length}</p>
            <p className="text-xs text-saffron-600 font-semibold">{Math.round(progress)}% complete</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-card p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-stone-900">
              {STEPS[step].icon} {STEPS[step].title}
            </h2>
            <p className="text-stone-400 text-sm mt-1">{STEPS[step].desc}</p>
          </div>

          {/* STEP 0: Personal */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="label">Full Name *</label>
                <input type="text" className="input" placeholder="Your full name"
                  value={form.name} onChange={e => set('name', e.target.value)}/>
              </div>
              <div>
                <label className="label">Profile For *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[['female','♀ Bride (Vadhu)','from-pink-400 to-rose-500'],
                    ['male','♂ Groom (Var)','from-blue-400 to-blue-600']].map(([v,lbl,grad]) => (
                    <button key={v} type="button" onClick={() => set('gender', v)}
                      className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                        ${form.gender === v
                          ? `bg-gradient-to-br ${grad} text-white border-transparent shadow-md`
                          : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth *</label>
                  <input type="date" className="input"
                    max={new Date(Date.now()-18*365*24*60*60*1000).toISOString().split('T')[0]}
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
                  placeholder="Write a few lines about yourself — interests, lifestyle, values..."
                  value={form.about_me} onChange={e => set('about_me', e.target.value)}/>
              </div>
            </div>
          )}

          {/* STEP 1: Education */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Highest Education *</label>
                <select className="select" value={form.education} onChange={e => set('education', e.target.value)}>
                  <option value="">Select education</option>
                  {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Education Details</label>
                <input type="text" className="input" placeholder="e.g. B.Tech in CSE from NIT Jabalpur"
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
                <label className="label">Work Details</label>
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

          {/* STEP 2: Family */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Father's Name *</label>
                  <input type="text" className="input" placeholder="Father's full name"
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
                <input type="text" className="input" placeholder="Mother's full name"
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
                <input type="checkbox" id="manglik" className="w-5 h-5 accent-saffron-500"
                  checked={form.manglik} onChange={e => set('manglik', e.target.checked)}/>
                <label htmlFor="manglik" className="font-semibold text-stone-700 cursor-pointer">
                  Manglik (मांगलिक)
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Mobile Number *</label>
                <div className="flex gap-2">
                  <span className="input w-16 flex-shrink-0 flex items-center justify-center bg-stone-50 font-bold text-stone-600">
                    +91
                  </span>
                  <input type="tel" className="input flex-1" maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,''))}/>
                </div>
              </div>
              <div>
                <label className="label">WhatsApp Number</label>
                <div className="flex gap-2">
                  <span className="input w-16 flex-shrink-0 flex items-center justify-center bg-stone-50 font-bold text-stone-600">
                    +91
                  </span>
                  <input type="tel" className="input flex-1" maxLength={10}
                    placeholder="Same as mobile (optional)"
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

          {/* STEP 4: Photo */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                {photoUrl ? (
                  <div className="relative mb-5">
                    <img src={photoUrl} alt="Preview"
                      className="w-44 h-44 rounded-3xl object-cover border-4 border-saffron-200 shadow-xl"/>
                    <button type="button"
                      onClick={() => { setPhotoUrl(''); setPhoto(null) }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full
                                 text-lg font-bold flex items-center justify-center shadow-md hover:bg-red-600">
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-44 h-44 rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300
                                  flex flex-col items-center justify-center mb-5 text-stone-400">
                    <span className="text-5xl mb-2">📷</span>
                    <span className="text-sm">No photo yet</span>
                  </div>
                )}
                <label className="btn btn-outline btn-md cursor-pointer">
                  <Upload className="w-4 h-4"/>
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                </label>
                <p className="text-xs text-stone-400 mt-3 text-center">
                  JPG, PNG. Max 5MB. A clear face photo gets more responses.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <p className="font-bold text-emerald-800 mb-2">✅ Almost done!</p>
                <ul className="text-sm text-emerald-700 space-y-1.5">
                  <li>• Your profile will be reviewed within 24 hours</li>
                  <li>• You'll get notified once approved</li>
                  <li>• Your email is verified ✓</li>
                  <li>• Photos get 3x more profile views</li>
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

        <p className="text-center mt-5 text-sm text-stone-400">
          Already have a profile?{' '}
          <Link href="/dashboard" className="text-saffron-600 font-bold hover:underline">Go to Dashboard</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"/>
      </div>
    }>
      <RegisterContent/>
    </Suspense>
  )
}

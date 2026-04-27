import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInYears, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAge(dob: string): number {
  try { return differenceInYears(new Date(), parseISO(dob)) } catch { return 0 }
}

export function cmToFeet(cm: number): string {
  const inches = Math.round(cm / 2.54)
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

export const EDUCATION = [
  '10th Pass','12th Pass','Diploma','ITI','B.A.','B.Sc.','B.Com.',
  'B.Tech / B.E.','BCA','BBA','MBBS','BHMS / BAMS','B.Ed.',
  'M.A.','M.Sc.','M.Com.','M.Tech','MCA','MBA','LLB','Ph.D.','Other',
]

export const OCCUPATION = [
  'Government Employee','Private Employee','Business / Self Employed',
  'Doctor','Engineer','Teacher / Professor','Lawyer',
  'Army / Police / Defence','Farmer','Software Engineer / IT',
  'Bank Employee','Nurse / Healthcare','Not Working','Student','Other',
]

export const STATES = [
  'Madhya Pradesh','Maharashtra','Chhattisgarh','Uttar Pradesh',
  'Rajasthan','Gujarat','Karnataka','Delhi','Other',
]

export const MP_DISTRICTS = [
  'Balaghat','Bhopal','Chhindwara','Jabalpur','Katni',
  'Mandla','Narsinghpur','Seoni','Dindori','Other',
]

export const GOTRA = [
  'Kashyap','Bharadwaj','Vatsa','Atri','Gautam',
  'Vishwamitra','Vasistha','Sandilya','Garg','Other',
]

export const INCOME = [
  'Below ₹2 Lakh','₹2-5 Lakh','₹5-10 Lakh',
  '₹10-15 Lakh','₹15-25 Lakh','Above ₹25 Lakh',
]

export const HEIGHTS = Array.from({ length: 46 }, (_, i) => {
  const cm = 145 + i
  return { value: cm, label: `${cmToFeet(cm)} (${cm} cm)` }
})

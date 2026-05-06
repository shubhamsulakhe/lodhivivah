export const COMMUNITIES = [
    { value: 'lodhi_kshatriya', label: 'Lodhi Kshatriya', hindi: 'लोधी क्षत्रिय', active: true, priority: 1 },
    { value: 'pawar', label: 'Pawar', hindi: 'पवार समाज ', active: true, priority: 2 },
    { value: 'kirar', label: 'Kirar Samaj', hindi: 'किरार समाज', active: true, priority: 3 },
    { value: 'kurmi', label: 'Kurmi Samaj', hindi: 'कुर्मी समाज', active: true, priority: 4 },
    { value: 'teli', label: 'Teli Samaj', hindi: 'तेली समाज', active: true, priority: 5 },
    { value: 'yadav', label: 'Yadav Samaj', hindi: 'यादव समाज', active: true, priority: 6 },
    { value: 'gond', label: 'Gond Samaj', hindi: 'गोंड समाज', active: true, priority: 7 },
    { value: 'rajput', label: 'Rajput Samaj', hindi: 'राजपूत समाज', active: false, priority: 8 },
    { value: 'brahmin', label: 'Brahmin Samaj', hindi: 'ब्राह्मण समाज', active: false, priority: 9 },
    { value: 'kshatriya', label: 'Kshatriya Samaj', hindi: 'क्षत्रिय समाज', active: false, priority: 10 },
    { value: 'other', label: 'Other Community', hindi: 'अन्य समाज', active: true, priority: 11 },
] as const

export function getCommunityLabel(value: string) {
    return COMMUNITIES.find(c => c.value === value)?.label || value?.replace(/_/g, ' ')
}
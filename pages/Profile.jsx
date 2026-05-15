import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const FIELDS = [
    ['name', 'Full Name', 'text'], ['phone', 'Phone Number', 'tel'],
    ['education', 'Education', 'text'], ['experience', 'Years of Experience', 'text'],
    ['linkedin', 'LinkedIn URL', 'url'], ['github', 'GitHub URL', 'url']
]

export default function Profile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState({ name: '', phone: '', education: '', experience: '', linkedin: '', github: '', skills: [] })
    const [editing, setEditing] = useState(false)
    const [skillInput, setSkillInput] = useState('')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        api.get('/profile/').then(({ data }) => setProfile({ ...profile, ...data })).catch(() => { })
    }, [])

    const completion = Math.round(Object.values(profile).filter(v => v && (Array.isArray(v) ? v.length > 0 : v.trim?.())).length / 8 * 100)

    const saveProfile = async () => {
        try { await api.put('/profile/', profile); setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 2000) } catch { }
    }

    const addSkill = e => {
        if (e.key === 'Enter' && skillInput.trim()) {
            setProfile(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }))
            setSkillInput('')
        }
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="font-display font-bold text-4xl text-ink mb-2">Your Profile</h1>
                <p className="text-ink-muted font-body">Complete your profile to get better job recommendations</p>
            </motion.div>

            {/* Completion Bar */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-semibold text-ink">Profile Completion</span>
                    <span className="font-display font-bold text-brand-700 text-2xl">{completion}%</span>
                </div>
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-brand-600 to-blue-400 rounded-full" />
                </div>
                <p className="text-ink-muted text-sm font-body mt-2">{completion < 60 ? 'Add more details to improve job matching' : 'Great profile! You\'re ready for top matches.'}</p>
            </div>

            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-brand-700 rounded-3xl flex items-center justify-center text-white font-display font-bold text-2xl">
                            {profile.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-xl text-ink">{profile.name || 'Your Name'}</h2>
                            <p className="text-ink-muted font-body text-sm">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={editing ? saveProfile : () => setEditing(true)}
                        className={`px-6 py-3 rounded-2xl font-body font-medium transition-all
              ${editing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-brand-700 text-white hover:bg-brand-600'}`}>
                        {saved ? '✓ Saved' : editing ? 'Save Profile' : 'Edit Profile'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-6">
                    {FIELDS.map(([field, label, type]) => (
                        <div key={field}>
                            <label className="block text-sm font-body font-medium text-ink-muted mb-2">{label}</label>
                            <input type={type} value={profile[field] || ''}
                                onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                                disabled={!editing}
                                className={`w-full px-4 py-3 rounded-2xl font-body text-ink border transition-all
                  ${editing ? 'border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none' : 'border-transparent bg-blue-50'}`}
                                placeholder={editing ? label : '—'} />
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-body font-medium text-ink-muted mb-2">Skills (press Enter to add)</label>
                    {editing && (
                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill}
                            className="w-full px-4 py-3 rounded-2xl font-body text-ink border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none mb-3"
                            placeholder="e.g. React, Python, SQL" />
                    )}
                    <div className="flex flex-wrap gap-2">
                        {profile.skills?.map((s, i) => (
                            <span key={i} className="bg-blue-100 text-brand-800 px-4 py-1.5 rounded-full text-sm font-body font-medium flex items-center gap-2">
                                {s}
                                {editing && <button onClick={() => setProfile(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))}>×</button>}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
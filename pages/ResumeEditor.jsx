import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import api from '../api/axios'

const SECTIONS = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']
const SECTION_LABELS = {
    summary: 'Professional Summary',
    skills: 'Technical Skills',
    experience: 'Work Experience',
    projects: 'Projects',
    education: 'Education',
    certifications: 'Certifications'
}
const SECTION_TIPS = {
    summary: 'Write 3-4 lines. Mention your role, years of experience, and top 2 skills.',
    skills: 'List skills in groups: Languages · Frameworks · Tools · Cloud. Comma separated.',
    experience: 'Format: Company | Role | Date\n• Action verb + task + impact\n• Quantify results (e.g. reduced load time by 40%)',
    projects: 'Format: Project Name | Tech Stack\n• What it does, what you built, impact/users',
    education: 'Degree, Institution, Year, CGPA/Percentage',
    certifications: 'Certification Name — Issuer (Year)'
}
const STRONG_VERBS = ['Developed', 'Built', 'Designed', 'Implemented', 'Optimized', 'Led', 'Managed', 'Created',
    'Deployed', 'Automated', 'Reduced', 'Increased', 'Improved', 'Analyzed', 'Delivered', 'Engineered', 'Launched', 'Scaled']

function debounce(fn, delay) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay) }
}

export default function ResumeEditor() {
    const [header, setHeader] = useState({ name: '', email: '', phone: '' })
    const [sections, setSections] = useState({
        summary: '', skills: '', experience: '', projects: '', education: '', certifications: ''
    })
    const [activeSection, setActiveSection] = useState('summary')
    const [ats, setAts] = useState(null)
    const [rescoring, setRescoring] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [insertVerb, setInsertVerb] = useState('')
    const textareaRef = useRef(null)

    // Build full text for scoring
    const buildFullText = (h, s) =>
        `${h.name}\n${h.email}\n${h.phone}\n\n` +
        SECTIONS.map(k => `${SECTION_LABELS[k]}\n${s[k]}`).join('\n\n')

    // Live rescore with debounce
    const rescore = useCallback(debounce(async (h, s) => {
        const text = buildFullText(h, s)
        if (text.trim().length < 50) return
        setRescoring(true)
        try {
            const { data } = await api.post('/editor/rescore', { text })
            setAts(data.ats)
        } catch { /* silently fail if backend not running */ }
        finally { setRescoring(false) }
    }, 900), [])

    useEffect(() => { rescore(header, sections) }, [header, sections])

    const updateSection = (key, val) => setSections(p => ({ ...p, [key]: val }))

    const insertVerbToEditor = (verb) => {
        const ta = textareaRef.current
        if (!ta) return
        const start = ta.selectionStart
        const val = sections[activeSection]
        const newVal = val.slice(0, start) + verb + ' ' + val.slice(start)
        updateSection(activeSection, newVal)
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + verb.length + 1 }, 0)
    }

    const downloadPDF = async () => {
        setDownloading(true)
        try {
            const res = await api.post('/editor/build-pdf',
                { sections, name: header.name, email: header.email, phone: header.phone },
                { responseType: 'blob' }
            )
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            const a = document.createElement('a'); a.href = url
            a.download = `ats_resume_${header.name.replace(' ', '_') || 'resume'}.pdf`
            a.click(); URL.revokeObjectURL(url)
        } catch (e) { alert('Download failed. Make sure backend is running.') }
        finally { setDownloading(false) }
    }

    const score = ats?.ats_score ?? 0
    const scoreColor = score >= 70 ? '#16a34a' : score >= 45 ? '#d97706' : '#dc2626'
    const radarData = ats ? [
        { subject: 'Keywords', A: Math.min(100, (ats.ats_keywords_found?.length || 0) * 15) },
        { subject: 'Skills', A: Math.min(100, score) },
        { subject: 'Verbs', A: Math.min(100, (ats.strong_verbs_found?.length || 0) * 12) },
        { subject: 'Sections', A: Math.min(100, Object.values(sections).filter(v => v.trim()).length * 16) },
        { subject: 'Length', A: Math.min(100, Object.values(sections).join(' ').split(' ').length / 7) },
    ] : []

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-4xl text-ink mb-1">ATS Resume Editor</h1>
                        <p className="text-ink-muted font-body text-sm">Edit each section — AI rescores live as you type</p>
                    </div>
                    <button onClick={downloadPDF} disabled={downloading}
                        className="px-6 py-3 bg-brand-700 hover:bg-brand-600 text-white font-display font-semibold rounded-2xl transition-all hover:shadow-lg disabled:opacity-60 flex items-center gap-2">
                        {downloading ? '⏳ Generating...' : '⬇ Download PDF'}
                    </button>
                </div>
            </motion.div>

            <div className="flex gap-6">
                {/* LEFT: Editor */}
                <div className="flex-1 space-y-4">

                    {/* Header Fields */}
                    <div className="glass-card p-6">
                        <h3 className="font-display font-semibold text-base text-ink mb-4">Personal Details</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[['name', 'Full Name'], ['email', 'Email'], ['phone', 'Phone']].map(([f, l]) => (
                                <div key={f}>
                                    <label className="text-xs font-body text-ink-muted mb-1 block">{l}</label>
                                    <input value={header[f]} onChange={e => setHeader(p => ({ ...p, [f]: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-white font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={l} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="glass-card overflow-hidden">
                        <div className="flex border-b border-blue-100 overflow-x-auto">
                            {SECTIONS.map(s => (
                                <button key={s} onClick={() => setActiveSection(s)}
                                    className={`px-5 py-3.5 font-body text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                    ${activeSection === s
                                            ? 'bg-brand-700 text-white'
                                            : 'text-ink-muted hover:text-ink hover:bg-blue-50'}`}>
                                    {sections[s].trim() && <span className={`w-1.5 h-1.5 rounded-full ${activeSection === s ? 'bg-white' : 'bg-green-400'}`} />}
                                    {SECTION_LABELS[s]}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* Tip */}
                            <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-sm font-body text-brand-800 whitespace-pre-line border border-blue-100">
                                <span className="font-semibold">💡 Tip: </span>{SECTION_TIPS[activeSection]}
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={sections[activeSection]}
                                onChange={e => updateSection(activeSection, e.target.value)}
                                rows={12}
                                placeholder={`Write your ${SECTION_LABELS[activeSection]} here...\n\n${SECTION_TIPS[activeSection]}`}
                                className="w-full px-5 py-4 rounded-2xl border border-blue-100 bg-white font-body text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 leading-relaxed"
                            />

                            {/* Word count */}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-ink-muted font-body">
                                    {sections[activeSection].trim().split(/\s+/).filter(Boolean).length} words
                                </span>
                                <span className={`text-xs font-body ${sections[activeSection].trim() ? 'text-green-600' : 'text-ink-muted'}`}>
                                    {sections[activeSection].trim() ? '✓ Filled' : 'Empty'}
                                </span>
                            </div>

                            {/* Action verb inserter */}
                            <div className="mt-4">
                                <p className="text-xs font-body text-ink-muted mb-2">Insert action verb at cursor:</p>
                                <div className="flex flex-wrap gap-2">
                                    {STRONG_VERBS.map(v => (
                                        <button key={v} onClick={() => insertVerbToEditor(v)}
                                            className="px-3 py-1 bg-white border border-blue-200 text-brand-700 rounded-xl text-xs font-body font-medium hover:bg-brand-700 hover:text-white transition-all">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live ATS Panel */}
                <div className="w-80 space-y-4 flex-shrink-0">

                    {/* Score Meter */}
                    <div className="glass-card p-6 text-center">
                        <p className="text-xs font-body text-ink-muted mb-2 uppercase tracking-wide">Live ATS Score</p>
                        <div className="relative inline-flex items-center justify-center mb-3">
                            <svg viewBox="0 0 120 120" className="w-32 h-32">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#dbeafe" strokeWidth="10" />
                                <circle cx="60" cy="60" r="50" fill="none"
                                    stroke={scoreColor} strokeWidth="10"
                                    strokeDasharray={`${(score / 100) * 314} 314`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                            </svg>
                            <div className="absolute">
                                <div className="font-display font-bold text-3xl" style={{ color: scoreColor }}>{rescoring ? '…' : score}</div>
                                <div className="text-xs text-ink-muted font-body">/100</div>
                            </div>
                        </div>
                        <p className="text-sm font-body text-ink-muted">
                            {score >= 70 ? '🟢 ATS Ready' : score >= 45 ? '🟡 Getting there' : '🔴 Needs work'}
                        </p>
                        {rescoring && <p className="text-xs text-brand-500 font-body mt-1 animate-pulse">Rescoring…</p>}
                    </div>

                    {/* Sections completion */}
                    <div className="glass-card p-5">
                        <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-3">Sections</p>
                        <div className="space-y-2">
                            {SECTIONS.map(s => {
                                const filled = sections[s].trim().length > 0
                                return (
                                    <div key={s} className="flex items-center justify-between">
                                        <button onClick={() => setActiveSection(s)} className="text-sm font-body text-ink-light hover:text-brand-700 transition-colors text-left">
                                            {SECTION_LABELS[s]}
                                        </button>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-body ${filled ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                            {filled ? '✓' : 'missing'}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Radar */}
                    {ats && (
                        <div className="glass-card p-5">
                            <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-3">Resume Radar</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                    <PolarGrid stroke="#dbeafe" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: 'DM Sans' }} />
                                    <Radar dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.25} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {ats?.missing_keywords?.length > 0 && (
                        <div className="glass-card p-5">
                            <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-3">Missing Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {ats.missing_keywords.slice(0, 10).map(k => (
                                    <button key={k} onClick={() => updateSection(activeSection, sections[activeSection] + '\n' + k)}
                                        className="text-xs px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-body hover:bg-red-100 transition-all"
                                        title="Click to add to current section">
                                        + {k}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-ink-muted font-body mt-2">Click to add to current section</p>
                        </div>
                    )}

                    {/* Issues */}
                    {ats?.issues?.length > 0 && (
                        <div className="glass-card p-5">
                            <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-3">Issues to Fix</p>
                            <div className="space-y-2">
                                {ats.issues.map((issue, i) => (
                                    <div key={i} className="flex gap-2 text-xs font-body text-red-700 bg-red-50 rounded-xl p-2.5">
                                        <span className="shrink-0">!</span>{issue}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {ats?.suggestions?.length > 0 && (
                        <div className="glass-card p-5">
                            <p className="text-xs font-body text-ink-muted uppercase tracking-wide mb-3">AI Suggestions</p>
                            <div className="space-y-2">
                                {ats.suggestions.slice(0, 4).map((s, i) => (
                                    <div key={i} className="flex gap-2 text-xs font-body text-brand-800 bg-blue-50 rounded-xl p-2.5">
                                        <span className="text-brand-500 shrink-0">→</span>{s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
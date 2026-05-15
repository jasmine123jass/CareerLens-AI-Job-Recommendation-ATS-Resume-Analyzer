import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function ResumeUpload() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const onDrop = useCallback(accepted => { setFile(accepted[0]); setResult(null) }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    })

    const analyze = async () => {
        if (!file) return
        setLoading(true); setError('')
        try {
            const fd = new FormData()
            fd.append('file', file)
            const { data } = await api.post('/resume/upload', fd)
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Make sure backend is running.')
        } finally { setLoading(false) }
    }

    const atsScore = result?.ats?.ats_score || 0
    const radarData = result ? [
        { subject: 'Keywords', A: Math.min(100, result.parsed?.keywords?.length * 5 || 0) },
        { subject: 'Skills', A: Math.min(100, result.parsed?.skills?.length * 8 || 0) },
        { subject: 'Action Verbs', A: Math.min(100, result.ats?.strong_verbs_found?.length * 10 || 0) },
        { subject: 'ATS Score', A: atsScore },
        { subject: 'Word Count', A: Math.min(100, (result.parsed?.word_count || 0) / 8) },
    ] : []

    const scoreColor = atsScore >= 70 ? 'text-green-600' : atsScore >= 45 ? 'text-yellow-600' : 'text-red-500'
    const scoreBg = atsScore >= 70 ? 'bg-green-50 border-green-200' : atsScore >= 45 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="font-display font-bold text-4xl text-ink mb-2">Resume AI Analyzer</h1>
                <p className="text-ink-muted font-body">Upload your resume for instant ATS scoring and job matching</p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-8">
                <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all
                    ${isDragActive ? 'border-brand-500 bg-blue-50' : 'border-blue-200 hover:border-brand-400 hover:bg-blue-50/50'}`}>
                    <input {...getInputProps()} />
                    <div className="text-6xl mb-4">◈</div>
                    <p className="font-display font-semibold text-xl text-ink mb-2">
                        {file ? file.name : isDragActive ? 'Drop here...' : 'Drop your resume'}
                    </p>
                    <p className="text-ink-muted font-body text-sm">PDF or DOCX · Max 10MB</p>
                </div>

                {file && (
                    <button onClick={analyze} disabled={loading}
                        className="mt-6 w-full py-4 bg-brand-700 hover:bg-brand-600 text-white font-display font-semibold text-lg rounded-2xl transition-all hover:shadow-lg disabled:opacity-60">
                        {loading ? '🔄 Analyzing with AI...' : '⚡ Analyze Resume'}
                    </button>
                )}

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                        {error}
                    </div>
                )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* ATS Score Hero */}
                        <div className={`glass-card p-8 border-2 ${scoreBg} flex items-center gap-8`}>
                            <div className="text-center">
                                <div className={`font-display font-bold text-7xl ${scoreColor}`}>{atsScore}</div>
                                <div className="font-body text-ink-muted text-sm mt-1">ATS Score / 100</div>
                            </div>
                            <div className="flex-1">
                                <div className="h-4 bg-blue-100 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${atsScore}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${atsScore >= 70 ? 'bg-green-500' : atsScore >= 45 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                    />
                                </div>
                                <p className="font-body text-ink-light">
                                    {atsScore >= 70
                                        ? 'Excellent! Your resume is ATS-ready.'
                                        : atsScore >= 45
                                            ? 'Good — a few improvements will boost it significantly.'
                                            : 'Needs work — follow the suggestions below.'}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {result.parsed?.skills?.slice(0, 6).map(s => (
                                        <span key={s} className="bg-blue-100 text-brand-700 px-3 py-1 rounded-full text-xs font-body font-medium">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ✦ Open in ATS Editor Button */}
                        <div className="flex justify-end">
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => navigate('/editor')}
                                className="flex items-center gap-3 px-7 py-4 bg-brand-700 hover:bg-brand-600 text-white font-display font-semibold text-base rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 active:scale-95 group">
                                <span className="text-blue-300 group-hover:text-white transition-colors text-lg">✦</span>
                                Open in ATS Editor
                                <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Radar */}
                            <div className="glass-card p-6">
                                <h3 className="font-display font-semibold text-lg text-ink mb-4">Resume Analysis Radar</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#dbeafe" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                                        <Radar dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Issues & Suggestions */}
                            <div className="glass-card p-6">
                                <h3 className="font-display font-semibold text-lg text-ink mb-4">AI Suggestions</h3>
                                <div className="space-y-3">
                                    {result.ats?.suggestions?.map((s, i) => (
                                        <div key={i} className="flex gap-3 bg-blue-50 rounded-2xl p-3">
                                            <span className="text-brand-600 font-bold text-sm mt-0.5">→</span>
                                            <p className="text-ink-light font-body text-sm">{s}</p>
                                        </div>
                                    ))}
                                    {result.ats?.issues?.map((issue, i) => (
                                        <div key={i} className="flex gap-3 bg-red-50 rounded-2xl p-3">
                                            <span className="text-red-500 font-bold text-sm mt-0.5">!</span>
                                            <p className="text-red-700 font-body text-sm">{issue}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {result.jobs?.length > 0 && (
                            <div className="glass-card p-6">
                                <h3 className="font-display font-semibold text-lg text-ink mb-4">Matched Jobs from Your Resume</h3>
                                <div className="grid gap-4">
                                    {result.jobs.slice(0, 6).map((job, idx) => (
                                        <div key={idx} className="border border-blue-100 rounded-3xl p-4">
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <div>
                                                    <h4 className="font-display font-semibold text-base text-ink">{job.title}</h4>
                                                    <p className="text-ink-muted text-sm">{job.company} · {job.location} · {job.experience}</p>
                                                </div>
                                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800">{job.match_percent}% match</span>
                                            </div>
                                            <p className="text-ink-light text-sm">{job.why_match}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Parsed Info */}
                        <div className="glass-card p-6">
                            <h3 className="font-display font-semibold text-lg text-ink mb-4">Extracted Information</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    ['Name', result.parsed?.name || 'Not found'],
                                    ['Email', result.parsed?.email || 'Not found'],
                                    ['Phone', result.parsed?.phone || 'Not found'],
                                    ['Experience', `${result.parsed?.experience_years || 0} years`]
                                ].map(([label, val]) => (
                                    <div key={label} className="bg-blue-50 rounded-2xl p-4">
                                        <div className="text-xs font-body text-ink-muted mb-1">{label}</div>
                                        <div className="font-display font-semibold text-ink text-sm truncate">{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
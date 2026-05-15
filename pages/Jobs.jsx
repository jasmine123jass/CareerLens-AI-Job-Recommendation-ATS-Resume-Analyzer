import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'

const COLORS = {
    remote: 'bg-green-100 text-green-800',
    hybrid: 'bg-blue-100 text-blue-800',
    onsite: 'bg-yellow-100 text-yellow-800'
}

export default function Jobs() {
    const [filter, setFilter] = useState('all')
    const [jobs, setJobs] = useState([])
    const [saved, setSaved] = useState([])
    const [applied, setApplied] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [{ data: rec }, { data: savedData }, { data: appliedData }] = await Promise.all([
                    api.get('/jobs/recommendations'),
                    api.get('/jobs/saved'),
                    api.get('/jobs/applied')
                ])
                setJobs(rec.jobs || [])
                setSaved(savedData.jobs?.map(job => job.title) || [])
                setApplied(appliedData.jobs?.map(job => job.title) || [])
            } catch (err) {
                console.error('Failed to load jobs', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.type === filter)

    const saveJob = async (job) => {
        try { await api.post('/jobs/save', { job }) } catch (err) { console.error(err) }
        setSaved(p => p.includes(job.title) ? p : [...p, job.title])
    }

    const applyJob = async (job) => {
        try { await api.post('/jobs/apply', { job }) } catch (err) { console.error(err) }
        setApplied(p => p.includes(job.title) ? p : [...p, job.title])
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="font-display font-bold text-4xl text-ink mb-2">Job Matches</h1>
                <p className="text-ink-muted font-body">AI-matched tech roles based on your resume and skills</p>
            </motion.div>

            {/* Filters */}
            <div className="flex gap-3 mb-8">
                {['all', 'remote', 'hybrid', 'onsite'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-2xl font-body text-sm font-medium transition-all capitalize
              ${filter === f ? 'bg-brand-700 text-white shadow-lg' : 'bg-white text-ink-light hover:bg-blue-50 border border-blue-100'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map((job, i) => (
                    <motion.div key={`${job.company}-${job.title}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="glass-card p-6 hover:shadow-xl hover:shadow-blue-100 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-display font-bold text-xl text-ink">{job.title}</h3>
                                    <span className={`text-xs px-3 py-1 rounded-full font-body font-medium ${COLORS[job.type] || 'bg-blue-100 text-blue-800'}`}>
                                        {job.match_percent}% match
                                    </span>
                                </div>
                                <p className="text-ink-muted font-body text-sm mb-3">{job.company} · {job.location} · {job.experience}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {job.skills?.map(s => (
                                        <span key={s} className="bg-blue-50 text-brand-700 px-3 py-1 rounded-full text-xs font-body">{s}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-ink-light font-body">
                                    <span className="text-brand-600">→</span>
                                    <span className="italic">{job.why_match || 'Explore this opportunity for a strong fit.'}</span>
                                </div>
                            </div>
                            <div className="text-right ml-6 flex flex-col items-end gap-3">
                                <div className="font-display font-semibold text-brand-700 text-lg">{job.salary}</div>
                                <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${job.match_percent || 55}%` }} />
                                </div>
                                <div className="grid gap-2 w-full">
                                    <button onClick={() => saveJob(job)}
                                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${saved.includes(job.title)
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-700 hover:text-white'}`}>
                                        {saved.includes(job.title) ? '✓ Saved' : '◇ Save'}
                                    </button>
                                    <button onClick={() => applyJob(job)}
                                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${applied.includes(job.title)
                                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                            : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-700 hover:text-white'}`}>
                                        {applied.includes(job.title) ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'

export default function SavedJobs() {
    const [jobs, setJobs] = useState([])

    useEffect(() => {
        api.get('/jobs/saved').then(({ data }) => setJobs(data.jobs || [])).catch(() => { })
    }, [])

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="font-display font-bold text-4xl text-ink mb-2">Saved Jobs</h1>
                <p className="text-ink-muted font-body">Jobs you bookmarked for later</p>
            </motion.div>

            {jobs.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="text-6xl mb-4">◇</div>
                    <h3 className="font-display font-semibold text-xl text-ink mb-2">No saved jobs yet</h3>
                    <p className="text-ink-muted font-body">Go to Job Matches and bookmark roles you like</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                            className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-xl text-ink mb-1">{job.title}</h3>
                                    <p className="text-ink-muted font-body text-sm">{job.company} · {job.location}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-display font-semibold text-brand-700">{job.salary}</div>
                                    <div className="text-xs text-ink-muted font-body mt-1">{job.match_percent}% match</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
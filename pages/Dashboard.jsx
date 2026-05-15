import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const cards = [
    { title: 'Upload Resume', desc: 'Analyze ATS score and get instant feedback', path: '/resume', icon: '◈', color: 'from-blue-600 to-blue-800' },
    { title: 'Job Matches', desc: 'See jobs matched to your skills', path: '/jobs', icon: '◎', color: 'from-indigo-600 to-blue-700' },
    { title: 'Saved Jobs', desc: 'Jobs you bookmarked', path: '/saved', icon: '◇', color: 'from-blue-500 to-cyan-600' },
    { title: 'Your Profile', desc: 'Complete your career profile', path: '/profile', icon: '◉', color: 'from-brand-700 to-indigo-700' },
]

export default function Dashboard() {
    const { user } = useAuth()

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <p className="text-brand-600 font-body font-medium mb-1">Good day,</p>
                <h1 className="font-display font-bold text-4xl text-ink">{user?.name || 'Career Explorer'} 👋</h1>
                <p className="text-ink-muted font-body mt-2">Your AI career assistant is ready. What would you like to do?</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 mb-10">
                {cards.map((card, i) => (
                    <motion.div key={card.path} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Link to={card.path} className={`block bg-gradient-to-br ${card.color} p-7 rounded-3xl text-white hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-200 group`}>
                            <div className="text-4xl mb-4">{card.icon}</div>
                            <h3 className="font-display font-bold text-xl mb-1">{card.title}</h3>
                            <p className="text-blue-200 font-body text-sm">{card.desc}</p>
                            <div className="mt-4 text-white/50 group-hover:text-white transition-colors font-body text-sm">→ Open</div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="glass-card p-6">
                <h3 className="font-display font-semibold text-lg text-ink mb-4">Quick Tips</h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        ['📄', 'Upload a PDF resume for best ATS parsing results'],
                        ['🎯', 'Keep resume under 800 words for higher ATS scores'],
                        ['⚡', 'Add certifications to boost job match percentage']
                    ].map(([icon, tip]) => (
                        <div key={tip} className="bg-blue-50 rounded-2xl p-4">
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="text-ink-light font-body text-sm">{tip}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
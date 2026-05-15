import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const { data } = await api.post('/auth/login', form)
            login({ name: data.name, email: data.email }, data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen mesh-bg flex">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 bg-brand-900 flex-col justify-between p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-700 rounded-full -translate-y-32 translate-x-32 opacity-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full translate-y-20 -translate-x-20 opacity-10" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white font-display font-bold">CL</div>
                        <span className="font-display font-bold text-white text-xl">CareerLens</span>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h1 className="font-display font-bold text-white text-5xl leading-tight mb-6">
                            Your AI Career<br />Intelligence<br />Platform
                        </h1>
                        <p className="text-blue-300 text-lg font-body leading-relaxed">
                            Upload your resume. Get ATS score.<br />Match with 1000+ tech jobs instantly.
                        </p>
                    </motion.div>
                </div>
                <div className="relative z-10 grid grid-cols-3 gap-4">
                    {[['98%', 'ATS Match Rate'], ['10K+', 'Tech Jobs'], ['4.9★', 'User Rating']].map(([val, label]) => (
                        <div key={label} className="bg-brand-800 rounded-2xl p-4">
                            <div className="font-display font-bold text-white text-2xl">{val}</div>
                            <div className="text-blue-300 text-xs font-body mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <h2 className="font-display font-bold text-3xl text-ink mb-2">Welcome back</h2>
                    <p className="text-ink-muted font-body mb-8">Sign in to your CareerLens account</p>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {[['email', 'Email address', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
                            <div key={field}>
                                <label className="block text-sm font-body font-medium text-ink-light mb-2">{label}</label>
                                <input type={type} required value={form[field]}
                                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-blue-100 rounded-2xl font-body text-ink placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                    placeholder={label} />
                            </div>
                        ))}
                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-brand-700 hover:bg-brand-600 text-white font-display font-semibold text-lg rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-98 disabled:opacity-60">
                            {loading ? 'Signing in...' : 'Sign in →'}
                        </button>
                    </form>

                    <p className="text-center text-ink-muted font-body mt-6 text-sm">
                        No account? <Link to="/signup" className="text-brand-600 font-medium hover:underline">Create one free</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
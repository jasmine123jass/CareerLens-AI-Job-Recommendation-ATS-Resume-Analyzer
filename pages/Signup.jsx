import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true); setError('')
        try {
            const { data } = await api.post('/auth/signup', form)
            login({ name: data.name, email: data.email }, data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-card p-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">CL</div>
                    <span className="font-display font-bold text-brand-700 text-lg">CareerLens</span>
                </div>
                <h2 className="font-display font-bold text-3xl text-ink mb-2">Create account</h2>
                <p className="text-ink-muted font-body mb-8">Start your AI-powered career journey</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {[['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
                        <div key={field}>
                            <label className="block text-sm font-body font-medium text-ink-light mb-2">{label}</label>
                            <input type={type} required value={form[field]}
                                onChange={e => setForm({ ...form, [field]: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-blue-100 rounded-2xl font-body text-ink focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                placeholder={label} />
                        </div>
                    ))}
                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-brand-700 hover:bg-brand-600 text-white font-display font-semibold text-lg rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-60">
                        {loading ? 'Creating...' : 'Create account →'}
                    </button>
                </form>
                <p className="text-center text-ink-muted font-body mt-6 text-sm">
                    Have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
                </p>
            </motion.div>
        </div>
    )
}
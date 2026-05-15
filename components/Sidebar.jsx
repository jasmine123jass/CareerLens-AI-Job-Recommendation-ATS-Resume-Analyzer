import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

const links = [
    { path: '/', label: 'Dashboard', icon: '⬡' },
    { path: '/resume', label: 'Resume AI', icon: '◈' },
    { path: '/jobs', label: 'Job Match', icon: '◎' },
    { path: '/saved', label: 'Saved', icon: '◇' },
    { path: '/profile', label: 'Profile', icon: '◉' },
    { path: '/editor', label: 'Resume Editor', icon: '✦' },
]

export default function Sidebar() {
    const { pathname } = useLocation()
    const { user, logout } = useAuth()

    return (
        <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="fixed left-0 top-0 h-screen w-64 bg-brand-900 flex flex-col z-50">

            {/* Logo */}
            <div className="px-7 py-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">CL</div>
                    <span className="font-display font-bold text-white text-lg tracking-tight">CareerLens</span>
                </div>
                <p className="text-blue-300 text-xs mt-1 font-body">AI Career Platform</p>
            </div>

            {/* User pill */}
            <div className="mx-5 mb-6 bg-brand-800 rounded-2xl p-4">
                <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white font-display font-bold mb-2">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <p className="text-white font-display text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-blue-300 text-xs truncate">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1">
                {links.map(link => {
                    const active = pathname === link.path
                    return (
                        <Link key={link.path} to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-body text-sm font-medium
                ${active ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-200 hover:bg-brand-800 hover:text-white'}`}>
                            <span className="text-lg">{link.icon}</span>
                            {link.label}
                            {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-5">
                <button onClick={logout}
                    className="w-full py-3 rounded-2xl text-blue-300 hover:text-white hover:bg-brand-800 transition-all text-sm font-body font-medium">
                    ↩ Sign out
                </button>
            </div>
        </motion.div>
    )
}
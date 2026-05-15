import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import Jobs from './pages/Jobs'
import Profile from './pages/Profile'
import SavedJobs from './pages/SavedJobs'
import Sidebar from './components/Sidebar'
import ResumeEditor from './pages/ResumeEditor'
function ProtectedLayout({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    return (
        <div className="flex min-h-screen mesh-bg">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                <Route path="/resume" element={<ProtectedLayout><ResumeUpload /></ProtectedLayout>} />
                <Route path="/jobs" element={<ProtectedLayout><Jobs /></ProtectedLayout>} />
                <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
                <Route path="/saved" element={<ProtectedLayout><SavedJobs /></ProtectedLayout>} />
                <Route path="/editor" element={<ProtectedLayout><ResumeEditor /></ProtectedLayout>} />

            </Routes>
        </BrowserRouter>
    )
}
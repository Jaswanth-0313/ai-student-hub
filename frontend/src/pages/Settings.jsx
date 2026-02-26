import React, { useEffect, useState, useContext } from 'react'
import { CheckCircle2, Edit3, Key, Mail, Save, ShieldCheck, User, X } from 'lucide-react'
import { profileAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Settings() {
    const { user, login } = useContext(AuthContext)
    const [profile, setProfile] = useState(user)
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(user?.name || '')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [msg, setMsg] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!profile) {
            profileAPI.me().then(res => {
                setProfile(res.data.user)
                setEditedName(res.data.user.name)
            }).catch(err => console.error(err))
        }
    }, [profile])

    const handleUpdateName = async () => {
        if (editedName.trim() === user?.name) {
            setIsEditingName(false)
            return
        }
        setLoading(true)
        setMsg(null)
        try {
            const res = await profileAPI.updateProfile({ name: editedName })
            // Update global context so Navbar/Dashboard reflect change
            login(localStorage.getItem('token'), res.data.user)
            setProfile(res.data.user)
            setMsg({ success: true, text: 'Name updated successfully!' })
            setIsEditingName(false)
        } catch (err) {
            setMsg({ success: false, text: err.response?.data?.message || 'Failed to update name' })
        } finally {
            setLoading(false)
        }
    }

    const changePassword = async (e) => {
        e.preventDefault()
        setMsg(null)

        if (newPassword !== confirmPassword) {
            return setMsg({ success: false, text: 'New passwords do not match' })
        }
        if (newPassword.length < 8) {
            return setMsg({ success: false, text: 'Password must be at least 8 characters' })
        }

        setLoading(true)
        try {
            const res = await profileAPI.changePassword({ currentPassword, newPassword })
            setMsg({ success: true, text: res.data.message })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setMsg({ success: false, text: err.response?.data?.message || err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageContainer>
            <SectionTitle
                title="Settings"
                subtitle="Manage your profile information and account security."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                {/* Profile Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 mb-6">
                            <User size={48} className="text-white opacity-80" />
                        </div>

                        {isEditingName ? (
                            <div className="space-y-3 mb-4">
                                <input
                                    autoFocus
                                    value={editedName}
                                    onChange={e => setEditedName(e.target.value)}
                                    className="w-full bg-white/5 border border-primary/50 rounded-xl px-4 py-2 text-center text-white focus:outline-none focus:ring-2 ring-primary/20 transition-all font-semibold"
                                />
                                <div className="flex gap-2 justify-center">
                                    <Button variant="primary" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={handleUpdateName} disabled={loading}>
                                        <Save size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg border border-white/10" onClick={() => { setIsEditingName(false); setEditedName(user?.name || ''); }}>
                                        <X size={16} />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 mb-2 group">
                                <h3 className="text-2xl font-bold text-white">{profile?.name || 'Student'}</h3>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="text-gray-500 hover:text-primary transition-colors p-1"
                                >
                                    <Edit3 size={16} />
                                </button>
                            </div>
                        )}

                        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                            <Mail size={14} /> {profile?.email}
                        </p>

                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-gray-500 font-bold uppercase tracking-tighter">Status</span>
                                <span className="flex items-center gap-1.5 text-green-400 font-bold">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-primary" /> Security Tip
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Use a strong, unique password for your AI Student Hub account to keep your connected tool API keys secure.
                        </p>
                    </Card>
                </div>

                {/* Change Password Card */}
                <div className="lg:col-span-2">
                    <Card className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Security & Password</h3>
                                <p className="text-sm text-gray-400">Update your account credentials</p>
                            </div>
                        </div>

                        <form onSubmit={changePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-700 transition-all text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Min 8 characters"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-700 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Repeat new password"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-700 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full md:w-auto px-12 py-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Changing...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>

                        {msg && (
                            <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 ${msg.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                {msg.success ? <CheckCircle2 size={18} /> : <X size={18} />}
                                <span className="text-sm font-medium">{msg.text}</span>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </PageContainer>
    )
}

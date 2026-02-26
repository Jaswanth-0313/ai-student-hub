import React, { useEffect, useState, useContext } from 'react'
import { CheckCircle2, AlertCircle, KeyRound, User as UserIcon, Mail } from 'lucide-react'
import { profileAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Settings() {
    const { user, token } = useContext(AuthContext)
    const [profile, setProfile] = useState(user)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [msg, setMsg] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!profile && token) {
            profileAPI.me()
                .then(r => setProfile(r.data.user))
                .catch(() => { })
        }
    }, [token, profile])

    const changePassword = async (e) => {
        e.preventDefault()
        setMsg(null)

        if (newPassword.length < 8) {
            return setMsg({ success: false, text: 'New password must be at least 8 characters long.' })
        }
        if (newPassword !== confirmPassword) {
            return setMsg({ success: false, text: 'New password and confirm password do not match.' })
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
            <SectionTitle title="Settings & Profile" subtitle="Manage your account preferences and security." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Left Column: Profile Card */}
                <div className="space-y-8">
                    <Card className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                                <UserIcon size={40} />
                            </div>
                            <div className="absolute bottom-0 right-0 rounded-full bg-surface p-1">
                                <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-surface animate-pulse" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
                            {profile?.name || 'Loading...'}
                        </h3>
                        <p className="text-gray-400 flex items-center justify-center gap-2">
                            <Mail size={16} />
                            {profile?.email || '...'}
                        </p>

                        <div className="mt-8 w-full border-t border-white/10 pt-6">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-sm font-medium text-gray-400">Account Status</span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                    {(profile?.accountStatus || 'Active').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Security/Password Card */}
                <div className="space-y-8">
                    <Card>
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="rounded-lg bg-primary/20 p-2 text-primary">
                                <KeyRound size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Change Password</h3>
                        </div>

                        <form onSubmit={changePassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    placeholder="Must match new password"
                                />
                            </div>

                            {msg && (
                                <div className={`flex items-start gap-3 rounded-xl p-4 text-sm animate-fade-in ${msg.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {msg.success ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                                    <p>{msg.text}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                disabled={loading}
                            >
                                {loading ? 'Updating Security...' : 'Update Password'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </PageContainer>
    )
}

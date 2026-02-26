import React, { useEffect, useState, useContext } from 'react'
import { profileAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Settings() {
    const { user, token } = useContext(AuthContext)
    const [profile, setProfile] = useState(user)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [msg, setMsg] = useState(null)

    useEffect(() => {
        if (!profile && token) {
            profileAPI.me()
                .then(r => setProfile(r.data.user))
                .catch(() => { })
        }
    }, [token])

    const changePassword = async (e) => {
        e.preventDefault()
        setMsg(null)

        if (newPassword.length < 8) {
            return setMsg({ success: false, text: 'New password must be at least 8 characters long.' })
        }
        if (newPassword !== confirmPassword) {
            return setMsg({ success: false, text: 'New password and confirm password do not match.' })
        }

        try {
            const res = await profileAPI.changePassword({ currentPassword, newPassword })
            setMsg({ success: true, text: res.data.message })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setMsg({ success: false, text: err.response?.data?.message || err.message })
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white border rounded shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Settings</h2>

            {/* Profile Section (Read Only) */}
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Profile Information</h3>
                {profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Name</label>
                            <div className="font-medium text-gray-800">{profile.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Email</label>
                            <div className="font-medium text-gray-800">{profile.email}</div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Account Status</label>
                            <div className="font-medium text-gray-800 capitalize">{profile.accountStatus || 'Active'}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">Loading profile...</div>
                )}
            </div>

            {/* Change Password Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h3>
                <form onSubmit={changePassword} className="bg-gray-50 p-4 rounded border">
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            minLength="8"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            minLength="8"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition">
                        Update Password
                    </button>
                </form>

                {msg && (
                    <div className={`mt-4 p-3 rounded text-sm ${msg.success ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {msg.text}
                    </div>
                )}
            </div>
        </div>
    )
}

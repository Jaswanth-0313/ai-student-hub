import React, { useEffect, useState, useContext } from 'react'
import { profileAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Profile(){
  const { user, token } = useContext(AuthContext)
  const [profile, setProfile] = useState(user)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(()=>{
    if (!profile && token) {
      profileAPI.me().then(r=>setProfile(r.data.user)).catch(()=>{})
    }
  },[token])

  const changePassword = async (e) => {
    e.preventDefault(); setMsg(null)
    try {
      const res = await profileAPI.changePassword({ currentPassword, newPassword })
      setMsg({ success: true, text: res.data.message })
      setCurrentPassword(''); setNewPassword('')
    } catch (err) {
      setMsg({ success: false, text: err.response?.data?.message || err.message })
    }
  }

  const updateName = async (e) => {
    e.preventDefault(); setMsg(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/users/${profile._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: profile.name })
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = await res.json()
      setProfile(updated)
      setMsg({ success: true, text: 'Profile updated' })
    } catch (err) {
      setMsg({ success: false, text: err.message })
    }
  }

  return (
    <div className="page profile-page">
      <h2>Profile</h2>
      {profile && (
        <div className="profile-info">
          <form onSubmit={updateName} className="mb-4">
            <label>Name</label>
            <input value={profile.name || ''} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full p-2 mt-2 border rounded" />
            <button className="mt-3 px-3 py-2 bg-indigo-600 text-white rounded" type="submit">Update Name</button>
          </form>

          <div className="mb-3"><strong>Gmail ID:</strong> {profile.email}</div>
          <div className="mb-3"><strong>Account status:</strong> {profile.accountStatus}</div>
        </div>
      )}

      <h3>Change password</h3>
      <form onSubmit={changePassword}>
        <label>Current password</label>
        <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
        <label>New password</label>
        <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
        <button type="submit" className="mt-3 px-3 py-2 bg-indigo-600 text-white rounded">Change password</button>
      </form>
      {msg && <div className={msg.success ? 'success' : 'error'}>{msg.text}</div>}
    </div>
  )
}

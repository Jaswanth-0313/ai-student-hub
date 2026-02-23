import React, { useState } from 'react'
import { supportAPI } from '../services/api'

export default function Support(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await supportAPI.submit({ name, email, subject, message })
      setStatus({ success: true, message: res.data.message })
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || err.message })
    }
  }

  return (
    <div className="page support-page max-w-3xl mx-auto p-6">
      <h2>Support</h2>
      <form onSubmit={submit} className="support-form">
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 mt-2 border rounded" />

        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 mt-2 border rounded" />

        <label>Subject</label>
        <input value={subject} onChange={e=>setSubject(e.target.value)} required className="w-full p-2 mt-2 border rounded" />

        <label>Message</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} required className="w-full p-2 mt-2 border rounded h-40" />

        <button type="submit" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
      </form>
      {status && <div className={status.success ? 'success' : 'error'}>{status.message}</div>}
    </div>
  )
}

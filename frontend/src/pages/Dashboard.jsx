import React, { useEffect, useState, useContext } from 'react'
import api, { setAuthToken, dashboardAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard(){
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(null)

  const { logout } = useContext(AuthContext)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)

    const fetchDashboard = async () => {
      try{
        const res = await dashboardAPI.getDashboard()
        setDashboard(res.data)
      }catch(err){
        setError(err.response?.data?.message || 'Failed to load dashboard')
      }
    }

    fetchDashboard()
  },[])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!dashboard) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, {dashboard.user.name}</h1>
        <div>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="font-semibold">Stats</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          <li>Total Tools Available: {dashboard.stats.totalToolsAvailable}</li>
          <li>Connected Tools: {dashboard.stats.connectedTools}</li>
          <li>Integration Percentage: {dashboard.stats.integrationPercentage}%</li>
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold">Available Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {dashboard.availableTools.map(t=> (
            <div key={t.id} className={t.connected? 'tool-card connected' : 'tool-card'}>
              <div className="text-2xl">{t.icon}</div>
              <h4 className="mt-2 font-semibold">{t.name}</h4>
              <p className="text-sm text-gray-600">{t.description}</p>
              <div className="mt-2"><strong>Connected:</strong> {t.connected? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

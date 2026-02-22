import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Tools(){
  const [tools, setTools] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useContext(AuthContext)

  useEffect(()=>{
    if (!token) return
    setLoading(true)
    api.get('/tools/mytools')
      .then(res=>{
        setTools(res.data)
      })
      .catch(err=> setError(err.response?.data?.message || 'Failed to load tools'))
      .finally(()=>setLoading(false))
  },[token])

  const toggleTool = async (toolId, connect=true) => {
    try{
      const endpoint = connect ? `/tools/connect/${toolId}` : `/tools/disconnect/${toolId}`
      const res = await api.post(endpoint, connect ? { apiKey:'' } : {})
      // refresh tools
      const refreshed = await api.get('/tools/mytools')
      setTools(refreshed.data)
    }catch(err){
      setError(err.response?.data?.message || 'Action failed')
    }
  }

  if (loading) return <div className="p-6">Loading tools...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold">Connected Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {tools.availableTools.map(t => (
          <div key={t.id} className={t.connected? 'tool-card connected' : 'tool-card'}>
            <div className="flex items-center justify-between">
              <div className="text-2xl">{t.icon}</div>
              <div className="text-sm text-gray-600">{t.category}</div>
            </div>
            <h3 className="mt-2 font-semibold">{t.name}</h3>
            <p className="text-sm text-gray-600">{t.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">Connected: {t.connected? 'Yes' : 'No'}</div>
              <div>
                {t.connected ? (
                  <button onClick={()=>toggleTool(t.id, false)} className="px-3 py-1 bg-red-500 text-white rounded">Disconnect</button>
                ) : (
                  <button onClick={()=>toggleTool(t.id, true)} className="px-3 py-1 bg-green-600 text-white rounded">Connect</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

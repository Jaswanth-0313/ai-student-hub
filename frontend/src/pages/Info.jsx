import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Info(){
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const fetch = async () => {
      try{
        const res = await api.get('/tools/details')
        setTools(res.data)
      }catch(err){
        console.error('Error fetching tool details', err)
        setError(err.response?.data?.message || err.message || 'Failed to load')
      }finally{
        setLoading(false)
      }
    }
    fetch()
  },[])

  if (loading) return <div className="p-6">Loading information...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Information & Uses</h1>
      <p className="text-gray-600 mb-6">Learn how to use each AI tool and real student use cases.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <article key={tool.key} className="p-6 rounded-lg shadow-md bg-white">
            <div className="flex items-center gap-4 mb-4">
              <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded" onError={(e)=> e.target.style.display='none'} />
              <div>
                <h2 className="text-xl font-bold">{tool.name}</h2>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">What is this tool?</h4>
              <p className="text-sm text-gray-700">{tool.description}</p>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Key features</h4>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {(tool.features || []).map((f,i)=>(<li key={i}>{f}</li>))}
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Why students use it / Use cases</h4>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {(tool.useCases || []).map((u,i)=>(<li key={i}>{u}</li>))}
              </ul>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">How to start</h4>
              <p className="text-sm text-gray-700">{tool.howTo || 'Follow official docs and connect via Student Hub.'}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <a href={tool.website|| '#'} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded">Official Site</a>
              <a href="/tools" className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded">View & Connect</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

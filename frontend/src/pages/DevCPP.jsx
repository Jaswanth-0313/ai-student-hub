import React, { useState } from 'react'
import { devcppAPI } from '../services/api'

export default function DevCPP(){
  const [source, setSource] = useState(`#include <iostream>\nint main(){ std::cout<<"Hello from Dev-C++ runner"; return 0; }`)
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)

  const compile = async (e) => {
    e.preventDefault()
    setOutput(null)
    setLoading(true)
    try {
      const res = await devcppAPI.compile({ source, filename: 'main.cpp' })
      setOutput(res.data)
    } catch (err) {
      setOutput({ error: err.response?.data || err.message })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 page">
      <h2>Dev-C++ Compiler (Server-side)</h2>
      <p className="text-sm text-gray-600 mb-4">Write C or C++ source and compile/run on the server (sandboxed).</p>

      <form onSubmit={compile}>
        <label>Source</label>
        <textarea value={source} onChange={e=>setSource(e.target.value)} className="w-full p-2 mt-2 border rounded h-64" />
        <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded" type="submit">Compile & Run</button>
      </form>

      {loading && <div className="mt-4">Running...</div>}

      {output && (
        <div className="mt-4 bg-gray-50 border p-4 rounded">
          <h3 className="font-semibold">Result</h3>
          <pre className="whitespace-pre-wrap text-sm mt-2">{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

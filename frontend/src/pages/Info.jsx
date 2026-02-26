import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info as InfoIcon, ExternalLink, Zap, Lightbulb, HelpCircle, StepForward } from 'lucide-react'
import api from '../services/api'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Info() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get('/tools/details')
        setTools(Array.isArray(res.data) ? res.data : res.data.tools || [])
      } catch (err) {
        console.error('Error fetching tool details', err)
        setError(err.response?.data?.message || err.message || 'Failed to load information.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [])

  if (loading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </PageContainer>
  )

  if (error) return (
    <PageContainer>
      <Card className="border-red-500/50 bg-red-500/10">
        <p className="text-red-400">{error}</p>
      </Card>
    </PageContainer>
  )

  return (
    <PageContainer>
      <SectionTitle
        title="Information & Uses"
        subtitle="Learn how to master each AI tool with real-world student use cases."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {tools.map((tool) => (
          <Card key={tool.key} className="flex flex-col h-full overflow-hidden group">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-1 rounded-xl bg-gradient-to-tr from-primary to-secondary group-hover:scale-105 transition-transform duration-300">
                <div className="bg-background rounded-[10px] p-2">
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-12 h-12 rounded object-contain"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{tool.name}</h2>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{tool.description}</p>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-semibold text-white text-sm uppercase tracking-wider opacity-70">
                  <HelpCircle size={16} className="text-primary" /> What is this tool?
                </h4>
                <p className="text-gray-300 leading-relaxed">{tool.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-semibold text-white text-sm uppercase tracking-wider opacity-70">
                  <Zap size={16} className="text-secondary" /> Key features
                </h4>
                <ul className="grid grid-cols-1 gap-2 text-gray-300">
                  {(tool.features || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-semibold text-white text-sm uppercase tracking-wider opacity-70">
                  <Lightbulb size={16} className="text-yellow-400" /> Student Use Cases
                </h4>
                <ul className="grid grid-cols-1 gap-2 text-gray-300">
                  {(tool.useCases || []).map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm italic">
                      <span className="mt-1.5 h-1 w-2 shrink-0 rounded-full bg-yellow-400/50" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="flex items-center gap-2 font-semibold text-white text-sm uppercase tracking-wider opacity-70">
                  <StepForward size={16} className="text-primary" /> How to start
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed italic">
                  {tool.howTo || 'Follow official documentation and securely connect via your Student Hub profile.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
              <a
                href={tool.website || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button variant="primary" className="w-full gap-2 text-xs">
                  Official Site <ExternalLink size={14} />
                </Button>
              </a>
              <Link to="/tools" className="flex-1">
                <Button variant="outline" className="w-full text-xs">
                  View & Connect
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}

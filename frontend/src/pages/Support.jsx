import React, { useState } from 'react'
import { CheckCircle2, Mail, MessageSquare, Send, User } from 'lucide-react'
import { supportAPI } from '../services/api'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Support() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      const res = await supportAPI.submit({ name, email, subject, message })
      setStatus({ success: true, message: res.data.message || 'Support ticket submitted successfully!' })
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || err.message || 'Failed to submit ticket.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <SectionTitle
          title="Support Center"
          subtitle="Have a question? Our team is here to help you navigate your AI Student Hub."
        />

        <Card className="mt-10 p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquare size={120} className="text-primary" />
          </div>

          <form onSubmit={submit} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <User size={16} />
                  </div>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder="How can we help?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                placeholder="Detailed description of your inquiry..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-600 transition-all h-32 resize-none text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-base gap-2 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <><Send size={18} /> Submit Ticket</>
              )}
            </Button>
          </form>

          {status && (
            <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 ${status.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
              {status.success ? <CheckCircle2 size={18} /> : <InfoIcon size={18} />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}
        </Card>

        {/* Alternative Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">Preferred direct contact?</p>
          <div className="mt-4 flex justify-center gap-8">
            <a href="mailto:support@aistudenthub.com" className="text-primary hover:text-primary/80 transition-colors text-sm font-bold border-b border-primary/20">Email Us</a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors text-sm font-bold border-b border-primary/20">Chat on Discord</a>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

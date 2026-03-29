import React from 'react'
import { Button } from '../components/ui/Button'

export default function Gmail() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/30 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-3">Gmail (Auto-connected)</h1>
            <p className="text-gray-300 mb-4">Gmail is automatically connected using your login email. Just click to open Gmail.</p>
            <p className="text-sm text-gray-400 mb-6">No Google Cloud console setup or OAuth flow is required from this screen.</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                className="gap-2"
                onClick={() => window.open('https://mail.google.com/', '_blank')}
              >
                Open Gmail
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open('https://support.google.com/mail', '_blank')}
              >
                Gmail Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

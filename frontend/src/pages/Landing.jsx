import React from 'react'
import { Link } from 'react-router-dom'
import { Blocks, Code, Rocket, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageContainer } from '../components/ui/PageContainer'

export default function Landing() {
  const features = [
    {
      icon: <Zap className="text-primary" size={24} />,
      title: "One-Click Connection",
      description: "Connect your favorite AI tools securely with just your API key or username. Keep everything organized in one place."
    },
    {
      icon: <ShieldCheck className="text-secondary" size={24} />,
      title: "Secure & Private",
      description: "Your credentials are encrypted and never exposed. We prioritize your security and privacy at every step."
    },
    {
      icon: <Blocks className="text-indigo-400" size={24} />,
      title: "Smart Dashboard",
      description: "Track your connected tools, view learning resources, and manage everything from your personalized dashboard."
    }
  ]

  const tools = [
    { icon: "🤖", name: "ChatGPT" },
    { icon: "📊", name: "Gamma" },
    { icon: "🎨", name: "Figma" },
    { icon: "💜", name: "Lovable" },
    { icon: "🖼️", name: "Canva" },
    { icon: "🐙", name: "GitHub" },
    { icon: "💻", name: "LeetCode" },
    { icon: "📔", name: "Notebook LM" }
  ]

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Student Hub" className="h-10 w-10 object-contain rounded-lg" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Student Hub
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[128px]" />
        </div>

        <PageContainer className="animate-slide-up">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="p-1 rounded-2xl bg-gradient-to-tr from-primary to-secondary">
                <div className="bg-background rounded-[14px] p-4">
                  <img src="/logo.jpg" alt="AI Student Hub" className="h-24 w-24 object-contain rounded-lg" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
              All AI Tools for Students in <span className="text-primary italic">One Place</span>
            </h2>
            <p className="text-lg leading-8 text-gray-400 mb-10">
              One Login • One Platform • Unlimited Possibilities.
              Connect and manage your favorite AI tools—ChatGPT, GitHub, LeetCode, and more.
              Access all your learning resources from a single unified dashboard.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link to="/login">
                <Button variant="primary" size="lg" className="gap-2">
                  <Rocket size={20} /> Explore Tools
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">View Resources</Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-surface/30">
        <PageContainer>
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white sm:text-4xl mb-4">Why AI Student Hub?</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">Designed by students, for students. We build the bridges between your favorite learning tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="group hover:bg-white/[0.04]">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Supported Tools Stack */}
      <section className="py-24">
        <PageContainer>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
                <Sparkles size={14} /> ECOSYSTEM
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Supported Tools</h3>
              <p className="text-gray-400 mb-8">
                We're constantly adding new integrations. Our platform supports the heavy-hitters you use every day for coding, writing, and research.
              </p>
              <Link to="/signup">
                <Button variant="outline" className="text-primary border-primary/30 hover:bg-primary/5">Join 500+ Students</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              {tools.map((t, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-colors border-white/5">
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <p className="text-sm font-semibold text-gray-300">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t border-white/10">
        <PageContainer>
          <Card className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 border-white/10 p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
                Create your account now and start connecting AI tools for a smarter, unified learning experience.
              </p>
              <Link to="/signup">
                <Button variant="primary" size="lg" className="px-12">Sign Up for Free</Button>
              </Link>
            </div>
          </Card>
        </PageContainer>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background py-12">
        <PageContainer>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Logo" className="h-6 w-6 grayscale" />
              <span className="font-bold text-sm tracking-tighter">AI STUDENT HUB</span>
            </div>
            <p className="text-xs">&copy; 2026 AI Student Hub. All rights reserved.</p>
            <div className="flex gap-6 text-xs grayscale hover:grayscale-0 transition-all">
              <Link to="#">Privacy</Link>
              <Link to="#">Terms</Link>
              <Link to="#">GitHub</Link>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  )
}

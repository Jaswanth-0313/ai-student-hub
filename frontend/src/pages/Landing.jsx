import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Student Hub" className="h-8 w-8 rounded" onError={(e) => e.target.style.display = 'none'} />
            <h1 className="text-2xl font-bold text-indigo-600">AI Student Hub</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          All AI Tools for Students in One Place
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect and manage your favorite AI tools—ChatGPT, GitHub, LeetCode, and more. 
          Access all your learning resources from a single unified dashboard.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-16">
          <Link
            to="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
          >
            🧭 Explore Tools
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg"
          >
            📚 View Resources
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Why AI Student Hub?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔗</div>
            <h4 className="text-xl font-bold mb-2">One-Click Connection</h4>
            <p className="text-gray-600">Connect your favorite AI tools securely with just your API key or username. Keep everything organized in one place.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🛡️</div>
            <h4 className="text-xl font-bold mb-2">Secure & Private</h4>
            <p className="text-gray-600">Your credentials are encrypted and never exposed. We prioritize your security and privacy at every step.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-xl font-bold mb-2">Smart Dashboard</h4>
            <p className="text-gray-600">Track your connected tools, view learning resources, and manage everything from your personalized dashboard.</p>
          </div>
        </div>
      </div>

      {/* Supported Tools */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Supported Tools</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">🤖</div>
            <p className="font-semibold">ChatGPT</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">📊</div>
            <p className="font-semibold">Gamma</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">🎨</div>
            <p className="font-semibold">Figma</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">💜</div>
            <p className="font-semibold">Lovable</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="font-semibold">Canva</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">🐙</div>
            <p className="font-semibold">GitHub</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">💻</div>
            <p className="font-semibold">LeetCode</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-2">📔</div>
            <p className="font-semibold">Notebook LM</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-indigo-600 text-white py-16 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-8 opacity-90">
            Create your account now and start connecting AI tools for a smarter learning experience.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
          >
            Sign Up for Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 AI Student Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

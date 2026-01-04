import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Brain, Shield, Zap, Users, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Interviews',
    description: 'Experience realistic interviews with our advanced AI that adapts to your responses in real-time.',
  },
  {
    icon: Code2,
    title: 'Live Coding Challenges',
    description: 'Solve DSA problems in a real IDE with syntax highlighting, auto-complete, and instant feedback.',
  },
  {
    icon: Shield,
    title: 'Proctored Sessions',
    description: 'AI-based proctoring ensures interview integrity with face detection and tab monitoring.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get detailed scorecards analyzing your logic, communication, and problem-solving approach.',
  },
]

const stats = [
  { value: '50K+', label: 'Active Candidates' },
  { value: '500+', label: 'Partner Companies' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'AI Availability' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f23]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">CosInv</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">Jobs</Link>
              <Link to="/practice" className="text-gray-400 hover:text-white transition-colors">Practice</Link>
              <Link to="/learn" className="text-gray-400 hover:text-white transition-colors">Learn</Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <Zap className="h-4 w-4" />
            AI-Powered Technical Interviews
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Ace Your Next
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Technical Interview
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Practice with AI interviewers, solve real coding challenges, and get hired 
            by top companies. Your journey to your dream job starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/register">
                Start Practicing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our platform provides all the tools and resources to prepare you 
              for technical interviews at top tech companies.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-gray-800/50 border-gray-700 hover:border-indigo-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex -space-x-4">
                  <Users className="h-16 w-16 text-indigo-400" />
                  <Trophy className="h-16 w-16 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Join thousands of developers who have successfully prepared for 
                and passed technical interviews using CosInv.
              </p>
              <Button size="lg" asChild>
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-white">CosInv</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 CosInv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

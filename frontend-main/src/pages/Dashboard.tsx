import { Link } from 'react-router-dom'
import { 
  Briefcase, 
  Code2, 
  Trophy, 
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import ActivityHeatmap from '@/components/features/ActivityHeatmap'

const mockStats = [
  { icon: Code2, label: 'Problems Solved', value: '127', change: '+12 this week' },
  { icon: Briefcase, label: 'Applications', value: '8', change: '3 in progress' },
  { icon: Trophy, label: 'Interviews', value: '5', change: '2 upcoming' },
  { icon: TrendingUp, label: 'Success Rate', value: '85%', change: '+5% this month' },
]

const mockApplications = [
  { company: 'Google', role: 'Software Engineer L4', status: 'interview', date: '2026-01-10' },
  { company: 'Meta', role: 'Frontend Engineer', status: 'applied', date: '2026-01-05' },
  { company: 'Stripe', role: 'Full Stack Developer', status: 'screening', date: '2026-01-03' },
]

const mockUpcoming = [
  { type: 'Interview', company: 'Google', time: '10:00 AM', date: 'Tomorrow' },
  { type: 'Practice', topic: 'Dynamic Programming', time: '2:00 PM', date: 'Jan 8' },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="text-gray-400 mt-1">Here's your interview preparation progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-orange-300 font-medium">12 Day Streak</span>
          </div>
          <Button asChild>
            <Link to="/practice">
              Start Practicing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart & Upcoming */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap />
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockUpcoming.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  {item.type === 'Interview' ? (
                    <Calendar className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <Code2 className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.type === 'Interview' ? `${item.company} Interview` : item.topic}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    {item.time} · {item.date}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-indigo-400">
              View All Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Active Applications</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/jobs">View All Jobs</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockApplications.map((app, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{app.company[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{app.role}</p>
                    <p className="text-sm text-gray-400">{app.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      app.status === 'interview'
                        ? 'success'
                        : app.status === 'screening'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {app.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

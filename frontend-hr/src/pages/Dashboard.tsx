import { Link } from 'react-router-dom'
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const stats = [
  { label: 'Active Jobs', value: '12', change: '+2 this week', icon: Briefcase, color: 'bg-blue-500' },
  { label: 'Total Candidates', value: '248', change: '+18 this week', icon: Users, color: 'bg-green-500' },
  { label: 'Interviews Today', value: '8', change: '3 pending', icon: Calendar, color: 'bg-purple-500' },
  { label: 'Hire Rate', value: '24%', change: '+4% vs last month', icon: TrendingUp, color: 'bg-amber-500' },
]

const recentCandidates = [
  { id: '1', name: 'Alex Chen', role: 'Senior Frontend Developer', score: 92, status: 'passed', avatar: null },
  { id: '2', name: 'Maria Garcia', role: 'Full Stack Engineer', score: 88, status: 'passed', avatar: null },
  { id: '3', name: 'James Wilson', role: 'Backend Developer', score: 65, status: 'pending', avatar: null },
  { id: '4', name: 'Emily Brown', role: 'DevOps Engineer', score: 45, status: 'failed', avatar: null },
]

const upcomingInterviews = [
  { id: '1', candidate: 'David Lee', role: 'Senior Backend Developer', time: '10:00 AM', type: 'Technical' },
  { id: '2', candidate: 'Sarah Kim', role: 'Full Stack Engineer', time: '11:30 AM', type: 'System Design' },
  { id: '3', candidate: 'Michael Park', role: 'Frontend Developer', time: '2:00 PM', type: 'Behavioral' },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/jobs/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Candidates</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidates" className="text-blue-600">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={candidate.avatar || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{candidate.name}</p>
                      <p className="text-sm text-slate-500">{candidate.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(candidate.score)}`}>
                      {candidate.score}%
                    </span>
                    {getStatusIcon(candidate.status)}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Today's Interviews</CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {upcomingInterviews.length} scheduled
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{interview.candidate}</p>
                      <p className="text-sm text-slate-500">{interview.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{interview.time}</p>
                    <Badge variant="outline" className="text-xs">
                      {interview.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/jobs/create" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Create Job</p>
                <p className="text-sm text-slate-500">Post a new position</p>
              </div>
            </Link>
            <Link to="/candidates" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Review Candidates</p>
                <p className="text-sm text-slate-500">View all applications</p>
              </div>
            </Link>
            <Link to="/reports" className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">View Reports</p>
                <p className="text-sm text-slate-500">Analytics & insights</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Users,
  Eye,
  Edit,
  Trash2,
  Archive,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  status: 'active' | 'paused' | 'closed'
  candidates: number
  newCandidates: number
  createdAt: string
  views: number
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    status: 'active',
    candidates: 45,
    newCandidates: 8,
    createdAt: '2024-01-15',
    views: 1240,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'active',
    candidates: 32,
    newCandidates: 3,
    createdAt: '2024-01-12',
    views: 890,
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Hybrid',
    type: 'Full-time',
    status: 'paused',
    candidates: 18,
    newCandidates: 0,
    createdAt: '2024-01-10',
    views: 560,
  },
  {
    id: '4',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Contract',
    status: 'active',
    candidates: 28,
    newCandidates: 5,
    createdAt: '2024-01-08',
    views: 720,
  },
  {
    id: '5',
    title: 'QA Engineer',
    department: 'Quality Assurance',
    location: 'Remote',
    type: 'Full-time',
    status: 'closed',
    candidates: 52,
    newCandidates: 0,
    createdAt: '2023-12-20',
    views: 1450,
  },
]

function getStatusBadge(status: Job['status']) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
    case 'paused':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Paused</Badge>
    case 'closed':
      return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Closed</Badge>
  }
}

export default function JobManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-500">Manage your open positions</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/jobs/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{mockJobs.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{mockJobs.filter(j => j.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Candidates</p>
            <p className="text-2xl font-bold text-slate-900">{mockJobs.reduce((acc, j) => acc + j.candidates, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">New Today</p>
            <p className="text-2xl font-bold text-blue-600">{mockJobs.reduce((acc, j) => acc + j.newCandidates, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.map(job => (
          <Card key={job.id} className="border-slate-200 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    {getStatusBadge(job.status)}
                    {job.newCandidates > 0 && (
                      <Badge className="bg-blue-500 text-white">
                        {job.newCandidates} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {job.department} • {job.location} • {job.type}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{job.candidates} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{job.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/candidates?job=${job.id}`}>
                        View Candidates
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Public Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          {job.status === 'active' ? 'Pause' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No jobs found matching your criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

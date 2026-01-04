import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Building2, Clock, DollarSign, Filter, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$180K - $250K',
    type: 'Full-time',
    posted: '2 days ago',
    skills: ['Python', 'Go', 'Kubernetes', 'System Design'],
    logo: 'G',
    featured: true,
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Meta',
    location: 'Remote',
    salary: '$150K - $220K',
    type: 'Full-time',
    posted: '3 days ago',
    skills: ['React', 'TypeScript', 'GraphQL'],
    logo: 'M',
    featured: true,
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$160K - $230K',
    type: 'Full-time',
    posted: '1 week ago',
    skills: ['Ruby', 'React', 'PostgreSQL'],
    logo: 'S',
    featured: false,
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    salary: '$200K - $300K',
    type: 'Full-time',
    posted: '4 days ago',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    logo: 'N',
    featured: false,
  },
  {
    id: '5',
    title: 'ML Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    salary: '$250K - $400K',
    type: 'Full-time',
    posted: '1 day ago',
    skills: ['Python', 'PyTorch', 'LLMs', 'CUDA'],
    logo: 'O',
    featured: true,
  },
]

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Job Board</h1>
        <p className="text-gray-400 mt-1">Find your next opportunity at top tech companies</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1">
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedFilters((f) => f.filter((x) => x !== filter))}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilters([])}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Job Grid */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            <Card className="hover:border-indigo-500/50 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0 group-hover:from-indigo-900 group-hover:to-purple-900 transition-colors">
                    <span className="text-2xl font-bold text-white">{job.logo}</span>
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {job.title}
                          </h3>
                          {job.featured && (
                            <Badge variant="default" className="text-xs">Featured</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {job.posted}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button className="shrink-0">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-400">No jobs found matching your criteria.</p>
            <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

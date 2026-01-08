// Mock data for development and testing
export const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$180K - $250K',
    type: 'Full-time',
    posted: '2 days ago',
    skills: ['Python', 'Go', 'Kubernetes'],
    description: 'Join our cloud platform team...',
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
    description: 'Build amazing user experiences...',
  },
]

export const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'interview',
    appliedAt: '2026-01-05',
    score: 85,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'screening',
    appliedAt: '2026-01-06',
    score: 92,
  },
]

export const mockInterviews = [
  {
    id: '1',
    jobId: '1',
    candidateId: '1',
    status: 'scheduled',
    scheduledAt: '2026-01-10T10:00:00',
    duration: 60,
  },
]

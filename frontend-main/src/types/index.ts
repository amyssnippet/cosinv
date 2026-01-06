// User types
export interface User {
  id: string
  name: string
  email: string
  username: string
  avatar?: string
  role: 'candidate' | 'hr' | 'admin'
}

// Job types
export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  posted: string
  skills: string[]
  description: string
}

// Interview types
export interface Interview {
  id: string
  jobId: string
  candidateId: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  scheduledAt: string
  duration: number
}

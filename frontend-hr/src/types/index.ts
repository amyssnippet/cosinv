// HR User types
export interface HRUser {
  id: string
  name: string
  email: string
  company: string
  role: 'recruiter' | 'manager' | 'admin'
}

// Candidate types  
export interface Candidate {
  id: string
  name: string
  email: string
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected'
  appliedAt: string
  score?: number
}

// Job Posting types
export interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  status: 'draft' | 'active' | 'closed'
  applicants: number
  createdAt: string
}

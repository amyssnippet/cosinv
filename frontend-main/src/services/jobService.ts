import { Job } from '@/types'
import { API_URL } from '@/config/constants'

export class JobService {
  static async getJobs(page: number = 1, limit: number = 10): Promise<{ jobs: Job[]; total: number }> {
    const response = await fetch(`${API_URL}/api/jobs?page=${page}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch jobs')
    return response.json()
  }

  static async getJobById(id: string): Promise<Job> {
    const response = await fetch(`${API_URL}/api/jobs/${id}`)
    if (!response.ok) throw new Error('Job not found')
    return response.json()
  }

  static async searchJobs(query: string): Promise<Job[]> {
    const response = await fetch(`${API_URL}/api/jobs/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Search failed')
    return response.json()
  }

  static async applyForJob(jobId: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Application failed')
    return response.json()
  }
}

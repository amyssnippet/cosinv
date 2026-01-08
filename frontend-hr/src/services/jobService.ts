import { JobPosting } from '@/types'
import { API_URL } from '@/config/constants'

export class JobService {
  static async getJobs(page: number = 1, limit: number = 20): Promise<{ jobs: JobPosting[]; total: number }> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/jobs?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch jobs')
    return response.json()
  }

  static async createJob(jobData: Partial<JobPosting>): Promise<JobPosting> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) throw new Error('Failed to create job')
    return response.json()
  }

  static async updateJob(jobId: string, jobData: Partial<JobPosting>): Promise<JobPosting> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) throw new Error('Failed to update job')
    return response.json()
  }

  static async deleteJob(jobId: string): Promise<void> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete job')
  }
}

import { Interview } from '@/types'
import { API_URL } from '@/config/constants'

/**
 * Service for interview scheduling, retrieval, and management.
 */
export class InterviewService {
  static async scheduleInterview(jobId: string, scheduledAt: string): Promise<Interview> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId, scheduledAt }),
    })
    if (!response.ok) throw new Error('Failed to schedule interview')
    return response.json()
  }

  static async getInterviews(): Promise<Interview[]> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch interviews')
    return response.json()
  }

  static async getInterviewById(id: string): Promise<Interview> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Interview not found')
    return response.json()
  }

  static async submitInterviewCode(interviewId: string, code: string, language: string): Promise<void> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews/${interviewId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code, language }),
    })
    if (!response.ok) throw new Error('Failed to submit code')
  }
}

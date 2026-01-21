import { Interview } from '@/types'
import { API_URL } from '@/config/constants'

/**
 * Service for interview scheduling, retrieval, and management.
 */
export class InterviewService {
  /**
   * Schedules a new interview for a job posting.
   * @param jobId - The ID of the job posting
   * @param scheduledAt - The scheduled date and time
   * @returns Promise with the created interview data
   */
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

  static async cancelInterview(interviewId: string): Promise<void> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews/${interviewId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to cancel interview')
  }

  static async rescheduleInterview(interviewId: string, newScheduledAt: string): Promise<Interview> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/interviews/${interviewId}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ scheduledAt: newScheduledAt }),
    })
    if (!response.ok) throw new Error('Failed to reschedule interview')
    return response.json()
  }
}

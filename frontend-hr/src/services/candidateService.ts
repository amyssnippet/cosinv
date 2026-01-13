import { Candidate } from '@/types'
import { API_URL } from '@/config/constants'

/**
 * Handles candidate retrieval, details, and status updates for HR portal.
 */
export class CandidateService {
  /**
   * Retrieves a paginated list of candidates.
   * @param page - Page number (default: 1)
   * @param limit - Number of candidates per page (default: 20)
   * @returns Promise with candidates array and total count
   */
  static async getCandidates(page: number = 1, limit: number = 20): Promise<{ candidates: Candidate[]; total: number }> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/candidates?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch candidates')
    return response.json()
  }

  static async getCandidateById(id: string): Promise<Candidate> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/candidates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Candidate not found')
    return response.json()
  }

  static async updateCandidateStatus(candidateId: string, status: string): Promise<Candidate> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed to update candidate')
    return response.json()
  }

  static async getCandidateInterviews(candidateId: string) {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/candidates/${candidateId}/interviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch interviews')
    return response.json()
  }
}

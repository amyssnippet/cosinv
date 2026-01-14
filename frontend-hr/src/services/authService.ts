import { HRUser, Candidate, JobPosting } from '@/types'
import { API_URL } from '@/config/constants'

/**
 * Service class for HR authentication operations.
 */
export class HRAuthService {
  /**
   * Authenticates an HR user with email and password.
   * @param email - HR user's email address
   * @param password - HR user's password
   * @returns Promise with user data and authentication token
   */
  static async login(email: string, password: string): Promise<{ user: HRUser; token: string }> {
    const response = await fetch(`${API_URL}/api/hr/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  }

  static async getCurrentUser(): Promise<HRUser> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  }

  static async logout(): Promise<void> {
    await fetch(`${API_URL}/api/hr/auth/logout`, { method: 'POST' })
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('hr_auth_token')
    const response = await fetch(`${API_URL}/api/hr/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!response.ok) throw new Error('Failed to change password')
  }
}

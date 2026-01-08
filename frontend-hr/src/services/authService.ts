import { HRUser, Candidate, JobPosting } from '@/types'
import { API_URL } from '@/config/constants'

export class HRAuthService {
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
}

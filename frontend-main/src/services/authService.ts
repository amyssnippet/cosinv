import { User } from '@/types'
import { API_URL } from '@/config/constants'

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  }

  static async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!response.ok) throw new Error('Registration failed')
    return response.json()
  }

  static async logout(): Promise<void> {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
  }

  static async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  }
}

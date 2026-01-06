// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.cosinv.com'

// App Configuration
export const APP_NAME = 'CosInv HR'
export const APP_VERSION = '1.0.0'

// Theme Colors
export const COLORS = {
  primary: '#6366f1',
  secondary: '#a855f7',
  background: '#0f0f23',
  surface: '#1a1a2e',
}

// Dashboard Settings
export const DASHBOARD_REFRESH_INTERVAL = 30000 // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Interview Settings
export const MAX_INTERVIEW_DURATION = 120 // minutes

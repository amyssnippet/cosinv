// Validation utilities
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}

export const validateJobTitle = (title: string): boolean => {
  return title.trim().length >= 3
}

export const validateSalaryRange = (min: number, max: number): boolean => {
  return min > 0 && max > min
}

export const formatSalary = (amount: number): string => {
  return `$${amount.toLocaleString()}`
}

export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

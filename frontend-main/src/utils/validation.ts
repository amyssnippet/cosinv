// Validation utility functions for forms

export function isEmail(email: string): boolean {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

export function isPhone(phone: string): boolean {
  return /^\+?\d{10,15}$/.test(phone);
}

export function isRequired(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

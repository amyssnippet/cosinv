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

export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

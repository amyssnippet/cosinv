// Object utility functions

export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function merge<T, U>(target: T, source: U): T & U {
  return Object.assign({}, target, source);
}

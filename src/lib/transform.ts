function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function toCamelCase<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(toCamelCase) as T;
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[snakeToCamel(key)] = toCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}

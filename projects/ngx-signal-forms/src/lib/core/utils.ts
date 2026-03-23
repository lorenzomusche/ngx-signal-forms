/**
 * ngxFormSerialize utility.
 *
 * Converts a form model value into a JSON-serializable object,
 * specifically mapping native File objects into descriptive strings
 * (e.g. "[File: resume.pdf (12345 bytes)]") to prevent empty {} in JSON.stringify.
 */
export function ngxFormSerialize(value: any): any {
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Handle single File
  if (value instanceof File) {
    return `[File: ${value.name} (${value.size} bytes)]`;
  }

  // Handle Array (recursive)
  if (Array.isArray(value)) {
    return value.map(v => ngxFormSerialize(v));
  }

  // Handle Object (recursive)
  const result: Record<string, any> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = ngxFormSerialize(value[key]);
    }
  }

  return result;
}

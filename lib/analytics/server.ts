export function getStoredUtmFromBody(utm?: Record<string, string>): Record<string, string> {
  return utm ?? {};
}

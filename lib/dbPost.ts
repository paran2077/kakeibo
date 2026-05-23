function safeJson(data: object): string {
  return JSON.stringify(data).replace(/[^\x00-\x7F]/g, c =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
}

export async function dbPost(table: string, method: string, data: object): Promise<void> {
  const url = '/api/db/' + table + '?_m=' + method + '&_d=' + encodeURIComponent(safeJson(data))
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'HTTP ' + res.status }))
    throw new Error(err.error || 'HTTP ' + res.status)
  }
}

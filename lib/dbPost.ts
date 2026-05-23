function safeJson(data: object): string {
  return JSON.stringify(data).replace(/[^\x00-\x7F]/g, c =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
}

export function dbPost(table: string, method: string, data: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = '/api/db/' + table + '?_m=' + method + '&_d=' + encodeURIComponent(safeJson(data))
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error || 'HTTP ' + xhr.status))
        } catch {
          reject(new Error('HTTP ' + xhr.status))
        }
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send()
  })
}

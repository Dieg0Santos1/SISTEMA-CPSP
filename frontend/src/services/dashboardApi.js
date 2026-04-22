const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  const responseBody = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof responseBody === 'object' && responseBody !== null
        ? responseBody.message ?? responseBody.error ?? 'No se pudo completar la solicitud.'
        : responseBody || 'No se pudo completar la solicitud.'

    throw new Error(message)
  }

  return responseBody
}

export async function getDashboardOverview() {
  return requestJson('/dashboard')
}

export async function downloadUpcomingCeremoniesReport(format) {
  const response = await fetch(`${API_BASE_URL}/dashboard/upcoming-ceremonies/export?format=${format}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'No se pudo exportar el reporte de juramentacion.')
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
  const filename = filenameMatch?.[1] ?? `proximos-juramentar.${format === 'pdf' ? 'pdf' : 'xlsx'}`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

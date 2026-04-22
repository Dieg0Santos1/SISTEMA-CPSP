const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

function buildQuery(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function requestFile(path, fallbackFilename) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'No se pudo completar la solicitud.')
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
  const filename = filenameMatch?.[1] ?? fallbackFilename

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function downloadColegiadosPeriodoReport({ from, to, format = 'pdf' }) {
  await requestFile(
    `/reportes/colegiados-periodo/export${buildQuery({ from, to, format })}`,
    `colegiados-periodo.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
  )
}

export async function downloadIngresosPeriodoReport({ from, to, format = 'pdf' }) {
  await requestFile(
    `/reportes/ingresos-periodo/export${buildQuery({ from, to, format })}`,
    `ingresos-periodo.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
  )
}

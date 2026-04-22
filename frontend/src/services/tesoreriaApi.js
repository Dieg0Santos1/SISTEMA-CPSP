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

async function requestFile(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'No se pudo completar la solicitud.')
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)

  return {
    blob,
    filename: filenameMatch?.[1] ?? 'comprobante.pdf',
  }
}

export async function getTesoreriaResumen() {
  return requestJson('/tesoreria/resumen')
}

export async function getTesoreriaColegiados({ search = '', page = 1, size = 5 } = {}) {
  return requestJson(`/tesoreria/colegiados${buildQuery({ search, page, size })}`)
}

export async function getTesoreriaColegiadoCobranza(colegiadoId) {
  return requestJson(`/tesoreria/colegiados/${colegiadoId}/cobranza`)
}

export async function createTesoreriaFraccionamiento(colegiadoId, payload) {
  return requestJson(`/tesoreria/colegiados/${colegiadoId}/fraccionamiento`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getTesoreriaFraccionamientos({ search = '', page = 1, size = 5 } = {}) {
  return requestJson(`/tesoreria/fraccionamientos${buildQuery({ search, page, size })}`)
}

export async function getTesoreriaFraccionamientoDetail(fraccionamientoId) {
  return requestJson(`/tesoreria/fraccionamientos/${fraccionamientoId}`)
}

export async function getTesoreriaConceptosCobro() {
  return requestJson('/tesoreria/conceptos-cobro')
}

export async function getTesoreriaConceptosCobroCatalogo() {
  return requestJson('/tesoreria/conceptos-cobro/catalogo')
}

export async function downloadTesoreriaConceptosCatalogoReport({ format = 'pdf' } = {}) {
  const file = await requestFile(`/tesoreria/conceptos-cobro/catalogo/export${buildQuery({ format })}`)

  const url = URL.createObjectURL(file.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function createTesoreriaConceptoCobro(payload) {
  return requestJson('/tesoreria/conceptos-cobro', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTesoreriaConceptoCobro(conceptoId, payload) {
  return requestJson(`/tesoreria/conceptos-cobro/${conceptoId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteTesoreriaConceptoCobro(conceptoId) {
  return requestJson(`/tesoreria/conceptos-cobro/${conceptoId}`, {
    method: 'DELETE',
  })
}

export async function postTesoreriaCobro(payload) {
  return requestJson('/tesoreria/cobros', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getTesoreriaCobroDetail(cobroId) {
  return requestJson(`/tesoreria/cobros/${cobroId}`)
}

export async function getTesoreriaCobroPdf(cobroId) {
  return requestFile(`/tesoreria/cobros/${cobroId}/pdf`)
}

export async function markTesoreriaCobroPrinted(cobroId) {
  return requestJson(`/tesoreria/cobros/${cobroId}/impresion`, {
    method: 'PATCH',
  })
}

export async function getTesoreriaHistorial({
  search = '',
  metodoPago = 'Todos',
  page = 1,
  size = 6,
} = {}) {
  return requestJson(
    `/tesoreria/historial${buildQuery({ search, metodoPago, page, size })}`,
  )
}

export async function downloadTesoreriaHistorialReport({
  search = '',
  metodoPago = 'Todos',
  format = 'pdf',
} = {}) {
  const file = await requestFile(
    `/tesoreria/historial/export${buildQuery({ search, metodoPago, format })}`,
  )

  const url = URL.createObjectURL(file.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function getTesoreriaComprobantes({
  search = '',
  printStatus = 'Todos',
  tipo = 'Todos',
  page = 1,
  size = 6,
} = {}) {
  return requestJson(
    `/tesoreria/comprobantes${buildQuery({ search, printStatus, tipo, page, size })}`,
  )
}

export async function downloadTesoreriaComprobantesReport({
  search = '',
  printStatus = 'Todos',
  tipo = 'Todos',
  format = 'pdf',
} = {}) {
  const file = await requestFile(
    `/tesoreria/comprobantes/export${buildQuery({ search, printStatus, tipo, format })}`,
  )

  const url = URL.createObjectURL(file.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  link.click()
  URL.revokeObjectURL(url)
}

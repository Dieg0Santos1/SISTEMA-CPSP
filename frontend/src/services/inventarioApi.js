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
    filename: filenameMatch?.[1] ?? 'boleta.pdf',
  }
}

export async function getInventarioDashboard() {
  return requestJson('/inventario')
}

export async function getInventarioVentaClientes() {
  return requestJson('/inventario/clientes')
}

export async function getInventarioVentasPanel() {
  return requestJson('/inventario/ventas')
}

export async function getInventarioVentaDetail(ventaId) {
  return requestJson(`/inventario/ventas/${ventaId}`)
}

export async function getInventarioVentaPdf(ventaId) {
  return requestFile(`/inventario/ventas/${ventaId}/pdf`)
}

export async function downloadInventarioProductoReport(productoId, format = 'pdf') {
  const file = await requestFile(`/inventario/productos/${productoId}/export?format=${format}`)

  const url = URL.createObjectURL(file.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function postInventarioVenta(payload) {
  return requestJson('/inventario/ventas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function markInventarioVentaPrinted(ventaId) {
  return requestJson(`/inventario/ventas/${ventaId}/impresion`, {
    method: 'PATCH',
  })
}

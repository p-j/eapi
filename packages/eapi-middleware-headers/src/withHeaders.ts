export interface WithHeadersOptions {
  addHeaders?: HeadersInit
  removeHeaders?: string[]
  existing?: 'combine' | 'override' | 'skip'
}

function uniqueNonFalsyValues<T>(...arrays: T[][]): T[] {
  return [...new Set(arrays.flat())].filter((v) => !!v)
}

export function withHeaders({
  addHeaders,
  removeHeaders = [],
  existing = 'combine',
}: WithHeadersOptions = {}): Middleware {
  return function _withHeaders(requestHandler: RequestHandler) {
    return async function heandersHandler({ event, request, params }: RequestContext) {
      const originalResponse = await requestHandler({ event, request, params })
      const response = new Response(originalResponse.body, originalResponse)

      if (addHeaders) {
        const headers = new Headers(addHeaders)
        headers.forEach((value, header) => {
          const values = value.split(',')
          const originalValues = (response.headers.get(header) || '').split(',')

          switch (existing) {
            case 'combine':
              // Ensure unique values while combining
              response.headers.set(header, uniqueNonFalsyValues(originalValues, values).join(','))
              break
            case 'override':
              // Ensure unique values while overriding
              response.headers.set(header, uniqueNonFalsyValues(values).join(','))
              break
            case 'skip':
            default:
              break
          }
        })
      }

      removeHeaders.forEach((header) => response.headers.delete(header))

      return response
    }
  }
}

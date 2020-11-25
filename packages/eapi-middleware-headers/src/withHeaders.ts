export interface WithHeadersOptions {
  addRequestHeaders?: HeadersInit
  removeRequestHeaders?: string[]
  addResponseHeaders?: HeadersInit
  removeResponseHeaders?: string[]
  existing?: 'combine' | 'override' | 'skip'
}

/**
 * Middlware for modifying headers
 * @param options
 * @param options.addRequestHeaders headers to add to the Request before passing it down to the requestHandler
 * @param options.removeRequestHeaders headers to remove from the Request before passing it down to the requestHandler
 * @param options.addResponseHeaders headers to add to the Response before returning it
 * @param options.removeResponseHeaders headers to remove from the Response before returning it
 * @param options.existing define how add<Request|Response>Headers will handle existing headers, it can be set to either 'combine', 'override' or 'skip'. Defaults to 'combine'.
 */
export function withHeaders({
  addRequestHeaders,
  removeRequestHeaders = [],
  addResponseHeaders,
  removeResponseHeaders = [],
  existing = 'combine',
}: WithHeadersOptions = {}): Middleware {
  return function _withHeaders(requestHandler: RequestHandler) {
    return async function headersHandler({ event, request: originalRequest, params }: RequestContext) {
      // Work on the request headers
      const request = manageHeaders({
        subject: originalRequest,
        addHeaders: addRequestHeaders,
        removeHeaders: removeRequestHeaders,
        existing,
      }) as Request

      // Produce the original response
      const response = await requestHandler({ event, request, params })

      // Work on the response headers
      return manageHeaders({
        subject: response,
        addHeaders: addResponseHeaders,
        removeHeaders: removeResponseHeaders,
        existing,
      }) as Response
    }
  }
}

export interface ManageHeadersOptions {
  subject: Request | Response
  addHeaders?: HeadersInit
  removeHeaders?: string[]
  existing?: 'combine' | 'override' | 'skip'
}

/**
 * Add / Remove / Edit headers on both Request & Response
 * @param options
 * @param options.subject the Request or Response to work on
 * @param options.addHeaders headers to add
 * @param options.removeHeaders headers to remove
 * @param options.existing define how addHeaders will handle existing headers, it can be set to either 'combine', 'override' or 'skip'. Defaults to 'combine'.
 */
export function manageHeaders({
  subject: originalSubject,
  addHeaders,
  removeHeaders = [],
  existing = 'combine',
}: ManageHeadersOptions): Request | Response {
  // Initialize a cloned Request or Response to allow the editing of headers (read-only otherwise)
  const subject =
    originalSubject instanceof Request
      ? new Request(originalSubject.url, originalSubject)
      : new Response(originalSubject.body, originalSubject)

  if (addHeaders) {
    const headers = new Headers(addHeaders)
    for (let [header, value] of headers.entries()) {
      const values = parseHeaderValues(value)
      const originalValues = parseHeaderValues(subject.headers.get(header) || '')

      if (values.length) {
        switch (existing) {
          case 'combine':
            // Ensure unique values while combining
            subject.headers.set(header, serializeHeaderValues(originalValues, values))

            break
          case 'override':
            // Ensure unique values while overriding
            subject.headers.set(header, serializeHeaderValues(values))
            break
          case 'skip':
            if (!originalValues.length) {
              subject.headers.set(header, serializeHeaderValues(values))
            }
          default:
            break
        }
      }
    }
  }

  removeHeaders.forEach((header) => subject.headers.delete(header))

  return subject
}

export function parseHeaderValues(valueString: string): string[] {
  return valueString
    .split(',')
    .map((value) => value.trim())
    .filter((v) => !!v)
}

export function serializeHeaderValues(...values: string[][]): string {
  return [...new Set(values.flat())].filter((v) => !!v).join(',')
}

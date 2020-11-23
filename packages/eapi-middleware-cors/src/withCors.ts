export interface WithCorsOptions {
  isOriginAllowed?: Function
  accessControlAllowHeaders?: string[]
  accessControlAllowMethods?: string[]
  accessControlMaxAge?: number
  accessControlAllowCredentials?: boolean
  accessControlExposeHeaders?: string[]
}

export interface CorsOptions extends WithCorsOptions {
  response: Response
  accessControlAllowOrigin?: string
}

/**
 * Uitility function to apply CORS configuration to a Response
 * @param options
 * @param options.response response on which apply cors headers
 * @param options.isOriginAllowed an optional function to validate the origin of the request
 * @param options.accessControlAllowOrigin Access-Control-Allow-Origin value. Defaults to '*'.
 * @param options.accessControlAllowHeaders an array of allowed headers. Defaults to ['origin', 'content-type', 'accept', 'authorization']
 * @param options.accessControlAllowMethods an array of allowed methods. Defaults to ['GET', 'OPTIONS', 'HEAD']
 * @param options.accessControlMaxAge how long the results of a preflight request can be cached. Defaults to 1 hour.
 * @param options.accessControlAllowCredentials control the Access-Control-Allow-Credentials header.
 * @param options.accessControlExposeHeaders an array of exposed headers. Defaults to [].
 * @returns a Response with CORS headers
 */
export function cors({
  response,
  isOriginAllowed,
  accessControlAllowOrigin = '*',
  accessControlAllowHeaders = ['Origin', 'Content-Type', 'Accept', 'Authorization'],
  accessControlAllowMethods = ['GET', 'OPTIONS', 'HEAD'],
  accessControlMaxAge = 3600,
  accessControlAllowCredentials = false,
  accessControlExposeHeaders = [],
}: CorsOptions): Response {
  if (typeof isOriginAllowed === 'function' && !isOriginAllowed(accessControlAllowOrigin)) {
    return response
  }

  const responseWithCors = new Response(response.body, response)
  responseWithCors.headers.set('Access-Control-Allow-Origin', accessControlAllowOrigin)
  responseWithCors.headers.set('Access-Control-Allow-Headers', accessControlAllowHeaders.join(', '))
  responseWithCors.headers.set('Access-Control-Allow-Methods', accessControlAllowMethods.join(', '))
  responseWithCors.headers.set('Access-Control-Max-Age', String(accessControlMaxAge))

  if (accessControlAllowCredentials) {
    responseWithCors.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (accessControlExposeHeaders.length) {
    responseWithCors.headers.set('Access-Control-Expose-Headers', accessControlExposeHeaders.join(', '))
  }

  const vary = responseWithCors.headers.get('Vary')
  if (accessControlAllowOrigin !== '*' && (!vary || !vary.includes('Origin'))) {
    responseWithCors.headers.append('Vary', 'Origin')
  }

  return responseWithCors
}

/**
 * Middleware factory to apply CORS configuration
 * @param options
 * @param options.isOriginAllowed an optional function to validate the origin of the request
 * @param options.accessControlAllowHeaders an array of allowed headers. Defaults to ['origin', 'content-type', 'accept', 'authorization']
 * @param options.accessControlAllowMethods an array of allowed methods. Defaults to ['GET', 'OPTIONS', 'HEAD']
 * @param options.accessControlMaxAge how long the results of a preflight request can be cached. Defaults to 1 hour.
 * @param options.accessControlAllowCredentials control the Access-Control-Allow-Credentials header.
 * @param options.accessControlExposeHeaders an array of exposed headers. Defaults to [].
 * @returns a Middleware function
 */
export function withCors({
  isOriginAllowed,
  accessControlAllowHeaders,
  accessControlAllowMethods,
  accessControlMaxAge,
  accessControlAllowCredentials,
  accessControlExposeHeaders,
}: WithCorsOptions = {}): Middleware {
  return function _withCors(requestHandler: RequestHandler) {
    return async function corsHandler({ event, request, params }: RequestContext) {
      const response = await requestHandler({ event, request, params })
      const origin = request.headers.get('Origin')
      // If the Origin header is missing we don't add CORS Headers
      if (!origin) return response
      return cors({
        response,
        isOriginAllowed,
        accessControlAllowOrigin: origin,
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
        accessControlAllowCredentials,
        accessControlExposeHeaders,
      })
    }
  }
}

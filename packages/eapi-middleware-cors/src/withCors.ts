import { Middleware } from '@p-j/eapi-types'

export interface WithCorsOptions {
  isOriginAllowed?: Function
  accessControlAllowHeaders: string[]
  accessControlAllowMethods: string[]
  accessControlMaxAge: number
}

export interface CorsOptions extends WithCorsOptions {
  response: Response
  origin: string
}

/**
 * @param options
 * @param options.response response on which apply cors headers
 * @param options.origin origin to set for access-control-allow-origin
 * @param options.isOriginAllowed an optional function to validate the origin of the request
 * @returns a Response with CORS headers
 */
export function cors({
  response,
  origin,
  isOriginAllowed,
  accessControlAllowHeaders,
  accessControlAllowMethods,
  accessControlMaxAge,
}: CorsOptions): Response {
  if (typeof isOriginAllowed === 'function' && !isOriginAllowed(origin)) {
    return response
  }
  const responseWithCors = new Response(response.body, response)
  responseWithCors.headers.set('Access-Control-Allow-Origin', origin)
  responseWithCors.headers.set('Access-Control-Allow-Headers', accessControlAllowHeaders.join(', '))
  responseWithCors.headers.set('Access-Control-Allow-Methods', accessControlAllowMethods.join(', '))
  responseWithCors.headers.set('Access-Control-Max-Age', `${accessControlMaxAge}`)
  const vary = responseWithCors.headers.get('Vary')
  if (!vary || !vary.includes('Origin')) {
    responseWithCors.headers.append('Vary', 'Origin')
  }
  return responseWithCors
}

export function withCors({
  isOriginAllowed,
  accessControlAllowHeaders,
  accessControlAllowMethods,
  accessControlMaxAge,
}: WithCorsOptions): Middleware {
  return function _withCors(requestHandler) {
    return async function corsHandler({ event, request, params }) {
      const response = await requestHandler({ event, request, params })
      const origin = request.headers.get('Origin') || '*'
      return cors({
        response,
        origin,
        isOriginAllowed,
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })
    }
  }
}

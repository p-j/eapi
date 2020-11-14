import { Middleware } from '@p-j/eapi-types'

export interface WithCacheOptions {
  cacheControl?: string
  cdnTtl?: number
  cacheError?: boolean
  varyHeaders?: string[]
  serverTimings?: boolean
}

/**
 * Higher order function providing generic cache handling for request handlers
 * @param options hash containing the value to be assigned to the Cache-Control header and wheter or not to cache errors
 * @param options.cacheControl the value to be assigned to the Cache-Control header (control the Browser Cache TTL)
 * @param options.cdnTtl this control the Edge Cache TTL, by default it also sets a cacheControl of the same value
 * @param options.cacheCacheError Optional: wheter or not to cache errors. Defaults to false.
 * @param options.varyHeaders Optional: an array of Header names to be add to the Vary Header (eg: 'Accept', 'Origin' ... )
 * @param options.serverTimings Optional: add Server-Timing header with cache interaction information. Defaults to true.
 * @returns a middleware that will apply caching to the passed request handler
 *
 * @description
 * For a better understanding of how cache works in the context of Cloudflare Workers, these links may help:
 * @see https://developers.cloudflare.com/workers/about/using-cache/
 * @see https://developers.cloudflare.com/workers/reference/apis/cache/
 * @see https://developers.cloudflare.com/workers/about/limits/#cache-api
 *
 * And for the underlying API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Cache
 */
export function withCache({
  cacheControl,
  cdnTtl,
  cacheError = false,
  varyHeaders = [],
  serverTimings = true,
}: WithCacheOptions = {}): Middleware {
  return function _withCache(requestHandler) {
    return async function cacheHandler({ event, request, params }) {
      // Bypass the middleware if not applicable
      if (!isCacheable(request)) return requestHandler({ event, request, params })

      const cache = caches.default

      if (cdnTtl) {
        // Override CDN Caching rules for this request
        // This is equivalent to setting two page rules: "Edge Cache TTL" to cdnTtl and "Cache Level" to "Cache Everything"
        // cdnTtl will also add a Cache-Control header of the same value by default
        const newRequest = new Request(request, {
          cf: { cacheTtl: cdnTtl },
          redirect: 'follow',
        })
        request = newRequest
      }

      const startTime = Date.now()
      let cacheMiss = false
      let originalResponse = await cache.match(event.request, {
        ignoreMethod: false,
      })

      if (!originalResponse) {
        cacheMiss = true
        originalResponse = await requestHandler({ event, request, params })
      }
      const execTime = Date.now() - startTime
      // some properties of response are immutables, so we create a new one to be able to modify headers
      // https://developers.cloudflare.com/workers/templates/pages/modify_res_props
      const response = new Response(originalResponse.body, originalResponse)
      // Add some timings information, if taken from cache, the values stacks which is neat
      if (serverTimings) {
        response.headers.append('Server-Timing', `cfw-${cacheMiss ? 'miss' : 'hit'};dur=${execTime}`)
      }

      if (!cacheError && response.status >= 400) {
        // If response is an error, by default we prevent it from being cached
        response.headers.set('Cache-Control', 'no-store')
      } else if (cacheControl) {
        // Override the cacheControl with the given value
        response.headers.set('Cache-Control', cacheControl)
      }

      const shouldPutInCache =
        cacheMiss && response.headers.get('Cache-Control') && response.headers.get('Cache-Control') !== 'no-store'

      if (shouldPutInCache) {
        varyHeaders.forEach((header) => {
          const vary = response.headers.get('Vary')
          if (!vary || !vary.includes(header)) {
            response.headers.append('Vary', header)
          }
        })
        event.waitUntil(cache.put(event.request, response.clone()))
      }

      return response
    }
  }
}

/**
 * Check if a request is cacheable
 * @param request
 * @see https://w3c.github.io/ServiceWorker/#cache-addAll
 */
export function isCacheable(request: Request): boolean {
  const requestScheme = new URL(request.url).protocol.replace(':', '')
  return request.method === 'GET' && ['http', 'https'].includes(requestScheme)
}

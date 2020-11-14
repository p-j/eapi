import { Middleware } from '@p-j/eapi-types'

/**
 * Higher order function providing generic error handling for request handlers
 */

export function withErrorHandler({ allowDebug = false } = {}): Middleware {
  return function _withErrorHandler(requestHandler) {
    return async function errorHandler({ event, request, params }) {
      try {
        // await is not superfluous here as otherwise the catch is bypassed
        return await requestHandler({ event, request, params })
      } catch (error) {
        // Do something with the error, for development purpose this proposes a debug param that will allow you to see the stack trace directly
        const debug = new URL(request.url).searchParams.get('debug') === 'true' && allowDebug
        return new Response(debug ? error.stack || error : null, {
          status: 500,
        })
      }
    }
  }
}

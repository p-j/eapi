/**
 * The context of the current Error, extending the RequestContext
 */
export interface ErrorContext extends RequestContext {
  error: Error
}

/**
 * External Error handler, used to log the error to an external system for instance.
 */
export interface ErrorForwarder {
  (ctx: ErrorContext): void | Promise<void>
}

export interface WithErrorHandlerOptions {
  enableDebug?: boolean
  forwardError?: ErrorForwarder
}

/**
 * Middleware Factory returning a configured middleware for handling exceptions thrown by the requestHandler
 * @param options
 * @param options.enableDebug Optional: set to true to enable debug output using the ?debug=true querystring. Defaults to false.
 * @param options.forwardError Optional: a function to do something else with the error; eg: log it ton an external system.
 *                             It takes in an ErrorContext (a RequestContext extended with an error).
 */
export function withErrorHandler({ enableDebug = false, forwardError }: WithErrorHandlerOptions = {}): Middleware {
  return function _withErrorHandler(requestHandler: RequestHandler) {
    return async function errorHandler({ event, request, params }: RequestContext) {
      try {
        // await is not superfluous here as otherwise the catch is bypassed
        return await requestHandler({ event, request, params })
      } catch (error: unknown) {
        // While developing adding a debug param will allow you to see the stack trace directly
        const debug = new URL(request.url).searchParams.get('debug') === 'true' && enableDebug
        // if a forward function has been defined, we pass the error to it alongside the original event
        // in case you need to use event.waitUntil while posting the error to a remote monitoring service for instance
        if (forwardError && error instanceof Error) forwardError({ error, event, request, params })
        // TODO: handle Accept header (eg: respond with JSON vs Text)
        return new Response(debug && error instanceof Error ? error.stack || error.toString() : null, {
          status: 500,
        })
      }
    }
  }
}

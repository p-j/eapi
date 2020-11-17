import { applyMiddlewares } from '@p-j/eapi-util-applymiddlewares'

export interface EventHandlerFactoryOptions {
  matcher: RouteMatcher
  originless?: boolean
  middlewares?: Middleware[]
}

/**
 * Fetch Event Handler Factory
 * This reusable factory can be used in a multi-router setup.
 * It's especially useful if you combine originless routes with traditional routes on the same project
 * @param options
 * @param options.matcher a function that given a FetchEvent returns the corresponding RequestHandler & Params.
 * @param options.originless whether or not the eventHandler has an origin to default to. Defaults to false.
 * @param options.middlewares an array of Middleware to be applied to every RequestHandler
 * @returns the eventHandler for the given configuration
 */
export function fetchEventHandler({
  matcher,
  originless = false,
  middlewares = [],
}: EventHandlerFactoryOptions): FetchEventHandler {
  /**
   * Event Handler
   * Passes the RequestContext to the RequestHandler if a route is matched
   * continue to the origin otherwise, unless it's an originless setup
   * @param event the original FetchEvent received by the worker
   * @returns the final promise of response to be sent to the client
   */
  return async function _fetchEventHandler(event: FetchEvent) {
    const match = matcher(event)

    const requestContext = {
      event,
      request: event.request,
      params: (match && match.params) || {},
    }

    return match // apply all middlwares to build the final request handler and pass it the request context
      ? applyMiddlewares(match.handler, ...middlewares)(requestContext)
      : originless // if no match, respond with a 404 in case of an oringless worker, call the origin otherwise
      ? new Response('Not Found', { status: 404 })
      : fetch(event.request)
  }
}

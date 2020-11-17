/**
 * Params are parsed options, usually extracted from the Request (path/query string...)
 */
interface Params {
  [key: string]: string
}

/**
 * The context of the current request, including the full FetchEvent, the current Request and the Params matched by the Router if any
 */
interface RequestContext {
  event: FetchEvent
  request: Request
  params: Params
}

/**
 * Responsible for providing the Response to a given RequestContext
 */
interface RequestHandler {
  (context: RequestContext): Promise<Response> | Response
}

/**
 * Higher order functions that will wrap RequestHandlers with additional logic
 * Example: Error management, Cache handling
 */
interface Middleware {
  (func: RequestHandler): RequestHandler
}

/**
 * A Middleware factory takes in options for the underlying Middleware function
 * Example:
 * - Cache settings for a Cache handling middleware.
 * - Transforms for a Redirect middleware.
 */
interface MiddlewareFactory {
  (options?: unknown): Middleware
}

/**
 * A Transform takes in the RequestContext and returns a transformed Request
 */
interface Transform {
  (context: RequestContext): Request
}

/**
 * Responsible for providing the Response to a given FetchEvent
 */
interface FetchEventHandler {
  (event: FetchEvent): Response | Promise<Response>
}

/**
 * Responsible from providing a RequestHandler and the Params for a given FetchEvent
 */
interface RouteMatcher {
  (event: FetchEvent): {
    handler: RequestHandler
    params: Params
  } | null
}

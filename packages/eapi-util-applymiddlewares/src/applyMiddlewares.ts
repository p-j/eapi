/**
 * Apply a stack of Middlware atop the request handler
 * @param requestHandler the request handler for the current RequestContext
 * @param middlewares the stack of Middleware to be applied listed in order of precedence
 * @example
 * applyMiddlewares(handler, a, b, c) // is equivalent to
 * a(b(c(handler)))
 */
export function applyMiddlewares(requestHandler: RequestHandler, ...middlewares: Middleware[]): RequestHandler {
  return middlewares.reduceRight(
    (previousHandler, currentMiddleware) => currentMiddleware(previousHandler),
    requestHandler,
  )
}

export interface WithRedirectOptions {
  urlOrPath?: string
  transform?: Transform
  transparent?: boolean
  permanent?: boolean
  redirect?: 'follow' | 'error' | 'manual' | undefined
}

/**
 * @param options
 * @param options.urlOrPath the url, absolute or relative to redirect to. Defaults to an empty string
 * @param options.transform transformation function
 * @param options.transparent is the redirection transparent (forward directly the targeted response). Defaults to true.
 * @param options.permanent if not transparent, is the redirection permanent (301) or not (302). Defaults to false.
 * @param options.redirect one of Request.redirect valid values (follow, manual, error) determining the behavior of the request handler if it encounters a redirect. Defaults to 'follow'.
 * @returns a Middleware that will apply redirections/rewrite to the passed handler, finally returning a Response (or Promise of a Response) that is either a redirect to the new URL if args.transparent=false or an actual Response.
 */
export function withRedirect({
  urlOrPath = '',
  transform,
  transparent = true,
  permanent = false,
  redirect = 'follow',
}: WithRedirectOptions = {}): Middleware {
  return function _withRedirect(requestHandler: RequestHandler) {
    return async function redirectHandler({ event, request, params }: RequestContext) {
      const originalURL = new URL(request.url)
      originalURL.searchParams.sort() // Sorted for comparison (see below)

      // new URL(input[, base])
      // input <string> The absolute or relative input URL to parse.
      // If input is relative, then base is required.
      // If input is absolute, the base is ignored.
      const url = new URL(urlOrPath, request.url)
      const intermediateRequest = new Request(url.toString(), request)
      const transformedRequest =
        typeof transform === 'function'
          ? transform({ request: intermediateRequest, params, event })
          : intermediateRequest

      // Apply the redirect configuration:
      // - with 'follow' the worker act as a proxy (the request handler will follow redirects to get the final response)
      // - with 'manual' the worker act as a redirect (the request handler won't follow redirects and will return them to the client)
      const finalRequest = new Request(transformedRequest, { redirect })

      const finalURL = new URL(finalRequest.url)
      finalURL.searchParams.sort() // Sorted for comparison (see below)

      // if not transparent and the URL has been changed, the requestHandler will be ignored
      // as we need to redirect to the new URL
      if (!transparent && originalURL.toString() !== finalURL.toString())
        return Response.redirect(finalURL.toString(), permanent ? 301 : 302)

      return requestHandler({ event, request: finalRequest, params })
    }
  }
}

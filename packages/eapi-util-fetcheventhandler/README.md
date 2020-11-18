# `@p-j/eapi-util-fetcheventhandler`

> This package provide a Fetch Event Handler factory that can be used in a multi-router setup.
>
> It's especially useful if you combine originless routes with traditional routes on the same project
>
> It also facilitate the application of "global" middlwares to all your routes.

## Usage

```ts
import { fetchEventHandler } from '@p-j/eapi-util-fetcheventhandler'
import { withErrorHandler } from '@p-j/eapi-middleware-errorhandler'

const requestHandler: RequestHandler = (context) => new Response('Hello World')
const matcher: RouteMatcher = (event) => { handler: requestHandler, param: {} }

const eventHandler = fetchEventHandler({
  matcher,
  originless: true,
  middlewares: [withErrorHandler()]
})

addEventListener('fetch', (event) => event.respondWith(fetchEventHandler(event)))
```

## Example with `tiny-request-router`

```ts
import { fetchEventHandler } from '@p-j/eapi-util-fetcheventhandler'
import { withErrorHandler } from '@p-j/eapi-middleware-errorhandler'

const requestHandler: RequestHandler = (context: RequestContext) => new Response('Hello World')

export const router = new Router()
router.all('/', requestHandler)

const matcher: RouteMatcher = (event: FetchEvent) => {
  const { pathname } = new URL(event.request.url)
  return router.match(event.request.method as Method, pathname)
}

export const fetchEventHandler = eventHandlerFactory({
  matcher,
  originless: true,
  middlewares: [withErrorHandler()],
})

addEventListener('fetch', (event) => event.respondWith(fetchEventHandler(event)))
```

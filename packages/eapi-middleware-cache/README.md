# `eapi-middleware-cache`

> A middleware to configure cache behavior on a per route or request basis

## Usage

`withCache` is a Middleware Factory, that, given a number of options, will return an actual Middleware function.
The middleware function can then be applied to the request handler `middlware(requestHandler)` and returns an enhanced request handler.
The [type definitions](https://github.com/p-j/eapi/blob/main/packages/eapi-types/index.d.ts) can help you better understand how things work together.

### With [`@p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template)

That's the recommended way of using this middleware as it was built with this integration in mind.
This example is already setup in [`@p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template)

```ts
// src/router.ts

import { Router } from 'tiny-request-router'
import { TTL_30MINUTES } from './helpers/konstants'
import { withCache } from '@p-j/eapi-middleware-cache'
import { applyMiddlewares } from '@p-j/eapi-util-applyMiddlewares'

function requestHandler({ event, request, params }: RequestContext): Response {
  return new Response('Hello World!')
}

/**
 * Route definitions
 */
export const router = new Router()
router.all(
  '/',
  applyMiddlewares(
    requestHandler,
    withCache({
      cacheControl: `public, max-age=${TTL_30MINUTES}`,
      cdnTtl: TTL_30MINUTES,
    }),
  ),
)

// The router is then used to match request in the src/index.ts
```

### With EAPI toolkit

Combining some of the EAPI tools while not embracing the whole template, you can build an extensible setup that allow you to easily apply a variaty of middlewares.

```ts
import { withCache } from '@p-j/eapi-middleware-cache'
import { applyMiddlewares } from '@p-j/eapi-util-applyMiddlewares'
import { withAwesomeMiddleware } from './withAwesomeMiddleware'

function requestHandler({ event, request, params }: RequestContext): Response {
  return new Response('Hello World!')
}

addEventListener('fetch', (event) => {
  const requestContext = { event, request: event.request, params: {} }
  // apply all the middlewares on top of the original handler
  const handler = applyMiddlewares(
    requestHandler,
    withCache({
      cacheControl: 'public, max-age=3600',
      cdnTtl: 3600,
    }),
    withAwesomeMiddleware(),
  )
  // use the enhanced handler to respond
  event.respondWith(handler(requestContext))
})
```

### Standalone

While this middleware is intended to be used with [`@p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template), you can also make use of it without any other EAPI dependency.

```ts
import { withCache } from '@p-j/eapi-middleware-cache'
import { RequestContext } from '@p-j/eapi-types'

function requestHandler({ event, request, params }: RequestContext): Response {
  return new Response('Hello World!')
}

// withCache is a Middleware Factory, here we get back a "pre configured" middleware
const cacheForOneHour = withCache({ cacheControl: 'public; max-age=3600' })
// apply the middleware to the request handler
const finalRequestHandler = cacheForOneHour(requestHandler)

addEventListener('fetch', (event) => {
  const requestContext = { event, request: event.request, params: {} }
  // use the enhanced request handler to build the response
  event.respondWith(finaleRequestHandler(requestContext))
})
```

## API

Please refer yourself to the documented code [`./src/withCache.ts`](./src/withCache.ts) and tests [`./src/withCache.test.ts`](./src/withCache.test.ts)

## Types

This package uses types from [`@p-j/eapi-types`](../eapy-types).

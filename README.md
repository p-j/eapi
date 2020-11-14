# EAPI

> EAPI for Edge API, or Extremelly Awesome Programation Interface, you decide

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## What are EAPI packages?

It's a collection of common building blocks you need to build a scalable and composable API at the Edge using [Cloudflare Workers](https://workers.cloudflare.com/) and TypeScript.

While EAPI packages are meant to work together with [`p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template), you can also use them as standalone functions as demonstrated in their respective README.

| Package                                                                   | Description                                 | Build | Coverage |
| ------------------------------------------------------------------------- | ------------------------------------------- | ----- | -------- |
| [`eapi-middleware-cache`](./packages/eapi-middleware-cache)               | A cache middleware                          |       |          |
| [`eapi-middleware-cors`](./packages/eapi-middleware-cors)                 | A CORS middleware                           |       |          |
| [`eapi-middleware-errorHandler`](./packages/eapi-middleware-errorHandler) | An Error Handler middleware                 |       |          |
| [`eapi-middleware-redirect`](./packages/eapi-middleware-redirect)         | A Redirect middleware                       |       |          |
| [`eapi-util-applyMiddlewares`](./packages/eapi-util-applyMiddlewares)     | A utility to combine multiple middlewares   |       |          |
| [`eapi-types`](./packages/eapi-types)                                     | Common TypeScript typings for EAPI projects |       |          |

## Usage

### Middlewares

`eapi-middleware-*` packages are providing Middleware Factory, that, given a number of options, will return actual Middlewares functions.
The middlewares functions can then be applied to the request handler `middlware(requestHandler)` and returns an enhanced request handler.
The [type definitions](https://github.com/p-j/eapi/blob/main/packages/eapi-types/index.d.ts) can help you better understand how things work together.

#### With [`@p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template)

That's the recommended way of using this middlewares as it was built with this integration in mind.
This example is already setup in [`@p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template)

```ts
// src/router.ts

import { Router } from 'tiny-request-router'
import { TTL_30MINUTES } from './helpers/konstants'
import { withCache } from '@p-j/eapi-middleware-cache'
import { withErrorHandler } from '@p-j/eapi-middleware-errorHandler'
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
    withErrorHandler({ enableDebug: true }),
    withCache({
      cacheControl: `public, max-age=${TTL_30MINUTES}`,
      cdnTtl: TTL_30MINUTES,
    }),
  ),
)

// The router is then used to match request in the src/index.ts
```

#### With EAPI toolkit

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

#### Standalone

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

- [`eapi-middleware-cache`](./packages/eapi-middleware-cache/README.md)
- [`eapi-middleware-cors`](./packages/eapi-middleware-cors/README.md)
- [`eapi-middleware-errorHandler`](./packages/eapi-middleware-errorHandler/README.md)
- [`eapi-middleware-redirect`](./packages/eapi-middleware-redirect/README.md)
- [`eapi-util-applyMiddlewares`](./packages/eapi-util-applyMiddlewares/README.md)

## Types

- [`@p-j/eapi-types`](../eapy-types)

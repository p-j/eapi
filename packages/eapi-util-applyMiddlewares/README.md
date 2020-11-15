# `eapi-util-applyMiddlewares`

> Apply a list of middlwares to a given request handler, returning an enhanced request handler

## Usage

```ts
import { applyMiddlewares } from '@p-j/eapi-util-applyMiddlewares'
import { withCache } from '@p-j/eapi-middleware-cache'
import { withErrorHandler } from '@p-j/eapi-middleware-errorHandler

const requestHandler: RequestHandler = (context) => new Response('Hello World')

const finaleHandler = applyMiddlewares(
  requestHandler, // first argument is the original request handler
  withErrorHandler({ enableDebug: true }), // following arguments are as many middleware as you'd like
  withCache({
    cacheControl: `public, max-age=${TTL_30MINUTES}`,
    cdnTtl: TTL_30MINUTES,
  }),
)
```

**Note on the order of application for the middlewares:**

```ts
applyMiddlewares(handler, a, b, c)
// is the same as
a(b(c(handler)))
```

So for instance, if you want to catch all exceptions within the middleware stack, you want to put the Error middleware first in the list of middlewares, as shown above.

Generally speaking, you want to start with "generic middleware" first and end with the "specific ones".

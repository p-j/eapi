# `@p-j/eapi-middleware-redirect`

> A middleware to configure redirect behavior on a per route or request basis

## Installation

- From the NPM registry

```sh
npm install @p-j/eapi-middleware-redirect
# or
yarn add @p-j/eapi-middleware-redirect
```

## API

[`withRedirect`](./src/withRedirect.ts) is a [Middleware Factory](../eapi-types/index.d.ts); it takes the following options:

```ts
export interface WithRedirectOptions {
  urlOrPath?: string
  transform?: Transform
  transparent?: boolean
  permanent?: boolean
  redirect?: 'follow' | 'error' | 'manual' | undefined
}
```

As noted above, none of the options are required.

- `urlOrPath` the url, absolute or relative to redirect to. **Defaults to `''`.**
- `transform` an optional [Transform](../eapi-types/index.d.ts) function to do avdanced transformation on the original `Request`
- `transparent` whether the redirection is transparent or not. **Defaults to `true`.** Transparent redirection will make the request handler behave like a proxy.
- `permanent` if not transparent, the redirection is either permanent (301) or not (302). **Defaults to `false`.**
- `redirect` one of `Request.redirect` valid values (_follow, manual, error_) determining the behavior of the request handler if it encounters a redirect while applying the `RequestHandler`. **Defaults to `'follow'`.** If set to `follow` and the upstream has a redirect, the worker will act as a proxy to the final response.

This middlware allow you to define redirections as well a to transparently proxy request.

## Usage

### Proxy example

Let's say you want to proxy calls to an external API without disclosing sensitive informations like an API Key to your end users, or you want to guarantee anonimity for your users with regards to that 3rd party library for compliance reason or else.

```ts
import { withRedirec } from '@p-j/eapi-middleware-redirect'

const passThrough: RequestHandler = ({ request }) => fetch(request)
const proxySomeApi = withRedirec({
  transparent: true, // forward the transformed request to the requestHandler
  redirect: 'follow', // ensure we follow any redirect that would appear while executing the transformed request
  transform: ({ request }) => {
    const url = new URL('https://some.api.com/endpoint')
    url.searchParams = { x: request.query.param1, y: request.query.param2 }
    // Making a clean new request, free of cookies, without disclosing your users IP address etc...
    // While also keeping the API KEY private to your worker
    return new Request(url, { headers: { Authorization: `Bearer ${API_KEY}` } })
  },
})

const requestHandler = proxySomeApi(passThrough)

addEventListener('fetch', (event) => event.respondWith(requestHandler({ event, request: event.request })))
```

Of course this example is trivial, but the `passThrough` request handler could contain logic of its own to validate query params and/or use KV Store for cache etc...

Also, the transform could be more generic if you were to use multiple endpoints of the 3rd party API and combined this middleware with a Router like showcased in [`p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template).

### Redirect example

Replacing Cloudflare Page Rules for redirections 😅

```ts
import { withRedirec } from '@p-j/eapi-middleware-redirect'

const passThrough: RequestHandler = ({ request }) => fetch(request)
const redirectToNewPath = withRedirec({
  transparent: false, // force a redirect to the new URL
  urlOrPath: '/newPath', // you can make use of transform for advanced url replacement
})

const requestHandler = redirectToNewPath(passThrough)

addEventListener('fetch', (event) => event.respondWith(requestHandler({ event, request: event.request })))
```

### A note on `redirect` & `transparent`

`transparent` is applied at the `middleware` level, if within the `withRedirect` a change of url happen and:

- `transparent` is _false_, then the new URL will be sent to the client as a redirect.
- `transparent` is _true_, then the new Request will passed down to the `RequestHandler`.

`redirect` is applied at the `RequestHandler` level, it's the standard [`Request.redirect`](https://developer.mozilla.org/en-US/docs/Web/API/Request/redirect).

- If set to `'manual'` and the `RequestHandler` encounter a redirection, this redirection will be sent back to the client.
- If set to `'follow'` (the default) and the `RequestHandler` encounter a redirection, it will follow it, get back the final response and send it to the client, effectively masking the redirection from the client perspective.

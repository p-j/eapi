# `@p-j/eapi-middleware-headers`

> A middleware to configure headers on both Request (to an upstream server) and Response on a per route or request basis

## Installation

- From the NPM registry

```sh
npm install @p-j/eapi-middleware-headers
# or
yarn add @p-j/eapi-middleware-headers
```

## API

- [`withHeaders`](./src/withHeaders.ts) is a [Middleware Factory](../eapi-types/index.d.ts); it takes in the following options:

  ```ts
  export interface WithHeadersOptions {
    addRequestHeaders?: HeadersInit
    removeRequestHeaders?: string[]
    addResponseHeaders?: HeadersInit
    removeResponseHeaders?: string[]
    existing?: 'combine' | 'override' | 'skip'
  }
  ```

  As noted above, none of the options are required.

  - `addRequestHeaders` headers to add to the Request before passing it down to the requestHandler
  - `removeRequestHeaders` headers to remove from the Request before passing it down to the requestHandler
  - `addResponseHeaders` headers to add to the Response before returning it
  - `removeResponseHeaders` headers to remove from the Response before returning it
  - `existing` define how add<Request|Response>Headers will handle existing headers, it can be set to either `'combine'`, `'override'` or `'skip'`. **Defaults to `'combine'`.**

- [`managerHeaders`](./src/withHeaders.ts) is a utility function that adds CORS headers to a `Request` or a `Response`; it takes in the following options:

  ```ts
  export interface ManageHeadersOptions {
    subject: Request | Response
    addHeaders?: HeadersInit
    removeHeaders?: string[]
    existing?: 'combine' | 'override' | 'skip'
  }
  ```

  - `subject` the `Request` or `Response` to work on
  - `addHeaders` headers to add
  - `removeHeaders` headers to remove
  - `existing` define how addHeaders will handle existing headers, it can be set to either `'combine'`, `'override'` or `'skip'`. **Defaults to `'combine'`.**

## Usage

### Adding a header to a Request aimed at an upstream server

Another way of implementing the [Proxy example](https://github.com/p-j/eapi/tree/main/packages/eapi-middleware-redirect#proxy-example) from the `eapi-middleware-redirect`

```ts
import { withHeaders } from '@p-j/eapi-middleware-headers'

const callUpstream: RequestHandler = ({ request }) => {
  // combine the url with the request details provided, including the Authorization Header added by the middleware
  const searchParams = new URLSearchParams({ x: request.query.param1, y: request.query.param2 })
  const upstreamRequest = new Request(`https://some.api.com/endpoint?${searchParams.toString()}`, request)
  return fetch(upstreamRequest)
}

const addAuthorizationHeader = withHeaders({ addRequestHeader: { Authorization: `Bearer ${API_KEY}` } })

const requestHandler = addAuthorizationHeader(callUpstream)

addEventListener('fetch', (event) => event.respondWith(requestHandler({ event, request: event.request })))
```

### Removing headers before forwarding a request to a 3rd party server

As a follow up to the example above, we may want to remove sensitive informations from the original request before sending it to a 3rd party server:

```ts
import { withHeaders } from '@p-j/eapi-middleware-headers'

const callUpstream: RequestHandler = ({ request }) => {
  // combine the url with the request details provided, including the Authorization Header added by the middleware
  const searchParams = new URLSearchParams({ x: request.query.param1, y: request.query.param2 })
  const upstreamRequest = new Request(`https://some.api.com/endpoint?${searchParams.toString()}`, request)
  return fetch(upstreamRequest)
}

const addAuthorizationHeader = withHeaders({
  addRequestHeader: { Authorization: `Bearer ${API_KEY}` },
  removeRequestHeaders: [
    // these headers will not be sent to the upstream server
    'user-agent',
    'referer',
    'cookie',
    'cf-connecting-ip',
  ],
})

const requestHandler = addAuthorizationHeader(callUpstream)

addEventListener('fetch', (event) => event.respondWith(requestHandler({ event, request: event.request })))
```

### Adding headers to a Response

Overriding CORS headers from an upstream API (you should likely use [`eapi-middleware-cors](../eapi-middleware-cors) for this instead)

```ts
import { withHeaders } from '@p-j/eapi-middleware-headers'

const callUpstream: RequestHandler = ({ request }) => {
  // combine the url with the request details provided, including the Authorization Header added by the middleware
  const searchParams = new URLSearchParams({ x: request.query.param1, y: request.query.param2 })
  const upstreamRequest = new Request(`https://some.api.com/endpoint?${searchParams.toString()}`, request)
  return fetch(upstreamRequest)
}

const addAuthorizationHeader = withHeaders({
  addRequestHeader: { Authorization: `Bearer ${API_KEY}` },
  removeRequestHeaders: [
    // these headers will not be sent to the upstream server
    'user-agent',
    'referer',
    'cookie',
    'cf-connecting-ip',
  ],
  addResponseHeader: {
    'Access-Control-Allow-Origin': 'https://my-awesome-origin.com',
    'Access-Control-Allow-Headers': ['Origin', 'Content-Type', 'Accept', 'Authorization'].join(','),
    'Access-Control-Allow-Methods': ['GET', 'OPTIONS', 'HEAD'].join(','),
    'Access-Control-Max-Age': '3600',
  },
  existing: 'override', // Make sure we override any exsting headers
})

const requestHandler = addAuthorizationHeader(callUpstream)

addEventListener('fetch', (event) => event.respondWith(requestHandler({ event, request: event.request })))
```

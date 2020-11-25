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

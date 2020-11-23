# `@p-j/eapi-middleware-cors`

> A middleware to configure CORS behavior on a per route or request basis

## Installation

- From the NPM registry

```sh
npm install @p-j/eapi-middleware-cors
# or
yarn add @p-j/eapi-middleware-cors
```

## API

- [`withCors`](./src/withCors.ts) is a [Middleware Factory](../eapi-types/index.d.ts); it takes in the following options:

  ```ts
  export interface WithCorsOptions {
    isOriginAllowed?: Function
    accessControlAllowHeaders?: string[]
    accessControlAllowMethods?: string[]
    accessControlMaxAge?: number
    accessControlAllowCredentials?: boolean
    accessControlExposeHeaders?: string[]
  }
  ```

  As noted above, none of the options are required.

  - `isOriginAllowed` a function to validate the `Origin` header of the request
  - `accessControlAllowHeaders` control the [`Access-Control-Allow-Headers`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers) header. **Defaults to `['origin', 'content-type', 'accept', 'authorization']`**
  - `accessControlAllowMethods` control the [`Access-Control-Allow-Methods`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods) header. **Defaults to `['GET', 'OPTIONS', 'HEAD']`**
  - `accessControlMaxAge` control the [`Access-Control-Max-Age`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age) header. **Defaults to `3600` seconds.**
  - `accessControlAllowCredentials` control the [`Access-Control-Allow-Credentials`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials) header. **Defaults to `false`.**
  - `accessControlExposeHeaders` control the [`Access-Control-Expose-Headers`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers) header. **Defaults to `[]`.**

- [`cors`](./src/withCors.ts) is a utility function that adds CORS headers to a `Response`; it takes in the following options:

  ```ts
  export interface CorsOptions extends WithCorsOptions {
    response: Response
    accessControlAllowOrigin?: string
  }
  ```

  **Note:** it extends the `WithCorsOptions`

  This function is used by `withCors` where the `accessControlAllowOrigin` is set to the `Origin` header of the request.

## Additional resources:

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS)

## Note:

If the `requestHandler` given to `withCors` or the `response` given to `cors` already contains Access-Control-\* Headers, they will be overriden with whatever config is given.

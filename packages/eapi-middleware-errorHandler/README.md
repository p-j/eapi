# `eapi-middleware-errorHandler`

> A middleware to handle exceptions within your handler & middleware stack.
> It can be configured to log the error to an external service or to render the Error to the response.

## Installation

- From the NPM registry

```sh
npm install @p-j/eapi-middleware-errorHandler
# or
yarn add @p-j/eapi-middleware-errorHandler
```

## API

[`withErrorHandler`](./src/withErrorHandler.ts) is a [Middleware Factory](../eapi-types/index.d.ts); it takes the following options:

```ts
export interface WithErrorHandlerOptions {
  enableDebug?: boolean
  forwardError?: ErrorForwarder
}
```

As noted above, none of the options are required.

- `enableDebug` enable the usage of `?debug=true` to get the stack trace to appear in the response instead of an empty HTTP 500 response.
- `forwardError` you may want to log exceptions with an external service, you can do so by providing a function here.

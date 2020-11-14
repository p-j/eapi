# EAPI

> EAPI for Edge API, or Extremelly Awesome Programation Interface, you decide

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

**Related:** [`p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template)

## What are EAPI packages?

It's a collection of common building blocks you need to build a scalable and composable API at the Edge using [Cloudflare Workers](https://workers.cloudflare.com/) and TypeScript.

While EAPI packages are meant to work together with [`p-j/worker-eapi-template`](https://github.com/p-j/worker-eapi-template), you can also use them as standalone functions as demonstrated in their respective README.

| Package                                                                   | Description                                 | Build | Coverage |
| ------------------------------------------------------------------------- | ------------------------------------------- | ----- | -------- |
| [`eapi-types`](./packages/eapi-types)                                     | Common TypeScript typings for EAPI projects |       |          |
| [`eapi-middleware-cache`](./packages/eapi-middleware-cache)               | A cache middleware                          |       |          |
| [`eapi-middleware-cors`](./packages/eapi-middleware-cors)                 | A CORS middleware                           |       |          |
| [`eapi-middleware-errorHandler`](./packages/eapi-middleware-errorHandler) | An Error Handler middleware                 |       |          |
| [`eapi-middleware-redirect`](./packages/eapi-middleware-redirect)         | A Redirect middleware                       |       |          |
| [`eapi-util-applyMiddlewares`](./packages/eapi-util-applyMiddlewares)     | A utility to combine multiple middlewares   |       |          |

# `eapi-middleware-cache`

> A middleware to configure cache behavior on a per route or request basis

## Installation

- From the NPM registry

```sh
npm install @p-j/eapi-middleware-cache
# or
yarn add @p-j/eapi-middleware-cache
```

## API

[`withCache`](./src/withCache.ts) is a [Middleware Factory](../eapi-types/index.d.ts); it takes the following options:

```ts
export interface WithCacheOptions {
  cacheControl?: string
  cdnTtl?: number
  cacheError?: boolean
  varyHeaders?: string[]
  serverTimings?: boolean
}
```

As noted above, none of the options are required.

- `cacheControl` the value to be assigned to the _Cache-Control_ header (control the _Browser Cache TTL_)
- `cdnTtl` this control the _Edge Cache TTL_, by default it also sets a _Cache-Control_ of the same value, unless `cacheControl` is also set
- `cacheCacheError` wheter or not to cache errors. **Defaults to false.**
- `varyHeaders` an array of Header names to be add to the _Vary_ header (eg: 'Accept', 'Origin' ... ).
- `serverTimings=true` add _Server-Timing_ header with cache interaction information. **Defaults to true.**

For a better understanding of how cache works in the context of Cloudflare Workers, these links may help:

- [Workers Doc: Using Cache](https://developers.cloudflare.com/workers/about/using-cache/)
- [Workers Ref: Cache](https://developers.cloudflare.com/workers/reference/apis/cache/)
- [Worker Doc: Cache API Limits](https://developers.cloudflare.com/workers/about/limits/#cache-api)

And for the underlying API

- [MDN: Web API / Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

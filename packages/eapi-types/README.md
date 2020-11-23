# EAPI Types

> A collection of types for the EAPI toolkit

## Installation

```sh
npm install @p-j/eapi-types
# or
yarn add @p-j/eapi-eapi-types
```

## Usage

The following is a minimal `tsconfig.json` for use alongside this package:

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["esnext", "webworker"],
    "types": ["@cloudflare/workers-types", "@p-j/eapi-types"]
  }
}
```

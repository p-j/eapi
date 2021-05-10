import fetch from 'node-fetch'
import { TextEncoder } from 'util'
import * as crypto from '@trust/webcrypto'
import * as makeServiceWorkerEnv from 'service-worker-mock'

/**
 * Naive Mock implementation for managing string & json with KV.
 * Feel free to improve and submit a pull request
 * @see https://github.com/cloudflare/workers-types/blob/master/index.d.ts#L576-L628
 */
export class KV_MOCK {
  store: {
    [key: string]: {
      value: string
      metadata: { expirationTtl?: number; createdAt: number }
    }
  } = {}

  reset() {
    this.store = {}
  }

  async get(key: string, type: string): Promise<string | null> {
    const valueObj = this.store[key]
    if (!valueObj) return null
    const {
      value,
      metadata: { expirationTtl, createdAt },
    } = valueObj
    if (expirationTtl && expirationTtl * 1000 + createdAt <= Date.now()) return null
    if (type === 'json') return JSON.parse(value)
    return value
  }

  async delete(key: string): Promise<void> {
    delete this.store[key]
  }

  async put(
    key: string,
    value: string,
    options: {
      expirationTtl?: number
      metadata?: any
    } = {},
  ): Promise<void> {
    this.store[key] = {
      value,
      metadata: {
        createdAt: Date.now(),
        expirationTtl: options.expirationTtl,
      },
    }
  }

  // TODO: implement list function
  async list(_options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number; metadata?: unknown }[]
    list_complete: boolean
    cursor: string
  }> {
    return {
      keys: [],
      list_complete: true,
      cursor: '',
    }
  }
}

declare var global: any
Object.assign(global, { fetch, TextEncoder, crypto }, makeServiceWorkerEnv())

// open the default cache that is readily available on Cloudflare Workers
// NOTE: there is one caveat with this setup:
// the polyfill currently allow any method to be put in cache and will match regardless of the method in the cache as well
// @see https://github.com/zackargyle/service-workers/pull/139
;(async () => (global.caches.default = await caches.open('default')))()

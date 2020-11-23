import { cors, withCors } from './withCors'

const defaultAccessControlAllowOrigin = '*'
const defaultAccessControlAllowHeaders = ['Origin', 'Content-Type', 'Accept', 'Authorization'].join(', ')
const defaultAccessControlAllowMethods = ['GET', 'OPTIONS', 'HEAD'].join(', ')
const defaultAccessControlMaxAge = '3600'

const accessControlAllowHeaders = ['Accept', 'Authorization', 'Cache-Control', 'Content-Type', 'Origin', 'User-Agent']
const accessControlAllowMethods = ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT', 'PATCH']
const accessControlMaxAge = 86400

describe('Cors', () => {
  describe('main method', () => {
    it('should set default values if no config is given', () => {
      const response = cors({ response: new Response(undefined, { status: 200 }) })
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(defaultAccessControlAllowOrigin)
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(defaultAccessControlAllowHeaders)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(defaultAccessControlAllowMethods)
      expect(response.headers.get('Access-Control-Max-Age')).toBe(defaultAccessControlMaxAge)
      expect(response.headers.get('Vary')).toBe(null)
    })

    it('should set Access-Control-Allow-Credentials', () => {
      const response = cors({ response: new Response(undefined, { status: 200 }), accessControlAllowCredentials: true })
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('should set Access-Control-Expose-Headers', () => {
      const response = cors({
        response: new Response(undefined, { status: 200 }),
        accessControlExposeHeaders: ['Content-Length', 'Authorization'],
      })
      const response2 = cors({
        response: new Response(undefined, { status: 200 }),
        accessControlExposeHeaders: ['*', 'Authorization'],
      })
      expect(response.headers.get('Access-Control-Expose-Headers')).toBe('Content-Length, Authorization')
      expect(response2.headers.get('Access-Control-Expose-Headers')).toBe('*, Authorization')
    })

    it('should set cors headers on a given response', () => {
      const response = cors({
        response: new Response(undefined, { status: 200 }),
        accessControlAllowOrigin: 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://tata.com')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(accessControlAllowHeaders.join(', '))
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(accessControlAllowMethods.join(', '))
      expect(response.headers.get('Access-Control-Max-Age')).toBe(String(accessControlMaxAge))
      expect(response.headers.get('Vary')).toBe('Origin')
    })

    it('should not set cors headers on a given response if the origin is not allowed', () => {
      const response = cors({
        response: new Response(undefined, { status: 200 }),
        accessControlAllowOrigin: 'https://tata.com',
        isOriginAllowed: (origin: string) => origin !== 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(null)
      expect(response.headers.get('Access-Control-Max-Age')).toBe(null)
    })
  })

  describe('withCors handler', () => {
    it("should apply cors headers on an handler response with request's origin", async () => {
      async function testHandler() {
        return new Response('OK', { status: 200 })
      }
      const request = new Request('https://tutu.com', { headers: { Origin: 'https://tata.com' } })
      const event = new FetchEvent('fetch', { request })

      const requestHandler = withCors()(testHandler)

      const response = await requestHandler({ event, request, params: {} })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://tata.com')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(defaultAccessControlAllowHeaders)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(defaultAccessControlAllowMethods)
      expect(response.headers.get('Access-Control-Max-Age')).toBe(defaultAccessControlMaxAge)
      expect(response.headers.get('Vary')).toBe('Origin')
    })

    it('allow valid origin', async () => {
      async function testHandler() {
        return new Response('OK', { status: 200 })
      }
      const request = new Request('https://tutu.com', { headers: { Origin: 'https://tata.com' } })
      const event = new FetchEvent('fetch', { request })

      const requestHandler = withCors({
        isOriginAllowed: (origin: string) => origin === 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })(testHandler)

      const response = await requestHandler({ event, request, params: {} })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://tata.com')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(accessControlAllowHeaders.join(', '))
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(accessControlAllowMethods.join(', '))
      expect(response.headers.get('Access-Control-Max-Age')).toBe(String(accessControlMaxAge))
      expect(response.headers.get('Vary')).toBe('Origin')
    })

    it('disallow invalid origin', async () => {
      async function testHandler() {
        return new Response('OK', { status: 200 })
      }
      const request = new Request('https://tutu.com', { headers: { Origin: 'https://tata.com' } })
      const event = new FetchEvent('fetch', { request })

      const requestHandler = withCors({
        isOriginAllowed: (origin: string) => origin !== 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })(testHandler)

      const response = await requestHandler({ event, request, params: {} })
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(null)
      expect(response.headers.get('Access-Control-Max-Age')).toBe(null)
    })

    it('bypass the middleware without origin', async () => {
      async function testHandler() {
        return new Response('OK', { status: 200 })
      }
      const request = new Request('https://tutu.com')
      const event = new FetchEvent('fetch', { request })

      const requestHandler = withCors()(testHandler)

      const response = await requestHandler({ event, request, params: {} })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(null)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(null)
      expect(response.headers.get('Access-Control-Max-Age')).toBe(null)
    })
  })
})

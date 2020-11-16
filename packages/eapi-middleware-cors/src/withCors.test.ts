import { cors, withCors } from './withCors'

const accessControlAllowHeaders = ['Accept', 'Authorization', 'Cache-Control', 'Content-Type', 'Origin', 'User-Agent']
const accessControlAllowMethods = ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT', 'PATCH']
const accessControlMaxAge = 86400

describe('Cors', () => {
  describe('main method', () => {
    it('should set cors headers on a given response', () => {
      const testResponse = new Response(undefined, { status: 204 })
      const response = cors({
        response: testResponse,
        origin: 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })
      expect(response.headers.get('access-control-allow-origin')).toBe('https://tata.com')
      expect(response.headers.get('access-control-allow-headers')).toBe(accessControlAllowHeaders.join(', '))
      expect(response.headers.get('access-control-allow-methods')).toBe(accessControlAllowMethods.join(', '))
      expect(response.headers.get('access-control-max-age')).toBe(`${accessControlMaxAge}`)
      expect(response.headers.get('Vary')).toBe('Origin')
    })

    it('should not set cors headers on a given response if the origin is not allowed', () => {
      const testResponse = new Response(undefined, { status: 204 })
      const response = cors({
        response: testResponse,
        origin: 'https://tata.com',
        isOriginAllowed: (origin: string) => origin !== 'https://tata.com',
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })
      expect(response.headers.get('access-control-allow-origin')).toBe(null)
      expect(response.headers.get('access-control-allow-headers')).toBe(null)
      expect(response.headers.get('access-control-allow-methods')).toBe(null)
      expect(response.headers.get('access-control-max-age')).toBe(null)
    })
  })

  describe('withCors handler', () => {
    it("should apply cors headers on an handler response with request's origin", async () => {
      async function testHandler() {
        return new Response('OK', { status: 200 })
      }
      const request = new Request('https://tutu.com', { headers: { Origin: 'https://tata.com' } })
      const event = new FetchEvent('fetch', { request })

      const requestHandler = withCors({
        accessControlAllowHeaders,
        accessControlAllowMethods,
        accessControlMaxAge,
      })(testHandler)

      const response = await requestHandler({ event, request, params: {} })

      expect(response.headers.get('access-control-allow-origin')).toBe('https://tata.com')
      expect(response.headers.get('access-control-allow-headers')).toBe(accessControlAllowHeaders.join(', '))
      expect(response.headers.get('access-control-allow-methods')).toBe(accessControlAllowMethods.join(', '))
      expect(response.headers.get('access-control-max-age')).toBe(`${accessControlMaxAge}`)
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

      expect(response.headers.get('access-control-allow-origin')).toBe('https://tata.com')
      expect(response.headers.get('access-control-allow-headers')).toBe(accessControlAllowHeaders.join(', '))
      expect(response.headers.get('access-control-allow-methods')).toBe(accessControlAllowMethods.join(', '))
      expect(response.headers.get('access-control-max-age')).toBe(`${accessControlMaxAge}`)
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
      expect(response.headers.get('access-control-allow-origin')).toBe(null)
      expect(response.headers.get('access-control-allow-headers')).toBe(null)
      expect(response.headers.get('access-control-allow-methods')).toBe(null)
      expect(response.headers.get('access-control-max-age')).toBe(null)
    })
  })
})

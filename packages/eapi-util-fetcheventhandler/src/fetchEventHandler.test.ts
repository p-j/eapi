import { fetchEventHandler } from './fetchEventHandler'
import fetchMock from 'jest-fetch-mock'

describe('fetchEventHandler', () => {
  const requestHandler = () => new Response('OK', { status: 200 })

  const successfullMatcher = () => ({
    handler: requestHandler,
    params: {},
  })

  const faillingMatcher = () => null

  const middlewares = [
    function middleware(requestHandler: RequestHandler): RequestHandler {
      return async ({}: RequestContext) => {
        const originalResponse = await requestHandler({} as RequestContext)
        const response = new Response(originalResponse.body, originalResponse)
        response.headers.append('X-Middleware-Applied', 'true')
        return response
      }
    },
  ]

  describe('originless: true', () => {
    it('handle a fetch event with a configured matcher', async () => {
      const eventHandler = fetchEventHandler({
        matcher: successfullMatcher,
        originless: true,
        middlewares,
      })

      const response = await eventHandler({} as FetchEvent)

      expect(await response.text()).toBe('OK')
      expect(response.status).toBe(200)
      expect(response.headers.get('X-Middleware-Applied')).toBe('true')
    })

    it('returns a 404 if the matcher returns null and originless is true', async () => {
      const eventHandler = fetchEventHandler({
        matcher: faillingMatcher,
        originless: true,
        middlewares,
      })

      const response = await eventHandler({} as FetchEvent)

      expect(await response.text()).toBe('Not Found')
      expect(response.status).toBe(404)
      expect(response.headers.get('X-Middleware-Applied')).toBe(null)
    })
  })

  describe('originless: false', () => {
    beforeAll(() => {
      fetchMock.enableMocks()
    })

    afterAll(() => {
      fetchMock.disableMocks()
    })

    it('works fine when originless & middlewares parameters are omited', async () => {
      const eventHandler = fetchEventHandler({ matcher: successfullMatcher })

      const response = await eventHandler({} as FetchEvent)

      expect(await response.text()).toBe('OK')
      expect(response.status).toBe(200)
    })

    it('let the request pass through if an origin is defined and the matcher returns null', async () => {
      const eventHandler = fetchEventHandler({
        matcher: faillingMatcher,
        originless: false,
        middlewares,
      })

      const request = new Request('https://example.com')
      const event = new FetchEvent('fetch', { request })
      // for some reason the request isn't available on the FetchEvent, so we force it here
      Object.assign(event, { request })

      fetchMock.mockResponseOnce('Hello World')

      const response = await eventHandler(event)

      expect(await response.text()).toBe('Hello World')
      expect(response.status).toBe(200)
      expect(response.headers.get('X-Middleware-Applied')).toBe(null)
    })
  })
})

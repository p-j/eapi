import { withCache } from './withCache'

describe('withCache', () => {
  let successFn: jest.Mock<Response>,
    errorFn: jest.Mock<Response>,
    waitUntil: jest.Mock<boolean>,
    matchSpy: jest.SpyInstance,
    putSpy: jest.SpyInstance,
    cacheControl: string,
    varyHeaders: string[]

  beforeEach(async () => {
    successFn = jest.fn(() => new Response('ok', { status: 200 }))
    errorFn = jest.fn(() => new Response('ko', { status: 500 }))
    waitUntil = jest.fn(() => true)

    caches.delete('default')
    caches.default = await caches.open('default')

    matchSpy = jest.spyOn(caches.default, 'match')
    putSpy = jest.spyOn(caches.default, 'put')

    cacheControl = 'public, max-age=100'
    varyHeaders = ['Accept', 'Origin']
  })

  it('caches a successful response', async () => {
    const requestHandler = withCache({ cacheControl, varyHeaders })(successFn)
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })

    const response = await requestHandler({ event, request, params: {} })

    expect(successFn.mock.calls.length).toBe(1)
    expect(waitUntil.mock.calls.length).toBe(1)
    expect(response.headers.get('Cache-Control')).toBe(cacheControl)
    expect(response.headers.get('Vary')).toBe(varyHeaders.join(','))
    expect(matchSpy).toHaveBeenCalled()
    expect(putSpy).toHaveBeenCalled()
  })

  it('hits the cache when called twice', async () => {
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })
    const requestHandler = await withCache({ cacheControl })(successFn)

    await requestHandler({ event, request, params: {} })
    await requestHandler({ event, request, params: {} })

    expect(successFn.mock.calls.length).toBe(1) // functions are called only for the 1st request
    expect(waitUntil.mock.calls.length).toBe(1) // functions are called only for the 1st request
    expect(matchSpy).toHaveBeenCalledTimes(2) // match is called for every request
    expect(putSpy).toHaveBeenCalledTimes(1) // cache was updated only for the 1st request
  })

  it('does not hit the cache when no cache header or cdnTtl is given', async () => {
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })
    const requestHandler = withCache()(successFn)

    await requestHandler({ event, request, params: {} })
    await requestHandler({ event, request, params: {} })

    expect(successFn.mock.calls.length).toBe(2) // handler function is called all the time
    expect(waitUntil.mock.calls.length).toBe(0) // waintUntil is never called
    expect(matchSpy).toHaveBeenCalledTimes(2) // match is called for every request
    expect(putSpy).toHaveBeenCalledTimes(0) // cache is never updated
  })

  it('does not cache errors by default', async () => {
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })
    const requestHandler = withCache({ cacheControl })(errorFn)

    const response = await requestHandler({ request, event, params: {} })

    expect(errorFn.mock.calls.length).toBe(1)
    expect(waitUntil.mock.calls.length).toBe(0)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(matchSpy).toHaveBeenCalled()
    expect(putSpy).not.toHaveBeenCalled()
  })

  it('caches an error if asked to', async () => {
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })
    const requestHandler = withCache({ cacheControl, cacheError: true })(errorFn)

    const response = await requestHandler({ request, event, params: {} })

    expect(errorFn.mock.calls.length).toBe(1)
    expect(waitUntil.mock.calls.length).toBe(1)
    expect(response.headers.get('Cache-Control')).toBe(cacheControl)
    expect(matchSpy).toHaveBeenCalled()
    expect(putSpy).toHaveBeenCalled()
  })

  it('combines Vary headers correctly', async () => {
    const handler = () => new Response('ok', { headers: { Vary: 'X-Custom-Header' } })
    const requestHandler = withCache({ cacheControl, varyHeaders })(handler)
    const request = new Request('https://example.com')
    const event = Object.assign(new FetchEvent('fetch', { request }), { waitUntil })

    const response = await requestHandler({ event, request, params: {} })

    expect(response.headers.get('Vary')).toBe('X-Custom-Header,' + varyHeaders.join(','))
  })
})

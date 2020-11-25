import { withHeaders } from './withHeaders'

describe('withHeaders', () => {
  let event: FetchEvent, request: Request, params: Params, handler: RequestHandler

  function collectHeaders(headers: Headers): { [key: string]: string } {
    let obj = {}
    headers.forEach((value, key) => {
      Object.assign(obj, { [key]: value })
    })
    return obj
  }

  beforeEach(() => {
    request = new Request('https://example.com', {
      headers: {
        'X-Req-Foo': 'bar',
        'X-Req-Bar': 'foo',
      },
    })
    event = new FetchEvent('fetch', { request })
    params = {}
    handler = ({ request }) =>
      new Response(JSON.stringify(collectHeaders(request.headers)), {
        status: 200,
        headers: {
          'X-Res-Foo': 'bar',
          'X-Res-Bar': 'foo',
        },
      })
  })

  describe('Request', () => {
    it('can combine headers', async () => {
      const requestHandler = withHeaders({
        addRequestHeaders: { 'X-Req-Bar': 'bar', 'X-Req-Fizz': 'buzz' },
        existing: 'combine',
      })(handler)
      const response = await requestHandler({ event, request, params })
      const json = await response.json()
      expect(json['x-req-bar']).toBe('foo,bar')
      expect(json['x-req-foo']).toBe('bar')
      expect(json['x-req-fizz']).toBe('buzz')
    })

    it('can override headers', async () => {
      const requestHandler = withHeaders({ addRequestHeaders: { 'X-Req-Bar': 'bar' }, existing: 'override' })(handler)
      const response = await requestHandler({ event, request, params })
      const json = await response.json()
      expect(json['x-req-bar']).toBe('bar')
      expect(json['x-req-foo']).toBe('bar')
    })

    it('can skip existing headers', async () => {
      const requestHandler = withHeaders({ addRequestHeaders: { 'X-Req-Bar': 'bar' }, existing: 'skip' })(handler)
      const response = await requestHandler({ event, request, params })
      const json = await response.json()
      expect(json['x-req-bar']).toBe('foo')
      expect(json['x-req-foo']).toBe('bar')
    })

    it('can remove headers', async () => {
      const requestHandler = withHeaders({ removeRequestHeaders: ['X-Req-Bar'] })(handler)
      const response = await requestHandler({ event, request, params })
      const json = await response.json()
      expect(json['x-req-bar']).toBe(undefined)
      expect(json['x-req-foo']).toBe('bar')
    })
  })

  describe('Response', () => {
    it('can combine headers', async () => {
      const requestHandler = withHeaders({
        addResponseHeaders: { 'X-Res-Bar': 'bar', 'X-Res-Fizz': 'buzz' },
        existing: 'combine',
      })(handler)
      const response = await requestHandler({ event, request, params })
      expect(response.headers.get('X-Res-Bar')).toBe('foo,bar')
      expect(response.headers.get('X-Res-Foo')).toBe('bar')
      expect(response.headers.get('X-Res-Fizz')).toBe('buzz')
    })

    it('can override headers', async () => {
      const requestHandler = withHeaders({ addResponseHeaders: { 'X-Res-Bar': 'bar' }, existing: 'override' })(handler)
      const response = await requestHandler({ event, request, params })
      expect(response.headers.get('X-Res-Bar')).toBe('bar')
      expect(response.headers.get('X-Res-Foo')).toBe('bar')
    })

    it('can skip existing headers', async () => {
      const requestHandler = withHeaders({ addResponseHeaders: { 'X-Res-Bar': 'bar' }, existing: 'skip' })(handler)
      const response = await requestHandler({ event, request, params })
      expect(response.headers.get('X-Res-Bar')).toBe('foo')
      expect(response.headers.get('X-Res-Foo')).toBe('bar')
    })

    it('can remove headers', async () => {
      const requestHandler = withHeaders({ removeResponseHeaders: ['X-Res-Bar'] })(handler)
      const response = await requestHandler({ event, request, params })
      expect(response.headers.get('X-Res-Bar')).toBe(null)
      expect(response.headers.get('X-Res-Foo')).toBe('bar')
    })
  })
})

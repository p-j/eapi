import { withHeaders } from './withHeaders'

describe('withHeaders', () => {
  let event: FetchEvent, request: Request, params: Params, handler: RequestHandler

  beforeEach(() => {
    request = new Request('https://example.com')
    event = new FetchEvent('fetch', { request })
    params = {}
    handler = () =>
      new Response('ok', {
        status: 200,
        headers: {
          'X-Foo': 'bar',
          'X-Bar': 'foo',
        },
      })
  })

  it('can combine headers', async () => {
    const requestHandler = withHeaders({ addHeaders: { 'X-Bar': 'bar', 'X-Fizz': 'buzz' }, existing: 'combine' })(
      handler,
    )
    const response = await requestHandler({ event, request, params })
    expect(response.headers.get('X-Bar')).toBe('foo,bar')
    expect(response.headers.get('X-Foo')).toBe('bar')
    expect(response.headers.get('X-Fizz')).toBe('buzz')
  })

  it('can override headers', async () => {
    const requestHandler = withHeaders({ addHeaders: { 'X-Bar': 'bar' }, existing: 'override' })(handler)
    const response = await requestHandler({ event, request, params })
    expect(response.headers.get('X-Bar')).toBe('bar')
    expect(response.headers.get('X-Foo')).toBe('bar')
  })

  it('can skip existing headers', async () => {
    const requestHandler = withHeaders({ addHeaders: { 'X-Bar': 'bar' }, existing: 'skip' })(handler)
    const response = await requestHandler({ event, request, params })
    expect(response.headers.get('X-Bar')).toBe('foo')
    expect(response.headers.get('X-Foo')).toBe('bar')
  })

  it('can remove headers', async () => {
    const requestHandler = withHeaders({ removeHeaders: ['X-Bar'] })(handler)
    const response = await requestHandler({ event, request, params })
    expect(response.headers.get('X-Bar')).toBe(null)
    expect(response.headers.get('X-Foo')).toBe('bar')
  })
})

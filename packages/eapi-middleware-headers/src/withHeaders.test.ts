import { manageHeaders, withHeaders } from './withHeaders'

describe('withHeaders', () => {
  let event: FetchEvent, request: Request, params: Params, handler: RequestHandler

  function collectHeaders(subject: Request | Response): { [key: string]: string } {
    let obj = {}
    for (let [key, value] of subject.headers.entries()) {
      Object.assign(obj, { [key]: value })
    }
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
    handler = ({ request }: { request: Request }) =>
      new Response(JSON.stringify(collectHeaders(request)), {
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

describe('manageHeaders', () => {
  ;['Request', 'Response'].forEach((name) => {
    describe(name, () => {
      let subject: Request | Response

      beforeEach(() => {
        let headers = new Headers({
          'X-Bar': 'bar',
          'X-Foo': 'foo',
        })

        subject =
          name === 'Request'
            ? new Request('https://example.com', { headers })
            : new Response('ok', { status: 200, headers })
      })

      it('can combine headers', async () => {
        const newSubject = manageHeaders({
          subject,
          addHeaders: { 'X-Bar': 'foo', 'X-Fizz': 'buzz' },
          existing: 'combine',
        })
        expect(newSubject.headers.get('X-Bar')).toBe('bar,foo')
        expect(newSubject.headers.get('X-Foo')).toBe('foo')
        expect(newSubject.headers.get('X-Fizz')).toBe('buzz')
      })

      it('can override headers', async () => {
        const newSubject = manageHeaders({
          subject,
          addHeaders: { 'X-Bar': 'foo', 'X-Fizz': 'buzz' },
          existing: 'override',
        })
        expect(newSubject.headers.get('X-Bar')).toBe('foo')
        expect(newSubject.headers.get('X-Foo')).toBe('foo')
        expect(newSubject.headers.get('X-Fizz')).toBe('buzz')
      })

      it('can skip existing headers', async () => {
        const newSubject = manageHeaders({
          subject,
          addHeaders: { 'X-Bar': 'foo', 'X-Fizz': 'buzz' },
          existing: 'skip',
        })
        expect(newSubject.headers.get('X-Bar')).toBe('bar')
        expect(newSubject.headers.get('X-Foo')).toBe('foo')
        expect(newSubject.headers.get('X-Fizz')).toBe('buzz')
      })

      it('can remove headers', async () => {
        const newSubject = manageHeaders({
          subject,
          removeHeaders: ['X-Bar'],
        })
        expect(newSubject.headers.get('X-Bar')).toBe(null)
        expect(newSubject.headers.get('X-Foo')).toBe('foo')
      })
    })
  })
})

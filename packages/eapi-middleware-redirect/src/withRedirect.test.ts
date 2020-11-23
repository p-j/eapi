import { withRedirect } from './withRedirect'
import fetchMock from 'jest-fetch-mock'

Response.redirect = jest.fn((url, status) => {
  return new Response(
    null,
    Object.assign(
      {
        headers: {
          location: new URL(url).toString(),
        },
        status,
      },
      { url },
    ),
  )
})

const request = new Request('https://toto.com/titi')

const transform: Transform = ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  url.hostname = url.hostname.replace('toto', 'tata')
  return new Request(url.toString(), request)
}

const passThrough: RequestHandler = async ({ request }: RequestContext) => {
  const response = await fetch(request)
  // Mock the redirect='follow' behavior
  const url = response.headers.get('location')
  if (request.redirect === 'follow' && url) {
    return passThrough({ request: new Request(url, request) } as RequestContext)
  }
  return response
}

describe('Redirect', () => {
  beforeAll(() => {
    fetchMock.enableMocks()
  })
  beforeEach(() => {
    fetchMock.resetMocks()
  })
  afterAll(() => {
    fetchMock.disableMocks()
  })

  it('should act as a passThrough if no options are given', async () => {
    fetchMock.mockResponse('ok', { status: 200, url: 'https://toto.com/tutu' })

    const requestHandler = withRedirect()(passThrough)
    const responseWithRedirect = await requestHandler({ request: request.clone() } as RequestContext)
    const responseWithPassthrough = await passThrough({ request: request.clone() } as RequestContext)

    expect(responseWithRedirect).toEqual(responseWithPassthrough)
  })

  it('should perform a transparent redirect by url', async () => {
    fetchMock.mockResponseOnce('ok', { status: 200, url: 'https://toto.com/tutu' })
    const requestHandler = withRedirect({ transparent: true, urlOrPath: '/tutu' })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(response.url).toBe('https://toto.com/tutu')
    expect(await response.text()).toBe('ok')
  })

  it('should perform a transparent redirect with transform', async () => {
    fetchMock.mockResponseOnce('ok', { status: 200, url: 'https://tata.com/titi' })
    const requestHandler = withRedirect({ transparent: true, transform })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(response.url).toBe('https://tata.com/titi')
    expect(await response.text()).toBe('ok')
  })

  it('should perform a permanent redirect by url', async () => {
    const requestHandler = withRedirect({ transparent: false, permanent: true, urlOrPath: '/tutu' })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(301)
    expect(response.url).toBe('https://toto.com/tutu')
  })

  it('should perform a permanent redirect with transform', async () => {
    const requestHandler = withRedirect({ transparent: false, permanent: true, transform })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(301)
    expect(response.url).toBe('https://tata.com/titi')
  })

  it('should perform a temporary redirect by url', async () => {
    const requestHandler = withRedirect({ transparent: false, permanent: false, urlOrPath: '/tutu' })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(302)
    expect(response.url).toBe('https://toto.com/tutu')
  })

  it('should perform a temporary redirect with transform', async () => {
    const requestHandler = withRedirect({ transparent: false, permanent: false, transform })(passThrough)
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(302)
    expect(response.url).toBe('https://tata.com/titi')
  })

  it('should not redirect when transparent is false and url is unchanged', async () => {
    fetchMock.mockResponseOnce('ok', { status: 200, url: request.url })
    const requestHandler = withRedirect({ transparent: false, transform: ({ request }: RequestContext) => request })(
      passThrough,
    )
    const response = await requestHandler({ request: request.clone() } as RequestContext)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(response.url).toBe(request.url)
  })

  it('should act as a non-transparent redirect if redirect is set to manual and the origin sends a redirect', async () => {
    fetchMock.mockResponse(async (req) => {
      if (req.url.startsWith('https://toto.com/titi')) {
        return { status: 301, headers: { location: 'https://tata.com/tutu' }, url: req.url }
      } else if (req.url === 'https://tata.com/tutu') {
        return { status: 200, body: 'ok', url: req.url }
      } else {
        return { status: 418, body: 'who are you?', url: req.url }
      }
    })

    const requestHandlerWithRedirectManual = withRedirect({
      transparent: true,
      redirect: 'manual',
      transform: ({ request }: RequestContext) => request,
    })(passThrough)

    const requestHandlerWithRedirectFollow = withRedirect({
      transparent: true,
      redirect: 'follow',
      transform: ({ request }: RequestContext) => request,
    })(passThrough)

    const response = await requestHandlerWithRedirectManual({ request: request.clone() } as RequestContext)
    const response2 = await requestHandlerWithRedirectFollow({ request: request.clone() } as RequestContext)

    expect(response.status).toBe(301)
    expect(response.url).toBe(request.url)
    expect(response.headers.get('location')).toBe('https://tata.com/tutu')
    expect(response2.status).toBe(200)
    expect(response2.url).toBe('https://tata.com/tutu')
  })
})

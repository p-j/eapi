import { RequestHandler, RequestContext } from '@p-j/eapi-types'
import { applyMiddlewares } from './applyMiddlewares'

function firstApplied(requestHandler: RequestHandler): RequestHandler {
  return async function _firstApplied({}: RequestContext) {
    const originalResponse = await requestHandler({} as RequestContext)
    const response = new Response('first', originalResponse)
    response.headers.append('X-first', 'first')
    return response
  }
}

function lastApplied(requestHandler: RequestHandler): RequestHandler {
  return async function _lastApplied({}: RequestContext) {
    const originalResponse = await requestHandler({} as RequestContext)
    const response = new Response('last', originalResponse)
    response.headers.append('X-last', 'last')
    return response
  }
}

describe('applyMiddleware', () => {
  it('works without any middlware', () => {
    const handler = () => new Response()
    const finalHandler = applyMiddlewares(handler)
    expect(finalHandler).toBe(handler)
  })

  it('applies middlware in order', async () => {
    const handler = () => new Response('ok')
    const finalHandler = applyMiddlewares(handler, lastApplied, firstApplied)
    const response = await finalHandler({} as RequestContext)

    expect(await response.text()).toBe('last')
    expect(response.headers.get('X-first')).toBe('first')
    expect(response.headers.get('X-last')).toBe('last')
  })
})

import { withErrorHandler } from './withErrorHandler'

describe('withErrorHandler', () => {
  let successFn: jest.Mock, errorFn: jest.Mock, error: Error

  beforeEach(() => {
    error = new Error()
    successFn = jest.fn(() => 'hello')
    errorFn = jest.fn(() => {
      throw error
    })
  })

  it('to not do anything if the passed function succed', async () => {
    const request = new Request('https://example.com')
    const event = new FetchEvent('fetch', { request })
    const requestHandler = withErrorHandler()(successFn)

    const response = await requestHandler({ event, request, params: {} })

    expect(successFn.mock.calls.length).toBe(1)
    expect(response).toBe('hello')
  })

  it('produce an empty 500 response in case of failure', async () => {
    const request = new Request('https://example.com')
    const event = new FetchEvent('fetch', { request })
    const requestHandler = withErrorHandler()(errorFn)

    const response = await requestHandler({ event, request, params: {} })

    expect(errorFn.mock.calls.length).toBe(1)
    expect(response.status).toBe(500)
    expect(response.body).toBe(null)
  })

  it('produce a detailed 500 response in case of failure & debug=true is in the URL', async () => {
    const request = new Request('https://example.com?debug=true')
    const event = new FetchEvent('fetch', { request })
    const requestHandler = withErrorHandler({ allowDebug: true })(errorFn)

    const response = await requestHandler({ event, request, params: {} })

    expect(errorFn.mock.calls.length).toBe(1)
    expect(response.status).toBe(500)
    expect(await response.text()).toBe(error.stack)
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OPTIONS, POST } from '@/app/api/notion-lead/route'

const endpoint = 'http://localhost:3000/api/notion-lead'

function request(body: unknown) {
  return new Request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('notion lead route', () => {
  beforeEach(() => {
    process.env.NOTION_TOKEN = 'test-token'
    process.env.NOTION_DATABASE_ID = 'test-database'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NOTION_TOKEN
    delete process.env.NOTION_DATABASE_ID
  })

  it('returns CORS headers for preflight requests', () => {
    const response = OPTIONS()

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'POST, OPTIONS',
    )
  })

  it.each([
    [{ platform: 'Instagram' }, 'creator is required.'],
    [
      { creator: '@creator', platform: 'YouTube' },
      'platform must be Instagram or TikTok.',
    ],
    [
      { creator: '@creator', platform: 'TikTok', followers: -1 },
      'followers must be a number greater than or equal to 0.',
    ],
  ])('rejects invalid input', async (body, error) => {
    const response = await POST(request(body))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not create a duplicate lead', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ results: [{ id: 'existing-page' }] }),
    )

    const response = await POST(
      request({
        creator: '@creator',
        platform: 'Instagram',
        profileUrl: 'https://instagram.com/creator',
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, duplicate: true })
    expect(fetch).toHaveBeenCalledOnce()
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)).toEqual(
      expect.objectContaining({
        filter: {
          or: [
            {
              property: 'Profile URL',
              url: { equals: 'https://instagram.com/creator' },
            },
            {
              property: 'Creator',
              title: { equals: '@creator' },
            },
          ],
        },
      }),
    )
  })

  it('creates a lead with status forced to Lead and truncated notes', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ results: [] }))
      .mockResolvedValueOnce(Response.json({ id: 'new-page' }))

    const response = await POST(
      request({
        creator: ' @creator ',
        platform: 'TikTok',
        profileUrl: 'https://tiktok.com/@creator',
        followers: 1200,
        followerTier: '0–5k',
        notes: 'x'.repeat(2_100),
        status: 'Archived',
      }),
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      ok: true,
      duplicate: false,
      pageId: 'new-page',
    })

    const createCall = vi.mocked(fetch).mock.calls[1]
    const createBody = JSON.parse(createCall[1]?.body as string)
    expect(createBody.properties.Status).toEqual({ select: { name: 'Lead' } })
    expect(
      createBody.properties.Notes.rich_text[0].text.content,
    ).toHaveLength(2_000)
    expect(createCall[1]?.headers).toEqual(
      expect.objectContaining({ 'Notion-Version': '2022-06-28' }),
    )
  })

  it('returns a safe error when Notion rejects the query', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ message: 'Database not found.' }, { status: 404 }),
    )

    const response = await POST(
      request({ creator: '@creator', platform: 'Instagram' }),
    )

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'Database not found.' })
  })
})

const NOTION_API_URL = 'https://api.notion.com/v1'
const NOTION_API_VERSION = '2022-06-28'
const MAX_NOTES_LENGTH = 2_000

const PLATFORMS = ['Instagram', 'TikTok'] as const
const FOLLOWER_TIERS = ['0–5k', '5–20k', '20–100k', '100k+'] as const

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type Platform = (typeof PLATFORMS)[number]
type FollowerTier = (typeof FOLLOWER_TIERS)[number]

type NotionLead = {
  creator: string
  platform: Platform
  profileUrl: string | null
  followers: number | null
  notes: string
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseLead(body: unknown): NotionLead | string {
  if (!isRecord(body)) {
    return 'Request body must be a JSON object.'
  }

  const creator = typeof body.creator === 'string' ? body.creator.trim() : ''
  if (!creator) {
    return 'creator is required.'
  }

  if (
    typeof body.platform !== 'string' ||
    !PLATFORMS.includes(body.platform as Platform)
  ) {
    return 'platform must be Instagram or TikTok.'
  }

  if (
    body.followers !== undefined &&
    body.followers !== null &&
    (typeof body.followers !== 'number' ||
      !Number.isFinite(body.followers) ||
      body.followers < 0)
  ) {
    return 'followers must be a number greater than or equal to 0.'
  }

  if (
    body.followerTier !== undefined &&
    body.followerTier !== null &&
    (typeof body.followerTier !== 'string' ||
      !FOLLOWER_TIERS.includes(body.followerTier as FollowerTier))
  ) {
    return 'followerTier is invalid.'
  }

  if (
    body.profileUrl !== undefined &&
    body.profileUrl !== null &&
    typeof body.profileUrl !== 'string'
  ) {
    return 'profileUrl must be a string.'
  }

  if (
    body.notes !== undefined &&
    body.notes !== null &&
    typeof body.notes !== 'string'
  ) {
    return 'notes must be a string.'
  }

  return {
    creator,
    platform: body.platform as Platform,
    profileUrl:
      typeof body.profileUrl === 'string' && body.profileUrl.trim()
        ? body.profileUrl.trim()
        : null,
    followers:
      typeof body.followers === 'number' ? body.followers : null,
    notes:
      typeof body.notes === 'string'
        ? body.notes.slice(0, MAX_NOTES_LENGTH)
        : '',
  }
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_API_VERSION,
  }
}

async function notionError(response: Response) {
  const fallback = `Notion API request failed with status ${response.status}.`

  try {
    const data: unknown = await response.json()
    return isRecord(data) && typeof data.message === 'string'
      ? data.message
      : fallback
  } catch {
    return fallback
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400)
  }

  const lead = parseLead(body)
  if (typeof lead === 'string') {
    return json({ error: lead }, 400)
  }

  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!token || !databaseId) {
    return json({ error: 'Notion server configuration is missing.' }, 500)
  }

  const duplicateFilters: Record<string, unknown>[] = [
    { property: 'Creator', title: { equals: lead.creator } },
  ]

  if (lead.profileUrl) {
    duplicateFilters.unshift({
      property: 'Profile URL',
      url: { equals: lead.profileUrl },
    })
  }

  try {
    const duplicateResponse = await fetch(
      `${NOTION_API_URL}/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: notionHeaders(token),
        body: JSON.stringify({
          filter:
            duplicateFilters.length === 1
              ? duplicateFilters[0]
              : { or: duplicateFilters },
          page_size: 1,
        }),
      },
    )

    if (!duplicateResponse.ok) {
      return json({ error: await notionError(duplicateResponse) }, 502)
    }

    const duplicateData: unknown = await duplicateResponse.json()
    if (
      isRecord(duplicateData) &&
      Array.isArray(duplicateData.results) &&
      duplicateData.results.length > 0
    ) {
      return json({ ok: true, duplicate: true })
    }

    const properties: Record<string, unknown> = {
      Creator: {
        title: [{ type: 'text', text: { content: lead.creator } }],
      },
      Platform: { select: { name: lead.platform } },
      Status: { select: { name: 'Lead' } },
    }

    if (lead.profileUrl) {
      properties['Profile URL'] = { url: lead.profileUrl }
    }
    if (lead.followers !== null) {
      properties.Followers = { number: lead.followers }
    }
    if (lead.notes) {
      properties.Notes = {
        rich_text: [{ type: 'text', text: { content: lead.notes } }],
      }
    }

    const createResponse = await fetch(`${NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    })

    if (!createResponse.ok) {
      return json({ error: await notionError(createResponse) }, 502)
    }

    const page: unknown = await createResponse.json()
    if (!isRecord(page) || typeof page.id !== 'string') {
      return json({ error: 'Notion API returned an invalid page.' }, 502)
    }

    return json({ ok: true, duplicate: false, pageId: page.id }, 201)
  } catch {
    return json({ error: 'Unable to reach the Notion API.' }, 502)
  }
}

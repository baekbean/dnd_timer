import { describe, expect, it } from 'vitest'
import { parseYoutubeVideoId, youtubeThumbnailUrl, YOUTUBE_ID_RE } from '@/lib/timer/youtube'

const ID = 'tMJEp8p9IDM'

describe('parseYoutubeVideoId', () => {
  it('accepts a bare video id', () => {
    expect(parseYoutubeVideoId(ID)).toBe(ID)
  })

  it('accepts the share link, tracking params and all', () => {
    expect(parseYoutubeVideoId(`https://youtu.be/${ID}?si=aaK9bp3LKUPSKHyl`)).toBe(ID)
  })

  it('accepts the address-bar watch url with extra params', () => {
    expect(parseYoutubeVideoId(`https://www.youtube.com/watch?v=${ID}&t=30s&list=PL123`)).toBe(ID)
  })

  it.each([
    ['embed', `https://www.youtube.com/embed/${ID}`],
    ['shorts', `https://www.youtube.com/shorts/${ID}`],
    ['live', `https://www.youtube.com/live/${ID}`],
    ['legacy /v/', `https://www.youtube.com/v/${ID}`],
    ['mobile', `https://m.youtube.com/watch?v=${ID}`],
    ['music', `https://music.youtube.com/watch?v=${ID}`],
    ['nocookie', `https://www.youtube-nocookie.com/embed/${ID}`],
    ['no www', `https://youtube.com/watch?v=${ID}`],
    ['http', `http://youtu.be/${ID}`],
  ])('accepts the %s form', (_label, url) => {
    expect(parseYoutubeVideoId(url)).toBe(ID)
  })

  it('accepts a link pasted without a scheme', () => {
    expect(parseYoutubeVideoId(`youtu.be/${ID}`)).toBe(ID)
    expect(parseYoutubeVideoId(`www.youtube.com/watch?v=${ID}`)).toBe(ID)
  })

  it('ignores surrounding whitespace', () => {
    expect(parseYoutubeVideoId(`  https://youtu.be/${ID}\n`)).toBe(ID)
  })

  it.each([
    ['empty string', ''],
    ['whitespace only', '   '],
    ['another video host', 'https://vimeo.com/123456789'],
    ['a lookalike host', `https://notyoutube.com/watch?v=${ID}`],
    ['a playlist with no video', 'https://www.youtube.com/playlist?list=PLabcdefghijk'],
    ['a channel page', 'https://www.youtube.com/@somechannel'],
    ['a too-short id', 'https://youtu.be/abc123'],
    ['a too-long id', `https://youtu.be/${ID}XYZ`],
    ['an id with illegal characters', 'https://youtu.be/abcdefghij!'],
    ['a non-http scheme', `javascript://youtu.be/${ID}`],
    ['plain prose', 'my favourite lofi video'],
  ])('rejects %s', (_label, input) => {
    expect(parseYoutubeVideoId(input)).toBeNull()
  })
})

describe('YOUTUBE_ID_RE', () => {
  it('matches exactly 11 url-safe characters', () => {
    expect(YOUTUBE_ID_RE.test('a-b_c1234DE')).toBe(true)
    expect(YOUTUBE_ID_RE.test('short')).toBe(false)
    expect(YOUTUBE_ID_RE.test('waaaaaytoolong')).toBe(false)
  })
})

describe('youtubeThumbnailUrl', () => {
  it('points at the always-present mqdefault image', () => {
    expect(youtubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/mqdefault.jpg`)
  })
})

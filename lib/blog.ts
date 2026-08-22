import type { FaqItem } from './seo'

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 'h2' | 'h3'; text: string }
  | {
      type: 'callout'
      icon: string
      label: string
      steps: string[]
      ctaText: string
      ctaHref: string
    }
  | { type: 'faq'; items: FaqItem[] }
  | { type: 'cta'; heading: string; buttonText: string; buttonHref: string }

export interface BlogPost {
  slug: string
  title: string
  date: string // ISO date, e.g. '2026-08-05'
  tag: string
  readTime: string
  excerpt: string
  lede: string[] // intro paragraphs, rendered before the first block
  blocks: BlogBlock[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-use-the-pomodoro-technique',
    title: 'How to use the Pomodoro Technique',
    date: '2026-08-05',
    tag: 'Focus',
    readTime: '5 min read',
    excerpt:
      "Starting is the hardest part. Here's how to run 25/5 and 50/10 focus sessions — and adjust them — without turning your routine into another complicated system.",
    lede: [
      'Starting is often the hardest part of getting anything done.',
      'A task can feel too large, your attention can feel scattered, or you may simply not be in the mood to focus. The Pomodoro Technique makes beginning feel more manageable by asking you to focus for a limited period instead of finishing everything at once.',
      'Here’s how to try it without turning your focus routine into another complicated system.',
    ],
    blocks: [
      {
        type: 'callout',
        icon: '🍅',
        label: 'Pomodoro quick start',
        steps: [
          'Choose one specific task.',
          'Set a timer for 25 minutes.',
          'Focus on that task until the timer ends.',
          'Take a 5-minute break.',
          'Repeat four times, then take a longer 15–30 minute break.',
        ],
        ctaText: 'Start a 25-minute focus session →',
        ctaHref: '/',
      },
      { type: 'heading', level: 'h2', text: 'What is the Pomodoro Technique?' },
      {
        type: 'paragraph',
        text: 'The Pomodoro Technique is a time-management method that divides work into focused sessions and breaks. Instead of measuring progress only by whether you finish a task, you commit to working on it for one defined session.',
      },
      {
        type: 'paragraph',
        text: 'This structure can make breaks more deliberate and give an overwhelming task a clearer place to begin.',
      },
      {
        type: 'paragraph',
        text: 'Research has not shown that fixed Pomodoro breaks are consistently better than taking breaks based on your own fatigue and attention. Think of 25/5 as a useful starting point, then adjust it based on how you actually work.',
      },
      { type: 'heading', level: 'h2', text: 'Do you have to use 25/5?' },
      {
        type: 'paragraph',
        text: 'The traditional Pomodoro interval is 25 minutes of focus followed by a 5-minute break, but you do not have to treat it as a rigid rule.',
      },
      {
        type: 'paragraph',
        text: 'You might begin with 25/5 when a shorter commitment feels easier to approach. You may prefer 50 minutes of focus followed by a 10-minute break when shorter intervals interrupt your flow. If 25 minutes feels overwhelming, start with 10 or 15.',
      },
      {
        type: 'paragraph',
        text: 'These are options to test, not scientifically proven matches for particular types of work. Notice how each interval affects your attention, fatigue, and momentum. If you’re unsure, start with 25 minutes and adjust from there.',
      },
      { type: 'heading', level: 'h2', text: 'How to begin your first Pomodoro' },
      { type: 'heading', level: 'h3', text: '1. Pick one specific task' },
      {
        type: 'paragraph',
        text: '“Study” is broad. “Review chapter three” gives your attention somewhere to go. Choose something clear enough that you can begin without making another decision.',
      },
      { type: 'heading', level: 'h3', text: '2. Prepare your environment' },
      {
        type: 'paragraph',
        text: 'Close the tabs you don’t need. Put your phone out of reach. Keep the materials for your task nearby.',
      },
      {
        type: 'paragraph',
        text: 'Your digital environment is part of the setup too. A calm background or steady ambient sound may help some people settle in, but responses to background audio vary by person and task. If you use sound, choose something that does not repeatedly pull your attention away.',
      },
      { type: 'heading', level: 'h3', text: '3. Start the timer' },
      {
        type: 'paragraph',
        text: 'Once the timer begins, stay with your chosen task until the session ends. If you remember something unrelated, write it down and return to it later. You don’t have to follow every thought the moment it appears.',
      },
      { type: 'heading', level: 'h3', text: '4. Take a real break' },
      {
        type: 'paragraph',
        text: 'Stand up, stretch, refill your water, or look away from your screen.',
      },
      {
        type: 'paragraph',
        text: 'Planned breaks can support recovery, but their effects depend on the task, timing, and person. Treat the break as a chance to check what leaves you feeling ready for the next session.',
      },
      { type: 'heading', level: 'h3', text: '5. Adjust the routine' },
      { type: 'paragraph', text: 'The Pomodoro Technique is a framework, not a rule.' },
      {
        type: 'paragraph',
        text: 'If 25 minutes feels too short, try 50. If your concentration fades sooner, begin with 15. A useful routine is one you can return to and adapt based on your experience.',
      },
      { type: 'heading', level: 'h2', text: 'Make focusing easier to return to' },
      {
        type: 'paragraph',
        text: 'A timer can tell you when to work and when to rest. The environment around it can also make a focus routine feel easier to return to.',
      },
      {
        type: 'paragraph',
        text: 'NookTimer gives you a calm, ready-made focus space or lets you turn a favorite YouTube video into your background.',
      },
      {
        type: 'faq',
        items: [
          {
            question: 'How many Pomodoros should I do before a long break?',
            answer:
              'The traditional method uses four 25-minute focus sessions before a longer 15–30 minute break. Adjust this if you feel tired sooner or want to continue a productive flow.',
          },
          {
            question: 'What should I do during a Pomodoro break?',
            answer:
              'Step away from your task when possible. Stand up, stretch, refill your water, or rest your eyes instead of immediately opening another distracting screen.',
          },
          {
            question: 'What if 25 minutes is too long?',
            answer:
              'Start with 10 or 15 minutes. The goal is to make beginning easier, not to force yourself through an interval that does not work for you.',
          },
          {
            question: 'Can I use music while doing Pomodoro?',
            answer:
              'Yes, if it helps you settle in without repeatedly pulling your attention away. Responses to background music vary by person and task, so compare how you feel and work with music, ambient sound, and silence.',
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Choose your focus space and begin one session.',
        buttonText: 'Start focusing',
        buttonHref: '/',
      },
    ],
  },
  {
    slug: 'how-to-create-a-focus-environment',
    title: 'How to Create a Focus Environment You’ll Want to Return To',
    date: '2026-08-10',
    tag: 'Focus',
    readTime: '5 min read',
    excerpt:
      'Create a calm, personal focus environment using simple changes to your desk, screen, sound, and daily routine.',
    lede: [
      'Focusing is not only about having enough discipline.',
      'The space around you can also make it easier or harder to begin. A cluttered desk, a phone within reach, too many open tabs, or background noise you cannot ignore can all give your attention somewhere else to go.',
      'You do not need a perfect desk or an elaborate productivity setup. A useful focus environment is simply one that removes a little friction, feels comfortable to return to, and is easy to recreate.',
      'Here are a few small ways to build one.',
    ],
    blocks: [
      { type: 'heading', level: 'h2', text: 'Start with what stays in view' },
      {
        type: 'paragraph',
        text: 'Look at the space directly in front of you. What can you see on your desk and screen?',
      },
      {
        type: 'paragraph',
        text: 'You do not have to clear everything away. Start by keeping only what supports the task you are about to do. That might be your laptop, a notebook, a pen, and a glass of water.',
      },
      {
        type: 'paragraph',
        text: 'Your screen matters too. Close unrelated windows, hide the tabs you do not need, and place the document or tool you will use in front of you.',
      },
      {
        type: 'paragraph',
        text: 'The goal is not to create a perfectly minimal workspace. It is to give your attention one clear place to land.',
      },
      { type: 'heading', level: 'h2', text: 'Reduce one obvious distraction' },
      {
        type: 'paragraph',
        text: 'Before you begin, notice the distraction you reach for most often.',
      },
      {
        type: 'paragraph',
        text: 'For many people, it is a phone. Try placing it across the room, inside a drawer, or anywhere that requires you to stand up to reach it. If notifications pull you away, turn on Do Not Disturb for the length of your focus session.',
      },
      {
        type: 'paragraph',
        text: 'If your distractions are digital, close one unnecessary tab or quit one app that tends to interrupt you.',
      },
      {
        type: 'paragraph',
        text: 'You do not need to remove every possible distraction. Make the most tempting one slightly harder to access first.',
      },
      { type: 'heading', level: 'h2', text: 'Experiment with sound or silence' },
      {
        type: 'paragraph',
        text: 'Some people focus better with rain, ambient noise, or familiar instrumental music. Others work best in silence.',
      },
      {
        type: 'paragraph',
        text: 'There is no single type of background sound that works for every person or every task. Sound can help, distract, or make no meaningful difference depending on what you are doing and what you prefer. Music with lyrics, for example, may be more distracting when your work also involves language.',
      },
      {
        type: 'paragraph',
        text: 'Treat sound as something to test, not a rule to follow. Try one option for a few sessions and notice whether it helps you stay with the task. If you keep listening to the sound instead of working, silence may be the better choice.',
      },
      { type: 'heading', level: 'h2', text: 'Create a small starting ritual' },
      {
        type: 'paragraph',
        text: 'A starting ritual is a short sequence you repeat before focusing.',
      },
      {
        type: 'callout',
        icon: '🌿',
        label: 'A simple starting ritual',
        steps: [
          'Put your phone away.',
          'Fill a glass of water.',
          'Open one task.',
          'Choose a background or sound.',
          'Start a timer.',
        ],
        ctaText: 'Start a focus session →',
        ctaHref: '/',
      },
      {
        type: 'paragraph',
        text: 'The ritual does not have to make you feel instantly focused. Its purpose is to reduce the number of decisions between you and the first step.',
      },
      {
        type: 'paragraph',
        text: 'Over time, repeating the same few actions may become a useful cue that it is time to begin.',
      },
      { type: 'heading', level: 'h2', text: 'Keep the setup easy to repeat' },
      {
        type: 'paragraph',
        text: 'A focus environment only helps if you can return to it.',
      },
      {
        type: 'paragraph',
        text: 'If preparing your desk takes twenty minutes, choosing the perfect playlist becomes another task, or your system requires several apps, the setup may create more resistance than it removes.',
      },
      {
        type: 'paragraph',
        text: 'Make the easiest version your default. Keep the tools you use nearby. Save a background you already like. Leave your next task somewhere easy to find.',
      },
      {
        type: 'paragraph',
        text: 'You can always add more later, but begin with a setup you can recreate in a minute or two.',
      },
      { type: 'heading', level: 'h2', text: 'Make the space feel personal' },
      {
        type: 'paragraph',
        text: 'A functional workspace does not have to feel cold.',
      },
      {
        type: 'paragraph',
        text: 'Keep a small object you like nearby, use a background that fits your mood, or choose lighting that makes the space feel comfortable. These details may not improve concentration on their own, but they can make the act of sitting down feel more inviting.',
      },
      {
        type: 'paragraph',
        text: 'This is the idea behind NookTimer: when a focus tool feels calm, personal, and at home in your space, you may be more willing to return to it. It is a hypothesis we are continuing to explore, not a rule that will work for everyone.',
      },
      {
        type: 'paragraph',
        text: 'The best focus environment is not the one that looks most productive. It is the one that feels like yours and helps you begin.',
      },
      { type: 'heading', level: 'h2', text: 'Build a place, not another productivity system' },
      {
        type: 'paragraph',
        text: 'You do not need to redesign your entire room before you can focus.',
      },
      {
        type: 'paragraph',
        text: 'Clear what is in front of you. Move one distraction out of reach. Choose sound or silence. Repeat a short starting ritual. Then begin one task.',
      },
      {
        type: 'paragraph',
        text: 'Small changes are easier to repeat, and a repeatable space can become a familiar place to return to whenever you want to focus.',
      },
      {
        type: 'paragraph',
        text: 'NookTimer brings a simple timer, calm backgrounds, ambient sound, and custom YouTube backgrounds into one focus space. There is no account or complicated setup required.',
      },
      {
        type: 'faq',
        items: [
          {
            question: 'Do I need to remove every distraction before I can focus?',
            answer:
              'No. You do not need to remove every possible distraction. Start by making the one you reach for most often slightly harder to access, such as placing your phone across the room.',
          },
          {
            question: 'Is background music or ambient sound better for focus?',
            answer:
              'There is no single answer that works for everyone or every task. Treat sound as something to test for a few sessions rather than a rule — if you notice yourself listening instead of working, silence may work better for you.',
          },
          {
            question: 'How long should it take to set up a focus environment?',
            answer:
              'Aim for a setup you can recreate in a minute or two. If preparing your desk or choosing a playlist becomes its own task, the setup may be creating more resistance than it removes.',
          },
          {
            question: 'Does a personal, calm-feeling space actually improve concentration?',
            answer:
              'This is not proven to improve concentration on its own. The idea is that a space that feels comfortable and personal may make you more willing to sit down and return to it, which is a hypothesis NookTimer is continuing to explore.',
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Create a space that feels like yours, then begin.',
        buttonText: 'Start focusing',
        buttonHref: '/',
      },
    ],
  },
  {
    slug: 'focus-timer-without-switching-tabs',
    title: 'A Focus Timer You Can Check Without Switching Tabs',
    date: '2026-08-21',
    tag: 'Focus',
    readTime: '4 min read',
    excerpt:
      "NookTimer keeps your countdown visible in the browser tab itself, so you can check the time without alt-tabbing or getting pulled out of what you're doing by a notification.",
    lede: [
      'Most timers ask you to either watch them directly or accept an interruption. NookTimer does neither — once a session starts, the remaining time appears right in the browser tab, updating as it runs. Switch to email, a document, another tab entirely, and a glance at the tab bar tells you exactly how much time is left.',
      "It's a small detail, but it changes how a timer actually gets used. You don't have to keep a window open just to see the clock, and you don't get pulled out of what you're doing by a notification.",
    ],
    blocks: [
      { type: 'heading', level: 'h2', text: 'How the tab title countdown works' },
      {
        type: 'paragraph',
        text: "Start a session and NookTimer's tab title becomes the countdown — no separate app, no browser extension, no permission prompt. It keeps updating as long as the tab stays open, whether or not that tab is the one you're currently looking at.",
      },
      {
        type: 'paragraph',
        text: "That's the part that matters: you don't need NookTimer in the foreground for it to be useful. Work in another tab, present from a different window, glance over whenever you want a read on the time.",
      },
      { type: 'heading', level: 'h2', text: 'Why this beats a notification' },
      {
        type: 'paragraph',
        text: "A notification interrupts once, then it's gone — dismiss it by accident and you've lost your read on the time. It also needs a permission grant most people hesitate to give a random tab. A menu-bar app needs installing. The tab title needs none of that: it's just continuously, quietly there, exactly where your eyes already go when you're switching between tabs anyway.",
      },
      {
        type: 'callout',
        icon: '🗂️',
        label: 'See it in three steps',
        steps: [
          'Open nooktimer.com.',
          'Pick a session length — standard or custom.',
          'Start the timer, then switch tabs freely.',
        ],
        ctaText: 'Start a session →',
        ctaHref: '/',
      },
      { type: 'heading', level: 'h2', text: 'Where it helps most' },
      {
        type: 'paragraph',
        text: "Research with reference tabs open, studying across a tab group, presenting or screen-sharing where a floating timer window would be distracting, working on a second monitor where a quick glance at the tab bar is faster than switching windows. Anywhere you're already tab-hopping, the countdown comes along.",
      },
      {
        type: 'faq',
        items: [
          {
            question: 'Does the countdown keep updating if I minimize the browser?',
            answer:
              "Yes, as long as the NookTimer tab stays open — the title keeps updating even if the browser window is minimized or another app has focus. Some browsers suspend tabs that sit inactive for a long time to save memory, so if you notice it stall, keep the tab open in its own window instead of burying it among many others.",
          },
          {
            question: 'Should I pin the NookTimer tab?',
            answer:
              "Not if you want to see the countdown — pinned tabs shrink to show only the icon, which hides the title text. Keep it as a regular tab instead; that's what displays the live countdown in the tab bar.",
          },
          {
            question: 'Do I need to grant any permissions for this to work?',
            answer:
              'No. Unlike desktop notifications, the tab title needs no permission prompt — it works the moment you start a session.',
          },
          {
            question: 'What if I have a lot of tabs open?',
            answer:
              "The title still updates, but with many tabs each one narrows and long titles get cut off. If you keep a lot of tabs open, it helps to keep the NookTimer tab near the start of the row, where there's more width before things get squeezed.",
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Start a session and check it from anywhere in your browser.',
        buttonText: 'Start focusing',
        buttonHref: '/',
      },
    ],
  },
  {
    slug: 'youtube-video-focus-timer-background',
    title: 'How to Use a YouTube Video as Your Focus Timer Background',
    date: '2026-08-21',
    tag: 'Focus',
    readTime: '4 min read',
    excerpt:
      'NookTimer lets you paste any YouTube link and use it as your focus background — lo-fi streams, nature footage, a study-with-me video, whatever helps you settle in.',
    lede: [
      "NookTimer's built-in scenes — meadow, dusk, night — cover a lot of moods, but sometimes you already know exactly what you want to look at while you work. Paste a YouTube link into NookTimer and that video becomes your background, looping behind your countdown for the length of your session.",
      "It works with almost anything on YouTube: lo-fi mixes, nature cams, a favorite scene on loop, someone else's study-with-me stream, a city skyline at night. If it exists as a video, it can be your focus space.",
    ],
    blocks: [
      { type: 'heading', level: 'h2', text: 'How to set a YouTube background' },
      {
        type: 'callout',
        icon: '🎬',
        label: 'Set a custom background',
        steps: [
          'Open the scene picker.',
          'Choose the custom video option.',
          'Paste a YouTube URL.',
          'Start your session — the video loops behind your countdown.',
        ],
        ctaText: 'Try it now →',
        ctaHref: '/',
      },
      { type: 'heading', level: 'h2', text: 'What makes a good background video' },
      {
        type: 'paragraph',
        text: "Look for footage that loops well — a single continuous scene without hard cuts, an ending card, or a call to action partway through. Avoid anything with fast motion or frequent scene changes if you find that distracting. If the video itself is noisy or talkative, mute it and layer NookTimer's own ambient sound on top instead.",
      },
      { type: 'heading', level: 'h2', text: 'A few starting points' },
      {
        type: 'paragraph',
        text: "If you're not sure what to search for, these categories tend to work well as a focus background:",
      },
      {
        type: 'paragraph',
        text: '• Lo-fi hip hop radio streams — a genre practically built for this',
      },
      {
        type: 'paragraph',
        text: '• Nature footage: rain against a window, ocean waves, a forest cam',
      },
      {
        type: 'paragraph',
        text: "• Study-with-me videos: someone else quietly working, which some people find motivating without being distracting",
      },
      {
        type: 'paragraph',
        text: '• A favorite film or show scene, looped and muted, just for the mood',
      },
      {
        type: 'paragraph',
        text: '• A city or nature webcam replay',
      },
      { type: 'heading', level: 'h2', text: 'Pairing video with sound' },
      {
        type: 'paragraph',
        text: "You can layer NookTimer's own ambient sound — brown noise, rain, birdsong, garden crickets, night bugs, or white noise — on top of a muted video, or let the video's own audio play if it already has the right ambience. Worth trying both: what you enjoy having on and what actually helps you focus aren't always the same thing.",
      },
      {
        type: 'faq',
        items: [
          {
            question: 'Do I need a YouTube account to use this?',
            answer:
              "No. Paste a public YouTube video URL and NookTimer plays it as your background — you don't need to sign in to anything.",
          },
          {
            question: 'Will this work with any YouTube video?',
            answer:
              "Most public videos work. Private videos, or ones the uploader has disabled for embedding, won't load. If a background doesn't show up, try a different video.",
          },
          {
            question: 'Can I switch back to the built-in scenes?',
            answer:
              'Yes. The meadow, dusk, and night scenes are always available if you\'d rather not look for a video, or want something with zero setup.',
          },
          {
            question: 'Does the video play with sound by default?',
            answer:
              "That's up to you — mute it and use NookTimer's ambient sounds instead, let the video's own audio play, or run both together and see what you prefer.",
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Pick a video, paste the link, and start your next session.',
        buttonText: 'Start focusing',
        buttonHref: '/',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

// Newest first, for the index page and sitemap.
export function sortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
}

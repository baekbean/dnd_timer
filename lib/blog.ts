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
    title: 'How to Do the Pomodoro Technique: A Step-by-Step Guide',
    date: '2026-08-25',
    tag: 'Focus',
    readTime: '9 min read',
    excerpt:
      'Learn how to do the Pomodoro Technique step by step, handle interruptions, plan breaks, and adjust 25/5 sessions to fit the way you focus.',
    lede: [
      'You sit down to work, open the document, and suddenly remember three messages you should answer. A few minutes later, you are reorganizing your tabs instead of starting the task.',
      'The Pomodoro Technique gives that messy beginning a simple shape: choose one task, work for a defined period, then stop for a real break. The familiar version uses 25 minutes of focus followed by 5 minutes of rest. But the method is not only a timer setting. It also includes planning what you will do, protecting the session from interruptions, and keeping track of what you finish.',
      'Here is how to do the Pomodoro Technique from start to finish — and how to adapt it without losing what makes it useful.',
    ],
    blocks: [
      { type: 'heading', level: 'h2', text: 'The Pomodoro Technique in six steps' },
      {
        type: 'paragraph',
        text: 'If you want to start immediately, follow these steps:',
      },
      {
        type: 'callout',
        icon: '🍅',
        label: 'Pomodoro quick start',
        steps: [
          'Choose one specific task.',
          'Set a timer for 25 minutes.',
          'Work only on that task until the timer rings.',
          'Record the completed focus session.',
          'Take a 5-minute break.',
          'After four sessions, take a longer 15- to 30-minute break.',
        ],
        ctaText: 'Start a 25-minute focus session →',
        ctaHref: '/',
      },
      {
        type: 'paragraph',
        text: 'That is the basic cycle. The details below make it easier to use when your task is vague, your phone keeps pulling you away, or 25 minutes does not feel right.',
      },
      { type: 'heading', level: 'h2', text: 'What counts as a Pomodoro?' },
      {
        type: 'paragraph',
        text: 'A Pomodoro is one protected focus session with a clear start and finish. Traditionally, it lasts 25 minutes. During that time, you work on the task you chose rather than switching between unrelated activities.',
      },
      {
        type: 'paragraph',
        text: 'The timer is only one part of the system. The official Pomodoro Technique overview also emphasizes daily planning, managing interruptions, and estimating effort. Those parts matter because a countdown cannot decide what deserves your attention or what to do when a distraction appears.',
      },
      {
        type: 'paragraph',
        text: 'Think of the method as a small agreement with yourself: for this one session, this one task is enough.',
      },
      { type: 'heading', level: 'h2', text: 'Step 1: Choose a task with a visible finish line' },
      {
        type: 'paragraph',
        text: '“Work on the presentation” is too broad. You may spend the first ten minutes deciding where to begin. Make the task small enough that the next action is obvious:',
      },
      { type: 'paragraph', text: '• Draft the opening slide.' },
      { type: 'paragraph', text: '• Find three sources for the introduction.' },
      { type: 'paragraph', text: '• Review pages 1–5 and leave comments.' },
      { type: 'paragraph', text: '• Answer the five messages marked urgent.' },
      {
        type: 'paragraph',
        text: 'For a large project, write down the next concrete action and make a rough estimate of how many sessions it may take. Your estimate does not need to be accurate. Comparing it with the actual number of sessions will gradually help you plan more realistically.',
      },
      {
        type: 'paragraph',
        text: 'If a task will take less than one session, combine it with similar small tasks. If it will take several sessions, divide it into checkpoints that let you see progress.',
      },
      { type: 'heading', level: 'h2', text: 'Step 2: Prepare the environment before starting' },
      {
        type: 'paragraph',
        text: 'Use the minute before the timer begins to remove predictable friction. Open the file you need, close unrelated tabs, place water nearby, and silence notifications. If your phone is not part of the task, put it out of reach.',
      },
      {
        type: 'paragraph',
        text: 'This preparation is not a separate productivity ritual that has to be perfect. It is simply a way to make the desired action easier than the distraction.',
      },
      {
        type: 'paragraph',
        text: 'Your surroundings can also become a start cue. Using the same desk, ambient sound, or background for focus sessions gives your brain a consistent signal: this is where the task begins. NookTimer lets you combine a focus timer with calm visual backgrounds and ambient sound, so your workspace can support the transition into focus without adding more setup.',
      },
      { type: 'heading', level: 'h2', text: 'Step 3: Set the timer and work on one task' },
      {
        type: 'paragraph',
        text: 'Set a 25-minute timer and begin the specific action you wrote down. Do not wait to feel fully ready. The session is short enough that you only need to agree to begin — not to finish the entire project.',
      },
      { type: 'paragraph', text: 'While the timer is running:' },
      { type: 'paragraph', text: '• Keep only the materials needed for the task in view.' },
      { type: 'paragraph', text: '• Avoid checking progress every few minutes.' },
      { type: 'paragraph', text: '• Do not add new tasks to the session just because they are quick.' },
      { type: 'paragraph', text: '• If you finish early, review the work or prepare the next related action.' },
      {
        type: 'paragraph',
        text: 'The goal is not to create 25 flawless minutes. It is to make returning to the chosen task the default.',
      },
      { type: 'heading', level: 'h2', text: 'Step 4: Handle interruptions without following them' },
      {
        type: 'paragraph',
        text: 'Interruptions can come from outside — an alert, message, or question — or from inside, such as remembering an errand or wanting to look something up.',
      },
      {
        type: 'paragraph',
        text: 'When an internal interruption appears, write it in a small “later” list and return to the task. Capturing it tells your brain that the thought will not be lost. You can decide what to do with it after the session.',
      },
      {
        type: 'paragraph',
        text: 'For external interruptions, protect the session when you reasonably can. A short response such as “I’m in the middle of something; can I come back to you in 20 minutes?” creates a boundary without ignoring the person. If the interruption is genuinely urgent, stop and restart the session later rather than pretending the remaining time was focused.',
      },
      {
        type: 'paragraph',
        text: 'Repeated interruptions are useful information. If the same app, person, or thought breaks several sessions, change the environment before the next one instead of relying on willpower.',
      },
      { type: 'heading', level: 'h2', text: 'Step 5: Take a break that feels different from work' },
      {
        type: 'paragraph',
        text: 'When the timer rings, stop and step away for about five minutes. A useful break changes your physical position or type of attention. You might:',
      },
      { type: 'paragraph', text: '• Stand and stretch.' },
      { type: 'paragraph', text: '• Refill your water.' },
      { type: 'paragraph', text: '• Look out a window.' },
      { type: 'paragraph', text: '• Walk to another room.' },
      { type: 'paragraph', text: '• Rest your eyes and breathe slowly.' },
      {
        type: 'paragraph',
        text: 'Opening social media can turn a five-minute break into a longer distraction, and it keeps your attention attached to another stream of information. If possible, choose something with a natural ending.',
      },
      {
        type: 'paragraph',
        text: 'Research supports a measured view of short breaks. A 2022 meta-analysis of 22 independent samples found that micro-breaks were associated with small improvements in vigor and fatigue, while the overall effect on performance was not statistically significant. In other words, a short break can help you recover, but it is not a magic performance switch.',
      },
      { type: 'heading', level: 'h2', text: 'Step 6: Record the session, then repeat' },
      {
        type: 'paragraph',
        text: 'Mark one completed session beside the task. This tiny record gives you a visible measure of effort even when the final result is still far away.',
      },
      {
        type: 'paragraph',
        text: 'Then begin another focus session. After four Pomodoros, take a longer break of 15 to 30 minutes. Eat something, walk, or move away from the workspace long enough to reset before the next cycle.',
      },
      { type: 'paragraph', text: 'At the end of the day, review your marks. Ask:' },
      { type: 'paragraph', text: '• Which tasks took more or fewer sessions than expected?' },
      { type: 'paragraph', text: '• What interrupted me most often?' },
      { type: 'paragraph', text: '• At what time did focus feel easiest?' },
      { type: 'paragraph', text: '• Was my work interval too short, too long, or about right?' },
      {
        type: 'paragraph',
        text: 'Use the answers to make tomorrow’s plan more realistic.',
      },
      {
        type: 'heading',
        level: 'h2',
        text: 'Do you have to use 25 minutes of work and 5 minutes of rest?',
      },
      {
        type: 'paragraph',
        text: 'No. The 25/5 pattern is a practical starting point, not a rule that fits every person and task.',
      },
      {
        type: 'paragraph',
        text: 'Try a shorter session, such as 10 or 15 minutes, when starting feels unusually difficult. Try 50 minutes of focus followed by a 10-minute break when you are already absorbed in demanding work and frequent stops feel disruptive. Keep the three essential parts: one defined task, protected focus time, and a deliberate break.',
      },
      {
        type: 'paragraph',
        text: 'There is no strong evidence that one fixed interval is universally best. In a 2023 real-world study of 87 university students, groups using predetermined breaks followed either a 24/6 or 12/3 pattern. Compared with students who chose their own breaks, the predetermined-break groups reported different patterns of fatigue, concentration, and motivation, but the groups did not differ in task completion. Because the study observed a single day of self-study, it should not be treated as a final answer for every kind of work.',
      },
      {
        type: 'paragraph',
        text: 'Choose an interval that is long enough to make progress but short enough that you are willing to begin. Use it for several sessions before changing it again, so you can judge the pattern rather than one unusually good or bad day.',
      },
      { type: 'heading', level: 'h2', text: 'Common Pomodoro mistakes' },
      { type: 'heading', level: 'h3', text: 'Choosing a vague task' },
      {
        type: 'paragraph',
        text: 'If the task is “study” or “work on the website,” you still have to decide what to do after the timer starts. Define the first physical action before you begin.',
      },
      { type: 'heading', level: 'h3', text: 'Treating every thought as urgent' },
      {
        type: 'paragraph',
        text: 'Most remembered tasks can wait 25 minutes. Keep a capture list beside you so you can record the thought without acting on it.',
      },
      { type: 'heading', level: 'h3', text: 'Using the break for more input' },
      {
        type: 'paragraph',
        text: 'Email, news, and short videos can leave your attention more scattered. Choose a break that reduces stimulation or changes your physical state.',
      },
      { type: 'heading', level: 'h3', text: 'Pausing the timer repeatedly' },
      {
        type: 'paragraph',
        text: 'A session that is paused every few minutes loses its boundary. For an unavoidable interruption, restart when you can protect a fresh interval.',
      },
      { type: 'heading', level: 'h3', text: 'Working through every break' },
      {
        type: 'paragraph',
        text: 'Routinely skipping breaks turns the method into an ordinary countdown.',
      },
      { type: 'heading', level: 'h2', text: 'Make your first session easy to start' },
      {
        type: 'paragraph',
        text: 'The Pomodoro Technique works best as a repeatable way to begin, not a test of discipline. Choose one clear action, create a calm environment, and protect a single interval. Then take the break you planned.',
      },
      {
        type: 'paragraph',
        text: 'With NookTimer, you can choose a 25/5 or 50/10 rhythm, add ambient sound and a visual background, and turn the same workspace into a familiar focus cue. Set up your space, name the first small task, and begin one session. You can improve the system after the timer rings.',
      },
      {
        type: 'faq',
        items: [
          {
            question: 'How many Pomodoros should I do before a long break?',
            answer:
              'The traditional pattern is four focus sessions followed by a 15- to 30-minute break. Adjust sooner if your energy or task requires it.',
          },
          {
            question: 'What should I do during a five-minute Pomodoro break?',
            answer:
              'Move away from the task. Stand, stretch, drink water, look into the distance, or take a short walk. Pick an activity that is easy to stop when the next session begins.',
          },
          {
            question: 'What if 25 minutes feels too long?',
            answer:
              'Start with 10 or 15 minutes and keep the break deliberate. Increase the focus period once beginning feels easier. A shorter completed session is more useful than a 25-minute plan you avoid starting.',
          },
          {
            question: 'Can I use the Pomodoro Technique for studying?',
            answer:
              'Yes. Define the study action — for example, “answer practice questions 1–10” rather than “study chemistry.” During the break, move away from the material instead of switching to another demanding subject.',
          },
          {
            question: 'Can I listen to music during a Pomodoro?',
            answer:
              'If music helps you stay with the task, use something familiar and non-distracting. Lyrics may interfere with reading or writing for some people. Ambient sound is a simple alternative when you want a steady background without another source of language.',
          },
        ],
      },
      {
        type: 'cta',
        heading: 'Set up your space, choose one task, and begin one session.',
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

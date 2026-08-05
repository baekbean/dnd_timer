'use client'

import { FEEDBACK_FORM_URL } from '@/lib/constants'
import { trackFeedbackClick } from '@/lib/ga'

export default function BlogFeedbackLink() {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackFeedbackClick({ button_location: 'blog_post', page: 'blog' })}
      className="underline hover:opacity-70 transition-opacity"
    >
      Send feedback
    </a>
  )
}

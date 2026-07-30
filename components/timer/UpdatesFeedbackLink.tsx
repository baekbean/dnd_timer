'use client'

import { FEEDBACK_FORM_URL } from '@/lib/constants'
import { trackFeedbackClick } from '@/lib/ga'

export default function UpdatesFeedbackLink() {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackFeedbackClick({ button_location: 'updates_post', page: 'updates' })}
      className="underline hover:opacity-70 transition-opacity"
    >
      Send feedback
    </a>
  )
}

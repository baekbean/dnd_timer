'use client'

import { FEEDBACK_FORM_URL } from '@/lib/constants'
import { trackFeedbackClick } from '@/lib/ga'

export default function SeoFeedbackLink() {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackFeedbackClick({ button_location: 'seo_footer', page: 'seo' })}
      className="underline hover:text-[#d9d9d4]"
    >
      Send feedback
    </a>
  )
}

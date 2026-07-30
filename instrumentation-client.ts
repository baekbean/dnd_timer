import posthog from "posthog-js"

// ── Internal-traffic opt-out ──────────────────────────────────────────
// Visit any page with ?internal=1 once per browser/device to permanently
// exclude that browser from PostHog capture; ?internal=0 re-enables it.
// This is device-scoped (persisted in localStorage), so it survives the
// dynamic / IPv6 home-IP changes that IP-based filters silently miss.
let clearedInternal = false
function readInternalFlag(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("internal")
    if (param === "1") localStorage.setItem("dnd_internal", "1")
    else if (param === "0") {
      localStorage.removeItem("dnd_internal")
      clearedInternal = true
    }
    return localStorage.getItem("dnd_internal") === "1"
  } catch {
    return false
  }
}
const isInternal = readInternalFlag()

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  // Start opted-out on internal browsers so even the initial $pageview on
  // init is suppressed, not just events fired after this module runs.
  opt_out_capturing_by_default: isInternal,
})

if (isInternal) {
  posthog.opt_out_capturing()
} else if (clearedInternal) {
  // Only re-opt-in on an explicit ?internal=0 — never on normal loads, so
  // regular users don't emit a stray $opt_in event every visit.
  posthog.opt_in_capturing({ captureEventName: null })
}

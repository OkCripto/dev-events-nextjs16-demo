# PostHog post-wizard report

The wizard has completed a deep integration of your DevEvent Next.js project. PostHog has been configured using the `instrumentation-client.ts` approach (recommended for Next.js 15.3+), which provides lightweight client-side initialization with automatic pageview tracking, session replay, and exception capture.

## Integration Summary

### Files Created
- **`.env`** - Environment variables for PostHog API key and host
- **`instrumentation-client.ts`** - Client-side PostHog initialization with error tracking enabled

### Files Modified
- **`components/ExploreBtn.tsx`** - Added `explore_events_clicked` event tracking
- **`components/EventCard.tsx`** - Added `event_card_clicked` event tracking with event properties
- **`components/Navbar.tsx`** - Added `logo_clicked` and `navbar_link_clicked` event tracking
- **`components/LightRays.tsx`** - Added error tracking with `posthog.captureException()` for WebGL errors

## Events Tracked

| Event Name | Description | File |
|------------|-------------|------|
| `explore_events_clicked` | User clicked the Explore Events CTA button on the homepage | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked on an event card to view details (includes event title, slug, location, date, time) | `components/EventCard.tsx` |
| `logo_clicked` | User clicked the logo in the navbar | `components/Navbar.tsx` |
| `navbar_link_clicked` | User clicked a navigation link (includes link_name property) | `components/Navbar.tsx` |
| WebGL errors | Automatic exception capture for rendering errors | `components/LightRays.tsx` |

## Automatic Features Enabled

- **Pageview tracking** - Automatic `$pageview` and `$pageleave` events
- **Session replay** - Record and replay user sessions
- **Exception capture** - Automatic capture of unhandled JavaScript errors
- **Autocapture** - Automatic capture of clicks, inputs, and other interactions

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/275700/dashboard/960518) - Overview dashboard with all key metrics

### Insights
- [Event Exploration Clicks](https://us.posthog.com/project/275700/insights/pYeVrchv) - Tracks how many users click the Explore Events CTA button
- [Event Card Clicks](https://us.posthog.com/project/275700/insights/xqPanyR2) - Tracks which events users are clicking on to view more details
- [Navigation Clicks](https://us.posthog.com/project/275700/insights/jPbecDC6) - Tracks user navigation patterns through navbar links (broken down by link name)
- [Homepage to Event Funnel](https://us.posthog.com/project/275700/insights/XoTc4DqJ) - Conversion funnel from exploring events to clicking an event card
- [Popular Events by Location](https://us.posthog.com/project/275700/insights/g6VGW04B) - Shows which event locations are most popular among users

## Configuration

PostHog is configured with:
- **API Host**: `/ingest` (reverse proxy through Next.js rewrites)
- **UI Host**: `https://us.i.posthog.com`
- **Defaults**: `2025-05-24` (latest recommended settings)
- **Debug mode**: Enabled in development environment
- **Exception capture**: Enabled
- **Reverse proxy**: Configured in `next.config.ts` to improve tracking reliability

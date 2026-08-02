# 07 — Mentor Google Calendar / Meet pilot

This checklist validates mentor-owned Calendar events with dedicated test identities and synthetic bookings. It is intentionally split into local automated verification and human/live Google verification. Do not use production mentor or mentee data.

## Rules for the pilot

- Use a dedicated pilot mentor Google account and a dedicated pilot mentee Google account. Confirm both addresses with the human running the test; do not paste them into repository files or logs.
- Use a fresh synthetic booking for every scenario. Never reuse a real booking or a real participant's meeting.
- Do not copy authorization codes, access tokens, refresh tokens, client secrets, cookie values, event descriptions, attendee lists, or Meet URLs into tickets, screenshots, terminal output, analytics, or this checklist.
- When evidence is needed, record only safe metadata: pass/fail, timestamp, redacted event identifier such as `event_…redacted`, account domain/type, and the connection status shown in the dashboard.
- Stop the pilot if the app falls back to the shared 4Herfrika organizer, creates a placeholder link, displays a secret, or exposes a Meet URL in logs.

## Human/live prerequisites — Google and product setup

- [ ] Create or confirm the dedicated pilot mentor and mentee Google identities.
- [ ] Confirm the pilot OAuth consent screen, exact redirect URI, HTTPS callback, and the full reviewed scope set — `https://www.googleapis.com/auth/calendar.events.owned`, `openid`, and `email` — are configured and requested by an authorized operator, with no unreviewed scopes. Do not change Google Cloud configuration as part of this test.
- [ ] Confirm the pilot mentor can open Google Calendar and Google Meet in the selected account type/Workspace edition.
- [ ] Record the pilot mentor account type, Workspace edition, external-user/guest policy, and any admin-enforced Meet policy that affects admission. Keep only safe policy labels and pass/fail evidence.
- [ ] Confirm the pilot operator can inspect Calendar event organizer/creator and Meet access settings without exporting event content.
- [ ] On a newly API-created event, record the effective Meet access type (**Restricted**, **Trusted**, or **Open**), whether **Host must join before anyone else** is enabled, whether a waiting room is enabled, and which admin policy supplied those values. Do not rely on a manually edited event.
- [ ] Confirm the app is running with synthetic data and that server logs are captured in a secret-safe sink.

## Local automated verification — before using Gmail

- [ ] Run the focused mentor connection, OAuth, Calendar, and booking tests with fakes only.
- [ ] Assert that the raw status loader contract is exactly `not_connected`, `connected`, `reauth_required`, `revoked`, or `disconnected`, plus safe identity/status metadata.
- [ ] Separately assert the UI mapping: `connected` renders **Connected**; `reauth_required` and `revoked` render **Reauthorization required**; `not_connected` and `disconnected` render **Not connected**.
- [ ] Assert that connect, reconnect, and disconnect actions are mentor-scoped and do not return tokens, authorization codes, raw Google responses, event descriptions, or Meet URLs.
- [ ] Assert that an unavailable or `reauth_required` connection blocks slot discovery and booking creation; there is no central-organizer or placeholder fallback.
- [ ] Assert that Calendar inserts target the mentor's `primary` calendar, request a unique Meet conference, invite the mentee, and verify mentor organizer/creator identity.
- [ ] Assert that `invalid_grant` becomes `reauth_required` and that retrying does not create a second event.
- [ ] Assert that reschedule does not delete the existing Google event before the replacement is confirmed. If Google deletion fails, the booking is recoverable/manual-resolution state rather than falsely marked complete.
- [ ] Assert that cancellation failure is visible and recoverable, and cancellation success does not leave the booking pointing at an active replacement.
- [ ] Assert that log capture contains no token, authorization code, Meet URL, raw Google response body, event description, or sensitive attendee data.
- [ ] Assert that the profile callback-outcome mapper accepts only the allow-listed safe reasons and maps unknown values to a generic safe message; raw query values are never rendered.

## Human/live verification — connect and ownership

- [ ] Sign in to the mentor dashboard using the dedicated pilot mentor identity.
- [ ] Open the mentor profile. Confirm the Calendar panel says **Not connected** and that booking availability is clearly described as unavailable until connection.
- [ ] Select **Connect Google Calendar**. Complete Google's authorization as the pilot mentor, grant only the full reviewed scope set, and return to the dashboard.
- [ ] Confirm the panel says **Connected**, shows only the safe Google email/display identity, displays **Connected on <timestamp>**, and shows the current health/status result (Connected or an explicit access-check warning). Treat **Connected on** as connection time, never as a last-successful-use timestamp. Confirm no token or authorization code appears in the browser address bar, UI, or logs.
- [ ] Create one synthetic booking through the normal booking flow.
- [ ] In the pilot mentor's Google Calendar, verify the new event's organizer and creator are the pilot mentor, not the 4Herfrika account. Record only a redacted event identifier.
- [ ] Verify the event has exactly one newly generated Meet conference and that the mentor and mentee receive the intended Calendar invitations. Do not paste the Meet URL into evidence.
- [ ] Verify the mentor is the intended organizer/host identity and the mentee is the invited participant. Do not infer ownership from attendee order.
- [ ] Create five fresh API-created events without manual Meet edits. For every event, record the effective access type, host-first/waiting-room state, organizer/creator result, unique-conference result, and invite result using safe metadata only. All five must be deterministic.

## Human/live verification — join order and meeting independence

- [ ] With the 4Herfrika account signed out and absent from the call, have the pilot mentee join first while signed in as the invited mentee identity.
- [ ] Confirm the mentee can enter or receives the expected tenant-policy prompt; capture only the outcome and policy label, never the URL or participant details.
- [ ] Have the pilot mentor join second while signed in as the invited mentor identity. Confirm both can conduct the call and the mentor has the expected organizer controls.
- [ ] Repeat with the pilot mentor joining first, then the mentee.
- [ ] If either order is blocked, record the exact human-visible policy wording, account type, and whether host-first or waiting-room controls are enabled. Do not label the cause from the UI alone.
- [ ] Confirm an uninvited test identity cannot silently enter. Remove the identity after the test.
- [ ] Create two overlapping synthetic bookings for the same mentor. Confirm they have independent Calendar events and Meet spaces, with no cross-session admission or organizer dependency.

## Human/live verification — reschedule and cancel

- [ ] Reschedule the synthetic booking from the mentor dashboard.
- [ ] Verify the replacement event is organized by the pilot mentor, has a different unique Meet conference, and sends updated invitations to the intended mentee.
- [ ] Verify the old event/meeting is handled according to the product contract and is not presented as the current booking. Record only redacted identifiers and pass/fail.
- [ ] Cancel a second synthetic booking.
- [ ] Verify the Calendar event is deleted or visibly enters the documented manual-resolution state when Google cannot confirm deletion. Confirm the UI and notifications do not claim deletion prematurely.
- [ ] Confirm no replacement event or Meet is created during cancellation.

## Human/live verification — revoke and reconnect

- [ ] From the pilot mentor's Google account security settings, revoke the app's access. Do not copy the revocation response or any credentials.
- [ ] Return to the mentor dashboard and reload the profile. Confirm the profile's bounded Calendar health check runs and shows **Reauthorization required** (the UI label mapped from the backend's `reauth_required` status) after Google reports the grant is no longer usable.
- [ ] Attempt a synthetic slot discovery or booking. Confirm it fails closed with a clear reconnect instruction and does not use the shared 4Herfrika organizer.
- [ ] Select **Reauthorize this account** and authorize the same pilot mentor identity again with forced consent. Confirm denial, wrong-account, expired-state, and insufficient-scope outcomes each return an actionable safe message without provider text, codes, tokens, or URLs.
- [ ] Confirm the panel returns to **Connected**, the safe identity metadata is correct, and a new synthetic booking uses the mentor as organizer/creator.
- [ ] If Google presents a different account during reconnect, cancel and confirm the app rejects the wrong-account link rather than silently replacing the mentor's connection.

## Human/live verification — disconnect outcome

- [ ] Select **Disconnect** and confirm the dashboard distinguishes local disconnect from confirmed Google revocation.
- [ ] If remote revocation fails or is pending, confirm the UI says access removal was not confirmed and directs the mentor to Google Account → Security → Third-party connections. It must not claim that Google access was revoked.
- [ ] When the status loader reports revocation pending and retry is allowed, select **Retry Google access removal**. Confirm success changes the profile after refresh; a failed retry remains visibly pending and keeps the safe follow-up instruction.
- [ ] If remote revocation succeeds, confirm the UI says Google access was revoked and the profile reloads as **Not connected**. Do not record provider responses or account-security URLs.

## Human/live verification — secret-safe evidence review

- [ ] Review application logs for the full pilot window. Confirm there are no OAuth codes, access/refresh tokens, client secrets, raw Google bodies, Meet URLs, event descriptions, or sensitive attendee data.
- [ ] Review browser history/address bar, error toasts, screenshots, and network-inspection artifacts. Confirm none contain secrets or Meet URLs beyond the normal Google navigation performed by the human.
- [ ] Delete local screenshots, copied browser artifacts, and synthetic booking data according to the test environment's cleanup procedure.
- [ ] Record the final result as **pass**, **fail**, or **blocked**, with the failing phase and redacted safe metadata only.

## Exit criteria

- **Pass:** connect, mentor ownership, unique Meet/invites, both join orders, reschedule, cancel, revoke/reconnect, and secret-safe logging all pass for the supported account matrix.
- **Fail:** any supported identity cannot complete the call, organizer is not the mentor, lifecycle creates duplicates or loses recoverability, or any secret/Meet URL leaks.
- **Blocked:** a required human/live prerequisite or Google tenant policy is unavailable; keep the UI and booking flow fail-closed until the prerequisite is resolved.

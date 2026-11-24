---
status: proposed
date: 2026-11-21
amends: 0002
---

# Each Course carries its own Completion policy

[ADR 0002](./0002-academy-courses-on-our-own-stack.md) gave every Course one rule set (70% pass mark, 3 attempts an hour, no watch tracking, no Tasks). Ordina's course pack asks for something much stricter: every answer right, a 10-minute wait between attempts, videos watched to the end on first viewing, an "I have read this" step, and four Tasks reviewed by a Facilitator before a Certificate is issued. Ordina is the first Partner, not the centre of the Academy, so we don't make its rules the platform's rules. Each Course instead carries a Completion policy. 4HerFrika's own Courses keep the lean default from ADR 0002, and a Partner's Course sets only what its licence or pack requires. A second Partner with different rules is then a new policy, not new code.

## The policy

| Setting | Default (4HerFrika courses) | Ordina, "AI for Your Next Opportunity" |
|---|---|---|
| Quiz pass mark | 70% | 100% |
| Between failed attempts | at most 3 an hour | wait 10 minutes, no limit |
| Shown after a failed attempt | score | score and topics to review |
| Shown after a pass | score | every answer, with its "Why" |
| Video counts as done | the Learner reaches the end and taps Continue | watched to the end, no skipping ahead on first viewing |
| Reading counts as done | the Learner taps Continue | the Learner taps "I have read this" |
| Modules unlock | all open | in order: video, reading and quiz done |
| Tasks | none | required, marked Complete by a Facilitator |
| Certificate issuer line | 4HerFrika with the Course's Partners | "Issued by 4HerFrika", one programme-lead signature, "Course content by Ordina" |
| Certificate verification | public page | public page and QR code; name, course, date and status only |
| Partner reporting | none | anonymised Cohort report after each quarter, with small groups merged so no Learner can be identified |

## Consequences

- **Tasks and Facilitator review become a platform capability** (submission, review queue, Complete / Needs work, resubmission), switched off unless a Course's policy needs it. This reverses ADR 0002's "assignments are out for launch" for Partner Courses only.
- **Watch tracking is needed for policies that ask for it.** ADR 0002 rejected it as fakeable. It stays fakeable; we build it because the licence asks, and quizzes still carry integrity.
- **The policy is stored on the Course** and fixed for a Learner when they enrol, so later edits never move someone's finish line mid-course.
- **Licence constraints live beside the policy, not in it.** Ordina's licence doesn't allow its material anywhere people who aren't Learners can reach it. So partner videos are not on YouTube: they live in a private Supabase Storage bucket as 480p and 720p MP4s with VTT captions, and the server hands enrolled Learners short-lived signed URLs, played with Vidstack. Owning the player is also what makes "no skipping ahead on first viewing" and resume practical. Every Ordina Course page also carries a "for your own learning, don't share" notice, as the licence asks. This overrides ADR 0002's video decision and its "files on Supabase Storage are ruled out for data cost" reasoning: 480p copies keep a 2,000-Learner pilot inside the Supabase plan's included data, so the monthly cost estimate in ADR 0002 still holds.
- **Certificates follow the policy.** ADR 0002 puts both logos and two signatories on every Certificate. Under Ordina's policy the Certificate is issued by 4HerFrika with one signature (the programme lead) and the line "Course content by Ordina"; Ordina's logo stays on the course page and card. When a policy requires Tasks, the Certificate is issued in the same transaction as whatever completes the last requirement, which may be a Facilitator marking the final Task Complete.
- **Deleting an account keeps the learning record.** ADR 0002 said deleting an account deletes progress. Instead, Learner records are not tied to the auth account, so progress, quiz attempts and Certificates survive an account deletion and are removed by an admin on request. Quiz attempts are numbered per lesson with a unique constraint, so a double submit can't slip past the attempt limit.
- **Revoked Certificates read "withdrawn"** to Learners and employers on the check page; admin screens and data keep "revoked".
- **Launch on 27 Nov** needs only Module 1 under Ordina's policy. Task review can follow, because no Certificate can be issued before the course's final module anyway.

## Open questions

- Minimum age: some of the AI tools this Course teaches set an 18+ minimum. Keep 16+ (with 4HerFrika's safeguarding process for under-18s), or set 18+ for this Course?

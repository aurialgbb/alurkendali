# Alur Kendali: local V1

Source: ../docs/LP Implementation Plan.md. Brand name and geometric monogram are provisional and authorized by the user. No invented phone number, client proof, or founder biography is added.

Reading this as: B2B consulting landing page for Indonesian business owners and finance leaders, in a bright, precise visual language. ENERGY 2 / RHYTHM 2 / MOTION 2.

- White and cool off-white establish a calm consulting environment. Royal blue #2449d8 identifies actions and controlled workflow stages.
- Inter provides a readable business voice and clear financial data labels; the font is served locally.
- The split hero places the business problem next to its process explanation. Converging approval paths are the repeated identity motif.
- Section spacing follows information density. Compact pain signals lead into a larger interactive solutions section, then a tinted comparison, an expansive demo, and a restrained founder block.
- Moderate corner radii distinguish controls, document cards, and larger UI frames. Shadows are reserved for layered process documents and the demo frame.
- Icons depict documents, approval, evidence, and reporting; no decorative stock illustrations are needed.
- Motion runs once for the initial process explanation, with short transitions for user-controlled tabs. Reduced motion reveals content immediately.
- Light is the fixed theme because the supplied brief explicitly requires bright, white, professional presentation.

## Wireframe

Desktop: header -> split hero (message and CTAs | fragmented-to-controlled illustration) -> four pain signals -> five solution tabs (outcomes | illustrative mini-UI) -> before/after -> four-step demo -> four-step engagement -> founder philosophy and credentials -> fit comparison -> FAQ -> final CTA -> compact footer.

Mobile: labeled menu -> hero message and CTAs -> reflowed process illustration -> stacked pain signals -> wrapping solution controls -> stacked outcomes and mini-UI -> vertical before/after -> wrapping demo controls and reflowed request details -> engagement list -> founder -> fit -> FAQ -> final CTA -> footer. Bottom CTA appears after hero, hides near final CTA, and reserves safe-area space.

## Hero storyboard

1. Headline, supporting paragraph, and actions appear over 450ms with a small stagger.
2. Source records (spreadsheet, chat approval, supporting document) reveal in order.
3. Connection lines draw toward a controlled request.
4. Approval, evidence, and audit-trail steps appear. Motion stops after the sequence.

## Local-only boundaries

Demo values are illustrative and labeled. Contact CTA previews and copies a contextual message until a real WhatsApp number is configured. No external analytics requests, real transaction processing, or publication. Metadata remains noindex during the local draft.

## Revision: sequential flow and conversational copy

The user requested a repeating process animation, more obvious stage/section differences, and less stiff copy.

The before/after flow now advances through four stages at 1.9 seconds per stage, shows the fully completed flow for 2.6 seconds, then restarts. A visible pause/resume control gives the reader time to inspect it. Intersection and page visibility pause progression when it is not being viewed. Reduced motion shows all stages complete and removes the unnecessary animation control. Recurring changes are not an ARIA live region, avoiding repeated screen-reader announcements.

Blue denotes the current step, green denotes completed work, and outlined numbered nodes denote upcoming steps. Text states, numbers, and check marks convey the same information without color. A short description explains what happens at the current step. Small-screen stages reflow into a two-column layout.

The warm problem section, blue comparison section, white demo, and pale green founder section distinguish changes of topic. Demo tabs now use filled selected states; the completed audit view uses green. Blue and green are the two active accent families; the warm problem surface is neutral.

Copy was revised across the hero supporting text, pain signals, five solutions, comparison, demo, engagement process, founder, fit, FAQ, and final CTA. The voice describes recognizable work (opening files, chasing approvals, checking an invoice), with fewer abstract slogans and less mixed-language jargon. The approved English hero headline and professional service descriptor remain.

## Revision: antislop audit 001 follow-up (8 October 2026)

Owner direction for this revision: fix every finding in `anti-slop/audit-001-2026-10-08.md` and make every section more alive. Dial is now **ENERGY 2 / RHYTHM 3 / MOTION 3**, and it supersedes the line at the top of this file.

Owner overrides (R-37), recorded as decided:
- Finding 1 kept: founder credential copy ("Top-tier audit pedigree", governance and audit-ready claims). The owner states the facts are true and the founder is already known to the audience.
- Finding 2 kept: the NDA statement and the word "tim". The owner confirmed both are accurate.
- WhatsApp number stays in `NEXT_PUBLIC_WHATSAPP_NUMBER`; the owner will set it. Until then every CTA opens the copy-message dialog.

Decisions:
- Typography: Plus Jakarta Sans (local variable font, OFL) for h1/h2 and the founder voice; Inter stays for body, labels, and tabular figures. Reason: a wide, confident sans drawn in Indonesia reads modern and approachable when pitching to business owners, and gives the page a voice an all-Inter page did not. Instrument Serif was tried first and replaced at the owner's request because its condensed shapes looked squeezed.
- Motion uses the Motion library (`motion/react`, `LazyMotion` + `domAnimation`). The landing JS grew from 174.9 KB to 212.2 KB gzip (webpack builds, measured with `qa/bundle-size.cjs`).
- Structure: Hero, Problems, Solution areas, Demo (comparison merged in), How we work, Founder, Fit + FAQ, Final CTA. The scattered-to-controlled story is no longer told three times.
- Surfaces: white base, warm neutral for Problems, one blue tint for the demo band and the final CTA. Green stays reserved for "done".
- Removed as decoration: left accent stripes, decorative badges and non-ordinal numbers, arrows on most buttons, the founder-note filler line, the hero baseline line.

Motion storyboard (each item has one purpose; reduced motion shows the final state, and nothing loops without a pause control):
- Headings are wiped in top to bottom once, like a line written into a ledger. Body copy does not animate.
- Hero: lines rise from masks, the underline under "enough." draws, then the scattered records arrive, connectors draw, the records settle and dim, and the controlled card ticks each control in order. Plays once on load.
- Problems: each problem plays a short scene once in view (branch and head-office totals diverge; money leaves before the receipt; the approval scrolls away in chat; a formula changes with no history).
- Solution areas: the tab indicator slides; each category illustration moves the way its work moves.
- Demo: scroll-linked convergence of four disconnected tools into four stages, then the request autoplays through its stages with a progress bar, pausing off-screen, in hidden tabs, on reduced motion, and permanently once a visitor picks a stage. A pause button is always available.
- How we work: a rail fills with scroll and lights each step as it passes.
- Founder: the statement rises line by line, the "ak." mark is revealed like a signature, pillar rules draw.
- Fit + FAQ: fit criteria tick one by one; FAQ answers open with a height transition.
- Final CTA: one flow line draws and ends at the button (desktop only, where it does not cross the copy).

# Alur Kendali: local V1

Source: ../LP Implementation Plan. Brand name and geometric monogram are provisional and authorized by the user. No invented phone number, client proof, or founder biography is added.

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

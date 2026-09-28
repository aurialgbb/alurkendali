# Local V1 verification

Date: 13 September 2026. Scope: Alur Kendali landing page on 127.0.0.1. This is a local acceptance report, not certification of public production readiness.

## Results

- Production build: PASS. Next.js 16.3.5 compiled and statically prerendered the landing page and icon. TypeScript passed.
- Browser workflow: PASS. 18 recorded check groups in `qa/artifacts/qa-results.json`, plus final targeted checks for contact status reset and mobile demo tabs.
- Automated accessibility: PASS. No axe violations for WCAG 2 A/AA and 2.1 AA in desktop, solution panel, all four demo states, contact dialog, and mobile.
- Mobile Lighthouse, final production build: Performance 98; Accessibility 100; Best Practices 100; SEO 60. LCP 2.3s; CLS 0. Scores are local laboratory measurements and may vary on a public host or another device.
- SEO scope: the only failing applicable SEO audit is `is-crawlable`, due to the deliberate `noindex, nofollow` metadata. Domain, canonical URL, indexing, and public privacy policy remain publication work. This does not block local acceptance.
- WhatsApp scope: all local CTAs open and copy a contextual draft. A real recipient is not configured, and live WhatsApp delivery has not been tested. No messages were sent.

## Interaction evidence

Desktop navigation clicked through all four section anchors. Five solution tabs changed their content and contextual contact messages. Arrow keys, Home, and End changed solution tabs. Four demo tabs updated their status, detail, role, and audit history. Five FAQ disclosures opened and closed. Navbar, hero, solution, final, footer, mobile menu, and sticky contact actions opened the draft dialog. Clipboard success, rejection with manual-copy guidance, Escape, focus restoration, and state reset were checked. Privacy opens and closes. Mobile menu navigation and Escape work. The sticky mobile CTA appears after the hero and hides near the final CTA. All four mobile demo tabs were checked separately.

No horizontal document overflow at 320, 375, 390, 640, 768, 1024, 1280, and 1440px. Text enlarged to 200% reflowed at 640px. Reduced-motion mode disables CSS motion and keeps the process paths visible. Browser runtime and console errors: zero in recorded checks. Events include demo, solutions, founder, contact actions, and campaign attribution. No analytics provider is connected.

Screenshots in `qa/artifacts/`: desktop and mobile hero/full page, solution, demo/audit trail, mobile demo, founder, fit, and FAQ. Visual inspection checked the hero on desktop and mobile, the audit demo, and founder composition against the brief.

## Antislop delivery gate

- R-02 PASS: no em dashes in authored TS/TSX copy (source scan).
- R-03 PASS: eight viewport widths and 200% text enlargement have no document overflow; mobile diagram reflows vertically.
- R-17 PASS: no fabricated marketing metrics; the only financial amount belongs to the explicitly labeled illustrative demo.
- R-18 PASS: no testimonials, client portraits, or logo strip.
- R-23 PASS: user authorized temporary brand invention; footer labels temporary brand; no personal identities or phone numbers invented.
- R-24 PASS: every anchor resolves to an existing section; all desktop and mobile navigation destinations were clicked.
- R-25 PASS: axe contrast audits pass; core palette ratios are recorded below.
- R-26 PASS: every CTA, tab, FAQ, menu, privacy control, copy control, and modal dismissal has verified behavior.
- R-27 PASS: missing-contact state is explained; copy loading, success, and error recovery exist. No remote data view is shipped.
- R-28 PASS: five FAQs address existing systems, workflow fit, Excel, implementation cost, and starting scope from the supplied plan.
- R-32 PASS: focus styles, skip link, tab keyboard navigation, native dialog Escape/focus restoration, and mobile menu Escape are implemented and checked.
- R-33 PASS: features and styles live in authored application source; no runtime source/CSS patcher is shipped. Prettier formats authored code only.
- R-34 PASS: the supplied brief specifies a fixed bright theme; no alternate theme is shipped.
- R-35 PASS: production build, TypeScript, real browser interaction checks, responsive screenshots, and Lighthouse were run.
- R-36 PASS: founder credentials are taken from the supplied implementation plan; no security, compliance, customer, or quantified outcome claims were invented.
- R-37 PASS: DESIGN.md records supplied visual direction and ENERGY 2 / RHYTHM 2 / MOTION 2.
- R-38 PASS: realistic transaction data is labeled illustrative; no client implementation is implied.
- R-01 PASS: white and cool neutral surfaces follow the brief; blue marks actions and workflow states. No gradients or glows.
- R-04 PASS: document, chat, grid, approval, attachment, and clock symbols represent specific workflow concepts.
- R-06 PASS: locally served Inter supports readable B2B copy and financial labels. No large monospace or spaced uppercase labels.
- R-07 PASS: no decorative background grid. The small spreadsheet grid explains the source-document state.
- R-08 PASS: arrows identify key contact actions, the process transition, and a specific text link; most controls have no arrow.
- R-09 PASS: labels identify illustrative data or workflow status. No decorative marketing badges.
- R-10 PASS: blur is limited to sticky navigation and modal backdrop, where it separates interface layers.
- R-12 PASS: shadows are reserved for layered process documents, the demo frame, and modal elevation.
- R-13 PASS: no glow effects.
- R-14 PASS: pain signals have equal structural weight because they are four parallel problems. Solutions use one changing outcome/mini-UI panel instead of repeated feature-card sections.
- R-19 PASS: the hero sequence runs once, process lines explain transitions, and tab motion follows explicit interaction; reduced motion is checked.
- R-22 PASS: hero and mini-UI illustrate requests, approvals, evidence, and audit history from the project brief. No generic stock illustration.
- Liveliness PASS: large problem-led hero, converging approval paths, varied section composition, whitespace, and restrained blue accents implement the declared dials.
- C-1 PASS: major color, layout, typography, spacing, elevation, and motion decisions are documented in DESIGN.md.
- C-2 PASS: shipped controls have working local behavior, including missing contact configuration.
- C-3 PASS: page sections follow the supplied business narrative and launch priorities.
- C-4 PASS: desktop/mobile, copy states, keyboard, text enlargement, and reduced motion are checked.
- C-5 PASS: demo labels distinguish examples from evidence; founder statements trace to the user-supplied plan.
- R-05 PASS: pain signals, tabs, comparison flow, product demonstration, engagement timeline, founder, fit, and FAQ use distinct compositions.
- R-11 PASS: controls use 6px corners, document cards 9px, larger UI frames 12-13px, and modal 16px. Only approval nodes are circular.
- R-15 PASS: CTA text names a process discussion or system example.
- R-16 PASS: copy explains workflow, responsibility, supporting evidence, and reconciliation rather than marketing superlatives.
- R-20 PASS: recurring document-to-control paths and the Alur Kendali identity connect directly to business systems consulting.
- R-21 PASS: fixed white/light theme follows the explicit brief.
- R-29 PASS: neutral foundations plus blue brand accent; a restrained ochre status treatment identifies waiting states.
- R-30 PASS: no reference-site assets or layouts were copied.
- R-31 PASS: reasons for major design decisions are in DESIGN.md.

## Computed contrast ratios

| Foreground | Background | Ratio   |
| ---------- | ---------- | ------- |
| #192334    | #ffffff    | 15.77:1 |
| #566173    | #ffffff    | 6.26:1  |
| #2449d8    | #ffffff    | 6.95:1  |
| #61708b    | #eff4fe    | 4.54:1  |
| #60708a    | #f4f7fd    | 4.68:1  |
| #2849ae    | #edf2ff    | 7.06:1  |
| #66592d    | #f5f1e6    | 6.14:1  |

All listed text combinations exceed 4.5:1. Automated audits additionally check rendered states. Manual testing is still needed on real phones and with assistive technologies before a public launch.

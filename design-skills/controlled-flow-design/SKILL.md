---
name: controlled-flow-design
description: "Recreate the user's Controlled Flow visual style: minimalist B2B layouts, Inter typography, clear hierarchy, restrained blue accents, and process-specific illustrations. Use for LPs, Finance SaaS interfaces, or PPT/PDF adaptations when this style is requested."
---

# Controlled Flow Design

This is the user's reusable design direction derived from the Alur Kendali landing page. Controlled Flow is a project-specific name, not an established design movement. Preserve the visual relationships, not the original brand, claims, page copy, or exact page structure.

## Visual system

- Use Inter variable where available; check font availability for document output. Ink `#192334`, secondary text `#566173`, primary blue `#2449D8`, white surfaces, thin cool borders. See [tokens.json](references/tokens.json) for starting values.
- Create hierarchy through type scale, whitespace, alignment, and content grouping. Prefer left-aligned headings and copy; reserve centered arrangements for short diagrams or deliberate focal points.
- Use a small palette with contextual surfaces: warm neutral for the existing problem, pale blue for the improved workflow, muted green for completed/verified states. Distinguish status with text or shape as well as color.
- Moderate radii and quiet elevation. Large pill containers, gradients, glass effects, and repeated decorative badges are not part of this reference direction. Introduce a new treatment only when the user's task calls for it.
- Visuals explain actual work: matched receipts, asset locations, linked purchasing documents, task handoffs, or reporting rollups. Do not reuse one generic table with different labels as every illustration. Label sample data and keep arithmetic consistent.
- Indonesian copy should sound like a knowledgeable colleague. Name the action, problem, and next step. Prefer “Tim finance tidak perlu mengejar bukti lewat chat” over abstract claims about seamless transformation. Preserve domain terms where users recognize them.

## Apply to the requested medium

Read [web-modes.md](references/web-modes.md) for an LP or application, and [document-modes.md](references/document-modes.md) for slides or reports. Inspect [hero.png](references/hero.png) and [solution-finance.png](references/solution-finance.png) when matching the visual feel. They are references, not content to paste into the deliverable.

Identify the medium, audience, user task, and existing brand constraints from context. Proceed with reasonable assumptions where details are optional. Carry the same hierarchy across formats while adjusting density and dimensions. An internal finance screen should prioritize working data; it should not inherit the marketing hero's scale or vertical spacing.

For implementation, follow the project's existing framework. For PPTX or PDF authoring, use the relevant available presentation/document/PDF tools and skills; this skill supplies visual direction rather than an authoring engine.

Verify the actual output: browser rendering and interactions for web; rendered slides/pages for documents. Check text overflow, readable labels, meaningful emphasis, real data accuracy, and consistency against the reference. Do not claim an unrendered deliverable was visually verified.

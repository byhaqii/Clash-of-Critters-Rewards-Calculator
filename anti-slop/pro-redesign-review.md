# Professional visual redesign

Owner request: make the existing calculator substantially more professional using UI/UX Pro Max. Existing game data, simulator mechanics and approved accessibility fixes retained. No dependencies, generated assets, deployment or account changes.

## Direction and decisions

UI/UX Pro Max's first gaming query returned a 3D showcase with neon colors, a poor fit for a working calculator. A narrower utility-calculator query returned Minimalism & Swiss Style, appropriate for this tool. Applied its restrained hierarchy, functional typography and spacing. The search's marketing sections, orange palette and code-style headings were not appropriate to the existing green game interface and were not applied or persisted as a verified product system.

- Native system sans replaces Trebuchet in the calculator for clearer weights and a professional tool character without a font download.
- Charcoal/forest editing area preserves identity; light paper results establish where to look after changing points. This is one designed theme, not a partially implemented theme toggle.
- Form left, results right on desktop; stacked in source order on narrower screens. Three-column adjustments keep controls readable and tappable.
- Actual reward artwork now identifies totals, empty-state reward types and the next milestone's rewards. No artwork or reward quantities were invented.
- Next milestone emphasizes points remaining, with full current/target values, semantic progressbar and actual upcoming rewards.
- Inline validation uses field descriptions and aria-invalid. Reached/claimed reward-track status uses words alongside state color.
- Resting surfaces remain flat, without decorative shadows, gradients, glass or background textures.
- View full reward track has one directional arrow to identify movement to a detailed view; other controls do not repeat it.

Design Read: game companion calculator for Clash of Critters players, restrained professional tool with green game identity. ENERGY 2 / RHYTHM 2 / MOTION 1. DESIGN.md updated with reasons.

## Verification

- PASS: npm run build, npm run lint, npm test, git diff --check.
- PASS: Taste app inspector at 1440, 768 and 390px: zero failures, no recorded console errors or overflow culprits on default calculator. All six final screenshots opened.
- One inspector warning retained: 43px internal visual band in empty reward summary. This groups the existing artwork and empty guidance separately from the panel heading; no fixed height or stretched empty panel is used.
- Computed normal-text contrast: secondary dark text 7.81:1; paper secondary text 5.84:1; next-milestone secondary text 5.27:1; primary button text 9.40:1. Dark control borders 4.49:1 and progress fill/track 3.65:1 exceed the 3:1 non-text requirement.
- Browser: positive adjustments changed live points/rewards; negative adjustments returned 6,200 to 100; invalid input displayed inline feedback; entering 1,500 showed 60 Pinball, 124K Candy, one milestone ready, 500 points to the next milestone, and the next rewards of 124K Candy and 3 Egg.
- Full reward track was invoked, but late native-browser automation returned incomplete accessibility trees and noWindowsAvailable for scrolling. No claim of exhaustive new click-through, physical-phone, 200% zoom or fault-injection testing.

## Delivery Gate status and evidence

- Hard gate source/build PASS for changed code: no fabricated numbers/claims, no new people/assets/navigation, no dead handlers introduced, actual event data, existing loading/error boundaries retained, inline errors and accessible focus styles, direct source edits, existing reduced-motion fallback and no broken theme toggle.
- Responsive visual gate PASS at the three measured widths; no default-page overflow or clipped controls found.
- Purpose gate PASS: flat surfaces, semantic imagery, one view-navigation arrow and written typography/color/layout reasons above. No glass, glow, decorative gradient, icon badges or generic marketing sections.
- Liveliness gate PASS: declared dials, explicit input/result hierarchy, real game-art motif, deliberately contrasting result surface, purposeful grouping and control/progress feedback.
- Quality locks PASS for the changed visual implementation: useful content only, action-specific labels, consistent radii and color roles, no popular-product imitation, no new third-party libraries or external font dependency.
- R-35 full interaction gate remains PARTIAL: checks above are recorded; browser automation limits prevent an exhaustive release approval. Existing simulator runtime checks from fix-001 remain historical evidence, not newly repeated checks.

## Screenshot critique

ROUND 2
Seen in one second: a focused green game calculator, with editing on a dark surface and answers on a light one.
Idea (one sentence): real game rewards become the clear destination of entering event points.
Live thing: points update actual totals, ready milestone count, next target and upcoming rewards.
Layout words by section: header=compact identity / event=tool selector / progress=dark editing form / rewards=light result summary / target=connected progress strip.
Scores: design 7.8 · usability 8 · creativity 7 · content 8 → overall 7.74.
Caps applied: app tool, so marketing-page photography and scroll choreography criteria are inapplicable. Familiar utility composition limits originality.
Top three observations:
1. Mobile requires scrolling from editing to results; source order stays aligned with the actual task and keyboard order.
2. Empty summary intentionally has breathing room around genuine game artwork; the inspector warning is documented rather than hidden with a forced panel height.
3. Populated summaries vary naturally with reward types; not every reward has an image in the existing assets, so text carries those types rather than invented icons.

Final files: src/App.tsx, src/App.css, src/responsive.css, src/index.css and DESIGN.md. Screenshots and measurements: anti-slop/pro-redesign-final/.

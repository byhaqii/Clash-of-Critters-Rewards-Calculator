# Clash of Critters calculator

Scope: approved audit findings 1-9, followed by an owner-requested professional visual redesign using UI/UX Pro Max. Preserve the existing green game identity, product mark, reward artwork and game mechanics.

Reading: a reward calculator for Clash of Critters players, using a playful green game style. ENERGY 2 / RHYTHM 2 / MOTION 1.

- Charcoal/forest grounds retain the identity; a light paper result surface makes reward output the visual destination. The simulator keeps its existing green scene. Lime is reserved for keyboard focus and the fertilize action.
- Native system sans gives the calculator a restrained tool-like character, with no external font load. Tabular figures keep inputs/results stable. Metadata starts at 12px, instructions at 13-14px, and field inputs at 16px or more.
- Editing occupies the left column; rewards and the next milestone share the contrasting right column. Narrow screens stack in DOM order. Tablet retains full-width results until both columns genuinely fit.
- Resting panels are flat. Radius distinguishes panels, controls and milestone nodes rather than making everything a pill.
- Existing reward artwork identifies totals and previews the next milestone. Zero-state artwork shows reward types from actual event data, with no invented quantities. No new asset files or personal imagery.
- Dark green is retained as the established game interface. No new theme or theme control is part of these audit fixes.
- Motion only supplies control feedback and brief fertilize feedback. Reduced motion disables the JavaScript fertilize animation as well as CSS transitions.
- Native modal dialogs handle focus containment, Escape and focus restoration. Every control has a 44px hit area and visible focus.
- All milestone and simulation values come from existing project data and mechanics. The simulator's point conversion remains explicitly provisional.
- Loading names the simulator and offers cancellation. A load failure offers reload or return. Storage failures keep the working state in the tab and explain how to retry.

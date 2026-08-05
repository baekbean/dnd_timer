<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## Testing

- Run `npm test` for the Vitest unit and component suite in `__tests__/`.
- Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` before deployment.
- See `TESTING.md` for test layers and conventions.
- Add tests for both sides of new conditionals and for every bug regression.

## Analytics

- See `EVENTS.md` for the full catalog of tracked events (what fires them, params, destinations, call sites).
- When adding, renaming, or changing the params of a tracked event, update `EVENTS.md` in the same change.

## Figma design system

- The code's design tokens (`app/reshaped-theme.css` colors/radius/shadows, `app/globals.css` `@theme` font families) are mirrored as Figma Variables/Styles in the `DnD-Landing-Page` file (fileKey `yDTZbfcrkLop7ssCwZzgwG`): `Color` collection (26 vars), `Radius` collection (3 vars), `Font` collection (6 STRING vars), plus 6 `Shadow/*` effect styles. Every variable carries a WEB code syntax pointing at its real CSS custom property (e.g. `var(--rs-color-background-primary)`).
- Code is the source of truth. Before creating or editing anything in that Figma file with `use_figma`, inspect existing variables/collections first (per the `figma-use` skill's own discovery rule) and bind new work to these tokens instead of hardcoding new hex/px values.
- If a token's value changes in `reshaped-theme.css` or `globals.css`, update the matching Figma variable in the same change — same principle as the `EVENTS.md` rule above.
- These tokens are **not yet retroactively applied** to pre-existing layers (e.g. the Blog/Updates mockup frames still use hardcoded fills). When touching those frames, rebind them to the tokens rather than perpetuating hardcoded values.
- Aspekta/Pretendard are not installed in Figma's cloud renderer, so their Font variables are string-only placeholders (no real Text Styles) — don't attempt `loadFontAsync` on them until they're installed locally.

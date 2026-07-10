# Replacement copy — Slides 3 & 4 (Milarex · Digital Architecture)

Goal: reframe both slides from system description to board argument (money, risk, decision).
Numbers reused from Slide 7 baselines: Forecast Accuracy 64 → 82, Customer Service Level 94 → 98, Inventory Days 38 → 29. If baselines change, update here too.

---

## SLIDE 3 — replaces "Sales offices · MiFo"

**Kicker:** `03 · SALES`

**Headline:** Selling with the margin in view

**Subline (left column):**
Today a sales office quotes a customer without seeing the real margin, and our demand
forecast is right 64% of the time — so production plans against guesses. MiFo closes
that gap at the very first customer contact.

**Outcome cards (Strategic view — replaces the "Responsibilities" list; 3 cards, each: bold claim + one supporting line + KPI tag):**

1. **Margin before the quote**
   Every quote is priced against live cost and capacity — not last month's spreadsheet.
   Tag: `Cost / kg · EBITDA`

2. **Forecast accuracy 64% → 82%**
   The factory plans against real demand signals instead of manual estimates.
   Tag: `Forecast Accuracy`

3. **Service level 94% → 98%**
   Fewer missed delivery promises; stickier customer relationships.
   Tag: `Customer Service Level`

**Bottom takeaway (single line, prominent):**
Sales starts the data chain — margin is visible before we commit, not after.

**Technical view (toggle):** keep the current detail panel content unchanged
(owner, Connected status, responsibilities list, KPI chips, "View app — screenshot" link).

---

## SLIDE 4 — replaces "Sales feeds production"

**Kicker:** `04 · INTEGRATION`

**Headline:** One order, same-day to the factory

**Subline (left column):**
Follow a single customer order from the sales office to the production plan in Poland —
this flow is the whole point of the architecture.

**Flow diagram (horizontal, 4 steps, animated left → right):**

1. **Customer order** — captured once in MiFo at the sales office
2. **Demand signal** — forecast, prices, specs and requirements attached automatically
3. **Production plan** — APS / PTS receive it the same day, no re-keying
4. **Promise kept** — delivery date confirmed back to the customer from the real plan

**Contrast strip (below the flow, two states):**
- `TODAY` — e-mail and re-keying · 2–3 days late · conflicting versions
- `TARGET` — automatic · same day · one version of the truth

**Money line (small, under contrast strip):**
Late demand signals cost margin every shift and hold 38 days of inventory.
Same-day flow is what carries the 38 → 29 days target.

**Bottom takeaway (single line, prominent):**
A same-day demand signal to the factory is margin and working capital — not IT plumbing.

---

## Implementation brief for the agent

Scope: slides 3 and 4 only. Do not modify other slides, navigation, or the visual system.

1. **Keep the existing design language** — serif headlines, mono kickers, gold/teal accents,
   dark background, existing card styling. This is a copy + layout change, not a redesign.
2. **Slide 3:** in Strategic view, replace the right-hand MiFo panel's "Responsibilities"
   and "KPI impact" sections with the 3 outcome cards above. Keep panel header (MiFo,
   owner, Connected badge, screenshot link). In Technical view, restore the current
   full panel unchanged — this is the intended difference between the two toggles.
3. **Slide 4:** replace the current globe arc (two dots + line) as the primary content
   with the 4-step horizontal flow. The globe may stay as a dimmed background. Steps
   appear sequentially (~400 ms stagger); the contrast strip fades in after step 4.
4. **Fix the panel carry-over bug:** the MiFo detail panel opened on slide 3 currently
   stays open on slide 4. Close any open detail panel on slide change.
5. **Takeaway styling (both slides):** render the bottom takeaway larger and higher-contrast
   than the current footer bullets (suggest ~18px, gold accent bar on the left), consistent
   with each other. Do not restyle other slides' takeaways in this task.
6. **Numbers as data, not strings:** source 64/82, 94/98, 38/29 from the same KPI
   constants used by slide 7 so they can't drift apart.
7. **Responsive check:** verify both slides at 1280×800 and 1920×1080 — no clipped
   cards, no text overlapping the globe/flow; add a scrim behind the left text column
   if needed.

Acceptance test: a viewer who sees only slides 3–4 can repeat, in one sentence,
"sales data reaches the factory the same day, which is worth margin and ~9 days of
inventory." If an element doesn't serve that sentence, it belongs in Technical view.

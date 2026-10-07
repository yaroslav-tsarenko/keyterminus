# Keyterminus — Concept record

Phase 1 was skipped: the owner chose the concept from a quiz preview. This file records that choice so later agents don't reopen it. The implementation brief is `.claude/briefs/DESIGN-BRIEF.md`.

## Chosen: "Departure Board"
A departures hall built around one object: a graphite split-flap board. The catalogue is the board. Each key is a departure with a price, a destination (the game), a platform (Steam, Xbox, PlayStation…) and a remark. Buying a key is boarding: check in, pay, and the key **departs** for your account, where its characters flip into place on your own board. Redeeming it on the platform is the arrival.

- **Palette:** warm white concourse floor `#F4F1EA` (Day, default) / near-black neutral-warm `#121314` (Night). The board stays graphite `#222426` in both themes. Mustard `#E2AE2F` (Day) / `#E6B84A` (Night, and always on the board) for actions and board remarks only.
- **Type:** Overpass (Highway Gothic lineage) for signage, headings and body; Sometype Mono for flaps, prices and keys (slashed zero, distinct `1 I l`).
- **Motifs:** the split flap (2px tile with a hinge gap); the route line ending in a mustard terminus bar (also the logo); numbered platform signs.
- **Mark:** a key lying on its side drawn as a route-map line — ring bow, shaft, two-tooth bit — ending at a mustard terminus bar. Favicon: the mark on a graphite flap tile with a hinge across it.
- **Signature moment:** a WebGL split-flap board of real keys in the hero, paging through live titles and flipping to the visitor's search results as they type.
- **Home:** Departures (board) → Platforms → Timetable rails → Your key departs (theater) → Routes (genres) → Revised fares (price cuts, data-backed only) → Gift cards → Season tickets (subscriptions) → Arrivals (how to redeem) → Through the gate (payment and key safety) → Information desk (questions) → Terminus (final search).
- **Merchandising:** default sort "Board order" (a departure score interleaved across platforms), consoles and value promoted, fast genres lead; fare zones `[3, 8, 18, 35, 70]`; SKU prefix `KT-`.

## Adjustments made to the owner's preview
- "Your key departs in about a minute after payment" was not used: the store's config promises "usually within minutes after payment is confirmed", and nothing faster may be claimed.
- Board remarks are limited to data-backed values: `ON TIME` (in stock at its regular price), `NEW` (released in the last eight weeks), `NOW −%` (a real cut against Keyterminus' own 30-day lowest price). `BOARDING`, `DEPARTED` and `ARRIVED` appear only in the theater with sample data. No `LAST CALL`, no delays, no countdowns, no departure times.
- The hero board shows a price column where a real board shows times, so no invented times appear anywhere.

## Directions off-limits (owned by siblings)
Vault Run (Keyrook), Paper Theatre (Fablekeys), Inspection Bay (Patinaskins), The Dresser (Brasmora), Console Deck, keyarcade shop-wall, Midnight Arcade, Cartridge Club, Drop District, Blueprint Works, Chipwave, Aurora Signal, Forest & Stone.

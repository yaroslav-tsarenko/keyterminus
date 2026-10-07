# Keyterminus — Design Brief: "Departure Board"

This is the implementation prompt for the store-pages engineer and the source of truth for the motion engineer. Read it top to bottom before touching code. `.claude/knowledge/DESIGN-MASTER.md`, `.claude/knowledge/WEBGL-3D-KNOWLEDGE.md`, `.claude/knowledge/CHECKLIST-QC.md` (sections 0–17, 19–20 and vertical 18.4) and `/home/claude/devtools/keyterminus-common.md` (including the KEYTERMINUS OVERRIDES and ENVIRONMENT paragraphs) still apply. Where this brief is more specific, follow this brief.

The codebase was cloned from Keyrook. Keyrook's brief ("Vault Run") is retired and so is everything visual it introduced. Keep its *method* (token plumbing, measured contrast, component states, theater contract, motion hooks); throw away its *look*:
- no dial, dial ruler, index line, detents, rotary dial, budget dial;
- no tumbler windows or rolling digits, no decrypt scramble in recessed slots;
- no bolted plates, bolts, steel grain, machined edges, engraving text-shadow;
- no lamps or LEDs, no signal green or banker's green;
- no lockers, vault map, vault door, door poster, wire packets, release ruler;
- no Hubot Sans, Mona Sans, Red Hat Mono;
- no `Archive`, `Pin`, `UserKey`, `SquarePlus` glyphs; no square-cap 1.75 icon style;
- no 0px-everywhere geometry, no two steel tiers, no gunmetal dark-first theme.

Fablekeys ("Paper Theatre", a sibling built on the same base) is equally off-limits: no paper sheets with laid shadows, chapters, Roman numerals, running heads, dotted leaders, ribbons, wax seals, cream + vermilion + teal, Fraunces, Alegreya, Atkinson Hyperlegible Mono, `Backpack`, storybook frames or page turns.

**Scope:**
- `src/app/(store)/**` and `src/components/**` except `admin`;
- `src/styles/variables.css`, `globals.css`, `animations.css`, `motion.css`, `theater.css`, `home.css`;
- `src/app/layout.tsx`, `src/app/fonts.css`, `src/components/layout/ThemeScript`;
- `public/` brand assets, `public/manifest.json`, `scripts/gen-favicons.mjs`;
- fonts and colours in `src/lib/invoice.ts`; the email look in `src/lib/email.ts`;
- the motion engine in `src/lib/motion/**`;
- the theater in `src/components/theater/**`;
- merchandising in `src/config/catalog.ts`, `src/config/merchandising.ts`, `src/config/navigation.ts`, `src/components/catalog/catalog-*.ts`, `src/components/home/data.ts` (§18);
- `src/lib/brand.ts` (`BRAND`), `messages/en/*.json`.

Admin (`src/app/admin/**`, `src/components/admin/**`, `src/styles/admin.css`) keeps its `--admin-*` look. After the token swap open every admin page once in both themes and fix only what became illegible.

**Already done by the design director (do not redo):**
- `src/app/icon.svg` — the new favicon tile (§9).
- `public/brand/keyterminus-mark.svg` — the mark, light-background colours.
- `public/brand/keyterminus-lockup.svg` — mark + wordmark lockup, light-background colours (outlined Overpass 800, harfbuzz-shaped with kerning).

**House rules for the code:**
- No comments anywhere, including snippets copied from this brief.
- Restyle what exists rather than writing parallel versions: `Button`, `Field`, `Select`, `Choice`, `Plate` (becomes `Tag`), `Chip`, `Tabs`, `Accordion`, `Dialog`, `Stepper`, `Pagination`, `Alert`, `EmptyState`, `ConfirmDialog`, `PriceDisplay`, `QuantitySelector`, `Breadcrumbs`, `PaymentLogos`, `CartProvider`, `CurrencyProvider`, `ThemeProvider`, the motion engine and ticker in `src/lib/motion`, `pageMetadata`, `JsonLd`, `POLICY_FACTS`, `STORE_POLICY`, `COMPANY`, `BRAND`, the theater engine.
- `Dial.tsx`, `Tumbler.tsx`, `Lamp.tsx`, `ReadoutLoader.tsx` are deleted once their consumers use the new primitives (§8): `Flap`, `FlapRow`, `FlapLoader`, `PlatformTile`, `RouteLine`, `Remark`.
- Tokens only. No hex or rgba in components, theater scenes, sample covers or SVG motifs (use `currentColor` and CSS variables). The two exceptions are `src/lib/email.ts` and `src/lib/invoice.ts`, which cannot read CSS.
- Copy lives in `messages/en/*.json` by namespace. Numbers, timings and policy facts come from `STORE_POLICY` / `POLICY_FACTS`. Merchandising numbers come from `src/config/merchandising.ts` and `src/config/catalog.ts`.

---

## 1. Direction

### 1.1 Concept statement
Keyterminus is a departures hall. The catalogue is a split-flap board: every key is a departure with a price, a destination (the game), a platform (Steam, Xbox, PlayStation…) and a remark. Buying one is boarding: you check in a key, you pay, and your key **departs** for your account — on the board in your account its characters flip into place, one flap at a time. Redeeming it on the platform is the arrival.

The interface is the hall around the board: a warm white concourse, clear wayfinding signage set in a highway-signage grotesk, numbered platform signs, timetable rows, a route diagram for genres, and one graphite object that never changes colour between day and night — the board. Mustard is the colour of the board's remarks and of the one thing you should do next. Cover art is the colour of the store everywhere else.

The visitor should feel they are reading a well-run station: every key has a clear platform and region before they pay, the next step is always signed, and nothing is announced that the board can't back up.

The name carries it: a **terminus** is where every line ends and every journey starts. **Key + terminus** is the station all keys leave from. The mark (§9) is a key drawn as a route-map line that ends at a terminus bar.

### 1.2 What carries colour, what stays quiet
- **Cover art carries the colour.** Covers are never tinted, washed, blurred, duotoned, overlaid or cropped into shapes.
- **Graphite is the board.** The board family (`--color-board`, `--color-flap`, `--color-hinge`) is identical in both themes. It belongs to: the hero board, flap tiles (platform numbers, counts, the deal tile, key characters), the gate strip on departure cards, the key board in the account, the theater housing, the information strip above the header, and the mini-boards in set-pieces. It is an *object*, never a page background except the hero hall and the information strip.
- **Mustard has two jobs and only two:**
  1. **Action fill** — the primary button (one per viewport region), checked checkboxes/radios/switches, the current station on route lines (checkout, order timeline), the active 3px bar under tabs/nav, text selection.
  2. **Remark ink on the board** — the REMARKS column of any board, deal tiles (`NOW −18%`), the terminus bar in the logo and on route lines.

  On page surfaces mustard is never used as text colour except `--color-accent-ink` (a deep ochre in Day) for small active labels. It never fills a section, never sets a heading, never marks an error.
- **Platforms carry no colour.** A platform is a number on a flap tile plus its name in words (`[1] Steam`). No brand colours, no pips.
- **Types carry no colour.** "DLC", "Gift card", "Subscription" are words in a quiet tag.
- **Deals carry no red and no green.** A deal is the graphite deal tile with mustard remark text and the struck "was" price in faint text.
- **Semantic colours** (success, warning, danger, info) appear only in status contexts, always with an icon and a word.

### 1.3 Signature motifs (repeat with discipline, §10)
1. **The split flap.** A graphite tile with a 2px radius and a horizontal hinge gap across its middle; one character per tile; it changes by flipping its top half down. Used for: the hero board (WebGL), platform numbers, the cart count, the order number, the key in the account, the deal tile, the 404, the theater tabs board, and mini-boards. A row of flaps is a **board row**.
2. **The route line.** A 3px ink line with circular stops and a mustard **terminus bar** at its end. Used for: genre routes on home, checkout and registration progress, the order timeline, the "through the gate" payment diagram, and the footer's platform line. It is the logo's own geometry, so the brand repeats itself every time a line ends.
3. **Wayfinding signage.** Numbered platform signs (`[3] PlayStation`), uppercase tracked sign labels, and big block arrows (`ArrowBigRight`) on directional links ("All 4,212 →"). This is the label system rather than a separate motif, but it must be consistent: one sign label style, one arrow, one platform tile.

Nothing else is decoration. No clocks that tell invented times, no fake departure times, no ticker, no airport/plane clip-art, no barcodes or QR codes as ornament.

### 1.4 Moods per theme
- **Day concourse (light, default).** A station hall in daylight: warm white floor (`#F4F1EA`), slightly darker bands for alternating sections, near-white panels for inputs and cards, a graphite board hanging in it. Ink is a warm graphite black. Mustard is a fill with ink text; mustard as text becomes deep ochre `#7A5800`.
- **Night concourse (dark).** The same hall after dark: near-black floor `#121314` (neutral-warm, never blue, never navy), panels one step lighter, ink becomes warm paper white `#EEE9DE`. The board stays exactly the same graphite, so at night it reads as the brightest object in the room; its 1px `--color-board-edge` keeps it separated from the floor. Mustard lifts to `#E6B84A` and becomes usable as text.

`:root` holds **Day**. `[data-theme="dark"]` overrides with **Night**. `ThemeScript`: stored value wins; otherwise `prefers-color-scheme`; otherwise light. Keyrook defaulted to dark and used `[data-theme="light"]` overrides — flip that structure.

### 1.5 Divergence audit (must hold on every page)
| Axis | Keyterminus "Departure Board" | Keyrook "Vault Run" | Fablekeys "Paper Theatre" | Inspection Bay (Patinaskins) | Others |
|---|---|---|---|---|---|
| Base | warm white `#F4F1EA` light-first; neutral-warm night `#121314`; graphite board object in both | blued gunmetal dark-first; satin nickel | laid cream; umber | neutral graphite `#121315` page, dark-first | Console Deck ice glass; Midnight Arcade violet; Cartridge Club cream `#FFFCF5`; Chipwave porcelain+lime; Aurora polar night |
| Accent | mustard `#E2AE2F` / `#E6B84A` (hue ≈43°), action fill + board remarks | signal green | vermilion + teal | amber `#F39A2E` (hue ≈33°, orange) on graphite pages | signal blue; cyan+amber; orange+yellow; lime |
| Type | Overpass (Highway Gothic lineage) for signage and text + Sometype Mono for flaps, prices, keys | Hubot + Mona + Red Hat Mono | Fraunces + Alegreya Sans + Atkinson Mono | Sofia Sans Condensed + Source Sans 3 + Martian Mono | Manrope/Inter; Anton/Archivo; Space Grotesk/Silkscreen; Gloock/Commissioner |
| Geometry | mixed: 0px bands; 2px flap tiles with hinge gap; 4px sign plates; 6px controls; 8px cards; 10px board housings; circles only for route stops, radios, play | 0px + round hardware | 0px sheets, 3px controls, 2px tags | 2px controls, 4px trays | glass, rounded cards, pills |
| Depth | flat; depth only from the board (hinge shading) and overlays | machined inset edges | paper shadows | lamp pool | glass, offset shadows |
| Signature | split flap, route line + terminus bar, numbered platform signs | dial, tumblers, bolts | paper layers, chapters, ribbon, seal | lamp, rarity spine, float ruler | stickers, tapes, title blocks, pad grid, starfield |
| Cart glyph | `Ticket` + "Cart" | `Archive` | `Backpack` | `ShoppingCart` | `Handbag` |
| Header | 32px graphite information strip + one 64px concourse bar | two steel tiers | one running-head bar + double rule | one dark rig | glass bar |
| Footer | light (theme-following) concourse band; the platform line with stops ends at a terminus bar; "Company notice" sign | gunmetal vault floor, bolted plate | dark book-cloth colophon | ruler band | chocolate plinth |
| Product card | departure card: graphite gate strip on top (platform tile + platform + region), 3:4 cover, Overpass title, mono price | steel deposit box, drawer pull | paper sheet with tipped-in mount, ribbon | tray with spine | glass tile, 8:7 card |
| Home opener | full-bleed graphite hall: H1 over a WebGL split-flap board of real keys that also flips to your search results | pinned WebGL vault door | paper theatre stage | inspection bay | shop wall |
| Default sort | "Board order": departure score interleaved across platforms (§18) | most ordered | story picks | — | — |

**Banned here** (owned by a sibling, or generic):
- everything listed in the preamble;
- amber-orange accents, graphite *pages* in the light theme (Inspection Bay is a graphite page; ours is a graphite *object* on warm white);
- terminal or hacker cues: green or amber text on black paragraphs, blinking cursors, a "|" caret after the wordmark, scanlines, matrix rain, mono sentences;
- airport clichés: plane icons, boarding-pass barcodes, QR codes, "Gate closing" countdowns, fake departure times, world clocks, globe spinners;
- tickers and marquees (Drop District), sticker badges, rotated tags, stamps;
- glass, backdrop blur, blurred cover backdrops, gradients as decoration, glow, mesh, neon;
- pills (fully rounded rectangles) anywhere.

---

## 2. Token plumbing

### 2.1 Where tokens live
- `src/styles/variables.css`: every CSS custom property (colour, radius, shadow, fonts, motion, layout). `:root` = Day, `[data-theme="dark"]` = Night.
- `src/styles/globals.css`: the Tailwind v4 `@theme inline` block. Tailwind compiles from this block only.
- `tailwind.config.ts`: mirror the aliases for tools that read it.
- `ThemeScript`: sets `data-theme="light|dark"` and the `dark` class before paint (§1.4 order). `@custom-variant dark ([data-theme="dark"] &)` stays.

### 2.2 Keep existing alias names, change what they point to
The storefront compiles against Keyrook's aliases. Keep names on day one, change values, then retire Vault Run-only names in the sweep (§2.5).

| Existing variable | Utility alias | New meaning |
|---|---|---|
| `--color-bg` | `bg-surface` | concourse floor (page canvas) |
| `--color-bg-secondary` | `bg-surface-1` | band (alternating sections, disabled fills, footer) |
| `--color-bg-tertiary` | `bg-surface-2` | inset (skeleton fills, quantity well, table heads) |
| `--color-bg-warm` | `bg-surface-warm` | → `var(--color-accent-light)` (mustard-tinted note box) |
| `--color-raised` | `bg-raised` | panel: inputs, cards, popovers, drawers, dialogs |
| `--color-plate` | `bg-plate` | → `var(--color-raised)`; rename uses to `bg-raised`, then delete |
| `--color-stage` | `bg-stage` | cover stage (behind every cover) |
| `--color-on-stage` | `text-on-stage` | = ink |
| `--color-surface-dark` | — | → `var(--color-board)` |
| `--color-rig` | `bg-rig` | header concourse bar (= `--color-bg` in both themes) |
| `--color-floor` | `bg-floor` | footer (= `--color-bg-secondary`) |
| `--color-text` | `text-ink` | ink |
| `--color-text-secondary` | `text-ink-muted` | muted ink |
| `--color-text-tertiary` | `text-ink-subtle` | faint ink (≥4.5:1 everywhere text may sit) |
| `--color-accent` | `bg-brand`, `border-brand` | mustard fill |
| `--color-accent-hover` | `bg-brand-hover` | mustard hover |
| `--color-accent-light` | `bg-brand-soft` | mustard tint for selected rows and the note box |
| `--color-on-accent` | `text-on-brand` | text on mustard (ink in both themes) |
| `--color-accent-ink` | `text-accent-ink` | mustard as text (deep ochre in Day) |
| `--color-accent-edge` | `border-accent-edge` | 1px edge on mustard fills in Day |
| `--color-accent-2` | `bg-brand-2` | → `var(--color-board)` |
| `--color-accent-3` | `text-sale` | → `var(--color-text)` (deals are a flap tile, §8.12) |
| `--color-rule` | `border-rule`, `bg-rule` | strong 1px rule (table heads, route line rest colour on bands) |
| `--color-border` | `border-line` | hairline |
| `--color-border-hover` | `border-line-hover` | stronger hairline |
| `--color-border-control` | `border-control` | control borders (≥3:1) |
| `--color-focus` | `outline-focus` | focus ring (ink in Day, mustard in Night) |
| `--color-deal`, `--color-on-deal` | `bg-deal`, `text-on-deal` | → `var(--color-flap)` / `var(--color-remark)` |
| `--color-logo-strip` | `bg-logo-strip` | white strip behind payment logos, both themes |
| `--radius-*` | `rounded-*` | new scale (§5.3) |
| `--shadow-*` | `shadow-*` | new elevation (§5.5) |
| `--color-plate`, `--color-steel-hi`, `--color-lamp-on/off`, `--steel-grain`, `--edge-machined*`, `--engrave`, `--bolt`, `--platform*`, `--type*` | | **delete** after the sweep |
| `--z-box-item` | | rename `--z-card-item` (same value) |

### 2.3 New names (add to `variables.css` and `@theme inline`)
| Variable | Utility | Job |
|---|---|---|
| `--color-board` | `bg-board` | graphite board housing, gate strips, info strip, key board |
| `--color-flap` | `bg-flap` | flap face (one step lighter than the board) |
| `--color-flap-top` | `bg-flap-top` | top half of a flap (a hair lighter than the bottom; flat, no gradient) |
| `--color-hinge` | `bg-hinge`, `border-hinge` | the hinge gap and housing seams |
| `--color-board-edge` | `border-board-edge` | 1px edge round board objects (matters at Night) |
| `--color-on-board` | `text-on-board` | flap characters and board text |
| `--color-on-board-muted` | `text-on-board-muted` | secondary board text, column heads |
| `--color-on-board-faint` | `text-on-board-faint` | board captions (never on flap faces) |
| `--color-remark` | `text-remark`, `bg-remark` | mustard remark ink on the board |
| `--color-board-success` / `-warning` / `-danger` / `-info` | `text-board-*` | statuses on the board (key board) |
| `--color-focus-on-board` | `outline-focus-board` | focus ring on board surfaces (mustard in both themes) |
| `--color-link-line` | `decoration-link` | underline colour of text links |
| `--color-scrim` | `bg-scrim` | modal backdrop (no blur) |
| `--color-stop` | `bg-stop`, `border-stop` | route line and stop stroke (= ink) |
| `--color-terminus` | `bg-terminus` | the terminus bar (= remark mustard, both themes) |
| `--radius-flap`, `--radius-sign`, `--radius-control`, `--radius-card`, `--radius-board`, `--radius-round` | `rounded-flap`, `rounded-sign`, `rounded-control`, `rounded-card`, `rounded-board`, `rounded-round` | §5.3 |
| `--shadow-overlay`, `--shadow-panel`, `--shadow-panel-left`, `--shadow-flap` | `shadow-overlay`, … | §5.5 |

```css
@theme inline {
  --color-board: var(--color-board);
  --color-flap: var(--color-flap);
  --color-flap-top: var(--color-flap-top);
  --color-hinge: var(--color-hinge);
  --color-board-edge: var(--color-board-edge);
  --color-on-board: var(--color-on-board);
  --color-on-board-muted: var(--color-on-board-muted);
  --color-on-board-faint: var(--color-on-board-faint);
  --color-remark: var(--color-remark);
  --color-board-success: var(--color-board-success);
  --color-board-warning: var(--color-board-warning);
  --color-board-danger: var(--color-board-danger);
  --color-board-info: var(--color-board-info);
  --color-focus-board: var(--color-focus-on-board);
  --color-link: var(--color-link-line);
  --color-stop: var(--color-stop);
  --color-terminus: var(--color-terminus);
  --color-logo-strip: var(--color-logo-strip);
  --radius-flap: var(--radius-flap);
  --radius-sign: var(--radius-sign);
  --radius-control: var(--radius-control);
  --radius-card: var(--radius-card);
  --radius-board: var(--radius-board);
  --radius-round: 50%;
  --shadow-overlay: var(--shadow-overlay);
  --shadow-flap: var(--shadow-flap);
  --ease-flap: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-sign: cubic-bezier(0.2, 0, 0, 1);
}
```

### 2.4 Platforms are numbers and words, never colours
- `src/config/merchandising.ts` gets `PLATFORM_BOARD`: a fixed, ordered list that assigns each platform its **platform number** and its board label:

  | No. | Platform key | Name (UI) | Board label (flaps, ≤11 chars) |
  |---|---|---|---|
  | 1 | `steam` | Steam | `STEAM` |
  | 2 | `xbox` | Xbox | `XBOX` |
  | 3 | `playstation` | PlayStation | `PLAYSTATION` |
  | 4 | `nintendo` | Nintendo | `NINTENDO` |
  | 5 | `epic` | Epic Games | `EPIC GAMES` |
  | 6 | `gog` | GOG | `GOG` |
  | 7 | `ea-app` | EA app | `EA APP` |
  | 8 | `ubisoft-connect` | Ubisoft Connect | `UBISOFT` |
  | 9 | `battle-net` | Battle.net | `BATTLE.NET` |
  | 10 | `rockstar` | Rockstar | `ROCKSTAR` |
  | — | `other` | the raw supplier label | `OTHER` |

- Numbers are fixed (a platform keeps its number even when it has no stock and is hidden), exactly like real stations. They are wayfinding, not data: never show "Platform 3" without the name beside it.
- `platformInfo()` in `src/lib/catalog/platforms.ts` gains `number` and `boardLabel`; delete `tone`. Delete `TYPE_TONE`.
- Remove every `[data-platform]` / `[data-type]` colour rule.

### 2.5 Mandatory sweeps
1. **Vault Run out.** Delete or rebuild: `src/components/home/*` (all, rebuilt per §14.1), `src/components/layout/Header/VaultMap.tsx` (→ `ConcourseMap.tsx`), `Dial`, `Tumbler`, `Lamp`, `ReadoutLoader`, the motion scenes `door/*`, `door-ajar`, `ledger`, `releases`, `tumblers`, `index-slide`, `src/components/catalog/ReleaseRuler.tsx`. Keep `lamp-gl`-era scaffold patterns now living in `src/lib/motion/door/controller.ts` (context loss, DPR cap, idle boot, pause on hidden) as the starting point for the board scene, then delete the door.
2. **Tokens out.** Remove steel grain, machined edges, engrave, bolt, lamp, platform and type colour tokens and their `@theme` aliases once nothing references them.
3. **Radius in.** Replace every `rounded-none` / implicit 0px on controls and cards with the role tokens (§5.3).
4. **Text on mustard.** Every `text-white` or `#fff` on `bg-brand` becomes `text-on-brand` (ink in both themes).
5. **Hex hunt.** No hex or rgba in storefront components, `BrandMark.tsx`, home components, theater scenes or `SampleCover`.
6. **Copy hunt.** Grep and remove: `Keyrook`, `keyrook`, `KR-`, `vault`, `Vault`, `dial`, `tumbler`, `lamp`, `bolt`, `steel`, `Strongroom`, `Counter Hall`, `door`, `locker`, `Pinned`, `pin` (as save), `Lantern Coast`, `Ironvale`, `Night Ferry`, `Saltmarsh`, `Orbit Freight`, `Hollowstone`, `Brasmora`, `Patinaskins`. Sample titles shared with siblings are replaced (§12.3).
7. **Brand.** `BRAND = { name: "Keyterminus", domain: "keyterminus.com", tagline: "Game keys for every platform, delivered to your account" }`. Order prefix and SKU prefix `KT-`. Consent storage key `keyterminus-consent`. Theme storage key and every other `keyrook-*` localStorage key become `keyterminus-*` (update the Cookie Policy table).

---

## 3. Colour tokens

### 3.1 `src/styles/variables.css` — replace the colour, shadow, radius, font, layout and motion parts with this

```css
:root {
  --color-primary: #1b1c1d;
  --color-secondary: #fcfbf7;

  --color-bg: #f4f1ea;
  --color-bg-secondary: #eae5da;
  --color-bg-tertiary: #e0dacd;
  --color-raised: #fcfbf7;
  --color-plate: var(--color-raised);
  --color-stage: #dcd6c9;
  --color-on-stage: #1b1c1d;
  --color-rig: var(--color-bg);
  --color-floor: var(--color-bg-secondary);

  --color-text: #1b1c1d;
  --color-text-secondary: #4b4842;
  --color-text-tertiary: #5d5951;

  --color-accent: #e2ae2f;
  --color-accent-hover: #d29d1a;
  --color-accent-light: #f5e6bd;
  --color-on-accent: #1b1c1d;
  --color-accent-ink: #7a5800;
  --color-accent-edge: #9c7612;
  --color-bg-warm: var(--color-accent-light);
  --color-link-line: #9c7612;

  --color-board: #222426;
  --color-flap: #2b2e31;
  --color-flap-top: #2e3134;
  --color-hinge: #0e0f10;
  --color-board-edge: #3a3d41;
  --color-on-board: #f2ede1;
  --color-on-board-muted: #b0aba0;
  --color-on-board-faint: #9b978e;
  --color-remark: #e9bb45;
  --color-terminus: var(--color-remark);
  --color-board-success: #8ccb97;
  --color-board-warning: #f2a766;
  --color-board-danger: #ff8c7e;
  --color-board-info: #9cc3dd;
  --color-focus-on-board: #e6b84a;
  --color-surface-dark: var(--color-board);
  --color-accent-2: var(--color-board);
  --color-accent-3: var(--color-text);
  --color-deal: var(--color-flap);
  --color-on-deal: var(--color-remark);
  --color-logo-strip: #ffffff;
  --color-stop: var(--color-text);

  --color-rule: #b5ae9f;
  --color-border: #d6d0c3;
  --color-border-hover: #b5ae9f;
  --color-border-control: #7c766b;
  --color-focus: #1b1c1d;

  --color-success: #2c6a3a;
  --color-success-tint: #dce9da;
  --color-warning: #9a4a0a;
  --color-warning-tint: #f6e2cf;
  --color-danger: #b02a1f;
  --color-danger-tint: #f6dcd6;
  --color-on-danger: #ffffff;
  --color-info: #2c5a78;
  --color-info-tint: #dce6ec;

  --color-scrim: rgb(27 28 29 / 0.5);

  --shadow-sm: none;
  --shadow-md: none;
  --shadow-card: none;
  --shadow-card-hover: 0 0 0 1px var(--color-border-hover);
  --shadow-flap: inset 0 -1px 0 rgb(0 0 0 / 0.35);
  --shadow-overlay: 0 0 0 1px var(--color-border), 0 18px 40px -18px rgb(27 28 29 / 0.32);
  --shadow-lg: var(--shadow-overlay);
  --shadow-xl: 0 0 0 1px var(--color-border), 0 28px 60px -24px rgb(27 28 29 / 0.38);
  --shadow-accent: 0 0 0 2px var(--color-focus);
  --shadow-panel: -1px 0 0 var(--color-border), -24px 0 48px -24px rgb(27 28 29 / 0.3);
  --shadow-panel-left: 1px 0 0 var(--color-border), 24px 0 48px -24px rgb(27 28 29 / 0.3);

  --radius-flap: 2px;
  --radius-sign: 4px;
  --radius-control: 6px;
  --radius-card: 8px;
  --radius-board: 10px;
  --radius-tray: var(--radius-card);
  --radius-sm: var(--radius-sign);
  --radius-md: var(--radius-control);
  --radius-lg: var(--radius-card);
  --radius-xl: var(--radius-board);
  --radius-2xl: var(--radius-board);
  --radius-pill: var(--radius-control);

  --max-width: 1360px;
  --strip-height: 32px;
  --bar-height: 64px;
  --header-height: 96px;
  --header-height-compact: 64px;
  --header-height-mobile: 56px;
  --gutter: 16px;

  --z-base: 0;
  --z-card-item: 1;
  --z-sticky: 40;
  --z-dropdown: 50;
  --z-drawer: 60;
  --z-modal: 70;
  --z-toast: 80;
  --z-cookie: 90;

  --font-sans: var(--font-overpass), "Overpass Variable", "Overpass Fallback", Arial, sans-serif;
  --font-display: var(--font-overpass), "Overpass Variable", "Overpass Display Fallback", Arial, sans-serif;
  --font-mono: var(--font-sometype), "Sometype Mono Variable", "Sometype Fallback", ui-monospace, Menlo, Consolas, monospace;

  --ease-flap: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-sign: cubic-bezier(0.2, 0, 0, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-std: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);
  --dur-micro: 120ms;
  --dur-ui: 180ms;
  --dur-panel: 240ms;
  --dur-panel-close: 180ms;
  --dur-flap: 70ms;
  --dur-reveal: 560ms;
  --dur-reduced: 100ms;

  --selection-bg: #e2ae2f;
  --selection-fg: #1b1c1d;

  color-scheme: light;
}

@media (min-width: 640px) {
  :root {
    --gutter: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --gutter: 40px;
  }
}

[data-theme="dark"] {
  --color-primary: #eee9de;
  --color-secondary: #1b1d1f;

  --color-bg: #121314;
  --color-bg-secondary: #17181a;
  --color-bg-tertiary: #0c0d0e;
  --color-raised: #1b1d1f;
  --color-stage: #0e0f10;
  --color-on-stage: #eee9de;

  --color-text: #eee9de;
  --color-text-secondary: #b4aea3;
  --color-text-tertiary: #979187;

  --color-accent: #e6b84a;
  --color-accent-hover: #f0c866;
  --color-accent-light: #2c2616;
  --color-on-accent: #17150f;
  --color-accent-ink: #e6b84a;
  --color-accent-edge: #e6b84a;
  --color-link-line: #e6b84a;

  --color-rule: #3a3d40;
  --color-border: #2a2c2f;
  --color-border-hover: #3a3d40;
  --color-border-control: #77736b;
  --color-focus: #e6b84a;

  --color-success: #8ccb97;
  --color-success-tint: #16241a;
  --color-warning: #f2a766;
  --color-warning-tint: #2b1e12;
  --color-danger: #ff8c7e;
  --color-danger-tint: #2e1916;
  --color-on-danger: #170807;
  --color-info: #9cc3dd;
  --color-info-tint: #142029;

  --color-scrim: rgb(5 5 6 / 0.72);

  --shadow-overlay: 0 0 0 1px var(--color-border-hover), 0 22px 48px -20px rgb(0 0 0 / 0.8);
  --shadow-xl: 0 0 0 1px var(--color-border-hover), 0 32px 64px -24px rgb(0 0 0 / 0.85);
  --shadow-panel: -1px 0 0 var(--color-border-hover), -24px 0 48px -24px rgb(0 0 0 / 0.8);
  --shadow-panel-left: 1px 0 0 var(--color-border-hover), 24px 0 48px -24px rgb(0 0 0 / 0.8);

  --selection-bg: #e6b84a;
  --selection-fg: #17150f;

  color-scheme: dark;
}

::selection {
  background: var(--selection-bg);
  color: var(--selection-fg);
}
```

The board family (`--color-board` … `--color-focus-on-board`, `--color-remark`, `--color-terminus`) is deliberately **not** overridden in Night: the board is the same object in both themes.

### 3.2 Measured contrast
WCAG 2.x relative-luminance ratios (sRGB linearisation, `(L1 + 0.05) / (L2 + 0.05)`), computed by script for these exact hex pairs. Text needs 4.5:1; non-text UI (control borders, focus rings, fills that identify a control) needs 3:1. Re-measure the same way after any token change.

| Kind | Pair | Day (light) | Night (dark) |
|---|---|---|---|
| Text | `ink` on `bg` | 15.13 | 15.36 |
| Text | `ink` on `band` | 13.59 | 14.67 |
| Text | `ink` on `raised` | 16.48 | 13.96 |
| Text | `ink` on `inset` | 12.26 | 16.07 |
| Text | `ink` on `stage` | 11.79 | 15.85 |
| Text | `ink` on `accent-light` (selected rows) | 13.76 | 12.43 |
| Text | `muted` on `bg` | 8.08 | 8.44 |
| Text | `muted` on `band` | 7.25 | 8.06 |
| Text | `muted` on `raised` | 8.80 | 7.67 |
| Text | `muted` on `inset` | 6.54 | 8.82 |
| Text | `muted` on `stage` | 6.29 | 8.70 |
| Text | `muted` on `accent-light` | 7.35 | 6.82 |
| Text | `faint` on `bg` | 6.18 | 5.95 |
| Text | `faint` on `band` | 5.55 | 5.68 |
| Text | `faint` on `raised` | 6.73 | 5.41 |
| Text | `faint` on `inset` | 5.00 | 6.22 |
| Text | `faint` on `stage` | 4.81 | 6.14 |
| Text | `on-accent` on `accent` (primary button) | 8.39 | 9.84 |
| Text | `on-accent` on `accent-hover` | 6.97 | 11.44 |
| Text | `accent-ink` on `bg` (active labels) | 5.78 | 10.03 |
| Text | `accent-ink` on `band` | 5.19 | 9.58 |
| Text | `accent-ink` on `raised` | 6.29 | 9.11 |
| Text | `accent-ink` on `accent-light` | 5.25 | 8.11 |
| Text | `success` on `bg` | 5.76 | 9.84 |
| Text | `success` on `success-tint` | 5.17 | 8.53 |
| Text | `warning` on `bg` | 5.54 | 9.30 |
| Text | `warning` on `warning-tint` | 4.97 | 8.09 |
| Text | `danger` on `bg` | 5.82 | 8.24 |
| Text | `danger` on `raised` | 6.34 | 7.49 |
| Text | `danger` on `danger-tint` | 5.04 | 7.34 |
| Text | `on-danger` on `danger` | 6.57 | 8.66 |
| Text | `info` on `bg` | 6.55 | 9.98 |
| Text | `info` on `info-tint` | 5.83 | 8.88 |
| Text | link (`ink` text, underline `link-line`) on `bg` | 15.13 | 15.36 |
| UI | `accent` fill on `bg` | 1.80 | 10.03 |
| UI | `accent-edge` (button edge, link underline) on `bg` | 3.71 | 10.03 |
| UI | `accent-edge` on `raised` | 4.05 | 9.11 |
| UI | `control` border on `bg` | 3.99 | 3.94 |
| UI | `control` on `band` | 3.59 | 3.76 |
| UI | `control` on `raised` | 4.35 | 3.58 |
| UI | `control` on `inset` | 3.24 | 4.12 |
| UI | `focus` ring on `bg` | 15.13 | 10.03 |
| UI | `focus` on `band` | 13.59 | 9.58 |
| UI | `focus` on `raised` | 16.48 | 9.11 |
| UI | `focus` on `stage` | 11.79 | 10.34 |

| Kind | Pair on the board (identical in both themes) | Ratio |
|---|---|---|
| Text | `on-board` on `board` | 13.33 |
| Text | `on-board` on `flap` (flap characters) | 11.69 |
| Text | `on-board-muted` on `board` | 6.81 |
| Text | `on-board-muted` on `flap` | 5.97 |
| Text | `on-board-faint` on `board` (captions only, never on flaps) | 5.35 |
| Text | `remark` on `board` | 8.65 |
| Text | `remark` on `flap` (deal tile, remark flaps) | 7.58 |
| Text | `board-success` on `board` | 8.24 |
| Text | `board-warning` on `board` | 7.78 |
| Text | `board-danger` on `board` | 6.90 |
| Text | `board-info` on `board` | 8.35 |
| Text | Night `on-accent` on Night `accent` (mustard button placed on the board, both themes) | 9.84 |
| UI | `focus-on-board` / mustard button fill on `board` | 8.40 |
| UI | `remark` on `flap` | 7.58 |

Consequences you must honour:
- **Mustard fill in Day is 1.80:1 against the floor**, so every mustard-filled control in Day carries a 1px `--color-accent-edge` border (3.71:1). Its label (8.39:1) also identifies it.
- **Focus ring around a mustard button in Night** would be mustard on mustard; the ring always sits at a 2px offset, so it is measured against the floor (10.03:1).
- **On board surfaces** (hero, gate strips, key board, info strip, theater housing) the focus ring is `--color-focus-on-board` in both themes, and a mustard button on the board uses the Night accent pair: set `--color-accent: #e6b84a` and `--color-on-accent: #17150f` on `[data-surface="board"]` so buttons there look right in Day too. In Day the board is 13.81:1 against the floor; in Night only 1.19:1, which is why board objects carry the 1px `--color-board-edge` (decorative; the board is not a control).
- `--color-on-board-faint` fails on flap faces (4.02:1) and is therefore never set on a flap.

### 3.3 Colour rules
- **Mustard appears only as:** the primary button fill; checked controls; the current stop on a route line; the 3px active bar under nav, tabs and filter headers; the terminus bar; board remarks and the deal tile text; selection; the Night focus ring. Count non-button mustard elements in any viewport: more than four outside the board means remove some.
- **Graphite board surfaces appear only as listed in §1.2.** A section background may be graphite only for the hero hall.
- **Semantic colours** never appear on product cards, so danger and the deal tile never meet. On the board use `--color-board-*`.
- **Deals:** deal tile (§8.12) + struck "was" in `--color-text-tertiary`. Never red, never green, never mustard text on the floor.
- **Hairlines** are decorative and never the only boundary of a control; controls use `--color-border-control`.
- **Links in prose:** ink text, 2px underline in `--color-link-line` at 3px offset; hover: text `--color-accent-ink`, underline 3px. Links are identified by the underline, never by colour alone.
- **No gradients at all.** Flap halves are two flat colours; there is no gradient token in this system.

---

## 4. Typography

### 4.1 Packages and loading
Verified with `npm view` on 2026-10-07 (all 5.3.0) and inspected with fontTools/harfbuzz in the latin subsets:

- **`@fontsource-variable/overpass`: signage, headings and body.** Axis `wght` 100–900 (+ italic file). 2000 upm, cap height 0.70, x-height 0.511, `USE_TYPO_METRICS` on (ascender 0.883, descender 0.383, no line gap). Has `tnum`, `pnum`, `kern`.
  - Why: Overpass is the open-source descendant of **Highway Gothic / Interstate**, the US road-signage alphabet. Its squared rounds, flat terminals and open apertures read as wayfinding at sign sizes (800–900, tight tracking) and stay calm at 16px body (400).
  - **One family for signage and text is the point.** Transport systems standardise on one typeface family for every sign, timetable and notice; the hall's hierarchy comes from weight (400 → 900), case (sign labels uppercase, headings sentence case), tracking and placement, not from a second sans. (The master's "pair by contrast" is met by the mono below.)
- **`@fontsource-variable/sometype-mono`: the flap voice.** Axis `wght` 400–700. 1000 upm, advance 0.58em, cap 0.65, x-height 0.47.
  - Why: a sturdy, slightly typewriter-humanist mono that holds up as white characters on graphite flaps; its **zero is slashed** and `1 I l` are fully distinct (rendered and checked), which matters for keys. It is less associated with code editors than Inconsolata, JetBrains or Fira, which keeps the board from reading as a terminal (the name "Keyterminus" invites that misreading).
  - Used for: flap characters, prices, counts, order numbers, keys, dates, durations. Never for sentences.
- Rejected after rendering: B612 Mono (Airbus cockpit face, but its 0 and O are nearly identical at 700); Overpass Mono (dotted zero, and Red Hat lineage sits too close to Keyrook's Red Hat Mono); DM Mono (no weight above 500); Fragment Mono (single weight); Inconsolata (code-editor association); Big Shoulders Display and Barlow Semi Condensed (condensed poster grotesks read like Anton and Sofia Sans Condensed, owned by siblings); Signika (too soft for the board); Public Sans, Instrument Sans, Schibsted, Hanken (neutral, no signage lineage). Excluded by the owner: Commissioner, Gloock, Martian Mono, Sofia Sans Condensed, Source Sans 3, Hubot Sans, Mona Sans, Red Hat Mono, Atkinson Hyperlegible Mono, Fraunces, Alegreya Sans, Inter, Roboto. Also avoided: Manrope, Space Grotesk, Anton, Archivo, JetBrains Mono, Silkscreen, Karla, Bricolage.

**Install:** `@fontsource-variable/overpass`, `@fontsource-variable/sometype-mono`, plus the static `@fontsource/overpass` (400, 700, 800) and `@fontsource/sometype-mono` (500, 600) for the PDF invoice (both verified 5.3.0).
**Uninstall:** `@fontsource-variable/hubot-sans`, `@fontsource-variable/mona-sans`, `@fontsource-variable/red-hat-mono`, `@fontsource/mona-sans`, `@fontsource/red-hat-mono`. Delete Keyrook's files in `public/fonts/`.

`src/app/layout.tsx` imports:
```ts
import "@fontsource-variable/overpass/wght.css";
import "@fontsource-variable/sometype-mono/wght.css";
import "./fonts.css";
```
- Latin files: Overpass `wght` normal 39 KB, Sometype Mono 17 KB. Do not import the Overpass italic file; nothing is set in italic.
- Preload only `overpass-latin-wght-normal.woff2` (copy to `public/fonts/overpass-latin-wght-normal.woff2`): it sets the hero H1, the LCP element.

`src/app/fonts.css`:
```css
:root {
  --font-overpass: "Overpass Variable";
  --font-sometype: "Sometype Mono Variable";
}

@font-face {
  font-family: "Overpass Fallback";
  src: local("Arial"), local("Liberation Sans"), local("Helvetica");
  size-adjust: 99.2%;
  ascent-override: 89%;
  descent-override: 38.6%;
  line-gap-override: 0%;
}

@font-face {
  font-family: "Overpass Display Fallback";
  src: local("Arial Bold"), local("Liberation Sans Bold"), local("Arial"), local("Liberation Sans");
  size-adjust: 99.1%;
  ascent-override: 89.1%;
  descent-override: 38.6%;
  line-gap-override: 0%;
}

@font-face {
  font-family: "Sometype Fallback";
  src: local("Menlo"), local("Liberation Mono"), local("DejaVu Sans Mono"), local("Consolas");
  size-adjust: 96.7%;
  ascent-override: 95.7%;
  descent-override: 28.4%;
  line-gap-override: 0%;
}
```
The overrides come from measured averages on a mixed sentence: Overpass 400 0.4486em vs Liberation Sans 0.4521; Overpass 800 0.4783 vs Liberation Sans Bold 0.4824; Sometype 0.580 vs Liberation Mono 0.600. Tune in Playwright until swapping shifts the H1, a body paragraph and a price by <2px.

**Weights:**
- Overpass: 400 body; 600 UI labels, form labels, emphasis; 700 buttons, nav, card titles, sign labels, H3; 800 H2, wordmark, platform names on signs; 900 hero H1 and display numerals only.
- Sometype Mono: 400 readouts (dates, IDs); 500 keys and order numbers; 600 prices and flap characters; 700 hero flaps only.

`font-synthesis: none` globally. Numbers in Overpass tables use `font-variant-numeric: tabular-nums`. Keys: `font-feature-settings: "calt" 0; font-variant-ligatures: none` (Sometype has `calt`).

**Glyph coverage** (checked): neither family has `→ ↗ ✓ ★ №`. Arrows are Lucide (`ArrowBigRight`, `MoveUpRight`), ticks Lucide `Check`, and "No." replaces `№`. `· – — − × € £ … ` and non-breaking space exist in both.

**PDF invoices** (`src/lib/invoice.ts`): body Overpass 400/700; invoice number, keys-delivered line and amounts Sometype Mono 500; the wordmark embedded as the outlined lockup path (§9). Colours: ink `#1B1C1D`, muted `#4B4842`, rule `#B5AE9F`, a 3pt mustard `#E2AE2F` rule under the header, the terminus bar `#D29D1A`. Invoices are always light and never print key codes ("Key delivered to your account on {date}").

### 4.2 Modular scale: ratio 1.333 (perfect fourth), base 16px
Signage needs decisive jumps between a sign, its sub-line and the small print; 1.333 gives that, and the hero takes its own display step. Overpass's x-height (0.511) reads comfortably at 16px.

```css
@theme inline {
  --text-step--2: 0.75rem;
  --text-step--1: 0.875rem;
  --text-step-0: 1rem;
  --text-step-1: clamp(1.125rem, 1.05rem + 0.35vw, 1.333rem);
  --text-step-2: clamp(1.3125rem, 1.15rem + 0.7vw, 1.777rem);
  --text-step-3: clamp(1.5rem, 1.25rem + 1.2vw, 2.369rem);
  --text-step-4: clamp(1.75rem, 1.3rem + 2vw, 3.157rem);
  --text-step-5: clamp(2rem, 1.3rem + 3.2vw, 4.209rem);
  --text-display: clamp(2.5rem, 1.2rem + 5.6vw, 5.61rem);
  --text-ui-md: 0.9375rem;
  --text-ui-sm: 0.875rem;
  --text-data: 0.875rem;
  --text-data-sm: 0.75rem;
  --text-sign: 0.75rem;
  --text-key: clamp(1.125rem, 1rem + 0.6vw, 1.5rem);
  --text-flap-sm: 0.875rem;
  --text-flap-md: 1.125rem;
  --text-flap-lg: clamp(1.25rem, 0.9rem + 1.1vw, 1.75rem);
}
```
Checked at 390px and 1440px: step-5 = 33px / 67px; display = 41px / 90px (capped from ~1260px); step-4 = 29px / 50px.

| Role | Face | Size token | Leading | Tracking | Case |
|---|---|---|---|---|---|
| Hero H1 | Overpass 900 | display | 0.94 | −0.03em | sentence |
| Landing H1 (activation guide, about) | Overpass 800 | step-5 | 1.0 | −0.02em | sentence |
| Store H1 (catalogue, product, account) | Overpass 800 | step-4 | 1.04 | −0.015em | sentence |
| H2 section | Overpass 800 | step-4 (home) / step-3 (store) | 1.06 | −0.015em | sentence |
| H3 / panel title | Overpass 700 | step-2 | 1.15 | −0.005em | sentence |
| **Sign label** (eyebrows, column heads, board heads, filter heads) | Overpass 700 | sign (12px) | 1.2 | 0.14em | UPPERCASE |
| Platform name on signs | Overpass 800 | step-2 / step-3 | 1.05 | −0.01em | as named |
| Card title | Overpass 700 | step-0 (17px on ≥1280 via `text-[1.0625rem]`) | 1.25 | −0.005em | as named, 2 lines max |
| Lead | Overpass 400 | step-1 | 1.5 | 0 | sentence |
| Body | Overpass 400 | step-0 | 1.6 | 0 | sentence |
| UI label, form label | Overpass 600 | ui-md | 1.3 | 0 | sentence |
| Meta, captions, breadcrumbs | Overpass 400 | ui-sm | 1.45 | 0.005em | sentence |
| Nav links | Overpass 700 | ui-md | 1 | 0 | sentence (signs speak in sentence case; only sign labels are caps) |
| Buttons | Overpass 700 | 15px (md) / 16px (lg) / 14px (sm) | 1 | 0.005em | sentence |
| Price in a card | Sometype 600 | step-1 | 1.1 | −0.01em | — |
| Price in the buy box | Sometype 600 | step-4 | 1.0 | −0.02em | — |
| Order total | Sometype 600 | step-2 | 1.05 | 0 | — |
| Key characters (flaps) | Sometype 600 | text-key | 1 | 0 | as issued |
| Readouts (counts, IDs, dates) | Sometype 400 | data | 1.4 | 0 | — |
| Flap characters (board) | Sometype 600 (700 in hero GL atlas) | flap-sm/md/lg | 1 | 0 | UPPERCASE on boards |

Rules:
- Mono is for data and flaps only, never for sentences.
- Uppercase only for sign labels and board flaps. Buttons, nav, headings are sentence case (Keyrook used uppercase wide buttons; we don't).
- Reading blocks (policies, FAQ answers, activation guide, product description) are capped at `66ch`.
- Minimum sizes: body 16px, meta 14px, sign labels 12px.

### 4.3 Global base rules in `globals.css`
- `body`: `var(--font-sans)`, 1rem, line-height 1.6, `var(--color-bg)`, `var(--color-text)`.
- `h1–h6`: `var(--font-display)`, weights per §4.2, `font-synthesis: none`, `text-wrap: balance`.
- `p`: `text-wrap: pretty`.
- `@utility eyebrow` → the **sign label**: Overpass 700, 0.75rem, uppercase, 0.14em, `--color-text-secondary`. No text-shadow.
- `@utility label-caps` → same as `eyebrow` but ink.
- `@utility data`: Sometype 400, 0.875rem, line-height 1.4.
- `@utility price`: Sometype 600, letter-spacing −0.01em.
- `@utility key-code`: Sometype 500, `--text-key`, `font-feature-settings: "calt" 0`, `font-variant-ligatures: none`, `user-select: all`.
- `@utility flap` (new): see §8.21.
- Delete `@utility steel-grain`, `tumbler`, `display-wide`, `text-shadow-engrave`.
- Keep `tabular`, `measure` (66ch), `meta`, `no-scrollbar`.
- `a:not([class])` and `.prose a`: the link style from §3.3.
- Scrollbar: thumb `--color-border-hover`, track `--color-bg-secondary`, 6px radius thumb.
- `svg.lucide`: `flex-shrink: 0; stroke-linecap: round; stroke-linejoin: round;` with stroke widths from §7.

---

## 5. Space, layout, geometry, borders, elevation

### 5.1 Spacing
4px base: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 120 · 160`.

Rhythm is uneven on purpose (padding per home section in §14.1):
- dense where comparison is the job: catalogue grid (16px gaps desktop, 12px mobile), timetable rails, revised fares board, season tickets table;
- generous where something is read once: hero hall, theater, routes, through the gate.

### 5.2 Layout
| Token | Value | Use |
|---|---|---|
| `--container-container` | 1360px | default content width |
| `--container-wide` | 1520px | home set-pieces, header bar ≥1600px, footer inner |
| `--container-narrow` | 1120px | checkout, account, orders |
| `--container-read` | 720px | policies, FAQ answers, activation guide |
| gutters | 16px (<640), 24px (640–1023), 40px (≥1024) | |
| grid | 12 columns, 24px gap (≥1024); 6 columns, 16px (640–1023); 4 columns, 12px (<640) | |

Breakpoints: 390 (mobile design base), 640, 840 (theater phone/desktop switch), 1024, 1280, 1440, 1600.

### 5.3 Geometry: "mixed by role"
Each radius belongs to a kind of object in a station; never mix within a kind, never apply one radius everywhere.

| Token | Value | Objects |
|---|---|---|
| none | 0px | page bands, section edges, tables, the header and strip, the footer, cover images inside cards, the hero hall |
| `--radius-flap` | 2px | flap tiles, platform number tiles, the deal tile, the cart count, flap loader, tags |
| `--radius-sign` | 4px | sign plates: large platform signs, "Company notice", the payment logo strip, the "through the gate" plates, chips |
| `--radius-control` | 6px | buttons, inputs, selects, segmented controls, quantity, toasts, the cookie banner |
| `--radius-card` | 8px | departure cards, buy box, cart summary, dialogs, drawers' inner panels, search panel |
| `--radius-board` | 10px | board housings: hero board, key board, theater housing, mini-boards, the gift card blank |
| `--radius-round` | 50% | route stops, timeline stations, radio dots, the theater play control, the switch knob — only on elements with equal width and height |

- No pills (a 6px button is not a pill), no chamfers, no rotated elements, no notched ticket edges anywhere except the cart/checkout ticket summary (§8.26), where two 10px semicircle notches mark the tear line.
- Third-party payment logos keep their own artwork.

### 5.4 Borders and rules
- **Hairline:** 1px `--color-border` (card outlines, section dividers, table rows).
- **Rule:** 1px `--color-rule` (table heads, filter group heads).
- **Control:** 1px `--color-border-control`; hover `--color-text-secondary`; error 2px `--color-danger`.
- **Hinge:** 1px (small flaps) or 2px (≥24px flaps) `--color-hinge` across the middle of every flap tile. Never on anything that isn't a flap.
- **Route line:** 3px `--color-stop` (ink); upcoming segments 3px dashed (6/4) `--color-rule`.
- **Active bar:** 3px `--color-accent` under the active nav item, tab, filter head and pagination number.

### 5.5 Elevation: flat hall, lifted overlays
| Level | Token | Use |
|---|---|---|
| e0 | none | page, bands, tables, text, cards at rest (hairline only) |
| e1 | `--shadow-card-hover` (a stronger hairline) | card hover, sticky buy bar when stuck |
| e2 | `--shadow-overlay` | popovers, concourse map, search panel, toasts, cookie banner |
| e3 | `--shadow-xl`, `--shadow-panel*` | dialogs, cart drawer, mobile sheets |
| flap | `--shadow-flap` | 1px inner dark line at the bottom of every flap tile |

No coloured shadows, no glows, no inner glows on mustard, no drop shadows on cards at rest.

### 5.6 Z-index
`base 0 · card-item 1 · sticky 40 · dropdown 50 · drawer 60 · modal 70 · toast 80 · cookie 90`. The theater cursor and spotlight live inside the stage's own stacking context (`isolation: isolate`). The hero canvas sits under the DOM board's links (§13 M1).

---

## 6. Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-micro` | 120ms | hover, press, focus, tag swaps |
| `--dur-ui` | 180ms | accordions, tabs, filter groups, segmented controls |
| `--dur-panel` | 240ms | cart drawer, concourse map, dialogs, sheets |
| `--dur-panel-close` | 180ms | closing panels |
| `--dur-flap` | 70ms | one flap falling (one character step) |
| `--dur-reveal` | 560ms | landing section entrances only |
| `--dur-reduced` | 100ms | the only transition under reduced motion (opacity) |
| `--ease-flap` | cubic-bezier(0.55, 0, 1, 0.45) | a flap falls under gravity: it accelerates and lands; a 3° rebound over 40ms follows (JS/GL only) |
| `--ease-sign` | cubic-bezier(0.2, 0, 0, 1) | UI movement: quick start, soft arrival |
| `--ease-std` | cubic-bezier(0.4, 0, 0.2, 1) | colour, opacity |
| `--ease-in-out` | cubic-bezier(0.76, 0, 0.24, 1) | board pitch on scroll, theater scene changes |
| `--ease-out-expo` | cubic-bezier(0.16, 1, 0.3, 1) | entrances |

**Flap physics (JS and GL):** a character change walks the **drum order** `" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-–−·/&'!?+%€£$()"` forward from the current to the target character, one flap per step. Each step is `--dur-flap` (70ms). If a cell needs more than 10 steps it skips ahead so it never takes more than 10 visible steps (the step duration may drop to 40ms for the skipped part). Column stagger 18ms left→right, row stagger 60ms top→bottom. A pure function `flapFrame(from, to, cellIndex, t)` in `src/lib/motion/flap.ts` returns `{ top, bottom, falling, angle }` for any time `t`, so every frame can be rendered as a still (theater, `?t=` freeze, reduced motion).

Update `src/lib/motion/tokens.ts`:
- `MOTION_DURATION`: micro 120, ui 180, panel 240, panelClose 180, flap 70, reveal 560, reduced 100, cartFlight 380, keyFlip 1100, boardPage 7000.
- `MOTION_EASE`: `flap`, `sign`, `std`, `inOut`, `outExpo`.
- `MOTION_STAGGER`: chars 18, rows 60, cards 70, stops 90.
- `MOTION_LIMITS`: flapMaxSteps 10, flapRebound 3, riffleAngle 10, riffleRadius 60, boardPitch 12, dprCap 1.5, pointerTilt 2.
- Delete `MOTION_SPRING` (no springs), `LAMP_POSE`, door and dial limits.

**Philosophy: station mechanics.** Things move like a hall's equipment: flaps fall in discrete steps and land; signs and panels slide in quickly and settle; lines draw in the direction of travel. Nothing floats, pulses, bounces (apart from the 3° flap rebound), glows, or loops ambiently — except the hero board's page change, which is real content, has a visible pause control (WCAG 2.2.2) and stops off-screen, and the theater, which is a pausable demo.

With `prefers-reduced-motion: reduce`:
- every transition is an instant state change or a ≤100ms opacity fade;
- flaps show their final character immediately (boards, key reveal, counts);
- the hero board does not page automatically; a "Next 6" button pages instantly; search updates instantly;
- no WebGL, no pointer riffle, no scroll pitch, nothing pins;
- route lines are drawn complete;
- the theater shows stills with full step lists;
- `scroll-behavior: smooth` is removed.

`src/styles/animations.css`: delete `plate-in`, `panel-in`, `tumbler-roll`, `bolt-shoot`, `lamp-lit` and every keyframe without a consumer. Add: `sign-in` (translateY 8px→0 + opacity), `panel-drop` (translateY −6px→0 + opacity), `flap-fall` (rotateX 0→−90° on the upper falling half, `transform-origin: bottom`, `--ease-flap`), `flap-land` (rotateX 90°→0 on the lower half, `transform-origin: top`), `route-draw` (stroke-dashoffset 1→0 with `pathLength="1"`), `stop-in` (scale 0→1). Durations and easings from tokens.

---

## 7. Icons — Lucide (a glyph map distinct from Keyrook's and Fablekeys')

- `lucide-react` 1.52 (installed). Every glyph below was verified to exist in `node_modules/lucide-react/dist/esm/icons/*.mjs`.
- One system: **round caps and joins (Lucide's defaults), stroke 2 at 14–18px and 1.75 at 20–24px** — bold pictograms like station signage. Keyrook used square caps at 1.75; Fablekeys 1.25–1.5 hairlines. Set it once in the global `svg.lucide` rule plus a size-aware `Icon` wrapper.
- Sizes 16, 18, 20, 24. `aria-hidden` unless the icon is the only content (then the parent has an `aria-label`).
- Never in circles or tinted squares; icons sit in text colour (on the board, `--color-on-board`).
- On desktop, header actions pair icon + word (≥1280px, §11.1).

| Job | Glyph | Job | Glyph |
|---|---|---|---|
| Cart | `Ticket` + "Cart" | Search | `Search` |
| Add to cart (card) | `TicketPlus` | In cart | `TicketCheck` |
| Remove from cart | `TicketX` + "Remove" | Quantity | `ChevronDown` (decrease) / `ChevronUp` (increase) on a flap counter |
| Save / saved | `ListPlus` / `ListCheck` ("Save" / "Saved") | Account | `IdCard` |
| Menu (mobile) | `Rows3`, labelled "Menu" | Close | `X` |
| Filters | `SlidersVertical` | Sort | `ArrowDownUp` |
| Disclosure (accordion, filter group) | `SquareChevronDown` (rotates 180°) | Select arrow | `ChevronsUpDown` |
| Directional link, "All … →" | `ArrowBigRight` | Back | `ArrowBigLeft` |
| External (platform redeem pages) | `MoveUpRight` | Breadcrumb separator | none: a mono "›" in faint |
| Key | `KeySquare` | Reveal key | `ScanEye` |
| Hide key / password | `EyeOff` / `Eye` | Copy / copied | `Copy` / `Check` |
| Replacement key | `Replace` | Keys encrypted at rest | `Lock` |
| Hosted card page | `CreditCard` | 3-D Secure (your bank) | `Landmark` |
| PDF invoice | `Receipt` (download: `ArrowDownToLine`) | Delivered to your account | `Inbox` |
| Region | `GlobeLock` | Languages | `Languages` |
| System requirements | `Monitor` | Activation steps | `Signpost` |
| Gift card | `Wallet` | Subscription | `CalendarRange` |
| DLC | `LayersPlus` | Top-up | `Coins` |
| Software | `AppWindow` | Genre routes | `Route` |
| Success | `CircleCheckBig` | Error | `OctagonX` |
| Warning | `TriangleAlert` | Info | `Info` |
| Theme | `Sunrise` ("Day") / `Sunset` ("Night") | Currency | none: the code in mono ("EUR") |
| Sign out | `DoorOpen` | Email sent | `MailOpen` |
| No cover | `SquareDashed` | Help | `MessageCircleQuestion` |
| Report a problem | `MessageCircleWarning` | Theater | `Play` / `Pause` / `Repeat` |

Type icons (`LayersPlus`, `Wallet`, `CalendarRange`, `Coins`, `AppWindow`) appear only in the concourse map and on type landing openers, never on cards.

Not used:
- Keyrook's: `Archive`, `Pin`, `PinOff`, `UserKey`, `SquarePlus`, `SquareMinus`, `Trash`, `ListFilter`, `ArrowDownWideNarrow`, `ArrowLeft`, `ArrowRight`, `SquareArrowOutUpRight`, `KeyRound`, `CopyCheck`, `RotateCcwKey`, `Vault`, `ShieldCheck`, `ReceiptText`, `FileDown`, `Timer`, `Hourglass`, `EarthLock`, `Cpu`, `ListOrdered`, `WalletCards`, `CalendarSync`, `PackagePlus`, `BadgeCheck`, `OctagonAlert`, `SunMoon`, `MailCheck`, `ImageOff`, `CircleHelp`, `MessageSquareWarning`, `Menu`;
- Fablekeys': `Backpack`, `BookUser`, `TableOfContents`, `Eraser`, `Funnel`, `ArrowUpDown`, `ChevronRight`, `MoveLeft`, `MoveRight`, `ExternalLink`, `Key`, `EyeClosed`, `ClipboardCopy`, `ClipboardCheck`, `RefreshCcw`, `LockKeyhole`, `ShieldUser`, `ScrollText`, `Download`, `Clock3`, `Feather`, `Globe`, `MonitorCog`, `ListChecks`, `Gift`, `CalendarClock`, `BookPlus`, `CircleCheck`, `CircleX`, `CircleAlert`, `BadgeInfo`, `Lamp`, `Sun`, `Send`, `BookDashed`, `LifeBuoy`, `Flag`, `LibraryBig`;
- other siblings': `ShoppingCart`, `ShoppingBag`, `ShoppingBasket`, `Handbag`, `Bookmark`, `Heart`, `Star`, `Plus`, `Trash2`, `ArrowUpRight`, `SlidersHorizontal`;
- clichés: `Plane`, `PlaneTakeoff`, `TicketsPlane`, `TrainFront`, `Clock*` as decoration, `Gamepad2`, `Joystick`, `Sparkles`, `Zap`, `Flame`, `Crown`, `Gem`, `QrCode`, `Barcode`;
- any brand glyph (platform names are text).

Shared generics that are fine: `Search`, `X`, `Languages`, `CreditCard`, `Check`, `Copy`, `Eye`, `EyeOff`, `TriangleAlert`, `Info`, `Play`, `Pause`.

---

## 8. Components (all states)

General states for every interactive component:
- default;
- hover (`hover-device` variant only);
- active/pressed: translateY 1px; mustard fills drop to `--color-accent-hover`;
- focus-visible: 2px `--color-focus` outline, 2px offset (3px on cards), following the element's radius; on board surfaces `--color-focus-on-board`; never removed;
- disabled: `--color-text-tertiary` text, `--color-bg-secondary` fill, no hover, `cursor: not-allowed`, `aria-disabled` or `disabled`;
- loading: `aria-busy="true"`, width locked, the flap loader (§8.22) replaces the label centre.

Minimum touch target 44×44px on touch devices.

### 8.1 Button (`src/components/ui/Button.tsx` — keep the API, restyle)
| Existing variant | New look |
|---|---|
| `primary` | **Go** (mustard) |
| `secondary`, `outline`, `bordered` | **Sign** (outlined) |
| `tertiary`, `ghost`, `light`, `flat` | **Link** (text) |
| `danger` | **Danger** |
| `danger-soft` | Link in danger colour |

| | Go | Sign | Link | Danger |
|---|---|---|---|---|
| Shape | 6px, fill `--color-accent`, 1px `--color-accent-edge` (Day) | 6px, transparent, 1.5px `--color-text` border | no box; 2px underline `--color-link-line`, offset 4px | 6px, fill `--color-danger` |
| Label | Overpass 700 sentence case, `--color-on-accent` | Overpass 700, ink | Overpass 600, ink | `--color-on-danger` |
| Trailing arrow | optional `ArrowBigRight` 18px in a 1px-divided end cell (only on directional CTAs: hero Search, Checkout, Continue, Pay) | optional `ArrowBigRight` | `ArrowBigRight` 16px when it leads somewhere | none |
| Hover | fill `--color-accent-hover` | fill `--color-bg-secondary` | underline 3px, text `--color-accent-ink` | fill darkens 6% via `--color-danger` mix in a token |
| Active | translateY 1px | same | same | same |
| Disabled | fill `--color-bg-secondary`, faint text, edge `--color-border` | border `--color-border`, faint text | faint, no underline | as Go disabled |
| Loading | label `visibility: hidden`, flap loader 16px centred | same | same | same |

Sizes: sm 36px / 14px label / 14px padding; md 44px / 15px / 20px; lg 52px / 16px / 24px. Icon-only buttons: 40px square (44 on touch), 6px radius, transparent, hover fill `--color-bg-secondary`, required `aria-label`.

One Go button per viewport region. Go + Sign may sit together; two Go buttons may not.

On board surfaces (`data-surface="board"`) the Sign variant uses `--color-on-board` border and text, and Go uses the board's mustard pair (§3.2).

### 8.2 Text inputs, textarea
- 48px, 6px radius, fill `--color-raised`, 1px `--color-border-control`, 14px padding, Overpass 400 16px.
- Label above: Overpass 600 15px, 6px gap; required " *" muted + `aria-required`. Hint 14px muted; placeholder faint.
- Hover: border muted. Focus: ring (offset 2px). Error: 2px danger border, message with `OctagonX` 16px, `aria-describedby`, `aria-invalid`.
- Password: inline 40px `Eye`/`EyeOff` with `aria-pressed`.
- Data inputs (min/max price, order number, the key spell-out) use Sometype 400 15px values.
- Textarea min 140px, vertical resize.

### 8.3 Select
Native `<select>` styled like an input (48px; 36px in toolbars), `appearance: none`, `ChevronsUpDown` 16px 14px from the right. WAI-ARIA combobox only for language and country search.

### 8.4 Checkbox, radio, switch, segmented control
- **Checkbox:** 20px, 4px radius, 1.5px control border; checked = mustard fill + `--color-accent-edge` border + `Check` 14px in `--color-on-accent`; indeterminate 10×2 bar. Whole row is the hit area (44px in filter lists).
- **Radio:** 20px circle, 1.5px border; checked = 3px ink ring + 8px mustard dot (a route stop).
- **Switch:** 44×24 track with 6px radius (not a pill), 1px control border; a 18px square-ish knob with 4px radius slides 20px; on = mustard track + ink knob; off = `--color-bg-tertiary` track + muted knob. `role="switch"`, `aria-checked`. Locked "Necessary" = on + disabled + "Always on".
- **Segmented control** (mobile type filter, theme in the mobile menu, theater tabs on mobile): one 6px frame with 1px control border; 36px segments in Overpass 700 14px; selected = ink fill with bg-colour text (an inverted sign), `role="radiogroup"` with arrow keys.

### 8.5 Tags (`Plate` → `Tag`)
22px high, 2px radius, 0 8px padding, Overpass 700 12px uppercase 0.1em; never clickable.

| Variant | Look | Use |
|---|---|---|
| `platform` | the **platform tile** (§8.6) + name in ink, no box | "[1] STEAM" |
| `region` | 1px `--color-border-hover`, mono 12px uppercase ink | "GLOBAL", "EU", "UK", "US", "NA" |
| `type` | fill `--color-bg-tertiary`, ink | "DLC", "GIFT CARD", "SUBSCRIPTION", "TOP-UP", "SOFTWARE" (base games: no tag) |
| `edition` | 1px `--color-border-hover`, ink | "DELUXE EDITION" (only when the title carries one) |
| `neutral` | fill `--color-bg-tertiary`, muted | "Out of stock", "Sample data" |
| `success`/`warning`/`danger`/`info` | tint fill, semantic text, a 6px square before the word | statuses |
| `deal` | the deal tile (§8.12) | "NOW −18%" |
| `count` | a single flap tile (§8.21) | cart count only |

At most one platform, one region and two other tags on a card. Truncate the region before the platform.

### 8.6 Platform tile and the gate line
- **Platform tile** (`src/components/ui/PlatformTile.tsx`): a flap tile with the platform number in Sometype 600. Sizes: xs 18×22 (cards, rows), sm 24×30 (filters, menus), md 40×52 (platform signs), lg 64×84 (home platform signs, platform landing opener). Numbers 1–10; "other" shows "–". `aria-hidden`; the name beside it carries meaning.
- **Gate line** (replaces Keyrook's label row): `[1] STEAM · GLOBAL · DLC` — tile, platform name in Overpass 700 12px caps 0.1em, region in mono, type tag; `·` separators in faint. On a dark gate strip it is set in `--color-on-board` / `--color-on-board-muted`.
- Wrapped in a `<p>` with visually hidden text "Activates on Steam. Region: Global. Downloadable content."; visual parts `aria-hidden`.

### 8.7 Chips (active filters)
32px, 4px radius, fill `--color-raised`, 1px control border, Overpass 600 14px, human values ("Steam", "EU", "DLC", "€8–€18", "Released 2024–2026", "On sale"). Platform chips carry the xs platform tile. `X` 14px inside the hit area with `aria-label="Remove filter: Steam"`. The row ends with Link "Clear all".

### 8.8 Remark (`src/components/ui/Remark.tsx`, new)
The board's REMARKS column as a component. Mono 600 uppercase on the board in `--color-remark`; on page surfaces it renders as a `type`-style tag in ink (never mustard text on the floor). Allowed values, each **data-backed** (§16):

| Remark | Condition |
|---|---|
| `ON TIME` | in stock (`qty > 0`) at its regular price |
| `NOW −18%` | a valid compare-at price from our own 30-day history, ≥ `STORE_POLICY.deals.minPercent` |
| `NEW` | release date within `MERCH.releaseWindowDays` (56) and not in the future |
| `NOT IN STOCK` | saved items and history only |
| theater-only: `CHECK-IN`, `BOARDING`, `DEPARTED`, `ARRIVED`, `HELP DESK` | sample data in the theater (§12) |

No `LAST CALL`, `DELAYED`, `GATE CLOSING`, `FINAL BOARDING`, countdowns or "hot".

### 8.9 Cover (`src/components/product/Cover.tsx` — keep, restyle)
- **Stage:** fixed aspect box, 0px inside its card (the card's radius clips it), `--color-stage`.
- **Ratio:** 3:4 for cards, cart and order rows, PDP; 16:9 for screenshots and the feature card.
- **Fit by real proportions** (keep Keyrook's `coverWidth`/`coverHeight` logic): portrait art 0.68–0.82 fills with `object-cover`; anything else `object-contain` centred on the plain stage. Never blurred backdrops, washes, rotation.
- **No cover:** `SquareDashed` 24px muted and the platform tile + name. No invented artwork.
- Mirrored images via `next/image` with correct `sizes` (card ≈ 260px, PDP ≈ 520px, compact row 72px). No supplier host anywhere.
- Alt: "{title} cover art".

### 8.10 The departure card (product card; restyle `ProductCard`)
One `<article>`, 8px radius, `--color-raised`, 1px `--color-border`, `overflow: hidden`.

**Anatomy, top to bottom:**
1. **Gate strip** (30px, `--color-board`, `data-surface="board"`): xs platform tile, platform name in Overpass 700 12px caps 0.1em `--color-on-board`, right-aligned region in mono 12px `--color-on-board-muted`. It is the card's own little board row.
2. **Cover** 3:4, full width, flush under the strip. The cover is the card's main link (`/product/[slug]`), stretched over the card with a pseudo-element; Save and Add stay separate controls.
3. **Body** (14px padding):
   - title: Overpass 700 16–17px, 2 lines reserved;
   - facts: Overpass 400 14px muted, one line by type: games/DLC "EN · DE · FR +9" (or nothing without data), DLC adds "Needs the base game"; gift card "Value €20"; subscription "12 months"; top-up "1,000 coins" when parsed;
   - type tag (non-games only) after the facts;
   - **price row**: left the price (Sometype 600 step-1); with a deal, the struck was-price (faint, 13px) above it and the deal tile beside it. Right: `ListPlus` Save (40px icon button, `aria-pressed`, "Save {title}" / "Saved") and **Add** (40px icon-only Sign button with `TicketPlus`, `aria-label="Add {title} to cart"`).

**States:**
- **Hover / focus-within (fine pointer):** border `--color-border-hover` + `--shadow-card-hover`; the gate strip's platform tile flips once to the same number (a single 140ms flap — the "this departure is selected" cue, M6); the title underlines; Add becomes Go (mustard). 180ms on `--ease-sign`. The focus ring wraps the whole card (offset 3px).
- **In cart:** Add becomes `TicketCheck` in a Sign button labelled "In cart" (opens the drawer).
- **Adding:** flap loader, then M7.
- **Out of stock** (saved items, history only): cover 55% opacity, `NOT IN STOCK` tag, Add removed, price muted "Last price €12.40".
- **Skeleton:** card with `--color-bg-tertiary` stage, gate strip in `--color-board` (static), three bars (title 80%, facts 50%, price 64px) in `--color-bg-secondary`. No shimmer; 120ms fade to content.

**Variants:**
- **Compact row** (cart drawer, search, orders, concourse map preview): a 54×72 cover, line 1 title, line 2 gate line, price right. Rows separated by hairlines, not boxed.
- **Board row** (home timetable headers, revised fares, search kiosk): a row of flap text on `--color-board` — see §8.21.
- **Feature card** (platform landing lead): spans 2×2; 16:9 screenshot with the 3:4 cover set in its lower left (32% width) on a 1px `--color-raised` mat; title Overpass 800 step-3, gate line, price step-3.
- **Gift card blank** (§14.1 section 7, gift card type landing): 1.586:1, 10px radius, `--color-board`, `data-surface="board"`: platform tile + name top-left, "GIFT CARD" sign label, the value in flap tiles bottom-left (lg), region bottom-right. A real card image from the feed replaces the blank face at `object-contain` inside the same frame.

**Grid:** 5 columns ≥1536, 4 at 1280–1535, 3 at 840–1279, 2 below 840; gaps 16px desktop, 12px mobile.

### 8.11 Price display (`PriceDisplay` — keep, restyle)
Sometype 600; currency symbol at the same size; no superscript cents; "≈" only when the charge currency differs. Loading: 64×18 `--color-bg-secondary` block.

### 8.12 Deal tile
A flap tile row: `NOW` + `−18%`, Sometype 600 12px, `--color-remark` on `--color-flap`, 2px radius, 1px hinge line across, 22px high. Shown only with a valid compare-at price (§17). The struck price: `--color-text-tertiary`, `line-through`, Sometype 400 13px, accessible label "Was €29.99". Never red, never green, never "SALE!", never a countdown.

### 8.13 Quantity (`QuantitySelector`)
A flap counter: `[⌄] [ 2 ] [⌃]` — 40px `ChevronDown` button, a 40×44 flap tile with the value (sm flap), 40px `ChevronUp` button, inside one 6px frame with a 1px control border. The value flips on change (one flap). Max = lower of `STORE_POLICY.limits.maxQtyPerItem` and stock; hint "Up to 3 per order". Labels "Decrease quantity" / "Increase quantity"; clamp on blur with `aria-live="polite"`.

### 8.14 Filters (`ProductFilters`) — the "information panel"
- **Desktop:** left column 272px, sticky under the header, on `--color-bg` (no box), groups separated by hairlines.
- **Group head:** 48px row, sign label (e.g. "PLATFORM"), the selected count in mono, `SquareChevronDown`. A button with `aria-expanded`; panel opens via grid-rows 0fr→1fr over 180ms. A 3px mustard bar sits under the head of a group that has selections.
- Open by default: Platform, Type, Price, On sale.
- Only values present in the current result set, each with its real count (mono 12px muted, right-aligned).
- **Groups, in this order** (different from Keyrook's Type-first and Fablekeys' Volume-first):
  1. **Platform:** rows "[1] Steam … 40,737", in `PLATFORM_BOARD` order (not by count). Hidden on platform pages.
  2. **Type:** Games, Gift cards, Subscriptions, DLC, Top-ups, Software (`TYPE_ORDER`, §18). Hidden on type pages.
  3. **Price:** fare zone quick picks as 4px-radius chips ("Under €3", "€3–€8", "€8–€18", "€18–€35", "€35–€70", "€70 and up" in the active currency, from `FARE_ZONES`), then two mono inputs Min / Max. No slider track decoration.
  4. **Region:** Global, Europe, United Kingdom, United States, North America; help line "A region-locked key activates only on accounts set to that region."
  5. **Genre:** rows in `ROUTE_ORDER` with counts; a search-in-list input above 10 values. (Label "Genre" — the "route" metaphor stays on home.)
  6. **Language:** combobox multi-select ("Interface or audio language").
  7. **Release year:** two mono selects "From" / "To" listing years present in results, newest first. (No histogram, no ruler.)
  8. **On sale:** switch "Only show price cuts" + count.
- **Above the grid:** result sentence in Overpass 400 15px with mono numbers ("1,284 keys · Steam · Global · On sale") and active chips.
- **Mobile:** sticky toolbar under the header: Sign button "Filter" (`SlidersVertical`, count in mono) and the sort select; Filter opens a full-height bottom sheet (`--color-raised`, top corners 8px) with the same groups and a sticky footer holding Go "Show 1,284 keys" and Link "Clear all".
- Filter state in the URL (existing logic).

### 8.15 Sort (`ProductSort`)
Native select, 36px, inline sign label "SORT". Options in this order: **Board order** (default; tooltip text under the select on focus: "Newer releases first, mixed across platforms"), Price, low to high; Price, high to low; Newest release; Biggest price cut; Most ordered; Title A–Z; Relevance (search only). "Board order" is a new `SortKey` `board` (§18.3).

### 8.16 Pagination
Numbers in 40px squares with 6px radius, mono 14px. Current: ink text + 3px mustard bar under it, `aria-current="page"`. "Previous"/"Next" as Link buttons with `ArrowBigLeft`/`ArrowBigRight`. Mobile: "Page 2 of 27" mono + Previous/Next. Load-more variant: "Showing 48 of 1,284" + Sign "Show 48 more".

### 8.17 Breadcrumbs
Overpass 14px muted links, mono "›" separators in faint (`aria-hidden`), current page ink with `aria-current`. Mobile: parent only, with `ArrowBigLeft`. `BreadcrumbList` JSON-LD.

### 8.18 Tabs and accordion
- **Tabs** (PDP on desktop, account keys filter): Overpass 700 15px sentence case, 48px, tablist on a hairline; active = ink + 3px mustard bar the width of the label; inactive muted. WAI-ARIA tabs. PDP tabs become accordions on mobile.
- **Accordion** (FAQ, mobile filters, mobile footer, PDP on mobile): 56px heads, Overpass 700 step-1, `SquareChevronDown` rotating 180° over 180ms; open panel on `--color-bg` with 20px padding; hairline rows; several can be open.

### 8.19 Toasts — "announcements"
Desktop bottom-right 24px; mobile top under the header, full width minus 32px. `--color-raised`, 6px radius, `--shadow-overlay`, max 380px, a 4px left bar (mustard for cart, semantic otherwise). Cart toast: `TicketCheck` + "Added to cart", Link "View cart", Go sm "Checkout". Status toasts: semantic icon + text. 5s auto-dismiss, paused on hover/focus, `X`. `role="status"` (`alert` for errors). Entrance `sign-in` 180ms; reduced: opacity.

### 8.20 Dialog
Centred, 8px radius, `--color-raised`, `--shadow-xl`, max 560px, 28px padding; title Overpass 700 step-2; close `X`; scrim without blur; focus trap, Esc, focus return, `role="dialog"`, `aria-modal`, `aria-labelledby`; entrance rise 8px + fade 240ms `--ease-sign`. Destructive: Danger right, Sign "Cancel" left.

### 8.21 Flaps (`src/components/ui/Flap.tsx`, new — replaces `Tumbler`)
**`Flap`** — one character tile:
- width `1ch + 0.4em`, height `1.55em`, font Sometype 600 at the size token (`flap-sm` 14px, `flap-md` 18px, `flap-lg` up to 28px, `key` for keys);
- `--color-flap` face (top half `--color-flap-top`), `--color-on-board` glyph (or `--color-remark` in remark columns), 2px radius, `--shadow-flap`;
- the **hinge**: a 1px (≤18px) / 2px (larger) `--color-hinge` line across the middle, plus a 1px gap between adjacent tiles showing `--color-board`;
- built from two halves (`.flap-top`, `.flap-bottom`) each clipping the same glyph, plus a third `.flap-leaf` used only while flipping;
- blank tile = an empty flap (not a dot, not a bullet).

**`FlapRow`** — a row of tiles from a string, fixed `cells` length, `align` left/right, padding with blanks; separators (space, `-`, `·`) are flaps too, exactly like a real board.

**`FlapCounter`** — numbers (cart count, quantity, order number on the confirmation page). Changes flip each changed digit once through the drum order (§6), right digit first.

**Accessibility:** the visual row is `aria-hidden`; a sibling visually hidden span holds the real text. Live regions only where specified (cart count). Reduced motion: final characters, no flip.

**DOM flip** (everywhere except the WebGL hero): CSS 3D on the leaf (`perspective: 300px` on the tile, `flap-fall` then `flap-land`, transform/opacity only), driven by `flapFrame()` on the shared ticker, so the same timing powers DOM and GL.

### 8.22 Flap loader (replaces `ReadoutLoader`/`LoadingSpinner`/the dial loader)
A single blank flap tile (16px in buttons, 24px standalone) whose leaf falls every 280ms (70ms fall + 210ms rest) — a discrete, mechanical tick, never a spin. `role="status"` with hidden "Loading". Reduced motion: static tile + visible "Loading…".

### 8.23 Route line (`src/components/ui/RouteLine.tsx`, new)
An SVG + DOM component used horizontally and vertically:
- line 3px `--color-stop`; upcoming segments dashed `--color-rule`;
- stops: 14px circles, 3px `--color-stop` ring, fill `--color-bg` (done: fill ink; current: fill mustard with the ink ring and a 3px mustard bar under its label);
- labels under (horizontal) or beside (vertical) each stop: Overpass 600 14px ink; meta (counts, times) in mono 12px muted;
- the end of a line is a **terminus bar**: a 6×28px (horizontal) bar in `--color-terminus`; on rest-state route diagrams it is ink and turns mustard on hover/focus of the line;
- `pathLength="1"` on the line path so M5/M8 can draw it;
- semantics: an `<ol>` of stops with `aria-current="step"` on the current one; decorative SVG `aria-hidden`.

### 8.24 Buy box, edition timetable, "Before you buy", system requirements (PDP)
**Buy box** (`BuyBox.tsx`): `--color-raised`, 8px radius, 1px border, 24px padding:
1. Gate line at 14px with the edition tag.
2. Price at step-4 (Sometype 600); with a deal, the struck was-price and deal tile on the same line.
3. Stock line: `ON TIME` remark tag + "In stock" (real `qty > 0`), or "Not in stock". No counts, no urgency.
4. Quantity (only when max > 1), then **Go lg "Add to cart"** full width, then **Sign lg "Buy now"**.
5. Link with `ListPlus`: "Save for later" / "Saved".
6. Three ruled rows with 18px icons (copy from `POLICY_FACTS`; each hidden when its fact is false):
   - `Inbox`: "Delivered to your account, usually within minutes after payment is confirmed."
   - `CreditCard`: "Card payment on a hosted page with 3-D Secure."
   - `Replace`: "Replacement or refund if the key doesn't work." (links to the Refund policy anchor)
7. Visa / Mastercard / PCI DSS at 20px.

States: ready; adding; in cart ("In cart · View cart" + Go "Checkout"); out of stock (Add disabled "Not in stock", "This key isn't in stock right now.", links to the same title on other platforms); price unavailable.

**Edition timetable** (replaces the edition selector look, same data and logic): a small ruled table above the price, shown when ≥2 in-stock products share base title, platform and region. Columns: EDITION (Overpass 600) · ADDS (only from the feed name, e.g. "+ Season Pass") · PRICE (mono, right). Each row is a link; `role="radiogroup"` semantics with `aria-current` on the current one, which gets `--color-accent-light` fill and a 3px mustard left bar.

**"Before you buy"** (ruled definition list, not a card; under the buy box on desktop, above the description on mobile):

| Row | Icon | Content |
|---|---|---|
| Platform | `KeySquare` | "Activates on Steam. You need a Steam account and the Steam app." |
| Region | `GlobeLock` | "Global: no regional lock" / "Europe only: activates on accounts set to a European country", then the supplier's verbatim note in mono 12px muted |
| Languages | `Languages` | full list, or "Not specified by the publisher" |
| Requires | `LayersPlus` | DLC: "The base game {title} on the same platform and region" (linked if listed), else "The base game on the same platform" |
| Validity | `CalendarRange` / `Wallet` | subscriptions: duration; gift cards: value and "Expiry set by the issuer, see activation details" unless the feed states a date |
| Age rating | — | only if the feed has one ("PEGI 16") |
| Delivery | `Inbox` | "To your account, usually within minutes after payment is confirmed" |

**System requirements:** only when the platform is a PC launcher, the type is Game/DLC/Software and the feed text is non-empty (keep Keyrook's logic). Two-column ruled table with sign-label heads when structured, verbatim list otherwise. Never for Xbox, PlayStation, Nintendo, gift cards, subscriptions, top-ups.

### 8.25 Order timeline (`OrderTimeline`)
A **route line** (§8.23). Stops: **Order placed → Payment confirmed → Key issued**, plus an informational **Revealed** stop in the account (not a delivery step). Done stops filled ink; current stop mustard; upcoming hollow with dashed segments; real timestamps under done stops (mono 12px muted). Horizontal on desktop, vertical on mobile.

"Issuing" (paid, not yet issued): the flap loader at the current stop + "Usually within minutes after payment is confirmed. We'll email you when it's ready." No countdown.

Branches replace the rest of the line with a terminus bar in `--color-danger` (failure) or `--color-text-secondary` (neutral) and one sentence (§16): Payment failed; Issuing delayed; Refund pending; Refunded; Replacement issued. The line never shows a future the order can no longer reach.

Polling stays; a change animates once (M8) and `aria-live="polite"` announces it.

### 8.26 Key board (`KeyPlate.tsx` → `KeyBoard.tsx` — the core component)
A board housing: `--color-board`, 10px radius, 1px `--color-board-edge`, 20px padding, max-width 760px, `data-surface="board"`.

**Anatomy:**
1. **Header row:** sign label "KEY 1 OF 2" (when several) in `--color-on-board-muted`; the gate line in board colours; right, the status in board semantic colour with a 6px square: "Ready" (`--color-board-success`), "Reported" (warning), "Replaced" (info), "Refunded" (muted).
2. **Title:** Overpass 700 step-1, `--color-on-board`, linked to the PDP (link underline `--color-remark`).
3. **The key on flaps:** one `Flap` per character at `text-key` size; the issued string exactly as delivered (dashes, spaces, case never reformatted); long keys wrap by group. **Masked = blank flaps** (the key isn't on the board yet).
4. **Action row** (board buttons):
   - masked: Go md "Reveal key" with `ScanEye`;
   - revealed: Sign md "Copy key" (`Copy` → `Check` "Copied" for 2s); Sign md "Redeem on Steam" with `MoveUpRight` (platform's own page from `src/config/activation.ts`, new tab, `rel="noopener noreferrer"`); Link "Hide" with `EyeOff`.
5. **Meta** (mono 12px `--color-on-board-muted`): "Issued 6 Oct 2026, 14:21 · First revealed 6 Oct 2026, 14:25".
6. **Disclosures** (Links in board colours): "How to redeem on Steam" (steps inline); "Activation notes from the publisher" (verbatim `activationDetails`); "Spell it out" — a second mono line under the key with every character disambiguated (`R T 4 Q Z – zero O(letter) K 7 M – …`) for console and TV keyboards.
7. **Problem link:** "Key not working? Report it" opens the report dialog (reasons: Already redeemed, Invalid key, Wrong region, Wrong product, Other; optional note and screenshot) → support ticket tied to the order item.

**Security behaviour (unchanged contract):** the key is never in the initial HTML; Reveal calls the server, which decrypts (AES-256-GCM, key from env), logs `revealedAt` on first reveal and returns the plain string to the signed-in owner only; `navigator.clipboard.writeText` with select-and-hint fallback ("Press Ctrl+C / ⌘C to copy"); `Cache-Control: no-store`.

**States:** issuing (blank flaps + flap loader + "Usually within minutes after payment is confirmed"); masked; **revealing** (M9: flaps flip into place left→right via `flapFrame`, ≤1100ms); revealed; copied; copy failed; **image key** (the image in a 10px-radius well on the board, "Open full size", "Download image", no Copy); **code + PIN** (two flap rows, each with Copy); reported (warning status + "We're checking it. We reply within 1 business day."); replaced (old board collapses to one struck line "Replaced on 7 Oct 2026"; the new board's flaps flip in); refunded (neutral, flaps removed, "Refunded to your card on {date}").

**Accessibility:** once revealed, the key is plain text in a visually hidden span next to the `aria-hidden` flaps; Reveal moves focus to "Copy key"; `aria-live` announces "Key revealed" and "Key copied".

### 8.27 Cart drawer (`CartSheet`) and the ticket summary
- Right panel 420px (100% mobile), `--color-raised`, `--shadow-panel`, scrim; slides in over 240ms `--ease-sign`, closes 180ms; reduced: 100ms fade.
- Header: `Ticket` 20px, "Cart" Overpass 700 step-2, the count as a `FlapCounter`, close `X`.
- Rows: compact rows with gate line, quantity (§8.13), price, Link "Remove" with `TicketX`. Removing collapses the row over 180ms and is announced.
- **Footer — the ticket summary** (also used on `/cart` and checkout): an 8px-radius panel split in two by a dashed vertical tear line with a 10px semicircle notch top and bottom (the only notches in the system):
  - **stub** (left, 96px, `--color-board`, `data-surface="board"`): sign label "KEYS" over a `FlapCounter` with the item count;
  - **body** (right, `--color-bg-secondary`): Subtotal; "Total" (or "Total incl. VAT" only when `COMPANY.vatRegistered`) in Sometype 600 step-2; the line "Keys are delivered to your account after your payment is confirmed."; Go lg full-width "Checkout" with the arrow cell; Link "View cart"; payment logos at 24px.
- Empty: the empty-board illustration (§8.31), "Your cart is empty", Links to Games, Gift cards and Price cuts, and Sign "Browse the catalogue".
- Focus trap, Esc, focus return, `role="dialog"`, `aria-label="Cart"`.

### 8.28 Search — the information kiosk (`SearchDialog`)
- Opens from the header field or `/`. A panel drops under the concourse bar (`--color-raised`, 8px radius bottom corners, `--shadow-overlay`, max-height 80vh), `panel-drop` 180ms.
- Input at step-2 Overpass 400 with `Search` 20px; placeholder "Search {count} keys: title, platform or genre" (real count, rounded down to the nearest 100 above 10,000: "Search 69,700 keys"); Link "Close" with an Esc hint in mono.
- Live results (debounced 200ms): **"Departures"** as compact rows (max 6), "Platforms" as rows "[1] Steam · 40,737", "Genres" as text links with counts; Link "See all 318 results" with `ArrowBigRight`.
- Combobox pattern. No results: "Nothing on the board matches “xyz”." + platform links + "Try the title without the edition name."

### 8.29 Checkout progress (`Stepper` restyle)
A horizontal **route line** across the top of the checkout column: stops **Account · Details · Review & pay**, terminus bar after the last stop. Current stop mustard; done stops ink with a `Check` 12px in bg colour inside. Moving forward draws the next segment (M8). A visually hidden live region announces "Step 2 of 3, Details". Completed steps collapse into one-line summaries above the panel ("Signed in as alex@… · Change"). Buttons: Continue (Go lg, arrow cell) bottom-right, Back (Link) bottom-left except on step 1. Errors: field messages plus a focused summary "Check 2 fields". Mobile: the line keeps 3 stops, label under the current stop only; summary as an accordion "Show summary · €29.99".

### 8.30 Cookie banner and settings
- Banner: bottom-left panel 420px (full width minus 32px on mobile), `--color-raised`, 8px radius, `--shadow-overlay`, 20px padding; never covers the mobile sticky buy or checkout bar (docks above them).
- Copy: "We use necessary cookies to run the store. Analytics and marketing cookies load only if you allow them." + "Cookie policy".
- Three visually identical Sign sm buttons: "Accept all", "Reject all", "Choose cookies".
- `role="region"`, `aria-label="Cookie consent"`, not modal; analytics/marketing load only after consent.
- Settings dialog "Cookie settings" with three switch rows (Necessary locked "Always on", Analytics, Marketing), each with a purpose sentence and a "Show cookies" disclosure (name, provider, purpose, expiry). Footer: Go "Save choices", Sign "Accept all", Sign "Reject all". Opens from the banner and from the footer.
- Storage key `keyterminus-consent` (version + timestamp).

### 8.31 Empty state (`EmptyState` restyle)
- An **empty board**: a 168×96 inline SVG of three board rows of blank flaps (12 tiles each) on a 10px-radius housing, drawn in `currentColor` muted strokes with the hinge lines — no fill colours from outside tokens.
- H2 Overpass 700 step-2, one muted sentence, one primary action and at most one Link.

| Context | Copy |
|---|---|
| Cart | "Your cart is empty" |
| Saved | "Nothing saved yet" |
| Keys | "No keys yet" + "Keys you buy appear here after your payment is confirmed." |
| Orders | "No orders yet" |
| Search | "Nothing on the board matches “…”" |
| Filters | "No keys match these filters" + the three broadest real suggestions ("Remove Europe to see 214 more") |
| Platform without stock | "No Nintendo keys in stock right now" |

### 8.32 Alert, error, skeletons
- Alert: 6px radius, tint fill, 1px semantic border, 16px semantic icon, Overpass 15px. Page fetch error "Something went wrong loading this page." + Sign "Try again". Payment return error "Your payment didn't go through. You haven't been charged." + Go "Try again".
- Skeletons for page loading (card, compact row, PDP, key board), never spinners; `--color-bg-secondary` bars on `--color-bg-tertiary` stages; no shimmer; 120ms fade.

---

## 9. Logo and favicon

### 9.1 The mark: the key line
- **Idea:** a key lying on its side drawn as a line on a route map. The bow is a ring (an interchange on a transit map), the shaft is the line, two teeth of different depths form the bit, and the line ends at a perpendicular **terminus bar** — the symbol for the end of a line — in mustard. Read left to right it is both "a key" and "the last stop". The terminus bar recurs as the end of every route line in the UI (§8.23).
- **Distinct from Keyrook's key rook:** Keyrook's key stands upright with a battlement bit and a green lamp inside its bow; ours lies horizontal, the bow is an open ring with nothing inside, the bit hangs below the shaft, and the colour lives on the terminus bar. No lamp, no battlements, no chess or castle reading.
- **Two hand-fitted drawings** on a 512 grid (store both in `src/lib/brand-mark.ts` as `MARK.full` and `MARK.small`):
  - `full` (≥48px and every lockup): ring centre (150, 256), outer r 86, inner r 44; shaft 226–404 × 235–277 (42 thick); teeth 296–330 to y 318 and 338–372 to y 340 (8-unit cut between them); terminus bar 404–446 × 166–346.
  - `small` (favicons, ≤32px): heavier ring (outer 92, inner 40), thicker shaft (52), one wide bit block 300–384 to y 348, wider bar 400–452 × 156–356.

**Final path data** (light-background colours; in components use `currentColor` for the key and `var(--color-terminus)`/`var(--color-accent-hover)` for the bar):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="48 150 416 212">
  <path d="M64 256A86 86 0 1 1 236 256A86 86 0 1 1 64 256ZM106 256A44 44 0 1 0 194 256A44 44 0 1 0 106 256ZM226 235H404V277H372V340H338V277H330V318H296V277H226Z" fill="#222426"/>
  <rect x="404" y="166" width="42" height="180" fill="#D29D1A"/>
</svg>
```
`small` key path: `M54 256A92 92 0 1 1 238 256A92 92 0 1 1 54 256ZM106 256A40 40 0 1 0 186 256A40 40 0 1 0 106 256ZM224 230H400V282H384V348H300V282H224Z`, bar `x=400 y=156 width=52 height=200`. Both use the default nonzero fill rule (the inner circle is drawn counter-clockwise to punch the hole); keep it that way so the shaft overlap with the ring stays solid.

- **Colours of the bar:** on light backgrounds `#D29D1A` (the Day `--color-accent-hover`; plain mustard on warm white is too faint for a mark), on dark and on graphite `#E6B84A`. One-colour use: the bar takes the key colour.

### 9.2 Wordmark and lockup
- "Keyterminus" in **Overpass 800**, sentence case, tracking −0.012em, kerned (harfbuzz `kern`), outlined. No detail inside the letters and **no bar or caret after the word** (it reads as a terminal cursor).
- **Lockup:** mark height (terminus bar) = 1.25 × cap height; the shaft's centre line sits on the middle of the cap height; gap = 0.42 × cap height. File `public/brand/keyterminus-lockup.svg`, viewBox `0 -1620 16186 2240` (aspect 7.23:1). The wordmark group is `<path transform="translate(4301.9 0)" d="…">` with this outline (font units, baseline at y 0, cap top y −1400):

```
M156 0V-1400H444V-735L970 -1400H1314L900 -895L1394 0H1058L706 -653L444 -326V0ZM1911 24Q1762 24 1654 -41Q1546 -106 1488 -226Q1430 -346 1430 -512Q1430 -676 1489 -796Q1548 -916 1656 -981Q1764 -1046 1911 -1046Q2038 -1046 2141 -993.5Q2244 -941 2304.5 -833.5Q2365 -726 2365 -562Q2365 -534 2364 -494.5Q2363 -455 2358 -416H1699Q1701 -353 1727.5 -307Q1754 -261 1801 -235.5Q1848 -210 1912 -210Q1988 -210 2041 -234.5Q2094 -259 2143 -315L2301 -154Q2232 -73 2135.5 -24.5Q2039 24 1911 24ZM1702 -626H2101Q2095 -685 2071 -727Q2047 -769 2005.5 -790.5Q1964 -812 1905 -812Q1824 -812 1768.5 -764Q1713 -716 1702 -626ZM2678 388 2832 -15 2448 -1022H2732L2945 -457Q2953 -437 2962 -411Q2971 -385 2977 -361Q2983 -385 2992 -411Q3001 -437 3009 -457L3220 -1022H3504L2963 388ZM4008 24Q3880 24 3817.5 -44.5Q3755 -113 3755 -250V-780H3611V-1022H3755V-1314L4028 -1444V-1022H4253V-780H4028V-291Q4028 -252 4045.5 -232.5Q4063 -213 4100 -213Q4175 -213 4265 -256L4234 -22Q4187 0 4131 12Q4075 24 4008 24ZM4898 24Q4749 24 4641 -41Q4533 -106 4475 -226Q4417 -346 4417 -512Q4417 -676 4476 -796Q4535 -916 4643 -981Q4751 -1046 4898 -1046Q5025 -1046 5128 -993.5Q5231 -941 5291.5 -833.5Q5352 -726 5352 -562Q5352 -534 5351 -494.5Q5350 -455 5345 -416H4686Q4688 -353 4714.5 -307Q4741 -261 4788 -235.5Q4835 -210 4899 -210Q4975 -210 5028 -234.5Q5081 -259 5130 -315L5288 -154Q5219 -73 5122.5 -24.5Q5026 24 4898 24ZM4689 -626H5088Q5082 -685 5058 -727Q5034 -769 4992.5 -790.5Q4951 -812 4892 -812Q4811 -812 4755.5 -764Q4700 -716 4689 -626ZM5574 0V-1022H5849V-920Q5874 -973 5933.5 -1009.5Q5993 -1046 6054 -1046Q6168 -1046 6246 -964L6209 -713Q6165 -751 6125 -766Q6085 -781 6035 -781Q5976 -781 5934.5 -754.5Q5893 -728 5871 -677Q5849 -626 5849 -554V0ZM6371 0V-1022H6646V-928Q6697 -990 6756 -1018Q6815 -1046 6890 -1046Q6981 -1046 7044 -1010Q7107 -974 7142 -902Q7193 -972 7274.5 -1009Q7356 -1046 7458 -1046Q7654 -1046 7750 -945Q7846 -844 7846 -636V0H7571V-538Q7571 -666 7533 -724Q7495 -782 7411 -782Q7353 -782 7316.5 -757.5Q7280 -733 7263 -681Q7246 -629 7246 -545V0H6971V-538Q6971 -667 6933.5 -724.5Q6896 -782 6812 -782Q6724 -782 6685 -727Q6646 -672 6646 -547V0ZM8120 0V-1022H8395V0ZM8257 -1131Q8192 -1131 8145 -1178Q8098 -1225 8098 -1290Q8098 -1355 8144.5 -1401Q8191 -1447 8257 -1447Q8326 -1447 8371.5 -1402Q8417 -1357 8417 -1290Q8417 -1224 8370.5 -1177.5Q8324 -1131 8257 -1131ZM8679 0V-1022H8954V-926Q9003 -986 9072.5 -1016Q9142 -1046 9231 -1046Q9398 -1046 9492 -942.5Q9586 -839 9586 -654V0H9311V-541Q9311 -669 9271 -725.5Q9231 -782 9140 -782Q9044 -782 8999 -724.5Q8954 -667 8954 -545V0ZM10203 24Q10038 24 9943 -80.5Q9848 -185 9848 -368V-1022H10123V-481Q10123 -352 10163 -296Q10203 -240 10293 -240Q10390 -240 10435 -297.5Q10480 -355 10480 -477V-1022H10755V0H10480V-95Q10434 -37 10363 -6.5Q10292 24 10203 24ZM11381 24Q11258 24 11145 -28.5Q11032 -81 10968 -169L11144 -318Q11195 -266 11262 -234Q11329 -202 11390 -202Q11460 -202 11498 -224.5Q11536 -247 11536 -289Q11536 -315 11518 -335.5Q11500 -356 11452 -379Q11404 -402 11314 -435Q11140 -498 11069 -571.5Q10998 -645 10998 -758Q10998 -887 11102 -966.5Q11206 -1046 11374 -1046Q11487 -1046 11584 -1003Q11681 -960 11751 -878L11574 -731Q11484 -820 11368 -820Q11313 -820 11279 -799.5Q11245 -779 11245 -747Q11245 -715 11286 -688.5Q11327 -662 11441 -627Q11561 -591 11636.5 -544Q11712 -497 11747.5 -434.5Q11783 -372 11783 -290Q11783 -143 11675.5 -59.5Q11568 24 11381 24Z
```
The mark group inside the lockup is `<g transform="translate(-622.2 -3188.9) scale(9.7222)">` around the `full` mark. Copy both strings into `src/lib/brand-mark.ts` (`WORDMARK`, `LOCKUP`), as Keyrook did.

- **Sizes:** header lockup 32px high at ≥1280px (≈231px wide), 28px at 1024–1279px (≈202px), 26px on mobile (≈188px); below 120px of available width use the mark alone. Clear space: the cap height of "K" on all sides. Never on a cover, never with effects.
- **Monochrome:** everything `currentColor` (key, bar and letters) — used in the PDF invoice footer, print and single-colour placements.
- **Dark / board placements:** letters and key `--color-on-board` / `--color-text`, bar `#E6B84A`.

### 9.3 Favicon and app icons
- `src/app/icon.svg` (done): the `small` mark in warm white `#F2EDE1` with a mustard `#E6B84A` bar on a graphite `#222426` tile with a 40-unit radius (≈2px at 28px — the flap radius), and a 12-unit **hinge** `#0E0F10` across the middle, so the icon is literally the key printed on a split flap. The tile stays graphite on light and dark browser chrome.
- `scripts/gen-favicons.mjs`: replace its inline SVGs with the same tile — `small` + hinge 12 for 16/32px and `favicon.ico`; `full` + hinge 8 for `apple-touch-icon.png` (180), `android-chrome-192x192.png`, `android-chrome-512x512.png`; and generate `email-logo.png` (2×, 286×56) from the lockup in Night colours (warm white letters, `#E6B84A` bar) for the graphite email header. Replace `public/favicon.svg` with a copy of `src/app/icon.svg`; replace `public/logo.svg` / `logo-dark.svg` with the lockup in Day (`#1B1C1D` + `#D29D1A`) and Night (`#EEE9DE` + `#E6B84A`) colours.
- `public/manifest.json`: `name`/`short_name` "Keyterminus", description "Game keys, DLC, gift cards and subscriptions for every major platform, delivered to your account.", `theme_color: #222426`, `background_color: #F4F1EA`.
- `viewport.themeColor` in `layout.tsx`: light `#F4F1EA`, dark `#121314`.
- `BrandMark.tsx`: `Mark` (`size: "full" | "small"`) and `Wordmark` (lockup; `mark={false}` for letters only), `currentColor` for ink and `var(--color-accent-hover)` (Day) / `var(--color-terminus)` (Night, board) for the bar via a `--logo-bar` custom property set per theme; no hex.
- **Root metadata:** title template "%s · Keyterminus"; description "Game keys, DLC, gift cards and subscriptions for Steam, Xbox, PlayStation, Nintendo and more. Pay on a hosted card page; your key is delivered to your account, usually within minutes after payment is confirmed."; OG/Twitter images: the warm white floor, a graphite board panel at the right with four blank-then-filled flap rows of the store's *own words* ("GAME KEYS", "GIFT CARDS", "DLC", "SUBSCRIPTIONS" with `ON TIME` remarks) — no covers, no product titles (they change) — and the lockup + H1 at the left.

---

## 10. Motif usage rules

### 10.1 Flaps
- **Are:** graphite tiles with a hinge, one character each; rows of them are boards.
- **Used on:** the hero board, home mini-boards (platform peek, revised fares, theater tabs board), platform tiles, gate strips, the deal tile, the cart and quantity counters, the order number on confirmation, the key board, the 404, the gift card value, the OG image.
- **Never:** on body text, on prices in grids (prices are plain mono; flaps are slower to read), with invented content, or animating continuously. Every flap shows a real value, or sample data inside the theater labelled "Sample data".

### 10.2 Route lines and the terminus bar
- **Used on:** home genre routes, the "through the gate" payment line, checkout and registration progress, the order timeline, the footer platform line, the mark.
- **Never:** as a decorative divider, a progress bar for anything that isn't a sequence of real steps or a list of real destinations, or a transit map with invented geography.

### 10.3 Signage
- **Sign labels** (uppercase Overpass 700 12px, 0.14em) are the only uppercase text off the board.
- **Platform tiles** always sit next to the platform's name.
- **`ArrowBigRight`** marks directional links; never decorative, never two in a row.
- **Sign plates** (4px radius, 1.5px ink border or `--color-board` fill) are reserved for large platform signs, "through the gate" plates and "Company notice". Not for generic boxes.

### 10.4 Material rules
- The board is the only dark object on Day pages besides the information strip, gate strips and the hero hall.
- No textures, grain, noise, paper, metal, glass. Depth comes from the board versus the floor, never from stacked outlines.
- One WebGL context per page, home only.

---

## 11. Header, concourse map, mobile menu, footer

### 11.1 Header (≥1024px) — information strip + concourse bar
Keyrook had an overlap bug in its status rail. Here every cell has a declared budget and the rules guarantee no overlap from 1024 to 1920px.

**Information strip** (32px, `--color-board`, `data-surface="board"`, full bleed, inner `max-w-container`; `max-w-wide` ≥1600px):
- Grid: `grid-template-columns: minmax(0, 1fr) auto`, column gap 24px.
- **Left cell** (`min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis`): a 6×14px mustard terminus bar, then `STORE_POLICY.delivery.rail` ("Delivery: usually within minutes", ≈223px in Sometype 400 12px, `--color-on-board`), as a link to the Delivery policy. Short form only, at every width. Nothing else lives here: no clock, no ticker, no counts.
- **Right cell** (`flex-shrink: 0`, ≈230px): Link "Help" (→ /faq) · currency select (mono "EUR", 56px, board colours) · theme toggle (`Sunrise` "Day" / `Sunset` "Night", 13px label; `aria-label` "Switch to Night" / "Switch to Day"). 1px `--color-board-edge` separators.
- Worst case at 1024px: 223 + 24 + 230 = 477px of 944px available.

**Concourse bar** (64px, `--color-rig` = floor colour, 1px bottom hairline; inner `max-w-container`, `max-w-wide` ≥1600px):
- Grid: `grid-template-columns: auto minmax(0, auto) minmax(180px, 440px) auto`, column gap 28px (24px below 1280), `align-items: center`. Column 2 is `overflow: hidden` and its links are `white-space: nowrap; flex-shrink: 0`; a nav item that doesn't fit is **removed by breakpoint**, never wrapped or squeezed.
- **Col 1 — lockup** linking to "/": 28px high (≈202px) below 1280, 32px (≈231px) from 1280.
- **Col 2 — nav** (Overpass 700 15px, sentence case, 20px gaps; active = 3px mustard bar under the full label; hover ink from muted):

  | Item | Width at 15px | Shown from |
  |---|---|---|
  | Platforms + `SquareChevronDown` 14px (opens the concourse map) | 90px | 1024 |
  | Games | 48px | 1024 |
  | Gift cards | 68px | 1024 |
  | Price cuts | 70px | 1024 |
  | DLC | 28px | 1280 |
  | Subscriptions | 95px | 1440 |
  | New arrivals | 87px | 1600 |

- **Col 3 — search field** (40px, 6px radius, `--color-raised`, 1px control border, `Search` 18px, placeholder "Search 69,700 keys" (real, §8.28), a mono `/` hint in a sm flap at the right). Flexes between 180px and 440px. Opens the kiosk.
- **Col 4 — actions:** Account (`IdCard`) and Cart (`Ticket` + `FlapCounter`). **Icons only below 1280px** (44px each, `aria-label`s, ≈112px with the count), **icon + word from 1280px** ("Account" or "Sign in"; "Cart") ≈213px.
- **Width budget (measured with Overpass 700 15px, content = viewport − 80px, capped by the container):**

  | Viewport | Content | Lockup | Nav (items + gaps) | Search min | Actions | Gaps | Total at search min | Spare |
  |---|---|---|---|---|---|---|---|---|
  | 1024 | 944 | 202 | 336 | 180 | 112 | 72 | 902 | 42 |
  | 1280 | 1200 | 231 | 384 | 180 | 213 | 84 | 1092 | 108 |
  | 1440 | 1360 | 231 | 499 | 180 | 213 | 84 | 1207 | 153 |
  | 1600 | 1520 | 231 | 606 | 180 | 213 | 84 | 1314 | 206 |
  | 1920 | 1520 | 231 | 606 | 180 | 213 | 84 | 1314 | 206 |

  Spare width goes to the search field up to 440px. Verify with Playwright at 1024, 1100, 1279, 1280, 1439, 1440, 1599, 1600 and 1920 that no element's bounding box intersects another (assert in the e2e smoke test).
- **Behaviour:** sticky. After 120px of scroll down the strip slides up behind the bar (translateY −32px, 180ms) and the header occupies 64px; scrolling up 32px brings it back. Height reserved (`--header-height` 96px); no layout shift.

### 11.2 Concourse map (replaces `VaultMap`; opens from "Platforms")
A full-width panel under the bar: `--color-raised`, `--shadow-overlay`, 32px padding, max-height 76vh, `panel-drop` 180ms. Laid out as a station's wall map:
- **Cols 1–5 — Platforms:** a two-column list of platform signs in `PLATFORM_BOARD` order with stock only: sm platform tile, name (Overpass 700 16px), real count and "from €0.49" (mono 12px muted). Hover/focus highlights the row with `--color-accent-light` and fills the preview.
- **Cols 6–8 — Types and fare zones:** types in `TYPE_ORDER` with icons and counts; a hairline; the six fare zones (§18.4) with counts in the active currency.
- **Cols 9–12 — Preview:** a mini-board (board housing, 3 board rows of the hovered platform's top real titles: price | title | remark) plus "All Steam keys · 40,737" with `ArrowBigRight`. Rows flip in (M2) on change. Omitted when there is no data.
- Below: genre routes as a single row of text links in `ROUTE_ORDER` with counts (top 12) and "All genres".
- Opens on click and hover-intent (150ms); closes on leave (250ms grace), Esc, or focus leaving; `aria-expanded`, `aria-controls`; arrow keys within and across columns.

### 11.3 Mobile header (<1024px)
- No information strip. A 56px bar: lockup 26px left; right: `Search` icon button, `Ticket` with `FlapCounter`, `Rows3` labelled "Menu". 1px bottom hairline. Total right cluster 3×44 + count ≈ 152px; lockup 188px; at 360px viewport (328 content) this leaves −12px — so **below 400px the lockup becomes the mark only (40px)** and below 340px the search button moves into the menu. Assert at 320, 360, 390, 430px.
- **Search** opens a full-screen kiosk: input on top, platform rows as a 2-column list of platform signs, recent searches (local only).
- **Menu** opens a bottom sheet to 92vh (`--color-raised`, top corners 8px, `--shadow-xl`): the delivery line (with the terminus bar) at the top; Platforms as a 2-column list of signs; Types as large rows with counts; Price cuts and New arrivals rows; Account rows (Keys, Orders, Saved, Profile, or Sign in); Help (How activation works, FAQ, Contact); currency select; theme as a segmented control (Day / Night). A 36×4 grab handle (2px radius), `X`, focus trap, Esc.

### 11.4 Footer — the end of the line
On `--color-floor` (= band; theme-following: warm band by day, near-black by night), inside `max-w-wide`. Keyrook and Fablekeys both used dark slab footers; this one is part of the concourse.
1. **The platform line:** a horizontal route line (§8.23) spanning the container with one stop per stocked platform in `PLATFORM_BOARD` order — each stop a link with the sm platform tile and name under it — ending in a 6×40px mustard **terminus bar** at the right edge with the sign label "ALL KEYS" (link to /catalog) beside it. It is the footer's top edge and a real navigation row. 64px of space after it.
2. **Four columns** (desktop; 32px gaps, no rules):
   - **Shop:** Games, Gift cards, Subscriptions, DLC, Top-ups, Software, Price cuts, New arrivals, All keys.
   - **Your account:** Keys, Orders, Saved, Profile, Cart.
   - **Help:** How activation works, Delivery, Key not working?, FAQ, Contact us.
   - **Legal:** Terms and conditions, Privacy policy, Refund policy, Cookie policy, All policies, and the button "Cookie settings".

   Heads are sign labels (muted). Links Overpass 15px ink, underline on hover.
3. **Company notice:** a sign plate (4px radius, 1.5px ink border, `--color-raised`, 24px padding) titled with the sign label "COMPANY NOTICE", then "Keyterminus is a trading name of {COMPANY.name}." in Overpass 700 step-1, then a ruled two-column definition list (sign-label terms, Overpass 15px values, identifiers in mono 14px): Company number `COMPANY.companyNumber` · VAT number (only when `COMPANY.vatRegistered`) · Registered office `COMPANY.registeredOffice`, `COMPANY.country` · Email (mailto `COMPANY.email`) · Phone (only when not null) · Support hours `COMPANY.supportHours`. All values from `src/lib/company.ts` (placeholders until supplied).
4. **Disclaimer** (Overpass 14px muted, 66ch): "Keyterminus is an independent store and is not affiliated with or endorsed by Valve, Microsoft, Sony Interactive Entertainment, Nintendo, Epic Games, CD PROJEKT, Electronic Arts, Ubisoft, Blizzard Entertainment or Rockstar Games. Game titles, platform names and cover art belong to their owners." (Order differs from the siblings' on purpose; platform order matches `PLATFORM_BOARD`.)
5. **Bottom row** (1px top hairline, 24px padding): left "© {year} Keyterminus" 14px muted; right the **logo strip** — a 4px-radius plate in `--color-logo-strip` (white in both themes) holding `/payments/visa.svg`, `/payments/mastercard.svg`, `/payments/pci-dss.svg` via `next/image` at 28px high, width auto, **in colour as supplied**, alts "Visa", "Mastercard", "PCI DSS compliant", 14px gaps. Social text links only if env URLs are set. **Mandatory on every store page.**
6. **Mobile:** the platform line turns vertical (stops top to bottom, terminus bar at the bottom); columns become accordions; Company notice one column; the logo strip centred at 24px; copyright last.

Checkout uses a compact footer: policy links, the trading-name line, the logo strip.

---

## 12. The theater: "Your key departs"

### 12.1 What it is and where it lives
The engine in `src/components/theater` (ported from allship-ai for Keyrook) stays: `define.ts`, `engine/runner.ts`, `engine/geometry.ts`, `engine/engine.tsx` (on the shared ticker), `stage.tsx` (election, lazy load, `visibilitychange`, reduced-motion stills, finish/replay), `still.tsx`, `sync.tsx`, `spotlight.tsx`, `mini-still.tsx`, `tabs.tsx`/`tabs-client.tsx` (keyboard, auto-advance), `scenes/loaders.ts`, timing constants (`lead 450`, `press 120`, `release 240`, `char 55`, `stream 16`, `scroll 560`, `highlight 1700`, `highlightGap 260`, `tail 2200`, `fade 380`, cursor travel `340 + d × 0.55` clamped 420–950ms). Views stay pure functions of state.

Retold as one journey with five stops (scene ids change; update `SceneId`, `SCENE_ORDER`, loaders, `messages/en/theater.json`):

| Old id | New id | Tab label | Remark shown on the tabs board |
|---|---|---|---|
| `pick` | `checkin` | Check in | `CHECK-IN` |
| `pay` | `pay` | Pay | `BOARDING` |
| `decrypt` | `depart` | Departs | `DEPARTED` |
| `redeem` | `arrive` | Arrives | `ARRIVED` |
| `support` | `help` | Help desk | `HELP DESK` |

`pay` stays gated by `STORE_POLICY.payment.hostedPage && threeDSecure`; `help` by `STORE_POLICY.guarantee.faultyKey`.

| Surface | Use |
|---|---|
| Home §14.1 section 4 | `TheaterTabs` with all scenes, auto-advancing |
| How activation works | `FeatureSpotlight` with **Departs** and **Arrives** (per platform) |
| Home section 9 (Arrivals) | `MiniStill` of **Arrives** for the selected platform |
| Home section 10 (Through the gate) | `MiniStill` of **Pay** at its challenge state |

No theater on catalogue, product, cart, checkout or account pages.

### 12.2 What changes
| File | Change |
|---|---|
| `types.ts`, `scenes/meta.ts`, `scenes/loaders.ts`, `scenes/index.ts` | new ids (§12.1) |
| `frame.tsx` | rebuilt as the **station monitor** (§12.4) |
| `tabs-client.tsx` | rendered as the **tabs board** (§12.5) |
| `sync.tsx` | step list restyled (§12.5) |
| `sample-cover.tsx` | new flat compositions (§12.3) |
| `scenes/kit.tsx` | `DemoHeader` = the new strip-less concourse bar (lockup, search, `IdCard`, `Ticket` + `FlapCounter`) |
| `scenes/data.ts` | new sample titles, key, order (§12.3) |
| `scenes/*.tsx` | views use the new components in demo mode: `DepartureCard`, `BuyBox`, edition timetable, `KeyBoard`, `OrderTimeline` (route line), `Field`, `Button`, `Choice`, `Tag`, `PriceDisplay`, `Flap*`, `RouteLine` |
| `src/styles/theater.css` | colours from tokens; `--sample-*` pairs replaced |

Demo mode keeps the contract: `demo?: boolean`, links as `<span>`, no fetches, targets via `data-demo`. Components never import theater code.

### 12.3 Sample data (new — nothing shared with siblings)
- Titles (fictional): "Copperline Express", "Harbour Lights Rally", "Northbound", "Salt Flats GP", "Signal Hill", "Midnight Shuttle". Main title **Copperline Express** (Standard €22.49, Deluxe Edition €31.99, "+ Season Pass"), Steam, Global, languages EN/DE/FR/ES/PL.
- Order number `KT-30517`, created 2026-10-06 14:18 UTC, paid 14:19, issued 14:20.
- Sample key `RT4QZ-0OK7M-I1XQ8` (contains `0`/`O` and `1`/`I`, so the slashed zero and the distinct `1 I` are visible).
- Library rows (Arrives): "Signal Hill", "Northbound", "Salt Flats GP", "Midnight Shuttle".
- `SampleCover`: deterministic flat composition from the title seed — a horizon band and one large route line with a terminus bar, or two stacked rectangles and a ring — from six two-colour pairs defined as `--sample-1-a/b` … `--sample-6-a/b` in `theater.css` (muted, non-mustard, non-green: slate/sand, rust/stone, olive/cream, plum/fog, teal-grey/bone, brick/oat), title in Overpass 800 at the bottom left. No gradients, no images. Every stage shows the neutral tag "Sample data".

### 12.4 The station monitor (`frame.tsx`)
- Housing: `--color-board`, 10px radius, 12px border (10px on phone), 1px `--color-board-edge`, `data-surface="board"`. No browser chrome, no traffic lights.
- Top strip (36px inside the housing): left an **address flap row** — the scene's URL path in mono 12px on a `--color-flap` slot with 2px radius ("keyterminus.com/account/keys"); right a small remark flap row with the scene's remark (§12.1) in `--color-remark`, flipping when the scene changes, and the tag "SAMPLE DATA". When Pay moves to the hosted page, the address reads "secure payment page · your payment provider" and a 3px `--color-board-info` bar appears at its left (the visitor left Keyterminus); the real provider name only once `STORE_POLICY.payment.providerName` is set.
- Screen: `--color-bg` of the current theme, 4px radius inside the housing.
- Cursor: inline SVG arrow, rounded 1px joins, ink fill with 1.5px `--color-bg` outline; text mode a 2px I-beam; phone preset a 28px tap ring (2px `--color-accent` circle scaling 0.6→1 and fading over 240ms). No glow.
- Spotlight: 2px `--color-accent` outline, 6px radius, 6px padding; the rest dims with `box-shadow: 0 0 0 100vmax var(--color-scrim)` clipped by the screen.
- Tip: `--color-raised` panel (max 300px, 6px radius, `--shadow-overlay`) with the sign label "NOTE" and Overpass 14px text.

### 12.5 Tabs board and controls
- **Tabs board** (`tabs-client.tsx`): the tablist is a mini departures board (board housing, 10px radius). Each tab is a board row (48px): `0 1` in flaps, the label in Overpass 700 15px `--color-on-board`, the duration in mono ("14s") muted, and a REMARKS cell: `PLAYING` (mustard) on the active row, `DONE` (muted) on finished rows, blank on the rest. The active row gets a `--color-flap` background. When a scene finishes, the next row's remark flips to `PLAYING` (auto-advance 900ms). WAI-ARIA tabs (vertical orientation on desktop, arrows/Home/End).
- **Mobile:** the tabs become a horizontal scroller of compact rows (`01 Check in`), active scrolled into view.
- **Under the stage:** chapter counter "02/04" as a small `FlapRow`; the current caption (Overpass 16px ink, `aria-hidden`); the play/pause/replay control — a 44px **circle** (`rounded-round`), 1.5px ink border, `Play`/`Pause`/`Repeat` 18px, labels "Play demo"/"Pause demo"/"Replay demo".
- **`TheaterSteps`:** an ordered list styled as a vertical route line: each caption is a stop; done = ink stop with `Check`; current = mustard stop, ink text; upcoming = hollow, muted.

### 12.6 Scenes, frame by frame
Times are start times (ms) using the constants and a nominal 650ms travel; `click` ≈ 1,010; `highlight` ≈ 1,960; tail 2,200.

#### S1 — Check in (`checkin`, `/search?q=…` → `/product/copperline-express-deluxe-steam-key`, ≈14.4s)
State `{ q: "", results: false, open: false, edition: "standard", added: false, cart: 0, cartFlip: 0 }`.

| # | Start | Step | Target | ms | Effect | Caption |
|---|---|---|---|---|---|---|
| 0 | 0 | lead | — | 450 | cursor appears lower right | |
| 1 | 450 | caption | — | 0 | | Search the board by title, platform or genre |
| 2 | 450 | wait | — | 400 | | |
| 3 | 850 | type | `search` | ≈1,870 | kiosk fills "copperline" | |
| 4 | 2,720 | set | — | 0 | `results: true`; six departure cards appear (`sign-in`, 70ms stagger in the View) | |
| 5 | 2,720 | wait | — | 500 | | |
| 6 | 3,220 | caption | — | 0 | | Every card names its platform and region |
| 7 | 3,220 | highlight | `card-1-gate` | 1,960 | tip: "Platform 1 · Steam · Global. Global means no regional lock." | |
| 8 | 5,180 | click | `card-1` | 1,010 | `open: true`; PDP replaces results (translateX 24px→0 + fade 240ms) | |
| 9 | 6,190 | caption | — | 0 | | Pick the edition and check the requirements |
| 10 | 6,190 | click | `edition-deluxe` | 1,010 | edition timetable row selected; price flips to €31.99 | |
| 11 | 7,200 | wait | — | 400 | | |
| 12 | 7,600 | highlight | `requirements` | 1,960 | tip: "Needs a Steam account. Languages: EN, DE, FR, ES, PL. Delivered to your account." | |
| 13 | 9,560 | caption | — | 0 | | Add it to your cart |
| 14 | 9,560 | click | `add` | 1,010 | `added: true, cart: 1`; Add → "In cart" | |
| 15 | 10,570 | tween | `cartFlip` → 1 | 280 | header cart flap flips 0→1 | |
| 16 | 10,850 | wait | — | 1,200 | | |
| — | 12,050 | tail | — | 2,200 | | |

#### S2 — Pay (`pay`, `/checkout` → hosted page → `/order/KT-30517`, ≈17.2s)
State `{ terms: false, consent: false, step: "review", card: "", exp: "", cvc: "", approving: 0 }`. Same step structure as Keyrook's Pay scene (it is the functional truth of the payment flow), restyled: route-line progress at "Review & pay", the waiver checkbox text is exactly `STORE_POLICY.waiver.text`, sample card "4000 0000 0000 4821", exp "09/29", cvc rendered "•••", the bank dialog with the flap loader and "Approve this payment in your banking app", then back on Keyterminus with "Payment confirmed" and the order timeline's second stop current. Captions: "Confirm the order and the delivery terms" · "Card details go into the payment provider's hosted page" · "Your bank confirms it's you with 3-D Secure" · "We receive the confirmation, never your card number". Highlight tip at the end: "Keyterminus receives: payment confirmed, amount, order number. The card number stays with the payment provider." `MiniStill` override for section 10: `{ step: "challenge", approving: 0.6 }`.

#### S3 — Departs (`depart`, `/account/keys`, ≈13.6s)
State `{ issue: 0, status: "paid", masked: true, flip: 0, copied: false }`.

| # | Start | Step | Target | ms | Effect | Caption |
|---|---|---|---|---|---|---|
| 0 | 0 | lead | — | 450 | | |
| 1 | 450 | caption | — | 0 | | Payment confirmed: your key departs for your account |
| 2 | 450 | tween | `issue` → 1 | 1,400 | the order timeline draws from "Payment confirmed" to "Key issued"; sample times appear | |
| 3 | 1,850 | set | — | 0 | `status: "issued"`; the key board's status reads "Ready"; the monitor remark flips to `DEPARTED` | |
| 4 | 1,850 | caption | — | 0 | | It waits on blank flaps until you reveal it |
| 5 | 1,850 | highlight | `board` | 1,960 | tip: "Stored encrypted. Decrypted only when you choose Reveal." | |
| 6 | 3,810 | click | `reveal` | 1,010 | `masked: false` | |
| 7 | 4,820 | tween | `flip` → 1 (linear) | 1,100 | flaps flip into place left→right (`flapFrame`) | |
| 8 | 5,920 | caption | — | 0 | | Copy it, or open the platform's redeem page |
| 9 | 5,920 | click | `copy` | 1,010 | "Copied" with `Check` | |
| 10 | 6,930 | wait | — | 900 | | |
| 11 | 7,830 | highlight | `redeem` | 1,960 | tip: "Opens Steam's own redeem page in a new tab" | |
| 12 | 9,790 | wait | — | 800 | | |
| — | 10,590 | tail | — | 2,200 | | |

End/still: revealed, not copied.

#### S4 — Arrives (`arrive`, address label "{Platform} app", ≈10.5s)
Keep Keyrook's Redeem structure and config-driven menu paths (generic neutral launcher window: a `--color-raised` panel, title bar with the platform name as text, a left library column; no platform logos or chrome imitation). Restyle and recaption: "Open {name}: {path}" · "Paste your key" · "The game arrives in your library". When `done`, the monitor remark flips to `ARRIVED`. The library row slides in at the top (translateY −8px→0 + fade, 260ms).

#### S5 — Help desk (`help`, `/account/orders/KT-30517`, ≈13.6s)
Keep Keyrook's Support structure (report → reason "Already redeemed" → note "Steam says this key was already used." → send → "Checking" with the flap loader → `outcome: "replaced"`): the old key board collapses to "Replaced on …" and the new board's flaps flip in. Captions: "Key not working? Report it from the order" · "We check it and reply within {replyTime}" · "A faulty key is replaced, or refunded". Tip: "Sample outcome. A key that doesn't work through no fault of yours is replaced, or refunded if no replacement is available."

### 12.7 Accessibility and performance
- Stage = `<figure aria-label={summary}>`; animated box `aria-hidden` + `inert`; visually hidden `figcaption` (summary + "Illustration with sample data."); full caption list as `<ol>` (hidden while playing, visible under reduced motion).
- Auto-play only when ≥20% visible and elected; pauses on hidden tab; always a pause control; no sound.
- Reduced motion: engine never loads; each scene renders as a `Still` of `resolveEnd(scene)` + `scene.end`; tabs switch stills instantly; tabs-board remarks static.
- Nothing flashes more than three times per second over a large area; flap flips in scenes affect ≤ 20 small tiles at once.
- Engine chunk (≈12 KB gzip) loads when near (300px), after load-idle or on first interaction; scenes are lazy chunks; ≤150 DOM nodes per scene; sample covers inline SVG; one theater plays at a time.

---

## 13. Motion hooks for the motion engineer

Use the data-attribute engine (`src/lib/motion/engine.ts`) and the single ticker (`src/lib/motion/ticker.ts`). The store-pages engineer leaves markup hooks and the **static end state** of every moment; the motion engineer adds behaviour. Remove the `vault-door`, `door-ajar`, `ledger`, `releases`, `tumblers`, `index-slide` registrations and register the scenes below.

### 13.1 Depth layers (pointer amplitudes are maxima at the viewport edge, fine pointers only)
| Layer | Content | Pointer offset | Scroll speed |
|---|---|---|---|
| D0 | hall floor, section bands, the hero hall background | 0 | 0 |
| D1 | board housings, route lines, rail tracks, the footer platform line | 2px | ±0.03 |
| D2 | flaps inside housings, departure cards inside rails, gift card blank | 4px | ±0.06 |
| D3 | covers inside cards (move 3px against their card) | 6px | ±0.1 |
| GL | the hero board scene: camera and uniforms only | — | scene-driven |
| L0 | headlines, body, CTAs, prices, filters, search | 0 | 0 |

Readable text, prices and CTAs never move with parallax. Store surfaces (catalogue, product, cart, checkout, account, policies) get only M6, M7, M8, M9 and the flap counters — no scroll parallax.

### 13.2 Named moments
| ID | Name | Where | Communicates | Static / reduced-motion state |
|---|---|---|---|---|
| M1 | **The board** (signature) | home hero | the whole catalogue is live and searchable; real keys, real prices | DOM board, page 1, complete |
| M2 | Platform peek | home Platforms, concourse map preview | what's on this platform right now | mini-board shows platform 1 |
| M3 | Rail glide | home timetable rails | where you are along the line | native scroller, position bar static |
| M4 | Theater | home, activation guide | exactly what happens, step by step | stills + step lists |
| M5 | Route trace | home routes, through the gate, footer line | where each line goes, and where it ends | lines fully drawn |
| M6 | Gate flip | departure card hover | this departure is selected | none |
| M7 | Check-in | add to cart anywhere | it went into your cart | count updated, toast |
| M8 | Next stop | order timeline, checkout progress | your order / checkout moved on | new state shown |
| M9 | Key flip | key board reveal, theater S3 | your key is on the board now | key shown at once |
| M10 | Fare revision | home revised fares | these prices really dropped | was and now shown side by side |
| M11 | Denomination flip | home gift cards | the value you chose | chosen value shown |
| M12 | Sign in | landing section headings and sign plates | this section arrived | visible |

#### M1 The board (home hero, the signature moment)
**Markup** (store-pages engineer):
- `section#departures[data-scene="board"]` full bleed on `--color-board` (the hall), `data-surface="board"`.
- Inside, `div[data-board]` = the **DOM board**: a `<table>` with `<caption class="sr-only">Departures: keys on the board right now</caption>`, column heads (sign labels in `--color-on-board-muted`: PRICE · DESTINATION · PLATFORM · REMARKS), and 6 `<tr>` rows (4 on mobile). Each row's title cell holds a real `<a href="/product/…">`; every cell renders its text as a `FlapRow` (`aria-hidden`) plus a visually hidden plain-text copy. Row height and cell size come from CSS variables `--board-cell-w`, `--board-cell-h`, `--board-cols` so the canvas can match them exactly.
- `canvas[data-board-gl][aria-hidden="true"]` absolutely positioned over the DOM board's flap area; `pointer-events: none` (links stay clickable underneath).
- Server data: `boardPages` — 3 pages × 6 rows (18 distinct real products, §18.5) with `{ href, priceLabel, title (uppercased, trimmed at a word boundary to the title column width), platformBoardLabel, remark }`.
- Controls under the board (L0): Sign sm "Pause board" / "Play board" (`aria-pressed`), mono "Page 1 of 3" (`aria-live="polite"`), Sign sm "Next 6". Under reduced motion only "Next 6" and the page readout.

**Column layout (cells):**
| Breakpoint | PRICE | gap | DESTINATION | gap | PLATFORM | gap | REMARKS | Total | Cell size |
|---|---|---|---|---|---|---|---|---|---|
| ≥1280 | 7 | 1 | 22 | 1 | 11 | 1 | 9 | 52 | ≈24×36px within `max-w-container` |
| 1024–1279 | 7 | 1 | 16 | 1 | 11 | 1 | 9 | 46 | ≈19×30px |
| 640–1023 (two lines per row) | line 2: 7 | 1 | line 1: 22 | — | line 2: 11 | 1 | line 2: rest (2) or a tag under the row | 22 per line | ≈24×34px |
| <640 (two lines per row, 4 rows) | line 2: 7 | 1 | line 1: 16 | — | line 2: 8 | — | a tag under the row | 16 per line | ≈20×30px at 390 |

Prices are right-aligned in their column ("€22.49", "€149.99"); titles left-aligned; blank flaps pad the rest. On <640 platform labels use the 8-character forms (`STEAM`, `XBOX`, `PS`, `NINTENDO`, `EPIC`, `GOG`, `EA APP`, `UBISOFT`, `BNET`… only where 11 doesn't fit; the visually hidden text always says the full name).

**Library:** `ogl` 1.0.11 (already installed), dynamically imported in an idle callback after LCP. Reuse the scaffold patterns from the old door controller (context loss, DPR cap, idle boot, pause on hidden, dispose with `WEBGL_lose_context`).

**Geometry and rendering** (procedural, no model files):
- **Glyph atlas:** Canvas2D after `document.fonts.ready`, Sometype Mono 700, the drum characters (§6) in `--color-on-board` on transparent, one 64×96 cell per glyph, 2048×512 texture; remark glyphs reuse the atlas and are tinted by an instance colour attribute (`--color-remark`). Colours are read from tokens at boot.
- **Per cell, three instanced quads:** static top half (shows the *next* character's top), static bottom half (shows the *current* character's bottom until the leaf lands), and the **leaf** (front = current top, back = next bottom) rotating 0→−180° about the hinge. Three instanced meshes total (tops, bottoms, leaves) plus one housing quad = **4 draw calls**.
- **Shading:** flat flap colour (top half `--color-flap-top`, bottom `--color-flap`); the leaf darkens with `cos(angle)` toward 90° (light from above) and the bottom half under a falling leaf darkens by up to 18% proportional to the leaf angle (its shadow); a 2px hinge line; no bloom, no glow, no reflections.
- **Camera:** perspective, the board slightly pitched as if hung above eye level (rotateX −4°). Fine pointers: yaw/pitch ±2° with damping (D-GL).

**Behaviour:**
| Trigger | What happens |
|---|---|
| First frame | The canvas cross-fades in over the identical DOM board (400ms); nothing flips. |
| Load + 900ms | One "arrival" pass: every cell flips from blank to its page-1 character (§6 timing; whole board ≤1.6s). |
| Every 7s (`boardPage`) | Rows flip to the next page (rows staggered 60ms, cells 18ms). Stops after 3 full cycles, when off-screen, on a hidden tab, or when the visitor pauses, hovers the board, or focuses the search field. |
| Hero search typing | Debounced 250ms, the existing search endpoint returns the top 6 live matches; the board flips to them (title, platform, price, remark), and the page readout reads "Results for “copper”". Clearing the field flips back to page 1. No match: rows flip to `NO DEPARTURES MATCH` / `TRY THE TITLE WITHOUT THE EDITION`. Enter submits to `/search?q=`. The DOM rows update to the same data so links and screen readers stay right (`aria-live="polite"` on the page readout). |
| Pointer riffle (fine pointers) | Cells within 60px of the pointer lift their leaf 4–10° (damped), so the board reacts to the hand like real flaps in a draught. Hovering a row brightens its flap colour one step and shows the DOM row's link underline; clicking navigates. |
| Scroll out | As the hero leaves the viewport (progress 0→1 over its height), the board pitches back 0→12° and the hall darkens 6% (uniform). |

- **Poster first:** the DOM board is the poster — complete and readable before any JS. LCP is the H1, never the canvas.
- **Fallbacks:** coarse pointer, `deviceMemory < 4`, `saveData`, software renderer (`WEBGL_debug_renderer_info` matching swiftshader/llvmpipe/software), or context loss → **DOM flaps** animate with CSS (`Flap` leaf, changed cells only, same `flapFrame` timing; ≤ 160 cells). Mobile always uses DOM flaps.
- **Reduced motion:** static DOM board on page 1, no paging, no riffle, no pitch; "Next 6" swaps instantly; search swaps instantly.
- **Budgets:** 4 draw calls; one 2048×512 atlas; DPR ≤1.5; GPU ≤4ms/frame on desktop; board JS ≤40 KB gzip including OGL; paused off-screen and on hidden tabs; fully disposed on route change; `?t=` freezes time and `?page=2` freezes the page for screenshots.

#### M2 Platform peek
`[data-scene="peek"]` on home section 2 and the concourse map preview. Hover/focus on a platform sign → the mini-board's three rows flip to that platform's titles (DOM flaps), covers strip cross-fades (180ms). Default: platform 1. Touch: tap selects without navigating; a second tap (or the sign's own link) navigates. Reduced: instant swap.

#### M3 Rail glide
`[data-rail]` on each timetable rail. Fine pointers: drag-to-scroll with momentum (damped on the ticker), wheel-shift scroll, Sign icon buttons `ArrowBigLeft`/`ArrowBigRight`. The **position bar** under the rail (a 3px track in `--color-rule` with a mustard segment the width of the visible fraction) slides with scroll — it says where you are along the line. Cards entering the view rise 6px (D2) once. Mobile: native scroll-snap, position bar still updates. Reduced: no momentum, no rise.

#### M5 Route trace
`[data-scene="routes"]`, `[data-scene="gate"]`, `[data-route-line]` in the footer. On first entering view (20%), each line draws left→right (`route-draw`, 700ms, lines staggered 90ms), stops pop in behind the drawing head (`stop-in`, 160ms), and the terminus bar appears last. Hover/focus on a route: its terminus bar turns mustard and a 10×4px mustard marker travels the line once from the first stop to the terminus (600ms `--ease-in-out`). Reduced: drawn complete, marker never travels.

#### M6 Gate flip
`[data-gate]` on the gate strip's platform tile of departure cards: on card hover/focus-within, the tile flips once to the same number (single 140ms leaf). Fine pointers only. Grids never flip all at once.

#### M7 Check-in
On add: a ghost of the cover (40px wide) travels to the header `Ticket` along a gentle arc (380ms, `--ease-sign`); the cart `FlapCounter` flips; then the toast. Reuse `cart-flight.ts` with `data-cart-target`; skip the ghost if the header is off-screen.

#### M8 Next stop
The route-line segment to the new stop draws (scaleX or dashoffset, 420ms) and the mustard current marker moves to the new stop. Once per transition, never on first render.

#### M9 Key flip
`[data-key-board]` on `KeyBoard`. On successful reveal, `flapFrame` runs over ≤1100ms on the ticker (cells staggered 30ms left→right, each ≤6 visible steps); focus moves to Copy at the end. Replacement keys flip in the same way. Reduced: instant.

#### M10 Fare revision
`[data-scene="fares"]`. On first entering view, the NOW column of each row flips from the WAS value to the NOW value (row stagger 60ms), then the remark flips to `NOW −18%`. It shows the change that really happened; both values stay visible afterwards. Reduced: final state.

#### M11 Denomination flip
`[data-scene="giftcard"]`. Choosing a denomination flips the card's value flaps to the new value and swaps the price; choosing a platform flips the card face (rotateX 0→90° then a new face 90→0°, 300ms total). Reduced: instant swap.

#### M12 Sign in
`data-anim="sign"` on landing section headings, leads and sign plates: `sign-in` once at 560ms when 20% in view. Never on store surfaces.

### 13.3 Budgets and rules
- **WebGL:** only M1, home only; one context; DPR ≤1.5; after LCP via idle callback; never on coarse pointers, `deviceMemory < 4`, `saveData` or reduced motion. The DOM board is complete without it.
- **Home motion JS:** ≤40 KB gzip before interaction (engine scan, flaps, rails, route trace); OGL + board after LCP; theater engine and scenes lazy. GSAP and Lenis are **not** needed: the ticker plus CSS scroll-driven animations (`@supports (animation-timeline: view())`) cover M5 and M12; M1's scroll pitch uses one passive scroll listener feeding the ticker.
- **No pins on the home page.** (Keyrook pinned two; nothing here needs scroll-jacking.)
- **CLS 0.** Every scene reverts on route change.

---

## 14. Pages — layout specs

**Global skeleton:** information strip + concourse bar → breadcrumbs (everywhere except home, checkout and auth) → main → the end-of-line footer. The page H1 is the first heading in `main`. Unique title and description on every page. Routes stay as in the codebase: `/`, `/catalog`, `/catalog/[category]`, `/platform/[platform]`, `/genre/[slug]`, `/deals`, `/new-releases`, `/product/[slug]`, `/search`, `/cart`, `/checkout`, `/order/confirmed`, `/account/**`, `/auth/**`, `/how-activation-works`, `/about`, `/faq`, `/contact`, `/policies/**`, `/pages/[slug]`.

### 14.1 Home — twelve set-pieces, a different hall from Keyrook's vault and Fablekeys' theatre
Every count, minimum price, ranking and list comes from `getHomeData()` (rewritten per §18.5). A section whose data is empty or below its minimum is **omitted**, not padded. No product appears twice (claimed set). No stats tiles, testimonials, ratings, partner logos or invented numbers.

Keyrook: door → security strip → lockers → price cuts → theater → genre directory → release ruler → prepaid → activation → ledger → budget dial → questions → final door. Fablekeys: stage → volumes → shelves → fresh ink → storybook → redeem → formats → price cuts → editions → bookplates → questions → colophon → endpaper. Keyterminus:

| # | Section | Composition | Density | Padding top / bottom (desktop) | Background | Data |
|---|---|---|---|---|---|---|
| 1 | **Departures** (hero) | full-bleed graphite hall: H1 + lead + kiosk over a full-width board | medium | 56 / 40 | `--color-board` | `live`, `boardPages`, `syncedAt` |
| 2 | **Platforms** | 7 / 5: four large platform signs + compact rows · mini-board peek | medium | 104 / 88 | `--color-bg` | `platforms` |
| 3 | **Timetable** | three rails, each with a fixed route header (3 cols) + scrolling cards (9 cols) | dense | 88 / 88 | `--color-bg-secondary`, full bleed | `lines` |
| 4 | **Your key departs** (theater) | 8 / 4: monitor left, tabs board + steps right | sparse | 136 / 120 | `--color-bg` | — |
| 5 | **Routes** (genres) | 3 / 9: heading column · eight horizontal route lines | medium | 112 / 104 | `--color-bg` | `routes` |
| 6 | **Revised fares** (price cuts) | 4 / 8: explanation · a fares board | dense | 88 / 88 | `--color-bg-secondary`, full bleed | `fares` |
| 7 | **Gift cards** | 4 / 5 / 3: platform list · card blank · denominations | medium | 104 / 96 | `--color-bg` | `giftCards` |
| 8 | **Season tickets** (subscriptions) | 4 / 8: heading · printed timetable | dense | 64 / 96 | `--color-bg`, hairline top | `timetable` |
| 9 | **Arrivals** (how to redeem) | stacked: platform tiles row · 3 step columns + still | medium | 104 / 104 | `--color-bg-secondary`, full bleed | `activationPlatforms` |
| 10 | **Through the gate** (payment and key safety) | two sign plates side by side + a route line + Pay still | sparse | 120 / 120 | `--color-bg` | `POLICY_FACTS` |
| 11 | **Information desk** (questions) | 7 / 5: accordion · desk block | medium | 96 / 104 | `--color-bg`, hairline top | FAQ copy |
| 12 | **Terminus** (final search) | full-width track ending at a terminus bar; search + platform tiles | sparse | 96 / 120 | `--color-bg-tertiary` | `live`, `platforms` |

#### 1. Departures (M1)
**Desktop:** full-bleed `--color-board` hall, `data-surface="board"`, height `min(100svh − var(--header-height), 860px)`, content in `max-w-container`.
- **Top band (L0), 12 columns:**
  - cols 1–8: sign label "DEPARTURES · ALL PLATFORMS" in `--color-on-board-muted`; H1 at `--text-display`, Overpass 900, `--color-on-board`: **"Game keys, departing for your account."**; the lead (step-1, `--color-on-board-muted`, max 56ch): "Search {live} keys for Steam, Xbox, PlayStation, Nintendo and more. Pay on a hosted card page; your key is delivered to your account, usually within minutes after payment is confirmed." — platform list from the top four stocked platforms in `PLATFORM_BOARD` order, each clause from config and dropped if false.
  - cols 9–12, aligned to the H1's baseline: the board's own header facts in mono 12px `--color-on-board-muted`: "Board updated {HH:MM} UTC" (last successful `CatalogSyncRun.finishedAt`; date added if older than 48h; omitted if none) and "{live} keys on {n} platforms".
- **The board (M1), cols 1–12:** the DOM board + canvas (§13 M1), 6 rows, in a 10px-radius housing with 1px `--color-board-edge` (the housing sits inside the hall, slightly lighter, so the board reads as an object on a wall).
- **The kiosk, under the board, cols 1–8:** the primary action is search. A 56px field (`--color-raised` on the board, 6px radius, Overpass 17px, `Search` 20px, placeholder "Search {live} keys") + Go lg "Search" with the arrow cell (board mustard pair). Typing drives the board (M1). Cols 9–12: board controls (Pause/Play, page readout, Next 6).
- No covers in the first screen. (Both siblings opened with covers; this opens with type and flaps.)

**Mobile (390):** sign label; H1 at its minimum (41px, 3 lines); lead; the kiosk full width; the DOM board with 4 two-line rows; controls; "Board updated" line last.

#### 2. Platforms (M2)
- H2 "Choose your platform" (cols 1–7) with the lead "Every key leaves from the platform it activates on. Numbers stay the same, so you can find yours by sight." and Link "All platforms" (`ArrowBigRight`, → /catalog).
- **Cols 1–7, the signs:** platforms 1–4 (when stocked) as **large platform signs** in a 2×2 grid: a sign plate (4px radius, 1.5px ink border) with the lg platform tile, the name in Overpass 800 step-3, "40,737 keys" and "from €0.49" (mono, real), `ArrowBigRight`. Every other stocked platform as a compact row below (md tile, name, count, from-price), two columns, hairline-separated. Each sign/row is one link (`/platform/[slug]`) and the peek trigger.
- **Cols 9–12, the peek:** a mini-board (board housing) titled with the sign label "NEXT FROM PLATFORM 1 · STEAM": three board rows (price · title · remark) of that platform's top titles by board order, then three 3:4 covers of the same products in a row (real links), then "All Steam keys · 40,737" (`ArrowBigRight`).
- **Mobile:** the four large signs as a 2×2 grid (signs 160px tall), the rest as rows; the peek below shows platform 1 and follows taps.

#### 3. Timetable (M3)
Up to three **lines** from `lines` (§18.5), each a timetable row:
- **Header cell (cols 1–3, sticky inside the row on desktop):** a flap tile with the line letter ("A", "B", "C"), the line name in Overpass 800 step-2, its rule in muted 15px (stated honestly, e.g. "Released in the last eight weeks", "Tagged co-op by the publisher", "Xbox, PlayStation and Nintendo games"), and "All 1,204" with `ArrowBigRight`.
- **Rail (cols 4–12):** a horizontal scroller of departure cards (232px each, 16px gaps, scroll-snap), up to 12 per line, with the position bar under it and two Sign icon buttons at the header cell's foot.
- Lines are separated by 40px and a hairline (not by bands). Line A is the tallest (cards 232px); lines B and C use 200px cards — importance differs.
- Default lines: **A · New arrivals** (released ≤56 days, newest first), **B · Co-op** (genre `co-op`), **C · Console departures** (Xbox, PlayStation, Nintendo games). Each omitted below `MERCH.lineMinimum` (6).
- **Mobile:** header stacked above its rail (72vw cards), position bar kept.

#### 4. Your key departs (M4, §12)
- **Cols 1–8:** the station monitor with the current scene (desktop preset 1200×720 scaled).
- **Cols 9–12:** sign label "HOW IT WORKS"; H2 **"Watch your key depart"**; the lead "Five short demos with sample data: checking in a key, paying on the hosted page, your key arriving on your board, redeeming it, and getting help if it doesn't work."; the **tabs board** (§12.5); the step list of the active scene; Link "Read how activation works".
- **Mobile:** H2 + lead; the tab scroller; the monitor at the phone preset (max 380px, centred); the step list.

#### 5. Routes (M5)
- **Cols 1–3:** H2 "Routes", the lead "Each genre is a line. Its stops are the platforms with the most keys in that genre.", Link "All genres".
- **Cols 4–12:** up to eight **route lines** from `routes` (§18.5), each 72px tall:
  - the genre name in Overpass 800 step-2 at the left (a link to `/genre/[slug]`), with the count in mono under it;
  - a horizontal route line (§8.23) with up to four stops — the top platforms for that genre, labelled "Steam 3,104" (sm tile + name + mono count) — each stop a link to `/genre/[slug]?platform=…`;
  - the line ends at a terminus bar labelled "All 4,212" (link to the genre page).
  - Hover/focus a route: its terminus bar turns mustard and the marker travels (M5); other routes' lines drop to `--color-rule` (text stays ink).
- **Mobile:** each route as a block: name + count, then a vertical mini-line with its stops, ending at "All 4,212".

#### 6. Revised fares (M10)
- **Cols 1–4:** H2 "Revised fares", the lead "Keys whose price came down. The earlier price is the lowest this key cost here in the 30 days before the cut.", "All price cuts · {total}" with `ArrowBigRight`.
- **Cols 5–12:** a fares board (board housing): heads DESTINATION · PLATFORM · WAS · NOW · REMARKS; up to 10 rows (`fares.rows`), each row a link; WAS in `--color-on-board-faint` with `line-through` (non-flap text), NOW and REMARKS (`NOW −18%`) on flaps. One feature row on top spans two lines with its 3:4 cover at the left (the largest real cut with a cover).
- Omitted when fewer than `MERCH.dealMinimum` (4) real cuts exist. (The fixture database has none yet — expect this section to be absent until the store's own price history produces cuts.)
- **Mobile:** the board becomes two-line rows (title / platform · was · now).

#### 7. Gift cards (M11)
- **Cols 1–4:** H2 "Gift cards", the lead "Store balance for the platform you play on. A card only works on an account set to the card's region.", then a vertical `role="radiogroup"` of platforms with gift-card stock (`PLATFORM_BOARD` order): sm tile + name + "6 values" (real count). Selected row: `--color-accent-light` + 3px mustard left bar.
- **Cols 5–9:** the gift card blank (§8.10) of the selected platform's best group (global preferred), value in lg flaps.
- **Cols 10–12:** the denominations as a ruled list of fare rows ("€10 card ······ €10.79" — value left, our price mono right), each a link to the product; the row matching the card's value is selected (`aria-current`); "Top-ups for {platform}" Link when top-ups exist.
- **Mobile:** platforms as a horizontal segmented scroller, the card at 88vw, denominations as a list.

#### 8. Season tickets
- **Cols 1–4:** H2 "Season tickets", the lead "Subscriptions by length. Prices are for one code; the region is the account region it works with."
- **Cols 5–12:** a printed **timetable**: rows = services (`timetable.rows`: e.g. Xbox Game Pass Ultimate, PlayStation Plus Essential, Nintendo Switch Online, EA Play, Ubisoft+ when stocked), columns = durations (`timetable.columns`), cells = mono price links or "—", last column = region. Sign-label heads, 1px rules, `--color-raised` table on the floor, 6px radius on the outer frame only. Hover on a cell highlights its row head and column head (`--color-accent-light`) — a timetable lookup.
- **Mobile:** one block per service with duration links ("1 month · €9.99").

#### 9. Arrivals (how to redeem)
- H2 "Arrivals" (cols 1–6) with the lead "Every key arrives on the platform named on its page. Pick yours to see where to enter it."
- **Row 1:** platform tiles as a `role="radiogroup"` — md tiles with names under them, in `PLATFORM_BOARD` order for `activationPlatforms`; selected = mustard 3px bar under it.
- **Row 2, cols 1–8:** "You need {account} and the {app}." then the three steps as three columns, each opening with a md flap numeral (1, 2, 3) and the step text from `src/config/activation.ts` (menu names in bold Overpass 700), the code format when known ("Xbox codes have 25 characters"), Sign sm "{Platform}'s redeem page" with `MoveUpRight`, Link "Full guide for {Platform}".
- **Row 2, cols 9–12:** `MiniStill` of the Arrives scene for the selected platform.
- Changing platform flips the step numerals once and cross-fades the text (180ms).
- **Mobile:** tiles as a horizontal scroller, steps stacked, still below.

#### 10. Through the gate (M5)
Rendered only from facts that are true in config (§17).
- Sign label "PAYMENT AND KEYS"; H2 **"What passes through us, and what never does"**.
- **Two sign plates side by side** (cols 1–6 / 7–12):
  - **"Handled by Keyterminus"** — a board plate (`--color-board`, 10px radius, board text): "Your keys, stored encrypted and decrypted only when you choose Reveal." · "Your orders and invoices, kept for {retention} years as the law requires."
  - **"Never handled by us"** — a raised plate with a 1.5px ink border (4px radius): "Your card number, expiry date and security code. You enter them on the payment provider's hosted page." · "Your bank's 3-D Secure check, which happens between you and your bank."
  - Under both, full width: "If a key doesn't work, we replace it, or refund it if no replacement is available. If a payment fails, you aren't charged. We reply within 1 business day." — each clause links to its policy.
- **Below, cols 1–8:** a horizontal route line with stops **You → Payment provider's page → Your bank → Payment provider → Keyterminus → Your account**. The card-details segment (You → Payment provider) is drawn in ink and **ends in a terminus bar at the payment provider** labelled "Card details end here"; a second line continues from the provider to Keyterminus and Your account labelled "Confirmation only" → "Your key". It is a static diagram drawn once (M5); the geometry itself says card data stops before us.
- **Cols 9–12:** `MiniStill` of Pay at the challenge state, captioned "The 3-D Secure step, shown with sample data".
- If the hosted page or 3-D Secure isn't live, those lines and the still are removed, not reworded.
- **Mobile:** plates stacked, the route line vertical, the still last.

#### 11. Information desk
- **Cols 1–7:** H2 "Information desk" and six accordion items, word for word from the FAQ page:
  - "When will my key arrive?"
  - "What does the region on a key mean?"
  - "Where do I enter my key?"
  - "My key doesn't work. What happens now?"
  - "Do you see my card details?"
  - "Can I cancel or get a refund?"
- **Cols 9–12:** the desk block (no box; hairline left): sign label "STAFFED"; support hours and reply time from config ("Mon–Fri, 09:00–18:00 (GMT) · we reply within 1 business day"); Sign "Contact us"; Links "All questions" and "How activation works".
- **Mobile:** accordion, then the desk block.

#### 12. Terminus
- A 3px ink track runs the full container width at the top of the section and ends in a 10×64px mustard terminus bar at the right edge (the logo's bar at architectural scale; D1).
- **Cols 1–8:** H2 at step-5 **"Every line ends here. Every key starts here."**, one line "Search the whole board, or go straight to your platform.", the kiosk (same as the hero, without the board link), then the platform tiles in a row as links.
- **Cols 9–12:** nothing — negative space under the terminus bar on purpose.
- **Mobile:** the track ends at the right edge above the H2; text, kiosk, tiles.

### 14.2 Catalogue (`/catalog`)
- **Opener:** a graphite **board header** band (`--color-board`, full bleed, 104px): sign label "ALL KEYS"; H1 "All keys" (`--color-on-board`, step-4) with the live count as a `FlapRow`; at the right the type index in `TYPE_ORDER` ("Games 53,446 · Gift cards 497 · Subscriptions 127 · DLC 11,074 · Top-ups 3,339 · Software 1,210", Overpass 700 names + mono counts, each a link).
- **Body:** filters (272px) left; toolbar (result sentence + chips left, sort right); the departure-card grid; pagination.
- Empty results per §8.31.
- **Mobile:** board header shortened to 72px (H1 + count); sticky toolbar; 2-up grid with 12px gaps.

### 14.3 Platform landing (`/platform/[platform]`)
- **Opener:** a full-width platform sign band on `--color-bg-secondary`: lg platform tile, H1 "Steam keys" (step-4), the count and "from €0.49" (real) in mono, the sentence from the platform table ("Activates on a Steam account. You need the Steam app."), Link "How to redeem on Steam" (`ArrowBigRight`), and at the right the type index for this platform with counts.
- Then one **feature card** (the top board-order title on this platform with a screenshot) beside the first grid row, then filters + grid (Platform group hidden). Default sort `board`.
- Empty: "No Nintendo keys in stock right now" with links to the other platforms' signs.

### 14.4 Type landings (`/catalog/[category]`)
| Type | Opener icon | Page |
|---|---|---|
| Games | — | standard catalogue |
| Gift cards | `Wallet` | gift card blanks grouped by platform (one row per platform, blanks with denominations), then the grid |
| Subscriptions | `CalendarRange` | the season tickets timetable full width, then the grid |
| DLC | `LayersPlus` | standard catalogue; cards show "Needs the base game"; a line under the H1: "DLC needs the base game on the same platform and region." |
| Top-ups | `Coins` | standard catalogue; a line "Top-ups add in-game currency to the account and region shown." |
| Software | `AppWindow` | standard catalogue; system requirements apply on the PDP |

### 14.5 Genre, Price cuts, New arrivals
- **Genre (`/genre/[slug]`):** opener = the genre's **route line** full width (its platform stops with counts, ending in "All {count}"), H1 "{Genre} games" with the count; then filters + grid. Default sort `board`.
- **Price cuts (`/deals`):** H1 "Price cuts" with the count; a ruled note: "The earlier price is the lowest this key cost here in the 30 days before the cut."; default sort biggest cut; filters + grid. Nav label "Price cuts"; the home section name "Revised fares" is marketing only.
- **New arrivals (`/new-releases`):** H1 "New arrivals"; an opener timetable listing the last eight weeks as rows ("Week of 29 Sep · 14 releases", mono counts, each a filter link); grid sorted by release date, newest first; released titles only (no pre-orders).

### 14.6 Product page (`/product/[slug]`)
**Desktop, 12 columns:**
- **Media (cols 1–5):** the gate strip (board, 36px, md platform tile + platform name + region) directly above the 3:4 cover (8px radius on the pair as one object — the PDP's departure card); under it 16:9 screenshot thumbnails (4 visible, horizontal scroll) opening a gallery dialog with arrow keys; "Watch trailer" Sign sm opens a click-to-load facade when the feed has a trailer.
- **Purchase column (cols 6–12, sticky from 120px):** breadcrumbs ("Catalogue › Steam › Racing"); gate line (14px) + edition tag; H1 = title (step-4); facts line in muted ("Developer · Publisher · 2024"); the **edition timetable** (if any); the **buy box**; **Before you buy**.
- **Below, full width:** Tabs **About** (sanitised description at 66ch, collapsed after 12 lines with "Read more"), **Activation** (platform steps from config, verbatim `activationDetails`, the platform's redeem link), **System requirements** (PC only), **Details** (ruled table: Platform, Region + verbatim note, Type, Edition, Languages, Developer, Publisher, Release date, Genres, "Keyterminus catalogue no." = our SKU `KT-…`). Then "Also on other platforms" as compact rows (real only); "More on Platform 1 · Steam" as one rail of 5 departure cards (same genre, same platform); Recently viewed.
- JSON-LD: Product + Offer (active currency, availability) and BreadcrumbList. No AggregateRating.

**Mobile:** top row with the cover (40% width, gate strip above it) beside the gate line, H1 (step-3) and price; then edition timetable, buy box, Before you buy, tabs as accordions; a sticky bottom bar (64px, `--color-raised`, top hairline) with the price and Go "Add to cart", appearing once the buy box's button leaves the viewport.

### 14.7 Search (`/search`)
H1 = the query in quotes (step-4) with the count; the large kiosk input above it, prefilled; platform and genre matches as rows with counts; then filters + grid (default sort relevance). No results: "Nothing on the board matches “xyz”." + check spelling / search without the edition name / platform signs as links.

### 14.8 Cart (`/cart`)
H1 "Cart" with the `FlapCounter`. **Desktop:** rows in cols 1–8 (90×120 cover, gate line, title, facts, quantity, price, Remove), hairlines between; the **ticket summary** (§8.27) in cols 9–12, sticky, plus Link "Continue shopping" and the merchant line (legal name + support email) in 14px. **Mobile:** rows stacked, the ticket at the end, a sticky bar "Checkout · €29.99". Empty: the empty board at page scale.

### 14.9 Checkout (`/checkout`), three steps
**Frame:** minimal header (lockup, `Lock` "Secure checkout", Link "Back to cart") and the compact footer, in `max-w-narrow`; the route-line progress (§8.29) across the top.
**Desktop:** steps in cols 1–7; the ticket summary in cols 8–12 (sticky) with compact rows, subtotal, total, the charge-currency note, policy links (Terms, Refunds, Privacy) at 14px.
- **Step 1 — Account:** signed in: "Signed in as alex@example.com" + Link "Not you? Switch account". Signed out: "Your keys are kept in your account, so you'll need one to receive them." + segmented "Sign in" / "Create account" (short inline form: email, password, Terms). Continue.
- **Step 2 — Billing details:** full name, receipt email (prefilled), country (restricted list via config), address line, city, postcode (for the invoice). Continue.
- **Step 3 — Review and pay:** read-only summary of steps 1–2 with "Change"; items as compact rows each with a **region line** (Overpass 14px: "Region: Europe. Activates only on accounts set to a European country."); checkboxes: (required unless `STORE_POLICY.checkout.requireRegionCheck` is false) "I've checked the platform and region of each key."; (required) "I have read and agree to the Terms and Conditions"; (required) the digital-delivery consent **word for word from `STORE_POLICY.waiver.text`** (must match the Terms and Refund policy). Go lg "Pay €29.99" with the arrow cell, enabled only when all required boxes are ticked. Under it Visa / Mastercard / PCI DSS at 28px and "You'll enter your card details on {provider}'s hosted payment page with 3-D Secure. We never see or store your card number." (config-gated, matches the Privacy Policy).
- **Mobile:** summary collapses into a top accordion; steps follow; Pay full width.
- Payment failed on return: an alert above step 3 "Your payment didn't go through. You haven't been charged." + "Try again".

### 14.10 Order confirmed (`/order/confirmed`)
Narrow column. H1 "Payment received" (→ "Payment confirmed" once the server confirms; never claims the key is delivered before it is). The order number as a `FlapRow` that flips in once (M9 timing, no randomness) with a `Copy` icon button. The order timeline, live (M8). "We've sent a receipt to {email}. Your keys appear in Account → Keys as soon as they're issued." Once issued, the **key boards** render inline (masked; Reveal works here). Buttons: Go "Go to my keys", Sign "Continue shopping", Link "Download invoice (PDF)" with `ArrowDownToLine` once it exists.

### 14.11 Auth
- **Sign in (`/auth/login`):** two columns (max 960px) separated by a 1px vertical hairline. Left: H1 "Sign in"; email; password (show/hide); Link "Forgot your password?"; Go lg "Sign in"; error summary "Email or password is incorrect." Right: H2 "New to Keyterminus?" (step-3) and three true points as a plain list ("Your keys are kept in your account, encrypted" · "Reveal and copy them when you're ready to play" · "Every order comes with a PDF invoice"), then Sign "Create an account". Mobile: form first.
- **Register (`/auth/register`):** a 560px column with a **route line** progress of four stops **About you · Contact · Address · Password**; keep the existing required fields and the T&C gate: (1) first name, last name, date of birth (minimum age from `STORE_POLICY.minAge`, error names the rule); (2) email, phone with country prefix (optional per config); (3) country (restricted list excluded), street, city, postcode; (4) password with the hint "At least 8 characters, one number", confirm, the required Terms checkbox, an **unticked** marketing opt-in; Go lg "Create account" disabled until Terms is ticked. Step changes per §8.29 (focus to heading, live region).
- **Forgot / reset:** a single 480px column.

### 14.12 Account (`/account/**`)
- **Layout:** desktop 240px left nav of text rows (Overview, Keys, Orders, Saved, Profile, hairline, Sign out with `DoorOpen`); active row ink with a 3px mustard left bar; others muted. Mobile: horizontal scroller of the same rows under the H1.
- **Overview:** H1 "Hello, {first name}"; one line of real counts ("2 keys not revealed yet · 5 orders") with links; the latest order as a compact row with status tag and "View". No stat tiles.
- **Keys (`/account/keys`)** — the heart: sign label "MY DEPARTURES" (the only metaphor on functional account pages), H1 "Keys" with the count; tabs All · Not revealed · Revealed · Reported; **key boards** newest first, grouped by order with a mono header row (order number, date). Empty: "No keys yet. Keys you buy appear here after your payment is confirmed." + Go "Browse the catalogue".
- **Orders:** H1 "Orders"; a ruled list (not cards): header row (order number mono, date mono muted, total mono, status tag), compact item rows, the compact route-line timeline, Link "Invoice (PDF)" with `ArrowDownToLine`, and "View order". In-flight orders first; polling while any is in flight.
- **Order detail:** H1 "Order KT-…" with a status tag; the large timeline; key boards; payment summary (amount, currency, card brand and last four **only if the provider returns them**); invoice; "Need help with this order?" → contact with the order number prefilled.
- **Saved:** departure-card grid 3-up (2-up mobile); out-of-stock state per §8.10.
- **Profile:** accordion groups (Personal details, Address, Password, Delete account), each with its own Save and a success toast.

### 14.13 How activation works (`/how-activation-works`) — landing surface
1. Hero: H1 (step-5) "How activation works" and the lead "Your key is delivered to your account after payment is confirmed. You redeem it on the platform named on the product page." Then the platform tiles as jump links.
2. "From payment to your board": `FeatureSpotlight` with the **Departs** scene (the page's only playing theater).
3. One section per platform (`id="steam"` …): H2 with the md tile; "You need"; the steps; the code format; the platform's own redeem link; "Common problems" as ruled rows ("The key is for another region", "The key says it was already used", "The platform asks for a different account type"); a `MiniStill` of Arrives beside the steps (desktop, cols 8–12).
4. "If a key doesn't work": ruled rows explaining the report flow, the replacement-or-refund rule and the reply time.
5. Go "Browse the catalogue".
Reading blocks 66ch. No invented guarantees.

### 14.14 About, FAQ, Contact, Policies
- **About (`/about`):** H1 "About Keyterminus" with a step-1 lead "A store for game keys, gift cards and subscriptions across every major platform, with the platform and region shown before you pay."; "What's on the board" (types and listed platforms; prices in your currency); "How an order travels" (three ruled rows → activation guide); "How we keep your keys" (link to the home "Through the gate" anchor); the Company notice; Go "Browse the catalogue". No founder stories, pull-quotes or numbers that aren't data.
- **FAQ (`/faq`):** H1 "Questions"; desktop left sticky group index (Buying, Delivery, Activation and regions, Payment and security, Refunds and key problems, Account) with a 3px mustard bar on the active group; accordion groups right; answers match the policies word for word on numbers; "Still need help?" + Sign "Contact us"; FAQPage JSON-LD.
- **Contact (`/contact`):** left cols 1–5: H1 "Contact us", the real support hours and reply time from config, the Company notice, "Have your order number ready" with links to the activation guide and the Refund policy. Right cols 7–12: the form (name, email, order number optional mono, subject select Order / Key not working / Payment / Account / Other, message); Go "Send message"; success replaces the form.
- **Policies (`/policies`, `/policies/*`, `/pages/[slug]`), `PolicyLayout`:** index: H1 "Policies" + a ruled list (title Overpass 700 step-2, one-line scope, "Last updated {date}" mono muted). Policy page: desktop left 240px sticky index (active row with the mustard bar) + "On this page" from the H2s; main column at 66ch with H1 (step-4), a neutral "Last updated" tag, numbered H2s at step-3, body 16px at 1.7, ruled tables. Plain legal language, **no metaphor at all**. Cookie table lists cart, theme, saved, currency, `keyterminus-consent`. Mobile: "Jump to policy" select and "On this page" accordion. Print: header and footer hidden, black on white.

### 14.15 404 — "Platform not found" (`src/app/(store)/not-found.tsx`)
- A board housing with two board rows that flip in once: `PLATFORM 404` / `NOT ON THE BOARD` (remark `CHECK THE BOARD`).
- H1 (step-4) "Platform not found", the line "This page isn't on our board. It may have moved, or the key is no longer listed."
- The kiosk search field, the platform tiles as links, Link "Back to the departures board" (→ /).
- A real 404 status. Reduced motion: rows static.

### 14.16 Error states
Inline form errors per §8.2; page fetch errors use the Alert. `global-error.tsx`: H1 "Something went wrong", one line, Go "Try again", the support email. Price unavailable: card and buy-box states. Issuing delayed: the timeline branch "Issuing is taking longer than usual. We'll email you as soon as your key is ready. You can also contact us with your order number."

---

## 15. Imagery rules for covers and screenshots
1. Covers carry the colour; the UI never competes. Every cover sits on `--color-stage` inside a card or a board object, never directly on the floor.
2. Ratios: 3:4 cards, rows, PDP, peek covers; 16:9 screenshots and the feature card; 1.586:1 gift card blanks.
3. Fit by real proportions (§8.9). Never stretch, rotate, mirror.
4. No blur, tint, duotone, wash, gradient or text overlay on covers; no badges on covers. The only things on top of a cover are hover state (none on the image itself) and the out-of-stock opacity.
5. Covers and screenshots mirrored at sync, served from our domain via `next/image` with correct `sizes`. No supplier host anywhere (remotePatterns, alt text, structured data, feeds).
6. Alt: cover "{title} cover art"; screenshot "{title} screenshot {n}"; decorative peek covers `alt=""` when the same products are linked as text nearby.
7. Screenshots only in the PDP gallery and the feature card.
8. Trailers only behind a click-to-load facade; nothing third-party loads before consent and a click.
9. Never: stock photography, gamer lifestyle photos, controllers, headsets, neon rooms, AI art, platform logos, console renders, airport or train photos, mock key cards with fake codes outside the theater.
10. The hero board shows **text**, not covers. Peeks, rails and the feature card pick covers by data rules (§18.5), never hand-picked files.
11. Inside the theater only: fictional sample titles with generated flat covers, always labelled "Sample data".

---

## 16. Copy voice, glossary and content rules

### 16.1 Voice
A good station announcement: short, specific, calm, never hyped. Present tense, active voice, second person. Metaphor (departures, platforms, routes, fares, arrivals, information desk) lives **only on marketing surfaces** — home section titles and leads, the theater, the 404, the about lead, email subject lines' preheaders at most. Everything functional — navigation, filters, product facts, cart, checkout, account (except the one "MY DEPARTURES" sign label), order statuses, errors, emails' body, policies — uses plain words. If a station word and a plain word compete, the plain word wins.

English UI, **British spelling** ("catalogue", "licence", "cancelled"), existing currency formatting.

### 16.2 Glossary
| Concept | Marketing surfaces may say | Functional and legal wording (always) |
|---|---|---|
| Home page board | Departures, the board | — |
| Product | departure, key | product, key, game, DLC, gift card |
| Platform | Platform 1 · Steam | Steam (the platform's name); "Platform" as a filter label |
| Genre | route, line | Genre |
| Price band | fare zone | price, "€8–€18" |
| Price reduction | revised fares, now cheaper | price cut, "Was €29.99" |
| New releases | arrivals, new arrivals | New arrivals (nav), Newest release (sort) |
| Subscriptions | season tickets | Subscriptions |
| Cart | your ticket (summary panel label only) | Cart, Add to cart, Checkout |
| Order | journey (theater only) | Order, order number |
| Payment | boarding (theater remark only) | Payment, Pay €29.99 |
| Key issued | departed (theater/home only) | Key issued, Your key is ready |
| Key revealed / redeemed | arrived (theater only) | Revealed, Redeem on Steam |
| Account keys page | My departures (sign label) | Keys |
| Support | information desk, help desk | Contact us, Report a problem |
| Refund | — (never metaphorical) | Refund, Replacement, Right to cancel |
| 404 | Platform not found | — |

### 16.3 Content rules
- **Store model only.** Customers buy keys from Keyterminus. Never: "sell", "seller", "marketplace", "payout", "withdraw", "withdrawal", "deposit" (as money), "balance" (as a stored account balance), "escrow", "P2P", "list your key", "trade". Legal cancellation wording: "right to cancel".
- **Speed claims come only from config.** Delivery wording is exactly "**Delivered to your account, usually within minutes after payment is confirmed.**" (`STORE_POLICY.delivery.headline`) or its config short forms. The owner's preview line "Your key departs in about a minute after payment" is **not** used — "about a minute" is a promise the config doesn't make. Never "instant", "immediately", "in seconds", "about a minute", "the moment you pay", "on time" as a delivery promise (`ON TIME` is a stock remark meaning "in stock at its regular price", and the board legend says so).
- **No authenticity or guarantee claims:** no "official", "original", "authorised", "legit", "100%", "sold once", "guaranteed", "no risk". Links say "Steam's redeem page" or "the platform's own redeem page". Guarantee wording is exactly "**Replacement or refund if a key doesn't work**", details in the Refund policy.
- **Security claims** only when true in config and matching the Privacy Policy: "Card details are entered on {provider}'s hosted payment page." · "3-D Secure confirmation by your bank." · "Keys are encrypted at rest." · "We never see or store your full card number."
- **The supplier is invisible.** No supplier name, domain, ID, "marketplace price", "vs retail", comparisons with other stores.
- **Honest deals.** A "was" price is the lowest price of that product in the 30 days before the reduction, from Keyterminus' own price history (EU price-indication rules). Without history, no deal display. No countdowns, "ends soon", "last call", "delayed", "hot", "trending", "best seller" (unless ranked by real order data and labelled "Most ordered this month").
- **No pressure:** no stock counts on cards, no "only 2 left", no timers.
- **Board legend** (a single line under the hero board and the fares board, Overpass 14px `--color-on-board-muted`): "ON TIME: in stock at its regular price · NEW: released in the last 8 weeks · NOW −%: price cut against our lowest price of the previous 30 days."
- **Region honesty:** Global → "No regional lock"; others → "Activates only on accounts set to {region}", followed by the supplier's verbatim note in mono. Sanctioned-market and VPN items are never listed.
- **Key and order status copy** (one sentence each, phrased for Keyterminus):

  | Status | Copy |
  |---|---|
  | Awaiting payment | "We're waiting for your payment to be confirmed." |
  | Payment confirmed | "Payment confirmed. We're issuing your key." |
  | Key issued | "Your key is ready in your account." |
  | Issuing delayed | "Issuing is taking longer than usual. We'll email you as soon as your key is ready." |
  | Reported | "We're checking your key and will reply within {replyTime}." |
  | Replacement issued | "A replacement key is ready in your account." |
  | Refund pending | "We're processing your refund." |
  | Refunded | "Refunded to your card." |
  | Payment failed | "Your payment didn't go through. You haven't been charged." |

- **The key email** says "Your key is ready" and links to Account → Keys; it does not contain the key (`STORE_POLICY.security.keyInEmail = false`). If that changes, remove "decrypted only when you choose Reveal" from the home and theater.
- **Buttons are verbs:** Search, Add to cart, Buy now, Checkout, Continue, Pay €29.99, Reveal key, Copy key, Redeem on Steam, Report it, Send message, Save choices, Create account.
- **Banned words:** "elevate", "seamless", "effortless", "unleash", "level up", "epic deals", "gamers", "next-level", "premium", "curated", "ultimate" (except in a real product name), "GG", "loot", "journey" outside the theater, "fly", "jet", "take off".
- **No verbatim copy from Keyrook or Fablekeys.** Policy texts keep their legal substance and numbers but are re-phrased in Keyterminus' voice; section names, FAQ questions, status lines and empty states in this brief are already new.

---

## 17. Data and config the design depends on (for the lead)
The design shows only what these provide; missing data means the element is omitted.

- **Product:** platform → `platformInfo()` with `number`/`boardLabel`; region + verbatim note; kind; genres; languages; releaseDate; edition and normalised baseTitle; developers, publishers, ageRating, systemRequirements, activationDetails; mirrored cover with probed width/height; screenshots; trailerId; qty, price, currency; SKU (`KT-`); `createdAt` (first seen); an order count; **`boardScore`** (§18.3).
- **Price history:** keep Keyrook's `PriceHistory` mechanics; `compareAtPrice` = lowest price in the 30 days before the current reduction; a deal exists only when the price is below it by at least `STORE_POLICY.deals.minPercent` (currently 10). Only rows written by Keyterminus count (SKU prefix `KT-`); history inherited from the Keyrook copy is discarded on the first sync.
- **Key storage:** unchanged (`KeyDelivery` ciphertext/iv/authTag, format, pin, issuedAt, revealedAt, reportedAt, status, replacedById).
- **`STORE_POLICY` facts that switch copy:** `payment.hostedPage`, `payment.threeDSecure`, `payment.providerName` (through the gate, checkout note, theater Pay); `security.keysEncryptedAtRest` (through the gate, Departs tip); `invoices.pdf`; `guarantee.faultyKey` (buy box row, through the gate, Help desk scene); `delivery.*` (strip, buy box, cart, FAQ); `support.replyTime`; `checkout.requireRegionCheck`; `limits.*`; `waiver.text`; `deals.compareWindowDays`, `deals.minPercent`; `retention.orderRecordsYears`.

---

## 18. Merchandising — make Keyterminus never look like Keyrook's inventory
Keyterminus and Keyrook draw on the same supplier and fixture (~69,700 live products today: Steam 29,408 games + 10,628 DLC, GOG 9,606, Xbox 6,712, Nintendo 4,297, Epic 3,204, PlayStation 113 games + 731 top-ups; indie 31k, action 13.8k; median price €5.45; **0** live price cuts in the fixture). Some overlap is unavoidable; the goal is different emphasis, order, prices, SKUs, URLs and home picks. Implement in code (no commit) and report numbers against the fixtures the way Fablekeys' §18.7 did.

### 18.1 Emphasis (what Keyterminus is "about")
Keyrook leads with most-ordered PC titles; Fablekeys with story games and GOG. Keyterminus is the **multi-platform station**: consoles and value are promoted, every list mixes platforms, and fast genres (racing, sports, fighting, shooter, co-op) lead.
- `PLATFORM_BOARD` numbering and order (§2.4): Steam, Xbox, PlayStation, Nintendo, Epic, GOG, EA app, Ubisoft Connect, Battle.net, Rockstar. Used for filters, footer line, menu, home signs, sync category `sortOrder`.
- `TYPE_ORDER`: Games, Gift cards, Subscriptions, DLC, Top-ups, Software. Header nav: Platforms, Games, Gift cards, Price cuts (+ DLC ≥1280, Subscriptions ≥1440, New arrivals ≥1600). `RIG_LINKS` = games, gift-cards, subscriptions, dlc.
- `ROUTE_ORDER` (genres): racing, sports, fighting, shooter, co-op, action, survival, open-world, simulation, strategy, horror, platformer, rpg, adventure, puzzle, story-rich, casual, indie, vr, mmo.
- `FARE_ZONES` in `src/config/merchandising.ts` (replaces `PRICE_BAND_EDGES`/`PRICE_BANDS`): edges `[3, 8, 18, 35, 70]` in the active currency → six zones (Keyrook `[5, 10, 20, 40]`, Fablekeys `[4, 12, 25, 50]`). `catalogConfig.pricing.bands` uses the same edges in EUR.

### 18.2 Selection (`src/config/catalog.ts`, `src/lib/esa/select.ts`)
- **Quotas** (target 65,000–75,000; Keyrook's in brackets): games 40,000 (42,000) with per-platform shares of the game cap — Steam ≤ 0.48, GOG ≤ 0.14, Xbox ≤ 0.16, Nintendo ≤ 0.12, Epic ≤ 0.08, PlayStation, EA, Ubisoft, Battle.net, Rockstar uncapped (they are small) — (Keyrook: one flat 0.55); DLC 14,000 (16,500) with Steam ≤ 0.8; gift cards 4,500 (3,500); subscriptions 2,500 (1,500); top-ups 5,000 (3,500); software 2,000 (2,700). Spillover order: game, dlc. Caps above availability are fine (they spill); tune against the fixtures and report the final split.
- **`maxPerTitle: 3`** (Keyrook 4). Editions per work: 3 per base title and platform.
- **Selection score** for ordering candidates inside each quota (Keyrook: lexicographic buckets; Fablekeys: story score):
  `selectionScore = boardScore × regionWeight × zoneWeight × editionWeight × stockFactor × stability × (1 + 0.06 × saltedHash("keyterminus"))`
  - `regionWeight`: global 1.05, europe 1, uk 0.98, us 0.96, north-america 0.96;
  - `zoneWeight` by fare zone (under 3, 3–8, 8–18, 18–35, 35–70, 70+): 1.0, 1.1, 1.08, 1.0, 0.94, 0.85 — value is promoted;
  - `editionWeight`: Standard 1.06, Gold 1.02, Deluxe 1.0, Complete/Definitive 0.98, Ultimate 0.96, Collector's 0.9 (Fablekeys preferred Complete; we prefer the plain edition);
  - `stockFactor` 0.94–1.0 from log stock; `stability` 1.25 for rows this shop already lists (SKU `KT-`); rows inherited from Keyrook (`KR-`) get no bonus.
- **Offers:** when several supplier offers exist, keep any within 4% of the cheapest and pick the one with the **most stock**, then the salted hash (Keyrook: cheapest; Fablekeys: 3%).
- **Prices:** storefront price = `max(cost × 1.125, cost + €0.32)` rounded up to the cent (Keyrook 12% / €0.30; Fablekeys 13% / €0.35). Update `.env.example` (`CATALOG_MARGIN="0.125"`, `CATALOG_MIN_MARGIN_ABS="0.32"`).
- **SKUs and URLs:** SKU `KT-` + salted SHA-1 (salt "keyterminus"). Slug pattern `{platform}-{title}-{region short, omitted for global}` with the platform first (e.g. `steam-copperline-express-deluxe`, `xbox-forza-horizon-5-eu`) — different from Keyrook (display name) and Fablekeys (`…-steam-key`). Inherited rows are re-slugged once; collisions get a salted 6-character suffix. Keep 301s irrelevant (new store).

### 18.3 Default sort: "Board order" (`board`)
- **`boardScore`** (stored per product at sync, indexed; `src/lib/catalog/board-score.ts`):
  - genre factor = the highest weight among its genres: racing 1.4, sports 1.35, fighting 1.3, shooter 1.3, co-op 1.3, action 1.2, survival 1.15, open-world 1.12, simulation 1.05, strategy 1.0, horror 1.0, platformer 0.98, rpg 0.95, adventure 0.92, mmo 0.9, puzzle 0.85, story-rich 0.85, casual 0.82, indie 0.8, vr 0.72; untagged 0.9;
  - recency factor `1 + 0.35 × 0.5^(ageYears / 1.5)` (a new release +35%, a three-year-old title +9%);
  - console factor 1.12 for Xbox, PlayStation, Nintendo;
  - multi-platform factor 1.08 when the same base title is live on ≥2 platforms;
  - never a critic score, rating or popularity number shown to customers.
- **Board order** = a **weighted platform interleave** of `boardScore`: `ROW_NUMBER() OVER (PARTITION BY platform ORDER BY boardScore DESC, id)` as `rn`, then `ORDER BY rn / share(platform) ASC, boardScore DESC, id` with shares Steam 0.38, Xbox 0.16, Nintendo 0.12, GOG 0.1, PlayStation 0.08, Epic 0.08, others 0.02 each. Regional copies of the same base title on the same platform after the first get `rn × 4` (pushed down), so page one shows 24 different titles from several platforms. Add `board` to `SORT_KEYS`, make it the default on catalogue, category, platform and genre pages (Deals keeps `discount`, New arrivals `release-desc`, Search `relevance`). Sort menu order per §8.15. Verify the query plan stays index-friendly at 70k rows (materialise `boardScore` and `share` as columns or a CTE on the filtered set).

### 18.4 Navigation and facets
Facets in `PLATFORM_BOARD` / `TYPE_ORDER` / `ROUTE_ORDER` order (Keyrook sorted by count). `src/lib/catalog/store-index.ts`: platforms with numbers, routes, fare zones. `src/config/navigation.ts`: `RIG_LINKS`, `PLATFORM_LINKS` in board order, help/policy links unchanged in substance.

### 18.5 Home data (`getHomeData`, claimed in this order; no product twice; no title twice)
One ranked pool: live products with a cover, one row per (base title, platform), best edition by `editionWeight`, sorted by `boardScore`.
1. **`boardPages`** (hero, 18 rows = 3 pages × 6): walk the pool in board order; at most 5 per platform across 18 and at least one row each for platforms 1–4 when stocked; include up to 3 real price cuts and up to 3 NEW titles when they exist (their remarks make the board honest and varied); games, DLC and one gift card allowed (a gift card row reads "STEAM GIFT CARD €20"). **Exclude the 200 most-ordered products** so Keyterminus' first screen never mirrors Keyrook's most-ordered door.
2. **`platforms`**: stocked platforms in board order with count, min price, and 3 peek titles each (board order, unclaimed).
3. **`lines`**: A New arrivals (release ≤56 days, newest first, board order within a week, ≤12); B Co-op (genre `co-op`, board order, ≤12, ≤3 per platform); C Console departures (Xbox/PlayStation/Nintendo games, round-robin across the three, ≤12). Each needs `MERCH.lineMinimum` 6.
4. **`routes`**: the first 8 genres in `ROUTE_ORDER` with ≥50 live products; for each the top 4 platforms by live count in that genre (counts only, no products claimed).
5. **`fares`**: real price cuts ranked by `boardScore × cut%` (Keyrook: largest percentage), feature = first with a cover; ≤10; needs 4.
6. **`giftCards`**: per stocked platform the group with most denominations, global preferred, in board order.
7. **`timetable`**: services in board order of their platform, then by number of durations.
8. **`activationPlatforms`**: platforms 1–6 plus Battle.net when stocked.

New `MERCH` keys: `boardRows 18`, `boardPerPlatform 5`, `boardExcludeTopOrdered 200`, `peek 3`, `lineItems 12`, `lineMinimum 6`, `routes 8`, `routeStops 4`, `routeMinimum 50`, `fares 10`, `dealMinimum 4`, `giftCardPlatforms 5`, `timetableRows 8`, `releaseWindowDays 56`. Delete door, locker, budget and release-ruler keys.

### 18.6 Report back (engineer)
After running the sync on the fixtures (`/home/claude/devtools/kinguin-fixtures`, mock ESA), report: active products by type and platform; distinct titles; median price; identical products vs Keyrook (`/home/claude/keyrook` database copy if available) with same price / same SKU / same slug counts (target: 0 / 0 / 0); home first-screen overlap with Keyrook's door covers (target 0 products); catalogue page-1 overlap at each store's default sort (target ≤2).

---

## 19. Email look (`src/lib/email.ts`)
Keyrook's emails: nickel canvas `#E3E7E4`, gunmetal header band, banker's-green plates, Hubot. Keyterminus' are a printed **departure notice**:

```ts
const C = {
  canvas: "#EAE5DA",
  panel: "#FCFBF7",
  board: "#222426",
  flap: "#2B2E31",
  onBoard: "#F2EDE1",
  onBoardMuted: "#B0ABA0",
  remark: "#E9BB45",
  ink: "#1B1C1D",
  muted: "#4B4842",
  faint: "#5D5951",
  line: "#D6D0C3",
  mustard: "#E2AE2F",
  mustardEdge: "#9C7612",
  success: "#2C6A3A",
  danger: "#B02A1F",
} as const;
const SANS = "'Overpass', Arial, Helvetica, sans-serif";
const MONO = "'Sometype Mono', Menlo, Consolas, monospace";
```

**Structure** (600px table, `color-scheme: light`):
1. Canvas `#EAE5DA`, 24px top padding.
2. **Header:** a `board` cell (20px 24px padding, top corners 8px) with `email-logo.png` (Night-coloured lockup, 143×28 display) left and, right, the email's sign label in `onBoardMuted` 11px uppercase 0.14em ("ORDER CONFIRMED", "KEY READY", "PASSWORD RESET").
3. A 4px `mustard` rule.
4. **Departure strip** (order emails only): a `flap` row (12px 24px) in MONO 13px: `ORDER KT-30517` in `onBoard` · `{STATUS}` in `remark` (plain status words: "PAYMENT CONFIRMED", "KEY READY", "REFUNDED") — table cells with 1px `board` gaps imitate flap tiles; no images.
5. **Content panel:** `panel` with 1px `line` left/right/bottom borders, bottom corners 8px, 32px 28px padding. H1 in SANS 800 26px `ink` sentence case (not a serif); paragraphs SANS 15px/1.6 `muted`; sign labels SANS 700 11px uppercase 0.14em `faint`; details as a ruled two-column table (labels `faint`, values `ink`, identifiers MONO); item rows with a 40×53 cover thumbnail (mirrored URL), title, platform name + region in muted 13px, price MONO right.
6. **Button:** `mustard` fill, `ink` text, 1px `mustardEdge` border, 6px radius, 14px 26px padding, SANS 700 15px, sentence case ("View your keys", "Reset password").
7. **Footer** on the canvas (12px, `muted`): "{COMPANY.name}" in ink 600; "Keyterminus is a trading name of {COMPANY.name}. Company number {…}."; registered office + email + phone (if any); policy links (Terms, Refunds, Privacy, Contact) underlined in `muted`; "© {year} Keyterminus."
- Key-ready email: "Your key is ready" + "View your keys" button; never the key itself.
- Preheaders are plain ("Your Keyterminus order KT-30517 is confirmed").
- Rename every helper that referred to the old look (`plate`, `brass`) to `strip`, `mustard`.

---

## 20. Mobile compositions (designed, not stacked)
- **Header:** 56px bar, lockup → mark only below 400px; menu as a bottom sheet with the delivery line on top; search as a full-screen kiosk.
- **Hero:** H1 + lead + kiosk first, then the DOM board with four two-line rows (title / platform · price · remark), DOM flaps only, controls under it.
- **Platforms:** 2×2 large signs, rows below, peek following taps.
- **Timetable:** each line's header above its rail; 72vw cards; position bar kept.
- **Theater:** tabs as a horizontal scroller of compact rows; phone-preset monitor; step list below.
- **Routes:** each route a vertical mini-line with its stops.
- **Revised fares:** two-line board rows.
- **Gift cards:** platform segmented scroller → card at 88vw → denominations.
- **Season tickets:** one block per service.
- **Arrivals:** tile scroller → stacked steps → still.
- **Through the gate:** plates stacked, vertical route line.
- **Catalogue:** 72px board header, sticky Filter/Sort toolbar, bottom filter sheet, 2-up grid.
- **PDP:** cover + gate strip at 40% width beside title and price; sticky buy bar.
- **Cart / checkout:** ticket summary at the end of the cart; sticky "Checkout · €29.99"; checkout summary as a top accordion; Pay full width.
- **Account:** horizontal nav scroller; key boards full width with flaps wrapping by key group.
- **Footer:** vertical platform line ending in the terminus bar; accordion columns; Company notice one column; logo strip centred.
- Thumb zone: primary CTAs within the bottom 40% on PDP (sticky bar), cart and checkout.

---

## 21. Reduced motion — the static design
Under `prefers-reduced-motion: reduce` the site is complete and finished at rest:
- hero: DOM board page 1, no WebGL, no paging; "Next 6" and search swap instantly; legend visible;
- peek, gift card, fares: final states; switches are instant;
- rails: native scroll, no momentum, no rise;
- route lines: fully drawn, markers parked at the terminus bar;
- theater: stills of every scene's end state with the full step list; tabs switch stills;
- key board: key appears at once on reveal; counters show final values;
- panels, dialogs, toasts: ≤100ms opacity;
- nothing pins, nothing loops.
Screenshot every home section and the key board with `page.emulateMedia({ reducedMotion: "reduce" })` before hand-off.

---

## 22. Accessibility and quality floor
- **WCAG 2.2 AA:** contrast per §3.2 in both themes and on the board; a visible focus ring on every control (board surfaces: mustard ring); touch targets ≥44px.
- **Landmarks:** `header` (strip + bar), `nav` (main, breadcrumb, footer platform line, footer, account), `main`, `footer`. One H1 per page, H2/H3 in order. Sign labels are `<p>`, not headings.
- **ARIA patterns:** disclosure (filters, concourse map, accordions); tabs (theater tabs board vertical, PDP, account keys); combobox (kiosk search, language, country); dialog (cart, gallery, report, cookie settings, mobile sheets); radiogroup (segmented controls, edition timetable, Arrivals tiles, gift card platforms); switch (cookies, On sale); live regions (cart count, steps, order status, key reveal/copy, quantity clamp, hero board page/results).
- **Boards are tables:** the hero and fares boards are real `<table>`s with captions and header cells; flap visuals are `aria-hidden` with plain-text twins. Auto-paging content has a pause control and stops by itself (WCAG 2.2.2).
- **Never colour alone:** platforms always named; remarks are words; deals carry percentage and "Was" in text; route current stops also carry `aria-current="step"`.
- **Keys:** Sometype slashed zero and distinct `1 I l`; "Spell it out"; keyboard copy fallback; focus to Copy after reveal.
- **Keyboard:** everything reachable, including platform signs, rails (arrow buttons + Tab into cards), routes and their stops, theater tabs and the play control, gift card platform radios. Esc closes every overlay and returns focus.
- **Performance:** LCP ≤2.5s on mid-tier 4G (the H1); CLS 0; INP ≤200ms; covers lazy below the fold; fonts latin + latin-ext with one preload; WebGL only on the hero after LCP.
- **Theme parity:** every screen in Day and Night, plus the system-preference path with nothing stored.
- **SEO:** unique titles and descriptions; Product (+Offer), BreadcrumbList, FAQPage, Organization, WebSite + SearchAction JSON-LD; OG images per §9.3.
- **QC items that touch design:** payment logos in the footer and at checkout; credentials in the footer Company notice; the platform disclaimer; "Cookie settings"; multi-step registration with the T&C gate; the digital-delivery consent at payment; platform, region, languages, edition, requirements and validity on the PDP; system requirements only for PC titles; no pre-orders, no supplier traces, no fake stock, ratings or claims.

---

## 23. Implementation order
1. **Tokens:** `variables.css` (Day in `:root`, Night in `[data-theme="dark"]`), `@theme inline` additions, `tailwind.config.ts` mirror, fonts (install/uninstall, `fonts.css`, preload), base rules, `ThemeScript` (system fallback), animations clean-up, `tokens.ts`, `theater.css`.
2. **Sweeps** (§2.5), brand rename.
3. **Primitives:** Button, Field, Select, Choice (checkbox, radio, switch, segmented), Tag, Chip, Tabs, Accordion, Dialog, toasts, Alert, EmptyState (empty board), Breadcrumbs, Pagination, QuantitySelector, PriceDisplay, **Flap / FlapRow / FlapCounter**, **FlapLoader**, **PlatformTile**, **RouteLine**, **Remark**, `flapFrame()`.
4. **Key-store components:** gate line, Cover, DepartureCard (standard, compact, feature, gift card blank), deal tile, buy box, edition timetable, Before you buy, system requirements, OrderTimeline (route line), **KeyBoard** (reveal contract unchanged), report dialog, ticket summary.
5. **Layout:** information strip + concourse bar (with the width assertions), concourse map, mobile sheets, kiosk, footer (platform line, Company notice, logo strip), cookie banner and settings.
6. **Merchandising** (§18): config, `boardScore`, `board` sort, home data; run on fixtures; record numbers.
7. **Pages:** catalogue → platform → type → genre → price cuts → new arrivals → product → search → cart drawer and page → checkout → order confirmed → account (keys first) → auth → activation guide → about, FAQ, contact, policies → 404 → home (static end states of all twelve sections first, DOM board included).
8. **Theater:** new ids, monitor frame, tabs board, controls, sample data and covers, five scene views, `MiniStill`s, demo mode on the new components.
9. **Brand:** `brand-mark.ts`, `BrandMark.tsx`, favicons via `gen-favicons.mjs`, manifest, metadata, OG images, invoice and email.
10. **Hand-off** to the motion engineer with every hook from §13 in place (DOM board with cell variables, `data-*` attributes, static states, `flapFrame`).
11. **Verify:** `npm run build`; every page at 320 / 390 / 768 / 1024 / 1280 / 1440 / 1600 / 1920 in Day, Night and reduced motion; header overlap assertions; theater frozen frames with `?t=`; the board with `?page=2`; re-run the contrast script after any token change.

---

## 24. Slop self-audit — the result must pass every line

**Visual**
- [ ] Radii follow roles (§5.3): 0px bands and tables, 2px flaps and tags, 4px signs and chips, 6px controls, 8px cards and dialogs, 10px board housings. No uniform rounding, no pills, no chamfers, no rotated elements; notches only on the ticket summary.
- [ ] No gradients anywhere, no glow, glass, blur (including blurred cover backdrops), blobs, mesh, neon or gradient text. Flap halves are flat colours.
- [ ] Mustard appears only as action fills, checked states, current stops, active bars, the terminus bar, board remarks/deal tiles and selection; ≤4 non-button mustard elements per viewport outside the board. Mustard is never text on the floor (except `--color-accent-ink` labels).
- [ ] The board is graphite in both themes and is the only dark object on Day pages besides the strip, gate strips and the hero hall.
- [ ] Not everything is a card: header, filters, routes, timetable, season tickets, fares board, account nav, orders, FAQ, policies and spec tables are typography, rules and boards. Boxed objects are departure cards, the buy box, the ticket, board housings, sign plates, dialogs.
- [ ] Importance varies: four large platform signs vs compact rows; line A taller than B and C; a feature row on the fares board; one hero board.
- [ ] Overpass and Sometype Mono are the only families; no Hubot, Mona, Red Hat Mono, Fraunces, Alegreya, Atkinson, Inter, Roboto, Manrope, Space Grotesk, Anton, Archivo, Sofia, Source Sans, Martian, JetBrains, Silkscreen, system-ui as identity. Mono never sets sentences.
- [ ] Type-scale tokens everywhere; uppercase only on sign labels and board flaps; buttons and nav in sentence case.
- [ ] Section padding differs per section as in §14.1.
- [ ] Icons: Lucide only, round caps, 2 / 1.75 stroke, never in circles, never decorative. Cart is `Ticket`, save is `ListPlus`/`ListCheck`, account is `IdCard`. No planes, trains, clocks as decoration, gamepads, sparkles or flames.
- [ ] Covers never blurred, tinted, overlaid or rotated, always on a stage; the hero shows text, not covers.

**Content and honesty**
- [ ] Every number on the home page, the strip and the hero board is from the database (counts, prices, sync time) or omitted. Flaps never show invented values outside the theater, and the theater always shows "Sample data". No departure times, no clocks.
- [ ] Remarks are only `ON TIME`, `NEW`, `NOW −%` (and `NOT IN STOCK` on saved/history), each data-backed, with the legend visible. No `LAST CALL`, `DELAYED`, countdowns or urgency.
- [ ] Delivery wording comes from config ("usually within minutes after payment is confirmed"); "about a minute", "instant" and similar never appear.
- [ ] No "official", "original", "guaranteed", "sold once" or marketplace words; guarantee wording matches §16 exactly.
- [ ] Security statements render only when true in config and match the Privacy Policy; the key email doesn't contain the key.
- [ ] Deals use Keyterminus' own 30-day lowest price; the fares section is absent until real cuts exist.
- [ ] No supplier mention anywhere: UI, image URLs, alt text, metadata, feeds.
- [ ] The footer has the Company notice from `COMPANY`, the trading-name line, the platform disclaimer, coloured Visa / Mastercard / PCI DSS on the white strip, and "Cookie settings".
- [ ] No Keyrook, Fablekeys, Vault Run or Paper Theatre leftovers: copy, sample titles (Lantern Coast…), `KR-`, components, metadata, storage keys.

**Function and accessibility**
- [ ] Day and Night both designed and verified; no `text-white` on mustard; board surfaces use the mustard focus ring.
- [ ] Header: no overlaps at 1024–1920 and 320–1023 (assertions pass); nav items drop by breakpoint, never wrap.
- [ ] Focus rings visible on every control, including platform signs, route stops, rail buttons, theater tabs, the play control.
- [ ] Boards are tables with captions and plain-text twins; the hero board's auto-paging has a pause control and stops on its own.
- [ ] Filters, tabs, dialogs, radiogroups, comboboxes, the theater and the timeline follow their ARIA patterns by keyboard.
- [ ] Reduced motion shows complete static designs (§21).
- [ ] Mobile is composed per §20.
- [ ] Product pages state platform, region (with note), languages, edition, requirements and validity; system requirements only for PC titles.

**Distinctness**
- [ ] Side by side with Keyrook: warm white day hall vs gunmetal vault; strip + one bar vs two steel tiers; departure card with gate strip vs steel deposit box; mustard 6px buttons vs green 0px keypad keys; `Ticket` vs `Archive`; flaps and route lines vs dial and tumblers; light concourse footer vs vault floor; a text board hero vs a cover-filled door; Board order vs Most ordered.
- [ ] Side by side with Fablekeys: no paper, no chapters, no ribbon, no seal, no serif.
- [ ] Side by side with Inspection Bay: graphite is an object on warm white, not the page; mustard (≈43°) not amber-orange (≈33°); Overpass + Sometype vs Sofia + Source + Martian.
- [ ] Could a stranger mistake this for a hacker terminal (mono paragraphs, a caret after the logo, green/amber text on black) or an airline template (planes, boarding-pass barcodes, gate countdowns)? If yes, find the section and bring it back to the hall: warm white floor, one graphite board, signage type, route lines, covers.

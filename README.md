# Casino Finder — WordPress Plugin

A quiz-based casino recommendation widget built as a WordPress plugin. Users answer 4 quick questions about their preferences, and the plugin recommends up to 3 matching casinos with bonus details.

---

## Getting Started

### Installation

1. Add the `casino-finder/` folder into `wp-content/plugins/`
2. Activate **Casino Finder** in the WordPress admin → Plugins
3. Add the shortcode to any page or post:

```
[casino_finder]
```

That's it. The quiz will render wherever you place the shortcode — works in the Classic Editor, Gutenberg, and page builders.

### Building Styles

Styles are written in SCSS and compiled to a single CSS file. If you make changes to any `.scss` file:

```bash
cd casino-finder
npm install        # first time only
npm run build      # compile once
npm run watch      # or watch for changes during development
```

The compiled CSS (`assets/css/casino-finder.css`) is committed to the repo because WordPress serves it directly — there's no build step in production.

---

## How It Works

The whole thing runs client-side after the initial page load. No AJAX calls, no server round-trips during the quiz.

**The flow:**

1. WordPress renders a single `<div>` container via the shortcode
2. PHP passes all quiz config + casino data to JavaScript through an inline script
3. A JS class (`CasinoFinder`) takes over and handles everything from there — rendering steps, capturing answers, running the matching algorithm, and displaying results

This means step transitions are instant. The user clicks an option, the next step appears immediately. After the final question, a brief loading animation plays (purely cosmetic — it builds anticipation before showing results), and then up to 3 casino recommendation cards appear.

### The Matching Algorithm

Each casino gets a score from 0 to 100 based on how well it matches the user's answers:

| Criterion | Weight | How it scores |
|-----------|--------|---------------|
| Casino type | 40 pts | Does the casino's type match what the user picked? |
| Game preference | 25 pts | Does the casino offer the user's preferred game? |
| Deposit method | 20 pts | Does the casino support the user's preferred banking? |
| Payout speed | 15 pts | Is the casino as fast (or faster) than what the user wants? |

Payout speed uses proximity scoring — if a user wants "instant" payouts and a casino offers "1–2 days", it gets half points instead of zero. Casinos that are faster than requested get full points.

Results are sorted by score (highest first), with ties broken by rating. Only the top 3 with a score above zero are shown.

---

## Adding or Editing Casinos

All casino data lives in one file: `includes/class-casino-finder-data.php`, inside the `get_casinos()` method.

Each casino is a PHP array:

```php
array(
    'id'            => 'betmgm',
    'name'          => 'BetMGM Casino',
    'slug'          => 'betmgm-casino',
    'logo'          => 'betmgm.svg',             // in assets/images/
    'rating'        => 4.9,
    'review_url'    => '/reviews/betmgm-casino/',
    'affiliate_url' => 'https://www.betmgm.com',
    'promo_code'    => 'BETMGM100',
    'bonus_text'    => '100% deposit match up to $1,000 + $25 no-deposit bonus',
    'slot_games'    => 2000,
    'has_packages'  => true,
    'has_vip'       => true,
    'types'         => array( 'online', 'fast-paying' ),
    'games'         => array( 'slots', 'blackjack', 'live-dealer', 'table-games' ),
    'banking'       => array( 'credit-card', 'paypal', 'mobile-wallet' ),
    'payout_speed'  => 'instant',
)
```

To add a new casino, copy an existing entry and update the values. Drop an SVG logo into `assets/images/` and reference the filename in `logo`. No template changes needed — the JS picks it up automatically from the config.

Quiz steps can be modified the same way in `get_steps()`. Adding a new step or changing option labels only requires editing that array.

---

## Architecture

### File Structure

```
casino-finder/
├── casino-finder.php                  # Plugin entry point
├── uninstall.php                      # Cleanup on removal
├── includes/
│   ├── class-casino-finder.php        # Main class (singleton) — hooks, asset loading
│   ├── class-casino-finder-shortcode.php  # Shortcode registration
│   └── class-casino-finder-data.php   # All quiz + casino data
├── templates/
│   └── quiz.php                       # Minimal HTML container
├── assets/
│   ├── js/casino-finder.js            # Single ES6 class — all quiz logic
│   ├── scss/                          # 7 partials + main entry point
│   ├── css/casino-finder.css          # Compiled output (committed)
│   └── images/                        # 12 SVG casino logos
└── package.json                       # SCSS build scripts
```

### PHP Side (3 classes)

- **`Casino_Finder`** — Singleton. Handles `wp_enqueue_scripts` (only loads CSS/JS on pages with the shortcode), adds `defer` to the script tag, and injects the config data via `wp_add_inline_script()`.
- **`Casino_Finder_Shortcode`** — Registers `[casino_finder]` and renders the template.
- **`Casino_Finder_Data`** — Static methods that return the quiz steps, casino data, and combined config. This is the single source of truth — edit this file to change anything about the quiz content.

### JavaScript (1 class)

`CasinoFinder` is a single ES6 class with event delegation on the container element. It manages state (`currentStep`, `answers`), renders each screen by building HTML strings and setting `innerHTML`, and runs the scoring algorithm entirely in memory.

Key methods: `renderStep()`, `renderProgressBar()`, `renderLoadingScreen()`, `calculateResults()`, `renderResults()`, `handleCopyCode()`.

### SCSS (7 partials)

All styles use the `@use` syntax with a shared `_variables.scss` for design tokens. Every class is scoped under `.casino-finder` with a `cf-` prefix to avoid conflicts with the host theme.

| Partial | What it styles |
|---------|---------------|
| `_variables` | Colors, typography, spacing, breakpoints |
| `_base` | Wrapper reset, dark background, button reset |
| `_progress-bar` | Step indicators (active / completed / upcoming) |
| `_steps` | Quiz option tiles, navigation buttons |
| `_loading` | Spinner animation, sequential messages |
| `_cards` | Bonus result cards (Figma design, dark theme) |
| `_responsive` | Tablet, mobile, small mobile breakpoints |

---

## Decisions

This is a 4-step form, not a web app. A framework would add bundle size, build complexity, and risk conflicts with WordPress or other plugins. The entire JS file is under 11KB unminified. Step transitions are instant DOM updates with zero overhead.

The assignment requires the widget to be "added to any page." Shortcodes work everywhere in WordPress — Classic Editor, Gutenberg blocks, page builders, even theme templates via `do_shortcode()`. It's the most portable option.

## Performance

The plugin is designed to be lightweight and fast:

- **Conditional loading** — CSS and JS only load on pages that actually use the `[casino_finder]` shortcode
- **Deferred JS** — The script tag gets a `defer` attribute so it doesn't block page rendering
- **Zero dependencies** — No jQuery, no external libraries, no CDN calls
- **No AJAX** — All data is embedded in the page; the entire quiz runs client-side
- **Small footprint** — JS ~11KB, CSS ~8KB (both unminified)
- **SVG logos** — Vector graphics with explicit `width`/`height` to prevent layout shift

## Accessibility

- Full keyboard navigation — Tab through options, Enter/Space to select
- Focus management — focus moves to the first option after each step transition
- Progress bar with `role="progressbar"` and `aria-valuenow`/`aria-valuemax`
- Loading messages announced via `aria-live="polite"` region
- Copy-to-clipboard feedback announced via `aria-live="assertive"` for screen readers
- `prefers-reduced-motion` respected — animations and spinner are disabled
- WCAG AA contrast ratios verified for all text on dark backgrounds
- 44px minimum touch targets on all interactive elements

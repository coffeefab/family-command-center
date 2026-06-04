# Family Command Center as a Sellable Template — Design

Date: 2026-06-04
Status: Approved design, ready to plan

## The goal in one line

Sell the Family Command Center as a simple one-time purchase: a parent pays
$9.99, gets a code, unlocks the app on their family tablet, and uses it forever.
No subscription, no accounts, no ongoing cost or support burden for the seller.

## What we deliberately chose (and why)

We considered three business shapes:

1. Hosted subscription SaaS (real accounts, multi-family privacy, monthly billing).
2. Done-for-you setup (seller deploys a private copy per customer by hand).
3. One-time "buy it and that's it" template. **← chosen**

We chose #3 because it matches the seller's intent ("pick it, buy it, done") and
keeps cost and support near zero. The tradeoff that made this possible: the app
becomes **single-device** instead of syncing across phones and tablets. Live
multi-device sync requires a server, a server costs money every month, and a
one-time price cannot pay a forever bill. Most families use a family command
center as one shared screen on the kitchen wall anyway, so this is a good fit,
not a real loss. If buyers later demand phone sync, that demand can fund a
separate paid "synced" tier in the future.

## How it works for the buyer

1. Parent finds the product (a Gumroad / LemonSqueezy listing or a small landing page).
2. Clicks buy, pays $9.99 through the platform's checkout (cards, Apple Pay, etc.).
3. Instantly receives an unlock code by email, plus the app link.
4. Opens the link on their kitchen tablet. The app shows a locked "Enter your code" screen.
5. Enters the code once. The app unlocks on that tablet forever.
6. Taps "Add to Home Screen" so it gets a real app icon and opens full-screen.
7. Adds their own kids and chores. Everything saves on the tablet itself.

## How it works for the seller

- Host the app once on free static hosting (no server, no database to pay for).
- Create one $9.99 product on Gumroad or LemonSqueezy. The platform takes the
  money (~10% fee, so ~$9 net per sale) and issues the unlock codes automatically.
- After setup, ongoing cost is ~$0 and there is essentially no support to do.

## What has to change in the app

Today the app is built for one specific family (the Castelan family, fixed kids
Dana / Matteo / Camila, a shared Supabase backend keyed by a family code, parent
PIN 1234). To become a sellable template it needs:

1. **Remove the shared server.** Replace the Supabase sync with on-device storage
   so each tablet keeps its own private data and no backend is needed. No more
   shared `family_state` row, no family code sharing.
2. **Blank-slate onboarding.** No baked-in Castelan family or default kids. A new
   buyer starts empty and adds their own kids and chores.
3. **Unlock gate.** A simple "enter your code" screen that verifies the buyer's
   code (against the Gumroad / LemonSqueezy license) and then unlocks the app on
   that device.
4. **Installable polish (PWA).** Make it "Add to Home Screen" capable so it feels
   like a real app on the tablet.

## Anti-leak approach (kept light on purpose)

A web app can never be fully leak-proof, and chasing that would hurt honest
buyers, so the goal is only to stop casual sharing.

- **Soft device lock:** a code can activate on up to ~3 tablets over its life.
  Honest families upgrading or replacing a tablet never hit the wall; someone
  sharing one code with ten friends runs out fast.
- **Activation cap enforced by the store:** Gumroad / LemonSqueezy track the
  activation count automatically, so this is a setting, not code to babysit.
- **No shareable "unlocked" link:** the unlocked state lives in the tablet's own
  storage, never in the URL, so a pre-unlocked link cannot be passed around.
  This is invisible to families and never affects switching tablets.

Deliberately **not** doing: logins, accounts, or constant server-side license
policing. Those are heavy, annoy honest buyers, and drag the seller back into
running infrastructure.

## The one sliver of support

If a family burns through their activations (e.g. replaces tablets more than a
few times), they would need a manual reset. Expected to be rare. The soft cap of
~3 activations is tuned so this almost never happens.

## Suggested build order (each is its own step, built one at a time)

This design is intentionally broken into small independent pieces. Each becomes
its own focused implementation step:

- **Step 1:** Cut the Supabase dependency, move all data to on-device storage.
- **Step 2:** Blank-slate onboarding (remove Castelan defaults, add "set up your family" flow).
- **Step 3:** The unlock gate (enter-code screen + license check + soft device lock).
- **Step 4:** Installable PWA polish (app icon, full-screen, offline).
- **Step 5:** Set up the Gumroad / LemonSqueezy product and a small landing page.

Steps 1 and 2 are pure app changes. Step 3 connects to the store. Step 5 is
mostly account setup outside the code.

## Open questions to revisit later (not blocking)

- Exact platform: Gumroad vs LemonSqueezy (both work; pick at Step 5).
- Whether to offer a future "synced across devices" paid tier if buyers ask.
- Product name and landing page copy.

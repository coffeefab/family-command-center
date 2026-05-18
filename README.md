# Espinoza Family Command Center

A warm, kid friendly dashboard for daily chores, homeschool tasks, family reminders, and star rewards. Built as a lightweight React + Vite + Tailwind app that runs in any browser and stores everything in localStorage. No backend, no accounts, no paid services.

Designed for a wall mounted tablet, large monitor in the kitchen, or any laptop the kids can reach during morning and afternoon routines.

## What is inside

* Three kid cards: Dana, Matteo, Camila. Each gets their own color (coral, sage, plum).
* Tasks grouped into Chores, Homeschool, Daily routine, and Reminders.
* Parents earn the family ten starter tasks per child, fully editable.
* Star rewards with a progress bar toward the next goal.
* Toggle between daily reset and weekly roll up for stars.
* Parent mode protected by a friendly PIN (default `1234`).
* Family reminders, rewards goals, and a one tap "clear today" reset.

## Quick start

```bash
cd family-command-center
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a new GitHub repo named `family-command-center` and push this folder to it.
2. Install the deploy helper once: `npm install` already installed `gh-pages`.
3. Build and publish with the GitHub Pages base path:

```bash
GITHUB_PAGES=true npm run build
npx gh-pages -d dist
```

4. In the repo settings, set Pages source to the `gh-pages` branch.

If your repo name is different, edit `base` in `vite.config.js`.

## How to customize

All defaults live in `src/state/store.js`.

### Children

Edit the `defaultChildren` array. Each child has an `id`, `name`, and `color`. Available colors: `coral`, `sage`, `plum`. Add more by extending `tailwind.config.js` and `src/utils/palette.js` with matching keys.

### Starter chores and assignments

Edit the `everyday` array in `store.js`. Each entry has a `title`, `category` (`chore`, `homeschool`, `routine`, or `reminder`), and `stars` value. The default seeder applies these to every child.

### Rewards

Edit `defaultRewards` for the starter goals. In the running app, parents can add and remove rewards in the Rewards card.

### PIN

Default is `1234`. Change it in Settings inside parent mode, or in `defaultState.settings.adminPin`.

### Daily reset behavior

The app keys completed tasks by date. When the date changes, the checkmarks are no longer "today's", so they reset visually without losing history. Star totals follow the mode set in Settings:

* Daily reset: each day's stars are independent.
* Weekly roll up: stars accumulate Monday through Sunday for bigger rewards.

You can also tap "Clear today's checkmarks" in Settings to wipe today's progress manually.

## File structure

```
family-command-center/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  README.md
  src/
    main.jsx           # React entrypoint
    App.jsx            # Main layout and state glue
    index.css          # Tailwind + custom styles (paper texture, animations)
    state/
      store.js         # localStorage hook, defaults, seed data
    utils/
      date.js          # today/week key helpers
      palette.js       # color and category lookups
    components/
      Header.jsx
      ChildCard.jsx
      TaskItem.jsx
      TaskEditor.jsx
      Reminders.jsx
      RewardsRail.jsx
      SettingsPanel.jsx
      PinModal.jsx
```

## Suggested next steps

* Add a "history" view that shows weekly stars per child as small charts.
* Persist data to a cloud store (Supabase free tier) so the tablet and laptop stay in sync.
* Print a daily checklist as a PDF for travel days.
* Add a "quiet mode" that hides the parent button entirely on the wall tablet.
* Read aloud the next undone task with the Web Speech API for early readers.
* Schedule a daily "good morning" view that shifts to "good afternoon" automatically (already implemented in `utils/date.js`).
* Add seasonal themes (Christmas, summer) by swapping `index.css` color variables.

## Notes

Data lives in your browser's localStorage under the key `familyCommandCenter_v1`. Clearing site data resets the app. Different browsers and different devices do not share data in the MVP.

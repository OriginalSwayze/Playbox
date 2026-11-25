# Kestrel

A new interface for the Steam desktop client, built as a [Millennium](https://steambrew.app) plugin with a
companion theme. Steam keeps doing all the work (library, launching, installs, downloads, friends, store,
overlay); Kestrel replaces how you move around it.

## What it does
- **Spaces instead of Steam's top bar:** Play, Discover, Social and You, with a gliding switcher (Alt+1–4).
- **Command bar (Ctrl+K):** find any game by name or initials, open or play it (Ctrl+Enter), jump to pages,
  run Steam actions, open Steam's menus, search the store. Works over the Store and Community too.
- **Home:** a cinematic spotlight of your most likely next game, recent games, installed games, recent additions.
- **Library:** every game as a cover wall with instant filtering, Installed / Played / Not played, five sorts.
- **Game pages:** full-bleed artwork, one adaptive button (Play / Install / Update / progress / Stop), live stats,
  and Overview, Achievements, Screenshots, News and DLC tabs. Cards fly their artwork into the page.
- **Activity panel:** downloads, friends online and quick actions.
- **Right-click** any game for Steam's game actions. The Kestrel mark opens Steam's menu; the bell and avatar open
  notifications and the account menu.
- **Companion skin:** Steam's own pages, dialogs, settings, menus, notifications, friends and chat, sign-in, and
  the Store and Community, in Kestrel's ink and amber.
- **Kestrel settings** (command bar → "Kestrel settings"): motion (follows Windows' reduced-motion setting on
  Auto), opening animation, cover tilt, spotlight rotation, start view.

## Other interfaces
Kestrel settings → Interface (or the command bar: "Interface: …") switches the whole window to one of:
- **Atlas** — your library as a map: each collection is an island of covers on a dark sea. Drag to pan, scroll
  to zoom, search to fly to a game or collection; a minimap, and an inspector with Steam's actions.
- **Shelf** — a physical games shelf: collections are lamp-lit wooden shelves of box spines; pull a box out and
  it turns to show its cover, with the game's record and a Play sticker on an insert card.
- **Terminal** — Steam as a command line on a phosphor monitor: `ls`, `find`, `info`, `play`, `install`,
  `store`, `dl`, `online`, `menu`, `ui` and more, with Tab completion, history and clickable output.
All of them use the same Steam integration as Kestrel, keep Ctrl+K, and open Steam's own pages for the Store.

## Safety
- **Ctrl+Shift+K** switches between Kestrel and Steam's own interface at any time.
- If Kestrel's interface ever fails, it steps aside and leaves Steam's normal interface on screen.
- Nothing in Steam's installation is modified. Disable the plugin in Millennium to remove it completely.

## Build
    cd plugin
    bun install
    bun run release        # or: bun run build  (debug)
    node skin-src/gen.js && node "<Steam Theme Builder>/kit/build.js" skin-src

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits together and what Steam does not allow.

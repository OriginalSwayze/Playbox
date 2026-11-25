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
- **Gazette** — your library as a printed newspaper: the game you're most likely to play is the front-page
  story, collections are the paper's sections, unplayed games run as classifieds, and a game opens as a full
  article set from its store description, with an honours list of achievements and a Play stamp.
- **Shelf** — a physical games shelf: collections are lamp-lit wooden shelves of box spines; pull a box out and
  it turns to show its cover, with the game's record and a Play sticker on an insert card.
- **Terminal** — Steam as a command line on a phosphor monitor: `ls`, `find`, `info`, `play`, `install`,
  `store`, `dl`, `online`, `menu`, `ui` and more, with Tab completion, history and clickable output.
- **Vinyl** — crates of records; a game slides out of its sleeve onto a turntable.
- **Arcade** — a neon hall of game cabinets with marquees and coin-slot Play.
- **Deck** — collectible cards with rarity from playtime and foil for your most-played.
- **Museum** — framed works in gallery rooms, with wall labels and a plaque.
- **Corkboard** — polaroids pinned to cork, with string between games that share a collection.
- **Chronicle** — your gaming life as a timeline by year and month.
- **Mission Control** — your library as live telemetry: hours, disk, activity and a launch button.
- **Springboard** — a phone home screen: app icons, collection folders, a dock and widgets.
- **Channels** — a cable TV guide where collections are channels and games are programmes.
- **Comic** — inked panels with halftone art and speech balloons, and a POW! to play.
- **Backlog** — a kanban board (never started, playing, on hold, deep dives) with ticket details.
- **Cinema** — a picture palace with a bulb-lit marquee, posters and a ticket stub that starts the show.
- **Vending** — a vending machine: key a code like B2 (on screen or keyboard) and the game drops into the tray.
- **Inbox** — a mail client: folders and labels, games as messages, unread until first played.
- **Ledger** — a spreadsheet with real columns, sheet tabs, sorting, a formula bar and SUM/AVERAGE.
- **Garden** — games grow from seed to tree with your hours; collections are garden beds.
- **Journal** — a handwritten notebook of diary entries with taped-in pictures and page turns.
- **Transit** — collections as metro lines; games in several collections are interchanges.
- **Retro Desktop** — an original 90s-style desktop with draggable windows, a taskbar and a menu.
- **Index** — Swiss typography: an A–Z index of the whole library and a poster for each game.
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

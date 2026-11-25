# Playbox

124 complete interfaces for the Steam desktop client in one box, built as a [Millennium](https://steambrew.app)
plugin with a companion theme. Steam keeps doing all the work (library, launching, installs, downloads, friends,
store, overlay); Playbox replaces how you move around it, and the interface button in every top strip (or Ctrl+I)
switches between them. The default interface, **Kestrel**, is described first; the rest follow under
"Other interfaces".

## Install (all in one)
1. Install [Millennium](https://steambrew.app) for Steam if you don't have it (version 3.4 or newer).
2. Download **Playbox-1.0.0.zip** from the [latest release](https://github.com/OriginalSwayze/Playbox/releases/latest).
3. Close Steam, then unzip it into your Steam folder (usually `C:\Program Files (x86)\Steam`), merging the
   `millennium` folder. That puts:
   - the plugin at `Steam\millennium\plugins\com.originalswayze.kestrel.star`
   - the companion theme at `Steam\millennium\themes\Playbox\`
4. Start Steam. In Millennium's settings, turn on the **Playbox** plugin and choose the **Playbox** theme, then let
   Steam restart.

The theme is optional: it dresses Steam's own pages, dialogs and menus to match. The plugin is the interfaces.
The theme is also published on its own as [Playbox-Theme](https://github.com/OriginalSwayze/Playbox-Theme), so it can be
installed from Millennium's theme browser once listed.

## Changing the design
Every interface has a **button in its top strip** showing the current design's name. Click it (or press **Ctrl+I**
anywhere) to open the picker: search by name or idea ("music", "retro", "map"), browse the six groups, jump back
through **Recent**, or hit **Surprise me**. Arrow keys and Enter work too. Your choice is remembered.

## What it does (the default interface, Kestrel)
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
The **interface button** in the top strip (it shows the current interface's name) or **Ctrl+I** opens the interface picker:
search, groups (Originals, Everyday apps, Work tools, Retro machines, Objects and places, Styles and games),
recently used and "Surprise me"; arrow keys and Enter switch. Kestrel settings, the command bar ("Interface: …") and
Terminal's `ui <id>` still work too. There are 123 alternatives:
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

And 100 more, each shaped like a different kind of app or object:
- **Forecast** — a weather app: games are cities, hours are degrees.
- **Stream** — a music streaming app with playlists and a now-playing bar.
- **Chat** — a messenger where every game is a conversation.
- **Calendar** — a calendar of your last sessions and new arrivals.
- **Photos** — a photo library with albums and a lightbox.
- **Notes** — a notes app; write your own notes per game.
- **Code** — a code editor: your library as a source tree.
- **Files** — a file manager with details view and preview.
- **Tube** — a video site with a watch page and up next.
- **Feed** — a social timeline where your library posts.
- **Swipe** — a swipe-to-match app for your backlog.
- **Ticker** — a trading terminal priced in hours played.
- **Shop** — an online store where everything is already yours.
- **Reader** — a feed reader with long-form articles.
- **Boarding** — an airline app with a boarding pass per game.
- **Home** — a smart-home controller: games are devices.
- **Drive** — a car infotainment screen with gauges.
- **Watch** — a smartwatch honeycomb with activity rings.
- **Wiki** — an encyclopedia with an article per game.
- **Forum** — an old-school message board.
- **Slides** — presentation software: each collection is a deck.
- **Canvas** — a design tool with artboards on an infinite canvas.
- **Studio** — a music workstation: tracks, clips and a mixer.
- **Cut** — a video editor with a scrubbable timeline.
- **Paint** — a paint program: draw on your covers.
- **Clocks** — a clock app set to your last sessions.
- **Delivery** — a food-delivery app: collections are restaurants.
- **Analytics** — a product-analytics dashboard of your library.
- **Gantt** — a project planner with a bar per game.
- **Mind Map** — a mind map branching from your library.
- **Flashcards** — a study app: flip cards and rate what you know.
- **Quiz Night** — a game show about your own library.
- **Habits** — a habit tracker with fortnightly goals.
- **Envelopes** — a time budget in envelopes per collection.
- **E-reader** — an e-ink reader with page turns.
- **Radio** — a valve radio: tune the dial to a game.
- **Camera** — a camera app: the shutter plays.
- **CCTV** — a security-monitor wall of feeds.
- **Tiles** — a tiling window manager with workspaces.
- **Phone** — an early-2000s mobile phone with a keypad.
- **Crossbar** — a console media bar: categories across, games down.
- **Kiosk** — a self-service touchscreen in three big taps.
- **Register** — a point-of-sale till that rings up games.
- **Receipt** — your library printed on one long till roll.
- **Typewriter** — a typewriter that types a letter per game.
- **Teletext** — a broadcast text service with page numbers.
- **BIOS** — a firmware setup utility with a boot order.
- **Wizard** — a classic setup wizard: Next, Next, Finish.
- **Homepage** — a personal web page from 1997.
- **Search** — a search engine with a knowledge panel.
- **IRC** — a 90s chat client: channels, nicks and /play.
- **Meeting** — a video call with your games as participants.
- **Listings** — a property site: every game is a listing.
- **Jobs** — a job board where Easy apply plays.
- **Flights** — a flight-booking site with a seat map.
- **Lineup** — a festival poster headlined by your top games.
- **League** — a sports league table of your games.
- **Stars** — a planetarium: games are stars, collections constellations.
- **Elements** — a periodic table of your 118 most-played games.
- **Scope** — an oscilloscope tracing your games as signals.
- **Synth** — a modular synth: patch a game to the output.
- **Wheel** — a decision wheel: spin to pick what to play.
- **Advent** — an advent calendar with a game behind each door.
- **Blueprint** — a floor plan: collections are rooms.
- **Circuit** — a circuit board: collections are chips.
- **Family Tree** — a family tree of collections and games.
- **Org Chart** — a company directory with departments.
- **Bracket** — a knockout tournament of sixteen games.
- **Menu Board** — a café chalkboard menu.
- **Stamps** — a stamp album with postmarks.
- **Passport** — a passport with an entry stamp per game.
- **Contact Sheet** — a darkroom contact sheet of film strips.
- **Magazine** — a glossy monthly with cover and features.
- **Whiteboard** — a whiteboard of draggable sticky notes.
- **Aquarium** — a fish tank: games swim, hours make them grow.
- **Pet** — a pocket virtual pet for every game.
- **Widgets** — a bento board of desktop widgets.
- **Launcher** — a keyboard launcher: type, Enter, play.
- **Assistant** — ask questions about your library.
- **Notifications** — a lock screen of game notifications.
- **Wallet** — a phone wallet of passes, one per game.
- **Contacts** — an address book of your games.
- **Appshop** — a mobile app store with Today stories.
- **Preferences** — a system-settings app with a pane per game.
- **Commits** — a version-control client: sessions as commits.
- **SQL** — a database console that runs real queries.
- **Logs** — an observability log explorer.
- **Graph** — a force-directed network of collections and games.
- **Treemap** — a disk-usage treemap by size or hours.
- **Heatmap** — a calendar heatmap of your activity.
- **Zine** — a photocopied punk fanzine with ransom-note type.
- **Brutalist** — raw web brutalism: one blunt table.
- **Soft** — soft neumorphic UI pressed from one surface.
- **Glass** — frosted glass panes over drifting colour.
- **Papercraft** — a paper-cut diorama with hanging tags.
- **Quest** — a classic RPG menu: party, items, status.
- **Novel** — a visual novel where your games talk to you.
- **Versus** — a fighting-game character select.
- **Tech Tree** — a strategy-game research tree by era.
- **Inventory** — an adventure backpack with item rarities.
All of them use the same Steam integration as Kestrel, keep Ctrl+K, and open Steam's own pages for the Store.

## Safety
- **Ctrl+Shift+K** switches between Playbox and Steam's own interface at any time.
- If an interface ever fails, Playbox steps aside and leaves Steam's normal interface on screen.
- Nothing in Steam's installation is modified. Disable the plugin in Millennium to remove it completely.

## Build
The plugin lives at the repository root (`millennium.toml`, `frontend/`); the theme is in `skin/`.

    bun install
    bun run release        # or: bun run build  (debug)
    node skin-src/gen.js && node "<Steam Theme Builder>/kit/build.js" skin-src

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits together and what Steam does not allow.

### Make your own interface
Each interface is one file in `frontend/alt/` (a React component plus its CSS). Copy one that is close to
what you want, give it a new id, then add it to `alt/catalog.ts` (name, one-line description, two swatch colours
and a group) and `alt/registry.tsx`. Rebuild and it appears in the picker.

## Changes
### 1.0.0
- First public release: 124 interfaces in one plugin, a picker button in every top strip (Ctrl+I), the companion
  theme, and the default Kestrel interface.

## License
MIT. See [LICENSE](LICENSE).

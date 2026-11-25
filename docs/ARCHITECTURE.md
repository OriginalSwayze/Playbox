# Kestrel architecture

Kestrel is a new interface for the Steam desktop client, built on Millennium (3.4+).

## Parts
- **plugin/** — a Millennium plugin (TypeScript + React, compiled with starlight). Its frontend runs in Steam's
  `SharedJSContext` and renders Kestrel's shell into the main Steam window with Steam's own React (`SP_REACT`,
  `SP_REACTDOM.createRoot`). No Lua backend is needed so far.
  - `frontend/steam/` — feature-detected adapters over Steam's stores: `appStore`, `collectionStore`,
    `appDetailsStore` (hero/logo art), `downloadsStore`, `friendStore`, `SteamClient.Apps/Installs/URL/Window`,
    and the main window's `Navigate` / `NavigateToSteamWeb`. If something is missing, callers get empty data and
    Kestrel falls back to Steam's native page.
  - `frontend/state/` — one small store (`useSyncExternalStore`) and navigation. Kestrel views (home, library,
    game) are drawn over Steam's light `/library/home` route; Steam-owned pages (Store, Community, profile,
    downloads, the classic game page) are shown natively under Kestrel's top bar.
  - `frontend/shell/` — top bar (spaces switcher, back, command trigger, activity, window controls), command bar
    (Ctrl+K), activity panel.
  - `frontend/views/` — Home dashboard, Library wall, Game page (hero, action dock, stats, Overview / Achievements /
    Screenshots / News / DLC tabs, screenshot viewer), shared cards. `steam/details.ts` feeds the game page from
    `appDetailsStore.RegisterForAppData` and Steam's public news API; `shell/Morph.tsx` flies a card's art into the hero.
  - `frontend/styles/` — design tokens, shell and view CSS, injected into the main window as one `<style>`.
  - `frontend/alt/` — the alternative interfaces, one file each (Gazette, Shelf, Terminal and 20 more), and what
    they share (`common.tsx`: window strip, game commands, collections as islands; `kit.ts`: shared styles).
    `catalog.ts` lists names and swatches without components; `registry.tsx` maps ids to components and CSS. Adding
    one = its file + an entry in each. Key handlers listen on Steam's main window (`mainWindow().BrowserWindow`, not
    the shared context's `window`) and claim their keys, or the hidden native library type-ahead navigates. The interface is a Kestrel setting, exposed as
    `<html data-ui>` so each one recolours the shared tokens (`styles/alt.ts`).
  - `frontend/ui/` — the original icon set, the Kestrel mark and the loader.
  - `webview/` — script for Steam's browser views (Store, Community); phase 6.
- **skin-src/** — the skin's source: a spec for the Steam Theme Builder (`node skin-src/gen.js && node <builder>/kit/build.js skin-src`)
  that writes into skin/ through the themes junction, on top of the builder's audited base.
- **skin/** — the built Millennium theme (linked into Steam's themes folder) for windows Kestrel restyles rather than
  rebuilds: Steam's own pages in the window, menus, notifications, friends and chat, settings, sign-in, and the
  Store and Community (`webkit.css`).

## Steam's actions
Play, install and uninstall use Steam's own `steam://rungameid`, `steam://install` and `steam://uninstall` URLs
(the `OpenInstallWizard` API did nothing when tested). Steam's Steam / View / Friends / Games / Help menus,
notifications and account menu open by clicking Steam's hidden buttons, so Steam builds and places them itself;
Kestrel exposes them through its brand button, bell, avatar and the command bar. Install state comes from Steam's
numeric display status (see `STATUS` in `steam/library.ts`).

## Steam's chrome
Steam's top bar and bottom bar stay in the DOM but are hidden; Kestrel reaches native behaviour by calling Steam's
APIs or clicking those hidden controls (friends list, add a game). Nothing in Steam's installation is modified.

## Known limits
- Store and Community are native browser views: they can be restyled and scripted, not rebuilt in React, and
  nothing drawn in the page can sit above them. While a Kestrel overlay (command bar, activity, settings) is open
  over one, Kestrel hides that browser view (`MainWindowBrowserManager.m_browser.SetVisible`) and restores it after.
- The in-game overlay, friends/chat, settings and properties are separate windows: restyled by the skin only.
- Steam can change its internal stores in any update; every adapter degrades to native Steam instead of failing.

## Performance and safety
- One 750 ms loop refreshes downloads and running games, and the library and friends every 3 s (about 2 ms);
  it publishes only when something changed, and slows to every 7.5 s while the window is hidden.
- Animations are compositor-only (transform, opacity); Kestrel's pause while a Steam page is showing, and
  animations inside Steam's hidden chrome are switched off. Covers use lazy images and content-visibility.
- Reduced motion: the setting, or Windows' preference on Auto, shortens every transition to a fade.
- `shell/Failsafe.tsx` catches render errors and unmounts Kestrel, leaving Steam's own interface;
  Ctrl+Shift+K switches Kestrel off and on.

## Develop
    cd plugin
    bun install
    bun run build      # debug build: compiles, installs into Millennium and reloads Steam's UI
    bun run release    # release build

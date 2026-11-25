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
  - `frontend/ui/` — the original icon set, the Kestrel mark and the loader.
  - `webview/` — script for Steam's browser views (Store, Community); phase 6.
- **skin-src/** — the skin's source: a spec for the Steam Theme Builder (`node skin-src/gen.js && node <builder>/kit/build.js skin-src`)
  that writes into skin/ through the themes junction, on top of the builder's audited base.
- **skin/** — the built Millennium theme (linked into Steam's themes folder) for windows Kestrel restyles rather than
  rebuilds: Steam's own pages in the window, menus, notifications, friends and chat, settings, sign-in, and the
  Store and Community (`webkit.css`).

## Steam's chrome
Steam's top bar and bottom bar stay in the DOM but are hidden; Kestrel reaches native behaviour by calling Steam's
APIs or clicking those hidden controls (friends list, add a game). Nothing in Steam's installation is modified.

## Known limits
- Store and Community are native browser views: they can be restyled and scripted, not rebuilt in React, and
  nothing drawn by Kestrel can sit above them (the command bar is not visible over the Store yet; phase 8).
- The in-game overlay, friends/chat, settings and properties are separate windows: restyled by the skin only.
- Steam can change its internal stores in any update; every adapter degrades to native Steam instead of failing.

## Develop
    cd plugin
    bun install
    bun run build      # compiles, installs into Millennium and reloads Steam's UI

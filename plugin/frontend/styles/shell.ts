// Shell styles: how Kestrel sits on Steam's main window, the top bar, the stage, command bar and activity panel.
export const shell = `
/* ---- Steam's own chrome steps aside (still present, still clickable from code) ---- */
html.kestrel .OuterFrame > .TopBar { visibility: hidden !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }
html.kestrel .OuterFrame { padding-top: var(--k-top) !important; box-sizing: border-box !important; background: var(--k-ink) !important; }
html.kestrel :is(.BottomBarContainer, .BottomBar) { visibility: hidden !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }
html.kestrel body, html.kestrel { background: var(--k-ink) !important; }
/* nothing animates inside Steam's hidden chrome */
html.kestrel :is(.OuterFrame > .TopBar, .BottomBarContainer) *, html.kestrel :is(.OuterFrame > .TopBar, .BottomBarContainer) *::before, html.kestrel :is(.OuterFrame > .TopBar, .BottomBarContainer) *::after { animation: none !important; transition: none !important; }
/* Kestrel's own layer pauses its motion while a Steam page is showing */
.k-stage.is-hidden *, .k-stage.is-hidden *::before, .k-stage.is-hidden *::after { animation-play-state: paused !important; }

/* ---- Root ---- */
#kestrel-root { position: fixed; inset: 0; z-index: 900; pointer-events: none; font-family: var(--k-text); color: var(--k-fg); -webkit-font-smoothing: antialiased; }
#kestrel-root *, #kestrel-root *::before, #kestrel-root *::after { box-sizing: border-box; }
:where(#kestrel-root) :where(button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
#kestrel-root :focus-visible { outline: 2px solid var(--k-accent); outline-offset: 2px; border-radius: 8px; }
#kestrel-root img { -webkit-user-drag: none; user-select: none; }

/* ---- Top bar ---- */
.k-top { position: absolute; left: 0; right: 0; top: 0; height: var(--k-top); display: flex; align-items: center; gap: var(--k-3); padding-left: var(--k-4);
	pointer-events: auto; background: var(--k-ink); -webkit-app-region: drag; z-index: 5; }
.k-top::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--k-line); opacity: var(--k-top-line, 1); transition: opacity var(--k-t3); }
.k-top > * { -webkit-app-region: no-drag; }
.k-top .k-drag { flex: 1; align-self: stretch; -webkit-app-region: drag; }
.k-brand { display: flex; align-items: center; gap: 10px; padding-right: 6px; font: 650 15px var(--k-display); letter-spacing: -.01em; }
.k-icon-btn { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--k-fg-2); transition: background-color var(--k-t1), color var(--k-t1), transform var(--k-t2) var(--k-spring); }
.k-icon-btn:hover { background: var(--k-s2); color: var(--k-fg); }
.k-icon-btn:active { transform: scale(.92); }
.k-icon-btn[disabled] { opacity: .3; pointer-events: none; }

/* spaces switcher with a gliding pill */
.k-switch { position: relative; display: flex; padding: 4px; gap: 2px; border-radius: var(--k-r-pill); background: var(--k-s1); box-shadow: var(--k-edge); }
.k-switch button { position: relative; z-index: 1; height: 32px; padding: 0 16px; border-radius: var(--k-r-pill); display: flex; align-items: center; gap: 8px;
	font: 600 13px var(--k-text); color: var(--k-fg-2); transition: color var(--k-t2); }
.k-switch button:hover { color: var(--k-fg); }
.k-switch button.on { color: var(--k-on-accent); }
.k-switch .k-pill { position: absolute; top: 4px; height: 32px; border-radius: var(--k-r-pill); background: linear-gradient(180deg, var(--k-accent-2), var(--k-accent));
	box-shadow: 0 6px 18px -6px var(--k-accent), inset 0 1px 0 rgba(255,255,255,.35); transition: transform var(--k-t3) var(--k-spring), width var(--k-t3) var(--k-out); }

/* command trigger */
.k-cmd-trigger { height: 38px; min-width: 300px; max-width: 460px; flex: 0 1 460px; display: flex; align-items: center; gap: 10px; padding: 0 8px 0 14px; border-radius: var(--k-r-pill);
	background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg-3) !important; font-size: 13px !important; transition: background-color var(--k-t2), box-shadow var(--k-t2); }
.k-cmd-trigger:hover { background: var(--k-s2); box-shadow: inset 0 0 0 1px var(--k-line-2); }
.k-cmd-trigger kbd, .k-kbd { margin-left: auto; font: 600 11px var(--k-small); color: var(--k-fg-3); padding: 3px 7px; border-radius: 6px; background: var(--k-s3); }

/* activity button: a ring that fills with download progress */
.k-activity-btn { position: relative; }
.k-activity-btn svg.k-ring { position: absolute; inset: 3px; width: 30px; height: 30px; transform: rotate(-90deg); }
.k-activity-btn .k-dot { position: absolute; right: 6px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--k-accent); box-shadow: 0 0 0 2px var(--k-ink); }
.k-win { display: flex; height: 100%; }
.k-win button { width: 46px; height: 100%; display: grid; place-items: center; color: var(--k-fg-2); transition: background-color var(--k-t1), color var(--k-t1); }
.k-win button:hover { background: var(--k-s2); color: var(--k-fg); }
.k-win button.x:hover { background: #C42B1C; color: #fff; }

/* ---- Stage: where Kestrel's own views live ---- */
.k-stage { position: absolute; left: 0; right: 0; top: var(--k-top); bottom: 0; pointer-events: auto; background: var(--k-ink); overflow: hidden;
	transition: opacity var(--k-t3) var(--k-out), visibility 0s linear 0s; }
.k-stage.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity var(--k-t2) var(--k-out), visibility 0s linear var(--k-t2); }
.k-view { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; animation: k-view-in var(--k-t4) var(--k-out) backwards; }
@keyframes k-view-in { from { opacity: 0; transform: translateY(14px) scale(.992); } to { opacity: 1; transform: none; } }
.k-view::-webkit-scrollbar { width: 10px; }
.k-view::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border: 3px solid transparent; border-radius: 99px; background-clip: padding-box; }
.k-view::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.22); }

/* ---- Command bar ---- */
.k-scrim { position: absolute; inset: 0; pointer-events: auto; background: rgba(4,5,8,.62); animation: k-fade var(--k-t2) var(--k-out) both; z-index: 20; }
@keyframes k-fade { from { opacity: 0; } to { opacity: 1; } }
.k-cmd { position: absolute; left: 50%; top: 72px; width: min(640px, calc(100vw - 48px)); transform: translateX(-50%); z-index: 21; pointer-events: auto;
	border-radius: var(--k-r-lg); background: var(--k-s1); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-float); overflow: hidden;
	animation: k-cmd-in var(--k-t3) var(--k-spring) both; }
@keyframes k-cmd-in { from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(.97); } to { opacity: 1; transform: translateX(-50%); } }
.k-cmd-input { display: flex; align-items: center; gap: 12px; padding: 0 18px; height: 60px; border-bottom: 1px solid var(--k-line); color: var(--k-fg-3); }
.k-cmd-input input:focus-visible { outline: none !important; }
.k-cmd-input input { flex: 1; height: 100%; background: none; border: 0; outline: none; color: var(--k-fg); font: 500 17px var(--k-display); }
.k-cmd-input input::placeholder { color: var(--k-fg-3); }
.k-cmd-list { max-height: min(440px, 60vh); overflow-y: auto; padding: 8px; }
.k-cmd-group { padding: 10px 10px 6px; font: 600 11px var(--k-small); letter-spacing: .06em; text-transform: uppercase; color: var(--k-fg-3); }
.k-cmd-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; text-align: left; transition: background-color var(--k-t1); }
.k-cmd-item .ic { width: 34px; height: 34px; flex: none; border-radius: 9px; display: grid; place-items: center; background: var(--k-s3); color: var(--k-fg-2); overflow: hidden; }
.k-cmd-item .ic img { width: 100%; height: 100%; object-fit: cover; }
.k-cmd-item .tx { flex: 1; min-width: 0; }
.k-cmd-item .tx b { display: block; font: 600 14px var(--k-text); color: var(--k-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.k-cmd-item .tx span { display: block; font-size: 12px; color: var(--k-fg-3); }
.k-cmd-item .act .k-kbd { margin-left: 0; }
.k-cmd-item .act { opacity: 0; font: 600 12px var(--k-text); color: var(--k-fg-2); display: flex; align-items: center; gap: 6px; transition: opacity var(--k-t1); }
.k-cmd-item.sel { background: var(--k-s3); }
.k-cmd-item.sel .act { opacity: 1; }
.k-cmd-item.sel .ic { color: var(--k-accent); }
.k-cmd-empty { padding: 28px; text-align: center; color: var(--k-fg-3); font-size: 13px; }
.k-cmd-foot { display: flex; gap: 16px; padding: 10px 18px; border-top: 1px solid var(--k-line); font-size: 12px; color: var(--k-fg-3); }
.k-cmd-foot span { display: flex; align-items: center; gap: 6px; }

/* ---- Activity panel ---- */
.k-panel { position: absolute; top: calc(var(--k-top) + 10px); right: 10px; bottom: 10px; width: 360px; z-index: 15; pointer-events: auto; display: flex; flex-direction: column;
	border-radius: var(--k-r-lg); background: var(--k-s1); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-float); overflow: hidden;
	transform: translateX(calc(100% + 24px)); transition: transform var(--k-t4) var(--k-out); }
.k-panel.open { transform: none; }
.k-panel-scrim { position: absolute; inset: var(--k-top) 0 0 0; z-index: 14; pointer-events: auto; background: transparent; }
.k-panel header { padding: 18px 20px 8px; font: 650 18px var(--k-display); }
.k-panel .k-sec { padding: 8px 20px 14px; }
.k-panel .k-sec h4 { margin: 10px 0 10px; font: 600 11px var(--k-small); letter-spacing: .06em; text-transform: uppercase; color: var(--k-fg-3); display: flex; align-items: center; }
.k-panel .k-sec h4 button { margin-left: auto; font: 600 12px var(--k-text); letter-spacing: 0; text-transform: none; color: var(--k-accent); }
.k-panel .k-scroll { flex: 1; overflow-y: auto; }
.k-dl { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 14px; background: var(--k-s2); }
.k-dl img { width: 56px; height: 26px; border-radius: 6px; object-fit: cover; }
.k-dl .tx { flex: 1; min-width: 0; font-size: 13px; }
.k-dl .tx b { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.k-dl .tx span { color: var(--k-fg-3); font-size: 12px; }
.k-bar { height: 4px; border-radius: 99px; background: var(--k-s4); overflow: hidden; margin-top: 6px; }
.k-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--k-accent), var(--k-accent-2)); transition: width var(--k-t4) var(--k-out); }
.k-friend { display: flex; align-items: center; gap: 12px; padding: 7px 6px; border-radius: 12px; }
.k-friend:hover { background: var(--k-s2); }
.k-friend img { width: 34px; height: 34px; border-radius: 50%; }
.k-friend[data-s="ingame"] img { box-shadow: 0 0 0 2px var(--k-s1), 0 0 0 4px var(--k-ok); }
.k-friend[data-s="online"] img { box-shadow: 0 0 0 2px var(--k-s1), 0 0 0 4px var(--k-cool); }
.k-friend .tx { min-width: 0; font-size: 13px; }
.k-friend .tx b { display: block; font-weight: 600; }
.k-friend .tx span { color: var(--k-fg-3); font-size: 12px; }
.k-friend[data-s="ingame"] .tx span { color: var(--k-ok); }
.k-quick { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.k-quick button { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 14px; background: var(--k-s2); font: 600 13px var(--k-text) !important; transition: background-color var(--k-t1); }
.k-quick button:hover { background: var(--k-s3); }
.k-muted { color: var(--k-fg-3); font-size: 13px; }

/* ---- Loader ---- */
.k-loader { position: relative; display: inline-block; }
.k-loader i { position: absolute; left: 50%; top: 50%; width: 22%; height: 22%; margin: -11%; border-radius: 50%; background: var(--k-accent); animation: k-orbit 1.1s var(--k-in-out) infinite; }
.k-loader i:nth-child(2) { animation-delay: -.12s; opacity: .7; }
.k-loader i:nth-child(3) { animation-delay: -.24s; opacity: .4; }
@keyframes k-orbit { from { transform: rotate(0deg) translateY(-140%) rotate(0deg); } to { transform: rotate(360deg) translateY(-140%) rotate(-360deg); } }

/* ---- Reduced motion ---- */
html.kestrel.k-calm #kestrel-root *, html.kestrel.k-calm #kestrel-root *::before, html.kestrel.k-calm #kestrel-root *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; scroll-behavior: auto !important; }
`;

// Game page styles.
export const game = `
.k-game { --k-scroll: 0; }
.k-ghero { position: relative; height: clamp(320px, 58vh, 560px); overflow: hidden; }
.k-ghero-art { position: absolute; left: 0; top: 0; width: 100%; height: 118%; object-fit: cover; object-position: center 20%;
	transform: translate3d(0, calc(var(--k-scroll) * .35px), 0); opacity: calc(1 - var(--k-scroll) / 900);
	animation: k-fade 700ms var(--k-out) both; will-change: transform; }
.k-ghero-scrim { position: absolute; inset: 0; background: linear-gradient(0deg, var(--k-ink) 0%, rgba(8,9,12,.55) 30%, rgba(8,9,12,0) 62%), linear-gradient(90deg, rgba(8,9,12,.7), rgba(8,9,12,0) 55%); }
.k-ghero-body { position: absolute; left: var(--k-7); bottom: 36px; max-width: min(560px, 50vw); display: flex; flex-direction: column; gap: 12px; }
.k-ghero-body > * { animation: k-rise var(--k-t4) var(--k-out) 120ms both; }
.k-ghero-sub { font: 600 13px var(--k-text); color: var(--k-fg-2); }
.k-morph { position: absolute; z-index: 30; object-fit: cover; pointer-events: none; box-shadow: 0 30px 80px -20px #000; }

/* action dock: sticks under the top bar as you scroll */
.k-dock { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; gap: 14px; margin: -10px var(--k-7) 0; padding: 12px 12px 12px 12px;
	border-radius: var(--k-r-lg); background: rgba(14,16,21,.82); -webkit-backdrop-filter: blur(24px) saturate(150%); backdrop-filter: blur(24px) saturate(150%);
	box-shadow: inset 0 0 0 1px var(--k-line), var(--k-lift); animation: k-rise var(--k-t4) var(--k-out) 180ms both; }
.k-btn.big { height: 52px; padding: 0 30px; font-size: 16px !important; min-width: 168px; justify-content: center; }
.k-btn.stop { background: linear-gradient(180deg, #FF8A7A, #E5533F) !important; color: #210604 !important; box-shadow: 0 14px 34px -12px #E5533F; min-width: 168px; justify-content: center; height: 52px; }
.k-btn.progress { position: relative; overflow: hidden; height: 52px; min-width: 220px; }
.k-btn.progress::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: var(--p); background: var(--k-a20); transition: width var(--k-t4) var(--k-out); }
.k-stats { flex: 1; display: flex; gap: 6px; min-width: 0; overflow: hidden; }
.k-stat { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 6px 16px; border-left: 1px solid var(--k-line); white-space: nowrap; }
.k-stat .lbl { display: flex; align-items: center; gap: 6px; font: 600 11px var(--k-small); letter-spacing: .05em; text-transform: uppercase; color: var(--k-fg-3); }
.k-stat b { font: 650 15px var(--k-display); color: var(--k-fg); font-variant-numeric: tabular-nums; }
.k-stat:has(.k-ach-ring) { padding-right: 56px; }
.k-stat .k-ach-ring { position: absolute; right: 12px; top: 50%; margin-top: -18px; }
.k-ring-fill { transition: stroke-dashoffset 1s var(--k-out); }

/* more menu */
.k-menu-wrap { position: relative; }
.k-menu { position: absolute; right: 0; top: calc(100% + 8px); width: 230px; padding: 6px; border-radius: 16px; background: var(--k-s2); z-index: 10;
	box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-float); transform-origin: top right; animation: k-menu-in 220ms var(--k-spring) both; }
@keyframes k-menu-in { from { opacity: 0; transform: scale(.94) translateY(-4px); } to { opacity: 1; transform: none; } }
.k-menu button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; font: 500 13.5px var(--k-text) !important; color: var(--k-fg) !important; text-align: left; }
.k-menu button svg { color: var(--k-fg-3); }
.k-menu button:hover { background: var(--k-s3); }
.k-menu button.danger { color: #FF8A7A !important; }
.k-menu hr { border: 0; height: 1px; background: var(--k-line); margin: 5px 8px; }

/* tabs with a sliding ink bar */
.k-tabs { position: relative; display: flex; gap: 4px; margin: 26px var(--k-7) 0; border-bottom: 1px solid var(--k-line); }
.k-tabs button { position: relative; padding: 12px 14px 14px; font: 600 14px var(--k-text) !important; color: var(--k-fg-3) !important; transition: color var(--k-t2); display: flex; align-items: center; gap: 8px; }
.k-tabs button:hover { color: var(--k-fg-2) !important; }
.k-tabs button.on { color: var(--k-fg) !important; }
.k-tabs button span { font: 650 11px var(--k-small); padding: 2px 7px; border-radius: 99px; background: var(--k-s3); color: var(--k-fg-2); }
.k-tab-ink { position: absolute; left: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--k-accent); box-shadow: 0 0 12px var(--k-accent); transition: transform var(--k-t3) var(--k-spring), width var(--k-t3) var(--k-out); }
.k-tab-body { padding: 26px var(--k-7) 64px; animation: k-rise var(--k-t3) var(--k-out) both; }

/* overview */
.k-overview { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 48px; }
.k-prose p { margin: 0 0 14px; font: 400 15px/1.7 var(--k-text); color: var(--k-fg-2); max-width: 72ch; }
.k-prose p:first-child { font-size: 17px; color: var(--k-fg); }
.k-side { display: flex; flex-direction: column; gap: 22px; }
.k-facts { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; padding: 16px 18px; border-radius: var(--k-r); background: var(--k-s1); box-shadow: var(--k-edge); font-size: 13px; }
.k-facts dt { color: var(--k-fg-3); }
.k-facts dd { margin: 0; color: var(--k-fg); font-weight: 600; }
.k-side-head { display: flex; align-items: center; margin-bottom: 10px; font: 600 11px var(--k-small); letter-spacing: .06em; text-transform: uppercase; color: var(--k-fg-3); }
.k-side-head button { margin-left: auto; font: 600 12.5px var(--k-text) !important; letter-spacing: 0; text-transform: none; color: var(--k-accent) !important; }
.k-shots-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.k-shots-mini img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 10px; }
@media (max-width: 1100px) { .k-overview { grid-template-columns: 1fr; } }

/* achievements */
.k-ach { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 14px; background: var(--k-s1); box-shadow: var(--k-edge); margin-bottom: 8px; }
.k-ach img { width: 44px; height: 44px; border-radius: 10px; flex: none; filter: grayscale(1) brightness(.55); }
.k-ach.on img { filter: none; box-shadow: 0 0 0 1px var(--k-a40), 0 6px 16px -6px var(--k-accent); }
.k-ach .tx { flex: 1; min-width: 0; }
.k-ach .tx b { display: block; font: 600 13.5px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.k-ach .tx span { display: block; font-size: 12px; color: var(--k-fg-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.k-ach em { font: 600 11.5px var(--k-small); font-style: normal; color: var(--k-fg-3); white-space: nowrap; }
.k-ach.on em { color: var(--k-accent-2); }
.k-ach-sum { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.k-ach-sum b { font: 650 18px var(--k-display); }
.k-ach-sum span { color: var(--k-fg-3); }
.k-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0 12px; }
.k-ach-grid .k-ach { animation: k-rise var(--k-t3) var(--k-out) both; }

/* screenshots + lightbox */
.k-shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.k-shots button { border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; box-shadow: var(--k-edge); animation: k-rise var(--k-t3) var(--k-out) both; transition: transform var(--k-t3) var(--k-spring); }
.k-shots button:hover { transform: scale(1.03); }
.k-shots img { width: 100%; height: 100%; object-fit: cover; }
.k-lightbox { position: fixed; inset: var(--k-top) 0 0 0; z-index: 40; display: grid; place-items: center; background: rgba(4,5,8,.9); animation: k-fade var(--k-t2) var(--k-out) both; }
.k-lightbox img { max-width: calc(100% - 96px); max-height: calc(100% - 140px); border-radius: 12px; box-shadow: var(--k-float); animation: k-zoom var(--k-t3) var(--k-out) both; }
@keyframes k-zoom { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
.k-lb-bar { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 99px; background: var(--k-s2); box-shadow: inset 0 0 0 1px var(--k-line-2); font-size: 13px; color: var(--k-fg-2); }
.k-lb-bar span { padding: 0 8px; }

/* news */
.k-news { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 14px; }
.k-news-item { text-align: left; padding: 18px 20px; border-radius: var(--k-r); background: var(--k-s1); box-shadow: var(--k-edge); animation: k-rise var(--k-t3) var(--k-out) both; transition: background-color var(--k-t2), transform var(--k-t3) var(--k-spring); }
.k-news-item:hover { background: var(--k-s2); transform: translateY(-3px); }
.k-news-item .when { font: 600 11.5px var(--k-small); color: var(--k-accent-2); letter-spacing: .03em; }
.k-news-item b { display: block; margin: 8px 0 6px; font: 650 16px var(--k-display); color: var(--k-fg); }
.k-news-item p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--k-fg-3); }
.k-center { display: grid; place-items: center; padding: 60px; }

/* dlc */
.k-dlc { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.k-dlc button { text-align: left; border-radius: var(--k-r); overflow: hidden; background: var(--k-s1); box-shadow: var(--k-edge); transition: transform var(--k-t3) var(--k-spring); }
.k-dlc button:hover { transform: translateY(-3px); }
.k-dlc img { width: 100%; aspect-ratio: 460/215; object-fit: cover; display: block; background: var(--k-s2); }
.k-dlc b { display: block; padding: 10px 12px 2px; font: 600 13px var(--k-text); }
.k-dlc span { display: block; padding: 0 12px 12px; font-size: 12px; color: var(--k-fg-3); }
`;

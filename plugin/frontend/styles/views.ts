// View styles: the home dashboard, the library wall and shared game cards.
export const views = `
/* ---- Home: spotlight ---- */
.k-hero { position: relative; height: clamp(380px, 64vh, 620px); overflow: hidden; }
.k-hero-art { position: absolute; inset: 0; }
.k-hero-art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 25%;
	animation: k-hero-in 1100ms var(--k-out) both, k-drift 26s ease-in-out 1100ms infinite alternate; transform-origin: 60% 40%; will-change: transform, opacity; }
@keyframes k-hero-in { from { opacity: 0; transform: scale(1.06); filter: blur(10px); } to { opacity: 1; transform: scale(1.02); filter: none; } }
@keyframes k-drift { from { transform: scale(1.02) translate3d(0,0,0); } to { transform: scale(1.08) translate3d(-1.2%, -1%, 0); } }
.k-hero-scrim { position: absolute; inset: 0; background:
	linear-gradient(90deg, rgba(8,9,12,.92) 0%, rgba(8,9,12,.6) 34%, rgba(8,9,12,0) 64%),
	linear-gradient(0deg, var(--k-ink) 0%, rgba(8,9,12,.4) 26%, rgba(8,9,12,0) 52%); }
.k-hero-body { position: absolute; left: var(--k-7); bottom: var(--k-7); width: min(520px, 46vw); display: flex; flex-direction: column; gap: 16px; }
.k-hero-body > * { animation: k-rise var(--k-t4) var(--k-out) both; }
.k-hero-body > :nth-child(2) { animation-delay: 60ms; } .k-hero-body > :nth-child(3) { animation-delay: 120ms; } .k-hero-body > :nth-child(4) { animation-delay: 180ms; }
@keyframes k-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.k-eyebrow { display: flex; align-items: center; gap: 8px; font: 600 12px var(--k-small); letter-spacing: .08em; text-transform: uppercase; color: var(--k-accent-2); }
.k-eyebrow::before { content: ""; width: 18px; height: 2px; border-radius: 2px; background: currentColor; }
.k-hero-logo { max-width: 100%; max-height: 150px; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 12px 30px rgba(0,0,0,.6)); }
.k-hero-title { margin: 0; font: 700 clamp(34px, 4.4vw, 56px)/1.02 var(--k-display); letter-spacing: -.025em; text-wrap: balance; }
.k-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.k-chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: var(--k-r-pill); background: rgba(255,255,255,.07);
	box-shadow: var(--k-edge); font: 600 12px var(--k-text); color: var(--k-fg); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.k-chip svg { color: var(--k-fg-2); }
.k-actions { display: flex; gap: 10px; align-items: center; }
.k-btn { height: 46px; padding: 0 22px; border-radius: var(--k-r-pill); display: inline-flex; align-items: center; gap: 10px; font: 650 15px var(--k-text) !important;
	transition: transform var(--k-t2) var(--k-spring), box-shadow var(--k-t2), background-color var(--k-t2), filter var(--k-t2); }
.k-btn:active { transform: scale(.96); }
.k-btn.primary { background: linear-gradient(180deg, var(--k-accent-2), var(--k-accent)) !important; color: var(--k-on-accent) !important;
	box-shadow: 0 14px 34px -12px var(--k-accent), inset 0 1px 0 rgba(255,255,255,.4); }
.k-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -12px var(--k-accent), inset 0 1px 0 rgba(255,255,255,.4); }
.k-btn.ghost { background: rgba(255,255,255,.08) !important; box-shadow: var(--k-edge); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.k-btn.ghost:hover { background: rgba(255,255,255,.14) !important; }
.k-btn.round { width: 46px; padding: 0; justify-content: center; }

/* spotlight picker: the next few recent games */
.k-picks { position: absolute; right: var(--k-7); bottom: var(--k-7); display: flex; gap: 10px; }
.k-pick { position: relative; width: 132px; aspect-ratio: 460/215; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 12px 30px -14px #000;
	opacity: .62; transition: opacity var(--k-t2), transform var(--k-t3) var(--k-spring), box-shadow var(--k-t2); }
.k-pick img { width: 100%; height: 100%; object-fit: cover; }
.k-pick:hover { opacity: 1; transform: translateY(-4px); }
.k-pick.on { opacity: 1; box-shadow: 0 0 0 2px var(--k-accent), 0 16px 34px -14px #000; }

/* ---- Sections ---- */
.k-section { padding: 8px var(--k-7) 28px; }
.k-section-head { display: flex; align-items: baseline; gap: 12px; margin: 10px 0 14px; }
.k-section-head h2 { margin: 0; font: 650 20px var(--k-display); letter-spacing: -.01em; }
.k-section-head span { color: var(--k-fg-3); font-size: 13px; }
.k-section-head button { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; font: 600 13px var(--k-text) !important; color: var(--k-fg-2) !important; padding: 6px 12px; border-radius: 99px; transition: background-color var(--k-t1), color var(--k-t1); }
.k-section-head button:hover { background: var(--k-s2); color: var(--k-fg) !important; }

/* horizontal rail */
.k-rail { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(280px, 1fr); gap: 16px; overflow-x: auto; padding: 6px 2px 18px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.k-rail::-webkit-scrollbar { display: none; }

/* landscape card */
.k-card { position: relative; scroll-snap-align: start; border-radius: var(--k-r); text-align: left; transition: transform var(--k-t3) var(--k-spring); }
.k-card .art { position: relative; transform-style: preserve-3d; aspect-ratio: 460/215; border-radius: var(--k-r); overflow: hidden; background: var(--k-s2); box-shadow: 0 0 0 1px rgba(255,255,255,.05), var(--k-lift); transition: box-shadow var(--k-t3); }
.k-card .art img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--k-t4) var(--k-out); }
.k-card .art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.16) 48%, transparent 62%);
	transform: translateX(-120%); transition: transform 900ms var(--k-out); }
.k-card:hover { transform: translateY(-6px); }
.k-card:hover .art { box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 26px 50px -20px #000; }
.k-card:hover .art img { transform: scale(1.05); }
.k-card:hover .art::after { transform: translateX(120%); }
.k-card .cap { display: flex; align-items: center; gap: 10px; padding: 12px 4px 0; }
.k-card .cap .tx { flex: 1; min-width: 0; }
.k-card .cap b { display: block; font: 600 14px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.k-card .cap span { font-size: 12px; color: var(--k-fg-3); }
.k-card .quick { position: absolute; right: 12px; top: 12px; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
	background: linear-gradient(180deg, var(--k-accent-2), var(--k-accent)); color: var(--k-on-accent); box-shadow: 0 10px 24px -8px var(--k-accent);
	opacity: 0; transform: scale(.7); transition: opacity var(--k-t2), transform var(--k-t3) var(--k-spring); }
.k-card:hover .quick, .k-card:focus-within .quick { opacity: 1; transform: none; }
.k-card .quick.install { background: rgba(20,22,30,.85); color: var(--k-fg); box-shadow: inset 0 0 0 1px var(--k-line-2); }

/* vertical cover grid */
.k-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 22px 18px; }
.k-cover { position: relative; text-align: left; content-visibility: auto; contain-intrinsic-size: 150px 260px; transition: transform var(--k-t3) var(--k-spring); }
.k-cover .art { position: relative; aspect-ratio: 2/3; border-radius: 12px; overflow: hidden; background: var(--k-s2); box-shadow: 0 0 0 1px rgba(255,255,255,.05), var(--k-lift); transition: box-shadow var(--k-t3); }
.k-cover .art img { width: 100%; height: 100%; object-fit: cover; }
.k-cover .art .fallback { position: absolute; inset: 0; display: grid; place-items: center; padding: 12px; text-align: center; font: 650 15px var(--k-display); color: var(--k-fg-2); background: linear-gradient(160deg, var(--k-s3), var(--k-s1)); }
.k-cover:hover { transform: translateY(-6px) scale(1.02); }
.k-cover:hover .art { box-shadow: 0 0 0 2px var(--k-accent), 0 26px 50px -20px #000; }
.k-cover .name { margin-top: 10px; font: 600 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--k-fg-2); }
.k-cover:hover .name { color: var(--k-fg); }
.k-cover.dim .art img { filter: grayscale(.55) brightness(.78); transition: filter var(--k-t3); }
.k-cover.dim:hover .art img { filter: none; }
.k-cover .badge { position: absolute; left: 8px; top: 8px; height: 22px; padding: 0 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;
	font: 700 10.5px var(--k-small); letter-spacing: .04em; text-transform: uppercase; background: rgba(8,9,12,.78); color: var(--k-fg); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.k-cover .badge.busy { color: var(--k-accent-2); }

/* ---- Library ---- */
.k-lib-head { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 22px var(--k-7) 16px; background: linear-gradient(180deg, var(--k-ink) 70%, rgba(8,9,12,0)); }
.k-lib-head h1 { margin: 0 8px 0 0; font: 700 30px var(--k-display); letter-spacing: -.02em; }
.k-lib-head .count { color: var(--k-fg-3); font-size: 14px; margin-right: auto; }
.k-field { height: 38px; width: 260px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg-3); transition: box-shadow var(--k-t2), width var(--k-t3) var(--k-out); }
.k-field:focus-within { box-shadow: inset 0 0 0 1.5px var(--k-accent); width: 320px; }
.k-field input { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--k-fg); font: 500 14px var(--k-text); }
.k-seg { display: flex; padding: 3px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); }
.k-seg button { height: 32px; padding: 0 14px; border-radius: 99px; font: 600 12.5px var(--k-text) !important; color: var(--k-fg-2) !important; transition: background-color var(--k-t2), color var(--k-t2); }
.k-seg button:hover { color: var(--k-fg) !important; }
.k-seg button.on { background: var(--k-s3); color: var(--k-fg) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
.k-select { height: 38px; padding: 0 12px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg); border: 0; font: 600 12.5px var(--k-text); outline: none; }
.k-lib-body { padding: 4px var(--k-7) 48px; }
.k-empty { padding: 80px 0; text-align: center; color: var(--k-fg-3); }
.k-empty b { display: block; color: var(--k-fg); font: 650 18px var(--k-display); margin-bottom: 6px; }
`;

// Styles for the alternative interfaces. Each one recolours Kestrel's shared tokens on <html data-ui="…">
// so the shared panels (activity, command bar, menus, settings) match it.
export const alt = `
/* ================= shared strip ================= */
.k-alt-top { gap: 14px; }
.k-alt-top :is(.at-brand, .sh-brand, .tm-brand) { border-radius: 10px; padding: 6px 10px; transition: background-color var(--k-t1); }
.k-alt-top :is(.at-brand, .sh-brand, .tm-brand):hover { background: var(--k-s2); }
.k-alt-places { display: flex; gap: 4px; }
.k-alt-place { height: 34px; padding: 0 12px; border-radius: 10px; display: inline-flex; align-items: center; gap: 7px; font: 600 13px var(--k-text) !important; color: var(--k-fg-2) !important; transition: background-color var(--k-t1), color var(--k-t1); }
.k-alt-place:hover { background: var(--k-s2); color: var(--k-fg) !important; }
.k-alt-place.on { background: var(--k-a20); color: var(--k-accent-2) !important; }

/* ================= ATLAS ================= */
html.kestrel[data-ui="atlas"] {
	--k-ink: #051018; --k-s1: #0A1A25; --k-s2: #0F2331; --k-s3: #16303F; --k-s4: #1F3E50;
	--k-line: rgba(140, 220, 230, .08); --k-line-2: rgba(140, 220, 230, .16);
	--k-fg: #E6F4F5; --k-fg-2: #9DB6BC; --k-fg-3: #5F7A82;
	--k-accent: #4FD9E0; --k-accent-2: #A6F1F2; --k-on-accent: #02171A;
	--k-a10: rgba(79,217,224,.10); --k-a20: rgba(79,217,224,.18); --k-a40: rgba(79,217,224,.38);
}
.at-brand { display: flex; align-items: center; gap: 9px; font: 700 15px var(--k-display); letter-spacing: .22em; text-transform: uppercase; color: var(--k-accent-2); padding-right: 6px; }
.at-search { height: 38px; width: min(420px, 34vw); display: flex; align-items: center; gap: 9px; padding: 0 14px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg-3); transition: box-shadow var(--k-t2); }
.at-search:focus-within { box-shadow: inset 0 0 0 1.5px var(--k-accent); }
.at-search input { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--k-fg); font: 500 13.5px var(--k-text); }
.at-search em { font: 700 11px var(--k-small); font-style: normal; color: var(--k-on-accent); background: var(--k-accent); padding: 2px 7px; border-radius: 99px; }
.at-stage { background: var(--k-ink); }
.at-sea { position: absolute; inset: 0; overflow: hidden; cursor: grab; touch-action: none;
	background-color: #051018;
	background-image: linear-gradient(rgba(79,217,224,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,217,224,.05) 1px, transparent 1px); }
.at-sea:active { cursor: grabbing; }
.at-sea::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(2,8,12,.75)); }
.at-world { position: absolute; left: 0; top: 0; transform-origin: 0 0; will-change: transform; }
.at-island { position: absolute; }
.at-land { position: absolute; left: 0; overflow: visible; pointer-events: none; }
.at-land .c1 { fill: #0D2532; stroke: rgba(120, 230, 235, .45); stroke-width: 2; }
.at-land .c2 { fill: none; stroke: rgba(120, 230, 235, .16); stroke-width: 1.5; }
.at-land .c3 { fill: none; stroke: rgba(120, 230, 235, .08); stroke-width: 1.5; stroke-dasharray: 6 8; }
.at-island.recent .at-land .c1 { fill: #14283A; stroke: rgba(255, 203, 122, .55); }
.at-island.hit .at-land .c1 { stroke: var(--k-accent); stroke-width: 4; filter: drop-shadow(0 0 18px rgba(79,217,224,.5)); }
.at-name { position: absolute; left: 50%; top: 0; transform-origin: 50% 100%; white-space: nowrap; pointer-events: none;
	font: 700 15px var(--k-display); letter-spacing: .2em; text-transform: uppercase; color: #CFEFF1; text-shadow: 0 2px 12px #000; }
.at-name span { margin-left: 10px; font: 600 11px var(--k-small); letter-spacing: .04em; color: var(--k-accent); }
.at-island.recent .at-name { color: #FFE2B0; }
.at-tiles { position: absolute; inset: 0; }
.at-tile { position: absolute; width: 64px; height: 96px; border-radius: 6px; overflow: hidden; background: #16303F; box-shadow: 0 0 0 1px rgba(0,0,0,.4), 0 6px 14px -6px #000; opacity: .55; transition: opacity .2s, transform .3s var(--k-spring), box-shadow .2s; }
.at-tile.on { opacity: 1; }
.at-tile img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.at-tile:hover { opacity: 1; transform: scale(1.25); z-index: 2; box-shadow: 0 0 0 2px var(--k-accent), 0 14px 30px -8px #000; }
.at-tile.sel { opacity: 1; transform: scale(1.3); z-index: 3; box-shadow: 0 0 0 3px var(--k-accent), 0 0 30px 6px rgba(79,217,224,.45); animation: at-ping 1.8s ease-out infinite; }
@keyframes at-ping { 0% { box-shadow: 0 0 0 3px var(--k-accent), 0 0 0 0 rgba(79,217,224,.6); } 100% { box-shadow: 0 0 0 3px var(--k-accent), 0 0 0 26px rgba(79,217,224,0); } }
.at-tile.hit { opacity: 1; box-shadow: 0 0 0 3px var(--k-accent); }
.at-tile.miss { opacity: .12; }
.at-sea.far .at-tile { background: rgba(120,230,235,.25); border-radius: 3px; }
.at-sea.far .at-tile.on { background: rgba(120,230,235,.55); }
.at-sea.far .at-tile.hit { background: var(--k-accent); }
.at-ui { position: absolute; z-index: 5; }
.at-mini { left: 18px; bottom: 18px; border-radius: 12px; background: rgba(5,16,24,.85); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-lift); overflow: hidden; cursor: crosshair; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.at-mini i { position: absolute; border-radius: 40%; background: rgba(120,230,235,.35); }
.at-mini b { position: absolute; border: 1.5px solid var(--k-accent); border-radius: 3px; box-shadow: 0 0 0 9999px rgba(0,0,0,.25); }
.at-zoom { right: 18px; bottom: 18px; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: rgba(5,16,24,.85); box-shadow: inset 0 0 0 1px var(--k-line-2); }
.at-zoom button { width: 42px; height: 40px; display: grid; place-items: center; color: var(--k-fg-2); }
.at-zoom button:hover { background: var(--k-s3); color: var(--k-fg); }
.at-legend { left: 50%; bottom: 18px; transform: translateX(-50%); font: 600 11.5px var(--k-small); letter-spacing: .04em; color: var(--k-fg-3); padding: 6px 12px; border-radius: 99px; background: rgba(5,16,24,.7); pointer-events: none; }
.at-inspector { position: absolute; top: 14px; right: 14px; bottom: 14px; width: 380px; z-index: 6; display: flex; flex-direction: column; border-radius: 20px; overflow: hidden;
	background: rgba(8,22,31,.94); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-float); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); animation: at-in 520ms var(--k-out) both; }
@keyframes at-in { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: none; } }
.at-ins-art { position: relative; height: 180px; flex: none; }
.at-ins-art img { width: 100%; height: 100%; object-fit: cover; }
.at-ins-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(8,22,31,1), transparent 60%); }
.at-ins-close { position: absolute; right: 10px; top: 10px; z-index: 1; background: rgba(5,16,24,.7) !important; }
.at-ins-body { padding: 4px 22px 22px; overflow-y: auto; }
.at-coord { font: 600 11px var(--k-small); letter-spacing: .14em; text-transform: uppercase; color: var(--k-accent); }
.at-ins-body h2 { margin: 6px 0 16px; font: 700 24px/1.15 var(--k-display); letter-spacing: -.01em; }
.at-ins-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px; }
.at-ins-stats div { padding: 10px; border-radius: 12px; background: var(--k-s2); }
.at-ins-stats span { display: block; font: 600 10.5px var(--k-small); letter-spacing: .06em; text-transform: uppercase; color: var(--k-fg-3); }
.at-ins-stats b { display: block; margin-top: 3px; font: 650 13.5px var(--k-text); }
.at-play { width: 100%; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; font: 700 15px var(--k-text) !important;
	background: linear-gradient(180deg, var(--k-accent-2), var(--k-accent)) !important; color: var(--k-on-accent) !important; box-shadow: 0 12px 30px -12px var(--k-accent); transition: transform .3s var(--k-spring); }
.at-play:hover { transform: translateY(-2px); }
.at-ins-actions { margin-top: 12px; display: grid; gap: 4px; }
.at-ins-actions button { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font: 600 13px var(--k-text) !important; color: var(--k-fg-2) !important; text-align: left; }
.at-ins-actions button:hover { background: var(--k-s2); color: var(--k-fg) !important; }

/* ================= SHELF ================= */
html.kestrel[data-ui="shelf"] {
	--k-ink: #140E0A; --k-s1: #1E1510; --k-s2: #281C15; --k-s3: #34251B; --k-s4: #433022;
	--k-line: rgba(255, 220, 170, .08); --k-line-2: rgba(255, 220, 170, .16);
	--k-fg: #F5E9D8; --k-fg-2: #C2AE96; --k-fg-3: #8A7660;
	--k-accent: #E2B06A; --k-accent-2: #F6D7A0; --k-on-accent: #2A1A08;
	--k-a10: rgba(226,176,106,.10); --k-a20: rgba(226,176,106,.18); --k-a40: rgba(226,176,106,.38);
}
.sh-brand { display: flex; align-items: center; gap: 9px; font: italic 700 19px Georgia, "Times New Roman", serif; color: var(--k-accent-2); padding-right: 6px; }
.sh-search { height: 38px; width: min(400px, 32vw); display: flex; align-items: center; gap: 9px; padding: 0 14px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg-3); }
.sh-search:focus-within { box-shadow: inset 0 0 0 1.5px var(--k-accent); }
.sh-search input { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--k-fg); font: 500 13.5px var(--k-text); }
.sh-search em { font: 700 11px var(--k-small); font-style: normal; color: var(--k-on-accent); background: var(--k-accent); padding: 2px 7px; border-radius: 99px; }
.sh-stage { background: #140E0A; }
.sh-room { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; padding: 40px 0 80px;
	background:
		repeating-linear-gradient(90deg, rgba(255,230,190,.018) 0 2px, transparent 2px 46px),
		radial-gradient(70% 45% at 50% 0%, rgba(255,190,110,.16), transparent 70%),
		linear-gradient(180deg, #1D140E, #120C08 70%); }
.sh-lamp { position: absolute; left: 50%; top: 0; width: 70%; height: 340px; transform: translateX(-50%); pointer-events: none;
	background: radial-gradient(50% 60% at 50% 0%, rgba(255,205,140,.22), transparent 75%); animation: sh-flicker 7s ease-in-out infinite; }
@keyframes sh-flicker { 0%, 100% { opacity: 1; } 47% { opacity: .92; } 50% { opacity: .98; } }
.sh-unit { position: relative; margin: 0 48px 54px; animation: k-rise 700ms var(--k-out) both; }
.sh-plate { display: inline-flex; align-items: baseline; gap: 10px; margin: 0 0 12px 8px; padding: 6px 14px; border-radius: 4px;
	background: linear-gradient(180deg, #D9AE6A, #A97D3E); color: #2A1A08; box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 3px 8px rgba(0,0,0,.5); }
.sh-plate b { font: italic 700 15px Georgia, serif; }
.sh-plate span { font: 700 11px var(--k-small); opacity: .7; }
.sh-row { position: relative; perspective: 1400px; }
.sh-books { display: flex; align-items: flex-end; gap: 3px; padding: 22px 20px 0; overflow-x: auto; overflow-y: visible; scrollbar-width: thin; min-height: 250px; }
.sh-plank { height: 26px; margin-top: -2px; border-radius: 3px;
	background: linear-gradient(180deg, #8A5A33 0%, #6B4425 30%, #4A2E18 100%);
	box-shadow: inset 0 2px 0 rgba(255,220,170,.25), 0 18px 28px -10px rgba(0,0,0,.85), 0 4px 0 #2B190C; }
.sh-spine { position: relative; flex: none; width: 40px; height: 228px; border-radius: 3px 3px 1px 1px; overflow: hidden; transform-origin: 50% 100%;
	background: hsl(var(--h) 28% 22%); box-shadow: inset -3px 0 6px rgba(0,0,0,.45), inset 2px 0 0 rgba(255,255,255,.08), 0 2px 4px rgba(0,0,0,.5);
	filter: brightness(.62) saturate(.7); transition: transform 380ms var(--k-spring), filter 250ms, box-shadow 250ms; }
.sh-spine:nth-child(5n+2) { height: 216px; } .sh-spine:nth-child(7n+3) { height: 236px; } .sh-spine:nth-child(4n) { width: 44px; }
.sh-spine.on { filter: none; }
.sh-spine img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 30% 50%; opacity: .85; }
.sh-spine::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05) 35%, rgba(255,255,255,.08) 50%, rgba(0,0,0,.35)); }
.sh-band { position: absolute; left: 0; right: 0; top: 14px; height: 6px; z-index: 1; background: hsl(var(--h) 55% 55%); opacity: .8; }
.sh-title { position: absolute; left: 50%; bottom: 14px; z-index: 1; transform: translateX(-50%) rotate(180deg); writing-mode: vertical-rl; max-height: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
	font: 700 12px var(--k-text); letter-spacing: .02em; color: #FFF6E8; text-shadow: 0 1px 3px #000, 0 0 8px rgba(0,0,0,.8); }
.sh-led { position: absolute; left: 50%; top: 26px; z-index: 1; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #9BE08A; box-shadow: 0 0 6px #9BE08A; }
.sh-spine:hover { transform: translateY(-16px) rotateY(-10deg); filter: none; box-shadow: inset -3px 0 6px rgba(0,0,0,.45), 0 18px 24px -8px rgba(0,0,0,.8), 0 0 0 1px rgba(255,220,170,.35); z-index: 2; }
.sh-spine.hit { filter: none; box-shadow: 0 0 0 2px var(--k-accent), 0 0 18px rgba(226,176,106,.5); }
.sh-spine.miss { filter: brightness(.3) saturate(.3); }
.sh-spine.flash { animation: sh-flash 1.3s ease-out; }
@keyframes sh-flash { 0%, 100% { transform: none; } 20%, 60% { transform: translateY(-22px); } 40% { transform: translateY(-10px); } }
/* the pulled box */
.sh-pulled { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; gap: 70px; padding: 30px;
	background: radial-gradient(60% 70% at 40% 50%, rgba(255,190,110,.12), rgba(10,7,5,.92) 70%); animation: k-fade 300ms var(--k-out) both; perspective: 1600px; }
.sh-pulled.closing { animation: k-fade 380ms var(--k-out) reverse both; }
.sh-box3d { position: relative; width: 300px; height: 450px; transform-style: preserve-3d; animation: sh-turn 900ms var(--k-out) both; }
.sh-pulled.closing .sh-box3d { animation: sh-turn 380ms var(--k-in-out) reverse both; }
@keyframes sh-turn { from { transform: translate3d(0, 120px, -400px) rotateY(88deg) rotateX(4deg); opacity: 0; } 30% { opacity: 1; } to { transform: rotateY(-22deg) rotateX(4deg); } }
.sh-box3d:hover { transform: rotateY(-8deg) rotateX(2deg); transition: transform 600ms var(--k-out); }
.sh-face { position: absolute; backface-visibility: hidden; overflow: hidden; }
.sh-face.front { inset: 0; border-radius: 6px; transform: translateZ(22px); background: hsl(var(--h) 28% 22%); box-shadow: 0 40px 80px -20px #000, inset 0 0 0 1px rgba(255,255,255,.08); }
.sh-face.front img { width: 100%; height: 100%; object-fit: cover; }
.sh-face.front b { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; text-align: center; font: 700 26px Georgia, serif; color: #fff; }
.sh-face.front::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, rgba(255,255,255,.18), transparent 30%, transparent 70%, rgba(0,0,0,.25)); }
.sh-face.side { top: 0; bottom: 0; left: -22px; width: 44px; transform: rotateY(-90deg); transform-origin: 50% 50%;
	background: hsl(var(--h) 30% 16%); display: flex; align-items: center; justify-content: center; }
.sh-face.side span { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 13px var(--k-text); color: #FFF6E8; white-space: nowrap; overflow: hidden; max-height: 400px; }
.sh-face.top { left: 0; right: 0; top: -22px; height: 44px; transform: rotateX(90deg); transform-origin: 50% 50%; background: hsl(var(--h) 20% 28%); }
.sh-insert { width: min(420px, 40vw); padding: 28px 30px; border-radius: 4px; color: #2A1E14; animation: sh-insert 700ms var(--k-out) 200ms both;
	background: linear-gradient(180deg, #F4E8D2, #E8D7B8); box-shadow: 0 30px 70px -20px #000, inset 0 0 0 1px rgba(90,60,30,.25);
	transform: rotate(1.2deg); }
@keyframes sh-insert { from { opacity: 0; transform: translateX(40px) rotate(4deg); } to { opacity: 1; transform: rotate(1.2deg); } }
.sh-pulled.closing .sh-insert { animation: k-fade 300ms reverse both; }
.sh-insert-head { font: 700 11px var(--k-small); letter-spacing: .18em; text-transform: uppercase; color: #8A6A44; border-bottom: 1px dashed rgba(90,60,30,.4); padding-bottom: 8px; }
.sh-insert h2 { margin: 14px 0 16px; font: 700 28px/1.1 Georgia, "Times New Roman", serif; color: #2A1A0C; }
.sh-insert dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 18px; margin: 0 0 22px; font: 14px Georgia, serif; }
.sh-insert dt { color: #8A6A44; }
.sh-insert dd { margin: 0; font-weight: 700; }
.sh-sticker { display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 26px; border-radius: 99px; transform: rotate(-3deg);
	background: radial-gradient(circle at 30% 30%, #FFB04A, #E2731C) !important; color: #2A1206 !important; font: 800 17px var(--k-text) !important; letter-spacing: .02em;
	box-shadow: 0 8px 18px -6px rgba(120,50,0,.6), inset 0 2px 0 rgba(255,255,255,.45); transition: transform .35s var(--k-spring); }
.sh-sticker:hover { transform: rotate(0deg) scale(1.05); }
.sh-insert-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 20px 0 10px; }
.sh-insert-actions button { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font: 600 13px var(--k-text) !important; color: #4A3520 !important; text-align: left; }
.sh-insert-actions button:hover { background: rgba(90,60,30,.12); }
/* ================= TERMINAL ================= */
html.kestrel[data-ui="terminal"] {
	--k-ink: #020604; --k-s1: #06110A; --k-s2: #0A1A10; --k-s3: #0F2617; --k-s4: #16341F;
	--k-line: rgba(90, 255, 140, .1); --k-line-2: rgba(90, 255, 140, .2);
	--k-fg: #B8FFD0; --k-fg-2: #6FD996; --k-fg-3: #3E8A5C;
	--k-accent: #4CFF8A; --k-accent-2: #A8FFC4; --k-on-accent: #011A08;
	--k-a10: rgba(76,255,138,.08); --k-a20: rgba(76,255,138,.16); --k-a40: rgba(76,255,138,.34);
	--k-text: "Cascadia Mono", "Cascadia Code", Consolas, monospace; --k-display: var(--k-text); --k-small: var(--k-text);
}
.tm-brand { font: 700 15px "Cascadia Mono", Consolas, monospace; color: var(--k-accent); text-shadow: 0 0 10px rgba(76,255,138,.6); padding-right: 8px; }
.tm-brand span { color: var(--k-fg-2); }
.tm-stage { background: #010402; }
.tm-crt { position: absolute; inset: 12px; border-radius: 22px; overflow: hidden; background: radial-gradient(120% 100% at 50% 40%, #04140A, #010402 80%);
	box-shadow: inset 0 0 0 2px #0B1F12, inset 0 0 80px rgba(0,0,0,.9), 0 0 0 1px rgba(76,255,138,.08); }
.tm-crt::before { content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
	background: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 1px, transparent 1px 3px); mix-blend-mode: multiply; }
.tm-crt::after { content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none; background: radial-gradient(130% 110% at 50% 50%, transparent 60%, rgba(0,0,0,.55));
	animation: tm-flicker 6s steps(1) infinite; }
@keyframes tm-flicker { 0%, 100% { opacity: 1; } 92% { opacity: .9; } 93% { opacity: 1; } 96% { opacity: .95; } }
.tm-screen { position: absolute; inset: 0; overflow-y: auto; padding: 26px 32px 40px; font: 15px/1.55 "Cascadia Mono", Consolas, monospace; color: #9CFFBE;
	text-shadow: 0 0 6px rgba(76,255,138,.55), 0 0 1px rgba(160,255,200,.9); white-space: pre-wrap; scrollbar-width: thin; scrollbar-color: #1C4A2C transparent; }
.tm-entry { margin-bottom: 10px; animation: tm-type 220ms steps(6) both; }
@keyframes tm-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.tm-cmd { color: #DFFFEA; }
.tm-ps { color: var(--k-accent); margin-right: 6px; }
.tm-out { color: #8BEFAE; }
.tm-err { color: #FF9A7A; text-shadow: 0 0 6px rgba(255,120,90,.5); }
.tm-dim { color: #3E8A5C; text-shadow: none; }
.tm-big { font-size: 22px; font-weight: 700; color: #DFFFEA; letter-spacing: .04em; }
.tm-link { font: inherit !important; color: #C8FFDC !important; text-decoration: underline; text-decoration-color: rgba(76,255,138,.4); text-underline-offset: 3px; text-shadow: inherit; }
.tm-link:hover { color: #011A08 !important; background: var(--k-accent); text-shadow: none; }
.tm-act { font: inherit !important; color: var(--k-accent) !important; margin-right: 10px; text-shadow: inherit; }
.tm-act:hover { color: #011A08 !important; background: var(--k-accent); text-shadow: none; }
.tm-table { margin-top: 4px; }
.tm-th { color: var(--k-accent); border-bottom: 1px dashed rgba(76,255,138,.35); margin-bottom: 2px; }
.tm-tr { color: #5DB37E; }
.tm-tr.on { color: #A8FFC4; }
.tm-help b { font-weight: 400; color: #DFFFEA; }
.tm-info { display: flex; gap: 22px; align-items: flex-start; margin: 6px 0; }
.tm-info img { width: 300px; border-radius: 4px; filter: grayscale(1) sepia(1) hue-rotate(80deg) saturate(3) brightness(.85) contrast(1.2); box-shadow: 0 0 20px rgba(76,255,138,.25); image-rendering: pixelated; }
.tm-acts { margin-top: 8px; }
.tm-boot { padding: 6px 0 4px; }
.tm-prompt { display: flex; align-items: baseline; }
.tm-line { position: relative; flex: 1; }
.tm-line input { width: 100%; background: none; border: 0; outline: none !important; padding: 0; font: inherit; color: #DFFFEA; caret-color: transparent; text-shadow: inherit; }
.tm-caret { position: absolute; top: 2px; width: 1ch; height: 1.25em; background: var(--k-accent); box-shadow: 0 0 10px var(--k-accent); animation: tm-blink 1.05s steps(1) infinite; pointer-events: none; }
@keyframes tm-blink { 50% { opacity: 0; } }
html.kestrel[data-ui="terminal"] .k-panel, html.kestrel[data-ui="terminal"] .k-cmd, html.kestrel[data-ui="terminal"] .k-menu { border-radius: 6px; }

.sh-back { margin-top: 6px; font: italic 600 13px Georgia, serif !important; color: #8A6A44 !important; text-decoration: underline; text-underline-offset: 3px; }
`;

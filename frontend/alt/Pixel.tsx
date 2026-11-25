// PIXEL — an 8-bit RPG menu. Chunky bordered boxes on a deep blue screen, a blinking hand cursor, cover art crushed to
// real pixels, and the stats a hero would have: LV from hours, HP from the last fortnight, EXP to the next level. A
// message box narrates. Up/down choose, left/right change the party (collection), Enter starts.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { artFor } from '../steam/library';
import { tok } from './kit';
import { cycle, useCursor, useKeepInView, useKeys, useStatus } from './lk';

/** Cover art drawn small onto a canvas and scaled up with hard pixels. */
function Pix({ g, w = 36 }: { g: Game; w?: number }) {
	const cv = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const c = cv.current;
		if (!c) return;
		const ctx = c.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#1830A8'; ctx.fillRect(0, 0, c.width, c.height);
		const list = [...g.capsules, g.header, artFor(g.appid).hero].filter(Boolean);
		let n = 0;
		const img = new Image();
		img.onload = () => { ctx.imageSmoothingEnabled = true; const s = Math.max(c.width / img.width, c.height / img.height); const dw = img.width * s, dh = img.height * s; ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh); };
		img.onerror = () => { n++; if (list[n]) img.src = list[n]; };
		img.src = list[0] ?? '';
	}, [g.appid]);
	return <canvas ref={cv} width={w} height={Math.round(w * 1.5)} className="pb-px-pix" />;
}

const lv = (g: Game) => Math.max(1, Math.min(99, Math.floor(Math.sqrt(g.minutes / 6))));

export function Pixel() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 200);
	const c = useCursor(gs.length);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const [typed, setTyped] = useState(0);
	const msg = g ? (g.minutes ? `${g.name.toUpperCase()} rejoins the party! Last seen ${formatAgo(g.lastPlayed).toLowerCase()}.` : `A wild ${g.name.toUpperCase()} appeared! It has never been played.`) : 'The party is empty.';
	useEffect(() => { setTyped(0); const t = setInterval(() => setTyped((x) => (x >= msg.length ? x : x + 2)), 30); return () => clearInterval(t); }, [msg]);
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); } else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	const hp = g ? Math.min(999, Math.round(g.minutes2w / 6) * 10 + 10) : 0;
	const next = g ? (lv(g) + 1) ** 2 * 6 - g.minutes : 0;
	return (
		<AltPage className="pb-px" brand={<>PLAYBOX</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-px-app">
				<section className="pb-px-box pb-px-party"><h3>{(b.found ? 'SEARCH' : b.isle?.name ?? '').toUpperCase()}<small>◀ ▶</small></h3>
					<div className="pb-px-list" ref={list}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); select(null); }} onDoubleClick={() => gameCommands(x)[0].run()}>
							<i>☛</i><span>{x.name.toUpperCase()}</span><em>LV{lv(x)}</em>
						</button>
					))}</div>
				</section>
				{g && (
					<section className="pb-px-box pb-px-stat" key={g.appid}>
						<div className="pb-px-portrait"><Pix g={g} /></div>
						<div className="pb-px-num">
							<h2>{g.name.toUpperCase()}</h2>
							<p><span>LV</span><b>{lv(g)}</b></p>
							<p><span>HP</span><b>{hp}/999</b></p><i className="pb-px-bar"><b style={{ width: (hp / 999) * 100 + '%' }} /></i>
							<p><span>EXP</span><b>{g.minutes}</b></p>
							<p><span>NEXT</span><b>{Math.max(0, next)}</b></p>
							<p><span>STATE</span><b>{status.toUpperCase()}</b></p>
						</div>
						<div className="pb-px-cmds"><PlayBtn g={g} className="pb-px-go" label={['☛ START', '☛ INSTALL']} /><button onClick={() => select(sel ? null : g.appid)}>☛ {sel ? 'CLOSE' : 'ITEMS'}</button></div>
						{sel && <Actions g={sel} className="pb-px-act" />}
					</section>
				)}
				<section className="pb-px-box pb-px-msg"><p>{msg.slice(0, typed)}<i>▼</i></p></section>
			</div>
		</AltPage>
	);
}

const px = '"Consolas", "Lucida Console", monospace';
export const pixelCss = tok('pixel', { bg: '#1830A8', s1: '#0C1C70', s2: '#2440C0', s3: '#3050D0', fg: '#FFFFFF', fg2: '#DDE4FF', fg3: '#9AA8E8', acc: '#FFFFFF', on: '#1830A8', top: '#000000', font: px }) + `
.pb-px-brand { font: 700 16px ${px}; letter-spacing: .3em; color: #fff; text-shadow: 2px 2px 0 #F83800; }
.pb-px-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); grid-template-rows: minmax(0, 1fr) 120px; gap: 16px; padding: 20px; background: #1830A8; color: #fff; font: 700 18px ${px}; letter-spacing: .06em; image-rendering: pixelated; }
.pb-px-box { position: relative; min-height: 0; padding: 18px 22px; background: #000; border-radius: 6px; box-shadow: 0 0 0 4px #fff, 0 0 0 8px #000, inset 0 0 0 0 #000; }
.pb-px-party { display: flex; flex-direction: column; } .pb-px-box h3 { display: flex; justify-content: space-between; margin: 0 0 12px; font: 700 18px ${px}; color: #FCE0A8; } .pb-px-box h3 small { font-size: 14px; color: #9AA8E8; animation: pb-px-blink 1s steps(2) infinite; }
.pb-px-list { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; } .pb-px-list::-webkit-scrollbar { display: none; }
.pb-px-list button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 5px 0; text-align: left; font: 700 18px ${px}; color: #fff; } .pb-px-list i { font-style: normal; width: 22px; color: #fff; visibility: hidden; } .pb-px-list span { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-px-list em { font-style: normal; font-size: 15px; color: #9AA8E8; }
.pb-px-list button.on i { visibility: visible; animation: pb-px-blink .8s steps(2) infinite; } .pb-px-list button.on span { color: #FCE0A8; } @keyframes pb-px-blink { 50% { opacity: 0; } }
.pb-px-stat { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto 1fr; gap: 18px 22px; overflow-y: auto; scrollbar-width: none; }
.pb-px-portrait { padding: 6px; background: #1830A8; box-shadow: 0 0 0 4px #fff; } .pb-px-pix { display: block; width: 180px; height: 270px; image-rendering: pixelated; }
.pb-px-num h2 { margin: 0 0 12px; font: 700 20px/1.2 ${px}; color: #FCE0A8; } .pb-px-num p { display: flex; justify-content: space-between; margin: 0 0 8px; font: 700 17px ${px}; } .pb-px-num p span { color: #9AA8E8; } .pb-px-num p b { color: #fff; }
.pb-px-bar { display: block; height: 10px; margin: -2px 0 10px; background: #300; box-shadow: 0 0 0 2px #fff; } .pb-px-bar b { display: block; height: 100%; background: repeating-linear-gradient(90deg, #00E436 0 8px, #00A82A 8px 10px); }
.pb-px-cmds { grid-column: 1 / -1; display: flex; gap: 20px; } .pb-px-cmds button { font: 700 20px ${px} !important; color: #fff !important; background: none !important; letter-spacing: .06em; } .pb-px-cmds button:hover { color: #FCE0A8 !important; }
.pb-px-go { animation: pb-px-blink 1.2s steps(2) infinite; } .pb-px-go:hover { animation: none; }
.pb-px-act { grid-column: 1 / -1; } .pb-px-act button { font: 700 15px ${px} !important; color: #fff !important; border-radius: 0 !important; } .pb-px-act button:hover { background: #1830A8 !important; }
.pb-px-msg { grid-column: 1 / -1; display: flex; align-items: center; } .pb-px-msg p { margin: 0; font: 700 20px/1.5 ${px}; } .pb-px-msg i { margin-left: 8px; font-style: normal; animation: pb-px-blink .7s steps(2) infinite; }
`;

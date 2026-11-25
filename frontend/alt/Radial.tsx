// RADIAL — a weapon wheel. Ten games sit around a ring; point at one (or use the arrows / stick) and the centre shows
// its logo and stats. Click or Enter plays, right-click opens details, the bumpers or mouse wheel turn the page.
import { useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, Logo, facts, useKeys, useStatus } from './lk';

const N = 10;

export function Radial() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [page, setPage] = useState(0);
	const [slot, setSlot] = useState(0);
	const ring = useRef<HTMLDivElement>(null);
	const pages = Math.max(1, Math.ceil(b.games.length / N));
	const pg = Math.min(page, pages - 1);
	const gs = b.games.slice(pg * N, pg * N + N);
	const g = sel ?? gs[Math.min(slot, gs.length - 1)];
	const status = useStatus(g);
	const turn = (d: number) => { setPage((p) => (Math.min(p, pages - 1) + d + pages) % pages); setSlot(0); };
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (k === 'right' || k === 'down') setSlot((s) => (s + 1) % Math.max(1, gs.length)); else if (k === 'left' || k === 'up') setSlot((s) => (s - 1 + gs.length) % Math.max(1, gs.length));
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(g.appid); else if (k === 'next') turn(1); else if (k === 'prev') turn(-1); else return false;
	});
	const aim = (e: React.MouseEvent) => {
		if (sel || !ring.current || !gs.length) return;
		const r = ring.current.getBoundingClientRect();
		const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
		if (Math.hypot(x, y) < r.width * 0.18) return;
		const a = (Math.atan2(x, -y) * 180) / Math.PI;
		const s = Math.round(((a + 360) % 360) / (360 / N)) % N;
		if (s < gs.length && s !== slot) setSlot(s);
	};
	return (
		<AltPage className="pb-rad" brand={<>◎ RADIAL</>} search={b.q} onSearch={(q) => { b.setQ(q); setPage(0); setSlot(0); }}>
			<div className="pb-rad-app" onMouseMove={aim} onWheel={(e) => turn(Math.sign(e.deltaY))}>
				<Backdrop g={g} className="pb-rad-bd" />
				<Chips b={b} className="pb-rad-chips" onPick={() => { setPage(0); setSlot(0); select(null); }} />
				<div className={'pb-rad-ring' + (sel ? ' dim' : '')} ref={ring} style={{ ['--a' as string]: (slot * 360) / N + 'deg' }}>
					<svg viewBox="-100 -100 200 200" className="pb-rad-svg">
						<circle r="96" className="o" /><circle r="38" className="i" />
						{gs.length > 0 && <path className="hl" d="M 0 -96 A 96 96 0 0 1 56.4 -77.7 L 22.3 -30.7 A 38 38 0 0 0 0 -38 Z" transform={`rotate(${slot * 36 - 18})`} />}
						{Array.from({ length: N }, (_, i) => <line key={i} x1="0" y1="-38" x2="0" y2="-96" transform={`rotate(${i * 36 + 18})`} />)}
					</svg>
					{gs.map((x, i) => {
						const a = (i * 2 * Math.PI) / N;
						return (
							<button key={x.appid} data-appid={x.appid} className={'pb-rad-slot' + (i === slot ? ' on' : '')} style={{ left: 50 + Math.sin(a) * 34 + '%', top: 50 - Math.cos(a) * 34 + '%' }}
								onClick={() => gameCommands(x)[0].run()} onContextMenu={(e) => { e.preventDefault(); select(x.appid); }}>
								<Art g={x} kind="capsule" /><b>{i + 1}</b>
							</button>
						);
					})}
					{g && !sel && (
						<div className="pb-rad-core" key={g.appid}>
							<Logo g={g} className="pb-rad-logo" />
							<p>{status}</p>
							<p className="pb-rad-num">{g.minutes ? formatPlaytime(g.minutes) : '—'}<small>{formatAgo(g.lastPlayed)}</small></p>
						</div>
					)}
				</div>
				<div className="pb-rad-foot"><span>LB ◀  PAGE {pg + 1} / {pages}  ▶ RB</span><span>CLICK PLAY · RIGHT-CLICK OR Y DETAILS</span></div>
				{sel && (
					<aside className="pb-rad-card" key={sel.appid}>
						<h2>{sel.name}</h2><p className="pb-rad-st">{status}</p>
						<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
						<div className="pb-rad-btns"><PlayBtn g={sel} className="pb-rad-play" label={['EQUIP & PLAY', 'INSTALL']} /><button onClick={() => select(null)}>BACK</button></div>
						<Actions g={sel} className="pb-rad-act" />
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const radialCss = tok('radial', { bg: '#0B0D0A', s1: 'rgba(255,255,255,.08)', s2: 'rgba(255,255,255,.14)', s3: 'rgba(255,255,255,.22)', fg: '#F1F3EC', fg2: '#C4C9B8', fg3: '#868C7A', acc: '#C8FF3D', on: '#121A00', top: 'transparent', font: '"Bahnschrift", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="radial"] .k-top { position: relative; z-index: 3; border: 0; }
.pb-rad-brand { font: 700 15px var(--k-text); letter-spacing: .3em; color: #C8FF3D; }
.pb-rad-app { position: absolute; inset: 0; overflow: hidden; background: #0B0D0A; color: #F1F3EC; }
.pb-rad-bd { opacity: .35; } .pb-rad-bd::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 50% 52%, rgba(11,13,10,.4), #0B0D0A 70%); }
.pb-rad-chips { position: absolute; top: 12px; left: 30px; right: 30px; z-index: 3; justify-content: center; } .pb-rad-chips button { background: rgba(0,0,0,.5); } .pb-rad-chips button.on { background: #C8FF3D; color: #121A00; }
.pb-rad-ring { position: absolute; left: 50%; top: 53%; width: min(78vh, 640px); aspect-ratio: 1; transform: translate(-50%, -50%); transition: opacity .3s, transform .3s; } .pb-rad-ring.dim { opacity: .25; transform: translate(-70%, -50%) scale(.85); pointer-events: none; }
.pb-rad-svg { position: absolute; inset: 0; width: 100%; height: 100%; } .pb-rad-svg .o { fill: rgba(10,12,9,.72); stroke: rgba(200,255,61,.3); stroke-width: .6; } .pb-rad-svg .i { fill: rgba(10,12,9,.9); stroke: rgba(200,255,61,.5); stroke-width: .6; }
.pb-rad-svg line { stroke: rgba(255,255,255,.1); stroke-width: .5; } .pb-rad-svg .hl { fill: rgba(200,255,61,.2); stroke: #C8FF3D; stroke-width: .8; transition: transform .15s; filter: drop-shadow(0 0 3px rgba(200,255,61,.6)); }
.pb-rad-slot { position: absolute; width: 13%; aspect-ratio: 2/3; transform: translate(-50%, -50%); border-radius: 4px; overflow: visible; transition: transform .15s; }
.pb-rad-slot img, .pb-rad-slot .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; filter: grayscale(.7) brightness(.6); transition: filter .15s; font-size: 6px; }
.pb-rad-slot b { position: absolute; left: -8px; top: -8px; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #0B0D0A; box-shadow: inset 0 0 0 1px rgba(200,255,61,.5); font: 700 10px var(--k-text); color: #C8FF3D; }
.pb-rad-slot.on { transform: translate(-50%, -50%) scale(1.25); z-index: 1; } .pb-rad-slot.on img { filter: none; box-shadow: 0 0 0 2px #C8FF3D, 0 0 20px rgba(200,255,61,.5); }
.pb-rad-core { position: absolute; left: 50%; top: 50%; width: 32%; transform: translate(-50%, -50%); text-align: center; animation: k-fade .25s both; }
.pb-rad-logo { display: block; height: 60px; margin: 0 auto 8px; } .pb-rad-logo img { height: 100%; margin: 0 auto; object-position: center; } .pb-rad-logo.lk-logotext { height: auto; font-size: 18px; text-transform: uppercase; }
.pb-rad-core p { margin: 0; font: 600 11px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #C8FF3D; } .pb-rad-core .pb-rad-num { margin-top: 6px; font: 700 22px var(--k-text); letter-spacing: .02em; color: #F1F3EC; } .pb-rad-num small { display: block; font: 500 11px var(--k-text); letter-spacing: .1em; color: #868C7A; }
.pb-rad-foot { position: absolute; left: 30px; right: 30px; bottom: 18px; display: flex; justify-content: space-between; font: 600 12px var(--k-text); letter-spacing: .2em; color: #868C7A; }
.pb-rad-card { position: absolute; right: 8%; top: 50%; z-index: 3; width: min(420px, 40%); padding: 26px; transform: translateY(-50%); background: rgba(11,13,10,.94); box-shadow: inset 0 0 0 1px rgba(200,255,61,.35); clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); animation: k-rise .35s var(--k-out) both; }
.pb-rad-card h2 { margin: 0; font: 700 28px var(--k-text); text-transform: uppercase; } .pb-rad-st { margin: 6px 0 16px; font: 600 12px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #C8FF3D; }
.pb-rad-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 0 18px; } .pb-rad-card dt { font: 600 10px var(--k-text); letter-spacing: .15em; text-transform: uppercase; color: #868C7A; } .pb-rad-card dd { margin: 2px 0 0; font: 600 15px var(--k-text); }
.pb-rad-btns { display: flex; gap: 10px; margin-bottom: 12px; } .pb-rad-play { flex: 1; height: 46px; background: #C8FF3D !important; color: #121A00 !important; font: 700 15px var(--k-text) !important; letter-spacing: .15em; } .pb-rad-btns > button:last-child { padding: 0 20px; background: rgba(255,255,255,.08); color: #F1F3EC; font: 600 13px var(--k-text); letter-spacing: .15em; }
.pb-rad-act button { color: #C4C9B8 !important; } .pb-rad-act button:hover { background: rgba(200,255,61,.08) !important; }
`;

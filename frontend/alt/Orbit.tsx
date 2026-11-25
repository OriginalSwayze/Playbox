// ORBIT — a VR-style curved wall. Games hang in three rows on the inside of a cylinder around you, over a glowing floor
// grid; drag, scroll or use the arrows to turn, and the focused panel floats forward. Enter opens a floating panel.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, Logo, cycle, facts, useCursor, useKeys, useStatus } from './lk';

const ROWS = 3;
const STEP = 15; // degrees between columns

export function Orbit() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 120);
	const c = useCursor(gs.length);
	const cols = Math.ceil(gs.length / ROWS);
	const col = Math.floor(c.i / ROWS);
	const [drag, setDrag] = useState<number | null>(null);
	const wheelAt = useRef(0);
	const status = useStatus(sel);
	const turn = (d: number) => c.to(Math.max(0, Math.min(gs.length - 1, c.i + d * ROWS)), true);
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (k === 'left') turn(-1); else if (k === 'right') turn(1); else if (k === 'up') c.move(-1); else if (k === 'down') c.move(1);
		else if (k === 'enter') { const g = gs[c.i]; if (g) select(g.appid); } else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-orb" brand={<><i />ORBIT</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-orb-app"
				onWheel={(e) => { const now = Date.now(); if (now - wheelAt.current < 90) return; wheelAt.current = now; turn(Math.sign(e.deltaY || e.deltaX)); }}
				onMouseDown={(e) => { if ((e.target as HTMLElement).closest('.pb-orb-panel, .lk-chips')) return; setDrag(e.clientX); }}
				onMouseMove={(e) => { if (drag === null) return; const dx = e.clientX - drag; if (Math.abs(dx) > 60) { turn(dx < 0 ? 1 : -1); setDrag(e.clientX); } }}
				onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}>
				<div className="pb-orb-floor" />
				<Chips b={b} className="pb-orb-chips" onPick={() => c.to(0)} />
				<div className="pb-orb-world"><div className="pb-orb-ring" style={{ transform: `translateZ(var(--r)) rotateY(${col * STEP}deg)` }}>
					{gs.map((g, n) => {
						const cc = Math.floor(n / ROWS);
						if (Math.abs(cc - col) > 6) return null;
						const on = n === c.i;
						return (
							<button key={g.appid} data-appid={g.appid} className={'pb-orb-tile' + (on ? ' on' : '')} style={{ transform: `rotateY(${-cc * STEP}deg) translateZ(calc(var(--r) * -1)) translateY(${(n % ROWS - 1) * 132}px) translateZ(${on ? 60 : 0}px)` }} onClick={() => (on ? select(g.appid) : c.to(n))}>
								<Art g={g} kind="header" /><span>{g.name}</span>
							</button>
						);
					})}
				</div></div>
				{gs[c.i] && !sel && <p className="pb-orb-cap"><b>{gs[c.i].name}</b>{formatPlaytime(gs[c.i].minutes)} · {formatAgo(gs[c.i].lastPlayed)} · column {col + 1} of {cols}</p>}
				{sel && (
					<div className="pb-orb-panel" key={sel.appid}>
						<Art g={sel} kind="hero" className="pb-orb-phero" />
						<div className="pb-orb-pbody"><Logo g={sel} className="pb-orb-logo" /><p className="pb-orb-st">{status}</p>
							<div className="pb-orb-row"><PlayBtn g={sel} className="pb-orb-play"><Icon name={sel.installed ? 'play' : 'install'} size={18} /></PlayBtn><button className="pb-orb-x" onClick={() => select(null)}>Close</button></div>
							<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-orb-act" /></div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const orbitCss = tok('orbit', { bg: '#03050D', s1: 'rgba(120,170,255,.1)', s2: 'rgba(120,170,255,.18)', s3: 'rgba(120,170,255,.28)', fg: '#EAF2FF', fg2: '#B5C8EA', fg3: '#7088B5', acc: '#6FD3FF', on: '#021320', top: 'transparent', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="orbit"] .k-top { position: relative; z-index: 3; border: 0; }
.pb-orb-brand { display: flex; align-items: center; gap: 10px; font: 600 15px var(--k-text); letter-spacing: .4em; color: #EAF2FF; } .pb-orb-brand i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #6FD3FF; box-shadow: 0 0 10px #6FD3FF; }
.pb-orb-app { --r: 900px; position: absolute; inset: 0; overflow: hidden; background: radial-gradient(70% 60% at 50% 45%, #0E1A3A, #03050D 75%); color: #EAF2FF; user-select: none; cursor: grab; }
.pb-orb-floor { position: absolute; left: -50%; right: -50%; bottom: -10%; height: 55%; background-image: linear-gradient(rgba(111,211,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(111,211,255,.25) 1px, transparent 1px); background-size: 60px 60px; transform: perspective(500px) rotateX(72deg); transform-origin: top; mask: linear-gradient(transparent, #000 50%); -webkit-mask: linear-gradient(transparent, #000 50%); }
.pb-orb-chips { position: absolute; top: 12px; left: 40px; right: 40px; z-index: 5; justify-content: center; } .pb-orb-chips button { background: rgba(111,211,255,.1); box-shadow: inset 0 0 0 1px rgba(111,211,255,.2); } .pb-orb-chips button.on { background: #6FD3FF; color: #021320; }
.pb-orb-world { position: absolute; left: 50%; top: 46%; width: 0; height: 0; perspective: 900px; transform-style: preserve-3d; }
.pb-orb-ring { position: absolute; transform-style: preserve-3d; transition: transform .6s var(--k-out); }
.pb-orb-tile { position: absolute; left: -120px; top: -60px; width: 240px; height: 120px; border-radius: 10px; overflow: hidden; background: #0E1A3A; box-shadow: 0 0 0 1px rgba(111,211,255,.25), 0 10px 30px rgba(0,0,0,.6); transition: transform .5s var(--k-out), box-shadow .3s, filter .3s; backface-visibility: hidden; filter: brightness(.65) saturate(.8); }
.pb-orb-tile img, .pb-orb-tile .alt-noart { width: 100%; height: 100%; object-fit: cover; } .pb-orb-tile span { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 10px 6px; font: 600 12px var(--k-text); text-align: left; background: linear-gradient(transparent, rgba(3,5,13,.9)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-orb-tile:hover { filter: none; } .pb-orb-tile.on { filter: none; box-shadow: 0 0 0 2px #6FD3FF, 0 0 40px rgba(111,211,255,.6), 0 20px 50px rgba(0,0,0,.7); cursor: pointer; }
.pb-orb-cap { position: absolute; left: 0; right: 0; bottom: 26px; z-index: 5; margin: 0; text-align: center; font: 14px var(--k-text); color: #7088B5; } .pb-orb-cap b { display: block; margin-bottom: 4px; font: 600 24px var(--k-text); color: #EAF2FF; text-shadow: 0 0 20px rgba(111,211,255,.5); }
.pb-orb-panel { position: absolute; left: 50%; top: 50%; z-index: 6; width: min(820px, 86%); max-height: 86%; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; border-radius: 22px; background: rgba(10,18,40,.94); box-shadow: 0 0 0 1px rgba(111,211,255,.35), 0 0 80px rgba(111,211,255,.25), 0 40px 100px #000; transform: translate(-50%, -50%); animation: pb-orb-pop .45s var(--k-out) both; cursor: default; }
@keyframes pb-orb-pop { from { opacity: 0; transform: translate(-50%, -50%) perspective(800px) translateZ(-200px) rotateX(8deg); } }
.pb-orb-phero { width: 100%; height: 100%; min-height: 360px; object-fit: cover; } .pb-orb-pbody { padding: 26px; overflow-y: auto; }
.pb-orb-logo { display: block; height: 80px; max-width: 100%; } .pb-orb-logo img { height: 100%; } .pb-orb-logo.lk-logotext { height: auto; font-size: 28px; } .pb-orb-st { margin: 10px 0 16px; font: 600 13px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: #6FD3FF; }
.pb-orb-row { display: flex; gap: 10px; margin-bottom: 18px; } .pb-orb-play { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 26px; border-radius: 99px; background: #6FD3FF !important; color: #021320 !important; font: 700 15px var(--k-text) !important; box-shadow: 0 0 24px rgba(111,211,255,.5); } .pb-orb-x { height: 44px; padding: 0 20px; border-radius: 99px; background: rgba(111,211,255,.12); color: #EAF2FF; font: 600 14px var(--k-text); }
.pb-orb-pbody dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 0 14px; } .pb-orb-pbody dt { font: 12px var(--k-text); color: #7088B5; } .pb-orb-pbody dd { margin: 2px 0 0; font: 600 14px var(--k-text); }
.pb-orb-act button { color: #B5C8EA !important; } .pb-orb-act button:hover { background: rgba(111,211,255,.1) !important; }
`;

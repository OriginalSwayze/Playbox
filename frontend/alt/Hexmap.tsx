// HEXMAP — a strategy game's campaign map. Each collection is a province of hex tiles in its own colour; games are
// the tiles, brighter the more you have played them. Drag to pan, scroll to zoom, arrows step between tiles; the
// province panel on the right shows the selected tile and its orders.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useIslands, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useKeys, useStatus } from './lk';

const W = 96, H = 84; // hex cell size (pointy-side left/right)
const HUES = [205, 25, 130, 300, 50, 170, 345, 80, 260, 0];
// axial spiral around a centre: ring by ring
function spiral(n: number): [number, number][] {
	const out: [number, number][] = [[0, 0]];
	const dirs: [number, number][] = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
	for (let r = 1; out.length < n; r++) {
		let q = -r, s = r;
		for (let d = 0; d < 6 && out.length < n; d++) for (let k = 0; k < r && out.length < n; k++) { out.push([q, s]); q += dirs[d][0]; s += dirs[d][1]; }
	}
	return out.slice(0, n);
}
const px = (q: number, r: number) => ({ x: W * 0.75 * q * 1.02, y: H * (r + q / 2) * 1.02 });

export function Hexmap() {
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const library = useIslands();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const [view, setView] = useState({ x: 0, y: 0, z: 0.8 });
	const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
	const provinces = useMemo(() => {
		const src = found ? [{ id: 'q', name: 'Search', games: found }] : islands.length ? islands : library;
		const cols = Math.ceil(Math.sqrt(src.length));
		let idx = 0;
		return src.slice(0, 16).map((p, i) => {
			const gs = p.games.slice(0, 37);
			const cx = (i % cols) * 760, cy = Math.floor(i / cols) * 640 + ((i % cols) % 2) * 200;
			return { ...p, hue: HUES[i % HUES.length], tiles: spiral(gs.length).map(([a, b], k) => ({ g: gs[k], ...px(a, b), cx, cy, i: idx++ })) };
		});
	}, [found, islands, library]);
	const flat = provinces.flatMap((p) => p.tiles.map((t) => ({ ...t, p })));
	const [cur, setCur] = useState(0);
	const focus = flat[Math.min(cur, flat.length - 1)];
	const g: Game | undefined = sel ?? focus?.g;
	const status = useStatus(g);
	const prov = sel ? provinces.find((p) => p.tiles.some((t) => t.g.appid === sel.appid)) : focus?.p;
	const centre = (i: number) => { const t = flat[i]; if (t) setView((v) => ({ ...v, x: -(t.cx + t.x) * v.z, y: -(t.cy + t.y) * v.z })); };
	useKeys((k) => {
		if (k === 'left' || k === 'up') { const n = Math.max(0, cur - 1); setCur(n); centre(n); select(null); } else if (k === 'right' || k === 'down') { const n = Math.min(flat.length - 1, cur + 1); setCur(n); centre(n); select(null); }
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { const pi = provinces.indexOf(focus?.p as typeof provinces[0]); const np = provinces[(pi + (k === 'next' ? 1 : -1) + provinces.length) % provinces.length]; const n = flat.findIndex((t) => t.p === np); if (n >= 0) { setCur(n); centre(n); } } else return false;
	});
	return (
		<AltPage className="pb-hex" brand={<>⬢ HEXMAP</>} search={q} onSearch={(v) => { setQ(v); setCur(0); setView({ x: 0, y: 0, z: 0.8 }); }}>
			<div className="pb-hex-app">
				<div className="pb-hex-sea" onWheel={(e) => setView((v) => ({ ...v, z: Math.max(0.3, Math.min(1.6, v.z * (e.deltaY < 0 ? 1.1 : 0.9))) }))}
					onMouseDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; }}
					onMouseMove={(e) => { const d = drag.current; if (d) setView((v) => ({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y })); }}
					onMouseUp={() => (drag.current = null)} onMouseLeave={() => (drag.current = null)}>
					<div className="pb-hex-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transition: drag.current ? 'none' : undefined }}>
						{provinces.map((p) => (
							<div key={p.id} className="pb-hex-prov" style={{ ['--h' as string]: p.hue }}>
								<p className="pb-hex-pname" style={{ left: p.tiles[0]?.cx, top: (p.tiles[0]?.cy ?? 0) - 330 }}>{p.name}</p>
								{p.tiles.map((t) => {
									const i = t.i;
									const heat = Math.min(1, Math.sqrt(t.g.minutes / 3000));
									return (
										<button key={t.g.appid} data-appid={t.g.appid} className={'pb-hex-tile' + (i === cur ? ' on' : '') + (sel?.appid === t.g.appid ? ' sel' : '')} style={{ left: t.cx + t.x, top: t.cy + t.y, ['--heat' as string]: heat }}
											onClick={() => { setCur(i); if (i === cur) select(t.g.appid); }} title={t.g.name}>
											<Art g={t.g} kind="capsule" />
										</button>
									);
								})}
							</div>
						))}
					</div>
					<div className="pb-hex-zoom"><button onClick={() => setView((v) => ({ ...v, z: Math.min(1.6, v.z * 1.2) }))}>+</button><button onClick={() => setView((v) => ({ ...v, z: Math.max(0.3, v.z / 1.2) }))}>−</button><button onClick={() => setView({ x: 0, y: 0, z: 0.8 })}>⌂</button></div>
				</div>
				<aside className="pb-hex-panel">
					{prov && <p className="pb-hex-prov-n" style={{ ['--h' as string]: prov.hue }}>PROVINCE · {prov.name}<small>{prov.tiles.length} tiles · {Math.round(prov.tiles.reduce((a, t) => a + t.g.minutes, 0) / 60)} h held</small></p>}
					{g && <div key={g.appid} className="pb-hex-card">
						<Art g={g} kind="header" className="pb-hex-img" />
						<h2>{g.name}</h2><p className="pb-hex-st">{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
						<PlayBtn g={g} className="pb-hex-go" label={['MARCH (Play)', 'SETTLE (Install)']} />
						<dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
						<Actions g={g} className="pb-hex-act" />
					</div>}
				</aside>
			</div>
		</AltPage>
	);
}

const serif = '"Georgia", "Times New Roman", serif';
export const hexmapCss = tok('hexmap', { bg: '#14202B', s1: '#1E2E3C', s2: '#28394A', s3: '#34485C', fg: '#EDE6D6', fg2: '#C7BDA6', fg3: '#8A8270', acc: '#D9A441', on: '#1E1400', top: '#0F1820', font: '"Segoe UI", sans-serif' }) + `
.pb-hex-brand { font: 700 16px ${serif}; letter-spacing: .2em; color: #D9A441; }
.pb-hex-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; background: #14202B; color: #EDE6D6; }
.pb-hex-sea { position: relative; overflow: hidden; cursor: grab; user-select: none; background: radial-gradient(circle at 50% 50%, #1C3448, #0E1A24 80%), #0E1A24; }
.pb-hex-sea::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px); background-size: 24px 24px; }
.pb-hex-world { position: absolute; left: 50%; top: 50%; transform-origin: 0 0; transition: transform .35s var(--k-out); }
.pb-hex-pname { position: absolute; margin: 0; transform: translateX(-50%); font: italic 700 40px ${serif}; color: hsl(var(--h) 60% 75%); white-space: nowrap; text-shadow: 0 3px 10px #000; letter-spacing: .04em; pointer-events: none; }
.pb-hex-tile { position: absolute; width: ${W}px; height: ${H}px; margin: -${H / 2}px 0 0 -${W / 2}px; clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); background: hsl(var(--h) 45% calc(18% + var(--heat) * 30%)); transition: transform .15s, filter .15s; }
.pb-hex-tile img, .pb-hex-tile .alt-noart { position: absolute; inset: 4px; width: calc(100% - 8px); height: calc(100% - 8px); object-fit: cover; clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); opacity: calc(.35 + var(--heat) * .65); filter: saturate(calc(.3 + var(--heat))); font-size: 6px; }
.pb-hex-tile:hover { transform: scale(1.1); z-index: 2; filter: brightness(1.2); } .pb-hex-tile.on { background: #D9A441; z-index: 3; transform: scale(1.18); } .pb-hex-tile.on img { opacity: 1; filter: none; } .pb-hex-tile.sel { background: #fff; }
.pb-hex-zoom { position: absolute; right: 14px; bottom: 14px; display: grid; gap: 4px; } .pb-hex-zoom button { width: 34px; height: 34px; border-radius: 6px; background: rgba(14,26,36,.85); box-shadow: inset 0 0 0 1px rgba(217,164,65,.4); font: 700 18px var(--k-text); color: #EDE6D6; }
.pb-hex-panel { overflow-y: auto; padding: 18px 20px 30px; background: linear-gradient(#1E2E3C, #14202B); box-shadow: inset 1px 0 0 rgba(217,164,65,.25); }
.pb-hex-prov-n { margin: 0 0 14px; padding: 10px 12px; font: 700 13px ${serif}; letter-spacing: .12em; text-transform: uppercase; color: hsl(var(--h) 60% 75%); background: hsl(var(--h) 40% 18%); border-left: 4px solid hsl(var(--h) 60% 55%); } .pb-hex-prov-n small { display: block; margin-top: 2px; font: 12px var(--k-text); letter-spacing: 0; text-transform: none; color: #C7BDA6; }
.pb-hex-card { animation: k-fade .3s both; } .pb-hex-img { width: 100%; aspect-ratio: 460/215; object-fit: cover; border: 2px solid #D9A441; } .pb-hex-card h2 { margin: 12px 0 4px; font: 700 22px/1.2 ${serif}; } .pb-hex-st { margin: 0 0 14px; font: 13px var(--k-text); color: #C7BDA6; }
.pb-hex-go { width: 100%; height: 44px; background: #D9A441 !important; color: #1E1400 !important; font: 700 15px ${serif} !important; letter-spacing: .08em; } .pb-hex-go:hover { background: #E8B95A !important; }
.pb-hex-card dl { margin: 16px 0 10px; } .pb-hex-card dl div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.07); font: 13px var(--k-text); } .pb-hex-card dt { color: #8A8270; } .pb-hex-card dd { margin: 0; font-weight: 600; }
.pb-hex-act button { color: #C7BDA6 !important; } .pb-hex-act button:hover { background: rgba(217,164,65,.1) !important; }
`;

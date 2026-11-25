// ATLAS — the library as a map. Each collection is an island of covers on a dark sea; drag to pan, scroll to
// zoom, search to fly. Selecting a game opens an inspector with Steam's actions.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Icon } from '../ui/icons';
import { useKestrel } from '../state/store';
import { artFor, formatAgo, formatPlaytime, type Game } from '../steam/library';
import { mainWindow } from '../steam/env';
import { AltChrome, Brand, PlaceButtons, gameCommands, useIslands, useNativeShowing, useSelectedGame, type Island } from './common';

const TW = 64, TH = 96, GAP = 10, PAD = 70; // cover tile size, gap, island padding
type Placed = Island & { x: number; y: number; w: number; h: number; spots: { x: number; y: number }[]; path: string; seed: number };
type Cam = { x: number; y: number; z: number };

/** An organic island outline around a w×h box, deterministic per seed. */
function blob(w: number, h: number, seed: number): string {
	const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2, n = 28;
	const pts: [number, number][] = [];
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2;
		const k = 1 + 0.06 * Math.sin(a * 3 + seed) + 0.04 * Math.sin(a * 5 + seed * 1.7) + 0.03 * Math.cos(a * 7 + seed * 0.3);
		pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
	}
	let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
	for (let i = 0; i < n; i++) {
		const p = pts[(i + 1) % n], q = pts[(i + 2) % n];
		d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
	}
	return d + 'Z';
}

/** Pack n cover tiles into rows that follow an ellipse, so islands are round, not square. */
function pack(n: number): { rx: number; ry: number; spots: { x: number; y: number }[] } {
	for (let ry = TH; ; ry += 20) {
		const rx = ry * 1.35;
		const spots: { x: number; y: number }[] = [];
		const rows = Math.floor((2 * ry) / (TH + GAP));
		for (let r = 0; r < rows; r++) {
			const cy = -ry + (TH + GAP) / 2 + r * (TH + GAP) + (2 * ry - rows * (TH + GAP)) / 2;
			const edge = Math.min(1, Math.abs(cy) / ry);
			const half = rx * Math.sqrt(1 - edge * edge) - TW / 2;
			if (half < 0) continue;
			const count = Math.floor((2 * half) / (TW + GAP)) + 1;
			const x0 = -((count - 1) * (TW + GAP)) / 2;
			for (let k = 0; k < count; k++) spots.push({ x: x0 + k * (TW + GAP), y: cy });
		}
		if (spots.length >= n) {
			// keep the centre-most spots so a partly filled island stays round
			spots.sort((a, b) => (a.x / rx) ** 2 + (a.y / ry) ** 2 - ((b.x / rx) ** 2 + (b.y / ry) ** 2));
			const used = spots.slice(0, n).sort((a, b) => a.y - b.y || a.x - b.x);
			return { rx, ry, spots: used };
		}
	}
}

/** Lay islands out on a spiral, biggest first, without overlaps. */
function layout(islands: Island[]): Placed[] {
	const boxes = islands.map((is, i) => {
		const { rx, ry, spots } = pack(is.games.length);
		const w = 2 * rx + PAD * 2, h = 2 * ry + PAD * 2 + 30;
		// tile spots relative to the island box (top-left of each tile)
		const rel = spots.map((p) => ({ x: w / 2 + p.x - TW / 2, y: 30 + h / 2 - 15 + p.y - TH / 2 }));
		return { ...is, w, h, spots: rel, seed: i * 2.3 + 1 };
	});
	const order = [...boxes].sort((a, b) => b.w * b.h - a.w * a.h);
	const placed: Placed[] = [];
	const M = 220; // sea between islands, room for their names
	const hit = (x: number, y: number, w: number, h: number) => placed.some((p) => x < p.x + p.w + M && x + w + M > p.x && y < p.y + p.h + M && y + h + M > p.y);
	for (const b of order) {
		let x = -b.w / 2, y = -b.h / 2;
		for (let t = 0; hit(x, y, b.w, b.h) && t < 4000; t++) {
			const a = t * 0.35, r = 40 + t * 9;
			x = Math.cos(a) * r * 1.5 - b.w / 2; y = Math.sin(a) * r - b.h / 2;
		}
		placed.push({ ...b, x, y, path: blob(b.w, b.h - 30, b.seed) });
	}
	// keep Steam's order for anything that lists islands
	return islands.map((is) => placed.find((p) => p.id === is.id)!);
}

function Inspector({ g, onClose, islands }: { g: Game; onClose: () => void; islands: Placed[] }) {
	const [, tick] = useState(0);
	useEffect(() => { const t = setTimeout(() => tick((n) => n + 1), 1200); return () => clearTimeout(t); }, [g.appid]);
	const art = artFor(g.appid);
	const [heroOk, setHeroOk] = useState(true);
	const where = islands.filter((i) => i.id !== 'recent' && i.games.some((x) => x.appid === g.appid)).map((i) => i.name);
	const cmds = gameCommands(g);
	return (
		<aside className="at-inspector" key={g.appid}>
			<div className="at-ins-art">
				<img src={heroOk ? art.hero : g.header} alt="" onError={() => setHeroOk(false)} />
				<button className="k-icon-btn at-ins-close" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></button>
			</div>
			<div className="at-ins-body">
				<div className="at-coord">{where.length ? where.join(' · ') : 'Uncharted'}</div>
				<h2>{g.name}</h2>
				<div className="at-ins-stats">
					<div><span>Played</span><b>{formatPlaytime(g.minutes)}</b></div>
					<div><span>Last played</span><b>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</b></div>
					<div><span>Status</span><b>{g.status || (g.installed ? 'Installed' : 'Not installed')}</b></div>
				</div>
				<button className="at-play" onClick={cmds[0].run}><Icon name={cmds[0].icon} size={18} />{cmds[0].label}</button>
				<div className="at-ins-actions">
					{cmds.slice(1).map((c) => <button key={c.id} onClick={c.run}><Icon name={c.icon} size={16} />{c.label}</button>)}
				</div>
			</div>
		</aside>
	);
}

export function Atlas() {
	const islands = useIslands();
	const placed = useMemo(() => layout(islands), [islands]);
	const [sel, select] = useSelectedGame();
	const native = useNativeShowing();
	const calm = useKestrel((s) => s.calm);
	const [cam, setCam] = useState<Cam>({ x: 0, y: 0, z: 0.3 });
	const [q, setQ] = useState('');
	const view = useRef<HTMLDivElement>(null);
	const anim = useRef(0);
	const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
	const fitted = useRef(false);

	const bounds = useMemo(() => {
		if (!placed.length) return { x: 0, y: 0, w: 1, h: 1 };
		const x0 = Math.min(...placed.map((p) => p.x)), y0 = Math.min(...placed.map((p) => p.y));
		const x1 = Math.max(...placed.map((p) => p.x + p.w)), y1 = Math.max(...placed.map((p) => p.y + p.h));
		return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
	}, [placed]);
	const size = () => ({ w: view.current?.clientWidth ?? 1200, h: view.current?.clientHeight ?? 800 });

	const flyTo = (target: Cam) => {
		cancelAnimationFrame(anim.current);
		const win = mainWindow()?.BrowserWindow;
		if (calm || !win || win.document.hidden) { setCam(target); return; }
		const from = { ...cam }, t0 = performance.now(), D = 750;
		const step = (t: number) => {
			const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
			// zoom out a little mid-flight so long trips read as travel
			const dip = Math.sin(k * Math.PI) * Math.min(0.4, Math.hypot(target.x - from.x, target.y - from.y) / 6000);
			setCam({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, z: (from.z + (target.z - from.z) * e) * (1 - dip) });
			if (k < 1) anim.current = win.requestAnimationFrame(step);
		};
		anim.current = win.requestAnimationFrame(step);
	};
	const camFor = (wx: number, wy: number, z: number): Cam => { const { w, h } = size(); return { x: w / 2 - wx * z, y: h / 2 - wy * z, z }; };
	const fitAll = () => { const { w, h } = size(); const z = Math.min(w / bounds.w, h / bounds.h) * 0.88; flyTo(camFor(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, Math.max(0.08, Math.min(1, z)))); };

	useLayoutEffect(() => {
		if (fitted.current || !placed.length || !view.current) return;
		fitted.current = true;
		const { w, h } = size(); const z = Math.max(0.08, Math.min(1, Math.min(w / bounds.w, h / bounds.h) * 0.88));
		setCam(camFor(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, z));
	}, [placed]);

	// where a game sits on the map
	const posOf = (appid: number) => {
		for (const p of placed) {
			const i = p.games.findIndex((g) => g.appid === appid);
			if (i >= 0) return { x: p.x + p.spots[i].x + TW / 2, y: p.y + p.spots[i].y + TH / 2 };
		}
		return null;
	};
	// fly to a game chosen elsewhere (command bar, Steam)
	useEffect(() => { if (sel) { const p = posOf(sel.appid); if (p) flyTo(camFor(p.x + 190 / Math.max(cam.z, 0.9), p.y, Math.max(cam.z, 0.9))); } }, [sel?.appid]);

	const query = q.trim().toLowerCase();
	const matches = useMemo(() => (query ? new Set(islands.flatMap((i) => i.games).filter((g) => g.name.toLowerCase().includes(query)).map((g) => g.appid)) : null), [query, islands]);
	const islandMatch = (p: Placed) => !!query && p.name.toLowerCase().includes(query);

	const go = () => {
		const island = placed.find(islandMatch);
		if (island) { const { w, h } = size(); const z = Math.min(1.1, Math.min(w / island.w, h / island.h) * 0.8); flyTo(camFor(island.x + island.w / 2, island.y + island.h / 2, z)); return; }
		const first = matches && [...matches][0];
		if (first) select(first);
	};

	// input
	const onDown = (e: RPointerEvent) => { if ((e.target as Element).closest('.at-ui')) return; cancelAnimationFrame(anim.current); drag.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false }; };
	const onMove = (e: RPointerEvent) => {
		const d = drag.current; if (!d) return;
		const dx = e.clientX - d.x, dy = e.clientY - d.y;
		if (!d.moved && Math.hypot(dx, dy) < 4) return;
		d.moved = true;
		setCam((c) => ({ ...c, x: d.cx + dx, y: d.cy + dy }));
	};
	const onUp = () => { setTimeout(() => (drag.current = null), 0); };
	useEffect(() => {
		const el = view.current; if (!el) return;
		const wheel = (e: WheelEvent) => {
			e.preventDefault();
			cancelAnimationFrame(anim.current);
			const r = el.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
			setCam((c) => { const z = Math.max(0.08, Math.min(2.4, c.z * Math.exp(-e.deltaY * 0.0015))); return { z, x: px - (px - c.x) * (z / c.z), y: py - (py - c.y) * (z / c.z) }; });
		};
		el.addEventListener('wheel', wheel, { passive: false });
		return () => el.removeEventListener('wheel', wheel);
	}, []);
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document; if (!doc) return;
		const key = (e: KeyboardEvent) => {
			if ((e.target as Element)?.closest?.('input, textarea') || native) return;
			const s = 120;
			if (e.key === 'ArrowLeft') setCam((c) => ({ ...c, x: c.x + s })); else if (e.key === 'ArrowRight') setCam((c) => ({ ...c, x: c.x - s }));
			else if (e.key === 'ArrowUp') setCam((c) => ({ ...c, y: c.y + s })); else if (e.key === 'ArrowDown') setCam((c) => ({ ...c, y: c.y - s }));
			else if (e.key === '0') fitAll(); else if (e.key === 'Escape' && sel) select(null); else return;
			e.preventDefault();
		};
		doc.addEventListener('keydown', key);
		return () => doc.removeEventListener('keydown', key);
	});

	const far = cam.z < 0.32;
	const label = Math.min(3, Math.max(1, 0.85 / cam.z));
	// minimap
	const MW = 210, MH = 130, ms = Math.min(MW / bounds.w, MH / bounds.h);
	const { w: vw, h: vh } = size();
	const vr = { x: (-cam.x / cam.z - bounds.x) * ms, y: (-cam.y / cam.z - bounds.y) * ms, w: (vw / cam.z) * ms, h: (vh / cam.z) * ms };

	return (
		<>
			<AltChrome className="at-top">
				<Brand className="at-brand"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M12 3.5 14 12l-2 8.5L10 12z" fill="currentColor" /></svg>Atlas</Brand>
				<label className="at-search">
					<Icon name="search" size={16} />
					<input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go(); if (e.key === 'Escape') setQ(''); }} placeholder="Find a game or collection, Enter to fly" spellCheck={false} />
					{matches && <em>{matches.size}</em>}
				</label>
				<PlaceButtons />
			</AltChrome>
			<main className={'k-stage at-stage' + (native ? ' is-hidden' : '')} aria-hidden={native}>
				<div className={'at-sea' + (far ? ' far' : '')} ref={view} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
					style={{ backgroundPosition: `${cam.x}px ${cam.y}px`, backgroundSize: `${240 * cam.z}px ${240 * cam.z}px` }}>
					<div className="at-world" style={{ transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.z})` }}>
						{placed.map((p) => (
							<section key={p.id} className={'at-island' + (islandMatch(p) ? ' hit' : '') + (p.id === 'recent' ? ' recent' : '')} style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
								<svg className="at-land" width={p.w} height={p.h - 30} viewBox={`0 0 ${p.w} ${p.h - 30}`} style={{ top: 30 }} aria-hidden="true">
									<path d={p.path} className="c3" transform={`translate(${p.w / 2} ${(p.h - 30) / 2}) scale(1.13) translate(${-p.w / 2} ${-(p.h - 30) / 2})`} />
									<path d={p.path} className="c2" transform={`translate(${p.w / 2} ${(p.h - 30) / 2}) scale(1.06) translate(${-p.w / 2} ${-(p.h - 30) / 2})`} />
									<path d={p.path} className="c1" />
								</svg>
								<div className="at-name" style={{ transform: `translateX(-50%) scale(${label})` }}>{p.name}<span>{p.games.length}</span></div>
								<div className="at-tiles">
									{p.games.map((g, i) => (
										<button key={g.appid} data-appid={g.appid} title={g.name} style={{ left: p.spots[i].x, top: p.spots[i].y }}
											className={'at-tile' + (g.installed ? ' on' : '') + (sel?.appid === g.appid ? ' sel' : '') + (matches ? (matches.has(g.appid) ? ' hit' : ' miss') : '')}
											onClick={() => { if (!drag.current?.moved) select(g.appid); }}>
											{!far && <img src={g.capsule} alt="" loading="lazy" draggable={false} />}
										</button>
									))}
								</div>
							</section>
						))}
					</div>
				</div>
				<div className="at-ui at-mini" style={{ width: MW, height: MH }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); flyTo(camFor(bounds.x + (e.clientX - r.left) / ms, bounds.y + (e.clientY - r.top) / ms, cam.z)); }}>
					{placed.map((p) => <i key={p.id} style={{ left: (p.x - bounds.x) * ms, top: (p.y - bounds.y) * ms, width: Math.max(3, p.w * ms), height: Math.max(3, p.h * ms) }} />)}
					<b style={{ left: vr.x, top: vr.y, width: vr.w, height: vr.h }} />
				</div>
				<div className="at-ui at-zoom">
					<button aria-label="Zoom in" onClick={() => { const { w, h } = size(); const z = Math.min(2.4, cam.z * 1.5); flyTo({ z, x: w / 2 - (w / 2 - cam.x) * (z / cam.z), y: h / 2 - (h / 2 - cam.y) * (z / cam.z) }); }}><Icon name="plus" size={18} /></button>
					<button aria-label="Zoom out" onClick={() => { const { w, h } = size(); const z = Math.max(0.08, cam.z / 1.5); flyTo({ z, x: w / 2 - (w / 2 - cam.x) * (z / cam.z), y: h / 2 - (h / 2 - cam.y) * (z / cam.z) }); }}><Icon name="minimize" size={18} /></button>
					<button aria-label="Show everything" title="Show everything (0)" onClick={fitAll}><Icon name="grid" size={16} /></button>
				</div>
				<div className="at-ui at-legend">Drag to move · scroll to zoom · 0 shows everything</div>
				{sel && <Inspector g={sel} islands={placed} onClose={() => select(null)} />}
			</main>
		</>
	);
}

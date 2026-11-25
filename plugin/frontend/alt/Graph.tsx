// GRAPH — a network graph. Collections are hub nodes, games are nodes linked to every collection they belong to, laid
// out by a small force simulation (games in several collections sit between hubs). Node size follows hours; hover
// lights up neighbours; click a node for its details and Play.
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

type N = { id: string; x: number; y: number; vx: number; vy: number; hub: boolean; r: number; label: string; appid?: number; hue: number };

export function Graph() {
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 8);
	const [sel, select] = useSelectedGame();
	const [hover, setHover] = useState<string | null>(null);
	const [, setTick] = useState(0);
	const { nodes, links } = useMemo(() => {
		const nodes: N[] = []; const links: [number, number][] = []; const idx = new Map<string, number>();
		islands.forEach((i, k) => { const a = (k / islands.length) * Math.PI * 2; idx.set('h' + i.id, nodes.length); nodes.push({ id: 'h' + i.id, x: 800 + Math.cos(a) * 300, y: 450 + Math.sin(a) * 260, vx: 0, vy: 0, hub: true, r: 26, label: i.name, hue: (k * 47) % 360 }); });
		islands.forEach((i, k) => i.games.slice(0, 22).forEach((g, n) => { const key = 'g' + g.appid; if (!idx.has(key)) { const h = nodes[idx.get('h' + i.id)!]; idx.set(key, nodes.length); nodes.push({ id: key, x: h.x + Math.cos(n) * 80, y: h.y + Math.sin(n) * 80, vx: 0, vy: 0, hub: false, r: 5 + Math.min(14, Math.sqrt(g.minutes / 60)), label: g.name, appid: g.appid, hue: (k * 47) % 360 }); } links.push([idx.get('h' + i.id)!, idx.get(key)!]); }));
		return { nodes, links };
	}, [islands]);
	const steps = useRef(0);
	useEffect(() => {
		steps.current = 0; let raf = 0;
		const step = () => {
			for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j]; const dx = a.x - b.x, dy = a.y - b.y; const d2 = Math.max(80, dx * dx + dy * dy); const f = (a.hub && b.hub ? 9000 : 900) / d2; a.vx += dx * f / 40; a.vy += dy * f / 40; b.vx -= dx * f / 40; b.vy -= dy * f / 40; }
			for (const [s, t] of links) { const a = nodes[s], b = nodes[t]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - 90) * 0.01; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; }
			for (const n of nodes) { n.vx += (800 - n.x) * 0.0008; n.vy += (450 - n.y) * 0.0008; n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy; }
			setTick((t) => t + 1); if (++steps.current < 260) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [nodes, links]);
	const focus = hover ?? (sel ? 'g' + sel.appid : null);
	const nb = useMemo(() => { const s = new Set<number>(); if (!focus) return s; const fi = nodes.findIndex((n) => n.id === focus); links.forEach(([a, b]) => { if (a === fi) s.add(b); if (b === fi) s.add(a); }); s.add(fi); return s; }, [focus, nodes, links]);
	return (
		<AltPage className="net" brand={<>◎ Graph</>}>
			<div className="net-app">
				<svg className="net-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
					{links.map(([a, b], i) => <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} className={focus && nb.has(a) && nb.has(b) ? 'hot' : focus ? 'dim' : ''} style={{ stroke: `hsl(${nodes[a].hue} 70% 60%)` }} />)}
					{nodes.map((n, i) => (
						<g key={n.id} className={'net-n' + (n.hub ? ' hub' : '') + (focus && !nb.has(i) ? ' dim' : '') + (sel && n.appid === sel.appid ? ' on' : '')} transform={`translate(${n.x} ${n.y})`} data-appid={n.appid} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} onClick={() => n.appid && select(n.appid)}>
							<circle r={n.r} style={{ fill: n.hub ? `hsl(${n.hue} 70% 55%)` : `hsl(${n.hue} 60% 70%)` }} />
							{(n.hub || nb.has(i) && focus) && <text y={n.hub ? 5 : -n.r - 6}>{n.label.length > 28 ? n.label.slice(0, 27) + '…' : n.label}</text>}
						</g>
					))}
				</svg>
				<div className="net-legend">{islands.map((i, k) => <span key={i.id}><i style={{ background: `hsl(${(k * 47) % 360} 70% 55%)` }} />{i.name}</span>)}</div>
				{sel && <aside className="net-card" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'} · in {islands.filter((i) => i.games.some((g) => g.appid === sel.appid)).length} collections</p><PlayBtn g={sel} className="net-go" /><Actions g={sel} className="net-act" /><button className="net-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const graphCss = tok('graph', { bg: '#0F1020', s1: '#181A30', s2: '#22253F', s3: '#2E3252', fg: '#EDEEFF', fg2: '#B9BCE0', fg3: '#7C80A8', acc: '#8B7BFF', on: '#fff', top: '#0A0B18', font: '"Segoe UI", system-ui, sans-serif' }) + `
.net-brand { font: 600 16px var(--k-text); color: #EDEEFF; }
.net-app { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #1A1C3A, #0A0B18 75%); }
.net-svg { width: 100%; height: 100%; } .net-svg line { stroke-width: 1; opacity: .3; transition: opacity .2s; } .net-svg line.hot { opacity: .9; stroke-width: 2; } .net-svg line.dim { opacity: .06; }
.net-n { cursor: pointer; transition: opacity .2s; } .net-n circle { stroke: #0F1020; stroke-width: 2; } .net-n.hub circle { stroke: #fff; stroke-width: 3; } .net-n.dim { opacity: .2; } .net-n.on circle { stroke: #fff; stroke-width: 3; }
.net-n text { font: 600 12px var(--k-text); fill: #EDEEFF; text-anchor: middle; paint-order: stroke; stroke: #0F1020; stroke-width: 4px; pointer-events: none; } .net-n.hub text { font: 800 13px var(--k-text); }
.net-legend { position: absolute; left: 16px; bottom: 14px; display: flex; flex-wrap: wrap; gap: 12px; font: 12px var(--k-text); color: #B9BCE0; } .net-legend i { display: inline-block; width: 10px; height: 10px; margin-right: 6px; border-radius: 50%; }
.net-card { position: absolute; right: 20px; top: 20px; width: 320px; padding: 14px; border-radius: 14px; background: rgba(24,26,48,.92); box-shadow: 0 0 0 1px #2E3252; color: #EDEEFF; animation: k-fade .2s both; } .net-card img { width: 100%; border-radius: 8px; } .net-card h3 { margin: 10px 0 4px; font: 700 17px var(--k-text); } .net-card p { margin: 0 0 10px; font: 13px var(--k-text); color: #B9BCE0; }
.net-go { width: 100%; height: 40px; border-radius: 10px; background: #8B7BFF !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 6px; } .net-act button { color: #B9BCE0 !important; } .net-act button:hover { background: #22253F !important; } .net-x { margin-top: 6px; color: #8B7BFF; font: 600 13px var(--k-text); }
`;

// STARS — a planetarium. Every game is a star (brighter and bigger with hours played, twinkling if played this
// fortnight); each collection is a constellation drawn through its brightest stars. Pick a constellation to trace
// it, click a star for its catalogue card; Observe plays it.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, Art, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const rnd = (n: number) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
const mag = (g: Game) => Math.min(9, 1.2 + Math.sqrt(g.minutes / 60) * 0.35);

export function Stars() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands().slice(0, 12);
	const [sel, select] = useSelectedGame();
	const [con, setCon] = useState<string | null>(null);
	const [hover, setHover] = useState<Game | null>(null);
	const pos = useMemo(() => new Map(library.map((g) => [g.appid, { x: 40 + rnd(g.appid) * 1520, y: 30 + rnd(g.appid * 7 + 3) * 740 }])), [library]);
	const lines = useMemo(() => islands.map((i) => { const top = [...i.games].sort((a, b) => b.minutes - a.minutes).slice(0, 7).map((g) => pos.get(g.appid)!).filter(Boolean); const c = top.reduce((a, p) => ({ x: a.x + p.x / top.length, y: a.y + p.y / top.length }), { x: 0, y: 0 }); const ord = [...top].sort((a, b) => Math.atan2(a.y - c.y, a.x - c.x) - Math.atan2(b.y - c.y, b.x - c.x)); return { i, pts: ord, c }; }), [islands, pos]);
	const card = sel ?? hover;
	return (
		<AltPage className="sky" brand={<>✶ Planetarium</>}>
			<div className="sky-app">
				<svg className="sky-map" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice">
					<defs><radialGradient id="skyglow"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#CFE3FF" stopOpacity=".9" /><stop offset="1" stopColor="#CFE3FF" stopOpacity="0" /></radialGradient></defs>
					{Array.from({ length: 220 }, (_, k) => <circle key={'d' + k} cx={rnd(k + 11) * 1600} cy={rnd(k + 999) * 800} r={0.6} className="sky-dust" />)}
					{lines.map((l) => (
						<g key={l.i.id} className={'sky-con' + (con === l.i.id ? ' on' : '')} onClick={() => setCon(con === l.i.id ? null : l.i.id)}>
							<polyline points={[...l.pts, l.pts[0]].filter(Boolean).map((p) => `${p.x},${p.y}`).join(' ')} />
							<text x={l.c.x} y={l.c.y}>{l.i.name}</text>
						</g>
					))}
					{library.map((g) => { const p = pos.get(g.appid)!; const r = mag(g); return (
						<g key={g.appid} className={'sky-star' + (g.minutes2w ? ' tw' : '') + (sel?.appid === g.appid ? ' on' : '')} style={{ animationDelay: (rnd(g.appid) * 3).toFixed(2) + 's' }} onClick={() => select(g.appid)} onMouseEnter={() => setHover(g)} onMouseLeave={() => setHover(null)} data-appid={g.appid}>
							<circle cx={p.x} cy={p.y} r={r * 3} fill="url(#skyglow)" opacity={g.installed ? 0.9 : 0.35} /><circle cx={p.x} cy={p.y} r={Math.max(1, r * 0.55)} className="core" />
							{sel?.appid === g.appid && <circle cx={p.x} cy={p.y} r={r * 3 + 10} className="ring" />}
						</g>); })}
				</svg>
				<nav className="sky-list">{lines.map((l) => <button key={l.i.id} className={con === l.i.id ? 'on' : ''} onClick={() => setCon(con === l.i.id ? null : l.i.id)}>{l.i.name}</button>)}</nav>
				{card && (
					<aside className="sky-card" key={card.appid}>
						<Art g={card} kind="header" />
						<em>Catalogue K-{card.appid}</em><h3>{card.name}</h3>
						<dl><dt>Magnitude</dt><dd>{mag(card).toFixed(1)}</dd><dt>Light received</dt><dd>{formatPlaytime(card.minutes)}</dd><dt>Last observed</dt><dd>{card.lastPlayed ? formatAgo(card.lastPlayed) : 'Never'}</dd><dt>Visibility</dt><dd>{card.installed ? 'Clear' : 'Faint (not installed)'}</dd></dl>
						{sel && <><PlayBtn g={sel} className="sky-go" label={['Observe — Play', 'Bring into view — Install']} /><Actions g={sel} className="sky-act" /><button className="sky-x" onClick={() => select(null)}>Close</button></>}
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const starsCss = tok('stars', { bg: '#030712', s1: '#0B1328', s2: '#121D3A', s3: '#1C2A50', fg: '#E6EEFF', fg2: '#AFC0E6', fg3: '#6D7FA8', acc: '#9EC1FF', on: '#030712', top: 'transparent', font: '"Segoe UI", system-ui, sans-serif' }) + `
html.kestrel[data-ui="stars"] .k-top { position: relative; z-index: 2; border: 0; }
.sky-brand { font: 300 19px var(--k-text); letter-spacing: .1em; color: #E6EEFF; }
.sky-app { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(80% 60% at 60% 30%, #0E1B3D, #030712 70%); }
.sky-map { position: absolute; inset: 0; width: 100%; height: 100%; } .sky-dust { fill: #8DA2D0; opacity: .5; }
.sky-con polyline { fill: none; stroke: #6D7FA8; stroke-width: 1; stroke-opacity: .35; stroke-dasharray: 3 5; } .sky-con text { font: 600 13px var(--k-text); letter-spacing: .25em; text-transform: uppercase; fill: #6D7FA8; fill-opacity: .55; text-anchor: middle; cursor: pointer; }
.sky-con.on polyline { stroke: #9EC1FF; stroke-opacity: .9; stroke-dasharray: none; stroke-width: 1.6; } .sky-con.on text { fill: #CFE3FF; fill-opacity: 1; }
.sky-star { cursor: pointer; } .sky-star .core { fill: #fff; } .sky-star:hover .core { fill: #FFE7A8; } .sky-star.tw { animation: sky-tw 3s ease-in-out infinite; } @keyframes sky-tw { 50% { opacity: .55; } }
.sky-star .ring { fill: none; stroke: #FFE7A8; stroke-width: 1.5; stroke-dasharray: 4 4; animation: sky-rot 8s linear infinite; transform-box: fill-box; transform-origin: center; } @keyframes sky-rot { to { transform: rotate(360deg); } }
.sky-list { position: absolute; left: 16px; bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; max-width: 60%; } .sky-list button { padding: 5px 12px; border-radius: 99px; background: rgba(14,27,61,.75); box-shadow: inset 0 0 0 1px #1C2A50; font: 600 12px var(--k-text); color: #AFC0E6; } .sky-list button.on { background: #9EC1FF; color: #030712; }
.sky-card { position: absolute; right: 20px; top: 20px; width: 320px; padding: 14px; border-radius: 16px; background: rgba(11,19,40,.88); backdrop-filter: blur(10px); box-shadow: inset 0 0 0 1px #1C2A50; animation: k-fade .2s both; color: #E6EEFF; }
.sky-card img { width: 100%; border-radius: 10px; filter: saturate(.7); } .sky-card em { display: block; margin-top: 10px; font: 600 11px Consolas, monospace; font-style: normal; color: #6D7FA8; } .sky-card h3 { margin: 2px 0 10px; font: 600 20px var(--k-text); }
.sky-card dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 12px; font: 13px var(--k-text); } .sky-card dt { color: #6D7FA8; } .sky-card dd { margin: 0; }
.sky-go { width: 100%; height: 42px; border-radius: 10px; background: #9EC1FF !important; color: #030712 !important; font: 700 14px var(--k-text) !important; margin-bottom: 6px; } .sky-act button { color: #AFC0E6 !important; } .sky-act button:hover { background: #121D3A !important; } .sky-x { margin-top: 6px; color: #9EC1FF; font: 600 13px var(--k-text); }
`;

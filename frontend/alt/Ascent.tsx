// ASCENT — a roguelike's branching map. Floors climb from the bottom to a boss at the top; each node is a game
// (your least-played near the start, your favourites as elites, the most played as the boss), joined by paths you
// can take. Up climbs along a path, left/right choose between branches, Enter fights (plays).
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, facts, useKeys, useStatus } from './lk';

type Node = { g: Game; f: number; x: number; kind: 'fight' | 'elite' | 'rest' | 'treasure' | 'boss'; up: number[] };
const ICON = { fight: '⚔', elite: '☠', rest: '🔥', treasure: '◆', boss: '♛' };

function build(gs: Game[]): Node[][] {
	const sorted = [...gs].sort((a, b) => a.minutes - b.minutes);
	const boss = sorted.pop();
	const floors: Node[][] = [];
	let i = 0;
	for (let f = 0; i < sorted.length && f < 12; f++) {
		const w = 2 + ((f * 7 + 3) % 3);
		const row: Node[] = [];
		for (let k = 0; k < w && i < sorted.length; k++, i++) {
			const g = sorted[i];
			const kind = f > 0 && f % 4 === 3 ? 'rest' : g.minutes >= 1200 ? 'elite' : f % 5 === 2 && k === 0 ? 'treasure' : 'fight';
			row.push({ g, f, x: (k + 0.5) / w + (((g.appid % 7) - 3) / 100), kind, up: [] });
		}
		floors.push(row);
	}
	if (boss) floors.push([{ g: boss, f: floors.length, x: 0.5, kind: 'boss', up: [] }]);
	for (let f = 0; f < floors.length - 1; f++) {
		const next = floors[f + 1];
		floors[f].forEach((n, k) => {
			const near = next.map((m, j) => [Math.abs(m.x - n.x), j] as const).sort((a, b) => a[0] - b[0]);
			n.up = [near[0][1], ...(near[1] && (k + f) % 2 === 0 ? [near[1][1]] : [])];
		});
		next.forEach((m, j) => { if (!floors[f].some((n) => n.up.includes(j))) floors[f][floors[f].length - 1].up.push(j); });
	}
	return floors;
}

export function Ascent() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const floors = useMemo(() => build(b.games.slice(0, 60)), [b.games]);
	const [at, setAt] = useState<[number, number]>([0, 0]);
	const [pick, setPick] = useState(0);
	const map = useRef<HTMLDivElement>(null);
	const node = floors[at[0]]?.[at[1]] ?? floors[0]?.[0];
	const choices = node ? node.up : [];
	const g = sel ?? node?.g;
	const status = useStatus(g);
	useEffect(() => { setAt([0, 0]); setPick(0); }, [b.cur, b.q]);
	useEffect(() => { map.current?.querySelector('.pb-asc-node.on')?.scrollIntoView({ block: 'center' }); }, [at[0], at[1]]);
	const climb = (j: number) => { setAt([at[0] + 1, j]); setPick(0); select(null); };
	useKeys((k) => {
		if (k === 'up' && choices.length) climb(choices[Math.min(pick, choices.length - 1)]);
		else if (k === 'down' && at[0] > 0) { const prev = floors[at[0] - 1].findIndex((n) => n.up.includes(at[1])); setAt([at[0] - 1, Math.max(0, prev)]); select(null); }
		else if (k === 'left') setPick((p) => Math.max(0, p - 1)); else if (k === 'right') setPick((p) => Math.min(choices.length - 1, p + 1));
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	const H = 150, top = floors.length * H + 60;
	const y = (f: number) => top - 60 - f * H;
	return (
		<AltPage className="pb-asc" brand={<>▲ ASCENT</>} search={b.q} onSearch={b.setQ}>
			<div className="pb-asc-app">
				<div className="pb-asc-map" ref={map}>
					<Chips b={b} className="pb-asc-chips" />
					<div className="pb-asc-tower" style={{ height: top + 40 }}>
						<svg className="pb-asc-paths" viewBox={`0 0 1000 ${top + 40}`} preserveAspectRatio="none">{floors.map((row, f) => row.map((n, k) => n.up.map((j) => {
							const m = floors[f + 1]?.[j]; if (!m) return null;
							const live = f === at[0] && k === at[1];
							return <line key={f + '-' + k + '-' + j} x1={n.x * 1000} y1={y(f)} x2={m.x * 1000} y2={y(f + 1)} className={live ? (j === choices[pick] ? 'next' : 'live') : f < at[0] ? 'past' : ''} />;
						})))}</svg>
						{floors.map((row, f) => row.map((n, k) => (
							<button key={n.g.appid} data-appid={n.g.appid} className={'pb-asc-node ' + n.kind + (f === at[0] && k === at[1] ? ' on' : '') + (f === at[0] + 1 && choices[pick] === k ? ' next' : '') + (f < at[0] ? ' past' : '')} style={{ left: n.x * 100 + '%', top: y(f) }}
								onClick={() => (f === at[0] + 1 && choices.includes(k) ? climb(k) : (setAt([f, k]), setPick(0), select(null)))} title={n.g.name}>
								<Art g={n.g} kind="capsule" /><i>{ICON[n.kind]}</i>
							</button>
						)))}
					</div>
				</div>
				{g && (
					<aside className="pb-asc-side" key={g.appid}>
						<p className="pb-asc-fl">FLOOR {at[0] + 1} · {node?.kind.toUpperCase()}</p>
						<Art g={g} kind="header" className="pb-asc-img" />
						<h2>{g.name}</h2><p className="pb-asc-st">{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
						<PlayBtn g={g} className="pb-asc-go" label={[node?.kind === 'boss' ? 'FACE THE BOSS' : node?.kind === 'rest' ? 'REST HERE (PLAY)' : 'FIGHT', 'INSTALL']} />
						<p className="pb-asc-hint">↑ climb · ←→ pick a branch · ↓ step back</p>
						{choices.length > 0 && <div className="pb-asc-next"><h4>Next floor</h4>{choices.map((j, n) => { const m = floors[at[0] + 1][j]; return <button key={j} className={n === pick ? 'on' : ''} onClick={() => climb(j)}><i>{ICON[m.kind]}</i>{m.g.name}</button>; })}</div>}
						<button className="pb-asc-more" onClick={() => select(sel ? null : g.appid)}>{sel ? 'Hide details' : 'Details'}</button>
						{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-asc-act" /></>}
					</aside>
				)}
			</div>
		</AltPage>
	);
}

const f = '"Georgia", serif';
export const ascentCss = tok('ascent', { bg: '#1B1712', s1: '#2A241C', s2: '#362E24', s3: '#433A2E', fg: '#F0E6D2', fg2: '#C9BB9E', fg3: '#8E8068', acc: '#D94F30', on: '#fff', top: '#141009', font: '"Segoe UI", sans-serif' }) + `
.pb-asc-brand { font: 700 16px ${f}; letter-spacing: .25em; color: #D94F30; }
.pb-asc-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; background: #1B1712; color: #F0E6D2; }
.pb-asc-map { position: relative; overflow-y: auto; scrollbar-width: thin; background: radial-gradient(circle at 50% 30%, #3A3022, #1B1712 70%); }
.pb-asc-map::before { content: ""; position: fixed; inset: 0; pointer-events: none; background: repeating-linear-gradient(45deg, rgba(255,255,255,.012) 0 6px, transparent 6px 12px); }
.pb-asc-chips { position: sticky; top: 0; z-index: 3; padding: 10px 20px; background: linear-gradient(#1B1712, transparent); }
.pb-asc-tower { position: relative; width: min(760px, 90%); margin: 0 auto; }
.pb-asc-paths { position: absolute; left: 0; top: 0; width: 100%; height: 100%; } .pb-asc-paths line { stroke: rgba(240,230,210,.22); stroke-width: 3; stroke-dasharray: 2 8; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.pb-asc-paths line.past { stroke: rgba(217,79,48,.35); } .pb-asc-paths line.live { stroke: rgba(240,230,210,.6); } .pb-asc-paths line.next { stroke: #FFD27A; stroke-width: 4; stroke-dasharray: none; }
.pb-asc-node { position: absolute; width: 74px; height: 74px; margin: -37px 0 0 -37px; border-radius: 50%; padding: 4px; background: #433A2E; box-shadow: 0 0 0 3px #1B1712, 0 0 0 5px #8E8068; transition: transform .2s; }
.pb-asc-node img, .pb-asc-node .alt-noart { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; filter: sepia(.4) brightness(.75); font-size: 5px; }
.pb-asc-node i { position: absolute; right: -6px; bottom: -6px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: #2A241C; box-shadow: 0 0 0 2px #8E8068; font-style: normal; font-size: 14px; }
.pb-asc-node.elite { box-shadow: 0 0 0 3px #1B1712, 0 0 0 5px #B03A2E; } .pb-asc-node.rest { box-shadow: 0 0 0 3px #1B1712, 0 0 0 5px #E0A040; } .pb-asc-node.treasure { box-shadow: 0 0 0 3px #1B1712, 0 0 0 5px #4FA3D9; }
.pb-asc-node.boss { width: 130px; height: 130px; margin: -65px 0 0 -65px; box-shadow: 0 0 0 4px #1B1712, 0 0 0 7px #D94F30, 0 0 40px rgba(217,79,48,.5); } .pb-asc-node.boss i { width: 40px; height: 40px; font-size: 22px; color: #FFD27A; }
.pb-asc-node:hover { transform: scale(1.1); z-index: 2; } .pb-asc-node.past img { filter: grayscale(1) brightness(.5); }
.pb-asc-node.on { transform: scale(1.2); z-index: 3; box-shadow: 0 0 0 3px #1B1712, 0 0 0 6px #FFD27A, 0 0 30px rgba(255,210,122,.6); } .pb-asc-node.on img { filter: none; } .pb-asc-node.next { animation: pb-asc-pulse 1s ease-in-out infinite alternate; } @keyframes pb-asc-pulse { to { box-shadow: 0 0 0 3px #1B1712, 0 0 0 6px #FFD27A; } }
.pb-asc-side { padding: 20px 22px 30px; overflow-y: auto; background: linear-gradient(#2A241C, #1B1712); box-shadow: inset 1px 0 0 rgba(255,255,255,.05); animation: k-fade .3s both; }
.pb-asc-fl { margin: 0 0 10px; font: 700 12px var(--k-text); letter-spacing: .2em; color: #D94F30; } .pb-asc-img { width: 100%; aspect-ratio: 460/215; object-fit: cover; border-radius: 6px; box-shadow: 0 0 0 2px #433A2E; }
.pb-asc-side h2 { margin: 12px 0 4px; font: 700 22px/1.2 ${f}; } .pb-asc-st { margin: 0 0 14px; font: 13px var(--k-text); color: #C9BB9E; }
.pb-asc-go { width: 100%; height: 46px; background: #D94F30 !important; color: #fff !important; font: 700 15px ${f} !important; letter-spacing: .1em; box-shadow: 0 4px 0 #8A2A16; } .pb-asc-go:hover { filter: brightness(1.1); }
.pb-asc-hint { margin: 10px 0 14px; font: 12px var(--k-text); color: #8E8068; text-align: center; }
.pb-asc-next h4 { margin: 0 0 6px; font: 700 12px var(--k-text); letter-spacing: .15em; text-transform: uppercase; color: #8E8068; } .pb-asc-next button { display: flex; gap: 10px; width: 100%; padding: 8px 10px; margin-bottom: 4px; border-radius: 6px; text-align: left; font: 14px var(--k-text); color: #C9BB9E; background: #2A241C; }
.pb-asc-next button i { font-style: normal; } .pb-asc-next button.on { color: #fff; box-shadow: inset 0 0 0 2px #FFD27A; }
.pb-asc-more { margin-top: 12px; font: 600 13px var(--k-text); color: #C9BB9E; text-decoration: underline; }
.pb-asc-side dl { margin: 14px 0 10px; } .pb-asc-side dl div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.06); font: 13px var(--k-text); } .pb-asc-side dt { color: #8E8068; } .pb-asc-side dd { margin: 0; }
`;

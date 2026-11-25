// TECH TREE — a strategy game's research screen. Columns are eras (the year a game joined your library); each
// collection is a branch running through the eras, its games are technologies linked in order. Played = researched
// (lit), installed but unplayed = available (glowing), the rest are locked. Research plays it.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const COLW = 230, ROWH = 74;
const state = (g: Game) => (g.minutes ? 'done' : g.installed ? 'avail' : 'locked');

export function Techtree() {
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 7);
	const [sel, select] = useSelectedGame();
	const { years, rows } = useMemo(() => {
		const ys = [...new Set(islands.flatMap((i) => i.games.map((g) => (g.added ? new Date(g.added * 1000).getFullYear() : 0))))].filter(Boolean).sort();
		let y0 = 0;
		const rows = islands.map((i) => {
			const byYear = new Map<number, Game[]>();
			for (const g of [...i.games].filter((g) => g.added).sort((a, b) => a.added - b.added)) { const y = new Date(g.added * 1000).getFullYear(); (byYear.get(y) ?? byYear.set(y, []).get(y)!).push(g); }
			const lanes = Math.max(1, ...[...byYear.values()].map((v) => Math.min(3, v.length)));
			const nodes: { g: Game; x: number; y: number }[] = [];
			ys.forEach((y, c) => (byYear.get(y) ?? []).slice(0, 3).forEach((g, k) => nodes.push({ g, x: 20 + c * COLW, y: y0 + 30 + k * ROWH })));
			const r = { i, nodes, top: y0, h: lanes * ROWH + 40 }; y0 += r.h; return r;
		});
		return { years: ys, rows };
	}, [islands]);
	const W = years.length * COLW + 60, H = rows.reduce((n, r) => n + r.h, 0) + 20;
	return (
		<AltPage className="tch" brand={<>⚛ Research</>}>
			<div className="tch-app">
				<div className="tch-scroll">
					<div className="tch-eras" style={{ width: W }}>{years.map((y, c) => <span key={y} style={{ left: 20 + c * COLW, width: COLW - 20 }}>ERA {c + 1} · {y}</span>)}</div>
					<div className="tch-board" style={{ width: W, height: H }}>
						{rows.map((r) => <div key={r.i.id} className="tch-band" style={{ top: r.top, height: r.h }}><span>{r.i.name}</span></div>)}
						<svg width={W} height={H} className="tch-links">{rows.map((r) => r.nodes.slice(1).map((n, k) => { const p = r.nodes[k]; return <path key={n.g.appid} d={`M${p.x + 190} ${p.y + 28} C ${p.x + 210} ${p.y + 28}, ${n.x - 20} ${n.y + 28}, ${n.x} ${n.y + 28}`} className={state(p.g) === 'done' ? 'lit' : ''} />; }))}</svg>
						{rows.map((r) => r.nodes.map((n) => (
							<button key={r.i.id + n.g.appid} data-appid={n.g.appid} className={'tch-node ' + state(n.g) + (sel?.appid === n.g.appid ? ' on' : '')} style={{ left: n.x, top: n.y }} onClick={() => select(n.g.appid)}>
								<span className="tch-ico"><Art g={n.g} kind="capsule" /></span><span><b>{n.g.name}</b><em>{state(n.g) === 'done' ? `${Math.round(n.g.minutes / 60)} turns` : state(n.g) === 'avail' ? 'Available' : 'Locked'}</em></span>
							</button>)))}
					</div>
				</div>
				{sel && (
					<aside className="tch-panel" key={sel.appid}>
						<Art g={sel} kind="header" /><em className={'tch-st ' + state(sel)}>{state(sel) === 'done' ? 'RESEARCHED' : state(sel) === 'avail' ? 'AVAILABLE' : 'LOCKED'}</em><h3>{sel.name}</h3>
						<p>{state(sel) === 'done' ? `Researched for ${formatPlaytime(sel.minutes)}${sel.lastPlayed ? `, last studied ${formatAgo(sel.lastPlayed).toLowerCase()}` : ''}.` : state(sel) === 'avail' ? 'Ready to research: installed but never played.' : 'Locked: install it to unlock research.'}</p>
						<PlayBtn g={sel} className="tch-go" label={['Research (Play)', 'Unlock (Install)']} /><Actions g={sel} className="tch-act" /><button className="tch-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const techtreeCss = tok('techtree', { bg: '#0B1A24', s1: '#10242F', s2: '#16303D', s3: '#1E3E4E', fg: '#E3F2F7', fg2: '#A9C8D4', fg3: '#6B8E9C', acc: '#3FD0C9', on: '#04221F', top: '#07131A', font: '"Segoe UI", "Trebuchet MS", sans-serif' }) + `
.tch-brand { font: 700 17px var(--k-text); letter-spacing: .1em; color: #E3F2F7; }
.tch-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; background: radial-gradient(60% 60% at 30% 20%, #16303D, #07131A 75%); }
.tch-scroll { overflow: auto; padding: 0 0 30px; }
.tch-eras { position: sticky; top: 0; z-index: 3; height: 36px; background: linear-gradient(#07131A, rgba(7,19,26,.85)); } .tch-eras span { position: absolute; top: 8px; padding: 2px 10px; border-radius: 4px; background: #16303D; font: 700 12px var(--k-text); letter-spacing: .1em; color: #A9C8D4; box-shadow: inset 0 0 0 1px #2A5566; }
.tch-board { position: relative; }
.tch-band { position: absolute; left: 0; right: 0; border-bottom: 1px dashed rgba(169,200,212,.15); } .tch-band span { position: sticky; left: 8px; display: inline-block; margin-top: 4px; font: 700 11px var(--k-text); letter-spacing: .15em; text-transform: uppercase; color: #6B8E9C; }
.tch-links { position: absolute; left: 0; top: 0; pointer-events: none; } .tch-links path { fill: none; stroke: #2A5566; stroke-width: 3; } .tch-links path.lit { stroke: #3FD0C9; filter: drop-shadow(0 0 4px #3FD0C9); }
.tch-node { position: absolute; display: flex; gap: 8px; align-items: center; width: 190px; height: 56px; padding: 6px 8px; border-radius: 10px; text-align: left; background: linear-gradient(#1E3E4E, #10242F); box-shadow: inset 0 0 0 2px #2A5566, 0 6px 12px rgba(0,0,0,.4); color: #E3F2F7; transition: transform .15s; }
.tch-node:hover { transform: scale(1.05); z-index: 2; } .tch-node.done { box-shadow: inset 0 0 0 2px #3FD0C9, 0 0 16px rgba(63,208,201,.35); } .tch-node.avail { box-shadow: inset 0 0 0 2px #F5C35B, 0 0 16px rgba(245,195,91,.35); animation: tch-glow 2s ease-in-out infinite; } .tch-node.locked { opacity: .5; filter: grayscale(.8); } .tch-node.on { outline: 3px solid #fff; outline-offset: 2px; }
@keyframes tch-glow { 50% { box-shadow: inset 0 0 0 2px #F5C35B, 0 0 4px rgba(245,195,91,.2); } }
.tch-ico { width: 40px; height: 40px; flex: none; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 2px #0B1A24; } .tch-ico img, .tch-ico .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 4px; }
.tch-node b { display: block; font: 700 12px/1.2 var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 128px; } .tch-node em { font: 11px var(--k-text); font-style: normal; color: #A9C8D4; }
.tch-panel { width: 330px; overflow-y: auto; padding: 18px; background: rgba(7,19,26,.9); box-shadow: -1px 0 0 #1E3E4E; color: #E3F2F7; animation: k-fade .2s both; } .tch-panel img { width: 100%; border-radius: 8px; }
.tch-st { display: inline-block; margin: 12px 0 4px; padding: 2px 8px; border-radius: 4px; font: 800 11px var(--k-text); font-style: normal; letter-spacing: .15em; } .tch-st.done { background: #3FD0C9; color: #04221F; } .tch-st.avail { background: #F5C35B; color: #2A1A00; } .tch-st.locked { background: #2A5566; color: #A9C8D4; }
.tch-panel h3 { margin: 0 0 8px; font: 700 19px var(--k-text); } .tch-panel p { margin: 0 0 14px; font: 14px/1.5 var(--k-text); color: #A9C8D4; }
.tch-go { width: 100%; height: 42px; border-radius: 8px; background: #3FD0C9 !important; color: #04221F !important; font: 800 14px var(--k-text) !important; margin-bottom: 6px; } .tch-act button { color: #A9C8D4 !important; } .tch-act button:hover { background: #16303D !important; } .tch-x { margin-top: 6px; color: #3FD0C9; font: 600 13px var(--k-text); }
`;

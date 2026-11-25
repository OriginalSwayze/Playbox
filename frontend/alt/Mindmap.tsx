// MIND MAP — a mind-mapping app. Your library sits in the middle, collections branch out around it, and each
// branch fans into its most-played games; click a branch to expand it to more. Drag to pan, scroll to zoom.
import { useMemo, useRef, useState } from 'react';
import { formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const HUES = [8, 32, 50, 140, 175, 205, 250, 290, 330];

export function Mindmap() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [open, setOpen] = useState<Record<string, boolean>>({});
	const [v, setV] = useState({ x: 0, y: 0, z: 0.9 });
	const drag = useRef<{ x: number; y: number; vx: number; vy: number; m: boolean } | null>(null);
	const branches = islands.slice(0, 9);
	const nodes = useMemo(() => branches.map((br, i) => {
		const a = (i / branches.length) * Math.PI * 2 - Math.PI / 2;
		const bx = Math.cos(a) * 300, by = Math.sin(a) * 230;
		const kids = [...br.games].sort((x, y) => y.minutes - x.minutes).slice(0, open[br.id] ? 18 : 6);
		const leaves = kids.map((g, k) => { const spread = Math.min(1.6, 0.28 * kids.length); const la = a + (k - (kids.length - 1) / 2) * (spread / Math.max(1, kids.length - 1)); const r = 190 + (k % 2) * 60; return { g, x: bx + Math.cos(la) * r, y: by + Math.sin(la) * r }; });
		return { br, bx, by, hue: HUES[i % 9], leaves };
	}), [branches, open]);
	return (
		<AltPage className="mnd" brand={<><span className="mnd-logo">✺</span>Mind Map</>}>
			<div className="mnd-app">
				<section className="mnd-stage2" onWheel={(e) => setV({ ...v, z: Math.min(2, Math.max(0.3, v.z * (e.deltaY < 0 ? 1.1 : 0.9))) })}
					onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, m: false }; }}
					onPointerMove={(e) => { const d = drag.current; if (!d || !(e.buttons & 1)) return; if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) { d.m = true; e.currentTarget.setPointerCapture(e.pointerId); } setV({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }); }}
					onPointerUp={() => setTimeout(() => (drag.current = null))}>
					<div className="mnd-world" style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.z})` }}>
						<svg className="mnd-links" viewBox="-1000 -800 2000 1600" width="2000" height="1600">
							{nodes.map((n) => <g key={n.br.id} stroke={`hsl(${n.hue} 70% 55%)`}><path d={`M0 0 C ${n.bx * 0.5} 0, ${n.bx * 0.5} ${n.by}, ${n.bx} ${n.by}`} strokeWidth="6" />
								{n.leaves.map((l) => <path key={l.g.appid} d={`M${n.bx} ${n.by} C ${(n.bx + l.x) / 2} ${n.by}, ${(n.bx + l.x) / 2} ${l.y}, ${l.x} ${l.y}`} strokeWidth="2.5" />)}</g>)}
						</svg>
						<div className="mnd-root">My library</div>
						{nodes.map((n) => (
							<div key={n.br.id}>
								<button className="mnd-branch" style={{ left: n.bx, top: n.by, background: `hsl(${n.hue} 70% 55%)` }} onClick={() => { if (!drag.current?.m) setOpen({ ...open, [n.br.id]: !open[n.br.id] }); }}>{n.br.name}<em>{open[n.br.id] ? '−' : `+${Math.max(0, n.br.games.length - 6)}`}</em></button>
								{n.leaves.map((l) => <button key={l.g.appid} data-appid={l.g.appid} className={'mnd-leaf' + (sel?.appid === l.g.appid ? ' on' : '')} style={{ left: l.x, top: l.y, borderColor: `hsl(${n.hue} 70% 55%)` }} onClick={() => { if (!drag.current?.m) select(l.g.appid); }}>{l.g.name}</button>)}
							</div>
						))}
					</div>
					<div className="mnd-tools"><button onClick={() => setV({ x: 0, y: 0, z: 0.9 })}>Centre</button><button onClick={() => setOpen(Object.fromEntries(branches.map((x) => [x.id, true])))}>Expand all</button><button onClick={() => setOpen({})}>Collapse</button></div>
				</section>
				{sel && <aside className="mnd-note" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{sel.minutes ? formatPlaytime(sel.minutes) + ' played' : 'Not played yet'}</p><PlayBtn g={sel} className="mnd-go" /><Actions g={sel} /><button className="mnd-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const mindmapCss = tok('mindmap', { bg: '#FBFAF6', s1: '#FFFFFF', s2: '#F1EFE8', s3: '#E2DED3', fg: '#22201C', fg2: '#4D4A43', fg3: '#8E897E', acc: '#E85D3F', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.mnd-brand { display: flex; gap: 8px; align-items: center; font: 700 18px var(--k-text); color: #22201C; } .mnd-logo { color: #E85D3F; font-size: 20px; }
.mnd-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
.mnd-stage2 { position: relative; overflow: hidden; cursor: grab; touch-action: none; background: radial-gradient(circle, #E2DED3 1px, transparent 1px) 0 0 / 24px 24px, #FBFAF6; }
.mnd-world { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-origin: 0 0; transition: transform .15s ease-out; }
.mnd-links { position: absolute; left: -1000px; top: -800px; pointer-events: none; } .mnd-links path { fill: none; stroke-linecap: round; }
.mnd-root, .mnd-branch, .mnd-leaf { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; }
.mnd-root { padding: 18px 28px; border-radius: 22px; background: #22201C; color: #fff; font: 800 22px var(--k-text); box-shadow: 0 10px 30px -10px rgba(0,0,0,.4); }
.mnd-branch { padding: 10px 18px; border-radius: 16px; color: #fff; font: 700 15px var(--k-text); box-shadow: 0 6px 16px -8px rgba(0,0,0,.4); transition: transform .2s var(--k-spring); animation: k-fade .4s both; } .mnd-branch:hover { transform: translate(-50%, -50%) scale(1.06); }
.mnd-branch em { margin-left: 8px; padding: 1px 7px; border-radius: 99px; background: rgba(255,255,255,.3); font: 700 11px var(--k-text); font-style: normal; }
.mnd-leaf { max-width: 200px; overflow: hidden; text-overflow: ellipsis; padding: 6px 12px; border-radius: 10px; border: 2px solid; background: #fff; font: 600 12.5px var(--k-text); color: #22201C; animation: k-fade .4s both; } .mnd-leaf:hover { background: #FFF6E8; } .mnd-leaf.on { background: #22201C; color: #fff; }
.mnd-tools { position: absolute; left: 16px; bottom: 16px; display: flex; gap: 6px; } .mnd-tools button { padding: 8px 12px; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.12); font: 600 12px var(--k-text); color: #22201C; }
.mnd-note { width: 320px; overflow-y: auto; padding: 18px; background: #FFF9C4; box-shadow: -6px 0 20px -10px rgba(0,0,0,.3); animation: k-fade .25s both; } .mnd-note img { width: 100%; border-radius: 6px; transform: rotate(-1.5deg); box-shadow: 0 4px 10px rgba(0,0,0,.2); }
.mnd-note h3 { margin: 14px 0 4px; font: 700 20px "Segoe Print", "Comic Sans MS", var(--k-text); color: #22201C; } .mnd-note p { margin: 0 0 12px; font: 14px "Segoe Print", var(--k-text); color: #4D4A43; }
.mnd-go { width: 100%; height: 40px; border-radius: 10px; background: #E85D3F !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 8px; } .mnd-x { margin-top: 8px; font: 600 13px var(--k-text); color: #E85D3F; }
.mnd-note .alt-actions button { color: #4D4A43 !important; } .mnd-note .alt-actions button:hover { background: rgba(0,0,0,.06) !important; }
`;

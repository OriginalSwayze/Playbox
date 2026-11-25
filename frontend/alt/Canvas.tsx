// CANVAS — a design tool. Each collection is a frame on an infinite canvas holding its games as artboards; drag to
// pan, scroll to zoom. The layers panel mirrors the canvas, the inspector shows an artboard's "properties".
import { useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const W = 150, H = 225, GAP = 30, COLS = 6;

export function Canvas() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [view, setView] = useState({ x: 60, y: 60, z: 0.7 });
	const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
	const frames = (b.found ? [{ id: 'q', name: 'Search', games: b.found }] : b.islands).slice(0, 12).map((i) => ({ ...i, games: i.games.slice(0, 36) }));
	let y = 0;
	const placed = frames.map((f) => { const rows = Math.ceil(f.games.length / COLS); const at = { f, x: 0, y, w: COLS * (W + GAP) + GAP, h: rows * (H + GAP + 24) + GAP + 10 }; y += at.h + 120; return at; });
	return (
		<AltPage className="dsg" brand={<><span className="dsg-logo"><i /><i /><i /></span>Canvas</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Find layers">
			<div className="dsg-app">
				<aside className="dsg-layers">
					<div className="dsg-ph">Layers</div>
					{placed.map(({ f }) => (
						<div key={f.id}><div className="dsg-frame-l">▦ {f.name}</div>{f.games.map((g) => <button key={g.appid} className={'dsg-layer' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>▭ {g.name}</button>)}</div>
					))}
				</aside>
				<section className="dsg-canvas" onWheel={(e) => { const z = Math.min(2, Math.max(0.15, view.z * (e.deltaY < 0 ? 1.1 : 0.9))); const r = e.currentTarget.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; setView({ z, x: mx - (mx - view.x) * (z / view.z), y: my - (my - view.y) * (z / view.z) }); }}
					onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; }}
					onPointerMove={(e) => { const d = drag.current; if (!d || !(e.buttons & 1)) return; if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); } setView({ ...view, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }); }}
					onPointerUp={() => { setTimeout(() => (drag.current = null)); }}>
					<div className="dsg-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}>
						{placed.map(({ f, x, y: fy, w, h }) => (
							<div key={f.id} className="dsg-frame" style={{ left: x, top: fy, width: w, height: h }}>
								<span className="dsg-fname">{f.name}</span>
								{f.games.map((g, i) => (
									<button key={g.appid} data-appid={g.appid} className={'dsg-board' + (sel?.appid === g.appid ? ' on' : '')} style={{ left: GAP + (i % COLS) * (W + GAP), top: GAP + 10 + Math.floor(i / COLS) * (H + GAP + 24) }}
										onClick={() => { if (!drag.current?.moved) select(g.appid); }}>
										<span className="dsg-bname">{g.name}</span><Art g={g} kind="capsule" />
										{sel?.appid === g.appid && <><i className="h tl" /><i className="h tr" /><i className="h bl" /><i className="h br" /><em>{W} × {H}</em></>}
									</button>
								))}
							</div>
						))}
					</div>
					<div className="dsg-zoom"><button onClick={() => setView({ ...view, z: Math.max(0.15, view.z * 0.8) })}>−</button><span>{Math.round(view.z * 100)}%</span><button onClick={() => setView({ ...view, z: Math.min(2, view.z * 1.25) })}>+</button><button onClick={() => setView({ x: 60, y: 60, z: 0.7 })}>Fit</button></div>
				</section>
				<aside className="dsg-insp">
					<div className="dsg-ph"><span className="on">Design</span><span>Prototype</span><span>Inspect</span></div>
					{sel ? <div key={sel.appid}>
						<h4>{sel.name}</h4>
						<div className="dsg-props"><label>X<b>{sel.appid % 1000}</b></label><label>Y<b>{Math.round(sel.minutes / 60)}</b></label><label>W<b>{W}</b></label><label>H<b>{H}</b></label></div>
						<h5>Fill</h5><div className="dsg-fill"><i style={{ background: sel.installed ? '#18A0FB' : '#B3B3B3' }} />{sel.installed ? 'Installed' : 'Not installed'}<span>100%</span></div>
						<h5>Text</h5><p className="dsg-text">{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p>
						<h5>Export</h5><Art g={sel} kind="header" className="dsg-exp" />
						<PlayBtn g={sel} className="dsg-go" label={['▶ Present (Play)', '⬇ Install']} />
						<Actions g={sel} className="dsg-act" />
					</div> : <p className="dsg-none">Select an artboard.</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const canvasCss = tok('canvas', { bg: '#E5E5E5', s1: '#FFFFFF', s2: '#F0F0F0', s3: '#E0E0E0', fg: '#1E1E1E', fg2: '#444', fg3: '#8C8C8C', acc: '#0D99FF', on: '#fff', top: '#2C2C2C', topFg: '#FFFFFF', font: '"Segoe UI", Inter, system-ui, sans-serif' }) + `
.dsg-brand { display: flex; gap: 8px; align-items: center; font: 600 14px var(--k-text); color: #fff; } .dsg-logo { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 18px; } .dsg-logo i { height: 8px; border-radius: 4px; background: #8B5CF6; } .dsg-logo i:nth-child(2) { background: #F59E0B; border-radius: 50%; } .dsg-logo i:nth-child(3) { background: #10B981; border-radius: 4px 4px 4px 0; }
.dsg-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr) 260px; font: 12px var(--k-text); color: #1E1E1E; }
.dsg-layers, .dsg-insp { overflow-y: auto; background: #fff; } .dsg-layers { border-right: 1px solid #E6E6E6; } .dsg-insp { border-left: 1px solid #E6E6E6; padding-bottom: 20px; }
.dsg-ph { position: sticky; top: 0; z-index: 1; display: flex; gap: 14px; padding: 12px 14px; background: #fff; border-bottom: 1px solid #E6E6E6; font: 600 12px var(--k-text); } .dsg-ph span { color: #8C8C8C; } .dsg-ph .on { color: #1E1E1E; }
.dsg-frame-l { padding: 6px 14px; font-weight: 600; } .dsg-layer { display: block; width: 100%; padding: 4px 14px 4px 30px; text-align: left; font: 12px var(--k-text); color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .dsg-layer:hover { background: #F0F0F0; } .dsg-layer.on { background: #DAEBF7; color: #1E1E1E; }
.dsg-canvas { position: relative; overflow: hidden; background: #E5E5E5; cursor: grab; touch-action: none; } .dsg-canvas:active { cursor: grabbing; }
.dsg-world { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.dsg-frame { position: absolute; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.06); } .dsg-fname { position: absolute; left: 0; top: -22px; font: 14px var(--k-text); color: #8C8C8C; white-space: nowrap; }
.dsg-board { position: absolute; width: ${W}px; height: ${H}px; } .dsg-board img, .dsg-board .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; } .dsg-board:hover { box-shadow: 0 0 0 2px #0D99FF; }
.dsg-bname { position: absolute; left: 0; right: 0; top: -18px; font: 11px var(--k-text); color: #8C8C8C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
.dsg-board.on { box-shadow: 0 0 0 2px #0D99FF; } .dsg-board .h { position: absolute; width: 9px; height: 9px; background: #fff; border: 1.5px solid #0D99FF; } .h.tl { left: -5px; top: -5px; } .h.tr { right: -5px; top: -5px; } .h.bl { left: -5px; bottom: -5px; } .h.br { right: -5px; bottom: -5px; }
.dsg-board em { position: absolute; left: 50%; bottom: -26px; transform: translateX(-50%); padding: 2px 6px; border-radius: 3px; background: #0D99FF; color: #fff; font: 11px var(--k-text); font-style: normal; white-space: nowrap; }
.dsg-zoom { position: absolute; right: 14px; bottom: 14px; display: flex; gap: 2px; align-items: center; padding: 4px; border-radius: 8px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.15); } .dsg-zoom button { min-width: 26px; height: 26px; border-radius: 5px; font: 600 13px var(--k-text); color: #1E1E1E; padding: 0 6px; } .dsg-zoom button:hover { background: #F0F0F0; } .dsg-zoom span { width: 46px; text-align: center; }
.dsg-insp h4 { margin: 14px 14px 10px; font: 600 13px var(--k-text); } .dsg-insp h5 { margin: 16px 14px 6px; font: 600 11px var(--k-text); color: #1E1E1E; }
.dsg-props { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 0 14px; } .dsg-props label { display: flex; gap: 8px; padding: 6px 8px; border-radius: 4px; background: #F5F5F5; color: #8C8C8C; } .dsg-props b { font-weight: 400; color: #1E1E1E; }
.dsg-fill { display: flex; gap: 8px; align-items: center; padding: 0 14px; } .dsg-fill i { width: 16px; height: 16px; border-radius: 3px; box-shadow: 0 0 0 1px rgba(0,0,0,.1); } .dsg-fill span { margin-left: auto; color: #8C8C8C; }
.dsg-text { margin: 0 14px; } .dsg-exp { width: calc(100% - 28px); margin: 0 14px; border-radius: 4px; } .dsg-go { width: calc(100% - 28px); margin: 14px 14px 6px; height: 32px; border-radius: 6px; background: #0D99FF !important; color: #fff !important; font: 600 12px var(--k-text) !important; }
.dsg-act { padding: 0 8px; } .dsg-act button { font-size: 12px !important; } .dsg-none { color: #8C8C8C; padding: 14px; }
`;

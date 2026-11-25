// WHITEBOARD — a team whiteboard. Each collection is a cluster of sticky notes in its own colour under a marker
// heading; every note is a game you can drag anywhere on the board (positions last for the session). Double-click
// or press the corner to open a note; Play is on the back.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const COLORS = ['#FFF176', '#FFAB91', '#A5D6A7', '#90CAF9', '#CE93D8', '#FFCC80', '#80DEEA', '#F48FB1'];
const PER = 10;

export function Whiteboard() {
	const islands = useIslands().slice(0, 8);
	const [sel, select] = useSelectedGame();
	const [moved, setMoved] = useState<Record<number, { x: number; y: number }>>({});
	const drag = useRef<{ id: number; dx: number; dy: number; moved: boolean } | null>(null);
	const layout = useMemo(() => islands.map((i, k) => ({ i, x: 40 + (k % 4) * 380, y: 40 + Math.floor(k / 4) * 470, c: COLORS[k % 8], notes: i.games.slice(0, PER) })), [islands]);
	const seen = new Set<number>();
	return (
		<AltPage className="wbd" brand={<>✎ Whiteboard</>}>
			<div className="wbd-app" onPointerMove={(e) => { const d = drag.current; if (!d) return; d.moved = true; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setMoved((m) => ({ ...m, [d.id]: { x: e.clientX - r.left + (e.currentTarget as HTMLElement).scrollLeft - d.dx, y: e.clientY - r.top + (e.currentTarget as HTMLElement).scrollTop - d.dy } })); }} onPointerUp={() => setTimeout(() => (drag.current = null))}>
				<div className="wbd-tools"><span className="on">↖</span><span>✎</span><span>▭</span><span>T</span><button onClick={() => setMoved({})}>Tidy up</button></div>
				<div className="wbd-board">
					{layout.map((cl) => (
						<div key={cl.i.id}>
							<h2 className="wbd-head" style={{ left: cl.x, top: cl.y, color: ['#1565C0', '#C62828', '#2E7D32', '#6A1B9A'][layout.indexOf(cl) % 4] }}>{cl.i.name}</h2>
							{cl.notes.map((g, n) => { if (seen.has(g.appid)) return null; seen.add(g.appid); const p = moved[g.appid] ?? { x: cl.x + (n % 3) * 115, y: cl.y + 50 + Math.floor(n / 3) * 110 }; return (
								<div key={g.appid} data-appid={g.appid} className={'wbd-note' + (sel?.appid === g.appid ? ' on' : '')} style={{ left: p.x, top: p.y, background: cl.c, transform: `rotate(${((g.appid % 9) - 4) * 0.8}deg)` }}
									onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); drag.current = { id: g.appid, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false }; }}
									onClick={() => { if (!drag.current?.moved) select(g.appid); }}>
									<b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'not started'}</em>{g.minutes2w > 0 && <i>🔥</i>}
								</div>); })}
							{cl.i.games.length > PER && <span className="wbd-more" style={{ left: cl.x + 230, top: cl.y + 490 - 70 }}>+{cl.i.games.length - PER} more</span>}
						</div>
					))}
					<svg className="wbd-ink" width="1600" height="1000"><path d="M 360 120 q 20 -30 40 0" /><path d="M 740 590 l 40 -20 l -10 30" /><path d="M 1140 130 c 30 40 60 -10 80 20" /></svg>
				</div>
				{sel && (
					<div className="wbd-open" onClick={() => select(null)}>
						<div className="wbd-big" key={sel.appid} onClick={(e) => e.stopPropagation()} style={{ background: COLORS[(layout.findIndex((c) => c.notes.some((g) => g.appid === sel.appid)) + 8) % 8] }}>
							<Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{sel.minutes ? `${formatPlaytime(sel.minutes)} so far` : 'Not started'}{sel.lastPlayed ? ` · last ${formatAgo(sel.lastPlayed).toLowerCase()}` : ''}</p>
							<PlayBtn g={sel} className="wbd-go" label={['Do it — Play', 'Set up — Install']} /><Actions g={sel} className="wbd-act" />
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const whiteboardCss = tok('whiteboard', { bg: '#FDFDFB', s1: '#FFFFFF', s2: '#F1F1EE', s3: '#E2E2DC', fg: '#222', fg2: '#444', fg3: '#888', acc: '#1565C0', on: '#fff', font: '"Segoe Print", "Comic Sans MS", cursive' }) + `
.wbd-brand { font: 700 18px var(--k-text); color: #222; }
.wbd-app { position: absolute; inset: 0; overflow: auto; background: #FDFDFB; touch-action: none; }
.wbd-tools { position: sticky; left: 12px; top: 12px; z-index: 5; float: left; display: grid; gap: 4px; padding: 6px; border-radius: 12px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.15); } .wbd-tools span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; font: 16px "Segoe UI", sans-serif; color: #444; } .wbd-tools span.on { background: #E3F2FD; color: #1565C0; }
.wbd-tools button { padding: 4px; font: 11px "Segoe UI", sans-serif; color: #1565C0; }
.wbd-board { position: relative; width: 1640px; height: 1000px; }
.wbd-head { position: absolute; margin: 0; font: 700 26px var(--k-text); white-space: nowrap; }
.wbd-note { position: absolute; width: 105px; height: 100px; padding: 8px; box-shadow: 0 4px 8px rgba(0,0,0,.18); cursor: grab; user-select: none; display: flex; flex-direction: column; justify-content: space-between; transition: box-shadow .15s; } .wbd-note:active { cursor: grabbing; box-shadow: 0 12px 20px rgba(0,0,0,.25); z-index: 3; }
.wbd-note b { font: 700 13px/1.2 var(--k-text); color: #222; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; } .wbd-note em { font: 11px var(--k-text); font-style: normal; color: #555; } .wbd-note i { position: absolute; right: 4px; top: 2px; font-style: normal; font-size: 12px; } .wbd-note.on { outline: 3px solid #1565C0; }
.wbd-more { position: absolute; font: 14px var(--k-text); color: #888; }
.wbd-ink { position: absolute; left: 0; top: 0; pointer-events: none; } .wbd-ink path { fill: none; stroke: #C62828; stroke-width: 3; stroke-linecap: round; opacity: .6; }
.wbd-open { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; background: rgba(253,253,251,.75); backdrop-filter: blur(3px); animation: k-fade .2s both; }
.wbd-big { width: 380px; padding: 18px; box-shadow: 0 20px 40px rgba(0,0,0,.25); transform: rotate(-1.5deg); animation: k-rise .3s var(--k-out) both; } .wbd-big img { width: 100%; } .wbd-big h3 { margin: 10px 0 4px; font: 700 22px var(--k-text); } .wbd-big p { margin: 0 0 12px; font: 14px var(--k-text); color: #444; }
.wbd-go { width: 100%; height: 44px; border-radius: 8px; background: #222 !important; color: #fff !important; font: 700 15px var(--k-text) !important; margin-bottom: 6px; } .wbd-act button { color: #222 !important; font-family: var(--k-text) !important; } .wbd-act button:hover { background: rgba(0,0,0,.08) !important; }
`;

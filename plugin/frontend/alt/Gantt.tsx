// GANTT — a project planner. Each collection is a project, each game a task whose bar runs from the day it joined
// your library to your last session (a diamond if you've never played it). Zoom by months or years; today is a line.
import { useMemo, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const DAY = 86400;

export function Gantt() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [zoom, setZoom] = useState<'month' | 'year'>('year');
	const rows = b.games.filter((g) => g.added).slice(0, 150);
	const now = Date.now() / 1000;
	const start = useMemo(() => { const m = Math.min(now - 365 * DAY, ...rows.map((g) => g.added)); const d = new Date(m * 1000); return new Date(d.getFullYear(), 0, 1).getTime() / 1000; }, [rows]);
	const px = zoom === 'year' ? 260 / (365 * DAY) : 120 / (30 * DAY);
	const X = (t: number) => (t - start) * px;
	const width = X(now) + 200;
	const ticks: { x: number; l: string }[] = [];
	for (let d = new Date(start * 1000); d.getTime() / 1000 < now + 30 * DAY; d = zoom === 'year' ? new Date(d.getFullYear() + 1, 0, 1) : new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push({ x: X(d.getTime() / 1000), l: zoom === 'year' ? String(d.getFullYear()) : d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) });
	const pct = (g: Game) => Math.min(100, Math.round((g.minutes / 1200) * 100));
	return (
		<AltPage className="gnt" brand={<><span className="gnt-logo">▤</span>Gantt</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Filter tasks">
			<div className="gnt-app">
				<div className="gnt-bar"><select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select><span>{rows.length} tasks</span>
					<div className="gnt-seg"><button className={zoom === 'month' ? 'on' : ''} onClick={() => setZoom('month')}>Months</button><button className={zoom === 'year' ? 'on' : ''} onClick={() => setZoom('year')}>Years</button></div></div>
				<div className="gnt-body">
					<div className="gnt-grid" style={{ ['--w' as string]: width + 'px' }}>
						<div className="gnt-hrow"><div className="gnt-tn">Task</div><div className="gnt-tc">Progress</div><div className="gnt-time">{ticks.map((t) => <span key={t.x} style={{ left: t.x }}>{t.l}</span>)}</div></div>
						{rows.map((g) => { const a = X(g.added), e = g.lastPlayed > g.added ? X(g.lastPlayed) : a; return (
							<div key={g.appid} className={'gnt-row' + (sel?.appid === g.appid ? ' on' : '')}>
								<button data-appid={g.appid} className="gnt-tn" onClick={() => select(g.appid)}>{g.name}</button>
								<div className="gnt-tc"><i style={{ width: pct(g) + '%' }} /><span>{pct(g)}%</span></div>
								<div className="gnt-time">
									{ticks.map((t) => <b key={t.x} style={{ left: t.x }} />)}
									{e - a > 3 ? <button className={'gnt-task' + (g.minutes2w ? ' live' : '')} style={{ left: a, width: e - a }} onClick={() => select(g.appid)}><i style={{ width: pct(g) + '%' }} /><span>{g.name}</span></button>
										: <button className="gnt-ms" style={{ left: a - 7 }} onClick={() => select(g.appid)} title={g.name} />}
								</div>
							</div>); })}
						<div className="gnt-today" style={{ left: `calc(400px + ${X(now)}px)` }}><span>Today</span></div>
					</div>
				</div>
				{sel && <aside className="gnt-drawer" key={sel.appid}><button className="gnt-x" onClick={() => select(null)}>✕</button><em>Task</em><h3>{sel.name}</h3>
					<dl><dt>Start</dt><dd>{dateOf(sel.added)}</dd><dt>Last update</dt><dd>{dateOf(sel.lastPlayed)}</dd><dt>Effort</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Progress</dt><dd>{pct(sel)}% of 20 h</dd><dt>Status</dt><dd>{sel.minutes2w ? 'In progress' : sel.minutes ? 'On hold' : 'Not started'}</dd></dl>
					<PlayBtn g={sel} className="gnt-go" label={['Work on it (Play)', 'Install']} /><Actions g={sel} /></aside>}
			</div>
		</AltPage>
	);
}

export const ganttCss = tok('gantt', { bg: '#FFFFFF', s1: '#F7F8FA', s2: '#EEF0F3', s3: '#DFE2E7', fg: '#1D2433', fg2: '#4A5366', fg3: '#8B93A3', acc: '#2F80ED', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.gnt-brand { display: flex; gap: 8px; align-items: center; font: 700 17px var(--k-text); color: #1D2433; } .gnt-logo { color: #2F80ED; font-size: 18px; }
.gnt-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 46px minmax(0, 1fr); font: 13px var(--k-text); color: #1D2433; }
.gnt-bar { grid-column: 1 / -1; display: flex; gap: 14px; align-items: center; padding: 0 16px; border-bottom: 1px solid #E5E8ED; } .gnt-bar select { height: 30px; border: 1px solid #DFE2E7; border-radius: 6px; padding: 0 8px; font: 13px var(--k-text); } .gnt-bar > span { color: #8B93A3; }
.gnt-seg { margin-left: auto; display: flex; padding: 2px; border-radius: 8px; background: #EEF0F3; } .gnt-seg button { padding: 5px 12px; border-radius: 6px; font: 600 12px var(--k-text); color: #4A5366; } .gnt-seg button.on { background: #fff; color: #1D2433; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.gnt-body { overflow: auto; }
.gnt-grid { position: relative; width: calc(400px + var(--w)); }
.gnt-hrow, .gnt-row { display: grid; grid-template-columns: 280px 120px var(--w); height: 34px; }
.gnt-hrow { position: sticky; top: 0; z-index: 3; height: 32px; background: #F7F8FA; border-bottom: 1px solid #E5E8ED; font: 600 12px var(--k-text); color: #4A5366; }
.gnt-tn, .gnt-tc { position: sticky; z-index: 2; display: flex; align-items: center; padding: 0 12px; background: #fff; border-right: 1px solid #E5E8ED; } .gnt-hrow .gnt-tn, .gnt-hrow .gnt-tc { background: #F7F8FA; } .gnt-tn { left: 0; } .gnt-tc { left: 280px; gap: 6px; }
button.gnt-tn { text-align: left; font: 13px var(--k-text); color: #1D2433; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; line-height: 34px; } .gnt-row.on .gnt-tn, .gnt-row.on .gnt-tc { background: #EAF2FD; }
.gnt-tc i { display: block; height: 6px; border-radius: 3px; background: #2F80ED; max-width: 60px; } .gnt-tc span { font-size: 11px; color: #8B93A3; } .gnt-row .gnt-tc::before { content: ""; position: absolute; left: 12px; width: 60px; height: 6px; border-radius: 3px; background: #EEF0F3; } .gnt-row .gnt-tc i { position: relative; flex: none; } .gnt-row .gnt-tc span { margin-left: auto; }
.gnt-row { border-bottom: 1px solid #F1F3F6; } .gnt-time { position: relative; } .gnt-hrow .gnt-time span { position: absolute; top: 0; height: 32px; padding: 8px 6px; border-left: 1px solid #DFE2E7; white-space: nowrap; }
.gnt-time > b { position: absolute; top: 0; bottom: 0; border-left: 1px solid #F1F3F6; }
.gnt-task { position: absolute; top: 7px; height: 20px; min-width: 6px; border-radius: 5px; background: #BFD7F8; overflow: hidden; text-align: left; } .gnt-task i { position: absolute; left: 0; top: 0; bottom: 0; background: #2F80ED; } .gnt-task.live { background: #C9EBD7; } .gnt-task.live i { background: #27AE60; }
.gnt-task span { position: relative; padding: 0 6px; font: 600 11px/20px var(--k-text); color: #fff; white-space: nowrap; text-shadow: 0 1px 1px rgba(0,0,0,.3); } .gnt-task:hover { filter: brightness(.95); }
.gnt-ms { position: absolute; top: 10px; width: 14px; height: 14px; background: #F2994A; transform: rotate(45deg); border-radius: 2px; }
.gnt-today { position: absolute; top: 0; bottom: 0; width: 2px; background: #EB5757; z-index: 1; } .gnt-today span { position: sticky; top: 4px; margin-left: 4px; padding: 1px 6px; border-radius: 4px; background: #EB5757; color: #fff; font: 600 11px var(--k-text); }
.gnt-drawer { position: relative; width: 320px; overflow-y: auto; padding: 18px; border-left: 1px solid #E5E8ED; background: #F7F8FA; animation: k-fade .2s both; } .gnt-drawer em { font: 600 11px var(--k-text); font-style: normal; text-transform: uppercase; color: #8B93A3; } .gnt-drawer h3 { margin: 4px 0 14px; font: 700 18px var(--k-text); }
.gnt-x { position: absolute; right: 14px; top: 14px; color: #8B93A3; } .gnt-drawer dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 0 0 14px; } .gnt-drawer dt { color: #8B93A3; } .gnt-drawer dd { margin: 0; }
.gnt-go { width: 100%; height: 38px; border-radius: 8px; background: #2F80ED !important; color: #fff !important; font: 600 14px var(--k-text) !important; margin-bottom: 8px; }
`;

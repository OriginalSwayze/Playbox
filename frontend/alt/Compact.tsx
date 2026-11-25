// COMPACT — a dense launcher for big libraries. One sortable table (name, status, hours, last played, fortnight, size,
// score), filters for installed / played / updates, collection tabs and a details pane. Up/down move, Enter plays,
// Tab opens the pane; click a header to sort, again to reverse.
import { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Logo, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

type Col = 'name' | 'status' | 'minutes' | 'lastPlayed' | 'minutes2w' | 'sizeOnDisk' | 'metacritic';
const COLS: [Col, string][] = [['name', 'Name'], ['status', 'Status'], ['minutes', 'Hours'], ['lastPlayed', 'Last played'], ['minutes2w', '2 weeks'], ['sizeOnDisk', 'Size'], ['metacritic', 'Score']];
type Filter = 'all' | 'installed' | 'played' | 'unplayed' | 'updates';

export function Compact() {
	const b = useBrowse('all');
	const running = useKestrel((s) => s.running);
	const [sel, select] = useSelectedGame();
	const [sort, setSort] = useState<[Col, 1 | -1]>(['lastPlayed', -1]);
	const [filter, setFilter] = useState<Filter>('all');
	const [pane, setPane] = useState(true);
	const rows = useMemo(() => {
		const keep = (g: Game) => (filter === 'installed' ? g.installed : filter === 'played' ? g.minutes > 0 : filter === 'unplayed' ? g.minutes === 0 : filter === 'updates' ? g.needsUpdate || g.busy : true);
		const [k, d] = sort;
		const val = (g: Game) => (k === 'name' ? g.sortName : k === 'status' ? (g.installed ? 0 : 1) : g[k]);
		return b.games.filter(keep).sort((x, y) => { const a = val(x), z = val(y); return (typeof a === 'string' ? a.localeCompare(z as string) : (a as number) - (z as number)) * d; });
	}, [b.games, sort, filter]);
	const c = useCursor(rows.length);
	const body = useRef<HTMLDivElement>(null);
	useKeepInView(body, '.on', c.i, c.keyMoved);
	const g = sel ?? rows[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); } else if (k === 'next') { c.move(20); select(null); } else if (k === 'prev') { c.move(-20); select(null); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu') setPane((p) => !p); else if (k === 'back' && sel) select(null); else return false;
	});
	const sortBy = (col: Col) => setSort(([k, d]) => (k === col ? [k, (d * -1) as 1 | -1] : [col, col === 'name' || col === 'status' ? 1 : -1]));
	const n = (f: Filter) => b.games.filter((g) => (f === 'installed' ? g.installed : f === 'played' ? g.minutes > 0 : f === 'unplayed' ? g.minutes === 0 : f === 'updates' ? g.needsUpdate || g.busy : true)).length;
	return (
		<AltPage className="pb-cmp" brand={<>▤ Compact</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className={'pb-cmp-app' + (pane ? ' pane' : '')}>
				<div className="pb-cmp-bar">
					<select value={b.cur} onChange={(e) => { b.setCur(e.target.value); c.to(0); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.games.length})</option>)}</select>
					{(['all', 'installed', 'played', 'unplayed', 'updates'] as Filter[]).map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => { setFilter(f); c.to(0); }}>{f[0].toUpperCase() + f.slice(1)}<small>{n(f)}</small></button>)}
					<span className="pb-cmp-sp" /><span className="pb-cmp-cnt">{rows.length} games · {Math.round(rows.reduce((a, x) => a + x.minutes, 0) / 60).toLocaleString()} h · {formatBytes(rows.reduce((a, x) => a + (x.installed ? x.sizeOnDisk : 0), 0))}</span>
					<button className={pane ? 'on' : ''} onClick={() => setPane(!pane)} title="Details pane (Tab)"><Icon name="menu" size={15} /></button>
				</div>
				<div className="pb-cmp-table">
					<div className="pb-cmp-head">{COLS.map(([k, l]) => <button key={k} className={'c-' + k + (sort[0] === k ? ' on' : '')} onClick={() => sortBy(k)}>{l}{sort[0] === k ? (sort[1] > 0 ? ' ▲' : ' ▼') : ''}</button>)}</div>
					<div className="pb-cmp-body" ref={body}>{rows.slice(0, 1500).map((x, i) => (
						<button key={x.appid} data-appid={x.appid} className={'pb-cmp-row' + (i === c.i ? ' on' : '') + (x.installed ? '' : ' off')} onClick={() => { c.to(i); select(null); }} onDoubleClick={() => gameCommands(x)[0].run()}>
							<span className="c-name">{x.icon ? <img src={x.icon} alt="" /> : <i />}<b>{x.name}</b></span>
							<span className="c-status">{running.includes(x.appid) ? <em className="run">Running</em> : x.busy ? <em className="busy">{x.status} {Math.round(x.progress)}%</em> : x.needsUpdate ? <em className="upd">Update</em> : x.installed ? <em className="ok">Installed</em> : <em>—</em>}</span>
							<span className="c-minutes">{x.minutes ? (x.minutes / 60).toFixed(1) : ''}</span>
							<span className="c-lastPlayed">{x.lastPlayed ? formatAgo(x.lastPlayed) : ''}</span>
							<span className="c-minutes2w">{x.minutes2w ? formatPlaytime(x.minutes2w) : ''}</span>
							<span className="c-sizeOnDisk">{x.installed ? formatBytes(x.sizeOnDisk) : ''}</span>
							<span className="c-metacritic">{x.metacritic || ''}</span>
						</button>
					))}{!rows.length && <p className="lk-empty">No games match.</p>}</div>
				</div>
				{pane && g && (
					<aside className="pb-cmp-pane" key={g.appid}>
						<div className="pb-cmp-art"><Art g={g} kind="hero" /><Logo g={g} className="pb-cmp-logo" /></div>
						<div className="pb-cmp-pbody"><h3>{g.name}</h3><p>{status}</p><PlayBtn g={g} className="pb-cmp-play"><Icon name={g.installed ? 'play' : 'install'} size={16} /></PlayBtn>
							<dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={g} className="pb-cmp-act" /></div>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const compactCss = tok('compact', { bg: '#15171A', s1: '#1C1F23', s2: '#24282D', s3: '#2E3339', fg: '#E6E8EB', fg2: '#AEB4BC', fg3: '#737A84', acc: '#5B9CFF', on: '#fff', top: '#101214', font: '"Segoe UI", "Segoe UI Variable Text", sans-serif' }) + `
.pb-cmp-brand { font: 600 15px var(--k-text); color: #E6E8EB; }
.pb-cmp-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); background: #15171A; color: #E6E8EB; font: 13px var(--k-text); } .pb-cmp-app.pane { grid-template-columns: minmax(0, 1fr) 320px; }
.pb-cmp-bar { grid-column: 1 / -1; display: flex; align-items: center; gap: 4px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,.06); background: #1A1D20; }
.pb-cmp-bar select { height: 28px; margin-right: 8px; padding: 0 8px; border-radius: 6px; border: 0; background: #24282D; color: #E6E8EB; font: 13px var(--k-text); }
.pb-cmp-bar > button { display: flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 6px; color: #AEB4BC; font: 600 12.5px var(--k-text); } .pb-cmp-bar > button small { font-weight: 400; color: #737A84; } .pb-cmp-bar > button:hover { background: #24282D; } .pb-cmp-bar > button.on { background: #2E3339; color: #fff; }
.pb-cmp-sp { flex: 1; } .pb-cmp-cnt { margin-right: 8px; color: #737A84; font-size: 12px; }
.pb-cmp-table { display: grid; grid-template-rows: auto minmax(0, 1fr); min-width: 0; min-height: 0; }
.pb-cmp-head, .pb-cmp-row { display: grid; grid-template-columns: minmax(200px, 1fr) 130px 70px 120px 80px 80px 56px; gap: 0 12px; padding: 0 14px; align-items: center; }
.pb-cmp-head { height: 32px; border-bottom: 1px solid rgba(255,255,255,.08); } .pb-cmp-head button { text-align: left; font: 600 11.5px var(--k-text); letter-spacing: .04em; text-transform: uppercase; color: #737A84; } .pb-cmp-head button:hover, .pb-cmp-head button.on { color: #E6E8EB; }
.pb-cmp-head .c-minutes, .pb-cmp-head .c-minutes2w, .pb-cmp-head .c-sizeOnDisk, .pb-cmp-head .c-metacritic, .pb-cmp-row .c-minutes, .pb-cmp-row .c-minutes2w, .pb-cmp-row .c-sizeOnDisk, .pb-cmp-row .c-metacritic { text-align: right; }
.pb-cmp-body { overflow-y: auto; scrollbar-width: thin; } .pb-cmp-row { width: 100%; height: 30px; text-align: left; color: #AEB4BC; } .pb-cmp-row:nth-child(even) { background: rgba(255,255,255,.015); } .pb-cmp-row:hover { background: #1F2327; }
.pb-cmp-row.on { background: rgba(91,156,255,.16); color: #fff; box-shadow: inset 2px 0 0 #5B9CFF; } .pb-cmp-row.off .c-name b { color: #737A84; }
.pb-cmp-row span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; } .c-name { display: flex; align-items: center; gap: 8px; } .c-name img, .c-name i { flex: none; width: 16px; height: 16px; border-radius: 3px; background: #2E3339; } .c-name b { font-weight: 500; color: #E6E8EB; overflow: hidden; text-overflow: ellipsis; }
.c-status em { font-style: normal; font-size: 12px; } .c-status .ok { color: #7FB77E; } .c-status .run { color: #5B9CFF; font-weight: 600; } .c-status .busy { color: #E0B050; } .c-status .upd { color: #E07A50; }
.pb-cmp-pane { grid-row: 2; overflow-y: auto; border-left: 1px solid rgba(255,255,255,.06); background: #1A1D20; }
.pb-cmp-art { position: relative; height: 150px; } .pb-cmp-art img:first-child, .pb-cmp-art .alt-noart { width: 100%; height: 100%; object-fit: cover; } .pb-cmp-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, #1A1D20, transparent 60%); }
.pb-cmp-logo { position: absolute; left: 14px; bottom: 8px; z-index: 1; height: 54px; max-width: 75%; } .pb-cmp-logo img { height: 100%; } .pb-cmp-logo.lk-logotext { height: auto; font-size: 18px; }
.pb-cmp-pbody { padding: 10px 14px 20px; } .pb-cmp-pbody h3 { margin: 0; font: 600 16px var(--k-text); } .pb-cmp-pbody > p { margin: 2px 0 10px; color: #737A84; }
.pb-cmp-play { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 34px; border-radius: 6px; background: #5B9CFF !important; color: #fff !important; font: 600 13.5px var(--k-text) !important; } .pb-cmp-play:hover { background: #6FAAFF !important; }
.pb-cmp-pbody dl { margin: 12px 0; } .pb-cmp-pbody dl div { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,.05); } .pb-cmp-pbody dt { color: #737A84; } .pb-cmp-pbody dd { margin: 0; }
.pb-cmp-act button { height: 30px; font-size: 12.5px !important; }
`;

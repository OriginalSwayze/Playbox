// LEDGER — the library as a spreadsheet. One row per game, real columns (hours, last played, added, size, score),
// sheet tabs for collections, sortable headers, a formula bar, arrow-key cell navigation and a live SUM/AVERAGE
// status bar for the selected column. Enter or double-click opens the row's record pane with Play.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as KeyEvt } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';
import { useKestrel } from '../state/store';

type ColDef = { key: string; label: string; w: number; num?: boolean; get: (g: Game) => number | string; show: (g: Game) => string; fn: string };
const date = (u: number) => (u ? new Date(u * 1000).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '');
const COLS: ColDef[] = [
	{ key: 'name', label: 'Game', w: 320, get: (g) => g.sortName, show: (g) => g.name, fn: 'NAME' },
	{ key: 'inst', label: 'Installed', w: 92, get: (g) => (g.installed ? 1 : 0), show: (g) => (g.installed ? 'TRUE' : 'FALSE'), fn: 'INSTALLED' },
	{ key: 'hours', label: 'Hours', w: 92, num: true, get: (g) => g.minutes / 60, show: (g) => (g.minutes / 60).toFixed(1), fn: 'HOURS' },
	{ key: 'h2w', label: 'Hours (2 wk)', w: 108, num: true, get: (g) => g.minutes2w / 60, show: (g) => (g.minutes2w ? (g.minutes2w / 60).toFixed(1) : ''), fn: 'HOURS2W' },
	{ key: 'last', label: 'Last played', w: 116, num: true, get: (g) => g.lastPlayed, show: (g) => date(g.lastPlayed), fn: 'LASTPLAYED' },
	{ key: 'added', label: 'Added', w: 116, num: true, get: (g) => g.added, show: (g) => date(g.added), fn: 'ADDED' },
	{ key: 'size', label: 'Size (GB)', w: 96, num: true, get: (g) => g.sizeOnDisk / 1073741824, show: (g) => (g.sizeOnDisk ? (g.sizeOnDisk / 1073741824).toFixed(2) : ''), fn: 'SIZEGB' },
	{ key: 'score', label: 'Metascore', w: 96, num: true, get: (g) => g.metacritic, show: (g) => (g.metacritic ? String(g.metacritic) : ''), fn: 'METASCORE' },
	{ key: 'appid', label: 'App ID', w: 96, num: true, get: (g) => g.appid, show: (g) => String(g.appid), fn: 'APPID' },
];
const letter = (i: number) => String.fromCharCode(65 + i);
const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

function Record({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<aside className="lg-rec">
			<header><b>Record · {g.name}</b><button onClick={close} aria-label="Close">×</button></header>
			<div className="lg-rec-art"><Art g={g} kind="header" /></div>
			<h2>{g.name}</h2>
			<button className="lg-run" onClick={go.run}>{g.installed ? '▶ Play' : '⤓ Install'}</button>
			<table className="lg-kv"><tbody>
				<tr><th>Playtime</th><td>{formatPlaytime(g.minutes)}</td></tr>
				<tr><th>Last played</th><td>{g.lastPlayed ? formatAgo(g.lastPlayed) : '—'}</td></tr>
				<tr><th>Achievements</th><td>{d.achievements.total ? `${d.achievements.achieved} / ${d.achievements.total}` : '—'}</td></tr>
				<tr><th>Disk</th><td>{formatBytes(d.disk || g.sizeOnDisk) || '—'}</td></tr>
				<tr><th>Developer</th><td>{d.developer || '—'}</td></tr>
				<tr><th>Publisher</th><td>{d.publisher || '—'}</td></tr>
				<tr><th>Cloud</th><td>{d.cloud || '—'}</td></tr>
			</tbody></table>
			<Actions g={g} className="lg-actions" />
		</aside>
	);
}

export function Ledger() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [sheet, setSheet] = useState('all');
	const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'last', dir: -1 });
	const [cell, setCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const gridRef = useRef<HTMLDivElement>(null);
	const base = found ?? (sheet === 'all' ? library : islands.find((i) => i.id === sheet)?.games ?? library);
	const col = COLS.find((c) => c.key === sort.key) ?? COLS[0];
	const rows = useMemo(() => [...base].sort((a, b) => {
		const x = col.get(a), y = col.get(b);
		return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
	}), [base, sort]);
	const r = Math.min(cell.r, Math.max(0, rows.length - 1));
	const cur = rows[r];
	const cc = COLS[cell.c];
	const stats = useMemo(() => {
		if (!cc.num) return { count: rows.length };
		const vals = rows.map((g) => cc.get(g) as number).filter((v) => v > 0);
		if (cc.key === 'last' || cc.key === 'added' || cc.key === 'appid') return { count: vals.length };
		const sum = vals.reduce((s, v) => s + v, 0);
		return { count: vals.length, sum, avg: vals.length ? sum / vals.length : 0, max: Math.max(0, ...vals) };
	}, [rows, cc]);
	useEffect(() => { setCell({ r: 0, c: cell.c }); gridRef.current?.scrollTo({ top: 0 }); }, [sheet, q, sort]);
	const move = (dr: number, dc: number) => {
		const nr = Math.max(0, Math.min(rows.length - 1, r + dr));
		const nc = Math.max(0, Math.min(COLS.length - 1, cell.c + dc));
		setCell({ r: nr, c: nc });
		gridRef.current?.querySelector(`[data-r="${nr}"]`)?.scrollIntoView({ block: 'nearest' });
	};
	const onKey = (e: KeyEvt) => {
		e.stopPropagation(); // keep Steam's hidden library from acting on keys typed into the sheet
		const k: Record<string, [number, number]> = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], Tab: [0, e.shiftKey ? -1 : 1], PageDown: [20, 0], PageUp: [-20, 0] };
		if (k[e.key]) { e.preventDefault(); move(...k[e.key]); }
		else if (e.key === 'Home') { e.preventDefault(); move(-rows.length, 0); }
		else if (e.key === 'End') { e.preventDefault(); move(rows.length, 0); }
		else if (e.key === 'Enter' && cur) { e.preventDefault(); select(cur.appid); }
		else if (e.key === 'Escape') select(null);
	};
	const sortBy = (key: string) => setSort(sort.key === key ? { key, dir: (sort.dir * -1) as 1 | -1 } : { key, dir: key === 'name' ? 1 : -1 });
	const formula = cur ? (cc.key === 'name' ? cur.name : `=${cc.fn}(${cur.appid})`) : '';
	const value = cur ? cc.show(cur) : '';
	const tmpl = `46px ${COLS.map((c) => c.w + 'px').join(' ')}`;
	return (
		<AltPage className="lg" brand={<><i className="lg-logo">L</i>Ledger <span>— library.xlsx</span></>} search={q} onSearch={setQ} searchPlaceholder="Find in sheet">
			<div className={'lg-app' + (sel ? ' has-rec' : '')}>
				<div className="lg-ribbon">
					<span>Home</span><span>Insert</span><span>Data</span><span>View</span>
					<i />
					<button onClick={() => sortBy(cc.key)}>Sort {cc.label} {sort.key === cc.key ? (sort.dir > 0 ? '↓ Z→A' : '↑ A→Z') : 'A→Z'}</button>
					<button disabled={!cur} onClick={() => cur && select(cur.appid)}>Open record</button>
					<button disabled={!cur} onClick={() => cur && gameCommands(cur)[0].run()}>{cur?.installed === false ? 'Install row' : 'Play row'}</button>
				</div>
				<div className="lg-fx">
					<span className="lg-name">{letter(cell.c)}{r + 2}</span>
					<i>fx</i>
					<span className="lg-formula">{formula}{formula !== value && value ? <em>  → {value}</em> : null}</span>
				</div>
				<div className="lg-grid" ref={gridRef} tabIndex={0} onKeyDown={onKey}>
					<div className="lg-row lg-colhead" style={{ gridTemplateColumns: tmpl }}>
						<span className="lg-corner" />
						{COLS.map((c, i) => <span key={c.key} className={i === cell.c ? 'on' : ''}>{letter(i)}</span>)}
					</div>
					<div className="lg-row lg-head" style={{ gridTemplateColumns: tmpl }}>
						<span className="lg-rn">1</span>
						{COLS.map((c, i) => <button key={c.key} className={(c.num ? 'num ' : '') + (i === cell.c ? 'on' : '')} onClick={() => sortBy(c.key)}>{c.label}{sort.key === c.key ? (sort.dir > 0 ? ' ▲' : ' ▼') : ''}</button>)}
					</div>
					{rows.map((g, ri) => (
						<div key={g.appid} data-r={ri} data-appid={g.appid} className={'lg-row' + (ri === r ? ' cur' : '')} style={{ gridTemplateColumns: tmpl }}>
							<span className="lg-rn">{ri + 2}</span>
							{COLS.map((c, ci) => (
								<span key={c.key} className={(c.num ? 'num ' : '') + (c.key === 'inst' ? (g.installed ? 'yes ' : 'no ') : '') + (ri === r && ci === cell.c ? 'sel' : '')}
									onMouseDown={() => setCell({ r: ri, c: ci })} onDoubleClick={() => select(g.appid)}>{c.show(g)}</span>
							))}
						</div>
					))}
				</div>
				<div className="lg-tabs">
					<button className={sheet === 'all' && !found ? 'on' : ''} onClick={() => { setSheet('all'); setQ(''); }}>Library</button>
					{islands.map((i) => <button key={i.id} className={sheet === i.id && !found ? 'on' : ''} onClick={() => { setSheet(i.id); setQ(''); }}>{i.name}</button>)}
				</div>
				<footer className="lg-status">
					<span>Ready</span><i />
					{'sum' in stats && stats.sum !== undefined ? <><span>Average: {fmt(stats.avg!)}</span><span>Count: {stats.count}</span><span>Sum: {fmt(stats.sum)}</span><span>Max: {fmt(stats.max!)}</span></> : <span>Count: {stats.count}</span>}
					<span>{rows.length} rows</span>
				</footer>
				{sel && <Record key={sel.appid} g={sel} close={() => { select(null); gridRef.current?.focus(); }} />}
			</div>
		</AltPage>
	);
}

export const ledgerCss = `
html.kestrel[data-ui="ledger"] { --k-ink: #F3F3F3; --k-s1: #FFFFFF; --k-s2: #F3F3F3; --k-s3: #E6E6E6; --k-s4: #D0D0D0; --k-line: rgba(0,0,0,.1); --k-line-2: rgba(0,0,0,.2);
	--k-fg: #202020; --k-fg-2: #444; --k-fg-3: #777; --k-accent: #107C41; --k-accent-2: #21A366; --k-on-accent: #FFF; --k-a10: rgba(16,124,65,.08); --k-a20: rgba(16,124,65,.15); --k-a40: rgba(16,124,65,.35);
	--lg-cell: "Aptos", "Calibri", "Segoe UI", sans-serif; }
html.kestrel[data-ui="ledger"] .k-top { background: #107C41; border-bottom: 0; }
html.kestrel[data-ui="ledger"] .k-top { --k-fg: #FFFFFF; --k-fg-2: #E8F5EE; --k-fg-3: #CDEBDB; --k-s2: rgba(255,255,255,.14); }
html.kestrel[data-ui="ledger"] .lg-search { --k-fg: #202020; --k-fg-3: #555; }
html.kestrel[data-ui="ledger"] .lg-search { background: rgba(255,255,255,.92); }
.lg-brand { display: flex; align-items: center; gap: 9px; font: 600 15px var(--k-text); color: #fff; } .lg-brand span { font-weight: 400; color: #CDEBDB; }
.lg-logo { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 4px; background: #fff; color: #107C41; font: 900 14px var(--k-display); font-style: normal; }
.lg-stage { background: #F3F3F3; }
.lg-app { position: absolute; inset: 0; display: flex; flex-direction: column; font-family: var(--lg-cell); }
.lg-ribbon { flex: none; display: flex; align-items: center; gap: 4px; height: 42px; padding: 0 12px; background: #F3F3F3; border-bottom: 1px solid #D6D6D6; }
.lg-ribbon > span { padding: 6px 10px; font: 13px var(--k-text); color: #444; } .lg-ribbon > span:first-child { color: #107C41; font-weight: 700; box-shadow: inset 0 -2px #107C41; }
.lg-ribbon > i { flex: 1; }
.lg-ribbon button { height: 30px; padding: 0 12px; border-radius: 4px; font: 600 12.5px var(--k-text); color: #202020; background: #fff !important; box-shadow: inset 0 0 0 1px #D0D0D0; }
.lg-ribbon button:hover:not(:disabled) { box-shadow: inset 0 0 0 1px #107C41; color: #107C41; } .lg-ribbon button:disabled { opacity: .4; }
.lg-fx { flex: none; display: flex; align-items: center; height: 30px; background: #fff; border-bottom: 1px solid #D6D6D6; font: 13px var(--lg-cell); }
.lg-name { width: 86px; padding: 0 8px; border-right: 1px solid #D6D6D6; color: #202020; }
.lg-fx i { padding: 0 12px; font: italic 600 13px Cambria, serif; color: #777; border-right: 1px solid #D6D6D6; }
.lg-formula { flex: 1; padding: 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #202020; } .lg-formula em { font-style: normal; color: #107C41; }
.lg-grid { flex: 1; min-height: 0; overflow: auto; background: #fff; outline: none; transition: margin-right .3s var(--k-out); }
.lg-app.has-rec .lg-grid { margin-right: 360px; }
.lg-grid::-webkit-scrollbar { width: 14px; height: 14px; } .lg-grid::-webkit-scrollbar-thumb { background: #C8C8C8; border: 3px solid #F3F3F3; border-radius: 7px; } .lg-grid::-webkit-scrollbar-track, .lg-grid::-webkit-scrollbar-corner { background: #F3F3F3; }
.lg-row { display: grid; width: max-content; min-width: 100%; height: 24px; }
.lg-row > * { display: flex; align-items: center; padding: 0 6px; border-right: 1px solid #E1E1E1; border-bottom: 1px solid #E1E1E1; font: 13.5px var(--lg-cell); color: #202020; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: cell; }
.lg-row > .num { justify-content: flex-end; font-variant-numeric: tabular-nums; }
.lg-row > .no { color: #A4262C; } .lg-row > .yes { color: #107C41; }
.lg-rn, .lg-corner, .lg-colhead > span { position: sticky; left: 0; z-index: 1; justify-content: center; background: #F3F3F3 !important; color: #555 !important; font-size: 12px !important; cursor: default !important; }
.lg-colhead { position: sticky; top: 0; z-index: 3; } .lg-colhead > span { position: static; justify-content: center; }
.lg-colhead > .lg-corner { position: sticky; left: 0; z-index: 4; background: linear-gradient(135deg, transparent 55%, #BDBDBD 55% 70%, transparent 70%), #F3F3F3 !important; }
.lg-colhead > span.on { background: #D3F0E0 !important; color: #0B5A2F !important; box-shadow: inset 0 -2px #107C41; }
.lg-head { position: sticky; top: 24px; z-index: 2; }
.lg-head > button { justify-content: flex-start; background: #E8F3EC !important; font-weight: 700; color: #0B5A2F; cursor: pointer; } .lg-head > button.num { justify-content: flex-end; }
.lg-head > button:hover { background: #D3F0E0 !important; } .lg-head > .lg-rn { background: #F3F3F3 !important; }
.lg-row.cur > .lg-rn { background: #D3F0E0 !important; color: #0B5A2F !important; box-shadow: inset -2px 0 #107C41; }
.lg-row.cur > span:not(.lg-rn) { background: #F4FAF6; }
.lg-row > .sel { position: relative; box-shadow: inset 0 0 0 2px #107C41; background: #fff !important; }
.lg-row > .sel::after { content: ""; position: absolute; right: -3px; bottom: -3px; width: 6px; height: 6px; background: #107C41; border: 1px solid #fff; }
.lg-tabs { flex: none; display: flex; gap: 2px; height: 32px; padding: 0 10px; overflow-x: auto; background: #F3F3F3; border-top: 1px solid #D6D6D6; }
.lg-tabs::-webkit-scrollbar { height: 0; }
.lg-tabs button { flex: none; padding: 0 14px; font: 13px var(--k-text); color: #444; border-bottom: 3px solid transparent; }
.lg-tabs button:hover { background: #E6E6E6; } .lg-tabs button.on { background: #fff !important; color: #107C41; font-weight: 700; border-bottom-color: #107C41; }
.lg-status { flex: none; display: flex; align-items: center; gap: 22px; height: 26px; padding: 0 14px; background: #F3F3F3; border-top: 1px solid #E1E1E1; font: 12px var(--k-text); color: #444; }
.lg-status > i { flex: 1; }
.lg-rec { position: absolute; right: 0; top: 72px; bottom: 58px; width: 360px; overflow-y: auto; padding: 0 16px 16px; background: #fff; border-left: 1px solid #D6D6D6; box-shadow: -8px 0 20px -10px rgba(0,0,0,.25); animation: lg-in 300ms var(--k-out) both; z-index: 5; }
@keyframes lg-in { from { transform: translateX(100%); } }
.lg-rec header { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; height: 40px; margin: 0 -16px 12px; padding: 0 8px 0 16px; background: #107C41; color: #fff; font: 600 13px var(--k-text); }
.lg-rec header b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lg-rec header button { width: 30px; height: 30px; font: 20px/1 var(--k-text); color: #fff; border-radius: 4px; } .lg-rec header button:hover { background: rgba(255,255,255,.15); }
.lg-rec-art { aspect-ratio: 460 / 215; border-radius: 4px; overflow: hidden; } .lg-rec-art img, .lg-rec-art .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.lg-rec h2 { margin: 12px 0 10px; font: 600 19px/1.25 var(--k-display); color: #202020; }
.lg-run { height: 34px; padding: 0 16px; border-radius: 4px; background: #107C41 !important; color: #fff; font: 600 13.5px var(--k-text); } .lg-run:hover { background: #0B5A2F !important; }
.lg-kv { width: 100%; margin: 14px 0; border-collapse: collapse; font: 13px var(--lg-cell); }
.lg-kv th, .lg-kv td { padding: 5px 8px; border: 1px solid #E1E1E1; text-align: left; } .lg-kv th { width: 40%; background: #F7F7F7; font-weight: 600; color: #555; }
`;

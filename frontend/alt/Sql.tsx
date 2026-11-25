// SQL — a database console. A schema tree on the left (tables = collections), a query editor with a few runnable
// presets, and a results grid. Queries are parsed by a tiny interpreter (SELECT … FROM <table> [WHERE col op value]
// [ORDER BY col [DESC]] [LIMIT n]); double-click a row to open it, and PLAY() in the toolbar plays it.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, dateOf, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const COLS = ['appid', 'name', 'installed', 'hours', 'hours_2wk', 'last_played', 'added', 'metascore'] as const;
type Col = (typeof COLS)[number];
const val = (g: Game, c: Col): string | number | boolean => (c === 'appid' ? g.appid : c === 'name' ? g.name : c === 'installed' ? g.installed : c === 'hours' ? Math.round(g.minutes / 6) / 10 : c === 'hours_2wk' ? Math.round(g.minutes2w / 6) / 10 : c === 'last_played' ? g.lastPlayed : c === 'added' ? g.added : g.metacritic);
const show = (g: Game, c: Col) => { const v = val(g, c); return c === 'last_played' || c === 'added' ? (v ? dateOf(v as number) : 'NULL') : String(v); };
const tname = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '_');
const PRESETS = ['SELECT * FROM all_games ORDER BY hours DESC LIMIT 25', 'SELECT name, hours FROM all_games WHERE hours = 0 LIMIT 50', 'SELECT * FROM all_games WHERE installed = true ORDER BY last_played DESC', 'SELECT name, hours_2wk FROM all_games WHERE hours_2wk > 0 ORDER BY hours_2wk DESC'];

export function Sql() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [text, setText] = useState(PRESETS[0]);
	const [ran, setRan] = useState(PRESETS[0]);
	const tables = useMemo(() => new Map<string, Game[]>([['all_games', library], ...islands.map((i) => [tname(i.name), i.games] as [string, Game[]])]), [library, islands]);
	const result = useMemo(() => {
		const t0 = performance.now();
		const m = ran.trim().replace(/;$/, '').match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(\w+)\s*(=|!=|>|<|>=|<=|like)\s*('?[^']*'?|\S+))?(?:\s+order\s+by\s+(\w+)(\s+desc|\s+asc)?)?(?:\s+limit\s+(\d+))?$/i);
		if (!m) return { err: 'Syntax error. Try: SELECT * FROM all_games WHERE hours > 10 ORDER BY hours DESC LIMIT 20' };
		const [, cols, table, wc, op, wv, oc, dir, lim] = m;
		const rows0 = tables.get(table.toLowerCase()); if (!rows0) return { err: `Table "${table}" does not exist.` };
		const cs = (cols.trim() === '*' ? [...COLS] : cols.split(',').map((c) => c.trim().toLowerCase())) as Col[];
		const bad = [...cs, wc, oc].filter((c) => c && !COLS.includes(c.toLowerCase() as Col)); if (bad.length) return { err: `Unknown column "${bad[0]}".` };
		let rows = [...rows0];
		if (wc) { const c = wc.toLowerCase() as Col; let v: string | number | boolean = wv.replace(/^'|'$/g, ''); if (v === 'true' || v === 'false') v = v === 'true'; else if (!isNaN(Number(v))) v = Number(v);
			rows = rows.filter((g) => { const x = val(g, c); switch (op.toLowerCase()) { case '=': return x === v; case '!=': return x !== v; case '>': return x > v; case '<': return x < v; case '>=': return x >= v; case '<=': return x <= v; default: return String(x).toLowerCase().includes(String(v).replace(/%/g, '').toLowerCase()); } }); }
		if (oc) { const c = oc.toLowerCase() as Col; const d = /desc/i.test(dir ?? '') ? -1 : 1; rows.sort((a, b) => (val(a, c) > val(b, c) ? 1 : val(a, c) < val(b, c) ? -1 : 0) * d); }
		rows = rows.slice(0, Math.min(500, Number(lim ?? 200)));
		return { cs, rows, ms: (performance.now() - t0).toFixed(1) };
	}, [ran, tables]);
	return (
		<AltPage className="sql" brand={<>⛁ KestrelDB</>}>
			<div className="sql-app">
				<nav className="sql-tree"><h5>library.db</h5>{[...tables].map(([t, rows]) => <button key={t} onClick={() => { const q = `SELECT * FROM ${t} LIMIT 100`; setText(q); setRan(q); }}>▦ {t}<em>{rows.length}</em></button>)}<h5>Columns</h5>{COLS.map((c) => <p key={c}>· {c}</p>)}</nav>
				<section className="sql-main">
					<div className="sql-bar"><button className="sql-run" onClick={() => setRan(text)}>▶ Run</button>{PRESETS.map((p, i) => <button key={i} onClick={() => { setText(p); setRan(p); }}>Example {i + 1}</button>)}{sel && <PlayBtn g={sel} className="sql-play" label={[`PLAY(${sel.appid})`, `INSTALL(${sel.appid})`]} />}</div>
					<textarea className="sql-ed" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); setRan(text); } }} spellCheck={false} />
					{'err' in result ? <p className="sql-err">✖ {result.err}</p> : <>
						<p className="sql-ok">✔ {result.rows!.length} rows in {result.ms} ms · Ctrl+Enter runs · double-click a row to open it</p>
						<div className="sql-grid"><table><thead><tr><th>#</th>{result.cs!.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>
							{result.rows!.map((g, i) => <tr key={g.appid} data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)} onDoubleClick={() => select(g.appid)}><td>{i + 1}</td>{result.cs!.map((c) => <td key={c} className={typeof val(g, c) === 'number' ? 'n' : typeof val(g, c) === 'boolean' ? 'b' : ''}>{show(g, c)}</td>)}</tr>)}
						</tbody></table></div></>}
					{sel && <div className="sql-rec" key={sel.appid}><b>{sel.name}</b><Actions g={sel} className="sql-act" /></div>}
				</section>
			</div>
		</AltPage>
	);
}

export const sqlCss = tok('sql', { bg: '#1E1E1E', s1: '#252526', s2: '#2D2D30', s3: '#3E3E42', fg: '#D4D4D4', fg2: '#BBBBBB', fg3: '#858585', acc: '#0E639C', on: '#fff', top: '#181818', font: '"Segoe UI", system-ui, sans-serif' }) + `
.sql-brand { font: 600 14px var(--k-text); color: #D4D4D4; }
.sql-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr); font: 13px var(--k-text); color: #D4D4D4; }
.sql-tree { overflow-y: auto; padding: 10px 6px; background: #252526; border-right: 1px solid #3E3E42; } .sql-tree h5 { margin: 10px 8px 4px; font: 700 11px var(--k-text); text-transform: uppercase; color: #858585; }
.sql-tree button { display: flex; justify-content: space-between; width: 100%; padding: 3px 8px; font: 13px Consolas, monospace; color: #D4D4D4; text-align: left; white-space: nowrap; overflow: hidden; } .sql-tree button:hover { background: #2A2D2E; } .sql-tree em { font-style: normal; color: #858585; } .sql-tree p { margin: 2px 8px; font: 12px Consolas, monospace; color: #9CDCFE; }
.sql-main { display: grid; grid-template-rows: 40px 130px auto minmax(0, 1fr) auto; min-height: 0; }
.sql-bar { display: flex; gap: 6px; align-items: center; padding: 0 10px; background: #2D2D30; } .sql-bar button { height: 26px; padding: 0 10px; border-radius: 3px; background: #3E3E42; font: 12px var(--k-text); color: #D4D4D4; } .sql-run { background: #0E639C !important; color: #fff !important; }
.sql-play { margin-left: auto; height: 26px; padding: 0 12px; border-radius: 3px; background: #388A34 !important; color: #fff !important; font: 600 12px Consolas, monospace !important; }
.sql-ed { margin: 0; padding: 10px 14px; border: 0; border-bottom: 1px solid #3E3E42; outline: none; resize: none; background: #1E1E1E; color: #CE9178; font: 15px/1.5 Consolas, "Cascadia Mono", monospace; }
.sql-ok, .sql-err { margin: 0; padding: 6px 14px; font: 12px var(--k-text); background: #252526; } .sql-ok { color: #89D185; } .sql-err { color: #F48771; }
.sql-grid { overflow: auto; } .sql-grid table { border-collapse: collapse; font: 12.5px Consolas, monospace; white-space: nowrap; } .sql-grid th { position: sticky; top: 0; padding: 5px 12px; background: #2D2D30; text-align: left; color: #9CDCFE; border-right: 1px solid #3E3E42; }
.sql-grid td { padding: 3px 12px; border-right: 1px solid #2D2D30; border-bottom: 1px solid #2D2D30; max-width: 380px; overflow: hidden; text-overflow: ellipsis; } .sql-grid td:first-child { color: #858585; } .sql-grid td.n { color: #B5CEA8; text-align: right; } .sql-grid td.b { color: #569CD6; }
.sql-grid tr:hover td { background: #2A2D2E; } .sql-grid tr.on td { background: #094771; }
.sql-rec { display: flex; gap: 16px; align-items: center; padding: 6px 14px; background: #252526; border-top: 1px solid #3E3E42; } .sql-act { grid-auto-flow: column; } .sql-act button { color: #D4D4D4 !important; font-size: 12px !important; }
`;

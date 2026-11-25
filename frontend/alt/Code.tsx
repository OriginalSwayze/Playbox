// CODE — a code editor. The explorer is your library as a source tree (folders = collections, files = games),
// open files become tabs, each game is a syntax-highlighted JSON file, and ▶ Run in the title bar plays it.
import { useEffect, useState, type ReactNode } from 'react';
import { formatAgo, type Game } from '../steam/library';
import { AltPage, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { useKestrel } from '../state/store';

const slug = (g: Game) => g.name.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '').toLowerCase().slice(0, 40) + '.json';
function source(g: Game): ReactNode[] {
	const rows: [string, string | number | boolean][] = [['appid', g.appid], ['name', g.name], ['installed', g.installed], ['minutes', g.minutes], ['minutes2w', g.minutes2w],
		['lastPlayed', g.lastPlayed ? new Date(g.lastPlayed * 1000).toISOString() : 'never'], ['added', g.added ? new Date(g.added * 1000).toISOString() : 'unknown'], ['sizeOnDisk', g.sizeOnDisk], ['metacritic', g.metacritic], ['status', g.status || 'idle']];
	const v = (x: string | number | boolean) => typeof x === 'string' ? <span className="s">"{x}"</span> : typeof x === 'boolean' ? <span className="b">{String(x)}</span> : <span className="n">{x}</span>;
	return [<><span className="c">{`// ${g.name} — last played ${g.lastPlayed ? formatAgo(g.lastPlayed).toLowerCase() : 'never'}`}</span></>, <>{'{'}</>,
		...rows.map(([k, x], i) => <>{'  '}<span className="k">"{k}"</span>: {v(x)}{i < rows.length - 1 ? ',' : ''}</>), <>{'}'}</>];
}

export function Code() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const library = useKestrel((s) => s.library);
	const [open, setOpen] = useState<number[]>([]);
	const [shut, setShut] = useState<Record<string, boolean>>({});
	useEffect(() => { if (sel && !open.includes(sel.appid)) setOpen((o) => [...o.slice(-7), sel.appid]); }, [sel?.appid]);
	const tabs = open.map((id) => library.find((g) => g.appid === id)).filter(Boolean) as Game[];
	const lines = sel ? source(sel) : [];
	return (
		<AltPage className="ide" brand={<><span className="ide-logo">{'</>'}</span>kestrel — Code</>}>
			<div className="ide-app">
				<nav className="ide-bar">{['▤', '⌕', '⑂', '▶', '⧉'].map((c, i) => <span key={i} className={i === 0 ? 'on' : ''}>{c}</span>)}</nav>
				<aside className="ide-tree">
					<h5>Explorer</h5>
					<input className="ide-find" value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Search files by name" spellCheck={false} />
					{(b.found ? [{ id: 'q', name: 'search', games: b.found }] : b.islands).map((i) => (
						<div key={i.id}>
							<button className="ide-dir" onClick={() => setShut({ ...shut, [i.id]: !shut[i.id] })}>{shut[i.id] ? '›' : '⌄'} {i.name.toLowerCase().replace(/\s+/g, '-')}</button>
							{!shut[i.id] && i.games.slice(0, 80).map((g) => <button key={g.appid} data-appid={g.appid} className={'ide-file' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}><i className={g.installed ? 'y' : 'g'}>{'{}'}</i>{slug(g)}</button>)}
						</div>
					))}
				</aside>
				<section className="ide-ed">
					<div className="ide-tabs">
						{tabs.map((g) => <span key={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><i>{'{}'}</i>{slug(g)}<button onClick={(e) => { e.stopPropagation(); setOpen(open.filter((x) => x !== g.appid)); if (sel?.appid === g.appid) select(null); }}>×</button></span>)}
						{sel && <button className="ide-run" onClick={gameCommands(sel)[0].run}>{sel.installed ? '▶ Run' : '⬇ Install'}</button>}
					</div>
					{sel ? (
						<div className="ide-code" key={sel.appid}>
							<div className="ide-crumbs">kestrel › {b.isle?.name.toLowerCase() ?? 'library'} › {slug(sel)}</div>
							<pre>{lines.map((l, i) => <div key={i}><em>{i + 1}</em>{l}</div>)}</pre>
							<div className="ide-cmds">{gameCommands(sel).slice(1).map((c) => <button key={c.id} onClick={c.run}><span className="k">kestrel</span>.<span className="f">{c.id}</span>()  <span className="c">// {c.label}</span></button>)}</div>
						</div>
					) : <div className="ide-welcome"><h1>Kestrel Code</h1><p>Open a file from the explorer.</p><p><kbd>Ctrl</kbd> + <kbd>K</kbd> opens the command bar.</p></div>}
					<footer className="ide-status"><span>⑂ main</span><span>⊗ 0 ⚠ {library.filter((g) => g.needsUpdate).length}</span><span className="r">{sel ? `Ln ${lines.length}, Col 1 · UTF-8 · JSON` : 'Ready'}</span></footer>
				</section>
			</div>
		</AltPage>
	);
}

export const codeCss = tok('code', { bg: '#1E1F22', s1: '#2B2D30', s2: '#393B40', s3: '#43454A', fg: '#DFE1E5', fg2: '#BCBEC4', fg3: '#7E8085', acc: '#3D8EF2', on: '#fff', top: '#2B2D30', font: '"Segoe UI", system-ui, sans-serif' }) + `
.ide-brand { display: flex; gap: 9px; align-items: center; font: 600 13px var(--k-text); color: #DFE1E5; } .ide-logo { padding: 2px 6px; border-radius: 4px; background: #3D8EF2; color: #fff; font: 800 11px Consolas, monospace; }
.ide-app { position: absolute; inset: 0; display: grid; grid-template-columns: 48px 290px minmax(0, 1fr); font: 13px var(--k-text); color: #BCBEC4; }
.ide-bar { display: grid; align-content: start; gap: 6px; padding-top: 8px; background: #2B2D30; border-right: 1px solid #1E1F22; } .ide-bar span { display: grid; place-items: center; height: 40px; font-size: 18px; color: #7E8085; } .ide-bar .on { color: #fff; box-shadow: inset 2px 0 #3D8EF2; }
.ide-tree { overflow-y: auto; background: #2B2D30; padding-bottom: 20px; } .ide-tree h5 { margin: 0; padding: 10px 14px; font: 600 11px var(--k-text); letter-spacing: .06em; text-transform: uppercase; color: #7E8085; }
.ide-find { width: calc(100% - 20px); margin: 0 10px 8px; height: 26px; padding: 0 8px; border: 1px solid #43454A; border-radius: 4px; background: #1E1F22; color: #DFE1E5; font: 12px var(--k-text); outline: none; } .ide-find:focus { border-color: #3D8EF2; }
.ide-dir { display: block; width: 100%; padding: 3px 10px; text-align: left; font: 600 13px var(--k-text); color: #DFE1E5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ide-file { display: flex; gap: 6px; align-items: center; width: 100%; padding: 2px 10px 2px 28px; text-align: left; font: 13px var(--k-text); color: #BCBEC4; white-space: nowrap; overflow: hidden; } .ide-file:hover { background: #393B40; } .ide-file.on { background: #2E436E; color: #fff; }
.ide-file i, .ide-tabs i { font: 700 10px Consolas, monospace; font-style: normal; } i.y { color: #E8BF6A; } i.g { color: #7E8085; }
.ide-ed { display: grid; grid-template-rows: 36px minmax(0, 1fr) 24px; min-height: 0; background: #1E1F22; }
.ide-tabs { display: flex; align-items: stretch; background: #2B2D30; overflow-x: auto; } .ide-tabs > span { display: flex; gap: 6px; align-items: center; padding: 0 10px 0 12px; border-right: 1px solid #1E1F22; color: #9A9CA1; cursor: default; white-space: nowrap; }
.ide-tabs > span.on { background: #1E1F22; color: #fff; box-shadow: inset 0 -2px #3D8EF2; } .ide-tabs > span button { width: 18px; height: 18px; border-radius: 4px; color: #7E8085; } .ide-tabs > span button:hover { background: #43454A; color: #fff; }
.ide-run { margin: 5px 10px 5px auto; padding: 0 14px; border-radius: 4px; background: #57965C; color: #fff; font: 600 12px var(--k-text); } .ide-run:hover { background: #63A868; }
.ide-code { overflow: auto; animation: k-fade .2s both; } .ide-crumbs { padding: 6px 16px; font: 12px var(--k-text); color: #7E8085; border-bottom: 1px solid #2B2D30; }
.ide-code pre { margin: 0; padding: 10px 0; font: 14px/1.6 "JetBrains Mono", Consolas, monospace; color: #BCBEC4; } .ide-code pre div { white-space: pre; } .ide-code pre div:hover { background: #26282E; }
.ide-code em { display: inline-block; width: 56px; padding-right: 18px; text-align: right; font-style: normal; color: #4B5059; user-select: none; }
.ide-code .k { color: #C77DBB; } .ide-code .s { color: #6AAB73; } .ide-code .n { color: #2AACB8; } .ide-code .b { color: #CF8E6D; } .ide-code .c { color: #7A7E85; font-style: italic; } .ide-code .f { color: #56A8F5; }
.ide-cmds { display: grid; justify-items: start; padding: 14px 74px; gap: 2px; border-top: 1px dashed #393B40; } .ide-cmds button { font: 14px/1.6 "JetBrains Mono", Consolas, monospace; color: #BCBEC4; white-space: pre; } .ide-cmds button:hover { background: #2E436E; }
.ide-welcome { display: grid; place-content: center; text-align: center; color: #7E8085; } .ide-welcome h1 { margin: 0 0 10px; font: 300 40px var(--k-text); color: #BCBEC4; }
.ide-welcome kbd { padding: 2px 6px; border-radius: 4px; background: #393B40; color: #DFE1E5; font: 12px Consolas, monospace; }
.ide-status { display: flex; gap: 16px; align-items: center; padding: 0 10px; background: #3D8EF2; color: #fff; font: 12px var(--k-text); } .ide-status .r { margin-left: auto; }
`;

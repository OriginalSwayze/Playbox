// TELETEXT — a broadcast text service. P100 is the index, each collection gets a page (P101…), each game a page of
// its own (P200 onwards). Type a three-digit number to jump, or use the four coloured Fastext buttons.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, gameCommands, dateOf, useIslands, useSelectedGame } from './common';
import { tok } from './kit';
import { useKestrel } from '../state/store';

export function Teletext() {
	const islands = useIslands();
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const [page, setPage] = useState(100);
	const [entry, setEntry] = useState('');
	const games = useMemo(() => [...library].sort((a, b) => a.sortName.localeCompare(b.sortName)), [library]);
	const gp = (g: Game) => 200 + games.indexOf(g);
	const shown = sel ? gp(sel) : page;
	const go = (p: number) => { const g = games[p - 200]; if (p >= 200 && g) select(g.appid); else { select(null); setPage(p); } };
	const key = (d: string) => { const e = (entry + d).slice(-3); setEntry(e.length === 3 ? '' : e); if (e.length === 3) go(Number(e)); };
	const isl = page > 100 && page < 200 ? islands[page - 101] : null;
	const cmds = sel ? gameCommands(sel) : [];
	const now = new Date();
	const Row = ({ n, t, c = 'w' }: { n: number; t: string; c?: string }) => <button className={'ttx-row ' + c} data-appid={n >= 200 ? games[n - 200]?.appid : undefined} onClick={() => go(n)}><span>{t}</span><b>{n}</b></button>;
	return (
		<AltPage className="ttx" brand={<>KESTREL TEXT</>}>
			<div className="ttx-app">
				<div className="ttx-tv">
					<div className="ttx-screen">
						<div className="ttx-top"><span>P{entry.padEnd(3, '-')}</span><span>KESTREL</span><span>{now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}</span><span className="y">{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
						<div className="ttx-banner"><b>{sel ? 'GAME' : isl ? isl.name.toUpperCase().slice(0, 18) : 'LIBRARY'}</b><span>{shown}</span></div>
						<div className="ttx-body">
							{sel ? (<>
								<div className="ttx-title">{sel.name}</div>
								<p className="c">PLAYED.......{formatPlaytime(sel.minutes)}</p><p className="c">LAST.........{sel.lastPlayed ? formatAgo(sel.lastPlayed).toUpperCase() : 'NEVER'}</p><p className="c">ADDED........{dateOf(sel.added).toUpperCase()}</p><p className="c">STATUS.......{sel.installed ? 'INSTALLED' : 'NOT INSTALLED'}</p><p className="c">SCORE........{sel.metacritic || 'N/A'}</p>
								<div className="ttx-block" />
								{cmds.map((c, i) => <button key={c.id} className={'ttx-row ' + (i ? 'w' : 'g')} onClick={c.run}><span>{c.primary ? (sel.installed ? 'PLAY THIS GAME NOW' : 'INSTALL THIS GAME') : c.label.toUpperCase()}</span><b>{'>>>'}</b></button>)}
							</>) : isl ? (<>
								{isl.games.slice(0, 16).map((g) => <Row key={g.appid} n={gp(g)} t={g.name.slice(0, 30)} c={g.installed ? 'w' : 'c'} />)}
								{isl.games.length > 16 && <p className="y">{isl.games.length - 16} MORE: SEE INDEX PAGES</p>}
							</>) : (<>
								<p className="y">INDEX OF SECTIONS</p>
								{islands.slice(0, 14).map((i, k) => <Row key={i.id} n={101 + k} t={i.name.toUpperCase().slice(0, 28)} c={k % 2 ? 'c' : 'w'} />)}
								<p className="m">{library.length} GAMES ON PAGES 200-{199 + library.length}</p>
							</>)}
						</div>
						<div className="ttx-fast"><button className="r" onClick={() => go(100)}>Index</button><button className="g" onClick={() => go(Math.max(100, shown - 1))}>Prev</button><button className="yb" onClick={() => go(shown + 1)}>Next</button><button className="b" onClick={() => go(200 + Math.floor(Math.random() * Math.max(1, games.length)))}>Random</button></div>
					</div>
				</div>
				<div className="ttx-remote">{['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => <button key={d} onClick={() => key(d)}>{d}</button>)}<p>Type a page number</p></div>
			</div>
		</AltPage>
	);
}

export const teletextCss = tok('teletext', { bg: '#111111', s1: '#1C1C1C', s2: '#262626', s3: '#333', fg: '#FFFFFF', fg2: '#DDDDDD', fg3: '#999', acc: '#FFFF00', on: '#000', top: '#000000', font: '"Lucida Console", Consolas, monospace' }) + `
.ttx-brand { font: 700 15px var(--k-text); color: #FFFF00; letter-spacing: .1em; }
.ttx-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 150px; gap: 20px; align-items: center; padding: 20px 30px; background: radial-gradient(circle, #222, #000); }
.ttx-tv { justify-self: center; height: 100%; max-height: 760px; aspect-ratio: 4/3; padding: 26px; border-radius: 40px; background: linear-gradient(#3A3A3A, #1A1A1A); box-shadow: 0 30px 50px -20px #000, inset 0 2px 0 #555; }
.ttx-screen { position: relative; height: 100%; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; padding: 18px 22px; border-radius: 30px / 24px; background: #000; overflow: hidden; font: 700 clamp(14px, 2.2vh, 22px)/1.25 "Lucida Console", Consolas, monospace; color: #fff; box-shadow: inset 0 0 60px rgba(255,255,255,.08); }
.ttx-screen::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,.3) 2px 3px); pointer-events: none; }
.ttx-top { display: flex; justify-content: space-between; } .y { color: #FFFF00 !important; } .c { color: #00FFFF !important; } .m { color: #FF00FF !important; } .g { color: #00FF00 !important; } .w { color: #fff; }
.ttx-banner { display: flex; justify-content: space-between; align-items: center; margin: 6px 0 10px; padding: 4px 10px; background: #0000FF; } .ttx-banner b { font-size: 2em; line-height: 1.1; color: #FFFF00; transform: scaleY(1.4); transform-origin: left; letter-spacing: .04em; } .ttx-banner span { color: #fff; font-size: 1.4em; }
.ttx-body { overflow: hidden; } .ttx-body p { margin: 0; }
.ttx-row { display: flex; justify-content: space-between; width: 100%; padding: 0; font: inherit; text-align: left; } .ttx-row span { white-space: nowrap; overflow: hidden; } .ttx-row b { color: #FFFF00; padding-left: 12px; } .ttx-row:hover { background: #fff; color: #000 !important; } .ttx-row:hover b { color: #000; }
.ttx-title { margin-bottom: 8px; padding: 4px 8px; background: #FF0000; color: #fff; font-size: 1.3em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ttx-block { height: 1.2em; margin: 8px 0; background: repeating-linear-gradient(90deg, #00FF00 0 1ch, transparent 1ch 2ch); opacity: .8; }
.ttx-fast { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 8px; } .ttx-fast button { padding: 2px; font: inherit; text-align: center; } .ttx-fast .r { color: #FF0000; } .ttx-fast .g { color: #00FF00; } .ttx-fast .yb { color: #FFFF00; } .ttx-fast .b { color: #00FFFF; }
.ttx-remote { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 18px 14px; border-radius: 30px; background: linear-gradient(#333, #1A1A1A); box-shadow: 0 10px 20px #000; } .ttx-remote button { height: 36px; border-radius: 50%; background: #555; color: #fff; font: 700 14px var(--k-text); box-shadow: 0 2px 0 #111; } .ttx-remote button:last-of-type { grid-column: 2; }
.ttx-remote p { grid-column: 1 / -1; margin: 6px 0 0; font: 11px var(--k-text); color: #999; text-align: center; }
`;

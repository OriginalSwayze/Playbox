// WIKI — an encyclopedia of your library. The main page has a featured article and "Did you know…"; every game
// has an article with an infobox, contents, sections, "See also" from its collections, and category links.
import { useMemo } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useIslands, useLibraryLists, useSelectedGame, useBrowse } from './common';
import { tok } from './kit';

export function Wiki() {
	const b = useBrowse();
	const islands = useIslands();
	const library = useKestrel((s) => s.library);
	const { top, unplayed, recent } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const cats = useMemo(() => (sel ? islands.filter((i) => i.id !== 'recent' && i.games.some((g) => g.appid === sel.appid)) : []), [sel, islands]);
	const L = ({ g }: { g: Game }) => <button className="wik-a" data-appid={g.appid} onClick={() => select(g.appid)}>{g.name}</button>;
	const cmds = sel ? gameCommands(sel) : [];
	return (
		<AltPage className="wik" brand={<><span className="wik-orb">K</span><span><b>COMPENDIUM</b><em>Your library, written up</em></span></>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search Compendium">
			<div className="wik-app">
				<nav className="wik-nav">
					<button className="wik-a" onClick={() => select(null)}>Main page</button><button className="wik-a" onClick={() => top[0] && select(top[0].appid)}>Featured article</button>
					<button className="wik-a" onClick={() => { const r = library[Math.floor(Math.random() * library.length)]; r && select(r.appid); }}>Random article</button>
					<h5>Categories</h5>{islands.map((i) => <button key={i.id} className="wik-a" onClick={() => { b.setQ(''); b.setCur(i.id); select(null); }}>{i.name}</button>)}
				</nav>
				<article className="wik-page">
					{b.found && !sel ? (
						<><h1>Search results</h1><p className="wik-sub">{b.found.length} results for “{b.q.trim()}”</p><ul className="wik-res">{b.found.slice(0, 80).map((g) => <li key={g.appid}><L g={g} /><span> — {g.minutes ? formatPlaytime(g.minutes) + ' played' : 'not yet played'}</span></li>)}</ul></>
					) : sel ? (
						<div key={sel.appid}>
							<div className="wik-tabs"><span className="on">Article</span><span>Talk</span><span className="r">Read</span><span>View history</span></div>
							<h1>{sel.name}</h1><p className="wik-sub">From Compendium, your library written up</p>
							<table className="wik-box"><caption>{sel.name}</caption><tbody>
								<tr><td colSpan={2}><Art g={sel} kind="capsule" /></td></tr>
								<tr><th>App ID</th><td>{sel.appid}</td></tr><tr><th>Added</th><td>{dateOf(sel.added, { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
								<tr><th>Playtime</th><td>{formatPlaytime(sel.minutes)}</td></tr><tr><th>Last played</th><td>{sel.lastPlayed ? dateOf(sel.lastPlayed, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}</td></tr>
								<tr><th>Status</th><td>{sel.installed ? 'Installed' : 'Not installed'}{sel.status ? ` (${sel.status})` : ''}</td></tr><tr><th>Size</th><td>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</td></tr><tr><th>Metascore</th><td>{sel.metacritic || '—'}</td></tr>
							</tbody></table>
							<p><b>{sel.name}</b> is a game in the user's Steam library, {sel.installed ? 'currently installed on this computer' : 'not currently installed'}. {sel.minutes ? <>It has been played for {formatPlaytime(sel.minutes)}{sel.lastPlayed ? <>, most recently {formatAgo(sel.lastPlayed).toLowerCase()}</> : null}.</> : 'It has never been played.'}</p>
							<div className="wik-toc"><b>Contents</b><ol><li>History</li><li>Reception</li><li>Actions</li><li>See also</li></ol></div>
							<h2>History</h2><p>The game was added to the library {sel.added ? `on ${dateOf(sel.added, { day: 'numeric', month: 'long', year: 'numeric' })}` : 'at an unknown date'}.{sel.minutes2w ? ` In the past two weeks it was played for ${formatPlaytime(sel.minutes2w)}.` : ''}<sup>[1]</sup></p>
							<h2>Reception</h2><p>{sel.metacritic ? `The game holds a Metascore of ${sel.metacritic}.` : 'No aggregate critic score is recorded.'}<sup>[citation needed]</sup></p>
							<h2>Actions</h2><ul>{cmds.map((c) => <li key={c.id}><button className={'wik-a' + (c.primary ? ' strong' : '')} onClick={c.run}>{c.primary ? (sel.installed ? 'Play ' + sel.name : 'Install ' + sel.name) : c.label}</button></li>)}</ul>
							<h2>See also</h2><ul className="wik-cols">{(cats[0]?.games ?? recent).filter((g) => g.appid !== sel.appid).slice(0, 12).map((g) => <li key={g.appid}><L g={g} /></li>)}</ul>
							<div className="wik-cats">Categories: {cats.length ? cats.map((c) => <button key={c.id} className="wik-a" onClick={() => { b.setCur(c.id); select(null); }}>{c.name}</button>) : 'Uncategorised'}</div>
						</div>
					) : (
						<>
							<div className="wik-welcome"><h1>Welcome to Compendium,</h1><p>the encyclopedia of your library. {library.length} articles.</p></div>
							<div className="wik-main">
								<section><h3>From today's featured article</h3>{top[0] && <div className="wik-feat"><Art g={top[0]} kind="capsule" /><p><L g={top[0]} /> is the most played game in this library, with {formatPlaytime(top[0].minutes)} on record. It was last played {top[0].lastPlayed ? formatAgo(top[0].lastPlayed).toLowerCase() : 'never'}. (<button className="wik-a" onClick={() => select(top[0].appid)}>Full article…</button>)</p></div>}</section>
								<section><h3>Did you know…</h3><ul>{unplayed.slice(0, 5).map((g) => <li key={g.appid}>… that <L g={g} /> has never been played?</li>)}{recent.slice(0, 3).map((g) => <li key={g.appid}>… that <L g={g} /> was played {formatAgo(g.lastPlayed).toLowerCase()}?</li>)}</ul></section>
								<section className="wide"><h3>{b.isle?.name}</h3><ul className="wik-cols">{b.games.slice(0, 60).map((g) => <li key={g.appid}><L g={g} /></li>)}</ul></section>
							</div>
						</>
					)}
				</article>
			</div>
		</AltPage>
	);
}

export const wikiCss = tok('wiki', { bg: '#FFFFFF', s1: '#F8F9FA', s2: '#EAECF0', s3: '#C8CCD1', fg: '#202122', fg2: '#404244', fg3: '#72777D', acc: '#3366CC', on: '#fff', top: '#F8F9FA', font: 'Arial, "Segoe UI", sans-serif' }) + `
.wik-brand { display: flex; gap: 10px; align-items: center; color: #202122; } .wik-brand b { display: block; font: 400 17px Georgia, "Times New Roman", serif; letter-spacing: .04em; font-weight: 700; } .wik-brand em { display: block; font: italic 11px Georgia, serif; color: #54595D; }
.wik-orb { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #C8CCD1); box-shadow: inset 0 0 0 1px #A2A9B1; font: 700 16px Georgia, serif; color: #202122; }
.wik-app { position: absolute; inset: 0; display: grid; grid-template-columns: 200px minmax(0, 1fr); overflow-y: auto; font: 14px/1.6 Arial, sans-serif; color: #202122; }
.wik-nav { padding: 20px 14px; display: grid; align-content: start; gap: 2px; } .wik-nav h5 { margin: 14px 0 4px; padding-bottom: 2px; border-bottom: 1px solid #C8CCD1; font: 12px Arial, sans-serif; color: #54595D; }
.wik-a { color: #3366CC; font: inherit; text-align: left; padding: 0; } .wik-a:hover { text-decoration: underline; } .wik-a.strong { font-weight: 700; } .wik-nav .wik-a { font-size: 13px; }
.wik-page { min-width: 0; padding: 16px 40px 60px 28px; border-left: 1px solid #E0C48C; max-width: 1100px; }
.wik-tabs { display: flex; gap: 18px; border-bottom: 1px solid #A2A9B1; margin-bottom: 14px; font-size: 13px; color: #3366CC; } .wik-tabs span { padding: 6px 0; } .wik-tabs .on { color: #202122; box-shadow: inset 0 -2px #202122; } .wik-tabs .r { margin-left: auto; }
.wik-page h1 { margin: 0; padding-bottom: 4px; font: 400 30px Georgia, "Times New Roman", serif; border-bottom: 1px solid #A2A9B1; } .wik-sub { margin: 4px 0 14px; font-size: 13px; color: #54595D; }
.wik-page h2 { margin: 22px 0 6px; padding-bottom: 2px; font: 400 23px Georgia, serif; border-bottom: 1px solid #A2A9B1; } .wik-page sup { color: #3366CC; font-size: 11px; }
.wik-box { float: right; width: 290px; margin: 0 0 14px 20px; border: 1px solid #A2A9B1; background: #F8F9FA; border-collapse: collapse; font-size: 13px; } .wik-box caption { padding: 6px; font: 700 15px Arial, sans-serif; background: #FBE7BF; border: 1px solid #A2A9B1; border-bottom: 0; }
.wik-box td, .wik-box th { padding: 4px 8px; text-align: left; vertical-align: top; } .wik-box th { width: 40%; } .wik-box img { display: block; width: 180px; margin: 6px auto; }
.wik-toc { display: inline-block; padding: 8px 14px; border: 1px solid #A2A9B1; background: #F8F9FA; font-size: 13px; } .wik-toc ol { margin: 4px 0 0; padding-left: 22px; color: #3366CC; }
.wik-cols { columns: 3; padding-left: 18px; } .wik-res li { margin: 6px 0; } .wik-res span { color: #54595D; }
.wik-cats { clear: both; margin-top: 30px; padding: 8px 10px; border: 1px solid #A2A9B1; background: #F8F9FA; font-size: 13px; } .wik-cats .wik-a { margin: 0 8px; }
.wik-welcome { padding: 14px 20px; margin-bottom: 14px; border: 1px solid #C8CCD1; background: #F8F9FA; text-align: center; } .wik-welcome h1 { border: 0; } .wik-welcome p { margin: 0; }
.wik-main { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; } .wik-main section { border: 1px solid #E0C48C; padding: 0 12px 10px; background: #FFFBF2; } .wik-main section:nth-child(2) { border-color: #C7B3E0; background: #FBF7FF; } .wik-main .wide { grid-column: 1 / -1; border-color: #C8CCD1; background: #fff; }
.wik-main h3 { margin: 0 -12px 10px; padding: 4px 12px; font: 700 15px Arial, sans-serif; background: #FBE7BF; border-bottom: 1px solid #E0C48C; } .wik-main section:nth-child(2) h3 { background: #E8DCF7; border-color: #C7B3E0; } .wik-main .wide h3 { background: #EAECF0; border-color: #C8CCD1; }
.wik-feat img { float: left; width: 110px; margin: 0 12px 6px 0; }
`;

// BRUTALIST — raw web brutalism. Black borders, system fonts, no rounded corners, no images until you ask for them:
// a giant table of every game with blunt columns, blunt buttons and a blunt detail block. Toggle images if you must.
import { useState } from 'react';
import { formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Brutalist() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [img, setImg] = useState(false);
	return (
		<AltPage className="bru" brand={<>KESTREL.</>} search={b.q} onSearch={b.setQ} searchPlaceholder="TYPE">
			<div className="bru-app">
				<header className="bru-h"><h1>{b.found ? 'SEARCH' : (b.isle?.name ?? '').toUpperCase()}</h1><p>{b.games.length} GAMES. {b.games.filter((g) => g.installed).length} INSTALLED. {Math.round(b.games.reduce((n, g) => n + g.minutes, 0) / 60)} HOURS. THAT'S IT.</p>
					<div className="bru-nav">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}<button className="bru-img" onClick={() => setImg(!img)}>IMAGES: {img ? 'ON' : 'OFF'}</button></div></header>
				{sel && <section className="bru-sel" key={sel.appid}>{img && <Art g={sel} kind="header" />}<div><h2>{sel.name}</h2><p>APPID {sel.appid} / {formatPlaytime(sel.minutes).toUpperCase()} / LAST {dateOf(sel.lastPlayed).toUpperCase()} / {sel.installed ? 'INSTALLED' : 'NOT INSTALLED'}</p>
					<div className="bru-btns">{gameCommands(sel).map((c) => <button key={c.id} onClick={c.run}>{c.primary ? (sel.installed ? 'PLAY' : 'INSTALL') : c.label.toUpperCase()}</button>)}<button onClick={() => select(null)}>CLOSE</button></div></div></section>}
				<table className="bru-t"><thead><tr><th>#</th>{img && <th>IMG</th>}<th>NAME</th><th>HOURS</th><th>LAST</th><th>STATE</th><th /></tr></thead><tbody>
					{b.games.slice(0, 400).map((g, i) => <tr key={g.appid} className={sel?.appid === g.appid ? 'on' : ''}><td>{i + 1}</td>{img && <td className="bru-th"><Art g={g} kind="capsule" /></td>}<td><button data-appid={g.appid} onClick={() => select(g.appid)}>{g.name}</button></td><td>{Math.round(g.minutes / 60)}</td><td>{g.lastPlayed ? dateOf(g.lastPlayed, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}</td><td>{g.installed ? 'ON' : 'OFF'}</td><td><button className="bru-go" onClick={gameCommands(g)[0].run}>{g.installed ? 'PLAY →' : 'GET →'}</button></td></tr>)}
				</tbody></table>
			</div>
		</AltPage>
	);
}

export const brutalistCss = tok('brutalist', { bg: '#FFFFFF', s1: '#FFFFFF', s2: '#EEEEEE', s3: '#000000', fg: '#000000', fg2: '#000000', fg3: '#000000', acc: '#0000FF', on: '#fff', line: '#000', font: 'Arial, Helvetica, sans-serif' }) + `
html.kestrel[data-ui="brutalist"] .k-top { border-bottom: 4px solid #000; } html.kestrel[data-ui="brutalist"] .bru-search { border-radius: 0; box-shadow: inset 0 0 0 2px #000; background: #fff; }
.bru-brand { font: 900 28px Arial, sans-serif; letter-spacing: -.06em; color: #000; }
.bru-app { position: absolute; inset: 0; overflow-y: auto; background: #fff; color: #000; font: 15px Arial, sans-serif; }
.bru-h { padding: 18px 20px; border-bottom: 4px solid #000; } .bru-h h1 { margin: 0; font: 900 clamp(48px, 8vw, 120px)/.85 Arial, sans-serif; letter-spacing: -.06em; word-break: break-all; } .bru-h p { margin: 10px 0; font: 700 16px "Courier New", monospace; }
.bru-nav { display: flex; flex-wrap: wrap; gap: 0; } .bru-nav button { margin: 0 -2px -2px 0; padding: 6px 12px; border: 2px solid #000; background: #fff; font: 700 13px Arial, sans-serif; color: #000; } .bru-nav button.on, .bru-nav button:hover { background: #000; color: #fff; } .bru-img { background: #FFFF00 !important; color: #000 !important; }
.bru-sel { display: flex; gap: 20px; padding: 20px; border-bottom: 4px solid #000; background: #FFFF00; } .bru-sel img { width: 360px; border: 3px solid #000; } .bru-sel h2 { margin: 0 0 8px; font: 900 44px/1 Arial, sans-serif; letter-spacing: -.04em; } .bru-sel p { margin: 0 0 14px; font: 700 14px "Courier New", monospace; }
.bru-btns { display: flex; flex-wrap: wrap; } .bru-btns button { margin: 0 -3px -3px 0; padding: 10px 16px; border: 3px solid #000; background: #fff; font: 900 15px Arial, sans-serif; color: #000; } .bru-btns button:first-child { background: #0000FF; color: #fff; } .bru-btns button:hover { background: #000; color: #FFFF00; }
.bru-t { width: 100%; border-collapse: collapse; } .bru-t th, .bru-t td { padding: 6px 10px; border: 2px solid #000; text-align: left; } .bru-t th { background: #000; color: #fff; font: 900 13px Arial, sans-serif; }
.bru-t td button { font: 15px Arial, sans-serif; color: #0000FF; text-decoration: underline; text-align: left; } .bru-t td button:visited { color: #551A8B; } .bru-t tr:hover td { background: #EEEEEE; } .bru-t tr.on td { background: #FFFF00; }
.bru-t td .bru-go { color: #000; text-decoration: none; font-weight: 900; } .bru-th img { width: 30px; display: block; }
`;

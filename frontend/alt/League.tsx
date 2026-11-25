// LEAGUE — a sports league table. Each collection is a division; games are clubs ranked by points (hours played),
// with goals for (hours this fortnight), a form guide from how recently they played, and promotion and relegation
// zones. A club page is the match centre; Kick off plays it.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const pts = (g: Game) => Math.round(g.minutes / 60);
const form = (g: Game) => { const d = g.lastPlayed ? (Date.now() / 1000 - g.lastPlayed) / 86400 : 9999; return [d < 7, d < 30, d < 90, d < 365, g.minutes > 0].map((w, i) => (w ? 'W' : i === 4 ? 'L' : 'D')); };

export function League() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const table = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes || y.lastPlayed - x.lastPlayed).slice(0, 40), [b.games]);
	const n = table.length;
	const zone = (i: number) => (i < 4 ? 'cl' : i < 6 ? 'el' : i >= n - 3 && n > 8 ? 'rel' : '');
	return (
		<AltPage className="lgt" brand={<><span className="lgt-ball">⚽</span>Kestrel League</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Find a club">
			<div className="lgt-app">
				<nav className="lgt-divs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</nav>
				<div className="lgt-body">
					<section className="lgt-table">
						<h2>{b.found ? 'Search' : b.isle?.name} — Table</h2>
						<table><thead><tr><th>#</th><th className="l">Club</th><th title="Hours this fortnight">GF</th><th title="Metascore">RT</th><th>Form</th><th>Pts</th></tr></thead><tbody>
							{table.map((g, i) => <tr key={g.appid} data-appid={g.appid} className={zone(i) + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
								<td className="pos">{i + 1}</td><td className="l club"><Art g={g} kind="capsule" /><span>{g.name}</span></td><td>{Math.round(g.minutes2w / 60)}</td><td>{g.metacritic || '–'}</td>
								<td><span className="lgt-form">{form(g).map((f, k) => <i key={k} className={f}>{f}</i>)}</span></td><td className="p">{pts(g)}</td></tr>)}
						</tbody></table>
						<div className="lgt-key"><span><i className="cl" />Champions spot</span><span><i className="el" />Continental spot</span><span><i className="rel" />Relegation</span></div>
					</section>
					<aside className="lgt-side">
						{sel ? <div className="lgt-mc" key={sel.appid}>
							<div className="lgt-crest"><Art g={sel} kind="capsule" /></div><h3>{sel.name}</h3>
							<div className="lgt-stats"><div><b>{table.indexOf(sel) >= 0 ? table.indexOf(sel) + 1 : '–'}</b><em>Position</em></div><div><b>{pts(sel)}</b><em>Points</em></div><div><b>{Math.round(sel.minutes2w / 60)}</b><em>Goals (2 wk)</em></div></div>
							<p>{sel.lastPlayed ? `Last match ${formatAgo(sel.lastPlayed).toLowerCase()}` : 'Yet to play a match'} · {formatPlaytime(sel.minutes)} on the pitch</p>
							<PlayBtn g={sel} className="lgt-go" label={['Kick off (Play)', 'Join the league (Install)']} /><Actions g={sel} /></div>
							: <div className="lgt-fix"><h3>Next fixtures</h3>{table.slice(0, 10).map((g, i) => i % 2 === 0 && table[i + 1] ? <div key={g.appid} className="lgt-match"><button onClick={() => select(g.appid)}>{g.name}</button><b>vs</b><button onClick={() => select(table[i + 1].appid)}>{table[i + 1].name}</button></div> : null)}</div>}
					</aside>
				</div>
			</div>
		</AltPage>
	);
}

export const leagueCss = tok('league', { bg: '#F2F4F3', s1: '#FFFFFF', s2: '#E8ECEA', s3: '#D3DAD6', fg: '#14201A', fg2: '#3D4A43', fg3: '#74827A', acc: '#00843D', on: '#fff', top: '#0B2545', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.lgt-brand { display: flex; gap: 8px; align-items: center; font: 800 18px var(--k-text); color: #fff; }
.lgt-app { position: absolute; inset: 0; display: grid; grid-template-rows: 46px minmax(0, 1fr); }
.lgt-divs { display: flex; gap: 2px; padding: 0 20px; background: #13315C; overflow-x: auto; } .lgt-divs button { flex: none; padding: 0 16px; font: 700 13px var(--k-text); color: #C9D6EA; text-transform: uppercase; letter-spacing: .04em; } .lgt-divs button.on { color: #fff; box-shadow: inset 0 -4px #F2C14E; }
.lgt-body { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; padding: 20px; min-height: 0; }
.lgt-table { overflow-y: auto; padding: 18px; border-radius: 12px; background: #fff; } .lgt-table h2 { margin: 0 0 12px; font: 800 22px var(--k-text); color: #0B2545; }
.lgt-table table { width: 100%; border-collapse: collapse; font: 14px var(--k-text); } .lgt-table th { padding: 8px 6px; font: 700 12px var(--k-text); color: #74827A; text-align: center; border-bottom: 2px solid #E8ECEA; } .lgt-table .l { text-align: left; }
.lgt-table td { padding: 7px 6px; text-align: center; border-bottom: 1px solid #F0F2F1; } .lgt-table tr { cursor: pointer; } .lgt-table tbody tr:hover td { background: #F6F8F7; } .lgt-table tr.on td { background: #E6F4EC; }
.lgt-table .pos { width: 34px; font-weight: 700; box-shadow: inset 4px 0 transparent; } .lgt-table tr.cl .pos { box-shadow: inset 4px 0 #1F63D6; } .lgt-table tr.el .pos { box-shadow: inset 4px 0 #F28C28; } .lgt-table tr.rel .pos { box-shadow: inset 4px 0 #D63131; }
.lgt-table .club { display: flex; gap: 10px; align-items: center; font-weight: 600; } .lgt-table .club img, .lgt-table .club .alt-noart { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; font-size: 4px; } .lgt-table .club span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
.lgt-table .p { font-weight: 800; color: #0B2545; }
.lgt-form { display: inline-flex; gap: 3px; } .lgt-form i { width: 18px; height: 18px; border-radius: 50%; font: 700 10px/18px var(--k-text); font-style: normal; color: #fff; } .lgt-form .W { background: #13CF00; } .lgt-form .D { background: #A0A0A0; } .lgt-form .L { background: #D81920; }
.lgt-key { display: flex; gap: 20px; margin-top: 12px; font: 12px var(--k-text); color: #74827A; } .lgt-key i { display: inline-block; width: 10px; height: 10px; margin-right: 6px; border-radius: 2px; } i.cl { background: #1F63D6; } i.el { background: #F28C28; } i.rel { background: #D63131; }
.lgt-side { overflow-y: auto; padding: 18px; border-radius: 12px; background: linear-gradient(160deg, #0B2545, #081A33); color: #fff; }
.lgt-mc { display: grid; justify-items: center; text-align: center; animation: k-fade .25s both; } .lgt-crest { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 4px #F2C14E; } .lgt-crest img { width: 100%; height: 100%; object-fit: cover; }
.lgt-mc h3 { margin: 12px 0; font: 800 22px var(--k-text); } .lgt-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; } .lgt-stats div { padding: 10px 4px; border-radius: 10px; background: rgba(255,255,255,.08); } .lgt-stats b { display: block; font: 800 24px var(--k-text); color: #F2C14E; } .lgt-stats em { font: 11px var(--k-text); font-style: normal; opacity: .8; }
.lgt-mc p { font: 13px var(--k-text); opacity: .85; } .lgt-go { width: 100%; height: 46px; border-radius: 10px; background: #F2C14E !important; color: #081A33 !important; font: 800 15px var(--k-text) !important; margin-bottom: 8px; }
.lgt-mc .alt-actions { width: 100%; } .lgt-mc .alt-actions button { color: #DCE5F2 !important; } .lgt-mc .alt-actions button:hover { background: rgba(255,255,255,.08) !important; }
.lgt-fix h3 { margin: 0 0 12px; font: 800 18px var(--k-text); } .lgt-match { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.1); } .lgt-match button { font: 600 13px var(--k-text); color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .lgt-match button:last-child { text-align: right; } .lgt-match b { padding: 2px 8px; border-radius: 4px; background: #F2C14E; color: #081A33; font-size: 12px; }
`;

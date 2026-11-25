// PASSPORT — a travel passport. Flip through visa pages: every game you've played leaves an entry stamp (shape and ink
// vary), dated with your last visit; unplayed games are blank visa slots. The photo page is you; a stamp opens the
// visa with Travel (Play).
import { useState } from 'react';
import { useKestrel } from '../state/store';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

const INK = ['#B3261E', '#1F4E8C', '#2E7D32', '#6A1B9A', '#8D5524', '#00695C'];
const SHAPES = ['round', 'rect', 'oval', 'hex'];
const code = (g: Game) => (g.name.replace(/[^A-Za-z]/g, '').toUpperCase() + 'XXX').slice(0, 3);

export function Passport() {
	const library = useKestrel((s) => s.library);
	const { recent, unplayed } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [page, setPage] = useState(0);
	const stamps = [...recent, ...unplayed.slice(0, 40)];
	const per = 8, pages = Math.ceil(stamps.length / per) + 1;
	const spread = [page * 2 - 1, page * 2];
	const total = library.reduce((n, g) => n + g.minutes, 0);
	const Page = ({ n }: { n: number }) => {
		if (n < 0) return (
			<div className="pas-pg photo"><h4>KESTREL · PASSPORT</h4><div className="pas-id"><span className="pas-pic">☺</span><dl><dt>Surname</dt><dd>PLAYER</dd><dt>Nationality</dt><dd>STEAM</dd><dt>Countries visited</dt><dd>{recent.length}</dd><dt>Time abroad</dt><dd>{formatPlaytime(total)}</dd><dt>Date of issue</dt><dd>{dateOf(Math.min(...library.filter((g) => g.added).map((g) => g.added)))}</dd></dl></div>
				<p className="pas-mrz">P&lt;KSTPLAYER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />{String(library.length).padStart(9, '0')}KST{String(Math.round(total / 60)).padStart(7, '0')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p></div>);
		const items = stamps.slice(n * per, n * per + per);
		return (
			<div className="pas-pg"><span className="pas-num">{n + 2}</span><h5>VISAS · VISAS</h5>
				<div className="pas-stamps">{items.map((g, i) => g.minutes ? (
					<button key={g.appid} data-appid={g.appid} className={'pas-st ' + SHAPES[g.appid % 4] + (sel?.appid === g.appid ? ' on' : '')} style={{ ['--ink' as string]: INK[g.appid % 6], transform: `rotate(${(g.appid % 25) - 12}deg)` }} onClick={() => select(g.appid)}>
						<b>{code(g)}</b><span>{g.name.slice(0, 18)}</span><em>{g.lastPlayed ? dateOf(g.lastPlayed, { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase() : ''}</em><i>ENTRY ✈</i>
					</button>) : (
					<button key={g.appid} data-appid={g.appid} className="pas-blank" onClick={() => select(g.appid)}><span>{g.name}</span><em>visa pending</em></button>))}
					{!items.length && <p className="pas-empty">Blank page</p>}</div></div>);
	};
	return (
		<AltPage className="pas" brand={<>🛂 Passport</>}>
			<div className="pas-app">
				<div className="pas-book">
					<div className="pas-side" key={'l' + page}><Page n={spread[0]} /></div>
					<div className="pas-side r" key={'r' + page}><Page n={spread[1]} /></div>
				</div>
				<div className="pas-nav"><button disabled={page === 0} onClick={() => setPage(page - 1)}>‹ Previous</button><span>Pages {page * 2}–{page * 2 + 1} of {pages * 2}</span><button disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next ›</button></div>
				{sel && <aside className="pas-visa" key={sel.appid}><Art g={sel} kind="header" /><div><em>VISA · {code(sel)}</em><h3>{sel.name}</h3><p>{sel.minutes ? `Stayed ${formatPlaytime(sel.minutes)} · last entry ${dateOf(sel.lastPlayed)}` : 'Not yet visited'}</p><PlayBtn g={sel} className="pas-go" label={['Travel — Play', 'Apply — Install']} /><Actions g={sel} /><button className="pas-x" onClick={() => select(null)}>Close</button></div></aside>}
			</div>
		</AltPage>
	);
}

export const passportCss = tok('passport', { bg: '#1E2A44', s1: '#27375A', s2: '#30446E', s3: '#3B5285', fg: '#F3EEE2', fg2: '#D8CFBA', fg3: '#A69D88', acc: '#C9A44C', on: '#1E2A44', top: '#141D30', font: 'Georgia, "Times New Roman", serif' }) + `
.pas-brand { font: 700 17px Georgia, serif; color: #F3EEE2; }
.pas-app { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) 50px; justify-items: center; padding: 20px; background: radial-gradient(circle at 50% 40%, #30446E, #141D30 70%); }
.pas-book { display: grid; grid-template-columns: 1fr 1fr; width: min(1100px, 100%); height: 100%; max-height: 680px; border-radius: 12px; padding: 10px; background: #5B1A22; box-shadow: 0 30px 60px -20px #000; }
.pas-side { position: relative; overflow: hidden; border-radius: 6px 0 0 6px; background: repeating-linear-gradient(45deg, rgba(90,120,160,.06) 0 2px, transparent 2px 9px), radial-gradient(circle at 50% 50%, #F5EFDF, #E9E0C9); box-shadow: inset -14px 0 20px -14px rgba(0,0,0,.4); animation: k-fade .4s both; }
.pas-side.r { border-radius: 0 6px 6px 0; box-shadow: inset 14px 0 20px -14px rgba(0,0,0,.4); }
.pas-pg { position: absolute; inset: 0; padding: 22px 26px; color: #2A2A2A; } .pas-num { position: absolute; bottom: 10px; left: 50%; font: 12px Georgia, serif; color: #8A7F62; } .pas-pg h5 { margin: 0 0 12px; text-align: center; font: 11px Georgia, serif; letter-spacing: .4em; color: #8A7F62; }
.pas-pg.photo h4 { margin: 0 0 18px; font: 700 14px Georgia, serif; letter-spacing: .2em; color: #5B1A22; } .pas-id { display: flex; gap: 20px; } .pas-pic { display: grid; place-items: center; width: 120px; height: 150px; background: #D9D2C2; font-size: 70px; color: #8A7F62; box-shadow: inset 0 0 0 1px #B8AE96; }
.pas-id dl { display: grid; gap: 2px; margin: 0; font: 13px Georgia, serif; } .pas-id dt { font-size: 10px; color: #8A7F62; text-transform: uppercase; letter-spacing: .1em; } .pas-id dd { margin: 0 0 6px; font-weight: 700; }
.pas-mrz { position: absolute; left: 26px; right: 26px; bottom: 30px; margin: 0; font: 15px/1.5 "OCR B", Consolas, monospace; letter-spacing: .08em; color: #2A2A2A; word-break: break-all; }
.pas-stamps { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; justify-items: center; align-items: center; }
.pas-st { display: grid; justify-items: center; gap: 1px; width: 150px; padding: 10px 8px; border: 3px double var(--ink); color: var(--ink); opacity: .85; mix-blend-mode: multiply; font-family: "Courier New", monospace; transition: opacity .2s, transform .2s; }
.pas-st.round { border-radius: 50%; width: 130px; height: 130px; align-content: center; } .pas-st.oval { border-radius: 50%; } .pas-st.hex { clip-path: polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%); border-width: 0; box-shadow: inset 0 0 0 3px var(--ink); }
.pas-st b { font: 900 24px "Courier New", monospace; letter-spacing: .1em; } .pas-st span { font: 700 10px "Courier New", monospace; text-transform: uppercase; max-width: 120px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; } .pas-st em { font: 700 11px "Courier New", monospace; font-style: normal; } .pas-st i { font: 9px "Courier New", monospace; font-style: normal; letter-spacing: .2em; }
.pas-st:hover, .pas-st.on { opacity: 1; } .pas-st.on { outline: 2px dashed var(--ink); outline-offset: 4px; }
.pas-blank { display: grid; place-content: center; width: 150px; height: 90px; border: 1px dashed #B8AE96; color: #8A7F62; font: 11px Georgia, serif; text-align: center; } .pas-blank span { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pas-blank em { font-size: 10px; }
.pas-empty { grid-column: 1 / -1; color: #B8AE96; font-style: italic; }
.pas-nav { display: flex; gap: 20px; align-items: center; color: #D8CFBA; font: 14px Georgia, serif; } .pas-nav button { padding: 6px 14px; border-radius: 6px; background: #30446E; color: #F3EEE2; font: 14px Georgia, serif; } .pas-nav button:disabled { opacity: .4; }
.pas-visa { position: absolute; right: 26px; bottom: 80px; display: grid; grid-template-columns: 160px 1fr; gap: 14px; width: 520px; padding: 14px; border-radius: 10px; background: #F5EFDF; color: #2A2A2A; box-shadow: 0 20px 40px rgba(0,0,0,.5); animation: k-rise .3s var(--k-out) both; }
.pas-visa > img { width: 100%; border-radius: 4px; } .pas-visa em { font: 700 11px "Courier New", monospace; font-style: normal; letter-spacing: .2em; color: #B3261E; } .pas-visa h3 { margin: 2px 0 4px; font: 700 18px Georgia, serif; } .pas-visa p { margin: 0 0 10px; font: italic 13px Georgia, serif; color: #5A5038; }
.pas-go { width: 100%; height: 40px; border-radius: 8px; background: #5B1A22 !important; color: #F3EEE2 !important; font: 700 14px Georgia, serif !important; margin-bottom: 6px; } .pas-visa .alt-actions { grid-template-columns: 1fr 1fr; } .pas-visa .alt-actions button { color: #2A2A2A !important; font-size: 12px !important; } .pas-x { color: #5B1A22; font: italic 13px Georgia, serif; }
`;

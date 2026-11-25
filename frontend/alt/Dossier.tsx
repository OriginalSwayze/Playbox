// DOSSIER — a spy agency's case files. Collections are drawer tabs, games are manila folders; the open file has its
// photo clipped on, a CLASSIFIED stamp, redaction bars over what the agency does not know and a mission briefing.
// ACCEPT MISSION plays. Up/down walk the folders, left/right change drawer.
import { useRef } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { cycle, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const code = (g: Game) => ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIET', 'KILO', 'LIMA'][g.appid % 12] + '-' + String(g.appid % 1000).padStart(3, '0');
const R = ({ w = 80 }: { w?: number }) => <span className="pb-dos-red" style={{ width: w }} />;

export function Dossier() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 200);
	const c = useCursor(gs.length);
	const drawer = useRef<HTMLDivElement>(null);
	useKeepInView(drawer, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); } else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-dos" brand={<>■ AGENCY</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }} searchPlaceholder="Search the archive">
			<div className="pb-dos-app">
				<aside className="pb-dos-cab">
					<nav className="pb-dos-tabs">{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}>{i.name}</button>)}</nav>
					<div className="pb-dos-drawer" ref={drawer}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); select(null); }}><small>{code(x)}</small><span>{x.name}</span></button>
					))}</div>
				</aside>
				{g && (
					<section className="pb-dos-file" key={g.appid}>
						<div className="pb-dos-tab">FILE {code(g)}</div>
						<div className="pb-dos-paper">
							<i className="pb-dos-stamp">{g.minutes ? 'CLASSIFIED' : 'UNOPENED'}</i>
							<div className="pb-dos-photo"><i className="pb-dos-clip" /><Art g={g} kind="capsule" /></div>
							<div className="pb-dos-text">
								<p className="pb-dos-hd">SUBJECT</p><h1>{g.name}</h1>
								<table><tbody>
									<tr><th>CODENAME</th><td>{code(g)}</td></tr>
									<tr><th>STATUS</th><td>{status.toUpperCase()}</td></tr>
									<tr><th>TIME UNDER WATCH</th><td>{g.minutes ? formatPlaytime(g.minutes) : <R w={70} />}</td></tr>
									<tr><th>LAST CONTACT</th><td>{g.lastPlayed ? formatAgo(g.lastPlayed) : <R w={110} />}</td></tr>
									<tr><th>RECENT ACTIVITY</th><td>{g.minutes2w ? formatPlaytime(g.minutes2w) + ' / 14 days' : <R w={60} />}</td></tr>
									<tr><th>FOOTPRINT</th><td>{g.installed ? formatBytes(g.sizeOnDisk) || 'ON SITE' : 'NOT ON SITE'}</td></tr>
									<tr><th>ASSESSMENT</th><td>{g.metacritic ? g.metacritic + ' / 100' : <R w={50} />}</td></tr>
								</tbody></table>
								<p className="pb-dos-hd">BRIEFING</p>
								<p className="pb-dos-brief">Agent, your objective is to {g.minutes ? 'resume the operation' : 'make first contact'} with <b>{g.name}</b>. {g.installed ? 'All equipment is on site.' : 'Equipment must be requisitioned before deployment.'} The location is known only as <R w={90} />. This file will not self-destruct.</p>
								<div className="pb-dos-btns"><PlayBtn g={g} className="pb-dos-go" label={['ACCEPT MISSION', 'REQUISITION']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'CLOSE APPENDIX' : 'APPENDIX'}</button></div>
								{sel && <Actions g={sel} className="pb-dos-act" />}
							</div>
						</div>
					</section>
				)}
			</div>
		</AltPage>
	);
}

const tw = '"Courier New", Courier, monospace';
export const dossierCss = tok('dossier', { bg: '#23262A', s1: '#2E3236', s2: '#3A3F44', s3: '#474D53', fg: '#E9E4D8', fg2: '#BDB6A6', fg3: '#858072', acc: '#B3261E', on: '#fff', top: '#1A1C1F', font: tw }) + `
.pb-dos-brand { font: 700 15px ${tw}; letter-spacing: .3em; color: #E9E4D8; }
.pb-dos-app { position: absolute; inset: 0; display: grid; grid-template-columns: 340px minmax(0, 1fr); background: #23262A; color: #E9E4D8; }
.pb-dos-cab { display: flex; flex-direction: column; min-height: 0; padding: 14px 0 0 14px; background: linear-gradient(90deg, #3E4448, #33383C); box-shadow: inset -6px 0 12px rgba(0,0,0,.4); }
.pb-dos-tabs { display: flex; flex-wrap: wrap; gap: 4px; padding-right: 14px; margin-bottom: 10px; } .pb-dos-tabs button { padding: 5px 10px; border-radius: 3px 3px 0 0; background: #5A6066; font: 700 11px ${tw}; color: #E9E4D8; text-transform: uppercase; } .pb-dos-tabs button.on { background: #D8C9A3; color: #2A251C; }
.pb-dos-drawer { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 14px 30px 0; scrollbar-width: thin; }
.pb-dos-drawer button { display: block; width: 100%; margin-bottom: -8px; padding: 8px 12px 16px; text-align: left; border-radius: 6px 6px 0 0; background: linear-gradient(#D8C9A3, #CDBB90); box-shadow: 0 -2px 4px rgba(0,0,0,.3); color: #2A251C; transition: transform .15s; }
.pb-dos-drawer button:nth-child(even) { margin-left: 18px; width: calc(100% - 18px); } .pb-dos-drawer small { display: block; font: 700 10px ${tw}; color: #7A6A48; } .pb-dos-drawer span { display: block; font: 700 13px ${tw}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; }
.pb-dos-drawer button:hover { transform: translateX(6px); } .pb-dos-drawer button.on { transform: translateX(14px); background: linear-gradient(#EADDB8, #DCCA9E); position: relative; z-index: 1; box-shadow: 0 -2px 4px rgba(0,0,0,.3), 4px 0 0 #B3261E; }
.pb-dos-file { position: relative; min-height: 0; padding: 26px 40px 30px; overflow-y: auto; animation: pb-dos-slide .4s var(--k-out) both; } @keyframes pb-dos-slide { from { transform: translateX(-30px); opacity: 0; } }
.pb-dos-tab { display: inline-block; padding: 6px 18px 4px; border-radius: 8px 8px 0 0; background: #D8C9A3; font: 700 12px ${tw}; color: #2A251C; }
.pb-dos-paper { position: relative; display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 30px; padding: 30px; background: #D8C9A3; color: #2A251C; box-shadow: 0 20px 40px rgba(0,0,0,.5); }
.pb-dos-paper::before { content: ""; position: absolute; inset: 14px; background: #F1EBDC; box-shadow: 0 2px 6px rgba(0,0,0,.2); transform: rotate(-.4deg); } .pb-dos-paper > * { position: relative; }
.pb-dos-stamp { position: absolute; right: 40px; top: 30px; z-index: 2; padding: 6px 14px; font: 900 26px ${tw}; font-style: normal; letter-spacing: .1em; color: rgba(179,38,30,.8); border: 4px solid rgba(179,38,30,.8); transform: rotate(-12deg); mix-blend-mode: multiply; animation: pb-dos-stamp .35s .2s cubic-bezier(.2, 1.6, .5, 1) both; } @keyframes pb-dos-stamp { from { transform: rotate(-12deg) scale(2.2); opacity: 0; } }
.pb-dos-photo { align-self: start; padding: 10px 10px 30px; background: #fff; box-shadow: 0 6px 12px rgba(0,0,0,.25); transform: rotate(-3deg); margin-top: 10px; } .pb-dos-photo img, .pb-dos-photo .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; filter: grayscale(.85) contrast(1.15); }
.pb-dos-clip { position: absolute; left: 40%; top: -14px; width: 26px; height: 50px; border: 3px solid #8A8F94; border-radius: 13px; }
.pb-dos-text { padding: 10px 10px 10px 0; } .pb-dos-hd { margin: 0 0 4px; font: 700 11px ${tw}; letter-spacing: .3em; color: #7A6A48; } .pb-dos-text h1 { margin: 0 0 16px; font: 700 28px/1.15 ${tw}; text-transform: uppercase; }
.pb-dos-text table { width: 100%; margin-bottom: 18px; border-collapse: collapse; } .pb-dos-text th { width: 190px; padding: 5px 0; text-align: left; font: 700 12px ${tw}; color: #7A6A48; } .pb-dos-text td { padding: 5px 0; font: 700 14px ${tw}; border-bottom: 1px dashed rgba(42,37,28,.25); }
.pb-dos-red { display: inline-block; height: 14px; vertical-align: middle; background: #111; }
.pb-dos-brief { margin: 0 0 20px; font: 14.5px/1.7 ${tw}; }
.pb-dos-btns { display: flex; gap: 12px; } .pb-dos-go { height: 44px; padding: 0 24px; background: #2A251C !important; color: #F1EBDC !important; font: 700 14px ${tw} !important; letter-spacing: .14em; } .pb-dos-go:hover { background: #B3261E !important; }
.pb-dos-btns > button:last-child { padding: 0 18px; box-shadow: inset 0 0 0 2px #2A251C; font: 700 13px ${tw}; letter-spacing: .1em; color: #2A251C; }
.pb-dos-act { margin-top: 12px; } .pb-dos-act button { font-family: ${tw} !important; color: #2A251C !important; } .pb-dos-act button:hover { background: rgba(0,0,0,.06) !important; }
`;

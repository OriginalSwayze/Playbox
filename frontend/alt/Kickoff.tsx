// KICKOFF — a sports game's main menu. Bright angled tiles: Play Now resumes your last game, Career is your most
// played, Quick Match picks a random installed one, then a tile per collection; a news ticker runs along the bottom.
// Arrows move between tiles, Enter picks; a collection tile opens its squad list.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useIslands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, pickRandom, useKeys, useStatus } from './lk';

type Tile = { id: string; label: string; sub: string; g?: Game; run: () => void; big?: boolean };

export function Kickoff() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [squad, setSquad] = useState<string | null>(null);
	const [f, setF] = useState(0);
	const last = lists.recent[0], career = lists.top[0];
	const tiles: Tile[] = useMemo(() => [
		...(last ? [{ id: 'now', label: 'PLAY NOW', sub: last.name, g: last, run: () => gameCommands(last)[0].run(), big: true }] : []),
		...(career ? [{ id: 'career', label: 'CAREER', sub: `${career.name} · ${formatPlaytime(career.minutes)}`, g: career, run: () => select(career.appid) }] : []),
		{ id: 'quick', label: 'QUICK MATCH', sub: 'A random installed game', g: lists.installed[3] ?? lists.all[0], run: () => { const r = pickRandom(lists.all); if (r) select(r.appid); } },
		...islands.slice(0, 7).map((i) => ({ id: 'c-' + i.id, label: i.name.toUpperCase(), sub: `${i.games.length} in the squad`, g: [...i.games].sort((a, b) => b.lastPlayed - a.lastPlayed)[0], run: () => setSquad(i.id) })),
		{ id: 'all', label: 'ALL GAMES', sub: `${lists.all.length} in the club`, g: lists.top[1], run: () => setSquad('all') },
	], [lists, islands]);
	const squadList = squad === 'all' ? [...lists.all].sort((a, b) => a.sortName.localeCompare(b.sortName)) : islands.find((i) => i.id === squad)?.games ?? [];
	const status = useStatus(sel);
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (squad) { if (k === 'back') setSquad(null); else return false; return; }
		if (k === 'right') setF((x) => Math.min(tiles.length - 1, x + 1)); else if (k === 'left') setF((x) => Math.max(0, x - 1)); else if (k === 'down') setF((x) => Math.min(tiles.length - 1, x + 4)); else if (k === 'up') setF((x) => Math.max(0, x - 4));
		else if (k === 'enter') tiles[f]?.run(); else return false;
	});
	const news = lists.recent.slice(0, 8).map((g) => `${g.name.toUpperCase()} — ${formatPlaytime(g.minutes)} on the clock, last match ${formatAgo(g.lastPlayed).toLowerCase()}`);
	return (
		<AltPage className="pb-ko" brand={<>KICK<b>OFF</b></>}>
			<div className="pb-ko-app">
				{!squad ? (
					<div className="pb-ko-grid">{tiles.map((t, i) => (
						<button key={t.id} data-appid={t.g?.appid} className={'pb-ko-tile' + (t.big ? ' big' : '') + (i === f ? ' on' : '')} style={{ ['--i' as string]: i }} onMouseEnter={() => setF(i)} onClick={t.run}>
							{t.g && <Art g={t.g} kind={t.big ? 'hero' : 'header'} />}<span><b>{t.label}</b><em>{t.sub}</em></span>
						</button>
					))}</div>
				) : (
					<section className="pb-ko-squad">
						<header><button onClick={() => setSquad(null)}>◀ BACK</button><h2>{squad === 'all' ? 'ALL GAMES' : islands.find((i) => i.id === squad)?.name.toUpperCase()}</h2><span>{squadList.length} PLAYERS</span></header>
						<div className="pb-ko-players">{squadList.slice(0, 200).map((g, n) => (
							<button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><b>{n + 1}</b><Art g={g} kind="capsule" /><span><i>{g.name}</i><em>OVR {Math.min(99, 50 + Math.round(Math.sqrt(g.minutes)))}</em></span></button>
						))}</div>
					</section>
				)}
				<div className="pb-ko-ticker"><b>LATEST</b><div><p>{[...news, ...news].map((n, i) => <span key={i}>{n}</span>)}</p></div></div>
				{sel && (
					<div className="pb-ko-card" onMouseDown={(e) => e.target === e.currentTarget && select(null)}>
						<div key={sel.appid}><Art g={sel} kind="hero" className="pb-ko-chero" />
							<div className="pb-ko-cbody"><h2>{sel.name}</h2><p>{status} · OVR {Math.min(99, 50 + Math.round(Math.sqrt(sel.minutes)))}</p>
								<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
								<div className="pb-ko-row"><PlayBtn g={sel} className="pb-ko-play" label={['KICK OFF', 'SIGN (INSTALL)']} /><button onClick={() => select(null)}>BACK</button></div><Actions g={sel} className="pb-ko-act" /></div></div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

const f = '"Bahnschrift", "Arial Black", sans-serif';
export const kickoffCss = tok('kickoff', { bg: '#0A1A3A', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: '#D6E2FF', fg3: '#8AA0D0', acc: '#00E07A', on: '#00210F', top: '#06112A', font: f }) + `
.pb-ko-brand { font: 900 italic 22px ${f}; color: #fff; } .pb-ko-brand b { color: #00E07A; }
.pb-ko-app { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) 42px; overflow: hidden; background: linear-gradient(120deg, #0A1A3A 40%, #0E2D6A 70%, #0A1A3A), #0A1A3A; color: #fff; }
.pb-ko-app::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(120deg, transparent 0 80px, rgba(255,255,255,.025) 80px 160px); pointer-events: none; }
.pb-ko-grid { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(120px, 1fr); gap: 12px; padding: 22px 30px; min-height: 0; transform: skewX(-6deg); }
.pb-ko-tile { position: relative; overflow: hidden; background: #13306A; text-align: left; transition: transform .15s var(--k-out), box-shadow .15s; animation: pb-ko-in .4s var(--k-out) both; animation-delay: calc(var(--i) * .04s); } @keyframes pb-ko-in { from { opacity: 0; transform: translateX(-30px); } }
.pb-ko-tile.big { grid-column: span 2; grid-row: span 2; } .pb-ko-tile img, .pb-ko-tile .alt-noart { position: absolute; inset: -10%; width: 120%; height: 120%; object-fit: cover; transform: skewX(6deg); opacity: .75; transition: opacity .2s, transform .3s; }
.pb-ko-tile::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(6,17,42,.95), transparent 70%); } .pb-ko-tile span { position: absolute; left: 18px; right: 18px; bottom: 14px; z-index: 1; transform: skewX(6deg); }
.pb-ko-tile b { display: block; font: 900 italic 22px/1 ${f}; letter-spacing: .02em; } .pb-ko-tile.big b { font-size: 46px; } .pb-ko-tile em { display: block; margin-top: 4px; font: 600 13px ${f}; font-style: normal; color: #D6E2FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-ko-tile.on { box-shadow: inset 0 0 0 4px #00E07A, 0 0 30px rgba(0,224,122,.35); transform: scale(1.03); z-index: 1; } .pb-ko-tile.on img { opacity: 1; transform: skewX(6deg) scale(1.06); } .pb-ko-tile.on b { color: #00E07A; }
.pb-ko-squad { position: relative; display: grid; grid-template-rows: auto minmax(0, 1fr); min-height: 0; padding: 18px 30px 0; animation: k-fade .3s both; }
.pb-ko-squad header { display: flex; align-items: center; gap: 20px; margin-bottom: 14px; } .pb-ko-squad header button { padding: 8px 16px; background: rgba(255,255,255,.1); font: 800 13px ${f}; color: #fff; transform: skewX(-10deg); } .pb-ko-squad h2 { margin: 0; font: 900 italic 30px ${f}; } .pb-ko-squad header span { margin-left: auto; font: 700 13px ${f}; color: #8AA0D0; letter-spacing: .1em; }
.pb-ko-players { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; align-content: start; overflow-y: auto; padding-bottom: 20px; scrollbar-width: thin; }
.pb-ko-players button { position: relative; overflow: hidden; background: linear-gradient(#1E4A9A, #0E2D6A); text-align: left; clip-path: polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%); transition: transform .15s; } .pb-ko-players button:hover { transform: translateY(-4px); }
.pb-ko-players b { position: absolute; left: 8px; top: 6px; z-index: 1; font: 900 22px ${f}; color: #00E07A; text-shadow: 0 2px 6px #000; } .pb-ko-players img, .pb-ko-players .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
.pb-ko-players span { position: absolute; left: 0; right: 0; bottom: 0; padding: 30px 10px 18px; background: linear-gradient(transparent, rgba(6,17,42,.95)); } .pb-ko-players i { display: block; font: 800 12.5px ${f}; font-style: normal; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-ko-players em { font: 800 12px ${f}; font-style: normal; color: #00E07A; }
.pb-ko-ticker { position: relative; display: flex; align-items: center; overflow: hidden; background: #00E07A; color: #00210F; } .pb-ko-ticker > b { flex: none; height: 100%; display: grid; place-items: center; padding: 0 18px; background: #06112A; color: #00E07A; font: 900 italic 15px ${f}; }
.pb-ko-ticker div { flex: 1; overflow: hidden; } .pb-ko-ticker p { display: flex; gap: 60px; width: max-content; margin: 0; font: 800 14px ${f}; white-space: nowrap; animation: pb-ko-tick 60s linear infinite; } @keyframes pb-ko-tick { to { transform: translateX(-50%); } }
.pb-ko-card { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(6,17,42,.8); pointer-events: auto; animation: k-fade .2s both; }
.pb-ko-card > div { width: min(780px, 92%); overflow: hidden; background: #0E2D6A; box-shadow: inset 0 0 0 2px #00E07A, 0 30px 80px #000; animation: k-rise .3s var(--k-out) both; } .pb-ko-chero { width: 100%; height: 220px; object-fit: cover; display: block; }
.pb-ko-cbody { padding: 18px 24px 22px; } .pb-ko-cbody h2 { margin: 0; font: 900 italic 30px ${f}; text-transform: uppercase; } .pb-ko-cbody > p { margin: 2px 0 14px; font: 700 13px ${f}; color: #00E07A; letter-spacing: .1em; }
.pb-ko-cbody dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0 0 16px; } .pb-ko-cbody dt { font: 11px ${f}; color: #8AA0D0; text-transform: uppercase; letter-spacing: .1em; } .pb-ko-cbody dd { margin: 2px 0 0; font: 700 15px ${f}; }
.pb-ko-row { display: flex; gap: 10px; } .pb-ko-play { flex: 1; height: 50px; background: #00E07A !important; color: #00210F !important; font: 900 italic 20px ${f} !important; transform: skewX(-10deg); } .pb-ko-row > button:last-child { padding: 0 24px; background: rgba(255,255,255,.1); font: 800 14px ${f}; color: #fff; transform: skewX(-10deg); }
.pb-ko-act { margin-top: 12px; } .pb-ko-act button { font-family: ${f} !important; }
`;

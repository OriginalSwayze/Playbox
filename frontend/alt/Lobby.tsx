// LOBBY — a matchmaking lobby. Playlists are your collections, the squad standing on the stage is the playlist's top
// games, your online friends fill the party list, and FIND MATCH searches for a moment, then offers a random installed
// game from the playlist to ACCEPT (play) or DECLINE.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, facts, pickRandom, useKeys, useStatus } from './lk';

export function Lobby() {
	const b = useBrowse();
	const friends = useKestrel((s) => s.friends);
	const [sel, select] = useSelectedGame();
	const squad = [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 5);
	const [lead, setLead] = useState(0);
	const [search, setSearch] = useState<number | null>(null);
	const [match, setMatch] = useState<Game | null>(null);
	const g = sel ?? squad[Math.min(lead, squad.length - 1)];
	const status = useStatus(g);
	useEffect(() => {
		if (search === null) return;
		if (search >= 4) { setMatch(pickRandom(b.games)); setSearch(null); return; }
		const t = setTimeout(() => setSearch(search + 1), 700);
		return () => clearTimeout(t);
	}, [search]);
	const find = () => { setMatch(null); setSearch(0); };
	useKeys((k) => {
		if (match) { if (k === 'enter') { gameCommands(match)[0].run(); setMatch(null); } else if (k === 'back') setMatch(null); else return false; return; }
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (k === 'left') setLead((x) => Math.max(0, x - 1)); else if (k === 'right') setLead((x) => Math.min(squad.length - 1, x + 1));
		else if (k === 'enter' && g) select(g.appid); else if (k === 'menu') find(); else if (k === 'back' && search !== null) setSearch(null);
		else if (k === 'next' || k === 'prev') { const i = b.islands.findIndex((x) => x.id === b.cur); const n = b.islands[(i + (k === 'next' ? 1 : -1) + b.islands.length) % b.islands.length]; if (n) { b.setCur(n.id); setLead(0); } } else return false;
	});
	const online = friends.filter((f) => f.state !== 'offline').slice(0, 12);
	return (
		<AltPage className="pb-lob" brand={<>LOBBY</>} search={b.q} onSearch={(q) => { b.setQ(q); setLead(0); }}>
			<div className="pb-lob-app">
				<Backdrop g={g} className="pb-lob-bd" />
				<nav className="pb-lob-modes">{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); setLead(0); select(null); }}>{i.name}<small>{i.games.length} games</small></button>)}</nav>
				<section className="pb-lob-floor">{squad.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={'pb-lob-op' + (n === lead ? ' on' : '')} style={{ ['--i' as string]: n - (squad.length - 1) / 2 }} onMouseEnter={() => setLead(n)} onClick={() => select(x.appid)}>
						<Art g={x} kind="capsule" /><span className="pb-lob-tag"><b>{x.name}</b><em>LVL {Math.max(1, Math.round(x.minutes / 60))}</em></span>{n === 0 && <i className="pb-lob-crown">★ PARTY LEAD</i>}
					</button>
				))}{!squad.length && <p className="lk-empty">This playlist is empty.</p>}</section>
				<aside className="pb-lob-party"><h4>PARTY · {online.length} ONLINE</h4>{online.length ? online.map((f) => (
					<div key={f.id} className={'pb-lob-f ' + f.state}><img src={f.avatar} alt="" /><span><b>{f.name}</b><em>{f.state === 'ingame' ? f.game : f.state === 'away' ? 'Away' : 'In lobby'}</em></span></div>
				)) : <p>No friends online right now.</p>}</aside>
				{g && !sel && <div className="pb-lob-info" key={g.appid}><b>{g.name}</b><span>{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</span></div>}
				<div className="pb-lob-cta">
					{search !== null ? <button className="pb-lob-find searching" onClick={() => setSearch(null)}><span>SEARCHING{'.'.repeat(search % 4)}</span><small>0:0{search} · CANCEL</small></button>
						: <button className="pb-lob-find" onClick={find}><span>FIND MATCH</span><small>{b.isle?.name ?? 'Search'} · Y / TAB</small></button>}
				</div>
				{sel && (
					<div className="pb-lob-card" key={sel.appid}>
						<h2>{sel.name}</h2><p>{status}</p>
						<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
						<div className="pb-lob-row"><PlayBtn g={sel} className="pb-lob-play" label={['READY UP', 'INSTALL']} /><button onClick={() => select(null)}>BACK</button></div>
						<Actions g={sel} className="pb-lob-act" />
					</div>
				)}
				{match && (
					<div className="pb-lob-match">
						<div key={match.appid}><p>MATCH FOUND</p><Art g={match} kind="header" className="pb-lob-mimg" /><h2>{match.name}</h2>
							<div className="pb-lob-row"><button className="pb-lob-acc" onClick={() => { gameCommands(match)[0].run(); setMatch(null); }}>{match.installed ? 'ACCEPT' : 'INSTALL'}</button><button onClick={() => setMatch(null)}>DECLINE</button></div></div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

const f = '"Bahnschrift", "Segoe UI", sans-serif';
export const lobbyCss = tok('lobby', { bg: '#0B1020', s1: 'rgba(255,255,255,.08)', s2: 'rgba(255,255,255,.14)', s3: 'rgba(255,255,255,.22)', fg: '#FFFFFF', fg2: '#C5CCE0', fg3: '#7D87A6', acc: '#FFC531', on: '#1B1400', top: 'transparent', font: f }) + `
html.kestrel[data-ui="lobby"] .k-top { position: relative; z-index: 3; border: 0; background: linear-gradient(rgba(5,8,18,.8), transparent); }
.pb-lob-brand { font: 700 18px ${f}; letter-spacing: .3em; color: #FFC531; }
.pb-lob-app { position: absolute; inset: 0; overflow: hidden; color: #fff; background: #0B1020; }
.pb-lob-bd { opacity: .4; } .pb-lob-bd::after { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 50% at 45% 70%, rgba(255,197,49,.12), transparent 70%), linear-gradient(0deg, #0B1020 10%, rgba(11,16,32,.3) 60%, rgba(11,16,32,.8)); }
.pb-lob-modes { position: absolute; left: 30px; top: 12px; right: 330px; z-index: 2; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.pb-lob-modes button { flex: none; display: grid; justify-items: start; gap: 2px; min-width: 150px; padding: 10px 14px; text-align: left; background: rgba(0,0,0,.45); box-shadow: inset 0 -3px 0 rgba(255,255,255,.1); font: 700 15px ${f}; text-transform: uppercase; color: #C5CCE0; }
.pb-lob-modes small { font: 500 11px ${f}; letter-spacing: .1em; color: #7D87A6; } .pb-lob-modes button.on { background: rgba(255,197,49,.15); box-shadow: inset 0 -3px 0 #FFC531; color: #fff; } .pb-lob-modes button:hover { color: #fff; }
.pb-lob-floor { position: absolute; left: 0; right: 300px; top: 90px; bottom: 120px; display: flex; justify-content: center; align-items: flex-end; perspective: 1000px; }
.pb-lob-op { position: relative; width: 17%; max-width: 210px; margin: 0 -1%; transform: translateZ(calc(var(--i) * var(--i) * -40px)) translateY(calc(var(--i) * var(--i) * -6px)); transition: transform .3s var(--k-out), filter .3s; filter: brightness(.7); }
.pb-lob-op img, .pb-lob-op .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 6px; box-shadow: 0 20px 40px rgba(0,0,0,.6); }
.pb-lob-op::after { content: ""; position: absolute; left: 10%; right: 10%; bottom: -18px; height: 20px; border-radius: 50%; background: radial-gradient(rgba(255,197,49,.35), transparent 70%); }
.pb-lob-op.on { filter: none; transform: translateZ(60px) translateY(-10px); z-index: 2; } .pb-lob-op.on img { box-shadow: 0 0 0 3px #FFC531, 0 20px 50px rgba(0,0,0,.7); }
.pb-lob-tag { position: absolute; left: 6%; right: 6%; bottom: 8px; padding: 6px 8px; background: rgba(5,8,18,.85); text-align: left; } .pb-lob-tag b { display: block; font: 700 12px ${f}; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-lob-tag em { font: 600 11px ${f}; font-style: normal; color: #FFC531; }
.pb-lob-crown { position: absolute; left: 50%; top: -24px; transform: translateX(-50%); font: 700 11px ${f}; font-style: normal; letter-spacing: .14em; color: #FFC531; white-space: nowrap; }
.pb-lob-party { position: absolute; right: 20px; top: 12px; bottom: 120px; z-index: 2; width: 280px; padding: 14px; overflow-y: auto; background: rgba(5,8,18,.7); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.pb-lob-party h4 { margin: 0 0 12px; font: 700 12px ${f}; letter-spacing: .2em; color: #7D87A6; } .pb-lob-party p { font: 13px ${f}; color: #7D87A6; }
.pb-lob-f { display: flex; align-items: center; gap: 10px; padding: 6px 0; } .pb-lob-f img { width: 34px; height: 34px; border-radius: 4px; box-shadow: 0 0 0 2px #5AA9FF; } .pb-lob-f.ingame img { box-shadow: 0 0 0 2px #7CE36A; } .pb-lob-f.away img { box-shadow: 0 0 0 2px #7D87A6; opacity: .7; }
.pb-lob-f span { min-width: 0; } .pb-lob-f b { display: block; font: 600 13px ${f}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-lob-f em { font: 12px ${f}; font-style: normal; color: #7D87A6; } .pb-lob-f.ingame em { color: #7CE36A; }
.pb-lob-info { position: absolute; left: 40px; bottom: 34px; z-index: 2; display: grid; gap: 4px; animation: k-fade .3s both; } .pb-lob-info b { font: 700 26px ${f}; text-transform: uppercase; } .pb-lob-info span { font: 14px ${f}; color: #C5CCE0; }
.pb-lob-cta { position: absolute; right: 20px; bottom: 24px; z-index: 2; } .pb-lob-find { display: grid; justify-items: center; width: 280px; height: 78px; align-content: center; background: linear-gradient(#FFD45A, #F2A900); color: #1B1400; clip-path: polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%); }
.pb-lob-find span { font: 800 26px ${f}; letter-spacing: .08em; } .pb-lob-find small { font: 600 11px ${f}; letter-spacing: .12em; opacity: .7; text-transform: uppercase; } .pb-lob-find:hover { filter: brightness(1.08); }
.pb-lob-find.searching { background: linear-gradient(#2A3352, #1A2140); color: #FFC531; animation: pb-lob-pulse 1.4s ease-in-out infinite; } @keyframes pb-lob-pulse { 50% { box-shadow: inset 0 0 30px rgba(255,197,49,.3); } }
.pb-lob-card { position: absolute; left: 50%; top: 50%; z-index: 4; width: min(520px, 90%); padding: 24px; transform: translate(-50%, -50%); background: rgba(11,16,32,.96); box-shadow: inset 0 0 0 1px rgba(255,197,49,.4), 0 30px 80px #000; animation: k-rise .3s var(--k-out) both; }
.pb-lob-card h2 { margin: 0; font: 800 26px ${f}; text-transform: uppercase; } .pb-lob-card > p { margin: 4px 0 16px; font: 600 12px ${f}; letter-spacing: .14em; text-transform: uppercase; color: #FFC531; }
.pb-lob-card dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0 0 18px; } .pb-lob-card dt { font: 11px ${f}; color: #7D87A6; text-transform: uppercase; letter-spacing: .1em; } .pb-lob-card dd { margin: 2px 0 0; font: 600 15px ${f}; }
.pb-lob-row { display: flex; gap: 10px; } .pb-lob-play, .pb-lob-acc { flex: 1; height: 48px; background: #FFC531 !important; color: #1B1400 !important; font: 800 17px ${f} !important; letter-spacing: .1em; } .pb-lob-row > button:last-child { padding: 0 22px; background: rgba(255,255,255,.1); font: 700 14px ${f}; letter-spacing: .1em; color: #fff; }
.pb-lob-act { margin-top: 12px; } .pb-lob-act button { font-family: ${f} !important; }
.pb-lob-match { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(5,8,18,.8); pointer-events: auto; animation: k-fade .2s both; }
.pb-lob-match > div { width: min(560px, 90%); padding: 26px; text-align: center; background: #0B1020; box-shadow: inset 0 0 0 2px #FFC531, 0 0 80px rgba(255,197,49,.3); animation: pb-lob-found .4s var(--k-out) both; } @keyframes pb-lob-found { from { transform: scale(1.3); opacity: 0; } }
.pb-lob-match p { margin: 0 0 14px; font: 800 30px ${f}; letter-spacing: .2em; color: #FFC531; } .pb-lob-mimg { width: 100%; aspect-ratio: 460/215; object-fit: cover; } .pb-lob-match h2 { margin: 14px 0 18px; font: 700 22px ${f}; text-transform: uppercase; }
`;

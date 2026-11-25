// REALM — an online RPG's character select. Realms (your collections) are listed with population bars, your
// characters (games) line the right with level and class, and the chosen one stands on a glowing rune circle in the
// middle. ENTER WORLD plays. Up/down pick a character, left/right change realm.
import { useRef } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const CLASSES = ['Warrior', 'Ranger', 'Mage', 'Rogue', 'Cleric', 'Paladin', 'Druid', 'Warlock', 'Monk', 'Bard'];
const lvl = (g: Game) => Math.max(1, Math.min(80, Math.round(Math.sqrt(g.minutes / 2))));

export function Realm() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 120);
	const c = useCursor(gs.length);
	const roster = useRef<HTMLDivElement>(null);
	useKeepInView(roster, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const maxPop = Math.max(1, ...b.islands.map((i) => i.games.length));
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); } else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-rlm" brand={<>⚜ REALM SELECT</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-rlm-app">
				<Backdrop g={g} className="pb-rlm-bd" />
				<aside className="pb-rlm-realms"><h4>Realms</h4>{b.islands.map((i) => (
					<button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}>
						<span>{i.name}</span><i><b style={{ width: (i.games.length / maxPop) * 100 + '%' }} /></i><small>{i.games.length > maxPop * 0.66 ? 'High' : i.games.length > maxPop * 0.33 ? 'Medium' : 'Low'}</small>
					</button>
				))}</aside>
				{g && (
					<section className="pb-rlm-stage" key={g.appid}>
						<div className="pb-rlm-hero"><Art g={g} kind="capsule" /></div>
						<div className="pb-rlm-rune"><i /><i /></div>
						<div className="pb-rlm-name"><h1>{g.name}</h1><p>Level {lvl(g)} {CLASSES[g.appid % CLASSES.length]} · {status}</p></div>
						<div className="pb-rlm-btns"><PlayBtn g={g} className="pb-rlm-enter" label={['Enter World', 'Download Realm']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'Close' : 'Character Info'}</button></div>
					</section>
				)}
				<aside className="pb-rlm-chars" ref={roster}><h4>Characters <small>{gs.length}</small></h4>{gs.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); select(null); }} onDoubleClick={() => gameCommands(x)[0].run()}>
						<Art g={x} kind="capsule" /><span><b>{x.name}</b><em>Level {lvl(x)} {CLASSES[x.appid % CLASSES.length]}</em><small>{x.lastPlayed ? formatAgo(x.lastPlayed) : 'New character'}</small></span>
					</button>
				))}</aside>
				{sel && (
					<div className="pb-rlm-info" key={'i' + sel.appid}>
						<h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} played</p>
						<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-rlm-act" />
					</div>
				)}
			</div>
		</AltPage>
	);
}

const serif = '"Palatino Linotype", "Book Antiqua", Georgia, serif';
export const realmCss = tok('realm', { bg: '#0A0C12', s1: 'rgba(255,230,180,.08)', s2: 'rgba(255,230,180,.14)', s3: 'rgba(255,230,180,.22)', fg: '#F2E6CC', fg2: '#CBBB98', fg3: '#8C7E62', acc: '#E3B455', on: '#1F1503', top: '#07080C', font: serif }) + `
.pb-rlm-brand { font: 700 15px ${serif}; letter-spacing: .25em; color: #E3B455; }
.pb-rlm-app { position: absolute; inset: 0; display: grid; grid-template-columns: 260px minmax(0, 1fr) 320px; overflow: hidden; background: #0A0C12; color: #F2E6CC; }
.pb-rlm-bd { opacity: .3; } .pb-rlm-bd img { filter: saturate(.6) sepia(.3); } .pb-rlm-bd::after { content: ""; position: absolute; inset: 0; background: radial-gradient(40% 50% at 50% 60%, transparent, rgba(10,12,18,.9) 80%); }
.pb-rlm-app h4 { margin: 0 0 12px; font: 700 13px ${serif}; letter-spacing: .25em; text-transform: uppercase; color: #E3B455; } .pb-rlm-app h4 small { color: #8C7E62; }
.pb-rlm-realms, .pb-rlm-chars { position: relative; z-index: 1; min-height: 0; overflow-y: auto; padding: 18px 16px; background: linear-gradient(90deg, rgba(10,12,18,.95), rgba(10,12,18,.75)); scrollbar-width: none; }
.pb-rlm-chars { background: linear-gradient(-90deg, rgba(10,12,18,.95), rgba(10,12,18,.75)); }
.pb-rlm-realms button { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; width: 100%; margin-bottom: 4px; padding: 9px 10px; text-align: left; border: 1px solid transparent; font: 15px ${serif}; color: #CBBB98; }
.pb-rlm-realms button i { grid-column: 1; height: 4px; background: rgba(255,255,255,.08); } .pb-rlm-realms button i b { display: block; height: 100%; background: linear-gradient(90deg, #7A5A20, #E3B455); } .pb-rlm-realms button small { grid-row: 1 / 3; grid-column: 2; align-self: center; font: italic 12px ${serif}; color: #8C7E62; }
.pb-rlm-realms button:hover { color: #F2E6CC; } .pb-rlm-realms button.on { border-color: rgba(227,180,85,.5); background: rgba(227,180,85,.08); color: #F2E6CC; }
.pb-rlm-stage { position: relative; display: grid; justify-items: center; align-content: end; padding-bottom: 40px; min-height: 0; }
.pb-rlm-hero { position: relative; z-index: 1; height: min(56vh, 470px); aspect-ratio: 2/3; margin-bottom: -40px; animation: pb-rlm-rise .7s var(--k-out) both; } @keyframes pb-rlm-rise { from { transform: translateY(40px); opacity: 0; filter: brightness(3); } }
.pb-rlm-hero img, .pb-rlm-hero .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; box-shadow: 0 0 0 2px rgba(227,180,85,.6), 0 0 60px rgba(227,180,85,.3), 0 30px 60px rgba(0,0,0,.7); mask: linear-gradient(#000 85%, transparent); -webkit-mask: linear-gradient(#000 85%, transparent); }
.pb-rlm-rune { position: relative; width: 380px; height: 90px; } .pb-rlm-rune i { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(227,180,85,.7); box-shadow: 0 0 30px rgba(227,180,85,.6), inset 0 0 30px rgba(227,180,85,.4); animation: pb-rlm-glow 3s ease-in-out infinite alternate; }
.pb-rlm-rune i:last-child { inset: 16px 50px; border-style: dashed; animation: pb-rlm-turn 20s linear infinite; } @keyframes pb-rlm-glow { to { box-shadow: 0 0 50px rgba(227,180,85,.9), inset 0 0 40px rgba(227,180,85,.6); } } @keyframes pb-rlm-turn { to { transform: rotate(360deg); } }
.pb-rlm-name { margin-top: 10px; text-align: center; } .pb-rlm-name h1 { margin: 0; font: 700 32px/1.1 ${serif}; text-shadow: 0 2px 12px #000; } .pb-rlm-name p { margin: 4px 0 0; font: italic 15px ${serif}; color: #CBBB98; }
.pb-rlm-btns { display: flex; gap: 12px; margin-top: 18px; } .pb-rlm-enter { height: 50px; padding: 0 40px; background: linear-gradient(#8A2A18, #5A1408) !important; color: #F2E6CC !important; font: 700 18px ${serif} !important; letter-spacing: .06em; box-shadow: inset 0 0 0 1px #E3B455, 0 6px 20px rgba(0,0,0,.6); } .pb-rlm-enter:hover { filter: brightness(1.2); }
.pb-rlm-btns > button:last-child { padding: 0 20px; background: rgba(10,12,18,.8); box-shadow: inset 0 0 0 1px rgba(227,180,85,.5); font: 15px ${serif}; color: #F2E6CC; }
.pb-rlm-chars button { display: flex; gap: 12px; width: 100%; margin-bottom: 6px; padding: 8px; text-align: left; border: 1px solid rgba(227,180,85,.15); background: rgba(0,0,0,.3); } .pb-rlm-chars img, .pb-rlm-chars .alt-noart { flex: none; width: 46px; aspect-ratio: 2/3; object-fit: cover; font-size: 5px; }
.pb-rlm-chars span { min-width: 0; display: grid; align-content: center; } .pb-rlm-chars b { font: 700 14px ${serif}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-rlm-chars em { font: italic 12px ${serif}; color: #E3B455; } .pb-rlm-chars small { font: 11px ${serif}; color: #8C7E62; }
.pb-rlm-chars button:hover { border-color: rgba(227,180,85,.4); } .pb-rlm-chars button.on { border-color: #E3B455; background: rgba(227,180,85,.12); box-shadow: 0 0 16px rgba(227,180,85,.2); }
.pb-rlm-info { position: absolute; left: 280px; top: 20px; z-index: 3; width: 300px; padding: 18px; background: rgba(10,12,18,.94); box-shadow: inset 0 0 0 1px rgba(227,180,85,.5); animation: k-rise .3s var(--k-out) both; }
.pb-rlm-info h3 { margin: 0; font: 700 18px ${serif}; } .pb-rlm-info > p { margin: 2px 0 12px; font: italic 13px ${serif}; color: #8C7E62; } .pb-rlm-info dl div { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(227,180,85,.12); font: 13px ${serif}; } .pb-rlm-info dt { color: #8C7E62; } .pb-rlm-info dd { margin: 0; }
.pb-rlm-act button { font-family: ${serif} !important; color: #CBBB98 !important; }
`;

// SAVES — a save-file select screen. Every game you have played is a save slot with its play time, when it was last
// saved and where it lives; the hand cursor moves down the files. Enter continues, Y / Tab opens the file's options.
import { useMemo, useRef, useState } from 'react';
import { type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useIslands, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { useCursor, useKeepInView, useKeys, useStatus } from './lk';

const clock = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const when = (u: number) => (u ? new Date(u * 1000).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--/--/---- --:--');

function Slot({ g, n, on, where, pick, open }: { g: Game; n: number; on: boolean; where: string; pick: () => void; open: () => void }) {
	const status = useStatus(on ? g : null);
	return (
		<button data-appid={g.appid} className={'pb-sv-slot' + (on ? ' on' : '')} onClick={on ? open : pick} onMouseEnter={pick}>
			<span className="pb-sv-hand">☛</span>
			<span className="pb-sv-no">FILE {String(n + 1).padStart(2, '0')}</span>
			<Art g={g} kind="capsule" className="pb-sv-thumb" />
			<span className="pb-sv-mid"><b>{g.name}</b><em>{where}</em>{on && <small>{status}</small>}</span>
			<span className="pb-sv-time"><small>PLAY TIME</small><b>{clock(g.minutes)}</b><small>{when(g.lastPlayed)}</small></span>
		</button>
	);
}

export function Saves() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const [empty, setEmpty] = useState(false);
	const files = useMemo(() => (found ?? library).filter((g) => (empty ? g.minutes === 0 : g.minutes > 0)).sort((a, b) => (empty ? a.sortName.localeCompare(b.sortName) : b.lastPlayed - a.lastPlayed)).slice(0, 200), [found, library, empty]);
	const c = useCursor(files.length);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved);
	const whereOf = (g: Game) => islands.find((i) => i.games.some((x) => x.appid === g.appid))?.name ?? 'Library';
	const g = files[c.i];
	useKeys((k) => {
		if (sel) { if (k === 'back' || k === 'menu') select(null); else return false; return; }
		if (k === 'up') c.move(-1); else if (k === 'down') c.move(1); else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(g.appid);
		else if (k === 'left' || k === 'right' || k === 'next' || k === 'prev') { setEmpty((e) => !e); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-sv" brand={<>SELECT A FILE</>} search={q} onSearch={(v) => { setQ(v); c.to(0); }} searchPlaceholder="Find a file">
			<div className="pb-sv-app">
				<div className="pb-sv-frame">
					<header><button className={!empty ? 'on' : ''} onClick={() => { setEmpty(false); c.to(0); }}>SAVED GAMES</button><button className={empty ? 'on' : ''} onClick={() => { setEmpty(true); c.to(0); }}>NEW GAME</button><span>{files.length} FILES</span></header>
					<div className="pb-sv-list" ref={list}>{files.map((x, n) => <Slot key={x.appid} g={x} n={n} on={n === c.i} where={whereOf(x)} pick={() => c.to(n)} open={() => select(x.appid)} />)}{!files.length && <p className="pb-sv-none">NO DATA</p>}</div>
					<footer>▲▼ SELECT  ·  ⏎ {empty ? 'START' : 'CONTINUE'}  ·  TAB OPTIONS  ·  ◀▶ {empty ? 'SAVED GAMES' : 'NEW GAME'}</footer>
				</div>
				{sel && (
					<div className="pb-sv-dlg" onMouseDown={(e) => e.target === e.currentTarget && select(null)}>
						<div className="pb-sv-box" key={sel.appid}>
							<p className="pb-sv-dt">{sel.name}</p>
							<p>PLAY TIME {clock(sel.minutes)} · LAST SAVED {when(sel.lastPlayed)}</p>
							<PlayBtn g={sel} className="pb-sv-cont" label={[sel.minutes ? '☛ CONTINUE' : '☛ NEW GAME', '☛ INSTALL']} />
							<Actions g={sel} className="pb-sv-act" />
							<button className="pb-sv-cancel" onClick={() => select(null)}>CANCEL</button>
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

const px = '"Consolas", "Lucida Console", monospace';
export const savesCss = tok('saves', { bg: '#0A0E2A', s1: '#141A45', s2: '#1D2560', s3: '#283380', fg: '#FFFFFF', fg2: '#C9D1FF', fg3: '#7F8BCF', acc: '#FFD23F', on: '#1A1400', top: '#060920', font: px }) + `
.pb-sv-brand { font: 700 16px ${px}; letter-spacing: .2em; color: #fff; }
.pb-sv-app { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(circle at 50% 30%, #1D2560, #0A0E2A 70%); color: #fff; }
.pb-sv-app::before { content: ""; position: absolute; inset: 0; background: radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 20%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #C9D1FF, transparent), radial-gradient(1px 1px at 85% 65%, #fff, transparent), radial-gradient(1px 1px at 10% 75%, #fff, transparent); opacity: .7; }
.pb-sv-frame { position: relative; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; width: min(1000px, 92%); height: min(90%, 760px); border-radius: 10px; background: linear-gradient(#1D2A8C, #0E1550); box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 6px #1D2A8C, inset 0 0 0 8px #C9D1FF, 0 20px 60px rgba(0,0,0,.6); padding: 14px; }
.pb-sv-frame header { display: flex; gap: 6px; align-items: center; padding: 6px 10px 12px; } .pb-sv-frame header button { padding: 6px 14px; font: 700 15px ${px}; letter-spacing: .1em; color: #7F8BCF; } .pb-sv-frame header button.on { color: #FFD23F; text-shadow: 0 0 10px rgba(255,210,63,.5); } .pb-sv-frame header span { margin-left: auto; font: 13px ${px}; color: #7F8BCF; }
.pb-sv-list { overflow-y: auto; padding: 0 6px; scrollbar-width: thin; scrollbar-color: #7F8BCF transparent; }
.pb-sv-slot { position: relative; display: grid; grid-template-columns: 30px 80px 60px minmax(0, 1fr) auto; gap: 16px; align-items: center; width: 100%; margin-bottom: 8px; padding: 10px 16px 10px 6px; border-radius: 6px; text-align: left; background: rgba(0,0,0,.2); box-shadow: inset 0 0 0 1px rgba(201,209,255,.2); color: #C9D1FF; }
.pb-sv-slot.on { background: rgba(255,210,63,.1); box-shadow: inset 0 0 0 2px #FFD23F; color: #fff; }
.pb-sv-hand { font-size: 22px; color: #FFD23F; opacity: 0; } .pb-sv-slot.on .pb-sv-hand { opacity: 1; animation: pb-sv-poke .5s ease-in-out infinite alternate; } @keyframes pb-sv-poke { to { transform: translateX(5px); } }
.pb-sv-no { font: 700 13px ${px}; color: #7F8BCF; } .pb-sv-slot.on .pb-sv-no { color: #FFD23F; }
.pb-sv-thumb { width: 60px; aspect-ratio: 2/3; object-fit: cover; border-radius: 3px; box-shadow: 0 0 0 2px rgba(255,255,255,.4); }
.pb-sv-mid { min-width: 0; display: grid; gap: 4px; } .pb-sv-mid b { font: 700 19px ${px}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-sv-mid em { font: 13px ${px}; font-style: normal; color: #7F8BCF; } .pb-sv-mid small { font: 12px ${px}; color: #6CFF9E; }
.pb-sv-time { display: grid; justify-items: end; gap: 2px; } .pb-sv-time small { font: 11px ${px}; color: #7F8BCF; } .pb-sv-time b { font: 700 24px ${px}; color: #fff; letter-spacing: .04em; }
.pb-sv-none { text-align: center; padding: 60px; font: 700 20px ${px}; color: #7F8BCF; }
.pb-sv-frame footer { padding: 12px 10px 4px; text-align: center; font: 12.5px ${px}; letter-spacing: .1em; color: #7F8BCF; }
.pb-sv-dlg { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; background: rgba(0,0,0,.55); pointer-events: auto; animation: k-fade .15s both; }
.pb-sv-box { width: min(480px, 90%); padding: 22px; border-radius: 8px; background: linear-gradient(#1D2A8C, #0E1550); box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 6px #1D2A8C, 0 20px 60px #000; text-align: center; animation: pb-sv-zoom .2s var(--k-out) both; } @keyframes pb-sv-zoom { from { transform: scale(.9); } }
.pb-sv-dt { margin: 0 0 6px; font: 700 20px ${px}; color: #FFD23F; } .pb-sv-box > p:not(.pb-sv-dt) { margin: 0 0 18px; font: 12.5px ${px}; color: #C9D1FF; }
.pb-sv-cont { width: 100%; height: 46px; margin-bottom: 10px; border-radius: 4px; background: #FFD23F !important; color: #1A1400 !important; font: 700 17px ${px} !important; letter-spacing: .1em; }
.pb-sv-act { text-align: left; } .pb-sv-act button { font-family: ${px} !important; color: #C9D1FF !important; } .pb-sv-act button:hover { background: rgba(255,255,255,.08) !important; }
.pb-sv-cancel { margin-top: 10px; font: 700 13px ${px}; letter-spacing: .1em; color: #7F8BCF; } .pb-sv-cancel:hover { color: #fff; }
`;

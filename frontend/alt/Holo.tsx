// HOLO — a hologram projector. The focused game floats above an emitter as a flickering blue projection with rings
// turning beneath it; a control deck of game keys sits below. Arrows walk the deck, Enter projects the full record.
import { useRef } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, colsOf, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Holo() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 96);
	const c = useCursor(gs.length);
	const deck = useRef<HTMLDivElement>(null);
	useKeepInView(deck, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		const cols = colsOf(deck.current);
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
		if (['left', 'right', 'up', 'down'].includes(k) && sel) select(null);
	});
	return (
		<AltPage className="pb-holo" brand={<>HOLO<i>PROJECTOR</i></>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-holo-app">
				<div className="pb-holo-room">
					{g && (
						<div className="pb-holo-proj" key={g.appid}>
							<div className="pb-holo-beam" />
							<div className="pb-holo-img"><Art g={g} kind="capsule" /></div>
							<div className="pb-holo-rings"><i /><i /><i /></div>
						</div>
					)}
					{g && (
						<div className="pb-holo-read" key={'r' + g.appid}>
							<p className="pb-holo-st">◉ {status}</p>
							<h1>{g.name}</h1>
							<p>{formatPlaytime(g.minutes)} logged · {formatAgo(g.lastPlayed)}</p>
							<div className="pb-holo-btns"><PlayBtn g={g} className="pb-holo-play"><Icon name={g.installed ? 'play' : 'install'} size={18} /></PlayBtn><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'Close record' : 'Full record'}</button></div>
							{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-holo-act" /></>}
						</div>
					)}
				</div>
				<div className="pb-holo-console">
					<Chips b={b} className="pb-holo-chips" onPick={() => { c.to(0); select(null); }} />
					<div className="pb-holo-deck" ref={deck}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { if (n === c.i) select(x.appid); else { c.to(n); if (sel) select(null); } }} title={x.name}>
							<Art g={x} kind="header" /><i className={x.installed ? 'ok' : ''} />
						</button>
					))}</div>
				</div>
			</div>
		</AltPage>
	);
}

export const holoCss = tok('holo', { bg: '#01060C', s1: 'rgba(90,200,255,.08)', s2: 'rgba(90,200,255,.16)', s3: 'rgba(90,200,255,.26)', fg: '#D6F3FF', fg2: '#94D4F0', fg3: '#4F8BA8', acc: '#5AC8FF', on: '#00121F', top: '#01060C', line: 'rgba(90,200,255,.18)', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
.pb-holo-brand { display: flex; align-items: baseline; gap: 6px; font: 700 17px var(--k-text); letter-spacing: .25em; color: #5AC8FF; text-shadow: 0 0 10px rgba(90,200,255,.7); } .pb-holo-brand i { font: 500 10px var(--k-text); font-style: normal; letter-spacing: .3em; color: #4F8BA8; }
.pb-holo-app { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; background: radial-gradient(60% 60% at 35% 70%, rgba(90,200,255,.14), transparent 60%), #01060C; color: #D6F3FF; }
.pb-holo-room { position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center; min-height: 0; padding: 0 6%; }
.pb-holo-proj { position: relative; height: 100%; display: grid; place-items: center; }
.pb-holo-beam { position: absolute; left: 50%; bottom: 8%; width: 70%; height: 82%; transform: translateX(-50%); background: linear-gradient(0deg, rgba(90,200,255,.35), rgba(90,200,255,.03) 80%, transparent); clip-path: polygon(44% 100%, 56% 100%, 100% 0, 0 0); filter: blur(2px); }
.pb-holo-img { position: relative; height: min(52vh, 420px); aspect-ratio: 2/3; margin-bottom: 8%; animation: pb-holo-float 4s ease-in-out infinite alternate, pb-holo-in .7s var(--k-out) both; }
.pb-holo-img img, .pb-holo-img .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) sepia(1) hue-rotate(160deg) saturate(3) brightness(1.1); opacity: .78; mix-blend-mode: screen; animation: pb-holo-flick 5s infinite; }
.pb-holo-img::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(90,200,255,.25) 0 1px, transparent 1px 4px); animation: pb-holo-scan 3s linear infinite; mix-blend-mode: screen; } .pb-holo-img::before { content: ""; position: absolute; inset: -2px; box-shadow: 0 0 0 1px rgba(90,200,255,.5), 0 0 40px rgba(90,200,255,.4); }
@keyframes pb-holo-float { to { transform: translateY(-12px) rotateY(8deg); } } @keyframes pb-holo-in { from { opacity: 0; transform: scaleY(.02); filter: brightness(3); } }
@keyframes pb-holo-flick { 0%, 96%, 100% { opacity: .78; } 97% { opacity: .4; transform: translateX(2px); } 98% { opacity: .85; } } @keyframes pb-holo-scan { to { background-position: 0 40px; } }
.pb-holo-rings { position: absolute; left: 50%; bottom: 4%; width: 60%; aspect-ratio: 4/1; transform: translateX(-50%); } .pb-holo-rings i { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(90,200,255,.6); box-shadow: 0 0 20px rgba(90,200,255,.5), inset 0 0 20px rgba(90,200,255,.3); animation: pb-holo-ring 3s ease-out infinite; }
.pb-holo-rings i:nth-child(2) { inset: 18% 14%; animation-delay: -1s; } .pb-holo-rings i:nth-child(3) { inset: 34% 30%; background: rgba(90,200,255,.4); animation-delay: -2s; } @keyframes pb-holo-ring { 50% { opacity: .5; } }
.pb-holo-read { position: relative; max-width: 520px; animation: k-rise .5s var(--k-out) both; } .pb-holo-st { margin: 0 0 8px; font: 600 12px var(--k-text); letter-spacing: .25em; text-transform: uppercase; color: #5AC8FF; }
.pb-holo-read h1 { margin: 0 0 8px; font: 300 clamp(30px, 3.4vw, 50px)/1.05 var(--k-text); color: #fff; text-shadow: 0 0 24px rgba(90,200,255,.6); } .pb-holo-read > p { margin: 0 0 22px; font: 15px var(--k-text); color: #94D4F0; }
.pb-holo-btns { display: flex; gap: 10px; } .pb-holo-play { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 26px; border-radius: 4px; background: rgba(90,200,255,.2) !important; box-shadow: inset 0 0 0 1px #5AC8FF, 0 0 20px rgba(90,200,255,.4); color: #fff !important; font: 600 15px var(--k-text) !important; letter-spacing: .1em; } .pb-holo-play:hover { background: #5AC8FF !important; color: #00121F !important; }
.pb-holo-btns > button:last-child { height: 44px; padding: 0 20px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgba(90,200,255,.35); color: #94D4F0; font: 600 14px var(--k-text); } .pb-holo-btns > button:last-child:hover { color: #fff; }
.pb-holo-read dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 22px 0 12px; } .pb-holo-read dt { font: 11px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: #4F8BA8; } .pb-holo-read dd { margin: 3px 0 0; font: 600 15px var(--k-text); }
.pb-holo-act button { color: #94D4F0 !important; } .pb-holo-act button:hover { background: rgba(90,200,255,.1) !important; }
.pb-holo-console { position: relative; padding: 12px 24px 16px; background: linear-gradient(#06131E, #030A12); border-top: 1px solid rgba(90,200,255,.3); box-shadow: 0 -20px 40px rgba(0,0,0,.5); }
.pb-holo-chips { margin-bottom: 10px; } .pb-holo-chips button { border-radius: 4px; background: rgba(90,200,255,.06); box-shadow: inset 0 0 0 1px rgba(90,200,255,.2); } .pb-holo-chips button.on { background: #5AC8FF; color: #00121F; }
.pb-holo-deck { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; max-height: 172px; overflow-y: auto; scrollbar-width: thin; }
.pb-holo-deck button { position: relative; aspect-ratio: 460/215; border-radius: 4px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(90,200,255,.2); } .pb-holo-deck img, .pb-holo-deck .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: grayscale(.6) brightness(.6); transition: filter .15s; font-size: 7px; }
.pb-holo-deck button:hover img { filter: none; } .pb-holo-deck button.on { box-shadow: 0 0 0 2px #5AC8FF, 0 0 16px rgba(90,200,255,.6); } .pb-holo-deck button.on img { filter: none; }
.pb-holo-deck i { position: absolute; right: 4px; top: 4px; width: 6px; height: 6px; border-radius: 50%; background: #4F8BA8; } .pb-holo-deck i.ok { background: #5AC8FF; box-shadow: 0 0 6px #5AC8FF; }
`;

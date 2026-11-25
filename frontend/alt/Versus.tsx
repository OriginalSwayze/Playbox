// VERSUS — a fighting-game character select. A grid of square portraits; hovering one fills the big player-one
// panel with its art and stats (power = hours, speed = fortnight, rating = Metascore); pick an opponent for player two
// and FIGHT! plays player one's game. The timer counts down for show.
import { useEffect, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const stat = (g: Game) => [Math.min(10, Math.round(Math.sqrt(g.minutes / 60))), Math.min(10, Math.round(g.minutes2w / 60)), Math.round((g.metacritic || 50) / 10), g.installed ? 10 : 3];

function Panel({ g, side }: { g: Game | null; side: 'l' | 'r' }) {
	return (
		<div className={'fgt-p ' + side}>{g ? <>
			<Art g={g} kind="capsule" className="fgt-big" key={g.appid} />
			<div className="fgt-info"><em>{side === 'l' ? '1P' : '2P'}</em><h2>{g.name}</h2>
				{['POWER', 'SPEED', 'RATING', 'READY'].map((n, i) => <p key={n}><span>{n}</span><i>{Array.from({ length: 10 }, (_, k) => <b key={k} className={k < stat(g)[i] ? 'on' : ''} />)}</i></p>)}
				<small>{formatPlaytime(g.minutes)}</small></div></> : <div className="fgt-q">?</div>}</div>
	);
}

export function Versus() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [hover, setHover] = useState<Game | null>(null);
	const [p2, setP2] = useState<Game | null>(null);
	const [t, setT] = useState(99);
	useEffect(() => { const i = setInterval(() => setT((x) => (x <= 0 ? 99 : x - 1)), 1000); return () => clearInterval(i); }, []);
	const roster = b.games.slice(0, 40);
	const p1 = sel ?? hover ?? roster[0] ?? null;
	return (
		<AltPage className="fgt" brand={<>VERSUS</>}>
			<div className="fgt-app">
				<div className="fgt-hud"><span className="fgt-title">SELECT YOUR FIGHTER</span><span className="fgt-timer">{String(t).padStart(2, '0')}</span><select value={b.cur} onChange={(e) => { b.setCur(e.target.value); select(null); setP2(null); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>STAGE: {i.name.toUpperCase()}</option>)}</select></div>
				<div className="fgt-stage2">
					<Panel g={p1} side="l" />
					<div className="fgt-grid">{roster.map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'fgt-c' + (p1?.appid === g.appid ? ' p1' : '') + (p2?.appid === g.appid ? ' p2' : '')} onMouseEnter={() => setHover(g)} onClick={() => (sel && sel.appid !== g.appid ? setP2(g) : select(g.appid))} onContextMenu={(e) => { e.preventDefault(); setP2(g); }}>
							<Art g={g} kind="capsule" />{p1?.appid === g.appid && <i className="t1">1P</i>}{p2?.appid === g.appid && <i className="t2">2P</i>}
						</button>))}</div>
					<Panel g={p2} side="r" />
				</div>
				<div className="fgt-bottom">{sel ? <><span>{sel.name} locked in. {p2 ? `vs ${p2.name}!` : 'Click another fighter for 2P.'}</span><button className="fgt-go" onClick={gameCommands(sel)[0].run}>{sel.installed ? 'FIGHT!' : 'INSTALL TO FIGHT'}</button><button className="fgt-cancel" onClick={() => { select(null); setP2(null); }}>CANCEL</button></> : <span>Hover to preview · click to lock in 1P · right-click for 2P</span>}</div>
			</div>
		</AltPage>
	);
}

export const versusCss = tok('versus', { bg: '#0A0410', s1: '#1A0B24', s2: '#2A1238', s3: '#3B1A4E', fg: '#FFFFFF', fg2: '#E8D8F2', fg3: '#A890B8', acc: '#FF3B3B', on: '#fff', top: '#05020A', font: 'Impact, "Arial Black", sans-serif' }) + `
.fgt-brand { font: 900 italic 20px Impact, sans-serif; letter-spacing: .06em; color: #FFD23B; text-shadow: 2px 2px 0 #FF3B3B; }
.fgt-app { position: absolute; inset: 0; display: grid; grid-template-rows: 60px minmax(0, 1fr) 70px; overflow: hidden; background: radial-gradient(60% 80% at 50% 50%, #3B1A4E, #0A0410 70%); color: #fff; }
.fgt-app::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(-45deg, rgba(255,255,255,.03) 0 2px, transparent 2px 14px); pointer-events: none; }
.fgt-hud { position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 20px; } .fgt-title { font: 900 italic 30px Impact, sans-serif; letter-spacing: .04em; color: #fff; text-shadow: 3px 3px 0 #FF3B3B; }
.fgt-timer { font: 900 46px Impact, sans-serif; color: #FFD23B; text-shadow: 0 0 10px #FF8A00, 3px 3px 0 #000; } .fgt-hud select { justify-self: end; height: 30px; background: #1A0B24; color: #fff; border: 2px solid #FFD23B; font: 14px Impact, sans-serif; }
.fgt-stage2 { position: relative; display: grid; grid-template-columns: 1fr minmax(0, 560px) 1fr; gap: 20px; align-items: center; padding: 0 20px; min-height: 0; }
.fgt-p { position: relative; height: 100%; display: grid; align-items: end; overflow: hidden; } .fgt-big { position: absolute; bottom: 0; height: 95%; left: 50%; transform: translateX(-50%); filter: drop-shadow(0 0 30px rgba(255,59,59,.5)); animation: fgt-in .35s var(--k-out) both; } .fgt-p.r .fgt-big { filter: drop-shadow(0 0 30px rgba(59,140,255,.5)) hue-rotate(0deg); } @keyframes fgt-in { from { transform: translateX(-30%) scale(.9); opacity: 0; } }
.fgt-p.r .fgt-big { animation-name: fgt-in2; } @keyframes fgt-in2 { from { transform: translateX(-70%) scale(.9); opacity: 0; } }
.fgt-info { position: relative; z-index: 1; padding: 14px; background: linear-gradient(transparent, rgba(0,0,0,.85) 30%); } .fgt-info em { font: 900 italic 22px Impact, sans-serif; font-style: italic; color: #FF3B3B; } .fgt-p.r .fgt-info em { color: #3B8CFF; }
.fgt-info h2 { margin: 0 0 8px; font: 900 italic 30px/1 Impact, sans-serif; text-transform: uppercase; text-shadow: 3px 3px 0 #000; } .fgt-info p { display: grid; grid-template-columns: 70px 1fr; gap: 8px; align-items: center; margin: 3px 0; font: 13px Impact, sans-serif; letter-spacing: .1em; }
.fgt-info i { display: flex; gap: 2px; } .fgt-info b { flex: 1; height: 10px; background: #333; transform: skewX(-20deg); } .fgt-info b.on { background: linear-gradient(#FFD23B, #FF8A00); } .fgt-info small { font: 14px Impact, sans-serif; color: #A890B8; }
.fgt-q { display: grid; place-items: center; height: 100%; font: 900 200px Impact, sans-serif; color: rgba(255,255,255,.08); }
.fgt-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; align-content: center; }
.fgt-c { position: relative; aspect-ratio: 1; overflow: hidden; border: 2px solid #3B1A4E; background: #000; transform: skewX(-6deg); transition: transform .12s; } .fgt-c img, .fgt-c .alt-noart { width: 100%; height: 100%; object-fit: cover; object-position: top; font-size: 5px; } .fgt-c:hover { transform: skewX(-6deg) scale(1.12); z-index: 2; }
.fgt-c.p1 { border-color: #FF3B3B; box-shadow: 0 0 14px #FF3B3B; z-index: 1; } .fgt-c.p2 { border-color: #3B8CFF; box-shadow: 0 0 14px #3B8CFF; } .fgt-c i { position: absolute; left: 2px; top: 2px; padding: 0 4px; font: 900 11px Impact, sans-serif; font-style: normal; } .fgt-c .t1 { background: #FF3B3B; } .fgt-c .t2 { left: auto; right: 2px; background: #3B8CFF; }
.fgt-bottom { position: relative; display: flex; gap: 20px; justify-content: center; align-items: center; font: 18px Impact, sans-serif; letter-spacing: .05em; color: #E8D8F2; }
.fgt-go { height: 50px; padding: 0 40px; background: linear-gradient(#FFD23B, #FF8A00); color: #3A0000; font: 900 italic 26px Impact, sans-serif; letter-spacing: .06em; transform: skewX(-12deg); box-shadow: 4px 4px 0 #000; animation: fgt-pulse .8s ease-in-out infinite alternate; } @keyframes fgt-pulse { to { filter: brightness(1.2); } }
.fgt-cancel { font: 16px Impact, sans-serif; color: #A890B8; }
`;

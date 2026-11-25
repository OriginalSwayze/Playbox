// BOARD — a board game. Up to 36 games are the squares around the edge of the board; roll the dice and your token
// hops round to a game, which the middle of the board then shows as a card to play. Arrows move the token one square,
// Enter rolls, Y / Tab plays where you stand.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, useKeys, useStatus } from './lk';

const SIDE = 10; // squares per side including corners -> 36 squares
const COLORS = ['#E84A5F', '#FF9F43', '#FECA57', '#1DD1A1', '#48DBFB', '#5F27CD', '#FF6B9D', '#10AC84', '#2E86DE'];
function cell(i: number): [number, number] {
	const s = SIDE - 1;
	if (i < s) return [s - i, s]; // bottom row, right to left
	if (i < s * 2) return [0, s - (i - s)]; // left column, bottom to top
	if (i < s * 3) return [i - s * 2, 0]; // top row, left to right
	return [s, i - s * 3]; // right column, top to bottom
}
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const Die = ({ v, roll }: { v: number; roll: boolean }) => <div className={'pb-brd-die' + (roll ? ' roll' : '')}>{Array.from({ length: 9 }, (_, i) => <i key={i} className={PIPS[v].includes(i) ? 'on' : ''} />)}</div>;

export function Board() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const squares = b.games.slice(0, (SIDE - 1) * 4);
	const [pos, setPos] = useState(0);
	const [dice, setDice] = useState<[number, number]>([3, 4]);
	const [rolling, setRolling] = useState(false);
	const [hop, setHop] = useState(0);
	const here: Game | undefined = squares[pos % Math.max(1, squares.length)];
	const g = sel ?? here;
	const status = useStatus(g);
	useEffect(() => { if (!hop) return; const t = setTimeout(() => { setPos((p) => (p + 1) % Math.max(1, squares.length)); setHop((h) => h - 1); }, 160); return () => clearTimeout(t); }, [hop]);
	useEffect(() => { setPos(0); }, [b.cur, b.q]);
	const roll = () => {
		if (rolling || hop || !squares.length) return;
		select(null); setRolling(true);
		setTimeout(() => { const d: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]; setDice(d); setRolling(false); setHop(d[0] + d[1]); }, 650);
	};
	useKeys((k) => {
		if (k === 'right' || k === 'down') { setPos((p) => (p + 1) % Math.max(1, squares.length)); select(null); } else if (k === 'left' || k === 'up') { setPos((p) => (p - 1 + squares.length) % Math.max(1, squares.length)); select(null); }
		else if (k === 'enter') roll(); else if (k === 'menu' && g) gameCommands(g)[0].run(); else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-brd" brand={<>⚅ BOARD</>} search={b.q} onSearch={b.setQ}>
			<div className="pb-brd-app">
				<Chips b={b} className="pb-brd-chips" />
				<div className="pb-brd-board">
					{squares.map((x, i) => {
						const [cx, cy] = cell(i);
						const corner = (cx === 0 || cx === SIDE - 1) && (cy === 0 || cy === SIDE - 1);
						return (
							<button key={x.appid} data-appid={x.appid} className={'pb-brd-sq' + (corner ? ' corner' : '') + (i === pos % squares.length ? ' here' : '')} style={{ gridColumn: cx + 1, gridRow: cy + 1, ['--c' as string]: COLORS[Math.floor(i / 4) % COLORS.length] }} onClick={() => { setPos(i); select(x.appid); }} title={x.name}>
								<i className="pb-brd-band" /><Art g={x} kind={corner ? 'capsule' : 'header'} /><span>{x.name}</span>
								{i === pos % squares.length && <b className="pb-brd-token" />}
							</button>
						);
					})}
					<div className="pb-brd-mid">
						<p className="pb-brd-title">PLAYBOX<small>the board game</small></p>
						<div className="pb-brd-dice" onClick={roll}><Die v={dice[0]} roll={rolling} /><Die v={dice[1]} roll={rolling} /></div>
						<button className="pb-brd-roll" onClick={roll} disabled={rolling || hop > 0}>{rolling ? 'Rolling…' : hop ? 'Moving…' : 'Roll the dice'}</button>
						{g && !hop && !rolling && (
							<div className="pb-brd-card" key={g.appid}>
								<Art g={g} kind="header" className="pb-brd-cimg" />
								<div><h2>{g.name}</h2><p>{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
									<div className="pb-brd-row"><PlayBtn g={g} className="pb-brd-play" label={['Play this square', 'Buy (install)']} />{sel ? <button onClick={() => select(null)}>Close</button> : <button onClick={() => select(g.appid)}>Deed</button>}</div>
									{sel && <Actions g={sel} className="pb-brd-act" />}</div>
							</div>
						)}
					</div>
					{!squares.length && <p className="lk-empty">No squares on this board.</p>}
				</div>
			</div>
		</AltPage>
	);
}

const f = '"Segoe UI Black", "Arial Black", "Segoe UI", sans-serif';
export const boardCss = tok('board', { bg: '#1E6B52', s1: 'rgba(255,255,255,.14)', s2: 'rgba(255,255,255,.22)', s3: 'rgba(255,255,255,.3)', fg: '#FFFFFF', fg2: '#E6F4EE', fg3: '#A8D4C2', acc: '#E84A5F', on: '#fff', top: '#145240', font: '"Segoe UI", sans-serif' }) + `
.pb-brd-brand { font: 900 17px ${f}; letter-spacing: .1em; color: #fff; }
.pb-brd-app { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); justify-items: center; padding: 8px 20px 16px; background: radial-gradient(circle, #2A8566, #145240 80%); }
.pb-brd-chips { justify-self: stretch; justify-content: center; margin-bottom: 8px; } .pb-brd-chips button { background: rgba(0,0,0,.25); color: #fff; } .pb-brd-chips button.on { background: #fff; color: #145240; }
.pb-brd-board { position: relative; display: grid; grid-template-columns: 1.4fr repeat(${SIDE - 2}, 1fr) 1.4fr; grid-template-rows: 1.4fr repeat(${SIDE - 2}, 1fr) 1.4fr; height: 100%; aspect-ratio: 1; max-width: 100%; padding: 6px; gap: 3px; background: #DDEEDF; border-radius: 6px; box-shadow: 0 0 0 6px #0E3A2C, 0 30px 60px rgba(0,0,0,.5); }
.pb-brd-sq { position: relative; display: flex; flex-direction: column; overflow: hidden; background: #F6FBF7; box-shadow: inset 0 0 0 1px rgba(0,0,0,.18); color: #1A2A22; transition: transform .15s; }
.pb-brd-band { flex: none; height: 18%; background: var(--c); } .pb-brd-sq img, .pb-brd-sq .alt-noart { flex: 1; min-height: 0; width: 100%; object-fit: cover; font-size: 5px; }
.pb-brd-sq span { flex: none; padding: 1px 3px; font: 700 8.5px/1.2 "Segoe UI", sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.pb-brd-sq.corner .pb-brd-band { display: none; } .pb-brd-sq:hover { transform: scale(1.06); z-index: 2; } .pb-brd-sq.here { box-shadow: inset 0 0 0 3px #E84A5F; z-index: 1; }
.pb-brd-token { position: absolute; left: 50%; top: 50%; width: 26px; height: 26px; margin: -13px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FF8A9A, #E84A5F 50%, #8A1A2A); box-shadow: 0 4px 8px rgba(0,0,0,.5), 0 0 0 3px #fff; animation: pb-brd-hop .16s ease-out; } @keyframes pb-brd-hop { 50% { transform: translateY(-12px) scale(1.1); } }
.pb-brd-mid { grid-column: 2 / ${SIDE}; grid-row: 2 / ${SIDE}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 10px; min-height: 0; overflow: hidden; color: #1A2A22; }
.pb-brd-title { margin: 0; text-align: center; font: 900 34px/1 ${f}; letter-spacing: .06em; color: #E84A5F; transform: rotate(-4deg); text-shadow: 3px 3px 0 #1A2A22; } .pb-brd-title small { display: block; font: 700 italic 13px "Segoe UI", sans-serif; letter-spacing: .2em; color: #1E6B52; text-shadow: none; }
.pb-brd-dice { display: flex; gap: 14px; cursor: pointer; } .pb-brd-die { display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr); gap: 3px; width: 54px; height: 54px; padding: 8px; border-radius: 10px; background: #fff; box-shadow: 0 5px 0 #C4CFC8, 0 8px 14px rgba(0,0,0,.25); }
.pb-brd-die i { border-radius: 50%; } .pb-brd-die i.on { background: #1A2A22; } .pb-brd-die.roll { animation: pb-brd-roll .65s ease-out; } @keyframes pb-brd-roll { 0% { transform: rotate(0) translateY(0); } 30% { transform: rotate(200deg) translateY(-30px); } 60% { transform: rotate(400deg) translateY(0); } 100% { transform: rotate(720deg); } }
.pb-brd-roll { height: 40px; padding: 0 26px; border-radius: 99px; background: #E84A5F; color: #fff; font: 900 15px ${f}; letter-spacing: .05em; box-shadow: 0 4px 0 #9A2A3A; } .pb-brd-roll:disabled { opacity: .6; } .pb-brd-roll:active { transform: translateY(3px); box-shadow: 0 1px 0 #9A2A3A; }
.pb-brd-card { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 12px; width: min(440px, 100%); padding: 10px; border-radius: 10px; background: #fff; box-shadow: 0 6px 16px rgba(0,0,0,.2); animation: pb-brd-pop .3s var(--k-out) both; } @keyframes pb-brd-pop { from { transform: scale(.85); opacity: 0; } }
.pb-brd-cimg { width: 150px; aspect-ratio: 460/215; object-fit: cover; border-radius: 6px; } .pb-brd-card h2 { margin: 0; font: 800 16px/1.2 "Segoe UI", sans-serif; } .pb-brd-card p { margin: 2px 0 8px; font: 12px "Segoe UI", sans-serif; color: #4A5A52; }
.pb-brd-row { display: flex; gap: 6px; } .pb-brd-play { height: 32px; padding: 0 14px; border-radius: 99px; background: #1E6B52 !important; color: #fff !important; font: 700 12.5px "Segoe UI", sans-serif !important; } .pb-brd-row > button:last-child { padding: 0 12px; border-radius: 99px; background: #EAF3EE; font: 700 12px "Segoe UI", sans-serif; color: #1A2A22; }
.pb-brd-act { grid-column: 1 / -1; } .pb-brd-act button { color: #1A2A22 !important; font-size: 12px !important; height: 28px; } .pb-brd-act button:hover { background: #EAF3EE !important; }
`;

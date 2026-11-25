// ADVENT — an advent calendar. Twenty-four numbered doors scattered over a snowy scene, each hiding a game from the
// chosen collection; open a door (it swings back on its hinge) to reveal the game, then play it. Opened doors are
// remembered on this PC.
import { useMemo, useState } from 'react';
import { formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const KEY = 'kestrel.advent';
const load = (): Record<string, boolean> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const ORDER = [7, 19, 2, 14, 23, 10, 5, 17, 1, 12, 21, 8, 16, 3, 24, 11, 6, 20, 13, 9, 22, 4, 18, 15];

export function Advent() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [open, setOpen] = useState<Record<string, boolean>>(load);
	const doors = useMemo(() => b.games.slice(0, 24), [b.games]);
	const k = (n: number) => `${b.cur}:${n}`;
	const toggle = (n: number) => { const o = { ...open, [k(n)]: true }; setOpen(o); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* storage off */ } };
	const today = Math.min(24, new Date().getDate());
	return (
		<AltPage className="adv" brand={<>❄ Advent</>}>
			<div className="adv-app">
				<div className="adv-snow">{Array.from({ length: 60 }, (_, i) => <i key={i} style={{ left: (i * 53) % 100 + '%', animationDelay: (i % 10) * 0.7 + 's', animationDuration: 6 + (i % 5) + 's' }} />)}</div>
				<header className="adv-head"><h1>Advent of Games</h1><select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select><button onClick={() => { const o = { ...open }; for (let n = 1; n <= 24; n++) delete o[k(n)]; setOpen(o); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* storage off */ } }}>Close all doors</button></header>
				<section className="adv-board">
					{ORDER.map((n, i) => { const g = doors[n - 1]; if (!g) return <div key={n} className="adv-cell empty" />; const isOpen = open[k(n)]; return (
						<div key={n} className={'adv-cell' + (n === today ? ' today' : '') + (i % 5 === 0 ? ' wide' : '')}>
							<button data-appid={g.appid} className="adv-inside" onClick={() => select(g.appid)}><Art g={g} kind={i % 5 === 0 ? 'header' : 'capsule'} /></button>
							<button className={'adv-door' + (isOpen ? ' open' : '')} onClick={() => { toggle(n); select(g.appid); }}><span>{n}</span></button>
						</div>); })}
				</section>
				{sel && <aside className="adv-gift" key={sel.appid}><div className="adv-bow">🎁</div><h3>{sel.name}</h3><p>{sel.minutes ? `${formatPlaytime(sel.minutes)} played` : 'A brand new surprise!'}</p><PlayBtn g={sel} className="adv-go" label={['Unwrap — Play', 'Unwrap — Install']} /><Actions g={sel} /><button className="adv-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const adventCss = tok('advent', { bg: '#0F2A1E', s1: '#173A2A', s2: '#1F4A36', s3: '#285B43', fg: '#FFF8EC', fg2: '#E9D9BD', fg3: '#B8A98C', acc: '#E0393E', on: '#fff', top: '#0A1F16', font: 'Georgia, "Palatino Linotype", serif' }) + `
.adv-brand { font: 700 19px Georgia, serif; color: #FFF8EC; }
.adv-app { position: absolute; inset: 0; overflow-y: auto; background: radial-gradient(70% 60% at 50% 0%, #285B43, #0F2A1E 70%); }
.adv-snow { position: absolute; inset: 0; pointer-events: none; overflow: hidden; } .adv-snow i { position: absolute; top: -10px; width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: .7; animation: adv-fall linear infinite; } @keyframes adv-fall { to { transform: translateY(110vh) translateX(40px); } }
.adv-head { position: relative; display: flex; gap: 16px; align-items: center; justify-content: center; padding: 18px; } .adv-head h1 { margin: 0; font: italic 700 40px Georgia, serif; color: #FFF8EC; text-shadow: 0 3px 0 #E0393E; }
.adv-head select, .adv-head button { height: 34px; padding: 0 12px; border-radius: 8px; border: 0; background: #FFF8EC; font: 14px Georgia, serif; color: #0F2A1E; }
.adv-board { position: relative; display: grid; grid-template-columns: repeat(8, 1fr); grid-auto-rows: 170px; gap: 14px; max-width: 1300px; margin: 0 auto; padding: 10px 30px 60px; }
.adv-cell { position: relative; perspective: 900px; border-radius: 8px; background: #071510; box-shadow: inset 0 4px 10px rgba(0,0,0,.8); } .adv-cell.wide { grid-column: span 2; } .adv-cell.empty { background: transparent; box-shadow: none; }
.adv-inside { position: absolute; inset: 6px; border-radius: 4px; overflow: hidden; } .adv-inside img, .adv-inside .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.adv-door { position: absolute; inset: 0; border-radius: 8px; transform-origin: left center; transition: transform .9s var(--k-out); background: linear-gradient(135deg, #C62828, #8E1B1B); box-shadow: inset 0 0 0 3px #F2C14E, inset 0 0 0 6px #8E1B1B, 0 4px 10px rgba(0,0,0,.5); backface-visibility: hidden; }
.adv-cell:nth-child(3n) .adv-door { background: linear-gradient(135deg, #2E7D32, #1B5E20); } .adv-cell:nth-child(4n) .adv-door { background: linear-gradient(135deg, #F5F0E6, #D9CDB6); }
.adv-door span { font: 700 44px Georgia, serif; color: #F2C14E; text-shadow: 0 2px 0 rgba(0,0,0,.4); } .adv-cell:nth-child(4n) .adv-door span { color: #C62828; }
.adv-door:hover { transform: rotateY(-14deg); } .adv-door.open { transform: rotateY(-108deg); pointer-events: none; }
.adv-cell.today .adv-door:not(.open) { animation: adv-glow 1.6s ease-in-out infinite; } @keyframes adv-glow { 50% { box-shadow: inset 0 0 0 3px #F2C14E, inset 0 0 0 6px #8E1B1B, 0 0 30px #F2C14E; } }
.adv-gift { position: fixed; right: 26px; bottom: 26px; width: 320px; padding: 20px; border-radius: 16px; background: #FFF8EC; color: #0F2A1E; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,.5); animation: k-rise .35s var(--k-out) both; z-index: 3; }
.adv-bow { font-size: 40px; } .adv-gift h3 { margin: 6px 0 4px; font: 700 20px Georgia, serif; } .adv-gift p { margin: 0 0 12px; font: italic 14px Georgia, serif; color: #5A4B33; }
.adv-go { width: 100%; height: 46px; border-radius: 10px; background: #E0393E !important; color: #fff !important; font: 700 16px Georgia, serif !important; margin-bottom: 8px; } .adv-gift .alt-actions button { color: #0F2A1E !important; } .adv-x { margin-top: 8px; color: #C62828; font: 14px Georgia, serif; }
`;

// DREAD — survival horror. The library hangs on a pitch-black wall and only a flickering flashlight (your pointer, or
// the arrow keys) shows what is there. The chosen game's file lies on the desk as a typewritten case note; the safe
// room's ink ribbon is the Play button.
import { useRef } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { colsOf, cycle, useCursor, useKeys, useStatus } from './lk';

export function Dread() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 160);
	const c = useCursor(gs.length);
	const wall = useRef<HTMLDivElement>(null);
	const setLight = (p: { x: number; y: number }) => { wall.current?.style.setProperty('--x', p.x + 'px'); wall.current?.style.setProperty('--y', p.y + 'px'); };
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const aimAt = (n: number) => {
		const box = wall.current, el = box?.querySelector<HTMLElement>(`[data-n="${n}"]`);
		if (!box || !el) return;
		el.scrollIntoView({ block: 'nearest' });
		const r = box.getBoundingClientRect(), e = el.getBoundingClientRect();
		setLight({ x: e.left - r.left + e.width / 2, y: e.top - r.top + box.scrollTop + e.height / 2 });
	};
	useKeys((k) => {
		const cols = colsOf(wall.current);
		const go = (d: number) => { const n = Math.max(0, Math.min(gs.length - 1, c.i + d)); c.to(n); select(null); setTimeout(() => aimAt(n), 0); };
		if (k === 'left') go(-1); else if (k === 'right') go(1); else if (k === 'up') go(-cols); else if (k === 'down') go(cols);
		else if (k === 'enter' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-drd" brand={<>D R E A D</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }} searchPlaceholder="Search the dark…">
			<div className="pb-drd-app">
				<div className="pb-drd-wall" ref={wall}
					onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setLight({ x: e.clientX - r.left, y: e.clientY - r.top + e.currentTarget.scrollTop }); }}>
					<div className="pb-drd-grid">{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} data-n={n} className={n === c.i ? 'on' : ''} onMouseEnter={() => c.to(n)} onClick={() => select(x.appid)}><Art g={x} kind="capsule" /></button>
					))}</div>
									</div>
				<aside className="pb-drd-desk">
					{g ? (
						<div className="pb-drd-note" key={g.appid}>
							<p className="pb-drd-file">CASE FILE #{String(g.appid).padStart(7, '0')}</p>
							<h2>{g.name}</h2>
							<p className="pb-drd-type">Subject was last encountered <u>{formatAgo(g.lastPlayed).toLowerCase()}</u>. Total time exposed: <u>{formatPlaytime(g.minutes)}</u>.{g.minutes2w ? <> Recent activity: <u>{formatPlaytime(g.minutes2w)}</u> in the past two weeks.</> : ' No recent activity.'} Status: <b>{status.toUpperCase()}</b>.</p>
							<p className="pb-drd-warn">{g.installed ? 'It is here. In this house.' : 'It has not arrived yet.'}</p>
							<PlayBtn g={g} className="pb-drd-go" label={['Use the ink ribbon', 'Send for it']} />
							{sel && <Actions g={sel} className="pb-drd-act" />}
						</div>
					) : <p className="pb-drd-type">Nothing here…</p>}
					<nav className="pb-drd-rooms">{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); }}>{i.name}</button>)}</nav>
				</aside>
			</div>
		</AltPage>
	);
}

const tw = '"Courier New", Courier, monospace';
export const dreadCss = tok('dread', { bg: '#050404', s1: '#110D0C', s2: '#1A1412', s3: '#251C19', fg: '#D9CFC4', fg2: '#A89C90', fg3: '#6B6058', acc: '#9E1B1B', on: '#fff', top: '#050404', font: tw }) + `
.pb-drd-brand { font: 700 15px ${tw}; letter-spacing: .4em; color: #9E1B1B; text-shadow: 0 0 8px rgba(158,27,27,.6); animation: pb-drd-flick 6s infinite; }
@keyframes pb-drd-flick { 0%, 91%, 94%, 100% { opacity: 1; } 92% { opacity: .2; } 93% { opacity: .9; } 95% { opacity: .4; } }
.pb-drd-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 380px; background: #050404; color: #D9CFC4; }
.pb-drd-wall { position: relative; overflow-y: auto; scrollbar-width: none; cursor: none; } .pb-drd-wall::-webkit-scrollbar { display: none; }
.pb-drd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 22px; padding: 30px; background: repeating-linear-gradient(90deg, #0E0B0A 0 3px, #0B0908 3px 9px); }
.pb-drd-grid button { aspect-ratio: 2/3; transform: rotate(calc((var(--r, 0) * 1deg))); box-shadow: 0 10px 20px #000; } .pb-drd-grid button:nth-child(3n) { --r: 2; } .pb-drd-grid button:nth-child(5n) { --r: -3; } .pb-drd-grid button:nth-child(7n) { --r: 1.5; }
.pb-drd-grid img, .pb-drd-grid .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: sepia(.5) contrast(1.2) brightness(.8); } .pb-drd-grid button.on { outline: 1px solid rgba(158,27,27,.8); outline-offset: 4px; }
.pb-drd-wall { --x: 50%; --y: 320px; } .pb-drd-grid { -webkit-mask: radial-gradient(circle 200px at var(--x) var(--y), #000 0, rgba(0,0,0,.85) 40%, rgba(0,0,0,.05) 100%); mask: radial-gradient(circle 200px at var(--x) var(--y), #000 0, rgba(0,0,0,.85) 40%, rgba(0,0,0,.05) 100%); animation: pb-drd-torch 7s infinite; }
@keyframes pb-drd-torch { 0%, 88%, 100% { opacity: 1; } 89% { opacity: .55; } 90% { opacity: 1; } 92% { opacity: .7; } }
.pb-drd-desk { display: flex; flex-direction: column; gap: 20px; padding: 26px 22px; overflow-y: auto; background: linear-gradient(#1A1210, #0E0908); box-shadow: inset 1px 0 0 #000, inset 0 0 60px rgba(0,0,0,.8); }
.pb-drd-note { padding: 22px 20px; background: #CFC3AE; color: #2A211C; box-shadow: 0 14px 30px #000; transform: rotate(-1.2deg); background-image: radial-gradient(circle at 80% 20%, rgba(120,60,30,.25), transparent 30%), radial-gradient(circle at 15% 85%, rgba(90,40,20,.2), transparent 25%); animation: k-fade .5s both; }
.pb-drd-file { margin: 0; font: 700 11px ${tw}; letter-spacing: .2em; color: #7A2A1A; } .pb-drd-note h2 { margin: 8px 0 14px; font: 700 22px/1.15 ${tw}; text-transform: uppercase; }
.pb-drd-type { margin: 0 0 14px; font: 14.5px/1.6 ${tw}; } .pb-drd-type u { text-decoration-color: #7A2A1A; } .pb-drd-warn { margin: 0 0 18px; font: italic 700 15px ${tw}; color: #8E1414; }
.pb-drd-go { width: 100%; height: 44px; background: #2A211C !important; color: #CFC3AE !important; font: 700 14px ${tw} !important; letter-spacing: .08em; box-shadow: inset 0 0 0 1px #000; } .pb-drd-go:hover { background: #8E1414 !important; }
.pb-drd-act { margin-top: 12px; } .pb-drd-act button { font-family: ${tw} !important; color: #2A211C !important; } .pb-drd-act button:hover { background: rgba(0,0,0,.08) !important; }
.pb-drd-rooms { display: flex; flex-wrap: wrap; gap: 6px; } .pb-drd-rooms button { padding: 6px 10px; font: 12px ${tw}; color: #6B6058; box-shadow: inset 0 0 0 1px #251C19; } .pb-drd-rooms button:hover { color: #D9CFC4; } .pb-drd-rooms button.on { color: #D9CFC4; box-shadow: inset 0 0 0 1px #9E1B1B; }
`;

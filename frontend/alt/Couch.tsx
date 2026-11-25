// COUCH — a ten-foot TV interface for playing from the sofa: huge type, a big glowing focus ring, collection tabs on
// the bumpers and a full-screen game page where every action is a large button. Built for a controller or arrow keys.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Hints, cycle, colsOf, facts, hhmm, useClock, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Couch() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games;
	const c = useCursor(gs.length);
	const [btn, setBtn] = useState(0);
	const grid = useRef<HTMLDivElement>(null);
	const clock = useClock();
	const status = useStatus(sel);
	useKeepInView(grid, '.kf', c.i, c.keyMoved, 'center');
	useEffect(() => setBtn(0), [sel?.appid]);
	const cmds = sel ? gameCommands(sel) : [];
	useKeys((k) => {
		if (sel) {
			if (k === 'back') select(null); else if (k === 'up') setBtn((x) => Math.max(0, x - 1)); else if (k === 'down') setBtn((x) => Math.min(cmds.length - 1, x + 1));
			else if (k === 'enter') cmds[btn]?.run(); else return false;
			return;
		}
		const cols = colsOf(grid.current);
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
		else if (k === 'enter') { const g = gs[c.i]; if (g) select(g.appid); }
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); }
		else return false;
	});
	return (
		<AltPage className="pb-couch" brand={<>{hhmm(clock)}</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-couch-app">
				{sel ? (
					<section className="pb-couch-page" key={sel.appid}>
						<Backdrop g={sel} className="pb-couch-bd" /><div className="pb-couch-shade" />
						<Art g={sel} kind="capsule" className="pb-couch-box" />
						<div className="pb-couch-info">
							<p className="pb-couch-st">{status}</p>
							<h1>{sel.name}</h1>
							<p className="pb-couch-sub">{formatPlaytime(sel.minutes)} played · {formatAgo(sel.lastPlayed)}</p>
							<div className="pb-couch-menu">{cmds.map((m, n) => (
								<button key={m.id} className={(m.primary ? 'pri' : '') + (n === btn ? ' kf' : '')} onMouseEnter={() => setBtn(n)} onClick={m.run}><Icon name={m.icon} size={m.primary ? 28 : 22} />{m.label}</button>
							))}</div>
							<dl>{facts(sel).slice(2).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
						</div>
						<Hints className="pb-couch-hints" items={[['A', 'Select'], ['B', 'Back'], ['▲ ▼', 'Move']]} />
					</section>
				) : (
					<>
						<nav className="pb-couch-tabs"><kbd>LB</kbd>{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); }}>{i.name}</button>)}<kbd>RB</kbd></nav>
						<div className="pb-couch-grid" ref={grid}>{gs.map((g, n) => (
							<button key={g.appid} data-appid={g.appid} className={'pb-couch-tile' + (n === c.i ? ' kf' : '')} onMouseEnter={() => c.to(n)} onClick={() => select(g.appid)}>
								<Art g={g} kind="capsule" />{!g.installed && <i className="pb-couch-dl"><Icon name="install" size={18} /></i>}
								<span>{g.name}</span>
							</button>
						))}{!gs.length && <p className="lk-empty">No games here.</p>}</div>
						<Hints className="pb-couch-hints" items={[['A', 'Open'], ['LB RB', 'Collections'], ['✚', 'Move']]} />
					</>
				)}
			</div>
		</AltPage>
	);
}

export const couchCss = tok('couch', { bg: '#0E1421', s1: '#18223A', s2: '#22304F', s3: '#2D3E64', fg: '#FFFFFF', fg2: '#D3DCEE', fg3: '#8C9AB8', acc: '#5CC8FF', on: '#04111C', top: '#0E1421', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="couch"] .k-top { border: 0; }
.pb-couch-brand { font: 600 22px var(--k-text); color: #fff; }
.pb-couch-app { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(90% 70% at 50% 0%, #1B2A4A, #0E1421 70%); color: #fff; }
.pb-couch-tabs { display: flex; align-items: center; gap: 6px; padding: 18px 60px 10px; overflow-x: auto; scrollbar-width: none; } .pb-couch-tabs::-webkit-scrollbar { display: none; }
.pb-couch-tabs kbd { flex: none; padding: 4px 10px; border-radius: 8px; background: rgba(255,255,255,.12); font: 800 13px var(--k-text); color: #8C9AB8; }
.pb-couch-tabs button { flex: none; padding: 8px 18px; border-radius: 99px; font: 600 24px var(--k-text); color: #8C9AB8; white-space: nowrap; } .pb-couch-tabs button:hover { color: #fff; } .pb-couch-tabs button.on { color: #04111C; background: #fff; }
.pb-couch-grid { position: absolute; top: 76px; left: 0; right: 0; bottom: 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 34px 28px; align-content: start; padding: 26px 60px 60px; overflow-y: auto; scrollbar-width: none; } .pb-couch-grid::-webkit-scrollbar { display: none; }
.pb-couch-tile { position: relative; display: grid; gap: 12px; text-align: left; transition: transform .2s var(--k-out); }
.pb-couch-tile img, .pb-couch-tile .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.45); transition: box-shadow .2s; }
.pb-couch-tile span { font: 600 18px var(--k-text); color: #D3DCEE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: .75; }
.pb-couch-tile.kf { transform: scale(1.08); z-index: 1; } .pb-couch-tile.kf img { box-shadow: 0 0 0 5px #fff, 0 0 40px 6px rgba(92,200,255,.55), 0 20px 50px rgba(0,0,0,.6); animation: pb-couch-glow 1.6s ease-in-out infinite alternate; } .pb-couch-tile.kf span { opacity: 1; color: #fff; }
@keyframes pb-couch-glow { to { box-shadow: 0 0 0 5px #fff, 0 0 60px 12px rgba(92,200,255,.7), 0 20px 50px rgba(0,0,0,.6); } }
.pb-couch-dl { position: absolute; right: 10px; top: 10px; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,.65); }
.pb-couch-hints { position: absolute; left: 60px; right: 60px; bottom: 0; height: 64px; justify-content: flex-end; font-size: 16px; color: #D3DCEE; border-top: 1px solid rgba(255,255,255,.08); } .pb-couch-hints kbd { min-width: 30px; height: 30px; font-size: 13px; }
.pb-couch-page { position: absolute; inset: 0; display: grid; grid-template-columns: auto 1fr; gap: 60px; align-items: center; padding: 0 80px 64px; animation: k-fade .35s both; }
.pb-couch-bd { opacity: .4; } .pb-couch-shade { position: absolute; inset: 0; background: linear-gradient(90deg, #0E1421 20%, rgba(14,20,33,.6)), linear-gradient(0deg, #0E1421, transparent 50%); }
.pb-couch-box { position: relative; width: min(340px, 26vw); border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.7); }
.pb-couch-info { position: relative; } .pb-couch-st { margin: 0; font: 700 16px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: #5CC8FF; }
.pb-couch-info h1 { margin: 8px 0 6px; font: 700 56px/1.05 var(--k-text); } .pb-couch-sub { margin: 0 0 30px; font: 22px var(--k-text); color: #D3DCEE; }
.pb-couch-menu { display: grid; gap: 10px; width: min(460px, 100%); } .pb-couch-menu button { display: flex; align-items: center; gap: 16px; height: 58px; padding: 0 24px; border-radius: 14px; background: rgba(255,255,255,.08); font: 600 21px var(--k-text); color: #D3DCEE; transition: transform .15s, background .15s; }
.pb-couch-menu button.pri { height: 76px; font-size: 28px; color: #fff; background: rgba(92,200,255,.22); } .pb-couch-menu button.kf { background: #fff; color: #04111C; transform: scale(1.03); box-shadow: 0 0 30px rgba(92,200,255,.5); }
.pb-couch-info dl { display: flex; gap: 40px; margin: 34px 0 0; } .pb-couch-info dt { font: 600 14px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #8C9AB8; } .pb-couch-info dd { margin: 4px 0 0; font: 600 20px var(--k-text); }
`;

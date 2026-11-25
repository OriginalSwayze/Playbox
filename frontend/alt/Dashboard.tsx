// DASHBOARD — a console home screen. The focused game's key art fills the screen, a row of tiles runs across the top
// third, and its logo, status and actions sit below. Arrows move along the row, down (or Enter) drops into the actions,
// bumpers / Page Up-Down change collection, Y / Tab opens the full game card.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, Hints, Logo, cycle, facts, hhmm, useClock, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Dashboard() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const games = b.games.slice(0, 60);
	const c = useCursor(games.length);
	const [zone, setZone] = useState<'row' | 'act'>('row');
	const [act, setAct] = useState(0);
	const row = useRef<HTMLDivElement>(null);
	const clock = useClock();
	const g = sel ?? games[c.i];
	const status = useStatus(g);
	const cmds = g ? [...gameCommands(g).slice(0, sel ? 5 : 2), ...(sel ? [] : [{ id: 'more', label: 'Game info', icon: 'menu', primary: false, run: () => select(g.appid) }])] : [];
	useKeepInView(row, '.on', c.i, c.keyMoved, 'center');
	useKeys((k) => {
		if (k === 'back' && sel) { select(null); return; }
		if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); setZone('row'); return; }
		if (k === 'menu' && g) { select(sel ? null : g.appid); return; }
		if (zone === 'row') {
			if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'down' || k === 'enter') { setZone('act'); setAct(0); } else return false;
		} else {
			if (k === 'up' || k === 'back') setZone('row'); else if (k === 'left') setAct((a) => Math.max(0, a - 1)); else if (k === 'right') setAct((a) => Math.min(cmds.length - 1, a + 1)); else if (k === 'enter') cmds[act]?.run(); else if (k !== 'down') return false;
		}
	});
	return (
		<AltPage className="pb-dash" brand={<>{hhmm(clock)}</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-dash-app">
				<Backdrop g={g} className="pb-dash-bd" />
				<div className="pb-dash-shade" />
				<Chips b={b} className="pb-dash-chips" onPick={() => { c.to(0); select(null); }} />
				<div className="pb-dash-row" ref={row}>{games.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={'pb-dash-tile' + (n === c.i ? ' on' : '') + (zone === 'row' && n === c.i ? ' kf' : '')} onClick={() => { setZone('row'); if (n === c.i) select(x.appid); else { c.to(n); if (sel) select(null); } }}>
						<Art g={x} kind="header" />{x.busy && <i className="pb-dash-bar" style={{ width: x.progress + '%' }} />}
					</button>
				))}</div>
				{g && (
					<section className={'pb-dash-info' + (sel ? ' full' : '')} key={g.appid}>
						<Logo g={g} className="pb-dash-logo" />
						<p className="pb-dash-meta"><i className={status === 'Ready to play' || status === 'Running' ? 'ok' : ''} />{status}<span>·</span>{g.minutes ? formatPlaytime(g.minutes) + ' played' : 'Not played yet'}{g.lastPlayed ? <><span>·</span>{formatAgo(g.lastPlayed)}</> : null}</p>
						<div className="pb-dash-acts">{cmds.map((m, n) => (
							<button key={m.id} className={(m.primary ? 'pri' : '') + (zone === 'act' && n === act ? ' kf' : '')} onClick={m.run} onMouseEnter={() => { setZone('act'); setAct(n); }}><Icon name={m.icon} size={m.primary ? 20 : 17} />{m.label}</button>
						))}</div>
						{sel && <dl className="pb-dash-facts">{facts(g).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
					</section>
				)}
				<Hints className="pb-dash-hints" items={[['◀ ▶', 'Browse'], ['A', 'Select'], ['Y', sel ? 'Close' : 'Game info'], ['LB RB', 'Collection']]} />
			</div>
		</AltPage>
	);
}

export const dashboardCss = tok('dashboard', { bg: '#05070C', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.82)', fg3: 'rgba(255,255,255,.56)', acc: '#FFFFFF', on: '#05070C', top: 'transparent', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="dashboard"] .k-top { position: relative; z-index: 3; border: 0; background: linear-gradient(rgba(0,0,0,.55), transparent); }
.pb-dash-brand { font: 600 18px var(--k-text); color: #fff; letter-spacing: .02em; }
.pb-dash-app { position: absolute; inset: 0; overflow: hidden; color: #fff; background: #05070C; }
.pb-dash-bd img { transform: scale(1.04); animation: k-fade .7s ease both, pb-dash-drift 30s ease-in-out infinite alternate; } @keyframes pb-dash-drift { to { transform: scale(1.1) translateX(-1.5%); } }
.pb-dash-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(3,5,10,.92) 0%, rgba(3,5,10,.55) 45%, rgba(3,5,10,.1) 75%), linear-gradient(0deg, rgba(3,5,10,.95), transparent 45%); }
.pb-dash-chips { position: absolute; left: 56px; right: 56px; top: 14px; z-index: 2; } .pb-dash-chips button { background: rgba(0,0,0,.35); } .pb-dash-chips button.on { background: #fff; color: #05070C; }
.pb-dash-row { position: absolute; left: 0; right: 0; top: 64px; z-index: 2; display: flex; gap: 14px; align-items: flex-start; padding: 14px 56px 26px; overflow-x: auto; scrollbar-width: none; scroll-padding: 0 56px; } .pb-dash-row::-webkit-scrollbar { display: none; }
.pb-dash-tile { position: relative; flex: none; width: 168px; height: 96px; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.08); box-shadow: 0 8px 24px rgba(0,0,0,.4); transition: width .3s var(--k-out), height .3s var(--k-out), transform .2s; }
.pb-dash-tile img, .pb-dash-tile .alt-noart { width: 100%; height: 100%; object-fit: cover; } .pb-dash-tile:hover { transform: translateY(-3px); }
.pb-dash-tile.on { width: 252px; height: 136px; box-shadow: 0 0 0 3px #fff, 0 14px 40px rgba(0,0,0,.6); } .pb-dash-tile.on:not(.kf) { box-shadow: 0 0 0 2px rgba(255,255,255,.55), 0 14px 40px rgba(0,0,0,.6); }
.pb-dash-bar { position: absolute; left: 0; bottom: 0; height: 4px; background: #4CC2FF; }
.pb-dash-info { position: absolute; left: 56px; bottom: 76px; z-index: 2; width: min(720px, 60%); animation: k-rise .5s var(--k-out) both; }
.pb-dash-logo { display: block; height: 130px; max-width: 460px; margin-bottom: 16px; } .pb-dash-logo img { height: 100%; } .pb-dash-logo.lk-logotext { height: auto; font-size: 46px; }
.pb-dash-meta { display: flex; align-items: center; gap: 8px; margin: 0 0 18px; font: 500 15px var(--k-text); color: rgba(255,255,255,.85); } .pb-dash-meta span { opacity: .5; }
.pb-dash-meta i { width: 9px; height: 9px; border-radius: 50%; background: #9AA3B2; } .pb-dash-meta i.ok { background: #3DDC84; box-shadow: 0 0 10px #3DDC84; }
.pb-dash-acts { display: flex; flex-wrap: wrap; gap: 10px; } .pb-dash-acts button { display: flex; align-items: center; gap: 9px; height: 46px; padding: 0 20px; border-radius: 99px; background: rgba(255,255,255,.14); color: #fff; font: 600 15px var(--k-text); transition: transform .15s, background .15s; }
.pb-dash-acts button.pri { height: 52px; padding: 0 30px; background: #fff; color: #05070C; font-size: 17px; } .pb-dash-acts button:hover { background: rgba(255,255,255,.24); } .pb-dash-acts button.pri:hover { background: #E8ECF4; }
.pb-dash-acts button.kf { transform: scale(1.06); box-shadow: 0 0 0 3px rgba(255,255,255,.9), 0 0 24px rgba(255,255,255,.35); }
.pb-dash-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 22px 0 0; } .pb-dash-facts div { padding: 12px 14px; border-radius: 12px; background: rgba(0,0,0,.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.pb-dash-facts dt { font: 600 11px var(--k-text); text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.55); } .pb-dash-facts dd { margin: 4px 0 0; font: 600 17px var(--k-text); }
.pb-dash-hints { position: absolute; right: 56px; bottom: 24px; z-index: 2; }
`;

// SPOTLIGHT — one game at a time, full screen. Its key art fills the window with the logo and actions on the left; a
// strip of covers along the bottom flips to the next. Arrows flip, Enter opens the details panel, Enter again plays.
import { useRef } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, Logo, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Spotlight() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 80);
	const c = useCursor(gs.length);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const strip = useRef<HTMLDivElement>(null);
	useKeepInView(strip, '.on', c.i, c.keyMoved, 'center');
	useKeys((k) => {
		if (k === 'left' || k === 'right') { c.move(k === 'left' ? -1 : 1, true); if (sel) select(null); }
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); }
		else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); select(null); }
		else return false;
	});
	return (
		<AltPage className="pb-spot" brand={<>SPOTLIGHT</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-spot-app">
				<Backdrop g={g} className="pb-spot-bd" />
				<div className="pb-spot-shade" />
				<Chips b={b} className="pb-spot-chips" onPick={() => { c.to(0); select(null); }} />
				{g && (
					<section className="pb-spot-copy" key={g.appid}>
						<p className="pb-spot-pill"><i className={/Ready|Running/.test(status) ? 'ok' : ''} />{status}</p>
						<Logo g={g} className="pb-spot-logo" />
						<ul className="pb-spot-stats">
							<li><b>{g.minutes ? formatPlaytime(g.minutes) : '—'}</b><span>played</span></li>
							<li><b>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</b><span>last session</span></li>
							<li><b>{g.minutes2w ? formatPlaytime(g.minutes2w) : '—'}</b><span>past two weeks</span></li>
						</ul>
						<div className="pb-spot-btns"><PlayBtn g={g} className="pb-spot-play"><Icon name={g.installed ? 'play' : 'install'} size={20} /></PlayBtn>
							<button className="pb-spot-det" onClick={() => select(sel ? null : g.appid)}><Icon name="menu" size={18} />{sel ? 'Hide details' : 'Details'}</button></div>
					</section>
				)}
				{sel && <aside className="pb-spot-panel"><h3>{sel.name}</h3><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-spot-act" /></aside>}
				<div className="pb-spot-foot">
					<span className="pb-spot-count"><b>{String(c.i + 1).padStart(2, '0')}</b> / {String(gs.length).padStart(2, '0')}</span>
					<div className="pb-spot-strip" ref={strip}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); if (sel) select(null); }}><Art g={x} kind="capsule" /></button>
					))}</div>
				</div>
			</div>
		</AltPage>
	);
}

export const spotlightCss = tok('spotlight', { bg: '#07080B', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.8)', fg3: 'rgba(255,255,255,.55)', acc: '#FFD24A', on: '#1A1200', top: 'transparent', font: '"Bahnschrift", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="spotlight"] .k-top { position: relative; z-index: 3; border: 0; background: linear-gradient(rgba(0,0,0,.6), transparent); }
.pb-spot-brand { font: 700 16px var(--k-text); letter-spacing: .4em; color: #fff; }
.pb-spot-app { position: absolute; inset: 0; overflow: hidden; background: #07080B; color: #fff; }
.pb-spot-bd img { animation: k-fade .8s ease both, pb-spot-zoom 14s ease-out both; } @keyframes pb-spot-zoom { from { transform: scale(1.08); } }
.pb-spot-shade { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(5,6,9,.94) 0%, rgba(5,6,9,.6) 38%, transparent 70%), linear-gradient(0deg, rgba(5,6,9,.96) 0%, transparent 38%); }
.pb-spot-chips { position: absolute; top: 16px; left: 60px; right: 60px; z-index: 2; } .pb-spot-chips button { background: rgba(0,0,0,.4); }
.pb-spot-copy { position: absolute; left: 60px; top: 14%; width: min(600px, 48%); z-index: 2; }
.pb-spot-copy > * { animation: k-rise .55s var(--k-out) both; } .pb-spot-copy > :nth-child(2) { animation-delay: .06s; } .pb-spot-copy > :nth-child(3) { animation-delay: .12s; } .pb-spot-copy > :nth-child(4) { animation-delay: .18s; }
.pb-spot-pill { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 22px; padding: 6px 14px; border-radius: 99px; background: rgba(0,0,0,.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,.15); font: 600 13px var(--k-text); letter-spacing: .06em; text-transform: uppercase; }
.pb-spot-pill i { width: 8px; height: 8px; border-radius: 50%; background: #8E96A3; } .pb-spot-pill i.ok { background: #FFD24A; box-shadow: 0 0 10px #FFD24A; }
.pb-spot-logo { display: block; height: 170px; max-width: 100%; } .pb-spot-logo img { height: 100%; } .pb-spot-logo.lk-logotext { height: auto; font: 700 58px var(--k-text); text-transform: uppercase; }
.pb-spot-stats { display: flex; gap: 34px; margin: 26px 0 28px; padding: 0; list-style: none; } .pb-spot-stats b { display: block; font: 600 24px var(--k-text); } .pb-spot-stats span { font: 500 12px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.55); }
.pb-spot-btns { display: flex; gap: 12px; } .pb-spot-play { display: flex; align-items: center; gap: 10px; height: 54px; padding: 0 34px; background: #FFD24A !important; color: #1A1200 !important; font: 700 18px var(--k-text) !important; letter-spacing: .1em; text-transform: uppercase; clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%); } .pb-spot-play:hover { filter: brightness(1.08); }
.pb-spot-det { display: flex; align-items: center; gap: 9px; height: 54px; padding: 0 24px; background: rgba(255,255,255,.12); color: #fff; font: 600 15px var(--k-text); letter-spacing: .08em; text-transform: uppercase; clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%); } .pb-spot-det:hover { background: rgba(255,255,255,.2); }
.pb-spot-panel { position: absolute; right: 40px; top: 70px; bottom: 170px; z-index: 2; width: 330px; padding: 22px; overflow-y: auto; background: rgba(8,9,12,.86); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); animation: pb-spot-in .35s var(--k-out) both; } @keyframes pb-spot-in { from { transform: translateX(30px); opacity: 0; } }
.pb-spot-panel h3 { margin: 0 0 16px; font: 600 20px var(--k-text); } .pb-spot-panel dl { margin: 0 0 16px; } .pb-spot-panel dl div { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.08); font: 14px var(--k-text); } .pb-spot-panel dt { color: rgba(255,255,255,.55); } .pb-spot-panel dd { margin: 0; font-weight: 600; }
.pb-spot-act button { color: #eee !important; } .pb-spot-act button:hover { background: rgba(255,255,255,.1) !important; }
.pb-spot-foot { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex; align-items: flex-end; gap: 24px; padding: 0 0 22px 60px; }
.pb-spot-count { flex: none; padding-bottom: 8px; font: 500 14px var(--k-text); color: rgba(255,255,255,.5); } .pb-spot-count b { font: 600 30px var(--k-text); color: #fff; }
.pb-spot-strip { display: flex; gap: 10px; align-items: flex-end; padding: 14px 60px 4px 4px; overflow-x: auto; scrollbar-width: none; } .pb-spot-strip::-webkit-scrollbar { display: none; }
.pb-spot-strip button { flex: none; width: 66px; aspect-ratio: 2/3; overflow: hidden; border-radius: 4px; opacity: .55; transition: width .3s var(--k-out), opacity .2s, transform .2s; } .pb-spot-strip button:hover { opacity: .9; transform: translateY(-4px); }
.pb-spot-strip img, .pb-spot-strip .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 7px; } .pb-spot-strip button.on { width: 92px; opacity: 1; box-shadow: 0 0 0 2px #FFD24A, 0 8px 24px rgba(0,0,0,.6); }
`;

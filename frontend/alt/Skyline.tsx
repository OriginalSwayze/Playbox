// SKYLINE — a city builder at night. Every game is a building, taller the more you have played it, with lit windows
// for recent activity and a billboard of its art on the roof; collections are districts along the street. Scroll
// sideways through the city, arrows step from building to building, Enter opens its info, Enter again plays.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useIslands, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const height = (g: Game) => 70 + Math.min(330, Math.sqrt(g.minutes) * 6);
const HUES = [205, 30, 280, 160, 340, 50, 120, 0];

export function Skyline() {
	const islands = useIslands();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const districts = useMemo(() => (found ? [{ id: 'q', name: 'Search', games: found }] : islands).slice(0, 10).map((d, i) => ({ ...d, hue: HUES[i % HUES.length], games: d.games.slice(0, 24) })), [found, islands]);
	const flat = districts.flatMap((d) => d.games.map((g) => ({ g, d })));
	const c = useCursor(flat.length);
	const city = useRef<HTMLDivElement>(null);
	useKeepInView(city, '.on', c.i, c.keyMoved, 'center');
	const cur = flat[c.i];
	const g = sel ?? cur?.g;
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'left' || k === 'up') { c.move(-1); select(null); } else if (k === 'right' || k === 'down') { c.move(1); select(null); }
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { const di = cur ? districts.indexOf(cur.d) : 0; const nd = districts[(di + (k === 'next' ? 1 : -1) + districts.length) % districts.length]; const n = flat.findIndex((x) => x.d === nd); if (n >= 0) c.to(n, true); } else return false;
	});
	let n = -1;
	return (
		<AltPage className="pb-sky" brand={<>▦ SKYLINE</>} search={q} onSearch={(v) => { setQ(v); c.to(0); }}>
			<div className="pb-sky-app">
				<div className="pb-sky-moon" /><div className="pb-sky-far" />
				<div className="pb-sky-city" ref={city} onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY; }}>
					{districts.map((d) => (
						<section key={d.id} className="pb-sky-dist" style={{ ['--h' as string]: d.hue }}>
							<div className="pb-sky-row">{d.games.map((x) => { n++; const i = n; const h = height(x); const lit = Math.min(1, x.minutes2w / 600 + (x.lastPlayed && Date.now() / 1000 - x.lastPlayed < 86400 * 30 ? 0.3 : 0.05));
								return (
									<button key={x.appid} data-appid={x.appid} className={'pb-sky-bld' + (i === c.i ? ' on' : '') + (x.installed ? '' : ' plan')} style={{ height: h, ['--lit' as string]: lit, ['--w' as string]: 64 + (x.appid % 3) * 14 + 'px' }} onClick={() => (i === c.i ? select(sel ? null : x.appid) : (c.to(i), select(null)))} title={x.name}>
										<span className="pb-sky-sign"><Art g={x} kind="header" /></span><i className="pb-sky-win" />
									</button>
								); })}</div>
							<p className="pb-sky-dname">{d.name}<small>{d.games.length} buildings</small></p>
						</section>
					))}
				</div>
				<div className="pb-sky-street" />
				{g && (
					<aside className={'pb-sky-card' + (sel ? ' open' : '')} key={g.appid}>
						<p className="pb-sky-dl">{cur && !sel ? cur.d.name.toUpperCase() + ' DISTRICT' : 'BUILDING'} · {Math.round(height(g) / 4)} FLOORS</p>
						<h2>{g.name}</h2><p className="pb-sky-st">{g.installed ? 'Built' : 'Planned (not installed)'} · {status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
						<div className="pb-sky-btns"><PlayBtn g={g} className="pb-sky-go" label={['Visit (Play)', 'Construct (Install)']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'Close' : 'Inspect'}</button></div>
						{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-sky-act" /></>}
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const skylineCss = tok('skyline', { bg: '#070B1E', s1: 'rgba(160,190,255,.08)', s2: 'rgba(160,190,255,.16)', s3: 'rgba(160,190,255,.24)', fg: '#EEF2FF', fg2: '#B9C3E6', fg3: '#6F7BA8', acc: '#FFC857', on: '#1F1500', top: '#050816', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
.pb-sky-brand { font: 700 15px var(--k-text); letter-spacing: .3em; color: #FFC857; }
.pb-sky-app { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(#050816, #142052 60%, #2A2B5E 85%); color: #EEF2FF; }
.pb-sky-moon { position: absolute; right: 12%; top: 8%; width: 70px; height: 70px; border-radius: 50%; background: #F4F1DE; box-shadow: 0 0 60px 10px rgba(244,241,222,.35); }
.pb-sky-far { position: absolute; left: 0; right: 0; bottom: 60px; height: 45%; opacity: .35; background: linear-gradient(#0A1030, #0A1030) 0 100% / 100% 30% no-repeat, repeating-linear-gradient(90deg, #0A1030 0 40px, transparent 40px 46px, #0A1030 46px 70px, transparent 70px 90px); mask: linear-gradient(transparent 20%, #000 60%); -webkit-mask: linear-gradient(transparent 20%, #000 60%); }
.pb-sky-city { position: absolute; left: 0; right: 0; top: 0; bottom: 60px; display: flex; align-items: flex-end; gap: 60px; padding: 0 80px; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; }
.pb-sky-dist { flex: none; display: grid; justify-items: center; } .pb-sky-row { display: flex; align-items: flex-end; gap: 6px; }
.pb-sky-dname { margin: 8px 0 0; font: 600 13px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: hsl(var(--h) 80% 75%); white-space: nowrap; } .pb-sky-dname small { margin-left: 8px; font-weight: 400; letter-spacing: 0; text-transform: none; color: #6F7BA8; }
.pb-sky-bld { position: relative; flex: none; width: var(--w); background: linear-gradient(90deg, hsl(var(--h) 30% 14%), hsl(var(--h) 30% 20%) 50%, hsl(var(--h) 30% 11%)); box-shadow: inset 0 0 0 1px rgba(255,255,255,.05); transition: transform .2s, filter .2s; transform-origin: bottom; border-radius: 3px 3px 0 0; }
.pb-sky-win { position: absolute; inset: 34px 8px 8px; background-image: radial-gradient(rgba(255,210,120,var(--lit)) 0 2.5px, transparent 3px); background-size: 12px 14px; }
.pb-sky-bld.plan { background: repeating-linear-gradient(0deg, rgba(160,190,255,.18) 0 1px, transparent 1px 14px), repeating-linear-gradient(90deg, rgba(160,190,255,.18) 0 1px, transparent 1px 12px); box-shadow: inset 0 0 0 1px rgba(160,190,255,.35); } .pb-sky-bld.plan .pb-sky-win { display: none; }
.pb-sky-sign { position: absolute; left: -4px; right: -4px; top: 4px; height: 26px; overflow: hidden; border-radius: 2px; box-shadow: 0 0 10px rgba(255,255,255,.15); } .pb-sky-sign img, .pb-sky-sign .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 5px; filter: brightness(.9); }
.pb-sky-bld:hover { filter: brightness(1.3); } .pb-sky-bld.on { filter: brightness(1.45); z-index: 1; box-shadow: inset 0 0 0 1px rgba(255,200,87,.8), 0 0 30px rgba(255,200,87,.35); } .pb-sky-bld.on .pb-sky-sign { box-shadow: 0 0 0 2px #FFC857, 0 0 20px #FFC857; }
.pb-sky-bld.on::after { content: "▼"; position: absolute; left: 50%; top: -30px; transform: translateX(-50%); color: #FFC857; font-size: 16px; animation: pb-sky-bob .7s ease-in-out infinite alternate; } @keyframes pb-sky-bob { to { transform: translate(-50%, -6px); } }
.pb-sky-street { position: absolute; left: 0; right: 0; bottom: 0; height: 60px; background: linear-gradient(#1A1A26, #0C0C14); box-shadow: 0 -2px 0 #2E2E40; } .pb-sky-street::after { content: ""; position: absolute; left: 0; right: 0; top: 28px; height: 3px; background: repeating-linear-gradient(90deg, #FFC857 0 30px, transparent 30px 60px); opacity: .6; }
.pb-sky-card { position: absolute; left: 30px; top: 20px; z-index: 3; width: min(420px, 40%); padding: 18px 20px; border-radius: 12px; background: rgba(5,8,22,.85); box-shadow: inset 0 0 0 1px rgba(255,200,87,.3); animation: k-rise .3s var(--k-out) both; }
.pb-sky-dl { margin: 0 0 6px; font: 600 11px var(--k-text); letter-spacing: .18em; color: #FFC857; } .pb-sky-card h2 { margin: 0 0 4px; font: 600 24px/1.15 var(--k-text); } .pb-sky-st { margin: 0 0 14px; font: 13px var(--k-text); color: #B9C3E6; }
.pb-sky-btns { display: flex; gap: 10px; } .pb-sky-go { height: 40px; padding: 0 22px; border-radius: 99px; background: #FFC857 !important; color: #1F1500 !important; font: 700 14px var(--k-text) !important; } .pb-sky-btns > button:last-child { padding: 0 18px; border-radius: 99px; background: rgba(160,190,255,.12); font: 600 13px var(--k-text); color: #EEF2FF; }
.pb-sky-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0 10px; } .pb-sky-card dt { font: 11px var(--k-text); color: #6F7BA8; } .pb-sky-card dd { margin: 2px 0 0; font: 600 14px var(--k-text); }
.pb-sky-act button { color: #B9C3E6 !important; }
`;

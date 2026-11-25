// GALAXY — a space-sim star map. Each collection is a star system; its games are planets on orbits, sized by hours
// and spinning at their own pace. The galaxy view shows every system; click (or Enter) to warp into one, pick a
// planet to see its survey, Esc to warp back out.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useIslands, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useKeys, useStatus } from './lk';

const HUES = [40, 200, 330, 120, 270, 15, 180, 60, 300, 90];
const size = (g: Game) => 26 + Math.min(54, Math.sqrt(g.minutes) * 1.4);

export function Galaxy() {
	const all = useIslands();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const systems = useMemo(() => (found ? [{ id: 'q', name: 'Search results', games: found }] : all).slice(0, 12).map((s, i) => ({ ...s, hue: HUES[i % HUES.length], games: s.games.slice(0, 14) })), [found, all]);
	const [sys, setSys] = useState<number | null>(null);
	const [hot, setHot] = useState(0);
	const [p, setP] = useState(0);
	const open = sys !== null ? systems[Math.min(sys, systems.length - 1)] : null;
	const planet = sel ?? open?.games[Math.min(p, (open?.games.length ?? 1) - 1)];
	const status = useStatus(planet);
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (!open) {
			if (k === 'left' || k === 'up') setHot((h) => (h - 1 + systems.length) % systems.length); else if (k === 'right' || k === 'down') setHot((h) => (h + 1) % systems.length);
			else if (k === 'enter' && systems.length) { setSys(hot); setP(0); } else return false;
		} else {
			if (k === 'left' || k === 'up') setP((x) => Math.max(0, x - 1)); else if (k === 'right' || k === 'down') setP((x) => Math.min(open.games.length - 1, x + 1));
			else if (k === 'enter' && planet) select(planet.appid); else if (k === 'back') setSys(null); else return false;
		}
	});
	const cols = Math.ceil(Math.sqrt(systems.length));
	return (
		<AltPage className="pb-gal" brand={<>✶ GALAXY</>} search={q} onSearch={(v) => { setQ(v); setSys(v ? 0 : null); setP(0); }}>
			<div className="pb-gal-app">
				<div className="pb-gal-stars" /><div className="pb-gal-stars b" />
				{!open ? (
					<div className="pb-gal-map" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
						{systems.map((s, i) => (
							<button key={s.id} className={'pb-gal-sys' + (i === hot ? ' on' : '')} style={{ ['--h' as string]: s.hue }} onMouseEnter={() => setHot(i)} onClick={() => { setSys(i); setP(0); }}>
								<i className="pb-gal-sun" />{s.games.slice(0, 6).map((g, k) => <i key={g.appid} className="pb-gal-dot" style={{ ['--r' as string]: 30 + k * 9 + 'px', ['--t' as string]: 6 + k * 3 + 's' }} />)}
								<span><b>{s.name}</b><em>{s.games.length} planets</em></span>
							</button>
						))}
					</div>
				) : (
					<div className="pb-gal-system" key={open.id} style={{ ['--h' as string]: open.hue }}>
						<button className="pb-gal-back" onClick={() => setSys(null)}>← Galaxy</button>
						<h2>{open.name}</h2>
						<div className="pb-gal-orbits">
							<i className="pb-gal-star" />
							{open.games.map((g, k) => {
								const r = 70 + k * 22, t = 40 + k * 14;
								return (
									<div key={g.appid} className="pb-gal-orbit" style={{ width: r * 2, height: r * 2, ['--t' as string]: t + 's', animationDelay: -(g.appid % t) + 's' }}>
										<button data-appid={g.appid} className={'pb-gal-planet' + (planet?.appid === g.appid ? ' on' : '')} style={{ width: size(g), height: size(g), ['--t' as string]: t + 's', animationDelay: -(g.appid % t) + 's' }} onClick={() => { setP(k); select(g.appid); }} onMouseEnter={() => setP(k)} title={g.name}>
											<Art g={g} kind="capsule" />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				)}
				{planet && (open || sel) && (
					<aside className="pb-gal-survey" key={planet.appid}>
						<p className="pb-gal-cls">PLANET SURVEY{open ? ' · ' + open.name.toUpperCase() : ''}</p>
						<Art g={planet} kind="header" className="pb-gal-img" />
						<h3>{planet.name}</h3>
						<p className="pb-gal-st">{status} · {formatPlaytime(planet.minutes)} · {formatAgo(planet.lastPlayed)}</p>
						<PlayBtn g={planet} className="pb-gal-go" label={['Land', 'Send probe (install)']} />
						{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-gal-act" /></>}
						{!sel && <button className="pb-gal-more" onClick={() => select(planet.appid)}>Full survey</button>}
					</aside>
				)}
				{!open && <p className="pb-gal-hint">{systems[hot]?.name} · ⏎ warp in · ←→ choose system</p>}
			</div>
		</AltPage>
	);
}

export const galaxyCss = tok('galaxy', { bg: '#02030A', s1: 'rgba(150,170,255,.08)', s2: 'rgba(150,170,255,.16)', s3: 'rgba(150,170,255,.24)', fg: '#E8ECFF', fg2: '#AEB7E6', fg3: '#6670A8', acc: '#8FA8FF', on: '#05081A', top: '#02030A', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
.pb-gal-brand { font: 600 15px var(--k-text); letter-spacing: .35em; color: #E8ECFF; }
.pb-gal-app { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(60% 50% at 50% 50%, #0E1238, #02030A 75%); color: #E8ECFF; }
.pb-gal-stars { position: absolute; inset: -50%; background-image: radial-gradient(1px 1px at 10% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 70%, #fff, transparent), radial-gradient(1.5px 1.5px at 55% 35%, #cfd8ff, transparent), radial-gradient(1px 1px at 80% 60%, #fff, transparent), radial-gradient(1px 1px at 65% 85%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 15%, #ffe9c4, transparent); background-size: 300px 300px; animation: pb-gal-drift 200s linear infinite; opacity: .8; }
.pb-gal-stars.b { background-size: 470px 470px; animation-duration: 320s; opacity: .5; } @keyframes pb-gal-drift { to { transform: translate(300px, 150px); } }
.pb-gal-map { position: absolute; inset: 20px 30px 50px; display: grid; gap: 10px; align-content: center; }
.pb-gal-sys { position: relative; height: 200px; display: grid; place-items: center; border-radius: 50%; transition: transform .3s var(--k-out); } .pb-gal-sys:hover, .pb-gal-sys.on { transform: scale(1.08); }
.pb-gal-sun { position: absolute; width: 26px; height: 26px; border-radius: 50%; background: hsl(var(--h) 100% 70%); box-shadow: 0 0 30px 8px hsl(var(--h) 100% 60% / .7); }
.pb-gal-dot { position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: hsl(var(--h) 60% 80%); animation: pb-gal-orb var(--t) linear infinite; } @keyframes pb-gal-orb { from { transform: rotate(0) translateX(var(--r)); } to { transform: rotate(360deg) translateX(var(--r)); } }
.pb-gal-sys span { position: absolute; bottom: 0; display: grid; justify-items: center; } .pb-gal-sys b { font: 600 15px var(--k-text); } .pb-gal-sys em { font: 12px var(--k-text); font-style: normal; color: #6670A8; } .pb-gal-sys.on b { color: hsl(var(--h) 100% 80%); }
.pb-gal-hint { position: absolute; left: 0; right: 0; bottom: 16px; margin: 0; text-align: center; font: 13px var(--k-text); color: #6670A8; }
.pb-gal-system { position: absolute; inset: 0 380px 0 0; animation: pb-gal-warp .6s var(--k-out) both; } @keyframes pb-gal-warp { from { transform: scale(.2); opacity: 0; filter: blur(6px); } }
.pb-gal-back { position: absolute; left: 24px; top: 16px; z-index: 2; font: 600 14px var(--k-text); color: #AEB7E6; } .pb-gal-back:hover { color: #fff; } .pb-gal-system h2 { position: absolute; left: 24px; top: 40px; z-index: 2; margin: 0; font: 300 34px var(--k-text); color: hsl(var(--h) 100% 85%); }
.pb-gal-orbits { position: absolute; left: 50%; top: 52%; width: 0; height: 0; transform: rotateX(0); }
.pb-gal-star { position: absolute; width: 70px; height: 70px; margin: -35px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #fff, hsl(var(--h) 100% 65%) 40%, hsl(var(--h) 90% 40%)); box-shadow: 0 0 60px 20px hsl(var(--h) 100% 60% / .55), 0 0 140px 40px hsl(var(--h) 100% 50% / .25); }
.pb-gal-orbit { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); border-radius: 50%; border: 1px solid rgba(150,170,255,.14); animation: pb-gal-spin var(--t) linear infinite; } @keyframes pb-gal-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.pb-gal-planet { position: absolute; left: 50%; top: 0; transform: translate(-50%, -50%); border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 2px rgba(255,255,255,.15), inset -8px -8px 16px rgba(0,0,0,.6); animation: pb-gal-counter var(--t) linear infinite reverse; } @keyframes pb-gal-counter { to { transform: translate(-50%, -50%) rotate(360deg); } }
.pb-gal-planet img, .pb-gal-planet .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 5px; } .pb-gal-planet::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 30% 30%, transparent 40%, rgba(0,0,0,.65)); }
.pb-gal-planet.on { box-shadow: 0 0 0 3px hsl(var(--h) 100% 75%), 0 0 24px hsl(var(--h) 100% 60%); z-index: 2; }
.pb-gal-system:hover .pb-gal-orbit, .pb-gal-system:hover .pb-gal-planet { animation-play-state: paused; }
.pb-gal-survey { position: absolute; right: 0; top: 0; bottom: 0; width: 380px; padding: 22px; overflow-y: auto; background: rgba(6,8,24,.88); box-shadow: inset 1px 0 0 rgba(150,170,255,.18); animation: pb-gal-in .35s var(--k-out) both; } @keyframes pb-gal-in { from { transform: translateX(30px); opacity: 0; } }
.pb-gal-cls { margin: 0 0 10px; font: 600 11px var(--k-text); letter-spacing: .2em; color: #6670A8; } .pb-gal-img { width: 100%; aspect-ratio: 460/215; object-fit: cover; border-radius: 8px; } .pb-gal-survey h3 { margin: 14px 0 4px; font: 600 22px/1.2 var(--k-text); } .pb-gal-st { margin: 0 0 16px; font: 13px var(--k-text); color: #AEB7E6; }
.pb-gal-go { width: 100%; height: 44px; border-radius: 99px; background: #8FA8FF !important; color: #05081A !important; font: 700 15px var(--k-text) !important; box-shadow: 0 0 24px rgba(143,168,255,.45); } .pb-gal-more { margin-top: 12px; font: 600 13px var(--k-text); color: #AEB7E6; text-decoration: underline; }
.pb-gal-survey dl { margin: 16px 0 10px; } .pb-gal-survey dl div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(150,170,255,.1); font: 13px var(--k-text); } .pb-gal-survey dt { color: #6670A8; } .pb-gal-survey dd { margin: 0; }
.pb-gal-act button { color: #AEB7E6 !important; } .pb-gal-act button:hover { background: rgba(143,168,255,.1) !important; }
`;

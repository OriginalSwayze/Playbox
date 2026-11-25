// OVERWORLD — a level-select map. Each collection is a world; its games are levels strung along a winding path over
// hills and lakes, with up to three stars for the hours you have put in. A marker hops between levels; Enter on a
// level opens its card, Enter again starts it.
import { useEffect, useRef } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { cycle, useCursor, useKeys, useStatus } from './lk';

const stars = (g: Game) => (g.minutes >= 3000 ? 3 : g.minutes >= 600 ? 2 : g.minutes > 0 ? 1 : 0);
const STEP = 170;
const pos = (i: number) => ({ x: 140 + i * STEP, y: 50 + Math.sin(i * 0.85) * 26 + Math.sin(i * 0.31) * 8 });
const WORLD_HUES = [110, 190, 40, 280, 20, 160, 320, 60];

export function Overworld() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 60);
	const c = useCursor(gs.length);
	const map = useRef<HTMLDivElement>(null);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const bi = Math.max(0, b.islands.findIndex((i) => i.id === b.cur));
	useEffect(() => { const el = map.current; if (el) el.scrollTo({ left: pos(c.i).x - el.clientWidth / 2, behavior: 'smooth' }); }, [c.i, b.cur]);
	useKeys((k) => {
		if (k === 'left' || k === 'up') { c.move(-1); select(null); } else if (k === 'right' || k === 'down') { c.move(1); select(null); }
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); select(null); } else return false;
	});
	const w = 280 + gs.length * STEP;
	const path = gs.map((_, i) => { const p = pos(i); return `${i ? 'L' : 'M'}${p.x} ${p.y * 6}`; }).join(' ');
	const cleared = gs.filter((x) => x.minutes > 0).length;
	return (
		<AltPage className="pb-ow" brand={<>★ WORLD {bi + 1}</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-ow-app" style={{ ['--h' as string]: WORLD_HUES[bi % WORLD_HUES.length] }}>
				<nav className="pb-ow-worlds">{b.islands.map((i, n) => <button key={i.id} className={!b.found && n === bi ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}><b>{n + 1}</b>{i.name}</button>)}</nav>
				<div className="pb-ow-map" ref={map}>
					<div className="pb-ow-land" style={{ width: w }}>
						{Array.from({ length: Math.ceil(w / 420) }, (_, i) => <i key={i} className={'pb-ow-hill ' + (i % 3 === 0 ? 'lake' : i % 3 === 1 ? 'wood' : '')} style={{ left: i * 420 + (i % 2) * 120, top: i % 2 ? '58%' : '6%' }} />)}
						<svg className="pb-ow-path" width={w} height="600" viewBox={`0 0 ${w} 600`} preserveAspectRatio="none"><path d={path} /></svg>
						{gs.map((x, n) => {
							const p = pos(n);
							const s = stars(x);
							return (
								<button key={x.appid} data-appid={x.appid} className={'pb-ow-node' + (n === c.i ? ' on' : '') + (x.minutes ? ' done' : '')} style={{ left: p.x, top: p.y + '%' }} onClick={() => (n === c.i ? select(sel ? null : x.appid) : (c.to(n), select(null)))}>
									<Art g={x} kind="capsule" /><span className="pb-ow-stars">{[0, 1, 2].map((k) => <i key={k} className={k < s ? 'on' : ''}>★</i>)}</span><em>{bi + 1}-{n + 1}</em>
								</button>
							);
						})}
						{gs[c.i] && <i className="pb-ow-hero" style={{ left: pos(c.i).x, top: pos(c.i).y + '%' }} />}
					</div>
				</div>
				<div className="pb-ow-hud"><span>★ {gs.reduce((a, x) => a + stars(x), 0)} / {gs.length * 3}</span><span>CLEARED {cleared} / {gs.length}</span><span>◀ ▶ MOVE · ⏎ ENTER · LB RB WORLD</span></div>
				{g && (
					<section className={'pb-ow-card' + (sel ? ' open' : '')} key={g.appid}>
						<Art g={g} kind="header" className="pb-ow-cimg" />
						<div><p className="pb-ow-lv">LEVEL {bi + 1}-{c.i + 1} · {status.toUpperCase()}</p><h2>{g.name}</h2>
							<p className="pb-ow-cs">{[0, 1, 2].map((k) => <i key={k} className={k < stars(g) ? 'on' : ''}>★</i>)}<span>{formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</span></p></div>
						<div className="pb-ow-cbtn"><PlayBtn g={g} className="pb-ow-go" label={['START!', 'INSTALL']} />{sel ? <button onClick={() => select(null)}>BACK</button> : <button onClick={() => select(g.appid)}>INFO</button>}</div>
						{sel && <Actions g={sel} className="pb-ow-act" />}
					</section>
				)}
			</div>
		</AltPage>
	);
}

const round = '"Segoe UI Black", "Arial Rounded MT Bold", "Segoe UI", sans-serif';
export const overworldCss = tok('overworld', { bg: '#5DBB63', s1: 'rgba(255,255,255,.85)', s2: '#fff', s3: '#E8F3E0', fg: '#1E2A3A', fg2: '#3E4C5E', fg3: '#6B7A8C', acc: '#FF5A36', on: '#fff', top: '#2E6FD8', topFg: '#FFFFFF', font: round }) + `
.pb-ow-brand { font: 900 18px ${round}; color: #FFE14A; text-shadow: 2px 2px 0 #1E2A3A; letter-spacing: .04em; }
.pb-ow-app { position: absolute; inset: 0; overflow: hidden; background: hsl(var(--h) 45% 58%); transition: background .5s; color: #1E2A3A; }
.pb-ow-worlds { position: absolute; top: 10px; left: 16px; right: 16px; z-index: 3; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.pb-ow-worlds button { flex: none; display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px 0 6px; border-radius: 99px; background: rgba(255,255,255,.85); box-shadow: 0 3px 0 rgba(0,0,0,.2); font: 800 13px ${round}; color: #1E2A3A; white-space: nowrap; }
.pb-ow-worlds b { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #2E6FD8; color: #fff; font-size: 13px; } .pb-ow-worlds button.on { background: #FFE14A; transform: translateY(-2px); box-shadow: 0 5px 0 #C9A800; }
.pb-ow-map { position: absolute; inset: 56px 0 0; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; } .pb-ow-map::-webkit-scrollbar { display: none; }
.pb-ow-land { position: relative; height: 100%; min-width: 100%; }
.pb-ow-hill { position: absolute; width: 300px; height: 34%; border-radius: 50% 50% 46% 54%; background: hsl(var(--h) 45% 48%); box-shadow: inset 0 -20px 0 rgba(0,0,0,.08); } .pb-ow-hill.lake { background: #5FB8F0; box-shadow: inset 0 0 0 10px rgba(255,255,255,.35); border-radius: 46% 54% 50% 50%; }
.pb-ow-hill.wood { background: radial-gradient(circle at 20% 40%, hsl(var(--h) 50% 32%) 14%, transparent 15%), radial-gradient(circle at 50% 30%, hsl(var(--h) 50% 30%) 16%, transparent 17%), radial-gradient(circle at 75% 50%, hsl(var(--h) 50% 34%) 15%, transparent 16%), hsl(var(--h) 45% 50%); }
.pb-ow-path { position: absolute; left: 0; top: 0; width: 100%; height: 100%; } .pb-ow-path path { fill: none; stroke: #F4E2B0; stroke-width: 22; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 4px 0 rgba(0,0,0,.15)); vector-effect: non-scaling-stroke; }
.pb-ow-node { position: absolute; width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 50%; padding: 5px; background: #fff; box-shadow: 0 5px 0 rgba(0,0,0,.22); transition: transform .2s; } .pb-ow-node img, .pb-ow-node .alt-noart { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; font-size: 6px; }
.pb-ow-node:not(.done) img { filter: grayscale(.8) brightness(.9); } .pb-ow-node:hover { transform: scale(1.08); } .pb-ow-node.on { transform: scale(1.18); box-shadow: 0 0 0 5px #FFE14A, 0 6px 0 rgba(0,0,0,.25); z-index: 2; }
.pb-ow-stars { position: absolute; left: 50%; top: -14px; transform: translateX(-50%); display: flex; gap: 1px; } .pb-ow-stars i, .pb-ow-cs i { font-style: normal; font-size: 16px; color: rgba(0,0,0,.25); } .pb-ow-stars i.on, .pb-ow-cs i.on { color: #FFD21F; text-shadow: 0 2px 0 #B88A00; }
.pb-ow-node em { position: absolute; left: 50%; bottom: -24px; transform: translateX(-50%); padding: 1px 8px; border-radius: 99px; background: #1E2A3A; color: #fff; font: 800 11px ${round}; font-style: normal; white-space: nowrap; }
.pb-ow-hero { position: absolute; z-index: 3; width: 34px; height: 44px; margin: -100px 0 0 -17px; transition: left .35s var(--k-out), top .35s var(--k-out); background: radial-gradient(circle at 50% 28%, #FFCC99 0 9px, transparent 10px), linear-gradient(#FF5A36, #FF5A36) 50% 100% / 26px 24px no-repeat; border-radius: 40% 40% 8px 8px; animation: pb-ow-bob .6s ease-in-out infinite alternate; filter: drop-shadow(0 4px 0 rgba(0,0,0,.25)); }
@keyframes pb-ow-bob { to { transform: translateY(-6px); } }
.pb-ow-hud { position: absolute; left: 16px; bottom: 14px; z-index: 3; display: flex; gap: 10px; } .pb-ow-hud span { padding: 6px 12px; border-radius: 99px; background: rgba(30,42,58,.85); color: #fff; font: 800 12px ${round}; }
.pb-ow-card { position: absolute; right: 16px; bottom: 14px; z-index: 4; display: grid; grid-template-columns: 150px minmax(0, 1fr) auto; gap: 14px; align-items: center; width: min(640px, 60%); padding: 12px; border-radius: 22px; background: #fff; box-shadow: 0 6px 0 rgba(0,0,0,.2); animation: pb-ow-pop .3s var(--k-out) both; }
@keyframes pb-ow-pop { from { transform: translateY(20px) scale(.95); opacity: 0; } }
.pb-ow-cimg { width: 150px; aspect-ratio: 460/215; object-fit: cover; border-radius: 12px; } .pb-ow-lv { margin: 0; font: 800 11px ${round}; letter-spacing: .08em; color: #FF5A36; } .pb-ow-card h2 { margin: 2px 0; font: 900 20px/1.1 ${round}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-ow-cs { display: flex; align-items: center; gap: 2px; margin: 0; } .pb-ow-cs span { margin-left: 8px; font: 700 12px ${round}; color: #6B7A8C; }
.pb-ow-cbtn { display: grid; gap: 6px; } .pb-ow-go { height: 44px; padding: 0 22px; border-radius: 99px; background: #FF5A36 !important; color: #fff !important; font: 900 17px ${round} !important; box-shadow: 0 4px 0 #B8341A; } .pb-ow-go:active { transform: translateY(3px); box-shadow: 0 1px 0 #B8341A; }
.pb-ow-cbtn > button:last-child { height: 30px; border-radius: 99px; background: #E8F3E0; font: 800 12px ${round}; color: #3E4C5E; }
.pb-ow-act { grid-column: 1 / -1; display: flex; flex-wrap: wrap; } .pb-ow-act button { font-family: ${round} !important; }
`;

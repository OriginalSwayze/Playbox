// MOSAIC — an art wall. Tiles are sized by how much you play: your top games get big key-art tiles, the next ones wide
// banners, the rest covers, packed densely. Hover shows the name and a play button; a click slides in the game drawer.
import { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, Logo, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

type Sort = 'played' | 'recent' | 'name';
const sorters: Record<Sort, (a: Game, b: Game) => number> = { played: (a, b) => b.minutes - a.minutes, recent: (a, b) => b.lastPlayed - a.lastPlayed, name: (a, b) => a.sortName.localeCompare(b.sortName) };

function Drawer({ g, close }: { g: Game; close: () => void }) {
	const status = useStatus(g);
	return (
		<aside className="pb-mos-drawer" key={g.appid}>
			<div className="pb-mos-dart"><Art g={g} kind="hero" /><button onClick={close} aria-label="Close">✕</button><Logo g={g} className="pb-mos-dlogo" /></div>
			<div className="pb-mos-dbody">
				<p className="pb-mos-st">{status}</p>
				<PlayBtn g={g} className="pb-mos-play"><Icon name={g.installed ? 'play' : 'install'} size={18} /></PlayBtn>
				<dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
				<Actions g={g} className="pb-mos-act" />
			</div>
		</aside>
	);
}

export function Mosaic() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [sort, setSort] = useState<Sort>('played');
	const gs = useMemo(() => [...b.games].sort(sorters[sort]).slice(0, 240), [b.games, sort]);
	const rank = useMemo(() => { const r = new Map<number, number>(); [...gs].sort(sorters.played).forEach((g, i) => r.set(g.appid, i)); return r; }, [gs]);
	const c = useCursor(gs.length);
	const wall = useRef<HTMLDivElement>(null);
	useKeepInView(wall, '.kf', c.i, c.keyMoved);
	const size = (g: Game) => { const r = rank.get(g.appid) ?? 99; return g.minutes > 0 && r < 3 ? 'big' : g.minutes > 0 && r < 11 ? 'wide' : 'tall'; };
	useKeys((k) => {
		if (k === 'left' || k === 'up') c.move(-1); else if (k === 'right' || k === 'down') c.move(1);
		else if (k === 'enter') { const g = gs[c.i]; if (g) select(g.appid); } else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-mos" brand={<>mosaic</>} search={b.q} onSearch={b.setQ}>
			<div className={'pb-mos-app' + (sel ? ' with' : '')}>
				<div className="pb-mos-bar"><Chips b={b} className="pb-mos-chips" />
					<div className="pb-mos-sort">{(['played', 'recent', 'name'] as Sort[]).map((s) => <button key={s} className={sort === s ? 'on' : ''} onClick={() => setSort(s)}>{s === 'played' ? 'Most played' : s === 'recent' ? 'Recent' : 'A–Z'}</button>)}</div></div>
				<div className="pb-mos-wall" ref={wall}>{gs.map((g, n) => {
					const s = size(g);
					return (
						<button key={g.appid} data-appid={g.appid} className={'pb-mos-tile ' + s + (n === c.i ? ' kf' : '') + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(sel?.appid === g.appid ? null : g.appid)}>
							<Art g={g} kind={s === 'big' ? 'hero' : s === 'wide' ? 'header' : 'capsule'} />
							<span className="pb-mos-cap"><b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'Unplayed'} · {g.lastPlayed ? formatAgo(g.lastPlayed) : g.installed ? 'Installed' : 'Not installed'}</em></span>
						</button>
					);
				})}{!gs.length && <p className="lk-empty">No games match.</p>}</div>
				{sel && <Drawer g={sel} close={() => select(null)} />}
			</div>
		</AltPage>
	);
}

export const mosaicCss = tok('mosaic', { bg: '#0C0C0E', s1: '#18181C', s2: '#232328', s3: '#2E2E35', fg: '#F4F4F6', fg2: '#BDBDC6', fg3: '#7D7D88', acc: '#FF6B4A', on: '#fff', top: '#0C0C0E', font: '"Segoe UI Variable Text", "Segoe UI", sans-serif' }) + `
.pb-mos-brand { font: 800 21px var(--k-text); letter-spacing: -.04em; color: #fff; } .pb-mos-brand::first-letter { color: #FF6B4A; }
.pb-mos-app { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); grid-template-columns: minmax(0, 1fr) 0; background: #0C0C0E; color: #F4F4F6; transition: grid-template-columns .3s var(--k-out); } .pb-mos-app.with { grid-template-columns: minmax(0, 1fr) 380px; }
.pb-mos-bar { grid-column: 1 / -1; display: flex; gap: 20px; align-items: center; padding: 12px 22px; } .pb-mos-chips { flex: 1; min-width: 0; }
.pb-mos-sort { flex: none; display: flex; gap: 2px; padding: 3px; border-radius: 99px; background: #18181C; } .pb-mos-sort button { height: 28px; padding: 0 14px; border-radius: 99px; font: 600 12.5px var(--k-text); color: #7D7D88; } .pb-mos-sort button.on { background: #F4F4F6; color: #0C0C0E; }
.pb-mos-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); grid-auto-rows: 96px; grid-auto-flow: dense; gap: 8px; padding: 4px 22px 40px; overflow-y: auto; scrollbar-width: thin; min-width: 0; }
.pb-mos-tile { position: relative; overflow: hidden; border-radius: 10px; background: #18181C; grid-row: span 2; } .pb-mos-tile.wide { grid-column: span 2; grid-row: span 1; } .pb-mos-tile.big { grid-column: span 3; grid-row: span 3; }
.pb-mos-tile img, .pb-mos-tile .alt-noart { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--k-out), filter .3s; }
.pb-mos-tile:hover img { transform: scale(1.06); } .pb-mos-tile.kf { outline: 2px solid #fff; outline-offset: 2px; } .pb-mos-tile.on { outline: 3px solid #FF6B4A; outline-offset: 2px; }
.pb-mos-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 30px 12px 10px; text-align: left; background: linear-gradient(transparent, rgba(0,0,0,.88)); opacity: 0; transform: translateY(8px); transition: opacity .2s, transform .2s; }
.pb-mos-tile:hover .pb-mos-cap, .pb-mos-tile.kf .pb-mos-cap, .pb-mos-tile.big .pb-mos-cap { opacity: 1; transform: none; }
.pb-mos-cap b { display: block; font: 700 13.5px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-mos-tile.big .pb-mos-cap b { font-size: 22px; } .pb-mos-cap em { font: 12px var(--k-text); font-style: normal; color: #BDBDC6; }
.pb-mos-drawer { grid-row: 2; overflow-y: auto; background: #131316; border-left: 1px solid rgba(255,255,255,.06); animation: pb-mos-in .3s var(--k-out) both; } @keyframes pb-mos-in { from { opacity: 0; transform: translateX(20px); } }
.pb-mos-dart { position: relative; height: 230px; } .pb-mos-dart img, .pb-mos-dart .alt-noart { width: 100%; height: 100%; object-fit: cover; } .pb-mos-dart::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, #131316, transparent 70%); }
.pb-mos-dart button { position: absolute; right: 12px; top: 12px; z-index: 1; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff; }
.pb-mos-dlogo { position: absolute; left: 20px; right: 20px; bottom: 10px; z-index: 1; height: 80px; } .pb-mos-dlogo img { height: 100%; } .pb-mos-dlogo.lk-logotext { height: auto; font-size: 26px; }
.pb-mos-dbody { padding: 14px 20px 30px; } .pb-mos-st { margin: 0 0 12px; font: 700 12px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #FF6B4A; }
.pb-mos-play { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 46px; border-radius: 10px; background: #FF6B4A !important; color: #fff !important; font: 700 16px var(--k-text) !important; } .pb-mos-play:hover { filter: brightness(1.1); }
.pb-mos-dbody dl { margin: 18px 0; } .pb-mos-dbody dl div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); font: 13.5px var(--k-text); } .pb-mos-dbody dt { color: #7D7D88; } .pb-mos-dbody dd { margin: 0; font-weight: 600; }
`;

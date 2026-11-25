// PAUSE — Steam as a game's pause menu. Your last game's key art sits dimmed behind a vertical menu: Resume plays it,
// the other entries open panes on the right (library, recent, collections, Steam's places). Up/down move the menu,
// right steps into the pane.
import { useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { goSpace } from '../state/nav';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, colsOf, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

type Item = { id: string; label: string; run?: () => void };

export function Pause() {
	const lists = useLibraryLists();
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const last = lists.recent[0] ?? lists.installed[0] ?? lists.all[0];
	const items: Item[] = [
		...(last ? [{ id: 'resume', label: 'Resume', run: () => gameCommands(last)[0].run() }] : []),
		{ id: 'library', label: 'Library' }, { id: 'recent', label: 'Recently played' }, { id: 'installed', label: 'Installed' }, { id: 'collections', label: 'Collections' },
		{ id: 'store', label: 'Store', run: () => goSpace('discover') }, { id: 'community', label: 'Community', run: () => goSpace('social') }, { id: 'profile', label: 'Profile', run: () => goSpace('you') },
	];
	const [m, setM] = useState(1);
	const [zone, setZone] = useState<'menu' | 'pane'>('menu');
	const item = items[Math.min(m, items.length - 1)];
	const pane: Game[] = item.id === 'library' ? (b.found ?? b.islands.find((i) => i.id === 'all')?.games ?? []) : item.id === 'recent' ? lists.recent : item.id === 'installed' ? lists.installed : item.id === 'collections' ? b.games : item.id === 'resume' ? lists.recent.slice(0, 8) : [];
	const c = useCursor(pane.length);
	const grid = useRef<HTMLDivElement>(null);
	useKeepInView(grid, '.kf', c.i, c.keyMoved);
	const focus = sel ?? (zone === 'pane' ? pane[c.i] : null) ?? last;
	const status = useStatus(sel);
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (zone === 'menu') {
			if (k === 'up') setM((x) => Math.max(0, x - 1)); else if (k === 'down') setM((x) => Math.min(items.length - 1, x + 1));
			else if (k === 'enter') { if (item.run) item.run(); else if (pane.length) { setZone('pane'); c.to(0, true); } } else if (k === 'right' && pane.length) { setZone('pane'); c.to(0, true); } else return false;
		} else {
			const cols = colsOf(grid.current);
			if (k === 'left' && c.i % cols === 0) setZone('menu'); else if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
			else if (k === 'enter') { const g = pane[c.i]; if (g) select(g.appid); } else if (k === 'back') setZone('menu'); else return false;
		}
	});
	return (
		<AltPage className="pb-pz" brand={<>❚❚ PAUSED</>} search={b.q} onSearch={(q) => { b.setQ(q); setM(items.findIndex((x) => x.id === 'library')); c.to(0); }}>
			<div className="pb-pz-app">
				<Backdrop g={focus} className="pb-pz-bd" />
				<div className="pb-pz-shade" />
				<nav className="pb-pz-menu">
					<p className="pb-pz-game">{last ? <>{last.name}<small>{formatPlaytime(last.minutes)} · {formatAgo(last.lastPlayed)}</small></> : 'Paused'}</p>
					{items.map((x, n) => (
						<button key={x.id} className={(n === m ? 'on' : '') + (n === m && zone === 'menu' ? ' kf' : '')} onMouseEnter={() => { setM(n); setZone('menu'); }} onClick={() => { setM(n); if (x.run) x.run(); else { setZone('pane'); select(null); } }}>{x.label}</button>
					))}
				</nav>
				<section className="pb-pz-pane">
					{sel ? (
						<div className="pb-pz-detail" key={sel.appid}>
							<p className="pb-pz-crumb">{item.label} / </p><h2>{sel.name}</h2><p className="pb-pz-st">{status}</p>
							<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
							<div className="pb-pz-btns"><PlayBtn g={sel} className="pb-pz-play" /><button onClick={() => select(null)}>Back</button></div><Actions g={sel} className="pb-pz-act" />
						</div>
					) : item.id === 'collections' ? (
						<div className="pb-pz-cols">
							<div className="pb-pz-tabs">{b.islands.map((i) => <button key={i.id} className={i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); }}>{i.name}<small>{i.games.length}</small></button>)}</div>
							<Grid gs={pane} c={c} zone={zone} grid={grid} select={select} />
						</div>
					) : pane.length ? <Grid gs={pane} c={c} zone={zone} grid={grid} select={select} /> : <p className="pb-pz-hint">{item.run ? 'Press Enter to open ' + item.label + '.' : ''}</p>}
				</section>
				<p className="pb-pz-keys">▲▼ Select · ⏎ Confirm · ▶ Browse · Esc Back</p>
			</div>
		</AltPage>
	);
}

function Grid({ gs, c, zone, grid, select }: { gs: Game[]; c: ReturnType<typeof useCursor>; zone: string; grid: React.RefObject<HTMLDivElement | null>; select: (id: number) => void }) {
	return (
		<div className="pb-pz-grid" ref={grid}>{gs.slice(0, 240).map((g, n) => (
			<button key={g.appid} data-appid={g.appid} className={n === c.i && zone === 'pane' ? 'kf' : ''} onClick={() => select(g.appid)}><Art g={g} kind="header" /><span>{g.name}</span></button>
		))}</div>
	);
}

export const pauseCss = tok('pause', { bg: '#08090B', s1: 'rgba(255,255,255,.08)', s2: 'rgba(255,255,255,.14)', s3: 'rgba(255,255,255,.22)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.8)', fg3: 'rgba(255,255,255,.5)', acc: '#FFFFFF', on: '#000', top: 'transparent', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="pause"] .k-top { position: relative; z-index: 3; border: 0; }
.pb-pz-brand { font: 700 14px var(--k-text); letter-spacing: .35em; color: #fff; }
.pb-pz-app { position: absolute; inset: 0; display: grid; grid-template-columns: 360px minmax(0, 1fr); overflow: hidden; color: #fff; background: #08090B; }
.pb-pz-bd img { filter: saturate(.6); transform: scale(1.06); } .pb-pz-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5,6,8,.95) 0, rgba(5,6,8,.82) 360px, rgba(5,6,8,.6)); }
.pb-pz-menu { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 0 0 60px 56px; }
.pb-pz-game { margin: 0 0 30px; font: 600 15px var(--k-text); color: rgba(255,255,255,.7); } .pb-pz-game small { display: block; margin-top: 4px; font: 13px var(--k-text); color: rgba(255,255,255,.45); }
.pb-pz-menu button { position: relative; padding: 8px 0 8px 22px; text-align: left; font: 300 30px var(--k-text); color: rgba(255,255,255,.5); transition: color .15s, transform .15s; }
.pb-pz-menu button::before { content: ""; position: absolute; left: 0; top: 50%; width: 6px; height: 6px; margin-top: -3px; background: #fff; transform: rotate(45deg) scale(0); transition: transform .15s; }
.pb-pz-menu button:hover, .pb-pz-menu button.on { color: #fff; } .pb-pz-menu button.on::before { transform: rotate(45deg) scale(1); } .pb-pz-menu button.kf { transform: translateX(8px); font-weight: 400; }
.pb-pz-pane { position: relative; min-width: 0; min-height: 0; padding: 40px 40px 50px 20px; display: flex; flex-direction: column; }
.pb-pz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; align-content: start; overflow-y: auto; scrollbar-width: thin; padding: 4px; }
.pb-pz-grid button { position: relative; border-radius: 4px; overflow: hidden; background: rgba(255,255,255,.06); text-align: left; transition: transform .15s; } .pb-pz-grid img, .pb-pz-grid .alt-noart { display: block; width: 100%; aspect-ratio: 460/215; object-fit: cover; }
.pb-pz-grid span { display: block; padding: 7px 10px; font: 500 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgba(255,255,255,.8); } .pb-pz-grid button:hover { background: rgba(255,255,255,.12); } .pb-pz-grid button.kf { box-shadow: 0 0 0 2px #fff; transform: scale(1.03); }
.pb-pz-cols { display: flex; flex-direction: column; min-height: 0; } .pb-pz-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; } .pb-pz-tabs button { padding: 6px 14px; border-radius: 99px; font: 500 14px var(--k-text); color: rgba(255,255,255,.6); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); } .pb-pz-tabs small { margin-left: 6px; opacity: .6; } .pb-pz-tabs button.on { background: #fff; color: #000; }
.pb-pz-hint { margin: auto; font: 300 20px var(--k-text); color: rgba(255,255,255,.5); }
.pb-pz-detail { max-width: 640px; margin: auto 0; animation: k-rise .35s var(--k-out) both; } .pb-pz-crumb { margin: 0; font: 13px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.45); }
.pb-pz-detail h2 { margin: 4px 0 6px; font: 300 44px/1.05 var(--k-text); } .pb-pz-st { margin: 0 0 22px; font: 600 13px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.65); }
.pb-pz-detail dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 24px; } .pb-pz-detail dt { font: 12px var(--k-text); color: rgba(255,255,255,.45); } .pb-pz-detail dd { margin: 2px 0 0; font: 500 17px var(--k-text); }
.pb-pz-btns { display: flex; gap: 10px; margin-bottom: 10px; } .pb-pz-play { height: 46px; padding: 0 34px; background: #fff !important; color: #000 !important; font: 600 16px var(--k-text) !important; } .pb-pz-btns > button:last-child { height: 46px; padding: 0 22px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.4); font: 500 15px var(--k-text); color: #fff; }
.pb-pz-act { max-width: 300px; } .pb-pz-act button { color: rgba(255,255,255,.8) !important; } .pb-pz-act button:hover { background: rgba(255,255,255,.1) !important; }
.pb-pz-keys { position: absolute; left: 56px; bottom: 20px; margin: 0; font: 13px var(--k-text); color: rgba(255,255,255,.4); }
`;

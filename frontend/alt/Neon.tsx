// NEON — a cyberpunk launcher. Cut-corner panels, magenta and cyan, scanlines and a glitch on the title. Collections
// run down the left as a jack-in menu, the focused game fills the uplink panel with signal meters, the grid below.
import { useRef } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, colsOf, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const meters = (g: Game): [string, number][] => [['SYNC', Math.min(1, Math.sqrt(g.minutes / 6000))], ['HEAT', Math.min(1, g.minutes2w / 900)], ['RATING', (g.metacritic || 0) / 100], ['LINK', g.installed ? 1 : 0.15]];

export function Neon() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 120);
	const c = useCursor(gs.length);
	const grid = useRef<HTMLDivElement>(null);
	useKeepInView(grid, '.kf', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		const cols = colsOf(grid.current);
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
		else if (k === 'enter' && g) { if (sel) gameCommands(sel)[0].run(); else select(g.appid); } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
		if (k !== 'enter' && k !== 'back' && sel) select(null);
	});
	return (
		<AltPage className="pb-neon" brand={<>N<b>3</b>ON<i>//NET</i></>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }} searchPlaceholder="query://library">
			<div className="pb-neon-app">
				<nav className="pb-neon-nav"><p>// JACK IN</p>{b.islands.map((i, n) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}><em>{String(n).padStart(2, '0')}</em>{i.name}<small>{i.games.length}</small></button>)}</nav>
				<main className="pb-neon-main">
					{g && (
						<section className={"pb-neon-up" + (sel ? " open" : "")} key={g.appid}>
							<Backdrop g={g} className="pb-neon-bd" />
							<div className="pb-neon-copy">
								<p className="pb-neon-st">▮ {status.toUpperCase()}</p>
								<h1 data-t={g.name}>{g.name}</h1>
								<p className="pb-neon-sub">{formatPlaytime(g.minutes)} UPTIME · LAST SYNC {formatAgo(g.lastPlayed).toUpperCase()}</p>
								<div className="pb-neon-btns"><PlayBtn g={g} className="pb-neon-go" label={['>> EXECUTE', '>> DOWNLOAD']} />{!sel && <button className="pb-neon-dt" onClick={() => select(g.appid)}>DECRYPT</button>}{sel && <button className="pb-neon-dt" onClick={() => select(null)}>DISCONNECT</button>}</div>
							</div>
							<div className="pb-neon-meters">{meters(g).map(([k, v]) => <div key={k}><span>{k}</span><i><b style={{ width: Math.round(v * 100) + '%' }} /></i><em>{Math.round(v * 100)}</em></div>)}</div>
							{sel && <div className="pb-neon-dump"><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k.toUpperCase()}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-neon-act" /></div>}
						</section>
					)}
					<div className="pb-neon-grid" ref={grid}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={'pb-neon-tile' + (n === c.i ? ' kf' : '')} onMouseEnter={() => c.to(n)} onClick={() => select(x.appid)}>
							<Art g={x} kind="header" /><span>{x.name}</span>
						</button>
					))}{!gs.length && <p className="lk-empty">NO SIGNAL</p>}</div>
				</main>
			</div>
		</AltPage>
	);
}

const cut = 'clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));';
export const neonCss = tok('neon', { bg: '#07040E', s1: '#130A22', s2: '#1D0F33', s3: '#2A1547', fg: '#F2E9FF', fg2: '#C9B5E8', fg3: '#8A74AE', acc: '#FF2E97', on: '#fff', top: '#07040E', line: 'rgba(0,240,255,.25)', font: '"Bahnschrift", "Consolas", sans-serif' }) + `
html.kestrel[data-ui="neon"] .alt-search { border-radius: 0; background: #130A22; box-shadow: inset 0 0 0 1px rgba(0,240,255,.4); font-family: Consolas, monospace; }
.pb-neon-brand { font: 700 20px var(--k-text); letter-spacing: .08em; color: #F2E9FF; text-shadow: 0 0 8px #FF2E97; } .pb-neon-brand b { color: #00F0FF; text-shadow: 0 0 8px #00F0FF; } .pb-neon-brand i { margin-left: 6px; font: 400 11px Consolas, monospace; font-style: normal; color: #8A74AE; }
.pb-neon-app { position: absolute; inset: 0; display: grid; grid-template-columns: 230px minmax(0, 1fr); background: #07040E; color: #F2E9FF; }
.pb-neon-app::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3px); }
.pb-neon-nav { padding: 16px 12px; overflow-y: auto; border-right: 1px solid rgba(0,240,255,.2); scrollbar-width: none; } .pb-neon-nav p { margin: 0 0 12px 6px; font: 12px Consolas, monospace; color: #00F0FF; }
.pb-neon-nav button { display: flex; align-items: center; gap: 10px; width: 100%; margin-bottom: 6px; padding: 10px 12px; background: #130A22; font: 600 14px var(--k-text); letter-spacing: .04em; color: #C9B5E8; text-align: left; ${cut} }
.pb-neon-nav button em { font: 11px Consolas, monospace; font-style: normal; color: #8A74AE; } .pb-neon-nav button small { margin-left: auto; font: 11px Consolas, monospace; color: #8A74AE; }
.pb-neon-nav button:hover { background: #1D0F33; color: #fff; } .pb-neon-nav button.on { background: linear-gradient(90deg, #FF2E97, #9B2EFF); color: #fff; } .pb-neon-nav button.on em, .pb-neon-nav button.on small { color: #fff; }
.pb-neon-main { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.pb-neon-up { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 20px; height: 300px; margin: 16px 16px 0; padding: 26px 28px; overflow: hidden; background: #130A22; box-shadow: inset 0 0 0 1px rgba(255,46,151,.5); ${cut.replace(/14px/g, '22px')} }
.pb-neon-up.open { height: auto; max-height: 60vh; overflow-y: auto; } .pb-neon-copy h1 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pb-neon-bd { opacity: .45; } .pb-neon-bd img { filter: saturate(1.4) hue-rotate(-10deg); mix-blend-mode: screen; } .pb-neon-bd::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #130A22 25%, rgba(19,10,34,.4)); }
.pb-neon-copy, .pb-neon-meters, .pb-neon-dump { position: relative; } .pb-neon-st { margin: 0 0 8px; font: 13px Consolas, monospace; color: #00F0FF; animation: pb-neon-blink 1.2s steps(2) infinite; } @keyframes pb-neon-blink { 50% { opacity: .5; } }
.pb-neon-copy h1 { position: relative; margin: 0 0 8px; font: 700 clamp(30px, 3.6vw, 52px)/1 var(--k-text); text-transform: uppercase; letter-spacing: .02em; text-shadow: 3px 0 #FF2E97, -3px 0 #00F0FF; animation: pb-neon-glitch 3.5s infinite; }
@keyframes pb-neon-glitch { 0%, 92%, 100% { transform: none; text-shadow: 3px 0 #FF2E97, -3px 0 #00F0FF; } 93% { transform: translateX(4px) skewX(-8deg); text-shadow: -4px 0 #FF2E97, 4px 0 #00F0FF; } 95% { transform: translateX(-3px); clip-path: inset(30% 0 40% 0); } 97% { transform: none; clip-path: none; } }
.pb-neon-sub { margin: 0 0 22px; font: 13px Consolas, monospace; color: #C9B5E8; }
.pb-neon-btns { display: flex; gap: 10px; } .pb-neon-go { height: 44px; padding: 0 26px; background: #00F0FF !important; color: #07040E !important; font: 700 15px Consolas, monospace !important; letter-spacing: .1em; box-shadow: 0 0 20px rgba(0,240,255,.5); ${cut} } .pb-neon-go:hover { background: #fff !important; }
.pb-neon-dt { height: 44px; padding: 0 20px; background: rgba(255,46,151,.15); box-shadow: inset 0 0 0 1px #FF2E97; color: #FF2E97; font: 700 14px Consolas, monospace; letter-spacing: .1em; ${cut} }
.pb-neon-meters { align-self: center; display: grid; gap: 12px; } .pb-neon-meters div { display: grid; grid-template-columns: 60px 1fr 30px; gap: 10px; align-items: center; font: 12px Consolas, monospace; color: #8A74AE; }
.pb-neon-meters i { height: 8px; background: rgba(255,255,255,.06); transform: skewX(-20deg); } .pb-neon-meters b { display: block; height: 100%; background: linear-gradient(90deg, #9B2EFF, #FF2E97); box-shadow: 0 0 10px #FF2E97; transition: width .6s var(--k-out); } .pb-neon-meters em { font-style: normal; color: #F2E9FF; text-align: right; }
.pb-neon-dump { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 240px; gap: 20px; padding-top: 14px; border-top: 1px dashed rgba(0,240,255,.3); } .pb-neon-dump dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0; }
.pb-neon-dump dt { font: 11px Consolas, monospace; color: #00F0FF; } .pb-neon-dump dd { margin: 2px 0 0; font: 600 14px var(--k-text); } .pb-neon-act button { color: #C9B5E8 !important; font-family: Consolas, monospace !important; } .pb-neon-act button:hover { background: rgba(255,46,151,.12) !important; }
.pb-neon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; align-content: start; padding: 16px 16px 40px; overflow-y: auto; scrollbar-width: thin; }
.pb-neon-tile { position: relative; aspect-ratio: 460/215; overflow: hidden; background: #130A22; ${cut} transition: transform .12s; } .pb-neon-tile img, .pb-neon-tile .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(.7) brightness(.75); transition: filter .15s; }
.pb-neon-tile span { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 10px 6px; font: 600 12px var(--k-text); letter-spacing: .04em; text-transform: uppercase; text-align: left; background: linear-gradient(transparent, rgba(7,4,14,.95)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-neon-tile:hover img, .pb-neon-tile.kf img { filter: none; } .pb-neon-tile.kf { box-shadow: inset 0 0 0 2px #00F0FF; } .pb-neon-tile.kf::after { content: ""; position: absolute; inset: 0; box-shadow: inset 0 0 0 2px #00F0FF, inset 0 0 24px rgba(0,240,255,.5); }
`;

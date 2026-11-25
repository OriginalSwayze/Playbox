// ARCADE — a neon games hall. Every game is a cabinet with a lit marquee, a glowing screen and a control panel;
// collections are rows of the hall. Step up to one and press start.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const hue = (id: number) => (id * 61) % 360;

function Cabinet({ g, onPick }: { g: Game; onPick: () => void }) {
	return (
		<button className={'ar-cab' + (g.installed ? ' live' : '')} data-appid={g.appid} style={{ ['--h' as string]: hue(g.appid) }} onClick={onPick} title={g.name}>
			<div className="ar-marquee"><span>{g.name}</span></div>
			<div className="ar-screen"><Art g={g} kind="header" /><i className="ar-scan" /><em>{g.installed ? 'Insert coin' : 'Out of order'}</em></div>
			<div className="ar-panel"><i className="stick" /><i className="b1" /><i className="b2" /><i className="b3" /></div>
			<div className="ar-base" />
		</button>
	);
}

function Focus({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const start = gameCommands(g)[0];
	const scores = d.achievements.list.filter((a) => a.achieved).sort((a, b) => b.unlocked - a.unlocked).slice(0, 6);
	return (
		<div className="ar-focus" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className="ar-big" style={{ ['--h' as string]: hue(g.appid) }}>
				<div className="ar-marquee big"><span>{g.name}</span></div>
				<div className="ar-screen big">
					<Art g={g} kind="hero" /><i className="ar-scan" />
					<div className="ar-hud">
						<div>1UP <b>{String(Math.round(g.minutes / 6)).padStart(6, '0')}</b></div>
						<div>HI-SCORE <b>{d.achievements.total ? `${d.achievements.achieved}/${d.achievements.total}` : '------'}</b></div>
					</div>
					<button className="ar-start" onClick={start.run}>{g.installed ? '▶ Press start' : '⬇ Install cabinet'}</button>
				</div>
				<div className="ar-info">
					<div className="ar-scores">
						<div className="ar-h">High scores</div>
						{scores.length ? scores.map((a, i) => <div key={a.id} className="ar-score"><span>{i + 1}.</span><b>{a.name}</b><em>{formatAgo(a.unlocked)}</em></div>) : <div className="ar-score dim">No scores on this machine yet</div>}
					</div>
					<div>
						<div className="ar-h">Credits</div>
						<div className="ar-score"><b>Played</b><em>{formatPlaytime(g.minutes)}</em></div>
						<div className="ar-score"><b>Last game</b><em>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</em></div>
						<Actions g={g} className="ar-actions" />
						<button className="ar-leave" onClick={close}>Walk away</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function Arcade() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const rows = found ? [{ id: 'q', name: `Search: ${q.trim()}`, games: found.slice(0, 60) }] : islands;
	return (
		<AltPage className="ar" brand={<>Arcade<span>hall</span></>} search={q} onSearch={setQ} searchPlaceholder="Find a cabinet">
			<div className="ar-hall">
				<div className="ar-floor" />
				{rows.map((r) => (
					<section key={r.id} className="ar-row">
						<h2><span>{r.name}</span><em>{r.games.length} machines</em></h2>
						<div className="ar-line">{r.games.map((g) => <Cabinet key={g.appid} g={g} onPick={() => select(g.appid)} />)}</div>
					</section>
				))}
			</div>
			{sel && <Focus key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const arcadeCss = `
html.kestrel[data-ui="arcade"] { --k-ink: #07030F; --k-s1: #120A22; --k-s2: #1B1033; --k-s3: #261847; --k-s4: #34215F; --k-line: rgba(255,60,220,.14); --k-line-2: rgba(80,230,255,.28);
	--k-fg: #F5EEFF; --k-fg-2: #C2B2E8; --k-fg-3: #8370B0; --k-accent: #FF2BD6; --k-accent-2: #22E4FF; --k-on-accent: #10001A; --k-a10: rgba(255,43,214,.1); --k-a20: rgba(255,43,214,.18); --k-a40: rgba(255,43,214,.4);
	--ar-font: "Cascadia Mono", Consolas, monospace; }
.ar-brand { font: 900 22px var(--ar-font); letter-spacing: .06em; text-transform: uppercase; color: #FF2BD6; text-shadow: 0 0 8px #FF2BD6, 0 0 22px rgba(255,43,214,.6); }
.ar-brand span { margin-left: 8px; color: #22E4FF; text-shadow: 0 0 8px #22E4FF; }
.ar-stage { background: #07030F; }
.ar-hall { position: absolute; inset: 0; overflow-y: auto; padding: 24px 0 80px; background: radial-gradient(80% 50% at 50% 0%, rgba(255,43,214,.16), transparent 70%), #07030F; }
.ar-floor { position: fixed; left: 0; right: 0; bottom: 0; height: 40%; pointer-events: none; opacity: .45;
	background: linear-gradient(transparent, #07030F 2%, transparent 3%), repeating-linear-gradient(90deg, rgba(34,228,255,.35) 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, rgba(255,43,214,.35) 0 1px, transparent 1px 40px);
	transform: perspective(500px) rotateX(60deg); transform-origin: bottom; mask: linear-gradient(transparent, #000 60%); -webkit-mask: linear-gradient(transparent, #000 60%); }
.ar-row { position: relative; margin-bottom: 40px; animation: k-rise 600ms var(--k-out) both; }
.ar-row h2 { display: flex; align-items: baseline; gap: 14px; margin: 0 40px 14px; font: 800 18px var(--ar-font); text-transform: uppercase; letter-spacing: .08em; color: #22E4FF; text-shadow: 0 0 10px rgba(34,228,255,.7); }
.ar-row h2 em { font: 600 12px var(--ar-font); font-style: normal; color: #8370B0; text-shadow: none; }
.ar-line { display: flex; gap: 22px; padding: 6px 40px 20px; overflow-x: auto; scrollbar-width: thin; scrollbar-color: #FF2BD6 #120A22; }
.ar-line::-webkit-scrollbar { height: 8px; } .ar-line::-webkit-scrollbar-track { background: #120A22; } .ar-line::-webkit-scrollbar-thumb { background: #3A1E5C; border-radius: 99px; } .ar-line::-webkit-scrollbar-thumb:hover { background: #FF2BD6; }
.ar-cab { flex: none; width: 170px; display: flex; flex-direction: column; align-items: stretch; transition: transform .35s var(--k-spring); filter: saturate(.55) brightness(.7); }
.ar-cab.live { filter: none; }
.ar-cab:hover { transform: translateY(-8px) scale(1.04); filter: none; }
.ar-marquee { height: 34px; display: grid; place-items: center; padding: 0 8px; border-radius: 10px 10px 2px 2px; overflow: hidden;
	background: linear-gradient(180deg, hsl(var(--h) 90% 55%), hsl(var(--h) 85% 35%)); box-shadow: 0 0 16px hsla(var(--h), 95%, 60%, .55), inset 0 2px 0 rgba(255,255,255,.4); }
.ar-marquee span { font: 900 11.5px var(--ar-font); text-transform: uppercase; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-shadow: 0 0 6px rgba(255,255,255,.9); }
.ar-screen { position: relative; height: 120px; margin: 0 8px; background: #000; border: 6px solid #141018; border-top-width: 10px; overflow: hidden; box-shadow: inset 0 0 20px #000; }
.ar-screen img, .ar-screen .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.4) contrast(1.15); }
.ar-scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 1px, transparent 1px 3px); pointer-events: none; }
.ar-screen em { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font: 800 10px var(--ar-font); font-style: normal; text-transform: uppercase; color: #FFE45E; text-shadow: 0 0 6px #FFB000; animation: tm-blink 1.1s steps(1) infinite; }
.ar-panel { position: relative; height: 42px; margin: 0 2px; border-radius: 4px; background: linear-gradient(180deg, hsl(var(--h) 40% 22%), hsl(var(--h) 40% 12%)); transform: perspective(200px) rotateX(30deg); }
.ar-panel i { position: absolute; top: 12px; width: 13px; height: 13px; border-radius: 50%; box-shadow: inset 0 -2px 0 rgba(0,0,0,.4); }
.ar-panel .stick { left: 22px; top: 6px; width: 8px; height: 22px; border-radius: 4px; background: #ccc; }
.ar-panel .stick::after { content: ""; position: absolute; left: -5px; top: -8px; width: 18px; height: 18px; border-radius: 50%; background: #E3263C; }
.ar-panel .b1 { left: 90px; background: #FF2BD6; } .ar-panel .b2 { left: 112px; background: #22E4FF; } .ar-panel .b3 { left: 134px; background: #FFE45E; }
.ar-base { height: 60px; margin: 0 8px; background: linear-gradient(180deg, #160E24, #0A0612); box-shadow: inset 0 0 0 1px rgba(255,255,255,.05); }
.ar-focus { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 24px; background: rgba(4,0,10,.88); animation: k-fade 250ms both; }
.ar-big { width: min(1000px, 94%); animation: ar-zoom 500ms var(--k-spring) both; }
@keyframes ar-zoom { from { transform: scale(.7) translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.ar-marquee.big { height: 56px; border-radius: 16px 16px 2px 2px; }
.ar-marquee.big span { font-size: 22px; }
.ar-screen.big { height: 380px; margin: 0 16px; border-width: 14px; border-top-width: 18px; }
.ar-hud { position: absolute; left: 18px; right: 18px; top: 12px; display: flex; justify-content: space-between; font: 800 14px var(--ar-font); color: #fff; text-shadow: 0 0 6px #000, 0 0 2px #000; }
.ar-hud b { color: #FFE45E; margin-left: 8px; }
.ar-start { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); padding: 12px 26px; border-radius: 8px; background: #FF2BD6 !important; color: #10001A !important;
	font: 900 18px var(--ar-font) !important; text-transform: uppercase; box-shadow: 0 0 24px #FF2BD6; animation: ar-pulse 1.2s ease-in-out infinite; }
@keyframes ar-pulse { 50% { box-shadow: 0 0 40px #FF2BD6, 0 0 70px rgba(255,43,214,.5); } }
.ar-info { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; margin: 0 16px; padding: 20px 24px; background: linear-gradient(180deg, #160E24, #0B0614); border-radius: 0 0 12px 12px; }
.ar-h { font: 800 13px var(--ar-font); text-transform: uppercase; letter-spacing: .1em; color: #22E4FF; margin-bottom: 8px; text-shadow: 0 0 8px rgba(34,228,255,.6); }
.ar-score { display: flex; gap: 10px; padding: 4px 0; font: 600 13px var(--ar-font); color: #F5EEFF; }
.ar-score span { color: #FF2BD6; }
.ar-score b { flex: 1; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ar-score em { font-style: normal; color: #FFE45E; }
.ar-score.dim { color: #8370B0; }
.ar-actions { margin-top: 10px; }
.ar-actions button { font-family: var(--ar-font) !important; }
.ar-leave { margin-top: 10px; font: 700 13px var(--ar-font) !important; color: #8370B0 !important; text-transform: uppercase; }
.ar-leave:hover { color: #FF2BD6 !important; }
`;

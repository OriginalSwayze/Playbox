// WIDGETS — a board of desktop widgets in a bento grid: continue playing, a clock, the fortnight's top games, a
// random pick with shuffle, storage, "on this day", unplayed count and a widget per collection. Any game opens a
// widget-style card with Play.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

export function Widgets() {
	const library = useKestrel((s) => s.library);
	const { recent, unplayed, installed } = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 3);
	const [sel, select] = useSelectedGame();
	const [seed, setSeed] = useState(1);
	const pick = unplayed.length ? unplayed[(seed * 7919) % unplayed.length] : library[0];
	const top2w = useMemo(() => [...library].filter((g) => g.minutes2w).sort((a, b) => b.minutes2w - a.minutes2w).slice(0, 5), [library]);
	const today = new Date();
	const onThisDay = library.filter((g) => { if (!g.added) return false; const d = new Date(g.added * 1000); return d.getMonth() === today.getMonth() && d.getDate() === today.getDate(); }).slice(0, 3);
	const disk = installed.reduce((n, g) => n + (g.sizeOnDisk || 0), 0);
	const G = ({ g, kind = 'capsule' }: { g: Game; kind?: 'capsule' | 'header' }) => <button data-appid={g.appid} className="wdg-g" onClick={() => select(g.appid)}><Art g={g} kind={kind} /><span>{g.name}</span></button>;
	const cont = recent[0];
	return (
		<AltPage className="wdg" brand={<>▦ Widgets</>}>
			<div className="wdg-app">
				<div className="wdg-grid">
					{cont && <section className="wdg-w big cont"><Art g={cont} kind="hero" className="wdg-bg" /><div><em>Continue playing</em><h2>{cont.name}</h2><p>{formatPlaytime(cont.minutes)} · {formatAgo(cont.lastPlayed)}</p><PlayBtn g={cont} className="wdg-play" /></div></section>}
					<section className="wdg-w clock"><b>{today.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><span>{today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span></section>
					<section className="wdg-w stat"><em>Library</em><b>{library.length}</b><span>games · {installed.length} installed</span></section>
					<section className="wdg-w tall"><em>Top this fortnight</em>{top2w.map((g) => <button key={g.appid} className="wdg-bar" onClick={() => select(g.appid)}><span>{g.name}</span><i style={{ width: (g.minutes2w / Math.max(1, top2w[0].minutes2w)) * 100 + '%' }} /><b>{(g.minutes2w / 60).toFixed(1)}h</b></button>)}{!top2w.length && <p>Nothing played lately.</p>}</section>
					{pick && <section className="wdg-w pick"><em>Random pick</em><G g={pick} /><button className="wdg-shuf" onClick={() => setSeed(seed + 1)}>⟳ Shuffle</button></section>}
					<section className="wdg-w disk"><em>Storage</em><b>{formatBytes(disk)}</b><div className="wdg-meter"><i style={{ width: Math.min(100, (disk / 2e12) * 100) + '%' }} /></div><span>of 2 TB (estimate)</span></section>
					<section className="wdg-w stat warm"><em>Never played</em><b>{unplayed.length}</b><span>waiting for you</span></section>
					<section className="wdg-w otd"><em>On this day</em>{onThisDay.length ? onThisDay.map((g) => <G key={g.appid} g={g} kind="header" />) : <p>No games joined your library on {today.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })} in past years.</p>}</section>
					{islands.map((i) => <section key={i.id} className="wdg-w col"><em>{i.name}</em><div className="wdg-mini">{i.games.slice(0, 8).map((g) => <G key={g.appid} g={g} />)}</div></section>)}
				</div>
				{sel && <div className="wdg-pop" onClick={() => select(null)}><section className="wdg-w card" key={sel.appid} onClick={(e) => e.stopPropagation()}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p><PlayBtn g={sel} className="wdg-play wide" /><Actions g={sel} className="wdg-act" /></section></div>}
			</div>
		</AltPage>
	);
}

export const widgetsCss = tok('widgets', { bg: '#1B1D29', s1: 'rgba(255,255,255,.08)', s2: 'rgba(255,255,255,.12)', s3: 'rgba(255,255,255,.18)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.8)', fg3: 'rgba(255,255,255,.55)', acc: '#7AA2FF', on: '#0B1230', top: 'transparent', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="widgets"] .k-top { position: relative; z-index: 2; border: 0; }
.wdg-brand { font: 600 18px var(--k-text); color: #fff; }
.wdg-app { position: absolute; inset: 0; overflow-y: auto; padding: 16px 30px 40px; background: radial-gradient(60% 60% at 20% 20%, #4B3B8F, transparent), radial-gradient(60% 60% at 80% 80%, #1F6F8B, transparent), #1B1D29; }
.wdg-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 160px; gap: 14px; max-width: 1400px; margin: 0 auto; }
.wdg-w { position: relative; overflow: hidden; padding: 16px; border-radius: 22px; background: rgba(255,255,255,.1); backdrop-filter: blur(24px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), 0 10px 30px -14px rgba(0,0,0,.5); color: #fff; animation: k-rise .45s var(--k-out) both; }
.wdg-w em { display: block; margin-bottom: 8px; font: 600 12px var(--k-text); font-style: normal; letter-spacing: .04em; color: rgba(255,255,255,.65); text-transform: uppercase; }
.wdg-w.big { grid-column: span 3; grid-row: span 2; display: flex; align-items: flex-end; } .wdg-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .wdg-w.cont::after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 30%, rgba(0,0,0,.8)); } .wdg-w.cont > div { position: relative; z-index: 1; }
.wdg-w.cont h2 { margin: 0 0 4px; font: 700 30px var(--k-text); } .wdg-w.cont p { margin: 0 0 12px; color: rgba(255,255,255,.8); }
.wdg-play { height: 40px; padding: 0 22px; border-radius: 20px; background: #fff !important; color: #111 !important; font: 700 14px var(--k-text) !important; } .wdg-play.wide { width: 100%; margin: 10px 0 6px; }
.wdg-w.clock { grid-column: span 2; display: grid; align-content: center; } .wdg-w.clock b { font: 200 64px/1 var(--k-text); } .wdg-w.clock span { color: rgba(255,255,255,.75); }
.wdg-w.stat b { display: block; font: 700 46px/1 var(--k-text); } .wdg-w.stat span { font: 13px var(--k-text); color: rgba(255,255,255,.7); } .wdg-w.warm { background: linear-gradient(135deg, rgba(255,120,80,.45), rgba(255,80,140,.35)); }
.wdg-w.tall { grid-column: span 2; grid-row: span 2; } .wdg-bar { display: grid; grid-template-columns: 1fr; gap: 3px; width: 100%; margin-bottom: 12px; text-align: left; color: #fff; } .wdg-bar span { font: 600 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wdg-bar i { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #7AA2FF, #C38BFF); } .wdg-bar b { font: 12px var(--k-text); color: rgba(255,255,255,.7); }
.wdg-w.pick { grid-row: span 2; display: flex; flex-direction: column; } .wdg-w.pick .wdg-g { flex: 1; min-height: 0; } .wdg-shuf { margin-top: 8px; height: 32px; border-radius: 16px; background: rgba(255,255,255,.16); color: #fff; font: 600 13px var(--k-text); }
.wdg-g { display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 6px; text-align: left; color: #fff; min-width: 0; } .wdg-g img, .wdg-g .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; min-height: 0; } .wdg-g span { font: 600 12px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wdg-w.disk b { font: 700 30px var(--k-text); } .wdg-meter { height: 10px; margin: 10px 0 6px; border-radius: 5px; background: rgba(255,255,255,.15); } .wdg-meter i { display: block; height: 100%; border-radius: 5px; background: #7AF0C8; } .wdg-w.disk span { font: 12px var(--k-text); color: rgba(255,255,255,.7); }
.wdg-w.otd { grid-column: span 2; display: flex; flex-direction: column; gap: 6px; } .wdg-w.otd .wdg-g { grid-template-columns: 80px 1fr; grid-template-rows: none; align-items: center; } .wdg-w.otd .wdg-g img { height: 38px; } .wdg-w.otd p, .wdg-w.tall p { margin: 0; font: 13px var(--k-text); color: rgba(255,255,255,.7); }
.wdg-w.col { grid-column: span 2; } .wdg-mini { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; height: calc(100% - 26px); } .wdg-mini .wdg-g span { display: none; } .wdg-mini .wdg-g { grid-template-rows: 1fr; }
.wdg-pop { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(0,0,0,.4); backdrop-filter: blur(6px); animation: k-fade .2s both; }
.wdg-w.card { width: 380px; animation: k-rise .3s var(--k-out) both; background: rgba(40,42,60,.85); } .wdg-w.card img { width: 100%; border-radius: 14px; } .wdg-w.card h3 { margin: 12px 0 2px; font: 700 20px var(--k-text); } .wdg-w.card p { margin: 0; color: rgba(255,255,255,.7); }
.wdg-act button { color: #fff !important; } .wdg-act button:hover { background: rgba(255,255,255,.1) !important; }
`;

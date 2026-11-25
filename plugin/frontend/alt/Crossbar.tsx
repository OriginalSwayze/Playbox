// CROSSBAR — a console media bar. Categories (collections) run left to right, their games stack vertically through
// the crossing point; arrow keys or clicks move, Enter opens. A slow ribbon of light waves behind everything.
import { useEffect, useState } from 'react';
import { mainWindow } from '../steam/env';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const GLYPH = ['◷', '▤', '★', '◆', '●', '▲', '■', '✚', '♪', '◎'];

export function Crossbar() {
	const islands = useIslands().slice(0, 10);
	const [sel, select] = useSelectedGame();
	const [c, setC] = useState(0);
	const [r, setR] = useState<Record<number, number>>({});
	const col = islands[c];
	const row = r[c] ?? 0;
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
			if (sel) { if (e.key === 'Escape' || e.key === 'Backspace') select(null); else return; }
			else if (e.key === 'ArrowLeft') setC((x) => Math.max(0, x - 1)); else if (e.key === 'ArrowRight') setC((x) => Math.min(islands.length - 1, x + 1));
			else if (e.key === 'ArrowUp') setR((o) => ({ ...o, [c]: Math.max(0, (o[c] ?? 0) - 1) })); else if (e.key === 'ArrowDown') setR((o) => ({ ...o, [c]: Math.min((col?.games.length ?? 1) - 1, (o[c] ?? 0) + 1) }));
			else if (e.key === 'Enter') { const g = col?.games[row]; if (g) select(g.appid); } else return;
			e.preventDefault(); e.stopPropagation();
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	});
	const focus = col?.games[row];
	return (
		<AltPage className="xmb" brand={<>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</>}>
			<div className="xmb-app">
				<svg className="xmb-wave" viewBox="0 0 1200 400" preserveAspectRatio="none"><path d="M0 220 C 200 140, 400 300, 600 210 S 1000 120, 1200 230" /><path d="M0 240 C 250 170, 450 320, 650 230 S 1000 150, 1200 250" /><path d="M0 200 C 300 260, 500 150, 700 220 S 1050 280, 1200 200" /></svg>
				{sel ? (
					<section className="xmb-info" key={sel.appid}>
						<Art g={sel} kind="hero" className="xmb-bg" />
						<div className="xmb-pane"><Art g={sel} kind="capsule" className="xmb-box" /><div><h1>{sel.name}</h1><p>{formatPlaytime(sel.minutes)} played · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never played'}</p>
							<PlayBtn g={sel} className="xmb-go" label={['▶  Start', '⬇  Install']} /><Actions g={sel} className="xmb-act" /><button className="xmb-back" onClick={() => select(null)}>◯ Back</button></div></div>
					</section>
				) : (
					<section className="xmb-bar" style={{ ['--c' as string]: c }}>
						<div className="xmb-cats">{islands.map((i, n) => (
							<button key={i.id} className={'xmb-cat' + (n === c ? ' on' : '')} onClick={() => setC(n)}><i>{GLYPH[n % GLYPH.length]}</i><span>{i.name}</span></button>
						))}</div>
						<div className="xmb-col">{col?.games.slice(0, 200).map((g, n) => (
							<button key={g.appid} data-appid={g.appid} className={'xmb-item' + (n === row ? ' on' : '') + (n < row ? ' above' : '')} style={{ ['--d' as string]: n - row }} onClick={() => (n === row ? select(g.appid) : setR({ ...r, [c]: n }))}>
								<Art g={g} kind="header" /><span><b>{g.name}</b>{n === row && <em>{g.installed ? (g.minutes ? formatPlaytime(g.minutes) : 'Installed') : 'Not installed'}</em>}</span>
							</button>
						))}</div>
						{focus && <p className="xmb-hint">⏎ Open · ← → categories · ↑ ↓ games</p>}
					</section>
				)}
			</div>
		</AltPage>
	);
}

export const crossbarCss = tok('crossbar', { bg: '#0A2A5E', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.16)', s3: 'rgba(255,255,255,.24)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.8)', fg3: 'rgba(255,255,255,.55)', acc: '#FFFFFF', on: '#0A2A5E', top: 'transparent', font: '"Segoe UI Light", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="crossbar"] .k-top { position: relative; z-index: 2; border: 0; }
.xmb-brand { font: 300 20px var(--k-text); color: #fff; }
.xmb-app { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(160deg, #1B4F9C, #0A2A5E 50%, #06183A); color: #fff; }
.xmb-wave { position: absolute; left: -10%; width: 120%; top: 20%; height: 60%; opacity: .5; animation: xmb-drift 18s ease-in-out infinite alternate; } .xmb-wave path { fill: none; stroke: rgba(255,255,255,.35); stroke-width: 1.5; } .xmb-wave path:nth-child(2) { stroke: rgba(160,210,255,.25); stroke-width: 22; filter: blur(8px); }
@keyframes xmb-drift { to { transform: translateX(6%) scaleY(1.2); } }
.xmb-bar { position: absolute; inset: 0; }
.xmb-cats { position: absolute; left: calc(26% - var(--c) * 150px); top: 24%; display: flex; gap: 0; transition: left .35s var(--k-out); }
.xmb-cat { width: 150px; display: grid; justify-items: center; gap: 8px; opacity: .55; transition: opacity .3s, transform .3s; } .xmb-cat i { font-style: normal; font-size: 42px; text-shadow: 0 0 14px rgba(255,255,255,.4); } .xmb-cat span { font: 15px var(--k-text); opacity: 0; transition: opacity .3s; white-space: nowrap; }
.xmb-cat.on { opacity: 1; transform: scale(1.15); } .xmb-cat.on span { opacity: 1; }
.xmb-col { position: absolute; left: calc(26% + 20px); top: 24%; width: 0; }
.xmb-item { position: absolute; left: 0; top: calc(var(--d) * 74px + 130px); display: flex; gap: 16px; align-items: center; width: 640px; text-align: left; opacity: .7; transition: top .35s var(--k-out), opacity .3s; }
.xmb-item.above { top: calc(var(--d) * 74px - 70px); } .xmb-item img, .xmb-item .alt-noart { width: 110px; height: 52px; object-fit: cover; border-radius: 3px; transition: transform .3s; transform-origin: left center; }
.xmb-item b { display: block; font: 300 20px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 6px rgba(0,0,0,.4); } .xmb-item em { font: 14px var(--k-text); font-style: normal; opacity: .7; }
.xmb-item.on { opacity: 1; } .xmb-item.on img { transform: scale(1.5); margin-right: 60px; box-shadow: 0 0 20px rgba(255,255,255,.3); } .xmb-item.on b { font-size: 24px; }
.xmb-hint { position: absolute; right: 30px; bottom: 20px; font: 13px var(--k-text); opacity: .6; }
.xmb-info { position: absolute; inset: 0; animation: k-fade .4s both; } .xmb-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; filter: blur(2px); }
.xmb-pane { position: absolute; left: 10%; top: 50%; transform: translateY(-50%); display: flex; gap: 40px; align-items: center; } .xmb-box { width: 240px; border-radius: 6px; box-shadow: 0 20px 50px rgba(0,0,0,.6); }
.xmb-pane h1 { margin: 0 0 8px; font: 300 44px var(--k-text); } .xmb-pane p { margin: 0 0 20px; font: 16px var(--k-text); opacity: .8; }
.xmb-go { height: 48px; padding: 0 30px; border-radius: 4px; background: rgba(255,255,255,.18) !important; box-shadow: inset 0 0 0 1px rgba(255,255,255,.5); color: #fff !important; font: 400 18px var(--k-text) !important; margin-bottom: 10px; } .xmb-go:hover { background: rgba(255,255,255,.3) !important; }
.xmb-act button { color: #fff !important; } .xmb-act button:hover { background: rgba(255,255,255,.12) !important; } .xmb-back { margin-top: 12px; font: 15px var(--k-text); color: #fff; opacity: .8; }
`;

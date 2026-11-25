// SYNTH — a modular synthesiser rack. Each collection is a module, its games are patch points (jacks) labelled on the
// panel; click a jack and a cable swings across to the OUTPUT module, which shows the patched game and plays it.
import { useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const HUES = [12, 40, 160, 200, 260, 320, 90, 0];

export function Synth() {
	const islands = useIslands().slice(0, 8);
	const [sel, select] = useSelectedGame();
	const [from, setFrom] = useState<{ x: number; y: number; tx: number; ty: number; h: number } | null>(null);
	return (
		<AltPage className="syn" brand={<>KESTREL MODULAR</>}>
			<div className="syn-app">
				<div className="syn-rack">
					{islands.map((i, k) => (
						<section key={i.id} className="syn-mod" style={{ ['--h' as string]: HUES[k % 8] }}>
							<header><b>{i.name}</b><em>{i.games.length} CV</em></header>
							<div className="syn-knobs">{[0, 1, 2].map((n) => <i key={n} style={{ transform: `rotate(${-120 + ((i.games[n]?.minutes ?? 0) % 240)}deg)` }} />)}</div>
							<div className="syn-jacks">{i.games.slice(0, 16).map((g) => (
								<button key={g.appid} data-appid={g.appid} className={'syn-jack' + (sel?.appid === g.appid ? ' on' : '') + (g.minutes2w ? ' live' : '')} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const app = e.currentTarget.closest('.syn-app') as HTMLElement; const p = app.getBoundingClientRect(); const t = app.querySelector('.syn-in')!.getBoundingClientRect(); setFrom({ x: r.left - p.left + r.width / 2 + app.scrollLeft, y: r.top - p.top + 12 + app.scrollTop, tx: t.left - p.left + 13 + app.scrollLeft, ty: t.top - p.top + 13 + app.scrollTop, h: HUES[k % 8] }); select(g.appid); }}>
									<span className="syn-hole" /><span className="syn-lbl">{g.name}</span>
								</button>
							))}</div>
						</section>
					))}
					<section className="syn-out">
						<header><b>OUTPUT</b><em>master</em></header>
						<div className="syn-scope">{sel ? <Art g={sel} kind="header" /> : <span>no patch</span>}</div>
						{sel ? <div key={sel.appid}><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p><PlayBtn g={sel} className="syn-go" label={['▶ GATE (PLAY)', '⬇ INSTALL']} /><Actions g={sel} className="syn-act" /></div> : <p>Patch a jack to hear it.</p>}
						<span className="syn-in" />
					</section>
				</div>
				{sel && from && <svg className="syn-cable" key={sel.appid}><path className="syn-wire" d={`M${from.x} ${from.y} C ${from.x} ${from.y + 320}, ${from.tx - 120} ${from.ty + 300}, ${from.tx} ${from.ty}`} style={{ stroke: `hsl(${from.h} 80% 55%)` }} /></svg>}
			</div>
		</AltPage>
	);
}


export const synthCss = tok('synth', { bg: '#17181B', s1: '#232428', s2: '#2D2F34', s3: '#3A3D43', fg: '#ECEDEF', fg2: '#B9BCC2', fg3: '#7D8189', acc: '#FF6B3D', on: '#1A0B04', top: '#0E0F11', font: '"Bahnschrift", "Segoe UI", sans-serif' }) + `
.syn-brand { font: 700 14px var(--k-text); letter-spacing: .3em; color: #ECEDEF; }
.syn-app { position: absolute; inset: 0; overflow: auto; isolation: isolate; padding: 18px; background: #0E0F11; }
.syn-rack { display: flex; gap: 6px; min-height: 100%; padding: 14px 10px; border-radius: 6px; background: linear-gradient(#2A2B2F, #1C1D20); box-shadow: inset 0 10px 0 #3A3B40, inset 0 -10px 0 #3A3B40; }
.syn-mod, .syn-out { position: relative; flex: none; width: 190px; padding: 10px 10px 14px; border-radius: 4px; background: linear-gradient(hsl(var(--h) 18% 82%), hsl(var(--h) 14% 70%)); box-shadow: inset 0 0 0 1px rgba(0,0,0,.25), 0 4px 10px rgba(0,0,0,.5); color: #1A1A1A; }
.syn-mod header, .syn-out header { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 6px; border-bottom: 2px solid hsl(var(--h) 70% 45%); } .syn-mod b, .syn-out header b { font: 800 12px var(--k-text); letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .syn-mod em, .syn-out em { font: 10px var(--k-text); font-style: normal; color: #444; }
.syn-knobs { display: flex; justify-content: space-around; margin: 12px 0; } .syn-knobs i { position: relative; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #555, #111); box-shadow: 0 3px 4px rgba(0,0,0,.5); } .syn-knobs i::after { content: ""; position: absolute; left: 50%; top: 4px; width: 3px; height: 12px; margin-left: -1.5px; background: hsl(var(--h) 80% 60%); }
.syn-jacks { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 6px; }
.syn-jack { display: grid; justify-items: center; gap: 3px; } .syn-hole { width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle, #000 35%, #888 40%, #CCC 55%, #777 70%); box-shadow: 0 1px 2px rgba(0,0,0,.5); }
.syn-jack.live .syn-hole { box-shadow: 0 0 0 3px hsl(var(--h) 80% 55%); } .syn-jack.on .syn-hole { background: radial-gradient(circle, hsl(var(--h) 80% 55%) 45%, #222 50%); }
.syn-lbl { max-width: 84px; font: 700 8.5px/1.1 var(--k-text); text-transform: uppercase; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.syn-out { --h: 20; width: 300px; margin-left: auto; background: linear-gradient(#2B2D31, #1C1D20); color: #ECEDEF; } .syn-out header { border-color: #FF6B3D; } .syn-out em { color: #888; }
.syn-scope { height: 130px; margin: 12px 0; border-radius: 4px; background: #000; display: grid; place-items: center; overflow: hidden; box-shadow: inset 0 0 0 2px #444; } .syn-scope img { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.4) contrast(1.1); } .syn-scope span { font: 12px Consolas, monospace; color: #555; }
.syn-out h3 { margin: 0 0 4px; font: 700 16px var(--k-text); } .syn-out p { margin: 0 0 10px; font: 12px var(--k-text); color: #B9BCC2; }
.syn-go { width: 100%; height: 40px; border-radius: 4px; background: #FF6B3D !important; color: #1A0B04 !important; font: 800 13px var(--k-text) !important; letter-spacing: .1em; margin-bottom: 6px; } .syn-act button { color: #B9BCC2 !important; font-size: 12px !important; } .syn-act button:hover { background: #2D2F34 !important; }
.syn-in { position: absolute; left: -12px; top: 60px; width: 26px; height: 26px; border-radius: 50%; background: radial-gradient(circle, #000 35%, #FF6B3D 40%); }
.syn-cable { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; --tx: 0; } .syn-wire { fill: none; stroke-width: 7; stroke-linecap: round; filter: drop-shadow(0 6px 4px rgba(0,0,0,.6)); animation: syn-drop .6s var(--k-spring) both; } @keyframes syn-drop { from { stroke-dasharray: 0 3000; } to { stroke-dasharray: 3000 0; } }
`;

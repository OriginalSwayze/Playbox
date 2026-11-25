// AQUARIUM — a fish tank. Each game in the chosen tank (collection) is a fish: bigger the more you've played, livelier
// if you played it this fortnight, sleepy near the bottom if never. Click a fish to read its tag; Feed plays it.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const rnd = (n: number) => { let x = Math.imul(n ^ 0x2545f491, 0x9e3779b1); x ^= x >>> 15; return (x >>> 0) / 4294967296; };
const HUES = [10, 30, 48, 190, 280, 330, 160, 210];

export function Aquarium() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const fish = useMemo(() => b.games.slice(0, 40).map((g, i) => { const size = 34 + Math.min(110, Math.sqrt(g.minutes) * 3); const depth = g.minutes ? 8 + rnd(g.appid) * 62 : 74 + rnd(g.appid) * 12; return { g, size, depth, dur: (g.minutes2w ? 14 : 26) + rnd(g.appid + 5) * 14, delay: -rnd(g.appid + 9) * 30, hue: HUES[i % 8] }; }), [b.games]);
	const Fish = ({ g, size, depth, dur, delay, hue }: { g: Game; size: number; depth: number; dur: number; delay: number; hue: number }) => (
		<button data-appid={g.appid} className={'aq-fish' + (sel?.appid === g.appid ? ' on' : '') + (g.minutes ? '' : ' sleepy')} style={{ top: depth + '%', width: size, height: size * 0.6, ['--d' as string]: dur + 's', ['--dl' as string]: delay + 's', ['--h' as string]: hue }} onClick={() => select(g.appid)} title={g.name}>
			<span className="aq-turn"><span className="aq-body"><Art g={g} kind="capsule" /></span><span className="aq-tail" /><span className="aq-eye" /></span><span className="aq-tag">{g.name}</span>
		</button>
	);
	return (
		<AltPage className="aq" brand={<>🐠 Aquarium</>}>
			<div className="aq-app">
				<nav className="aq-tanks">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name}</button>)}</nav>
				<section className="aq-tank">
					<div className="aq-light" />
					{Array.from({ length: 18 }, (_, i) => <i key={i} className="aq-bub" style={{ left: (i * 61) % 100 + '%', animationDelay: (i % 9) * 0.9 + 's', animationDuration: 5 + (i % 5) + 's' }} />)}
					{fish.map((f) => <Fish key={f.g.appid} {...f} />)}
					<div className="aq-sand" /><div className="aq-weed a" /><div className="aq-weed b" /><div className="aq-weed c" /><div className="aq-castle">🏰</div>
				</section>
				{sel && (
					<aside className="aq-card" key={sel.appid}>
						<Art g={sel} kind="header" /><h3>{sel.name}</h3>
						<dl><dt>Size</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Last fed</dt><dd>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</dd><dt>Mood</dt><dd>{sel.minutes2w ? 'Lively' : sel.minutes ? 'Calm' : 'Asleep'}</dd></dl>
						<PlayBtn g={sel} className="aq-go" label={['Feed it — Play', 'Add to tank — Install']} /><Actions g={sel} className="aq-act" /><button className="aq-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const aquariumCss = tok('aquarium', { bg: '#04263B', s1: '#073752', s2: '#0A4566', s3: '#0E557C', fg: '#E6FAFF', fg2: '#B3E5F2', fg3: '#7DBBD0', acc: '#FFB347', on: '#2A1600', top: '#021A29', font: '"Segoe UI", system-ui, sans-serif' }) + `
.aq-brand { font: 700 18px var(--k-text); color: #E6FAFF; }
.aq-app { position: absolute; inset: 0; display: grid; grid-template-rows: 44px minmax(0, 1fr); background: #021A29; }
.aq-tanks { display: flex; gap: 6px; justify-content: center; align-items: center; overflow-x: auto; } .aq-tanks button { flex: none; padding: 5px 14px; border-radius: 99px; background: #073752; font: 600 12px var(--k-text); color: #B3E5F2; } .aq-tanks button.on { background: #B3E5F2; color: #04263B; }
.aq-tank { position: relative; overflow: hidden; margin: 0 20px 20px; border-radius: 14px; background: linear-gradient(#1F8FB8 0%, #0D5E85 45%, #053A57 100%); box-shadow: inset 0 0 0 6px rgba(255,255,255,.12), inset 0 0 80px rgba(0,0,0,.4), 0 20px 40px rgba(0,0,0,.5); }
.aq-light { position: absolute; inset: 0; background: repeating-linear-gradient(100deg, rgba(255,255,255,.06) 0 40px, transparent 40px 120px); animation: aq-ray 12s ease-in-out infinite alternate; pointer-events: none; } @keyframes aq-ray { to { transform: translateX(60px); } }
.aq-bub { position: absolute; bottom: 30px; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.6); animation: aq-bub linear infinite; pointer-events: none; } @keyframes aq-bub { to { transform: translateY(-80vh) translateX(10px); opacity: 0; } }
.aq-fish { position: absolute; left: 0; z-index: 2; animation: aq-swim var(--d) linear var(--dl) infinite; } @keyframes aq-swim { 0%, 100% { transform: translateX(-160px); } 50% { transform: translateX(calc(100vw - 200px)); } }
.aq-turn { position: absolute; inset: 0; animation: aq-turn var(--d) step-end var(--dl) infinite; } @keyframes aq-turn { 0% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
.aq-fish.sleepy { --d: 60s !important; opacity: .8; }
.aq-body { position: absolute; left: 22%; top: 0; width: 78%; height: 100%; border-radius: 60% 45% 45% 60% / 55% 50% 50% 55%; overflow: hidden; background: hsl(var(--h) 85% 60%); box-shadow: inset -6px -4px 10px rgba(0,0,0,.25), 0 4px 10px rgba(0,0,0,.3); }
.aq-body img, .aq-body .alt-noart { width: 100%; height: 100%; object-fit: cover; opacity: .55; mix-blend-mode: luminosity; font-size: 0; }
.aq-tail { position: absolute; left: 0; top: 15%; width: 28%; height: 70%; background: hsl(var(--h) 85% 50%); clip-path: polygon(0 0, 100% 50%, 0 100%, 25% 50%); animation: aq-wag .4s ease-in-out infinite alternate; transform-origin: right center; } @keyframes aq-wag { to { transform: scaleY(.75); } }
.aq-eye { position: absolute; right: 14%; top: 30%; width: 9%; aspect-ratio: 1; border-radius: 50%; background: #fff; box-shadow: inset -2px 0 0 1px #111; }
.aq-tag { position: absolute; left: 50%; top: -22px; transform: translateX(-50%); padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,.55); color: #fff; font: 600 11px var(--k-text); white-space: nowrap; opacity: 0; transition: opacity .2s; pointer-events: none; }
.aq-fish:hover .aq-tag, .aq-fish.on .aq-tag { opacity: 1; } .aq-fish.on .aq-body { box-shadow: 0 0 0 3px #FFB347, 0 0 20px #FFB347; } .aq-fish:hover, .aq-fish:hover .aq-turn { animation-play-state: paused; }
.aq-sand { position: absolute; left: 0; right: 0; bottom: 0; height: 60px; background: radial-gradient(ellipse at 50% 100%, #E8D3A0, #C9A96A 70%); border-radius: 50% 50% 0 0 / 30px 30px 0 0; }
.aq-weed { position: absolute; bottom: 30px; width: 18px; height: 180px; border-radius: 9px; background: linear-gradient(#3BB273, #1E7A47); transform-origin: bottom center; animation: aq-sway 4s ease-in-out infinite alternate; } .aq-weed.a { left: 8%; } .aq-weed.b { left: 11%; height: 130px; animation-delay: -1s; } .aq-weed.c { right: 12%; height: 220px; animation-delay: -2s; } @keyframes aq-sway { to { transform: rotate(8deg); } }
.aq-castle { position: absolute; right: 20%; bottom: 30px; font-size: 80px; filter: saturate(.6); }
.aq-card { position: absolute; right: 40px; top: 70px; z-index: 5; width: 300px; padding: 14px; border-radius: 16px; background: rgba(2,26,41,.88); backdrop-filter: blur(8px); color: #E6FAFF; animation: k-fade .2s both; }
.aq-card img { width: 100%; border-radius: 10px; } .aq-card h3 { margin: 10px 0; font: 700 18px var(--k-text); } .aq-card dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 12px; font: 13px var(--k-text); } .aq-card dt { color: #7DBBD0; } .aq-card dd { margin: 0; }
.aq-go { width: 100%; height: 42px; border-radius: 10px; background: #FFB347 !important; color: #2A1600 !important; font: 700 14px var(--k-text) !important; margin-bottom: 6px; } .aq-act button { color: #B3E5F2 !important; } .aq-act button:hover { background: #073752 !important; } .aq-x { margin-top: 6px; color: #FFB347; font: 600 13px var(--k-text); }
`;

// WHEEL — a decision wheel for "what should I play?". Up to 24 games from the chosen pool sit on the segments; spin it
// and it eases to a stop under the pointer, then the winner opens with Play. Pools: unplayed, installed, a collection.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

const COLORS = ['#FF5D73', '#FFB13B', '#FFE45E', '#7BE495', '#4CC9F0', '#7B8CFF', '#C77DFF', '#FF8FAB'];

export function Wheel() {
	const islands = useIslands();
	const { unplayed, installed } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [pool, setPool] = useState('unplayed');
	const [rot, setRot] = useState(0);
	const [spinning, setSpinning] = useState(false);
	const [won, setWon] = useState<Game | null>(null);
	const pools: { id: string; name: string; games: Game[] }[] = [{ id: 'unplayed', name: 'Never played', games: unplayed }, { id: 'installed', name: 'Installed', games: installed }, ...islands];
	const games = useMemo(() => { const p = pools.find((x) => x.id === pool)?.games ?? []; const seed = p.length; return [...p].sort((a, b) => ((a.appid * 7 + seed) % 97) - ((b.appid * 7 + seed) % 97)).slice(0, 24); }, [pool, pools.length, unplayed.length]);
	const n = Math.max(1, games.length), seg = 360 / n;
	const spin = () => {
		if (spinning || !games.length) return;
		const pick = Math.floor(Math.random() * n);
		const target = rot - (rot % 360) + 360 * 6 + (360 - (pick * seg + seg / 2));
		setSpinning(true); setWon(null); setRot(target);
		setTimeout(() => { setSpinning(false); setWon(games[pick]); }, 4200);
	};
	const show = sel ?? won;
	return (
		<AltPage className="whl" brand={<>🎡 Spin to Play</>}>
			<div className="whl-app">
				<aside className="whl-pools"><h4>Pool</h4>{pools.map((p) => <button key={p.id} className={pool === p.id ? 'on' : ''} onClick={() => { setPool(p.id); setWon(null); select(null); }}>{p.name}<em>{p.games.length}</em></button>)}</aside>
				<section className="whl-stage2">
					<div className="whl-pointer">▼</div>
					<div className="whl-wheel" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.12,.6,.1,1)' : 'none' }}>
						<svg viewBox="-200 -200 400 400">
							{games.map((g, i) => { const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180; const large = seg > 180 ? 1 : 0; const mid = (i + 0.5) * seg; return (
								<g key={g.appid} data-appid={g.appid} onClick={() => !spinning && select(g.appid)}>
									<path d={`M0 0 L ${Math.cos(a0) * 190} ${Math.sin(a0) * 190} A 190 190 0 ${large} 1 ${Math.cos(a1) * 190} ${Math.sin(a1) * 190} Z`} fill={COLORS[i % 8]} stroke="#fff" strokeWidth="2" />
									<text transform={`rotate(${mid - 90}) translate(178 0)`} textAnchor="end" dominantBaseline="middle">{g.name.length > 22 ? g.name.slice(0, 21) + '…' : g.name}</text>
								</g>); })}
							<circle r="26" fill="#fff" stroke="#2B2147" strokeWidth="6" />
						</svg>
					</div>
					<button className="whl-spin" onClick={spin} disabled={spinning || !games.length}>{spinning ? 'Spinning…' : games.length ? 'SPIN!' : 'Pool is empty'}</button>
				</section>
				{show && !spinning && (
					<aside className="whl-win" key={show.appid}>
						{won?.appid === show.appid && <div className="whl-conf">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: (i * 37) % 100 + '%', background: COLORS[i % 8], animationDelay: (i % 6) * 0.08 + 's' }} />)}</div>}
						<em>{won?.appid === show.appid ? 'The wheel has spoken!' : 'On the wheel'}</em>
						<Art g={show} kind="capsule" className="whl-box" /><h2>{show.name}</h2>
						<p>{show.minutes ? `${formatPlaytime(show.minutes)} played · last ${formatAgo(show.lastPlayed).toLowerCase()}` : 'You have never played this one.'}</p>
						<PlayBtn g={show} className="whl-go" label={["Let's play", 'Install it']} /><Actions g={show} /><button className="whl-again" onClick={() => { select(null); setWon(null); }}>Spin again</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const wheelCss = tok('wheel', { bg: '#2B2147', s1: '#3A2D60', s2: '#4A3A78', s3: '#5B4890', fg: '#FFFFFF', fg2: '#DCD3F5', fg3: '#A699D1', acc: '#FFE45E', on: '#2B2147', font: '"Segoe UI", system-ui, sans-serif' }) + `
.whl-brand { font: 800 19px var(--k-text); color: #FFE45E; }
.whl-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr) auto; background: radial-gradient(circle at 50% 50%, #4A3A78, #2B2147 70%); }
.whl-pools { overflow-y: auto; padding: 16px 10px; } .whl-pools h4 { margin: 0 10px 8px; font: 700 12px var(--k-text); color: #A699D1; text-transform: uppercase; letter-spacing: .1em; }
.whl-pools button { display: flex; justify-content: space-between; width: 100%; padding: 8px 12px; border-radius: 10px; font: 600 14px var(--k-text); color: #DCD3F5; text-align: left; } .whl-pools button.on { background: #FFE45E; color: #2B2147; } .whl-pools em { font-style: normal; opacity: .6; }
.whl-stage2 { position: relative; display: grid; place-items: center; align-content: center; gap: 20px; }
.whl-pointer { position: relative; z-index: 2; margin-bottom: -38px; font-size: 44px; color: #fff; text-shadow: 0 4px 8px rgba(0,0,0,.5); }
.whl-wheel { width: min(620px, 70vh); aspect-ratio: 1; border-radius: 50%; box-shadow: 0 0 0 12px #FFE45E, 0 0 0 18px #2B2147, 0 30px 60px rgba(0,0,0,.5); background: #fff; }
.whl-wheel svg { width: 100%; height: 100%; display: block; } .whl-wheel text { font: 700 11px var(--k-text); fill: #2B2147; pointer-events: none; } .whl-wheel g { cursor: pointer; } .whl-wheel g:hover path { filter: brightness(1.1); }
.whl-spin { height: 64px; padding: 0 60px; border-radius: 32px; background: linear-gradient(#FFE45E, #FFB13B); color: #2B2147; font: 900 26px var(--k-text); letter-spacing: .06em; box-shadow: 0 6px 0 #B97A14, 0 14px 30px rgba(0,0,0,.4); } .whl-spin:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #B97A14; } .whl-spin:disabled { opacity: .7; }
.whl-win { position: relative; width: 340px; overflow-y: auto; padding: 20px; display: grid; justify-items: center; align-content: start; text-align: center; background: #3A2D60; animation: k-fade .3s both; }
.whl-win em { font: 800 13px var(--k-text); font-style: normal; letter-spacing: .1em; text-transform: uppercase; color: #FFE45E; } .whl-box { width: 200px; margin: 12px 0; border-radius: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.5); animation: whl-pop .6s var(--k-spring) both; } @keyframes whl-pop { from { transform: scale(.4) rotate(-10deg); } }
.whl-win h2 { margin: 0 0 6px; font: 800 22px var(--k-text); } .whl-win p { margin: 0 0 14px; color: #DCD3F5; font: 14px var(--k-text); }
.whl-go { width: 100%; height: 50px; border-radius: 14px; background: #7BE495 !important; color: #10331B !important; font: 800 17px var(--k-text) !important; margin-bottom: 8px; } .whl-win .alt-actions { width: 100%; } .whl-win .alt-actions button { color: #DCD3F5 !important; } .whl-again { margin-top: 10px; color: #FFE45E; font: 700 14px var(--k-text); }
.whl-conf { position: absolute; inset: 0; overflow: hidden; pointer-events: none; } .whl-conf i { position: absolute; top: -10px; width: 8px; height: 14px; border-radius: 2px; animation: whl-fall 1.6s ease-in both; } @keyframes whl-fall { to { transform: translateY(700px) rotate(540deg); opacity: 0; } }
`;

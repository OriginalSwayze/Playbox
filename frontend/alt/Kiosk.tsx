// KIOSK — a self-service touchscreen. An attract screen ("Touch to start"), then three big steps: choose a
// category, choose a game, confirm. Everything is huge, high-contrast and one tap; the last step starts the game.
import { useState } from 'react';
import { formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame, type Island } from './common';
import { tok } from './kit';

export function Kiosk() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [started, setStarted] = useState(false);
	const [cat, setCat] = useState<Island | null>(null);
	const step = sel ? 3 : cat ? 2 : 1;
	const reset = () => { select(null); setCat(null); setStarted(false); };
	if (!started && !sel) return (
		<AltPage className="ksk" brand={<>KESTREL KIOSK</>}>
			<button className="ksk-attract" onClick={() => setStarted(true)}>
				<div className="ksk-wall">{islands.flatMap((i) => i.games).slice(0, 24).map((g, n) => <span key={g.appid + '-' + n} data-appid={g.appid}><Art g={g} kind="capsule" /></span>)}</div>
				<div className="ksk-cta"><b>Touch to start</b><span>Choose a game in three taps</span></div>
			</button>
		</AltPage>
	);
	return (
		<AltPage className="ksk" brand={<>KESTREL KIOSK</>}>
			<div className="ksk-app">
				<div className="ksk-steps">{['Category', 'Game', 'Confirm'].map((s, n) => <span key={s} className={step === n + 1 ? 'on' : step > n + 1 ? 'done' : ''}><i>{step > n + 1 ? '✓' : n + 1}</i>{s}</span>)}</div>
				{sel ? (
					<section className="ksk-confirm" key={sel.appid}>
						<Art g={sel} kind="capsule" className="ksk-box" />
						<div><h1>{sel.name}</h1><p>{sel.minutes ? `${formatPlaytime(sel.minutes)} played before` : 'First time!'}</p><PlayBtn g={sel} className="ksk-big" label={['START GAME', 'INSTALL']} /><Actions g={sel} className="ksk-act" /></div>
					</section>
				) : cat ? (
					<section className="ksk-grid">{cat.games.slice(0, 48).map((g) => <button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><b>{g.name}</b></button>)}</section>
				) : (
					<section className="ksk-cats">{islands.map((i, n) => <button key={i.id} style={{ ['--h' as string]: (n * 47) % 360 }} onClick={() => setCat(i)}><b>{i.name}</b><span>{i.games.length} games</span></button>)}</section>
				)}
				<div className="ksk-foot"><button onClick={() => (sel ? select(null) : cat ? setCat(null) : setStarted(false))}>◀ BACK</button><button className="x" onClick={reset}>✕ START OVER</button></div>
			</div>
		</AltPage>
	);
}

export const kioskCss = tok('kiosk', { bg: '#FFFFFF', s1: '#F2F2F2', s2: '#E6E6E6', s3: '#CCCCCC', fg: '#000000', fg2: '#222', fg3: '#555', acc: '#0057FF', on: '#fff', top: '#000000', topFg: '#FFFFFF', font: '"Segoe UI", Arial, sans-serif' }) + `
.ksk-brand { font: 900 16px var(--k-text); letter-spacing: .14em; color: #FFD400; }
.ksk-attract { position: absolute; inset: 0; overflow: hidden; background: #000; }
.ksk-wall { position: absolute; inset: -10%; display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; transform: rotate(-8deg); opacity: .5; animation: ksk-pan 40s linear infinite alternate; } .ksk-wall img { width: 100%; border-radius: 12px; } @keyframes ksk-pan { to { transform: rotate(-8deg) translateY(-12%); } }
.ksk-cta { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; gap: 10px; padding: 40px 70px; border-radius: 30px; background: #FFD400; color: #000; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.6); animation: ksk-pulse 1.6s ease-in-out infinite; }
.ksk-cta b { font: 900 54px var(--k-text); } .ksk-cta span { font: 600 22px var(--k-text); } @keyframes ksk-pulse { 50% { transform: translate(-50%, -50%) scale(1.04); } }
.ksk-app { position: absolute; inset: 0; display: grid; grid-template-rows: 90px minmax(0, 1fr) 100px; background: #fff; }
.ksk-steps { display: flex; gap: 40px; justify-content: center; align-items: center; border-bottom: 4px solid #000; } .ksk-steps span { display: flex; gap: 12px; align-items: center; font: 800 22px var(--k-text); color: #999; }
.ksk-steps i { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #E6E6E6; font-style: normal; } .ksk-steps .on { color: #000; } .ksk-steps .on i { background: #0057FF; color: #fff; } .ksk-steps .done i { background: #00A651; color: #fff; }
.ksk-cats { overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 30px; align-content: start; }
.ksk-cats button { display: grid; align-content: center; gap: 6px; height: 160px; padding: 0 30px; border-radius: 24px; text-align: left; background: hsl(var(--h) 85% 50%); color: #fff; box-shadow: 0 8px 0 hsl(var(--h) 85% 35%); transition: transform .1s; } .ksk-cats button:active { transform: translateY(6px); box-shadow: 0 2px 0 hsl(var(--h) 85% 35%); }
.ksk-cats b { font: 900 32px var(--k-text); text-shadow: 0 2px 0 rgba(0,0,0,.2); } .ksk-cats span { font: 700 18px var(--k-text); opacity: .9; }
.ksk-grid { overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 22px; padding: 30px; align-content: start; }
.ksk-grid button { display: grid; gap: 10px; padding: 12px; border-radius: 20px; border: 4px solid #000; background: #fff; text-align: center; } .ksk-grid button:active { background: #FFD400; }
.ksk-grid img, .ksk-grid .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 10px; } .ksk-grid b { font: 800 18px var(--k-text); line-height: 1.2; }
.ksk-confirm { display: flex; gap: 50px; justify-content: center; align-items: center; padding: 30px; animation: k-rise .35s var(--k-out) both; } .ksk-box { width: 320px; border-radius: 20px; border: 6px solid #000; }
.ksk-confirm h1 { margin: 0 0 10px; font: 900 48px/1.05 var(--k-text); max-width: 600px; } .ksk-confirm p { margin: 0 0 24px; font: 600 24px var(--k-text); color: #555; }
.ksk-big { width: 100%; height: 100px; border-radius: 24px; background: #00A651 !important; color: #fff !important; font: 900 36px var(--k-text) !important; box-shadow: 0 8px 0 #006B34; margin-bottom: 14px; } .ksk-big:active { transform: translateY(6px); box-shadow: 0 2px 0 #006B34; }
.ksk-act button { font-size: 18px !important; padding: 12px !important; color: #000 !important; }
.ksk-foot { display: flex; gap: 20px; justify-content: space-between; align-items: center; padding: 0 30px; border-top: 4px solid #000; } .ksk-foot button { height: 64px; padding: 0 34px; border-radius: 18px; background: #000; color: #fff; font: 900 22px var(--k-text); } .ksk-foot .x { background: #E00; }
`;

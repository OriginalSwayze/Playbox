// WATCH — a smartwatch. The home screen is a honeycomb of round app icons that swell towards the middle; tap one
// and the watch face shows it with three activity rings (fortnight, all-time, rating) and a tap-to-play button.
import { useRef, useState } from 'react';
import { formatAgo, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, hrs, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const Ring = ({ r, p, c }: { r: number; p: number; c: string }) => { const C = 2 * Math.PI * r; return <><circle cx="150" cy="150" r={r} stroke={c} strokeOpacity=".22" /><circle cx="150" cy="150" r={r} stroke={c} strokeDasharray={`${C * Math.min(1, p)} ${C}`} transform="rotate(-90 150 150)" /></>; };

export function Watch() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const box = useRef<HTMLDivElement>(null);
	const [c, setC] = useState({ x: 0, y: 0 });
	const list = b.games.slice(0, 91);
	const cols = 13;
	const face = (g: Game) => (
		<div className="wch-face" key={g.appid}>
			<svg viewBox="0 0 300 300"><g fill="none" strokeWidth="18" strokeLinecap="round"><Ring r={130} p={g.minutes2w / 600} c="#FA3C5A" /><Ring r={108} p={g.minutes / 6000} c="#A4FF3C" /><Ring r={86} p={g.metacritic / 100} c="#3CE2FA" /></g></svg>
			<div className="wch-in"><Art g={g} kind="capsule" /><b>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><span>{g.name}</span><PlayBtn g={g} className="wch-go" label={['▶ Play', '⬇ Install']} /></div>
		</div>
	);
	return (
		<AltPage className="wch" brand={<><span className="wch-crown" />Watch</>}>
			<div className="wch-app">
				<div className="wch-hc" ref={box} onPointerMove={(e) => { const r = box.current!.getBoundingClientRect(); setC({ x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 }); }} onPointerLeave={() => setC({ x: 0, y: 0 })}>
					{list.map((g, i) => {
						const row = Math.floor(i / cols), col = i % cols;
						const x = (col - (cols - 1) / 2) * 92 + (row % 2 ? 46 : 0), y = (row - 3) * 80;
						const d = Math.hypot(x - c.x, y - c.y);
						const s = Math.max(0.35, 1.25 - d / 420);
						return <button key={g.appid} data-appid={g.appid} className={'wch-app-ico' + (sel?.appid === g.appid ? ' on' : '')} style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }} onClick={() => select(g.appid)} title={g.name}><Art g={g} kind="capsule" /></button>;
					})}
				</div>
				<aside className="wch-side">
					<div className="wch-lists">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name}</button>)}</div>
					{sel ? <div className="wch-detail">
						<div className="wch-case">{face(sel)}</div>
						<div className="wch-legend"><p><i style={{ background: '#FA3C5A' }} />Move <b>{(sel.minutes2w / 60).toFixed(1)}/10 h</b></p><p><i style={{ background: '#A4FF3C' }} />Total <b>{hrs(sel)}/100 h</b></p><p><i style={{ background: '#3CE2FA' }} />Rating <b>{sel.metacritic || 0}/100</b></p><p>Last: {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never'}</p></div>
						<Actions g={sel} className="wch-act" />
					</div> : <p className="wch-hint">Move over the honeycomb and tap an app.</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const watchCss = tok('watch', { bg: '#000000', s1: '#1C1C1E', s2: '#2C2C2E', s3: '#3A3A3C', fg: '#FFFFFF', fg2: '#C7C7CC', fg3: '#8E8E93', acc: '#A4FF3C', on: '#000', font: '"Segoe UI", system-ui, sans-serif' }) + `
.wch-brand { display: flex; gap: 8px; align-items: center; font: 600 18px var(--k-text); color: #fff; } .wch-crown { width: 14px; height: 20px; border-radius: 4px; background: repeating-linear-gradient(#888 0 2px, #444 2px 4px); }
.wch-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 420px; }
.wch-hc { position: relative; overflow: hidden; display: grid; place-items: center; }
.wch-app-ico { position: absolute; left: 50%; top: 50%; width: 84px; height: 84px; margin: -42px; border-radius: 50%; overflow: hidden; transition: transform .18s ease-out; box-shadow: 0 4px 14px rgba(0,0,0,.6); }
.wch-app-ico img, .wch-app-ico .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 7px; } .wch-app-ico.on { box-shadow: 0 0 0 4px #A4FF3C; }
.wch-side { overflow-y: auto; padding: 18px; background: #0C0C0D; border-left: 1px solid #1C1C1E; }
.wch-lists { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; } .wch-lists button { padding: 5px 12px; border-radius: 99px; background: #1C1C1E; color: #C7C7CC; font: 600 12px var(--k-text); } .wch-lists button.on { background: #A4FF3C; color: #000; }
.wch-case { width: 320px; height: 370px; margin: 0 auto 18px; padding: 25px 10px; border-radius: 90px; background: linear-gradient(145deg, #3A3A3C, #1C1C1E); box-shadow: 0 30px 60px -20px #000, inset 0 2px 0 rgba(255,255,255,.15); position: relative; }
.wch-case::after { content: ""; position: absolute; right: -10px; top: 110px; width: 12px; height: 50px; border-radius: 4px; background: repeating-linear-gradient(#777 0 2px, #444 2px 4px); }
.wch-face { position: relative; width: 300px; height: 320px; border-radius: 70px; background: #000; display: grid; place-items: center; overflow: hidden; animation: k-fade .35s both; }
.wch-face svg { position: absolute; width: 290px; height: 290px; } .wch-face svg circle:nth-child(even) { transition: stroke-dasharray 1.2s var(--k-out); }
.wch-in { position: relative; display: grid; justify-items: center; gap: 4px; width: 150px; text-align: center; } .wch-in img, .wch-in .alt-noart { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; }
.wch-in b { font: 600 30px var(--k-text); color: #fff; } .wch-in span { font: 12px var(--k-text); color: #C7C7CC; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wch-go { margin-top: 4px; padding: 5px 14px; border-radius: 99px; background: #A4FF3C !important; color: #000 !important; font: 700 12px var(--k-text) !important; }
.wch-legend p { display: flex; gap: 10px; align-items: center; margin: 8px 0; font: 14px var(--k-text); color: #C7C7CC; } .wch-legend i { width: 12px; height: 12px; border-radius: 50%; } .wch-legend b { margin-left: auto; color: #fff; }
.wch-hint { color: #8E8E93; font: 14px var(--k-text); text-align: center; margin-top: 40px; }
`;

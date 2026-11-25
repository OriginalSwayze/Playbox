// CAMERA — a camera app. The viewfinder frames the selected game with a rule-of-thirds grid and a focus box; the
// mode wheel along the bottom switches collections, the strip picks a subject, and the shutter button plays it.
import { useState } from 'react';
import { formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Camera() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [flash, setFlash] = useState(false);
	const [focus, setFocus] = useState({ x: 50, y: 50 });
	const [info, setInfo] = useState(false);
	const g = sel ?? b.games[0] ?? null;
	const shoot = () => { if (!g) return; setFlash(true); setTimeout(() => setFlash(false), 300); setTimeout(gameCommands(g)[0].run, 350); };
	return (
		<AltPage className="cam" brand={<><span className="cam-lens" />Camera</>}>
			<div className="cam-app">
				<div className="cam-top"><span>⚡ Auto</span><span>HDR</span><span>ISO {g?.metacritic || 100}</span><span>1/{g ? Math.max(1, Math.round(g.minutes / 60)) : 60}s</span><span>ƒ/1.8</span><button onClick={() => setInfo(!info)}>{info ? 'Hide info' : 'ⓘ Info'}</button></div>
				<section className="cam-vf" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setFocus({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}>
					{g && <Art g={g} kind="hero" key={g.appid} className="cam-img" />}
					<div className="cam-grid" />
					<div className="cam-focus" key={focus.x + ',' + focus.y} style={{ left: focus.x + '%', top: focus.y + '%' }} />
					{g && <div className="cam-label">{g.name}</div>}
					{info && g && <div className="cam-info" onClick={(e) => e.stopPropagation()}><b>{g.name}</b><p>{formatPlaytime(g.minutes)} exposure · {g.installed ? 'in memory' : 'not on card (install)'}</p><Actions g={g} className="cam-act" /></div>}
					{flash && <div className="cam-flash" />}
				</section>
				<div className="cam-strip">{b.games.slice(0, 50).map((x) => <button key={x.appid} data-appid={x.appid} className={g?.appid === x.appid ? 'on' : ''} onClick={() => select(x.appid)}><Art g={x} kind="capsule" /></button>)}</div>
				<div className="cam-modes">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name.toUpperCase()}</button>)}</div>
				<div className="cam-ctl">
					<button className="cam-roll" onClick={() => setInfo(true)}>{g && <Art g={g} kind="capsule" />}</button>
					<button className="cam-shutter" onClick={shoot} aria-label={g?.installed ? 'Play' : 'Install'}><i /></button>
					<span className="cam-hint">{g ? (g.installed ? 'Shutter = Play' : 'Shutter = Install') : ''}</span>
				</div>
			</div>
		</AltPage>
	);
}

export const cameraCss = tok('camera', { bg: '#000000', s1: '#161616', s2: '#222', s3: '#333', fg: '#FFFFFF', fg2: '#CCCCCC', fg3: '#888', acc: '#FFD60A', on: '#000', font: '"Segoe UI", system-ui, sans-serif' }) + `
.cam-brand { display: flex; gap: 8px; align-items: center; font: 600 17px var(--k-text); color: #fff; } .cam-lens { width: 20px; height: 20px; border-radius: 50%; background: radial-gradient(circle, #3A6EA5 25%, #111 30% 55%, #555 60%); }
.cam-app { position: absolute; inset: 0; display: grid; grid-template-rows: 40px minmax(0, 1fr) 74px 34px 100px; background: #000; color: #fff; }
.cam-top { display: flex; gap: 26px; justify-content: center; align-items: center; font: 600 13px var(--k-text); color: #FFD60A; } .cam-top button { color: #fff; font: 600 13px var(--k-text); }
.cam-vf { position: relative; overflow: hidden; margin: 0 12%; border-radius: 6px; cursor: crosshair; background: #111; } .cam-img { width: 100%; height: 100%; object-fit: cover; animation: cam-in .6s var(--k-out) both; } @keyframes cam-in { from { filter: blur(14px); transform: scale(1.06); } }
.cam-grid { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent 33%, rgba(255,255,255,.25) 33% calc(33% + 1px), transparent calc(33% + 1px) 66%, rgba(255,255,255,.25) 66% calc(66% + 1px), transparent calc(66% + 1px)), linear-gradient(transparent 33%, rgba(255,255,255,.25) 33% calc(33% + 1px), transparent calc(33% + 1px) 66%, rgba(255,255,255,.25) 66% calc(66% + 1px), transparent calc(66% + 1px)); }
.cam-focus { position: absolute; width: 80px; height: 80px; margin: -40px; border: 1.5px solid #FFD60A; pointer-events: none; animation: cam-f .5s var(--k-out) both; } @keyframes cam-f { from { transform: scale(1.5); opacity: 0; } 60% { transform: scale(.92); } }
.cam-label { position: absolute; left: 50%; top: 14px; transform: translateX(-50%); padding: 4px 12px; border-radius: 6px; background: rgba(0,0,0,.5); font: 600 13px var(--k-text); }
.cam-info { position: absolute; right: 14px; bottom: 14px; width: 300px; padding: 14px; border-radius: 14px; background: rgba(20,20,20,.85); backdrop-filter: blur(10px); cursor: default; } .cam-info p { margin: 4px 0 8px; color: #CCC; font: 13px var(--k-text); } .cam-act button { color: #fff !important; } .cam-act button:hover { background: #333 !important; }
.cam-flash { position: absolute; inset: 0; background: #fff; animation: k-fade .3s reverse both; }
.cam-strip { display: flex; gap: 6px; justify-content: safe center; align-items: center; overflow-x: auto; padding: 0 20px; } .cam-strip button { flex: none; width: 40px; height: 60px; border-radius: 6px; overflow: hidden; opacity: .6; transition: transform .2s, opacity .2s; } .cam-strip button.on { opacity: 1; transform: scale(1.15); box-shadow: 0 0 0 2px #FFD60A; } .cam-strip img, .cam-strip .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 5px; }
.cam-modes { display: flex; gap: 22px; justify-content: safe center; align-items: center; overflow-x: auto; padding: 0 20px; } .cam-modes button { flex: none; font: 600 13px var(--k-text); letter-spacing: .08em; color: #BBB; } .cam-modes button.on { color: #FFD60A; }
.cam-ctl { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 12%; }
.cam-roll { justify-self: start; width: 50px; height: 50px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 0 2px #fff; } .cam-roll img { width: 100%; height: 100%; object-fit: cover; }
.cam-shutter { width: 78px; height: 78px; border-radius: 50%; box-shadow: inset 0 0 0 4px #fff; display: grid; place-items: center; } .cam-shutter i { width: 62px; height: 62px; border-radius: 50%; background: #fff; transition: transform .15s; } .cam-shutter:active i { transform: scale(.85); }
.cam-hint { justify-self: end; font: 12px var(--k-text); color: #888; }
`;

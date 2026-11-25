// RADIO — a valve radio. Each band button is a collection, its games are stations along the glowing dial; drag the
// tuning knob (or click the dial) and the needle sweeps; between stations you get static, on one you get its name.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Radio() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const st = b.games.slice(0, 40);
	const [pos, setPos] = useState(0.02);
	const dial = useRef<HTMLDivElement>(null);
	const knob = useRef<{ x: number; p: number } | null>(null);
	const freq = (i: number) => (88 + (i / Math.max(1, st.length - 1)) * 20).toFixed(1);
	const at = (i: number) => 0.02 + (i / Math.max(1, st.length - 1)) * 0.96;
	const near = st.map((g, i) => ({ g, d: Math.abs(at(i) - pos) })).sort((x, y) => x.d - y.d)[0];
	const locked = near && near.d < 0.012 ? near.g : null;
	useEffect(() => { if (locked && locked.appid !== sel?.appid) select(locked.appid); }, [locked?.appid]);
	useEffect(() => { if (sel) { const i = st.findIndex((g) => g.appid === sel.appid); if (i >= 0 && Math.abs(at(i) - pos) > 0.012) setPos(at(i)); } }, [sel?.appid, st.length]);
	const fromDial = (cx: number) => { const r = dial.current!.getBoundingClientRect(); setPos(Math.max(0, Math.min(1, (cx - r.left) / r.width))); };
	const g = sel;
	return (
		<AltPage className="rad" brand={<>Kestrel <i>Wireless</i></>}>
			<div className="rad-app">
				<div className="rad-set">
					<div className="rad-grille"><div className="rad-badge">K</div></div>
					<div className="rad-panel">
						<div className="rad-dial" ref={dial} onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); fromDial(e.clientX); }} onPointerMove={(e) => e.buttons & 1 && fromDial(e.clientX)}>
							<div className="rad-scale">{Array.from({ length: 21 }, (_, i) => <span key={i} style={{ left: (i / 20) * 100 + '%' }}>{i % 4 === 0 ? 88 + i : ''}</span>)}</div>
							<div className="rad-stations">{st.map((x, i) => <button key={x.appid} data-appid={x.appid} className={locked?.appid === x.appid ? 'on' : ''} style={{ left: at(i) * 100 + '%' }} onClick={() => setPos(at(i))} title={x.name}><i /></button>)}</div>
							<div className="rad-needle" style={{ left: pos * 100 + '%' }} />
						</div>
						<div className="rad-readout">
							{g && (locked || sel) ? <div key={g.appid}><b>{freq(Math.max(0, st.findIndex((x) => x.appid === g.appid)))} MHz</b><h2>{g.name}</h2><p>{formatPlaytime(g.minutes)} on air · {g.lastPlayed ? 'last tuned ' + formatAgo(g.lastPlayed).toLowerCase() : 'never tuned in'}</p></div>
								: <div className="rad-static"><b>{(88 + pos * 20).toFixed(1)} MHz</b><h2>~ static ~</h2><p>Keep turning the dial.</p></div>}
							<div className={'rad-eye' + (locked ? ' on' : '')} />
						</div>
						<div className="rad-ctl">
							<div className="rad-bands">{b.islands.slice(0, 8).map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); setPos(0.02); }}>{i.name}</button>)}</div>
							<div className="rad-knob" style={{ transform: `rotate(${pos * 300 - 150}deg)` }} onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); knob.current = { x: e.clientX, p: pos }; }} onPointerMove={(e) => { if (knob.current && e.buttons & 1) setPos(Math.max(0, Math.min(1, knob.current.p + (e.clientX - knob.current.x) / 600))); }} onPointerUp={() => (knob.current = null)}><i /></div>
						</div>
					</div>
				</div>
				{g && <aside className="rad-card" key={g.appid}><Art g={g} kind="header" /><PlayBtn g={g} className="rad-go" label={['Switch on — Play', 'Install']} /><Actions g={g} className="rad-act" /></aside>}
				{!locked && !sel && <div className="rad-noise" />}
			</div>
		</AltPage>
	);
}

export const radioCss = tok('radio', { bg: '#3B2A1E', s1: '#4A3527', s2: '#5A4131', s3: '#6B4E3B', fg: '#F5E6C8', fg2: '#D8C29C', fg3: '#A28B68', acc: '#FFB347', on: '#2A1A0E', top: '#2A1D14', font: 'Georgia, "Times New Roman", serif' }) + `
.rad-brand { font: 700 19px Georgia, serif; color: #F5E6C8; letter-spacing: .06em; } .rad-brand i { font-weight: 400; color: #FFB347; }
.rad-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: center; padding: 30px; background: repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 3px, transparent 3px 14px), radial-gradient(70% 70% at 40% 40%, #5A4131, #2A1D14); }
.rad-set { justify-self: center; width: min(900px, 100%); padding: 26px; border-radius: 40px 40px 18px 18px; background: linear-gradient(170deg, #8A5A34, #5C3A20); box-shadow: 0 40px 60px -30px #000, inset 0 2px 0 rgba(255,220,170,.35), inset 0 -8px 20px rgba(0,0,0,.35); display: grid; gap: 18px; }
.rad-grille { position: relative; height: 170px; border-radius: 26px 26px 8px 8px; background: repeating-linear-gradient(90deg, #2E1F14 0 4px, #C9A777 4px 7px); box-shadow: inset 0 0 30px rgba(0,0,0,.7); }
.rad-badge { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFE1A8, #B07A2E); color: #3B2A1E; font: 700 30px Georgia, serif; box-shadow: 0 4px 10px rgba(0,0,0,.6); }
.rad-panel { display: grid; gap: 14px; padding: 18px; border-radius: 12px; background: #2A1D14; box-shadow: inset 0 2px 8px #000; }
.rad-dial { position: relative; height: 92px; border-radius: 8px; background: radial-gradient(120% 140% at 50% 120%, #FFD58A, #E8A84A 40%, #8A5A20); box-shadow: inset 0 0 20px rgba(0,0,0,.5), 0 0 30px rgba(255,180,70,.25); cursor: ew-resize; touch-action: none; overflow: hidden; }
.rad-scale span { position: absolute; top: 6px; height: 30px; border-left: 1px solid rgba(42,26,14,.6); padding-left: 3px; font: 700 12px Georgia, serif; color: #2A1A0E; }
.rad-stations button { position: absolute; bottom: 10px; width: 14px; height: 30px; margin-left: -7px; } .rad-stations i { display: block; width: 2px; height: 100%; margin: 0 auto; background: rgba(42,26,14,.55); } .rad-stations button.on i { background: #B3261E; width: 3px; }
.rad-needle { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1.5px; background: #B3261E; box-shadow: 0 0 6px rgba(179,38,30,.8); transition: left .08s; pointer-events: none; }
.rad-readout { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: center; min-height: 100px; padding: 0 10px; color: #FFD58A; text-shadow: 0 0 8px rgba(255,180,70,.6); }
.rad-readout b { font: 700 14px Consolas, monospace; letter-spacing: .1em; } .rad-readout h2 { margin: 4px 0; font: 700 30px Georgia, serif; } .rad-readout p { margin: 0; font: italic 15px Georgia, serif; color: #D8C29C; }
.rad-static h2 { animation: rad-jit .12s steps(2) infinite; opacity: .7; } @keyframes rad-jit { 50% { transform: translateX(2px); opacity: .4; } }
.rad-eye { width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(circle, #1E3A1E 30%, #0A140A); box-shadow: inset 0 0 6px #000; transition: background .4s; } .rad-eye.on { background: radial-gradient(circle, #9CFF9C 10%, #3DCB5D 45%, #0B3B12); box-shadow: 0 0 18px #3DCB5D; }
.rad-ctl { display: flex; gap: 20px; align-items: center; } .rad-bands { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; }
.rad-bands button { padding: 7px 12px; border-radius: 6px; background: linear-gradient(#F3E3C3, #C9B48A); box-shadow: 0 3px 0 #6B5233, inset 0 1px 0 #fff; font: 700 12px Georgia, serif; color: #2A1A0E; } .rad-bands button.on { transform: translateY(3px); box-shadow: 0 0 0 #6B5233, inset 0 2px 4px rgba(0,0,0,.4); background: #C9B48A; }
.rad-knob { width: 92px; height: 92px; flex: none; border-radius: 50%; background: repeating-conic-gradient(#3A2618 0 6deg, #5A3E28 6deg 12deg); box-shadow: 0 8px 14px rgba(0,0,0,.6), inset 0 0 0 10px #4A3220; cursor: grab; touch-action: none; position: relative; } .rad-knob i { position: absolute; left: 50%; top: 10px; width: 5px; height: 22px; margin-left: -2.5px; border-radius: 3px; background: #FFD58A; }
.rad-card { width: 340px; padding: 16px; border-radius: 16px; background: #F5E6C8; box-shadow: 0 20px 40px -20px #000; animation: k-rise .4s var(--k-out) both; } .rad-card img { width: 100%; border-radius: 8px; filter: sepia(.35); }
.rad-go { width: 100%; height: 46px; margin: 12px 0 8px; border-radius: 10px; background: #8A5A34 !important; color: #F5E6C8 !important; font: 700 15px Georgia, serif !important; } .rad-act button { color: #3B2A1E !important; } .rad-act button:hover { background: rgba(0,0,0,.07) !important; }
.rad-noise { position: absolute; inset: 0; pointer-events: none; opacity: .05; background: repeating-radial-gradient(circle at 17% 32%, #fff 0 1px, transparent 1px 3px); animation: rad-jit .1s steps(2) infinite; }
`;

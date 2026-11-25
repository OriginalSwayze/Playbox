// CUT — a video editor. The media bin holds a collection, the timeline strings its games end to end as clips (longer
// for more hours) on video and audio tracks, scrubbing the playhead picks the clip under it, the monitor shows it.
import { useRef, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const len = (g: Game) => 40 + Math.min(260, Math.sqrt(g.minutes) * 6);
const tc = (px: number) => { const s = Math.round(px / 4); return `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(Math.round(px) % 24).padStart(2, '0')}`; };

export function Cut() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [head, setHead] = useState(0);
	const tl = useRef<HTMLDivElement>(null);
	const clips = b.games.slice(0, 40);
	let x = 0;
	const laid = clips.map((g) => { const at = { g, x, w: len(g) }; x += at.w; return at; });
	const total = x;
	const scrub = (cx: number) => { const r = tl.current!.getBoundingClientRect(); const p = Math.max(0, cx - r.left + tl.current!.scrollLeft); setHead(p); const hit = laid.find((c) => p >= c.x && p < c.x + c.w); if (hit && hit.g.appid !== sel?.appid) select(hit.g.appid); };
	const cur = sel ?? clips[0] ?? null;
	const curAt = laid.find((c) => c.g.appid === cur?.appid);
	return (
		<AltPage className="vid" brand={<><span className="vid-logo">✂</span>Cut</>}>
			<div className="vid-app">
				<aside className="vid-bin">
					<div className="vid-ph">Media bin <input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Search" spellCheck={false} /></div>
					<select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
					<div className="vid-media">{b.games.slice(0, 120).map((g) => <button key={g.appid} data-appid={g.appid} className={cur?.appid === g.appid ? 'on' : ''} onClick={() => { select(g.appid); const c = laid.find((l) => l.g.appid === g.appid); if (c) setHead(c.x + 2); }}><Art g={g} kind="header" /><span>{g.name}</span><em>{formatPlaytime(g.minutes)}</em></button>)}</div>
				</aside>
				<section className="vid-mon">
					<div className="vid-ph">Program: {b.found ? 'Search' : b.isle?.name}</div>
					{cur && <div className="vid-screen" key={cur.appid}><Art g={cur} kind="hero" /><span className="vid-safe" /><span className="vid-tc">{tc(head)}</span></div>}
					<div className="vid-ctl"><button onClick={() => { const i = laid.findIndex((c) => c.g.appid === cur?.appid); const p = laid[i - 1]; if (p) { select(p.g.appid); setHead(p.x + 2); } }}>⏮</button>{cur && <PlayBtn g={cur} className="vid-play"><Icon name={cur.installed ? 'play' : 'install'} size={18} /></PlayBtn>}<button onClick={() => { const i = laid.findIndex((c) => c.g.appid === cur?.appid); const n = laid[i + 1]; if (n) { select(n.g.appid); setHead(n.x + 2); } }}>⏭</button></div>
				</section>
				<aside className="vid-props">
					<div className="vid-ph">Clip properties</div>
					{cur && <div key={cur.appid}><h3>{cur.name}</h3><dl><dt>Duration</dt><dd>{formatPlaytime(cur.minutes)}</dd><dt>In</dt><dd>{tc(curAt?.x ?? 0)}</dd><dt>Out</dt><dd>{tc((curAt?.x ?? 0) + (curAt?.w ?? 0))}</dd><dt>Created</dt><dd>{dateOf(cur.added)}</dd><dt>Source</dt><dd>{cur.installed ? 'Local disk' : 'Offline media'}</dd></dl><Actions g={cur} className="vid-act" /></div>}
				</aside>
				<section className="vid-tl">
					<div className="vid-heads"><span>V2</span><span>V1</span><span>A1</span><span>A2</span></div>
					<div className="vid-scroll" ref={tl} onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); scrub(e.clientX); }} onPointerMove={(e) => e.buttons & 1 && scrub(e.clientX)}>
						<div className="vid-inner" style={{ width: total + 200 }}>
							<div className="vid-ruler">{Array.from({ length: Math.ceil(total / 100) + 2 }, (_, i) => <span key={i} style={{ left: i * 100 }}>{tc(i * 100).slice(3, 8)}</span>)}</div>
							<div className="vid-row v2">{laid.filter((_, i) => i % 3 === 0).map((c) => <i key={c.g.appid} style={{ left: c.x, width: c.w * 0.5 }}>Title · {c.g.name}</i>)}</div>
							<div className="vid-row v1">{laid.map((c) => <button key={c.g.appid} data-appid={c.g.appid} className={cur?.appid === c.g.appid ? 'on' : ''} style={{ left: c.x, width: c.w }}><Art g={c.g} kind="header" /><span>{c.g.name}</span></button>)}</div>
							<div className="vid-row a1">{laid.map((c) => <i key={c.g.appid} style={{ left: c.x, width: c.w }} />)}</div>
							<div className="vid-row a2">{laid.filter((c) => c.g.minutes2w).map((c) => <i key={c.g.appid} style={{ left: c.x, width: c.w }} />)}</div>
							<div className="vid-head" style={{ left: head }}><b /></div>
						</div>
					</div>
				</section>
			</div>
		</AltPage>
	);
}

export const cutCss = tok('cut', { bg: '#1A1A1D', s1: '#232327', s2: '#2C2C31', s3: '#38383E', fg: '#E3E3E8', fg2: '#A9A9B3', fg3: '#6B6B75', acc: '#7C5CFF', on: '#fff', top: '#121214', font: '"Segoe UI", system-ui, sans-serif' }) + `
.vid-brand { display: flex; gap: 8px; align-items: center; font: 700 17px var(--k-text); color: #E3E3E8; } .vid-logo { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: #7C5CFF; color: #fff; font-size: 13px; }
.vid-app { position: absolute; inset: 0; display: grid; grid-template-columns: 300px minmax(0, 1fr) 280px; grid-template-rows: minmax(0, 1fr) 260px; gap: 2px; background: #0E0E10; font: 12px var(--k-text); color: #A9A9B3; }
.vid-ph { display: flex; gap: 8px; align-items: center; height: 30px; padding: 0 10px; background: #232327; border-bottom: 1px solid #0E0E10; font: 600 12px var(--k-text); color: #E3E3E8; } .vid-ph input { margin-left: auto; width: 120px; height: 22px; padding: 0 8px; border: 0; border-radius: 4px; background: #121214; color: #E3E3E8; font: 12px var(--k-text); outline: none; }
.vid-bin, .vid-mon, .vid-props { display: flex; flex-direction: column; min-height: 0; background: #1A1A1D; }
.vid-bin select { margin: 8px; height: 26px; background: #121214; color: #E3E3E8; border: 1px solid #38383E; border-radius: 4px; }
.vid-media { flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 8px 12px; align-content: start; } .vid-media button { display: grid; gap: 2px; text-align: left; padding: 4px; border-radius: 4px; } .vid-media button.on { background: #2C2C31; box-shadow: inset 0 0 0 1px #7C5CFF; }
.vid-media img, .vid-media .alt-noart { width: 100%; aspect-ratio: 460/215; object-fit: cover; border-radius: 3px; } .vid-media span { color: #E3E3E8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .vid-media em { font-style: normal; font-size: 11px; color: #6B6B75; }
.vid-screen { position: relative; flex: 1; min-height: 0; margin: 10px; background: #000; display: grid; place-items: center; overflow: hidden; } .vid-screen img { max-width: 100%; max-height: 100%; object-fit: contain; animation: k-fade .2s both; }
.vid-safe { position: absolute; inset: 10%; border: 1px dashed rgba(255,255,255,.15); pointer-events: none; } .vid-tc { position: absolute; right: 10px; bottom: 8px; font: 14px Consolas, monospace; color: #7CF0FF; text-shadow: 0 1px 2px #000; }
.vid-ctl { display: flex; gap: 10px; justify-content: center; padding: 0 0 10px; } .vid-ctl button { width: 38px; height: 32px; border-radius: 5px; background: #2C2C31; color: #E3E3E8; display: grid; place-items: center; } .vid-play { background: #7C5CFF !important; color: #fff !important; }
.vid-props > div:last-child { padding: 12px; overflow-y: auto; } .vid-props h3 { margin: 0 0 10px; font: 700 15px var(--k-text); color: #E3E3E8; } .vid-props dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 12px; } .vid-props dd { margin: 0; color: #E3E3E8; font-family: Consolas, monospace; }
.vid-tl { grid-column: 1 / -1; display: grid; grid-template-columns: 50px minmax(0, 1fr); background: #1A1A1D; }
.vid-heads { display: grid; grid-template-rows: 24px repeat(4, 1fr); background: #232327; } .vid-heads::before { content: ""; } .vid-heads span { display: grid; place-items: center; border-top: 1px solid #0E0E10; font: 700 11px var(--k-text); color: #E3E3E8; }
.vid-scroll { overflow-x: auto; overflow-y: hidden; cursor: col-resize; touch-action: none; } .vid-inner { position: relative; height: 100%; display: grid; grid-template-rows: 24px repeat(4, 1fr); }
.vid-ruler { position: relative; background: #232327; } .vid-ruler span { position: absolute; top: 0; height: 100%; padding: 4px; border-left: 1px solid #38383E; font: 10px Consolas, monospace; color: #6B6B75; }
.vid-row { position: relative; border-top: 1px solid #0E0E10; } .vid-row > * { position: absolute; top: 4px; bottom: 4px; border-radius: 4px; overflow: hidden; }
.vid-row.v2 i { background: #4A3A8C; color: #E3E3E8; font: 11px/1 var(--k-text); font-style: normal; padding: 6px; white-space: nowrap; }
.vid-row.v1 button { background: #2D5E8C; box-shadow: inset 0 0 0 1px #4C8FCF; text-align: left; } .vid-row.v1 button img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .55; } .vid-row.v1 button span { position: relative; padding: 4px 6px; color: #fff; font: 600 11px var(--k-text); white-space: nowrap; text-shadow: 0 1px 2px #000; }
.vid-row.v1 button.on { box-shadow: inset 0 0 0 2px #FFD43B; }
.vid-row.a1 i, .vid-row.a2 i { background: repeating-linear-gradient(90deg, #1F6B4A 0 2px, #2E9466 2px 3px); box-shadow: inset 0 0 0 1px #3FC487; } .vid-row.a2 i { background: repeating-linear-gradient(90deg, #6B4A1F 0 2px, #94702E 2px 3px); box-shadow: inset 0 0 0 1px #C4943F; }
.vid-head { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: #FF4D6A; pointer-events: none; } .vid-head b { position: absolute; top: 0; left: -6px; width: 14px; height: 14px; background: #FF4D6A; clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%); }
`;

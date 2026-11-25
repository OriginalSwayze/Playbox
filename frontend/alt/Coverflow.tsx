// COVERFLOW — covers stand in a 3D row with reflections, the centre one faces you. Arrows, the mouse wheel or the
// scrubber flip through; Enter (or a click on the centre cover) opens its card, Enter again plays.
import { useRef } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, cycle, facts, useCursor, useKeys, useStatus } from './lk';

export function Coverflow() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games;
	const c = useCursor(gs.length);
	const g = gs[c.i];
	const shown = sel ?? g;
	const status = useStatus(shown);
	const wheelAt = useRef(0);
	useKeys((k) => {
		if (k === 'left') { c.move(-1); if (sel) select(null); }
		else if (k === 'right') { c.move(1); if (sel) select(null); }
		else if (k === 'enter') { if (sel) gameCommands(sel)[0].run(); else if (g) select(g.appid); }
		else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); }
		else return false;
	});
	const onWheel = (e: React.WheelEvent) => { const now = Date.now(); if (now - wheelAt.current < 70) return; wheelAt.current = now; c.move(Math.sign(e.deltaY || e.deltaX)); };
	return (
		<AltPage className="pb-cf" brand={<>Coverflow</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-cf-app" onWheel={onWheel}>
				<Backdrop g={g} className="pb-cf-bd" />
				<Chips b={b} className="pb-cf-chips" onPick={() => c.to(0)} />
				<div className="pb-cf-flow">{gs.map((x, n) => {
					const d = n - c.i;
					if (Math.abs(d) > 7) return null;
					const s = Math.sign(d);
					const tx = d === 0 ? 0 : s * (200 + (Math.abs(d) - 1) * 74);
					return (
						<button key={x.appid} data-appid={x.appid} className={'pb-cf-cover' + (d === 0 ? ' on' : '')} style={{ transform: `translateX(calc(-50% + ${tx}px)) translateZ(${d === 0 ? 120 : 0}px) rotateY(${-s * 64}deg)`, zIndex: 50 - Math.abs(d) }} onClick={() => (d === 0 ? select(sel ? null : x.appid) : c.to(n))}>
							<Art g={x} kind="capsule" />
						</button>
					);
				})}</div>
				{shown && (
					<section className={'pb-cf-cap' + (sel ? ' open' : '')} key={shown.appid}>
						<h1>{shown.name}</h1>
						<p>{status} · {formatPlaytime(shown.minutes)} · {formatAgo(shown.lastPlayed)}</p>
						<div className="pb-cf-btns"><PlayBtn g={shown} className="pb-cf-play" label={['Play', 'Install']} /><button className="pb-cf-more" onClick={() => select(sel ? null : shown.appid)}>{sel ? 'Less' : 'Details'}</button></div>
						{sel && <div className="pb-cf-card"><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-cf-act" /></div>}
					</section>
				)}
				{gs.length > 1 && <label className="pb-cf-scrub"><span>{c.i + 1} / {gs.length}</span><input type="range" min={0} max={gs.length - 1} value={c.i} onChange={(e) => { c.to(+e.target.value); if (sel) select(null); }} /></label>}
				{!gs.length && <p className="lk-empty">No games match.</p>}
			</div>
		</AltPage>
	);
}

export const coverflowCss = tok('coverflow', { bg: '#000000', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.78)', fg3: 'rgba(255,255,255,.5)', acc: '#FFFFFF', on: '#000', top: '#000', font: '"Segoe UI Variable Text", "Segoe UI", sans-serif' }) + `
.pb-cf-brand { font: 600 18px var(--k-text); color: #fff; letter-spacing: -.01em; }
.pb-cf-app { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(80% 60% at 50% 40%, #1a1d24, #000 70%); color: #fff; }
.pb-cf-bd { opacity: .16; } .pb-cf-bd img { filter: saturate(1.3); }
.pb-cf-chips { position: absolute; top: 18px; left: 0; right: 0; justify-content: center; z-index: 60; padding: 0 30px; }
.pb-cf-flow { position: absolute; left: 50%; top: 11%; width: 0; height: 56%; perspective: 1100px; transform-style: preserve-3d; }
.pb-cf-cover { position: absolute; left: 0; top: 0; width: 250px; aspect-ratio: 2 / 3; max-height: 100%; transition: transform .45s var(--k-out); -webkit-box-reflect: below 3px linear-gradient(transparent 72%, rgba(255,255,255,.22)); }
.pb-cf-cover img, .pb-cf-cover .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 3px; box-shadow: 0 10px 40px rgba(0,0,0,.6); } .pb-cf-cover:not(.on) img { filter: brightness(.7); }
.pb-cf-cover.on { cursor: pointer; } .pb-cf-cover.on img { box-shadow: 0 20px 60px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.2); }
.pb-cf-cap { position: absolute; left: 50%; bottom: 13%; transform: translateX(-50%); z-index: 60; width: min(720px, 90%); text-align: center; animation: k-fade .35s both; }
.pb-cf-cap h1 { margin: 0; font: 600 30px var(--k-text); letter-spacing: -.01em; } .pb-cf-cap p { margin: 6px 0 16px; font: 15px var(--k-text); color: rgba(255,255,255,.65); }
.pb-cf-btns { display: flex; gap: 10px; justify-content: center; } .pb-cf-play { height: 40px; padding: 0 30px; border-radius: 99px; background: #fff !important; color: #000 !important; font: 600 15px var(--k-text) !important; } .pb-cf-more { height: 40px; padding: 0 22px; border-radius: 99px; background: rgba(255,255,255,.14); color: #fff; font: 600 15px var(--k-text); } .pb-cf-more:hover { background: rgba(255,255,255,.22); }
.pb-cf-cap.open { bottom: 6%; } .pb-cf-card { display: grid; grid-template-columns: 1fr 220px; gap: 20px; margin-top: 18px; padding: 18px 20px; border-radius: 14px; background: rgba(30,32,38,.92); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); text-align: left; animation: k-rise .3s var(--k-out) both; }
.pb-cf-card dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 18px; margin: 0; } .pb-cf-card dt { font: 12px var(--k-text); color: rgba(255,255,255,.5); } .pb-cf-card dd { margin: 2px 0 0; font: 600 14px var(--k-text); }
.pb-cf-act button { color: #ddd !important; } .pb-cf-act button:hover { background: rgba(255,255,255,.1) !important; }
.pb-cf-scrub { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 60; display: flex; align-items: center; gap: 14px; width: min(520px, 70%); font: 600 12px var(--k-text); color: rgba(255,255,255,.5); } .pb-cf-scrub input { flex: 1; accent-color: #fff; }
.pb-cf-cap.open ~ .pb-cf-scrub { display: none; }
`;

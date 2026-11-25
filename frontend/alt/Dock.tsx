// DOCK — a desktop whose wallpaper is the focused game's key art, with a magnifying dock of covers along the bottom
// and a floating info window. Point along the dock to magnify, click to focus, click again (or Enter) to play.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Logo, cycle, facts, hhmm, useClock, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Dock() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const running = useKestrel((s) => s.running);
	const gs = b.games.slice(0, 40);
	const c = useCursor(gs.length);
	const [mx, setMx] = useState<number | null>(null);
	const dock = useRef<HTMLDivElement>(null);
	const clock = useClock();
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeepInView(dock, '.on', c.i, c.keyMoved, 'center');
	useKeys((k) => {
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'enter' && g) gameCommands(g)[0].run();
		else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
	});
	const scale = (el: number) => (mx === null ? 1 : 1 + 0.9 * Math.max(0, 1 - Math.abs(mx - el) / 150));
	const [rects, setRects] = useState<number[]>([]);
	const measure = () => setRects([...(dock.current?.querySelectorAll<HTMLElement>('.pb-dock-ic') ?? [])].map((e) => e.offsetLeft + e.offsetWidth / 2 - (dock.current?.scrollLeft ?? 0)));
	return (
		<AltPage className="pb-dock" brand={<>❖ Desk</>}>
			<div className="pb-dock-app">
				<Backdrop g={g} className="pb-dock-bd" />
				<div className="pb-dock-menubar"><b>{g?.name ?? 'Desk'}</b><span>{b.isle?.name}</span><span className="pb-dock-sp" /><span>{running.length ? `▶ ${running.length} running` : ''}</span><span>{clock.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}  {hhmm(clock)}</span></div>
				<aside className="pb-dock-folders">{b.islands.map((i) => <button key={i.id} className={i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); }}><Icon name="library" size={30} /><span>{i.name}</span></button>)}</aside>
				{g && (
					<section className={'pb-dock-win' + (sel ? ' big' : '')} key={g.appid}>
						<header><i className="r" onClick={() => select(null)} /><i className="y" onClick={() => select(null)} /><i className="g" onClick={() => select(sel ? null : g.appid)} /><span>{g.name}</span></header>
						<div className="pb-dock-wbody">
							<Logo g={g} className="pb-dock-logo" />
							<p>{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
							<div className="pb-dock-btns"><PlayBtn g={g} className="pb-dock-play"><Icon name={g.installed ? 'play' : 'install'} size={16} /></PlayBtn><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'Less' : 'Get info'}</button></div>
							{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-dock-act" /></>}
						</div>
					</section>
				)}
				<div className="pb-dock-shelf" onMouseEnter={measure} onMouseMove={(e) => { const r = dock.current?.getBoundingClientRect(); if (r) setMx(e.clientX - r.left); }} onMouseLeave={() => setMx(null)}>
					<div className="pb-dock-bar" ref={dock}>{gs.map((x, n) => {
						const s = scale(rects[n] ?? -999);
						return (
							<button key={x.appid} data-appid={x.appid} className={'pb-dock-ic' + (n === c.i ? ' on' : '')} style={{ width: 58 * s, height: 58 * s }} title={x.name} onClick={() => (n === c.i && !sel ? gameCommands(x)[0].run() : (c.to(n), sel && select(null)))}>
								<Art g={x} kind="capsule" />{running.includes(x.appid) && <i className="pb-dock-dot" />}
								{mx !== null && s > 1.6 && <em>{x.name}</em>}
							</button>
						);
					})}</div>
				</div>
			</div>
		</AltPage>
	);
}

export const dockCss = tok('dock', { bg: '#1A1530', s1: 'rgba(255,255,255,.14)', s2: 'rgba(255,255,255,.22)', s3: 'rgba(255,255,255,.3)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.85)', fg3: 'rgba(255,255,255,.6)', acc: '#7C9CFF', on: '#fff', top: 'rgba(20,16,36,.75)', font: '"Segoe UI Variable Text", "Segoe UI", sans-serif' }) + `
.pb-dock-brand { font: 600 15px var(--k-text); color: #fff; }
.pb-dock-app { position: absolute; inset: 0; overflow: hidden; color: #fff; background: linear-gradient(135deg, #2B1F5C, #1A1530 50%, #0E2A4A); }
.pb-dock-bd img { animation: k-fade .8s both; } .pb-dock-bd::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.45), transparent 35%); }
.pb-dock-menubar { position: relative; z-index: 2; display: flex; gap: 18px; align-items: center; height: 28px; padding: 0 16px; background: rgba(20,18,30,.55); font: 500 13px var(--k-text); } .pb-dock-menubar b { font-weight: 700; } .pb-dock-sp { flex: 1; }
.pb-dock-folders { position: absolute; right: 22px; top: 46px; z-index: 2; display: grid; gap: 8px; justify-items: center; max-height: calc(100% - 170px); overflow-y: auto; scrollbar-width: none; }
.pb-dock-folders button { display: grid; justify-items: center; gap: 4px; width: 96px; padding: 6px 4px; border-radius: 8px; color: #8FB4FF; } .pb-dock-folders span { font: 600 12px var(--k-text); color: #fff; text-shadow: 0 1px 4px #000; text-align: center; line-height: 1.2; }
.pb-dock-folders button:hover { background: rgba(255,255,255,.12); } .pb-dock-folders button.on { background: rgba(124,156,255,.35); box-shadow: inset 0 0 0 1px rgba(255,255,255,.3); }
.pb-dock-win { position: absolute; left: 48px; top: 60px; z-index: 2; width: 440px; border-radius: 14px; overflow: hidden; background: rgba(28,26,40,.86); box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 30px 70px rgba(0,0,0,.55); animation: pb-dock-open .3s var(--k-out) both; } .pb-dock-win.big { width: 560px; }
@keyframes pb-dock-open { from { transform: scale(.94); opacity: 0; } }
.pb-dock-win header { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px; background: rgba(255,255,255,.05); font: 600 12.5px var(--k-text); color: rgba(255,255,255,.7); } .pb-dock-win header span { flex: 1; text-align: center; margin-right: 50px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-dock-win header i { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; } .pb-dock-win i.r { background: #F38BA8; } .pb-dock-win i.y { background: #B4A7FF; } .pb-dock-win i.g { background: #7FE3C4; }
.pb-dock-wbody { padding: 20px 22px 22px; } .pb-dock-logo { display: block; height: 90px; } .pb-dock-logo img { height: 100%; } .pb-dock-logo.lk-logotext { height: auto; font-size: 28px; }
.pb-dock-wbody > p { margin: 12px 0 16px; font: 13.5px var(--k-text); color: rgba(255,255,255,.7); }
.pb-dock-btns { display: flex; gap: 8px; } .pb-dock-play { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 8px; background: #7C9CFF !important; color: #fff !important; font: 600 14px var(--k-text) !important; } .pb-dock-btns > button:last-child { height: 34px; padding: 0 16px; border-radius: 8px; background: rgba(255,255,255,.12); font: 600 14px var(--k-text); color: #fff; }
.pb-dock-wbody dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 18px 0 12px; } .pb-dock-wbody dt { font: 12px var(--k-text); color: rgba(255,255,255,.5); } .pb-dock-wbody dd { margin: 2px 0 0; font: 600 13.5px var(--k-text); }
.pb-dock-act button { color: rgba(255,255,255,.85) !important; } .pb-dock-act button:hover { background: rgba(255,255,255,.1) !important; }
.pb-dock-shelf { position: absolute; left: 50%; bottom: 10px; z-index: 3; max-width: calc(100% - 40px); transform: translateX(-50%); }
.pb-dock-bar { display: flex; align-items: flex-end; gap: 8px; height: 140px; padding: 0 14px 10px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; } .pb-dock-bar::-webkit-scrollbar { display: none; }
.pb-dock-shelf::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 80px; border-radius: 22px; background: rgba(40,36,60,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18), 0 10px 40px rgba(0,0,0,.4); }
.pb-dock-ic { position: relative; flex: none; transition: width .12s, height .12s; } .pb-dock-ic img, .pb-dock-ic .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 22%; box-shadow: 0 4px 12px rgba(0,0,0,.4); font-size: 5px; }
.pb-dock-ic.on::after { content: ""; position: absolute; left: 50%; bottom: -7px; width: 5px; height: 5px; margin-left: -2px; border-radius: 50%; background: #fff; }
.pb-dock-dot { position: absolute; right: -2px; top: -2px; width: 12px; height: 12px; border-radius: 50%; background: #28C941; box-shadow: 0 0 0 2px #1A1530; }
.pb-dock-ic em { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); padding: 4px 10px; border-radius: 6px; background: rgba(28,26,40,.92); font: 600 12px var(--k-text); font-style: normal; white-space: nowrap; pointer-events: none; }
`;

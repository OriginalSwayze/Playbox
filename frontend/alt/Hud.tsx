// HUD — a sci-fi tactical heads-up display. A compass tape of collections across the top, the focused game locked in
// a targeting reticle, a target-info readout on the left and a contacts list on the right (range = hours played).
// Up/down cycle contacts, left/right (or the bumpers) swing the compass, Enter engages.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { cycle, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Hud() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 150);
	const c = useCursor(gs.length);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const [lock, setLock] = useState(0);
	useEffect(() => { setLock(0); const t = setTimeout(() => setLock(1), 450); return () => clearTimeout(t); }, [g?.appid]);
	const bi = Math.max(0, b.islands.findIndex((i) => i.id === b.cur));
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); }
		else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-hud" brand={<>◬ HUD-7</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }} searchPlaceholder="SCAN">
			<div className="pb-hud-app">
				<div className="pb-hud-tape"><div style={{ transform: `translateX(calc(50% - ${bi * 180 + 90}px))` }}>{b.islands.map((i, n) => (
					<button key={i.id} className={n === bi && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); c.to(0); }}><small>{String((n * 30) % 360).padStart(3, '0')}</small>{i.name}</button>
				))}</div><i className="pb-hud-pointer">▼</i></div>
				<aside className="pb-hud-info">
					<h4>TARGET INFO</h4>
					{g && <>
						<p className="pb-hud-name">{g.name}</p>
						<dl>
							<div><dt>STATUS</dt><dd className={/Ready|Running/.test(status) ? 'ok' : 'warn'}>{status.toUpperCase()}</dd></div>
							<div><dt>EXPOSURE</dt><dd>{formatPlaytime(g.minutes)}</dd></div>
							<div><dt>LAST CONTACT</dt><dd>{formatAgo(g.lastPlayed).toUpperCase()}</dd></div>
							<div><dt>2W ACTIVITY</dt><dd>{g.minutes2w ? formatPlaytime(g.minutes2w) : 'NONE'}</dd></div>
							<div><dt>MASS</dt><dd>{g.installed ? formatBytes(g.sizeOnDisk) || '—' : 'NOT DEPLOYED'}</dd></div>
							<div><dt>THREAT</dt><dd>{g.metacritic ? g.metacritic + ' / 100' : 'UNKNOWN'}</dd></div>
							<div><dt>ID</dt><dd>{g.appid}</dd></div>
						</dl>
						{sel && <Actions g={sel} className="pb-hud-act" />}
					</>}
				</aside>
				<section className="pb-hud-center">
					{g && <div className={'pb-hud-ret' + (lock ? ' locked' : '')} key={g.appid}>
						<Art g={g} kind="capsule" className="pb-hud-art" />
						<i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
						<svg viewBox="0 0 100 100" className="pb-hud-svg"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="40" className="d" /><path d="M50 0 v8 M50 92 v8 M0 50 h8 M92 50 h8" /></svg>
						<span className="pb-hud-tag">{lock ? 'LOCKED' : 'ACQUIRING…'}</span>
					</div>}
					{g && <div className="pb-hud-cmd"><PlayBtn g={g} className="pb-hud-go" label={['[ ENGAGE ]', '[ DEPLOY ]']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? '[ CLOSE ]' : '[ INTEL ]'}</button></div>}
				</section>
				<aside className="pb-hud-list" ref={list}>
					<h4>CONTACTS <small>{gs.length}</small></h4>
					{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); if (sel) select(null); }} onDoubleClick={() => gameCommands(x)[0].run()}>
							<i className={x.installed ? 'ok' : ''} /><span>{x.name}</span><em>{x.minutes ? Math.round(x.minutes / 60) + 'h' : '--'}</em>
						</button>
					))}
				</aside>
				<p className="pb-hud-foot">▲▼ CYCLE CONTACTS · ◀▶ BEARING · ⏎ ENGAGE · TAB INTEL</p>
			</div>
		</AltPage>
	);
}

export const hudCss = tok('hud', { bg: '#020806', s1: 'rgba(80,255,170,.07)', s2: 'rgba(80,255,170,.14)', s3: 'rgba(80,255,170,.22)', fg: '#B8FFD9', fg2: '#7FD8AA', fg3: '#3F8A66', acc: '#50FFAA', on: '#02110A', top: '#020806', line: 'rgba(80,255,170,.2)', font: '"Consolas", "Cascadia Mono", monospace' }) + `
html.kestrel[data-ui="hud"] .alt-search { border-radius: 0; box-shadow: inset 0 0 0 1px rgba(80,255,170,.4); background: transparent; }
.pb-hud-brand { font: 700 15px var(--k-text); letter-spacing: .2em; color: #50FFAA; text-shadow: 0 0 8px rgba(80,255,170,.6); }
.pb-hud-app { position: absolute; inset: 0; display: grid; grid-template-columns: 300px minmax(0, 1fr) 320px; grid-template-rows: 64px minmax(0, 1fr) 34px; background: radial-gradient(circle at 50% 50%, #062014, #020806 70%); color: #B8FFD9; font-family: var(--k-text); text-shadow: 0 0 6px rgba(80,255,170,.35); }
.pb-hud-app::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(80,255,170,.03) 0 1px, transparent 1px 4px); }
.pb-hud-tape { grid-column: 1 / -1; position: relative; overflow: hidden; border-bottom: 1px solid rgba(80,255,170,.25); mask: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent); -webkit-mask: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent); }
.pb-hud-tape > div { display: flex; height: 100%; transition: transform .45s var(--k-out); } .pb-hud-tape button { flex: none; display: grid; align-content: center; justify-items: center; gap: 2px; width: 180px; font: 13px var(--k-text); color: #3F8A66; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; overflow: hidden; border-left: 1px solid rgba(80,255,170,.12); }
.pb-hud-tape small { font-size: 10px; } .pb-hud-tape button.on { color: #50FFAA; } .pb-hud-pointer { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); font: 10px var(--k-text); font-style: normal; color: #50FFAA; }
.pb-hud-info, .pb-hud-list { min-height: 0; padding: 18px 20px; overflow-y: auto; scrollbar-width: none; } .pb-hud-info { border-right: 1px solid rgba(80,255,170,.15); } .pb-hud-list { border-left: 1px solid rgba(80,255,170,.15); padding: 18px 10px; }
.pb-hud-app h4 { margin: 0 0 14px; font: 700 12px var(--k-text); letter-spacing: .3em; color: #50FFAA; } .pb-hud-list h4 { padding: 0 10px; } .pb-hud-app h4 small { color: #3F8A66; }
.pb-hud-name { margin: 0 0 16px; font: 700 20px/1.2 var(--k-text); text-transform: uppercase; color: #E6FFF2; animation: pb-hud-type .5s steps(20) both; } @keyframes pb-hud-type { from { clip-path: inset(0 100% 0 0); } }
.pb-hud-info dl { margin: 0; } .pb-hud-info dl div { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-bottom: 1px dashed rgba(80,255,170,.15); font-size: 12.5px; } .pb-hud-info dt { color: #3F8A66; letter-spacing: .1em; } .pb-hud-info dd { margin: 0; text-align: right; } .pb-hud-info dd.ok { color: #50FFAA; } .pb-hud-info dd.warn { color: #FFC94D; }
.pb-hud-act { margin-top: 16px; } .pb-hud-act button { font-family: var(--k-text) !important; color: #7FD8AA !important; border-radius: 0 !important; } .pb-hud-act button:hover { background: rgba(80,255,170,.1) !important; }
.pb-hud-center { position: relative; display: grid; place-items: center; align-content: center; gap: 26px; min-height: 0; }
.pb-hud-ret { position: relative; height: min(56vh, 460px); aspect-ratio: 2/3; transition: transform .45s var(--k-out); transform: scale(1.08); } .pb-hud-ret.locked { transform: none; }
.pb-hud-art { width: 100%; height: 100%; object-fit: cover; filter: sepia(1) hue-rotate(90deg) saturate(2.2) brightness(.8) contrast(1.1); opacity: .85; mix-blend-mode: screen; transition: filter .45s; } .pb-hud-ret.locked .pb-hud-art { filter: sepia(.6) hue-rotate(90deg) saturate(1.4) brightness(.95); }
.pb-hud-ret .c { position: absolute; width: 30px; height: 30px; border: 2px solid #50FFAA; transition: all .45s var(--k-out); } .pb-hud-ret .tl { left: -20px; top: -20px; border-right: 0; border-bottom: 0; } .pb-hud-ret .tr { right: -20px; top: -20px; border-left: 0; border-bottom: 0; } .pb-hud-ret .bl { left: -20px; bottom: -20px; border-right: 0; border-top: 0; } .pb-hud-ret .br { right: -20px; bottom: -20px; border-left: 0; border-top: 0; }
.pb-hud-ret.locked .tl { left: -10px; top: -10px; } .pb-hud-ret.locked .tr { right: -10px; top: -10px; } .pb-hud-ret.locked .bl { left: -10px; bottom: -10px; } .pb-hud-ret.locked .br { right: -10px; bottom: -10px; } .pb-hud-ret.locked .c { border-color: #FF5A4D; }
.pb-hud-svg { position: absolute; left: 50%; top: 50%; width: 170%; transform: translate(-50%, -50%); pointer-events: none; fill: none; stroke: rgba(80,255,170,.35); stroke-width: .3; animation: pb-hud-spin 30s linear infinite; } .pb-hud-svg .d { stroke-dasharray: 2 3; } @keyframes pb-hud-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.pb-hud-tag { position: absolute; left: 50%; bottom: -44px; transform: translateX(-50%); font: 700 12px var(--k-text); letter-spacing: .3em; color: #FFC94D; } .pb-hud-ret.locked .pb-hud-tag { color: #FF5A4D; animation: pb-hud-blink 1s steps(2) infinite; }
@keyframes pb-hud-blink { 50% { opacity: .4; } }
.pb-hud-cmd { position: relative; display: flex; gap: 16px; margin-top: 24px; } .pb-hud-go, .pb-hud-cmd > button:last-child { height: 40px; padding: 0 20px; font: 700 14px var(--k-text) !important; letter-spacing: .2em; color: #50FFAA !important; background: rgba(80,255,170,.08) !important; box-shadow: inset 0 0 0 1px #50FFAA; }
.pb-hud-go:hover, .pb-hud-cmd > button:last-child:hover { background: #50FFAA !important; color: #02110A !important; text-shadow: none; }
.pb-hud-list button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 10px; font: 12.5px var(--k-text); color: #7FD8AA; text-align: left; } .pb-hud-list button:hover { background: rgba(80,255,170,.06); }
.pb-hud-list button i { flex: none; width: 7px; height: 7px; border: 1px solid #3F8A66; transform: rotate(45deg); } .pb-hud-list button i.ok { background: #50FFAA; border-color: #50FFAA; }
.pb-hud-list button span { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; } .pb-hud-list button em { font-style: normal; color: #3F8A66; }
.pb-hud-list button.on { background: rgba(80,255,170,.14); color: #E6FFF2; box-shadow: inset 2px 0 0 #50FFAA; } .pb-hud-list button.on::before { content: "▶"; font-size: 9px; color: #50FFAA; margin-right: -4px; }
.pb-hud-foot { grid-column: 1 / -1; margin: 0; display: grid; place-items: center; font: 11px var(--k-text); letter-spacing: .25em; color: #3F8A66; border-top: 1px solid rgba(80,255,170,.15); }
`;

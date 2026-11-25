// PITLANE — a racing game's garage. The selected game is the car on the turntable under speed lines, a rev counter
// shows its hours, the spec sheet sits beside it and the grid of cars runs along the bottom. Championships are your
// collections. Left/right change car, Enter races.
import { useRef } from 'react';
import { formatAgo, formatBytes, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, cycle, useCursor, useKeepInView, useKeys, useStatus } from './lk';

function Gauge({ v, label }: { v: number; label: string }) {
	const a = -120 + Math.min(1, v) * 240;
	const arc = (from: number, to: number) => { const p = (d: number) => [50 + 40 * Math.sin((d * Math.PI) / 180), 50 - 40 * Math.cos((d * Math.PI) / 180)]; const [x1, y1] = p(from), [x2, y2] = p(to); return `M${x1} ${y1} A40 40 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
	return (
		<svg viewBox="0 0 100 86" className="pb-pit-gauge">
			<path d={arc(-120, 120)} className="t" /><path d={arc(-120, Math.max(-119, a))} className="v" /><path d={arc(72, 120)} className="red" />
			{Array.from({ length: 9 }, (_, i) => { const d = -120 + i * 30; const r = (d * Math.PI) / 180; return <text key={i} x={50 + 31 * Math.sin(r)} y={53 - 31 * Math.cos(r)}>{i}</text>; })}
			<line x1="50" y1="50" x2={50 + 36 * Math.sin((a * Math.PI) / 180)} y2={50 - 36 * Math.cos((a * Math.PI) / 180)} className="n" /><circle cx="50" cy="50" r="4" />
			<text x="50" y="72" className="lab">{label}</text><text x="50" y="82" className="u">HOURS</text>
		</svg>
	);
}

export function Pitlane() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 100);
	const c = useCursor(gs.length);
	const rail = useRef<HTMLDivElement>(null);
	useKeepInView(rail, '.on', c.i, c.keyMoved, 'center');
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'left') { c.move(-1); select(null); } else if (k === 'right') { c.move(1); select(null); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev' || k === 'up' || k === 'down') { cycle(b, k === 'next' || k === 'down' ? 1 : -1); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-pit" brand={<>PIT<b>LANE</b></>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-pit-app">
				<nav className="pb-pit-champ">{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}>{i.name}</button>)}</nav>
				{g && (
					<section className="pb-pit-garage" key={g.appid}>
						<div className="pb-pit-car"><Backdrop g={g} className="pb-pit-bd" /><i className="pb-pit-lines" /><span className="pb-pit-num">{String(c.i + 1).padStart(2, '0')}</span></div>
						<div className="pb-pit-sheet">
							<p className="pb-pit-class">{g.minutes >= 6000 ? 'HYPERCAR' : g.minutes >= 1200 ? 'GT1' : g.minutes >= 300 ? 'GT3' : g.minutes > 0 ? 'TOURING' : 'ROOKIE'} · {status.toUpperCase()}</p>
							<h1>{g.name}</h1>
							<div className="pb-pit-row"><Gauge v={g.minutes / 48000} label={String(Math.round(g.minutes / 60))} />
								<dl><div><dt>LAP TIME</dt><dd>{formatPlaytime(g.minutes)}</dd></div><div><dt>LAST RACE</dt><dd>{formatAgo(g.lastPlayed)}</dd></div><div><dt>THIS FORTNIGHT</dt><dd>{g.minutes2w ? formatPlaytime(g.minutes2w) : '—'}</dd></div><div><dt>WEIGHT</dt><dd>{g.installed ? formatBytes(g.sizeOnDisk) || '—' : 'IN TRANSIT'}</dd></div></dl></div>
							<div className="pb-pit-btns"><PlayBtn g={g} className="pb-pit-race" label={['RACE ▸', 'SHIP TO GARAGE']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'CLOSE' : 'TUNE'}</button></div>
							{sel && <Actions g={sel} className="pb-pit-act" />}
						</div>
					</section>
				)}
				<div className="pb-pit-grid" ref={rail}>{gs.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); select(null); }}><Art g={x} kind="header" /><span><b>{String(n + 1).padStart(2, '0')}</b>{x.name}</span></button>
				))}</div>
			</div>
		</AltPage>
	);
}

const it = '"Bahnschrift", "Arial Black", sans-serif';
export const pitlaneCss = tok('pitlane', { bg: '#0B0B0D', s1: '#18181C', s2: '#222228', s3: '#2E2E36', fg: '#FFFFFF', fg2: '#C8C8D0', fg3: '#7A7A86', acc: '#E10600', on: '#fff', top: '#0B0B0D', font: it }) + `
.pb-pit-brand { font: italic 900 22px ${it}; letter-spacing: .02em; color: #fff; } .pb-pit-brand b { color: #E10600; }
.pb-pit-app { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) 150px; overflow: hidden; background: linear-gradient(115deg, #0B0B0D 55%, #1A0404); color: #fff; }
.pb-pit-champ { display: flex; gap: 4px; padding: 12px 30px 0; overflow-x: auto; scrollbar-width: none; } .pb-pit-champ button { flex: none; height: 34px; padding: 0 18px; font: italic 700 14px ${it}; text-transform: uppercase; color: #7A7A86; transform: skewX(-14deg); background: #18181C; }
.pb-pit-champ button:hover { color: #fff; } .pb-pit-champ button.on { background: #E10600; color: #fff; }
.pb-pit-garage { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(340px, 1fr); gap: 30px; align-items: center; padding: 18px 30px; min-height: 0; }
.pb-pit-car { position: relative; height: 100%; max-height: 520px; overflow: hidden; transform: skewX(-8deg); box-shadow: 14px 14px 0 #E10600; animation: pb-pit-in .55s var(--k-out) both; } @keyframes pb-pit-in { from { transform: skewX(-8deg) translateX(-80px); opacity: 0; } }
.pb-pit-bd img { transform: skewX(8deg) scale(1.15); } .pb-pit-lines { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0 60px, rgba(255,255,255,.06) 60px 62px); animation: pb-pit-speed .5s linear infinite; mix-blend-mode: screen; } @keyframes pb-pit-speed { to { background-position: -62px 0; } }
.pb-pit-car::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(11,11,13,.8), transparent 40%); } .pb-pit-num { position: absolute; right: 20px; bottom: 6px; z-index: 1; font: italic 900 90px/1 ${it}; color: rgba(255,255,255,.9); -webkit-text-stroke: 2px #E10600; }
.pb-pit-sheet { animation: k-rise .5s var(--k-out) both; } .pb-pit-class { margin: 0 0 6px; font: italic 700 13px ${it}; letter-spacing: .2em; color: #E10600; }
.pb-pit-sheet h1 { margin: 0 0 14px; font: italic 900 clamp(28px, 3vw, 46px)/1 ${it}; text-transform: uppercase; }
.pb-pit-row { display: grid; grid-template-columns: 170px 1fr; gap: 20px; align-items: center; margin-bottom: 20px; }
.pb-pit-gauge { width: 170px; } .pb-pit-gauge .t { fill: none; stroke: #222228; stroke-width: 7; } .pb-pit-gauge .v { fill: none; stroke: #fff; stroke-width: 7; transition: d .6s; } .pb-pit-gauge .red { fill: none; stroke: #E10600; stroke-width: 3; transform: translate(0, 0); }
.pb-pit-gauge text { font: italic 700 6px ${it}; fill: #7A7A86; text-anchor: middle; } .pb-pit-gauge .lab { font-size: 13px; fill: #fff; } .pb-pit-gauge .u { font-size: 4.5px; letter-spacing: .2em; } .pb-pit-gauge .n { stroke: #E10600; stroke-width: 2; stroke-linecap: round; } .pb-pit-gauge circle { fill: #E10600; }
.pb-pit-sheet dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0; } .pb-pit-sheet dt { font: italic 700 10.5px ${it}; letter-spacing: .18em; color: #7A7A86; } .pb-pit-sheet dd { margin: 2px 0 0; font: italic 700 18px ${it}; }
.pb-pit-btns { display: flex; gap: 12px; } .pb-pit-race { flex: 1; height: 56px; transform: skewX(-14deg); background: #E10600 !important; color: #fff !important; font: italic 900 22px ${it} !important; letter-spacing: .08em; box-shadow: 6px 6px 0 #fff; } .pb-pit-race:hover { background: #FF2418 !important; }
.pb-pit-btns > button:last-child { padding: 0 24px; transform: skewX(-14deg); background: #222228; font: italic 700 15px ${it}; letter-spacing: .1em; color: #fff; }
.pb-pit-act { margin-top: 14px; } .pb-pit-act button { font-family: ${it} !important; font-style: italic; text-transform: uppercase; }
.pb-pit-grid { display: flex; gap: 14px; align-items: center; padding: 10px 40px 20px; overflow-x: auto; scrollbar-width: none; background: linear-gradient(transparent, rgba(225,6,0,.08)); } .pb-pit-grid::-webkit-scrollbar { display: none; }
.pb-pit-grid button { position: relative; flex: none; width: 190px; transform: skewX(-10deg); overflow: hidden; background: #18181C; transition: transform .2s, box-shadow .2s; } .pb-pit-grid img, .pb-pit-grid .alt-noart { display: block; width: 100%; aspect-ratio: 460/215; object-fit: cover; }
.pb-pit-grid span { display: flex; gap: 8px; padding: 6px 10px; font: italic 700 12px ${it}; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; } .pb-pit-grid span b { color: #E10600; }
.pb-pit-grid button:hover { transform: skewX(-10deg) translateY(-4px); } .pb-pit-grid button.on { transform: skewX(-10deg) translateY(-8px) scale(1.06); box-shadow: 0 0 0 3px #E10600; }
`;

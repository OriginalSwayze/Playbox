// BLADES — each collection is a coloured blade. Blades you have passed fold to the left edge, the ones ahead stack on
// the right; the open blade lists its games with a big preview. Left/right swap blades, up/down pick, Enter plays,
// Y / Tab shows the details.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const HUES = [96, 200, 28, 330, 170, 260, 50, 0, 140, 220];

export function Blades() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const bi = Math.max(0, b.islands.findIndex((i) => i.id === b.cur));
	const gs = (b.found ?? b.islands[bi]?.games ?? []).slice(0, 200);
	const c = useCursor(gs.length);
	const [more, setMore] = useState(false);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const goBlade = (n: number) => { const i = b.islands[Math.max(0, Math.min(b.islands.length - 1, n))]; if (i) { b.setQ(''); b.setCur(i.id); c.to(0); select(null); } };
	useKeys((k) => {
		if (k === 'left') goBlade(bi - 1); else if (k === 'right') goBlade(bi + 1); else if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu') setMore((m) => !m); else if (k === 'back' && (sel || more)) { select(null); setMore(false); } else return false;
	});
	const hue = HUES[bi % HUES.length];
	return (
		<AltPage className="pb-bl" brand={<>blades</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-bl-app" style={{ ['--h' as string]: hue }}>
				<div className="pb-bl-left">{b.islands.slice(Math.max(0, bi - 5), bi).map((i, m) => { const n = Math.max(0, bi - 5) + m; return <button key={i.id} style={{ ["--h" as string]: HUES[n % HUES.length] }} onClick={() => goBlade(n)}><span>{i.name}</span></button>; })}</div>
				<section className="pb-bl-blade" key={b.cur + (b.found ? 'q' : '')}>
					<h1>{b.found ? 'search' : b.islands[bi]?.name.toLowerCase()}</h1>
					<div className="pb-bl-list" ref={list}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={n === c.i && !sel ? 'on' : sel?.appid === x.appid ? 'on' : ''} onMouseEnter={() => { c.to(n); }} onClick={() => select(x.appid)}>
							<Art g={x} kind="header" /><span><b>{x.name}</b><em>{x.installed ? formatPlaytime(x.minutes) : 'not installed'}</em></span>
						</button>
					))}{!gs.length && <p className="lk-empty">nothing on this blade</p>}</div>
					{g && (
						<div className="pb-bl-prev" key={g.appid}>
							<Art g={g} kind="hero" className="pb-bl-hero" />
							<h2>{g.name}</h2>
							<p>{status.toLowerCase()} · {formatAgo(g.lastPlayed).toLowerCase()}</p>
							<div className="pb-bl-btns"><PlayBtn g={g} className="pb-bl-play"><Icon name={g.installed ? 'play' : 'install'} size={18} /></PlayBtn><button onClick={() => setMore(!more)}>{more ? 'fewer details' : 'details'}</button></div>
							{(more || sel) && <><dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k.toLowerCase()}</dt><dd>{v}</dd></div>)}</dl><Actions g={g} className="pb-bl-act" /></>}
						</div>
					)}
				</section>
				<div className="pb-bl-right">{b.islands.slice(bi + 1, bi + 7).map((i, n) => <button key={i.id} style={{ ['--h' as string]: HUES[(bi + 1 + n) % HUES.length] }} onClick={() => goBlade(bi + 1 + n)}><span>{i.name}</span></button>)}</div>
			</div>
		</AltPage>
	);
}

export const bladesCss = tok('blades', { bg: '#101010', s1: 'rgba(255,255,255,.12)', s2: 'rgba(255,255,255,.2)', s3: 'rgba(255,255,255,.28)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.85)', fg3: 'rgba(255,255,255,.6)', acc: '#FFFFFF', on: '#111', top: '#101010', font: '"Segoe UI Light", "Segoe UI", sans-serif' }) + `
.pb-bl-brand { font: 300 24px var(--k-text); color: #fff; letter-spacing: -.02em; }
.pb-bl-app { position: absolute; inset: 0; display: flex; overflow: hidden; background: #101010; color: #fff; }
.pb-bl-left, .pb-bl-right { display: flex; flex: none; } .pb-bl-left button, .pb-bl-right button { position: relative; width: 46px; background: linear-gradient(90deg, hsl(var(--h) 70% 34%), hsl(var(--h) 70% 26%)); box-shadow: -6px 0 20px rgba(0,0,0,.45); transition: width .2s; }
.pb-bl-left button:hover, .pb-bl-right button:hover { width: 60px; } .pb-bl-left span, .pb-bl-right span { position: absolute; left: 50%; top: 24px; transform: translateX(-50%) rotate(180deg); writing-mode: vertical-rl; font: 300 20px var(--k-text); white-space: nowrap; color: rgba(255,255,255,.9); }
.pb-bl-blade { position: relative; flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(300px, 40%) minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 0 34px; padding: 26px 34px 0; background: linear-gradient(160deg, hsl(var(--h) 72% 40%), hsl(var(--h) 75% 24%) 70%); box-shadow: -10px 0 40px rgba(0,0,0,.5); animation: pb-bl-slide .4s var(--k-out) both; }
@keyframes pb-bl-slide { from { transform: translateX(60px); opacity: .4; } }
.pb-bl-blade h1 { grid-column: 1 / -1; margin: 0 0 14px; font: 200 64px/1 var(--k-text); letter-spacing: -.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 2px 20px rgba(0,0,0,.2); }
.pb-bl-list { overflow-y: auto; padding: 0 6px 30px 0; scrollbar-width: none; } .pb-bl-list::-webkit-scrollbar { display: none; }
.pb-bl-list button { display: flex; align-items: center; gap: 14px; width: 100%; padding: 8px 10px; text-align: left; border-radius: 2px; } .pb-bl-list button:hover { background: rgba(255,255,255,.1); } .pb-bl-list button.on { background: rgba(255,255,255,.95); color: hsl(var(--h) 70% 22%); }
.pb-bl-list img, .pb-bl-list .alt-noart { flex: none; width: 92px; height: 43px; object-fit: cover; font-size: 6px; } .pb-bl-list span { min-width: 0; } .pb-bl-list b { display: block; font: 400 18px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-bl-list em { font: 13px var(--k-text); font-style: normal; opacity: .7; }
.pb-bl-prev { overflow-y: auto; padding-bottom: 30px; animation: k-fade .3s both; scrollbar-width: none; } .pb-bl-hero { width: 100%; aspect-ratio: 1920 / 620; object-fit: cover; box-shadow: 0 16px 40px rgba(0,0,0,.35); }
.pb-bl-prev h2 { margin: 18px 0 4px; font: 300 38px/1.1 var(--k-text); } .pb-bl-prev > p { margin: 0 0 18px; font: 16px var(--k-text); opacity: .8; }
.pb-bl-btns { display: flex; gap: 10px; } .pb-bl-play { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 30px; background: #fff !important; color: hsl(var(--h) 70% 22%) !important; font: 600 17px var(--k-text) !important; } .pb-bl-btns > button:last-child { height: 46px; padding: 0 20px; box-shadow: inset 0 0 0 2px rgba(255,255,255,.7); font: 17px var(--k-text); color: #fff; }
.pb-bl-prev dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 22px 0 12px; } .pb-bl-prev dt { font: 13px var(--k-text); opacity: .7; } .pb-bl-prev dd { margin: 2px 0 0; font: 400 19px var(--k-text); }
.pb-bl-act { max-width: 320px; } .pb-bl-act button { color: #fff !important; } .pb-bl-act button:hover { background: rgba(255,255,255,.14) !important; }
`;

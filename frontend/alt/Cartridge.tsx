// CARTRIDGE — a shelf of game cartridges and a console. Every game is a grey cartridge with its art on the label,
// stacked on wooden shelves by collection; pick one and it slides into the console's slot, the power LED lights, and
// POWER plays it. Arrows walk the shelf, Enter inserts, Enter again powers on.
import { useRef } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, colsOf, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Cartridge() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 180);
	const c = useCursor(gs.length);
	const shelf = useRef<HTMLDivElement>(null);
	useKeepInView(shelf, '.kf', c.i, c.keyMoved);
	const status = useStatus(sel);
	useKeys((k) => {
		const cols = colsOf(shelf.current);
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
		else if (k === 'enter') { if (sel) gameCommands(sel)[0].run(); else { const g = gs[c.i]; if (g) select(g.appid); } } else if (k === 'back' && sel) select(null);
		else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-crt" brand={<>CARTRIDGE</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-crt-app">
				<div className="pb-crt-wall">
					<Chips b={b} className="pb-crt-chips" onPick={() => c.to(0)} />
					<div className="pb-crt-shelf" ref={shelf}>{gs.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={'pb-crt-cart' + (n === c.i ? ' kf' : '') + (sel?.appid === x.appid ? ' in' : '')} onClick={() => { c.to(n); select(sel?.appid === x.appid ? null : x.appid); }} title={x.name}>
							<i className="pb-crt-grip" /><span className="pb-crt-label"><Art g={x} kind="header" /><b>{x.name}</b></span>
						</button>
					))}{!gs.length && <p className="lk-empty">No cartridges.</p>}</div>
				</div>
				<section className="pb-crt-console">
					<div className={'pb-crt-slot' + (sel ? ' full' : '')}>{sel && <div className="pb-crt-inserted" key={sel.appid}><span className="pb-crt-label"><Art g={sel} kind="header" /><b>{sel.name}</b></span></div>}</div>
					<div className="pb-crt-body">
						<p className="pb-crt-logo">PLAYBOX 8 <small>HOME CONSOLE</small></p>
						<div className="pb-crt-ctrl"><i className={'pb-crt-led' + (sel ? ' on' : '')} /><span>POWER</span>
							{sel ? <PlayBtn g={sel} className="pb-crt-pwr" label={['ON', 'GET']} /> : <button className="pb-crt-pwr" disabled>ON</button>}
							<button className="pb-crt-rst" onClick={() => select(null)} disabled={!sel}>EJECT</button></div>
					</div>
					{sel ? (
						<div className="pb-crt-info" key={'i' + sel.appid}>
							<h2>{sel.name}</h2><p>{status} · {formatPlaytime(sel.minutes)} · {formatAgo(sel.lastPlayed)}</p>
							<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
							<Actions g={sel} className="pb-crt-act" />
						</div>
					) : <p className="pb-crt-hint">Pick a cartridge and press Enter to insert it.</p>}
				</section>
			</div>
		</AltPage>
	);
}

const f = '"Bahnschrift", "Segoe UI", sans-serif';
export const cartridgeCss = tok('cartridge', { bg: '#3A2A1E', s1: 'rgba(255,240,220,.1)', s2: 'rgba(255,240,220,.18)', s3: 'rgba(255,240,220,.26)', fg: '#F4E9DA', fg2: '#D2C2AC', fg3: '#9C8A72', acc: '#D8312A', on: '#fff', top: '#241912', font: f }) + `
.pb-crt-brand { font: 800 italic 18px ${f}; letter-spacing: .08em; color: #D8312A; text-shadow: 1px 1px 0 #000; }
.pb-crt-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 420px; background: #2C2018; color: #F4E9DA; }
.pb-crt-wall { display: flex; flex-direction: column; min-height: 0; padding: 14px 20px 0; background: repeating-linear-gradient(90deg, #4A3526 0 60px, #45311F 60px 120px); }
.pb-crt-chips { margin-bottom: 12px; } .pb-crt-chips button { background: rgba(0,0,0,.35); } .pb-crt-chips button.on { background: #D8312A; color: #fff; }
.pb-crt-shelf { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 30px 16px; align-content: start; padding: 10px 6px 40px; scrollbar-width: thin;
	background-image: linear-gradient(transparent 0 calc(100% - 14px), #6E4A2C calc(100% - 14px), #3A2414); background-size: 100% 200px; background-position: 0 10px; }
.pb-crt-cart { position: relative; height: 170px; padding: 18px 10px 0; border-radius: 6px 6px 3px 3px; background: linear-gradient(90deg, #8C8C90, #B4B4B8 8%, #A6A6AA 92%, #7E7E82); box-shadow: inset 0 -12px 0 #6E6E72, 0 6px 8px rgba(0,0,0,.5); transition: transform .2s var(--k-out); clip-path: polygon(0 0, 100% 0, 100% 100%, 92% 100%, 92% 94%, 8% 94%, 8% 100%, 0 100%); }
.pb-crt-grip { position: absolute; left: 14%; right: 14%; top: 6px; height: 8px; background: repeating-linear-gradient(90deg, #77777B 0 3px, transparent 3px 7px); }
.pb-crt-label { display: block; height: 120px; padding: 6px; background: #F4F0E6; box-shadow: inset 0 0 0 1px rgba(0,0,0,.2); } .pb-crt-label img, .pb-crt-label .alt-noart { display: block; width: 100%; height: 72px; object-fit: cover; font-size: 7px; }
.pb-crt-label b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 5px; font: 800 italic 11.5px/1.15 ${f}; color: #1A1410; text-transform: uppercase; text-align: center; }
.pb-crt-cart:hover { transform: translateY(-8px); } .pb-crt-cart.kf { transform: translateY(-12px); box-shadow: inset 0 -12px 0 #6E6E72, 0 0 0 3px #FFD23F, 0 10px 16px rgba(0,0,0,.6); } .pb-crt-cart.in { opacity: .25; }
.pb-crt-console { display: flex; flex-direction: column; min-height: 0; padding: 30px 26px; background: linear-gradient(#1E1610, #140E0A); overflow-y: auto; }
.pb-crt-slot { position: relative; height: 160px; margin: 0 40px -8px; border-radius: 6px 6px 0 0; background: linear-gradient(#0A0A0A, #222); box-shadow: inset 0 6px 14px #000; overflow: hidden; } .pb-crt-slot::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 30px; background: linear-gradient(#2A2A2E, #1A1A1E); }
.pb-crt-inserted { position: absolute; left: 50%; bottom: 10px; width: 170px; height: 150px; margin-left: -85px; padding: 12px 10px 0; border-radius: 6px 6px 0 0; background: linear-gradient(90deg, #8C8C90, #B4B4B8 8%, #A6A6AA 92%, #7E7E82); animation: pb-crt-in .6s var(--k-out) both; } .pb-crt-inserted .pb-crt-label { height: 126px; }
@keyframes pb-crt-in { from { transform: translateY(-160px); } }
.pb-crt-body { position: relative; z-index: 1; padding: 20px 22px; border-radius: 10px; background: linear-gradient(#D6D2C8, #B9B4A8); box-shadow: inset 0 -8px 0 #9A958A, 0 14px 30px rgba(0,0,0,.6); color: #2A2420; }
.pb-crt-logo { margin: 0 0 16px; font: 900 italic 22px ${f}; letter-spacing: .04em; color: #2A2420; } .pb-crt-logo small { display: block; font: 700 9px ${f}; letter-spacing: .3em; color: #5A544C; }
.pb-crt-ctrl { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 6px; background: #2A2420; color: #B9B4A8; font: 700 10px ${f}; letter-spacing: .2em; }
.pb-crt-led { width: 10px; height: 10px; border-radius: 50%; background: #4A1210; } .pb-crt-led.on { background: #FF3A2A; box-shadow: 0 0 10px #FF3A2A; }
.pb-crt-pwr, .pb-crt-rst { height: 34px; padding: 0 18px; border-radius: 4px; background: #D8312A !important; color: #fff !important; font: 800 13px ${f} !important; letter-spacing: .12em; box-shadow: 0 3px 0 #7A1410; } .pb-crt-rst { background: #5A544C !important; box-shadow: 0 3px 0 #2A2420; }
.pb-crt-pwr:disabled, .pb-crt-rst:disabled { opacity: .45; } .pb-crt-pwr:active, .pb-crt-rst:active { transform: translateY(2px); box-shadow: none; }
.pb-crt-info { margin-top: 22px; animation: k-rise .4s var(--k-out) both; } .pb-crt-info h2 { margin: 0 0 4px; font: 800 22px/1.2 ${f}; } .pb-crt-info > p { margin: 0 0 14px; font: 13px ${f}; color: #D2C2AC; }
.pb-crt-info dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 12px; } .pb-crt-info dt { font: 11px ${f}; color: #9C8A72; } .pb-crt-info dd { margin: 2px 0 0; font: 600 14px ${f}; }
.pb-crt-hint { margin-top: 26px; text-align: center; font: 14px ${f}; color: #9C8A72; }
`;

// SCOPE — a digital oscilloscope. Probe up to four games onto channels CH1-CH4: each draws a live trace whose
// amplitude is its total hours and whose frequency is its fortnight activity. The measurement panel reads the
// selected channel; TRIGGER plays it. RUN/STOP freezes the screen.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const COL = ['#FFE14D', '#3DF5FF', '#FF5CF2', '#5CFF7A'];

export function Scope() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [chs, setChs] = useState<Game[]>([]);
	const [t, setT] = useState(0);
	const [run, setRun] = useState(true);
	useEffect(() => { if (!run) return; const id = setInterval(() => setT((x) => x + 3), 60); return () => clearInterval(id); }, [run]);
	useEffect(() => { if (sel && !chs.some((c) => c.appid === sel.appid)) setChs((c) => [sel, ...c].slice(0, 4)); }, [sel?.appid]);
	const maxH = Math.max(1, ...chs.map((g) => g.minutes));
	const trace = (g: Game, k: number) => {
		const amp = 20 + (g.minutes / maxH) * 140, f = 1 + Math.min(12, g.minutes2w / 60), ph = t * 0.05 * (1 + k * 0.3);
		return Array.from({ length: 201 }, (_, i) => { const x = i * 5; const y = 250 + k * 6 - amp * Math.sin((i / 200) * Math.PI * 2 * f + ph) * (g.installed ? 1 : 0.4 + 0.2 * Math.sin(i * 0.9 + t)); return `${x},${y.toFixed(1)}`; }).join(' ');
	};
	const cur = sel ?? chs[0] ?? null;
	return (
		<AltPage className="osc" brand={<>KST-2004 · Digital Storage Oscilloscope</>}>
			<div className="osc-app">
				<div className="osc-unit">
					<section className="osc-crt">
						<svg viewBox="0 0 1000 500" preserveAspectRatio="none">
							{Array.from({ length: 11 }, (_, i) => <line key={'v' + i} x1={i * 100} x2={i * 100} y1="0" y2="500" className={i === 5 ? 'ax' : ''} />)}
							{Array.from({ length: 6 }, (_, i) => <line key={'h' + i} y1={i * 100} y2={i * 100} x1="0" x2="1000" className={i === 2.5 ? 'ax' : ''} />)}
							<line x1="0" x2="1000" y1="250" y2="250" className="ax" />
							{chs.map((g, k) => <polyline key={g.appid} points={trace(g, k)} style={{ stroke: COL[k] }} className={cur?.appid === g.appid ? 'on' : ''} />)}
						</svg>
						<div className="osc-read">{chs.map((g, k) => <span key={g.appid} style={{ color: COL[k] }}>CH{k + 1} {(g.minutes / 60).toFixed(1)}h/div</span>)}<span className="r">{run ? 'RUN' : 'STOP'} · {(1 + (cur?.minutes2w ?? 0) / 60).toFixed(2)} Hz</span></div>
						{!chs.length && <p className="osc-none">No signal — probe a game from the list</p>}
					</section>
					<aside className="osc-panel">
						<div className="osc-chs">{[0, 1, 2, 3].map((k) => <button key={k} style={{ ['--c' as string]: COL[k] }} className={chs[k] && cur?.appid === chs[k].appid ? 'on' : ''} onClick={() => chs[k] && select(chs[k].appid)}>CH{k + 1}<em>{chs[k]?.name ?? '—'}</em></button>)}</div>
						{cur && <div className="osc-meas" key={cur.appid}><b>{cur.name}</b><p>Vpp<span>{formatPlaytime(cur.minutes)}</span></p><p>Freq<span>{(cur.minutes2w / 60).toFixed(1)} h / 2 wk</span></p><p>Last edge<span>{cur.lastPlayed ? formatAgo(cur.lastPlayed) : 'none'}</span></p><p>Coupling<span>{cur.installed ? 'DC (installed)' : 'AC (not installed)'}</span></p></div>}
						<div className="osc-knobs">{['VOLTS/DIV', 'TIME/DIV', 'POSITION'].map((n, i) => <div key={n}><i style={{ transform: `rotate(${(t * (i + 1)) % 360 * 0}deg) rotate(${-40 + i * 50}deg)` }} /><span>{n}</span></div>)}</div>
						<div className="osc-btns"><button className={run ? 'on' : ''} onClick={() => setRun(!run)}>RUN/STOP</button><button onClick={() => { setChs([]); select(null); }}>CLEAR</button>{cur && <PlayBtn g={cur} className="osc-trig" label={['TRIGGER ▶', 'INSTALL ⬇']} />}</div>
						{cur && <Actions g={cur} className="osc-act" />}
					</aside>
				</div>
				<div className="osc-probe"><select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
					<div>{b.games.slice(0, 80).map((g) => <button key={g.appid} data-appid={g.appid} className={chs.some((c) => c.appid === g.appid) ? 'on' : ''} onClick={() => select(g.appid)}>{g.name}</button>)}</div></div>
			</div>
		</AltPage>
	);
}

export const scopeCss = tok('scope', { bg: '#C9CCCF', s1: '#E2E4E6', s2: '#D4D7DA', s3: '#B9BDC1', fg: '#1A1C1E', fg2: '#3B3F43', fg3: '#6B7075', acc: '#1F6FEB', on: '#fff', top: '#2B2E31', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.osc-brand { font: 700 13px var(--k-text); letter-spacing: .06em; color: #fff; }
.osc-app { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) 120px; gap: 14px; padding: 16px; background: linear-gradient(#D9DCDF, #B5B9BD); }
.osc-unit { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; padding: 16px; border-radius: 14px; background: linear-gradient(#3A3E42, #26292C); box-shadow: 0 16px 30px -14px rgba(0,0,0,.6), inset 0 1px 0 #555; min-height: 0; }
.osc-crt { position: relative; border-radius: 10px; background: #050B08; box-shadow: inset 0 0 40px rgba(0,0,0,.9), 0 0 0 6px #15171A; overflow: hidden; display: grid; grid-template-rows: minmax(0, 1fr) 24px; }
.osc-crt svg { width: 100%; height: 100%; } .osc-crt line { stroke: #1E3A2B; stroke-width: 1; vector-effect: non-scaling-stroke; } .osc-crt line.ax { stroke: #2E5A43; stroke-dasharray: 2 4; }
.osc-crt polyline { fill: none; stroke-width: 2; vector-effect: non-scaling-stroke; filter: drop-shadow(0 0 4px currentColor); opacity: .8; } .osc-crt polyline.on { stroke-width: 3; opacity: 1; }
.osc-read { display: flex; gap: 18px; align-items: center; padding: 0 12px; font: 12px Consolas, monospace; } .osc-read .r { margin-left: auto; color: #8CF5B0; }
.osc-none { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; font: 15px Consolas, monospace; color: #3F7A5A; }
.osc-panel { display: grid; align-content: start; gap: 12px; overflow-y: auto; color: #DDE1E5; }
.osc-chs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; } .osc-chs button { display: grid; padding: 6px 8px; border-radius: 6px; background: #1A1C1E; box-shadow: inset 3px 0 var(--c); text-align: left; font: 700 12px Consolas, monospace; color: var(--c); } .osc-chs button.on { background: #33373B; }
.osc-chs em { font: 11px var(--k-text); font-style: normal; color: #A8AEB4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.osc-meas { padding: 10px; border-radius: 6px; background: #0E1A14; font: 12px Consolas, monospace; color: #8CF5B0; } .osc-meas b { display: block; margin-bottom: 4px; color: #fff; font: 700 13px var(--k-text); } .osc-meas p { display: flex; justify-content: space-between; margin: 2px 0; } .osc-meas span { color: #DDE1E5; }
.osc-knobs { display: flex; justify-content: space-around; } .osc-knobs div { display: grid; justify-items: center; gap: 4px; } .osc-knobs i { width: 54px; height: 54px; border-radius: 50%; background: repeating-conic-gradient(#555 0 8deg, #333 8deg 16deg); box-shadow: 0 4px 6px #000, inset 0 0 0 8px #2A2D30; position: relative; } .osc-knobs i::after { content: ""; position: absolute; left: 50%; top: 6px; width: 3px; height: 14px; margin-left: -1.5px; background: #fff; }
.osc-knobs span { font: 700 9px var(--k-text); letter-spacing: .08em; color: #A8AEB4; }
.osc-btns { display: flex; gap: 6px; flex-wrap: wrap; } .osc-btns > button { height: 32px; padding: 0 12px; border-radius: 6px; background: #4A4F54; font: 700 11px var(--k-text); color: #DDE1E5; box-shadow: 0 3px 0 #15171A; } .osc-btns > button.on { background: #2E7D32; }
.osc-trig { height: 32px; padding: 0 14px; border-radius: 6px; background: #D84315 !important; color: #fff !important; font: 800 12px var(--k-text) !important; box-shadow: 0 3px 0 #7A2508; }
.osc-act button { color: #C9CED3 !important; font-size: 12px !important; padding: 5px 8px !important; } .osc-act button:hover { background: #33373B !important; }
.osc-probe { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 6px; } .osc-probe select { justify-self: start; height: 28px; } .osc-probe > div { overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px; align-content: flex-start; }
.osc-probe button { padding: 4px 10px; border-radius: 4px; background: #E9EBED; box-shadow: inset 0 0 0 1px #A9AEB3; font: 12px var(--k-text); color: #1A1C1E; } .osc-probe button.on { background: #1A1C1E; color: #FFE14D; }
`;

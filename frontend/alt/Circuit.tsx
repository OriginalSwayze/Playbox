// CIRCUIT — a printed circuit board. Each collection is a chip; its games are components wired to the chip's pins
// with copper traces, and each has an LED that's lit when the game is installed (and pulses if played lately).
// Click a component to probe it; the probe panel powers it on (Play).
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const CW = 520, CH = 300;

export function Circuit() {
	const islands = useIslands().slice(0, 9);
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="pcb" brand={<>KESTREL-PCB rev.A</>}>
			<div className="pcb-app">
				<div className="pcb-board" style={{ gridTemplateColumns: `repeat(3, ${CW}px)` }}>
					{islands.map((isl, k) => { const parts = isl.games.slice(0, 12); return (
						<div key={isl.id} className="pcb-cell">
							<svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}>
								{parts.map((g, n) => { const left = n % 2 === 0; const row = Math.floor(n / 2); const px = left ? 180 : 340, py = 90 + row * 22; const cx = left ? 132 : 388, cy = 30 + row * 46; const mid = left ? 142 + row * 6 : 378 - row * 6; return (
									<g key={g.appid} className={'pcb-trace' + (sel?.appid === g.appid ? ' on' : '')}><path d={`M${px} ${py} H${mid} V${cy} H${cx}`} /></g>); })}
								<rect x="190" y="70" width="140" height="150" rx="6" className="pcb-chip" />
								{Array.from({ length: 6 }, (_, r) => <g key={r}><rect x="180" y={84 + r * 22} width="10" height="8" className="pcb-pin" /><rect x="330" y={84 + r * 22} width="10" height="8" className="pcb-pin" /></g>)}
								<circle cx="205" cy="84" r="4" className="pcb-dot" />
								<text x="260" y="140" className="pcb-chipt">{isl.name.toUpperCase().slice(0, 14)}</text><text x="260" y="158" className="pcb-chips">U{k + 1} · {isl.games.length}</text>
							</svg>
							{parts.map((g, n) => { const left = n % 2 === 0; const row = Math.floor(n / 2); return (
								<button key={g.appid} data-appid={g.appid} className={'pcb-part' + (left ? ' l' : ' r') + (sel?.appid === g.appid ? ' on' : '')} style={{ top: 30 + row * 46 - 13 }} onClick={() => select(g.appid)} title={g.name}>
									<i className={'pcb-led' + (g.installed ? ' lit' : '') + (g.minutes2w ? ' pulse' : '')} /><span className="pcb-res"><b>R{k + 1}{String(n + 1).padStart(2, '0')}</b><em>{g.name}</em></span>
								</button>); })}
						</div>); })}
				</div>
				{sel && <aside className="pcb-probe" key={sel.appid}><div className="pcb-meter"><b>{(sel.minutes / 60).toFixed(1)}</b><em>hours</em></div><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes2w)} in 2 wk · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never powered'}</p><p className={sel.installed ? 'ok' : 'off'}>{sel.installed ? '● POWERED (installed)' : '○ NO POWER (not installed)'}</p><PlayBtn g={sel} className="pcb-go" label={['⚡ POWER ON (PLAY)', '⚡ SOLDER IN (INSTALL)']} /><Actions g={sel} className="pcb-act" /><button className="pcb-x" onClick={() => select(null)}>Remove probe</button></aside>}
			</div>
		</AltPage>
	);
}

export const circuitCss = tok('circuit', { bg: '#0B3D20', s1: '#0F4A28', s2: '#145A31', s3: '#1A6B3B', fg: '#E9F7EE', fg2: '#B5DEC4', fg3: '#7FB394', acc: '#E7B54A', on: '#2A1C04', top: '#07281A', font: 'Consolas, "Courier New", monospace' }) + `
.pcb-brand { font: 700 13px var(--k-text); letter-spacing: .14em; color: #E9F7EE; }
.pcb-app { position: absolute; inset: 0; overflow: auto; padding: 20px; background: #082E18; }
.pcb-board { display: grid; gap: 0; width: max-content; margin: 0 auto; padding: 20px; border-radius: 14px; background: radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1.5px) 0 0 / 14px 14px, #0B5A2E; box-shadow: 0 0 0 6px #0A4524, 0 20px 40px rgba(0,0,0,.6); }
.pcb-cell { position: relative; width: ${CW}px; height: ${CH}px; }
.pcb-trace path { fill: none; stroke: #D4A64A; stroke-opacity: .55; stroke-width: 3; stroke-linejoin: round; } .pcb-trace.on path { stroke: #FFE08A; stroke-opacity: 1; filter: drop-shadow(0 0 4px #FFE08A); stroke-width: 4; }
.pcb-chip { fill: #1A1A1A; stroke: #333; stroke-width: 2; } .pcb-pin { fill: #C9CCD1; } .pcb-dot { fill: #444; }
.pcb-chipt { font: 700 12px Consolas, monospace; fill: #DADADA; text-anchor: middle; } .pcb-chips { font: 10px Consolas, monospace; fill: #888; text-anchor: middle; }
.pcb-part { position: absolute; display: flex; gap: 4px; align-items: center; height: 26px; } .pcb-part.l { left: 0; flex-direction: row; } .pcb-part.r { right: 0; flex-direction: row-reverse; }
.pcb-led { width: 10px; height: 10px; border-radius: 50%; background: #3A1414; box-shadow: inset 0 0 0 1px #000; flex: none; } .pcb-led.lit { background: #FF4040; box-shadow: 0 0 8px #FF4040; } .pcb-led.pulse { animation: pcb-p 1.2s ease-in-out infinite; } @keyframes pcb-p { 50% { box-shadow: 0 0 2px #FF4040; opacity: .6; } }
.pcb-res { display: grid; width: 116px; padding: 2px 6px; border-radius: 3px; background: linear-gradient(90deg, #C9CCD1 0 6px, #E8D9B8 6px calc(100% - 6px), #C9CCD1 calc(100% - 6px)); text-align: left; } .pcb-part.r .pcb-res { text-align: right; }
.pcb-res b { font: 700 9px Consolas, monospace; color: #6B4E1A; } .pcb-res em { font: 9px Consolas, monospace; font-style: normal; color: #2A1C04; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pcb-part:hover .pcb-res { background: #FFF3D0; } .pcb-part.on .pcb-res { background: #FFE08A; box-shadow: 0 0 0 2px #FFE08A, 0 0 12px #FFE08A; }
.pcb-probe { position: fixed; right: 26px; bottom: 26px; width: 300px; padding: 16px; border-radius: 12px; background: #141414; color: #E9F7EE; box-shadow: 0 20px 40px rgba(0,0,0,.6); animation: k-rise .3s var(--k-out) both; }
.pcb-meter { padding: 10px; border-radius: 6px; background: #A9C39A; color: #1A2A12; font-family: Consolas, monospace; text-align: right; box-shadow: inset 0 2px 6px rgba(0,0,0,.4); } .pcb-meter b { font-size: 40px; } .pcb-meter em { font-style: normal; margin-left: 6px; }
.pcb-probe h3 { margin: 10px 0 4px; font: 700 15px Consolas, monospace; } .pcb-probe p { margin: 0 0 6px; font: 12px Consolas, monospace; color: #B5DEC4; } .pcb-probe .ok { color: #FF6B6B; } .pcb-probe .off { color: #777; }
.pcb-go { width: 100%; height: 40px; margin: 8px 0 6px; border-radius: 6px; background: #E7B54A !important; color: #2A1C04 !important; font: 700 13px Consolas, monospace !important; } .pcb-act button { color: #B5DEC4 !important; font-family: Consolas, monospace !important; font-size: 12px !important; } .pcb-act button:hover { background: #222 !important; }
.pcb-x { margin-top: 6px; color: #E7B54A; font: 12px Consolas, monospace; }
`;

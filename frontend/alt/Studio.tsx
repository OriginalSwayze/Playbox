// STUDIO — a music production workstation. Tracks are collections, clips are games placed on the timeline at
// their last session (clip length grows with hours), the transport plays the selected clip, the mixer sits below.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { useState } from 'react';

const COLORS = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#38D9A9', '#4DABF7', '#9775FA', '#F783AC'];
const MONTHS = 18;

export function Studio() {
	const islands = useIslands();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const tracks = (found ? [{ id: 'q', name: 'Search', games: found }] : islands).slice(0, 14);
	const end = useMemo(() => Math.max(Date.now() / 1000, ...tracks.flatMap((t) => t.games.map((g) => g.lastPlayed))), [tracks]);
	const span = MONTHS * 30 * 86400, start = end - span;
	const pos = (g: Game) => Math.max(0, Math.min(1, (g.lastPlayed - start) / span));
	const width = (g: Game) => Math.max(0.6, Math.min(12, Math.sqrt(g.minutes / 60) * 0.8));
	const months = Array.from({ length: MONTHS }, (_, i) => new Date((start + i * 30 * 86400) * 1000).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }));
	return (
		<AltPage className="daw" brand={<><span className="daw-wave">∿</span>Studio</>} search={q} onSearch={setQ} searchPlaceholder="Search clips">
			<div className="daw-app">
				<div className="daw-transport">
					<div className="daw-lcd"><b>{sel ? sel.name : 'No clip selected'}</b><span>{sel ? `${formatPlaytime(sel.minutes)} · ${sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}` : 'Click a clip on the timeline'}</span></div>
					<div className="daw-btns"><button>⏮</button>{sel ? <PlayBtn g={sel} className="daw-play"><Icon name={sel.installed ? 'play' : 'install'} size={18} /></PlayBtn> : <button className="daw-play"><Icon name="play" size={18} /></button>}<button>⏹</button><button className="rec">●</button></div>
					<div className="daw-lcd sm"><b>{tracks.reduce((n, t) => n + t.games.length, 0)}</b><span>BPM</span></div><div className="daw-lcd sm"><b>4/4</b><span>Time</span></div>
				</div>
				<div className="daw-arr">
					<div className="daw-ruler"><span className="daw-hd">Tracks</span><div>{months.map((m) => <span key={m}>{m}</span>)}</div></div>
					<div className="daw-lanes">
						{tracks.map((t, ti) => (
							<div key={t.id} className="daw-lane">
								<div className="daw-head" style={{ ['--c' as string]: COLORS[ti % 8] }}><b>{t.name}</b><span><i>M</i><i>S</i><i className="r">R</i></span><em>{t.games.length} clips</em></div>
								<div className="daw-track">
									{t.games.filter((g) => g.lastPlayed > start).slice(0, 60).map((g) => (
										<button key={g.appid} data-appid={g.appid} className={'daw-clip' + (sel?.appid === g.appid ? ' on' : '')} style={{ left: Math.min(pos(g) * 100, 100 - width(g)) + '%', width: width(g) + '%', ['--c' as string]: COLORS[ti % 8] }} onClick={() => select(g.appid)} title={g.name}>
											<span>{g.name}</span><svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d={'M0 10 ' + Array.from({ length: 25 }, (_, k) => `L${k * 4} ${10 - ((g.appid * (k + 3)) % 9)} L${k * 4 + 2} ${10 + ((g.appid * (k + 5)) % 9)}`).join(' ')} /></svg>
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="daw-mixer">
					{sel ? <div className="daw-insp" key={sel.appid}><Art g={sel} kind="capsule" /><div><h3>{sel.name}</h3><p>{sel.installed ? 'Installed' : 'Not installed'} · Metascore {sel.metacritic || '—'}</p><Actions g={sel} className="daw-act" /></div></div> : <div className="daw-insp"><p>Select a clip to inspect it.</p></div>}
					<div className="daw-faders">{tracks.slice(0, 10).map((t, ti) => { const lvl = Math.min(1, t.games.reduce((n, g) => n + g.minutes2w, 0) / 1200); return <div key={t.id} className="daw-ch" style={{ ['--c' as string]: COLORS[ti % 8] }}><div className="daw-meter"><i style={{ height: lvl * 100 + '%' }} /></div><div className="daw-fader"><i style={{ bottom: 20 + lvl * 60 + '%' }} /></div><span>{t.name}</span></div>; })}</div>
				</div>
			</div>
		</AltPage>
	);
}

export const studioCss = tok('studio', { bg: '#1B1C20', s1: '#26282E', s2: '#30333A', s3: '#3B3F47', fg: '#E6E8EC', fg2: '#AEB3BD', fg3: '#6E7480', acc: '#FF8A3D', on: '#1B1C20', top: '#141518', font: '"Segoe UI", system-ui, sans-serif' }) + `
.daw-brand { display: flex; gap: 8px; align-items: center; font: 700 17px var(--k-text); color: #E6E8EC; } .daw-wave { color: #FF8A3D; font-size: 24px; }
.daw-app { position: absolute; inset: 0; display: grid; grid-template-rows: 64px minmax(0, 1fr) 190px; font: 12px var(--k-text); color: #AEB3BD; }
.daw-transport { display: flex; gap: 12px; align-items: center; padding: 0 14px; background: #26282E; border-bottom: 1px solid #111; }
.daw-lcd { display: grid; min-width: 320px; padding: 6px 12px; border-radius: 6px; background: #0E1A14; box-shadow: inset 0 1px 4px #000; color: #7CFFB2; font-family: Consolas, monospace; } .daw-lcd b { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .daw-lcd span { font-size: 11px; opacity: .7; } .daw-lcd.sm { min-width: 70px; text-align: center; }
.daw-btns { display: flex; gap: 6px; } .daw-btns button { width: 40px; height: 36px; border-radius: 6px; background: #30333A; color: #E6E8EC; display: grid; place-items: center; font-size: 15px; } .daw-btns .rec { color: #FF4D4D; }
.daw-play { background: #FF8A3D !important; color: #1B1C20 !important; }
.daw-arr { display: grid; grid-template-rows: 26px minmax(0, 1fr); min-height: 0; }
.daw-ruler { display: grid; grid-template-columns: 180px minmax(0, 1fr); background: #202227; border-bottom: 1px solid #111; } .daw-hd { padding: 6px 12px; font-weight: 600; } .daw-ruler > div { display: grid; grid-template-columns: repeat(${MONTHS}, 1fr); } .daw-ruler > div span { padding: 6px 4px; border-left: 1px solid #3B3F47; font-size: 11px; color: #6E7480; white-space: nowrap; overflow: hidden; }
.daw-lanes { overflow-y: auto; }
.daw-lane { display: grid; grid-template-columns: 180px minmax(0, 1fr); height: 64px; border-bottom: 1px solid #111; }
.daw-head { display: grid; align-content: center; gap: 3px; padding: 0 10px; background: #26282E; box-shadow: inset 4px 0 var(--c); } .daw-head b { color: #E6E8EC; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .daw-head span { display: flex; gap: 3px; } .daw-head i { width: 18px; height: 16px; border-radius: 3px; background: #3B3F47; font: 700 9px/16px var(--k-text); text-align: center; font-style: normal; } .daw-head i.r { color: #FF4D4D; } .daw-head em { font-style: normal; font-size: 10px; color: #6E7480; }
.daw-track { position: relative; background: repeating-linear-gradient(90deg, transparent 0 calc(100% / ${MONTHS} - 1px), #2A2C32 calc(100% / ${MONTHS} - 1px) calc(100% / ${MONTHS})), #1F2025; }
.daw-clip { position: absolute; top: 5px; bottom: 5px; min-width: 14px; border-radius: 4px; overflow: hidden; background: color-mix(in srgb, var(--c) 35%, #1B1C20); box-shadow: inset 0 0 0 1px var(--c); text-align: left; }
.daw-clip span { position: absolute; left: 0; right: 0; top: 0; padding: 1px 4px; background: var(--c); color: #111; font: 600 10px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.daw-clip svg { position: absolute; left: 0; right: 0; bottom: 3px; width: 100%; height: 28px; } .daw-clip path { fill: none; stroke: var(--c); stroke-width: 1; vector-effect: non-scaling-stroke; }
.daw-clip:hover { filter: brightness(1.2); z-index: 1; } .daw-clip.on { box-shadow: 0 0 0 2px #fff; z-index: 2; }
.daw-mixer { display: grid; grid-template-columns: 420px minmax(0, 1fr); background: #26282E; border-top: 1px solid #111; }
.daw-insp { display: flex; gap: 14px; padding: 14px; border-right: 1px solid #111; animation: k-fade .2s both; } .daw-insp img { width: 100px; height: 150px; object-fit: cover; border-radius: 4px; } .daw-insp h3 { margin: 0 0 4px; font: 700 15px var(--k-text); color: #E6E8EC; } .daw-insp p { margin: 0 0 6px; }
.daw-act button { padding: 4px 8px !important; font-size: 12px !important; }
.daw-faders { display: flex; gap: 2px; padding: 10px; overflow-x: auto; }
.daw-ch { display: grid; grid-template-columns: 8px 1fr; grid-template-rows: 1fr auto; gap: 4px 8px; width: 74px; flex: none; padding: 6px; border-radius: 4px; background: #202227; }
.daw-meter { position: relative; border-radius: 2px; background: #111; } .daw-meter i { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, #69DB7C, #FFD43B 70%, #FF6B6B); transition: height .6s; }
.daw-fader { position: relative; } .daw-fader::before { content: ""; position: absolute; left: 50%; top: 6px; bottom: 6px; width: 3px; margin-left: -1px; background: #111; } .daw-fader i { position: absolute; left: 50%; width: 30px; height: 14px; margin-left: -15px; border-radius: 3px; background: linear-gradient(#E6E8EC, #8A8F99); box-shadow: inset 0 -2px var(--c); }
.daw-ch span { grid-column: 1 / -1; font-size: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

// DRIVE — a car's infotainment screen. The cluster's speedometer reads the selected game's hours this fortnight,
// the rev counter its total, the media card plays it; the dock along the bottom switches collections.
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

function Gauge({ value, max, label, unit, big }: { value: number; max: number; label: string; unit: string; big?: boolean }) {
	const a = -225 + Math.min(1, value / max) * 270;
	const r = 90, c = 2 * Math.PI * r, arc = c * 0.75;
	return (
		<div className={'drv-gauge' + (big ? ' big' : '')}>
			<svg viewBox="0 0 220 220"><circle cx="110" cy="110" r={r} className="t" strokeDasharray={`${arc} ${c}`} transform="rotate(135 110 110)" />
				<circle cx="110" cy="110" r={r} className="v" strokeDasharray={`${arc * Math.min(1, value / max)} ${c}`} transform="rotate(135 110 110)" />
				{Array.from({ length: 11 }, (_, i) => { const t = (-225 + i * 27) * Math.PI / 180; return <line key={i} x1={110 + Math.cos(t) * 74} y1={110 + Math.sin(t) * 74} x2={110 + Math.cos(t) * 82} y2={110 + Math.sin(t) * 82} />; })}
				<line className="n" x1="110" y1="110" x2={110 + Math.cos(a * Math.PI / 180) * 70} y2={110 + Math.sin(a * Math.PI / 180) * 70} /></svg>
			<div><b>{value.toFixed(value < 10 ? 1 : 0)}</b><em>{unit}</em><span>{label}</span></div>
		</div>
	);
}

export function Drive() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const g: Game | null = sel ?? b.games[0] ?? null;
	const now = new Date();
	return (
		<AltPage className="drv" brand={<><span className="drv-k">K</span>DRIVE</>}>
			<div className="drv-app">
				<section className="drv-cluster">
					<div className="drv-time"><b>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><span>{b.isle?.name} · {b.games.length} destinations</span></div>
					{g && <div className="drv-gs"><Gauge value={g.minutes2w / 60} max={40} label="Fortnight" unit="h" /><Gauge value={g.minutes / 60} max={Math.max(100, g.minutes / 60)} label="Odometer" unit="h total" big /><Gauge value={g.metacritic} max={100} label="Rating" unit="score" /></div>}
					{g && <div className="drv-warn"><span className={g.installed ? 'ok' : 'w'}>{g.installed ? '● Ready to go' : '● Needs fuel (install)'}</span><span>{g.lastPlayed ? `Last trip ${formatAgo(g.lastPlayed).toLowerCase()}` : 'First trip'}</span></div>}
				</section>
				<section className="drv-right">
					{g && (
						<div className="drv-media" key={g.appid}>
							<Art g={g} kind="hero" />
							<div className="drv-mi"><em>Now selected</em><h2>{g.name}</h2><p>{formatPlaytime(g.minutes)} driven</p>
								<div className="drv-ctl"><button onClick={() => { const i = b.games.indexOf(g); b.games[i - 1] && select(b.games[i - 1].appid); }}>⏮</button><PlayBtn g={g} className="drv-play"><Icon name={g.installed ? 'play' : 'install'} size={26} /></PlayBtn><button onClick={() => { const i = b.games.indexOf(g); b.games[i + 1] && select(b.games[i + 1].appid); }}>⏭</button></div></div>
						</div>
					)}
					<div className="drv-strip">{b.games.slice(0, 60).map((x) => <button key={x.appid} data-appid={x.appid} className={g?.appid === x.appid ? 'on' : ''} onClick={() => select(x.appid)}><Art g={x} kind="capsule" /><span>{x.name}</span></button>)}</div>
					{g && <Actions g={g} className="drv-act" />}
				</section>
				<nav className="drv-dock">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}><i>{i.name[0]}</i><span>{i.name}</span></button>)}</nav>
			</div>
		</AltPage>
	);
}

export const driveCss = tok('drive', { bg: '#05070A', s1: '#11151B', s2: '#1A2029', s3: '#252D39', fg: '#EAF2FF', fg2: '#A9B6C9', fg3: '#5F6C80', acc: '#2FD3FF', on: '#001820', font: 'Bahnschrift, "Segoe UI", sans-serif' }) + `
.drv-brand { display: flex; gap: 8px; align-items: center; font: 600 17px var(--k-text); letter-spacing: .3em; color: #EAF2FF; } .drv-k { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; background: #2FD3FF; color: #001820; letter-spacing: 0; }
.drv-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 84px; gap: 14px; padding: 14px; background: radial-gradient(60% 80% at 25% 40%, #0B2333, transparent), #05070A; color: #EAF2FF; }
.drv-cluster { display: grid; grid-template-rows: auto 1fr auto; padding: 20px; border-radius: 26px; background: linear-gradient(160deg, #0E141C, #070A0E); box-shadow: inset 0 0 0 1px #1A2029; }
.drv-time b { font: 300 46px var(--k-text); } .drv-time span { display: block; color: #5F6C80; font: 14px var(--k-text); }
.drv-gs { display: flex; align-items: center; justify-content: center; gap: 0; }
.drv-gauge { position: relative; width: 200px; } .drv-gauge.big { width: 320px; } .drv-gauge svg { width: 100%; display: block; }
.drv-gauge .t { fill: none; stroke: #1A2029; stroke-width: 10; stroke-linecap: round; } .drv-gauge .v { fill: none; stroke: #2FD3FF; stroke-width: 10; stroke-linecap: round; filter: drop-shadow(0 0 6px #2FD3FF); transition: stroke-dasharray .8s var(--k-out); }
.drv-gauge line { stroke: #3A4556; stroke-width: 2; } .drv-gauge line.n { stroke: #FF5A3C; stroke-width: 3; stroke-linecap: round; transition: all .8s var(--k-out); }
.drv-gauge > div { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; } .drv-gauge b { font: 300 40px var(--k-text); } .drv-gauge.big b { font-size: 72px; } .drv-gauge em { font: 12px var(--k-text); font-style: normal; color: #A9B6C9; } .drv-gauge span { margin-top: 30px; font: 600 11px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #5F6C80; }
.drv-warn { display: flex; justify-content: space-between; font: 15px var(--k-text); color: #A9B6C9; } .drv-warn .ok { color: #3DE08A; } .drv-warn .w { color: #FFB020; }
.drv-right { display: grid; grid-template-rows: auto 1fr auto; gap: 12px; min-height: 0; }
.drv-media { position: relative; height: 280px; border-radius: 26px; overflow: hidden; animation: k-fade .4s both; } .drv-media > img { width: 100%; height: 100%; object-fit: cover; }
.drv-mi { position: absolute; inset: 0; padding: 22px; display: flex; flex-direction: column; justify-content: flex-end; background: linear-gradient(transparent 20%, rgba(0,0,0,.9)); } .drv-mi em { font: 600 11px var(--k-text); letter-spacing: .2em; text-transform: uppercase; font-style: normal; color: #2FD3FF; }
.drv-mi h2 { margin: 4px 0; font: 600 28px var(--k-text); } .drv-mi p { margin: 0 0 12px; color: #A9B6C9; }
.drv-ctl { display: flex; gap: 26px; align-items: center; } .drv-ctl > button:not(.drv-play) { font-size: 22px; color: #EAF2FF; } .drv-play { width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; background: #2FD3FF !important; color: #001820 !important; box-shadow: 0 0 30px rgba(47,211,255,.5); }
.drv-strip { display: grid; grid-auto-flow: column; grid-auto-columns: 104px; gap: 10px; overflow-x: auto; align-items: start; padding-bottom: 4px; }
.drv-strip button { display: grid; gap: 6px; } .drv-strip img, .drv-strip .alt-noart { width: 104px; height: 150px; object-fit: cover; border-radius: 14px; } .drv-strip button.on img { box-shadow: 0 0 0 3px #2FD3FF; } .drv-strip span { font: 12px var(--k-text); color: #A9B6C9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.drv-act { grid-template-columns: repeat(4, auto); justify-content: start; } .drv-act button { color: #A9B6C9 !important; }
.drv-dock { grid-column: 1 / -1; display: flex; gap: 10px; align-items: center; padding: 0 14px; border-radius: 22px; background: #0E141C; box-shadow: inset 0 0 0 1px #1A2029; overflow-x: auto; }
.drv-dock button { flex: none; display: flex; gap: 10px; align-items: center; height: 56px; padding: 0 18px 0 8px; border-radius: 16px; color: #A9B6C9; font: 15px var(--k-text); } .drv-dock i { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: #1A2029; font-style: normal; font-weight: 700; }
.drv-dock button.on { background: #1A2029; color: #fff; } .drv-dock button.on i { background: #2FD3FF; color: #001820; }
`;

// MISSION CONTROL — your library as live telemetry. Hours, installs, disk, activity and collections as instrument
// panels in a control room; click any bar or row to bring that game up on the main screen and launch it.
import { useMemo, useState, type ReactNode } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useLibraryLists, useSelectedGame } from './common';

function Panel({ title, code, children, className }: { title: string; code: string; children: ReactNode; className?: string }) {
	return <section className={'mc-panel ' + (className ?? '')}><header><b>{title}</b><span>{code}</span></header>{children}</section>;
}

function MainScreen({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<Panel title="Main screen" code={`APP ${g.appid}`} className="mc-main">
			<div className="mc-feed"><Art g={g} kind="hero" /><i className="mc-cross" /><span className="mc-rec">● LIVE</span></div>
			<div className="mc-main-body">
				<h2>{g.name}</h2>
				<div className="mc-kv"><span>Runtime</span><b>{formatPlaytime(g.minutes)}</b><span>Last contact</span><b>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'never'}</b>
					<span>Objectives</span><b>{d.achievements.total ? `${d.achievements.achieved}/${d.achievements.total}` : 'n/a'}</b><span>Payload</span><b>{formatBytes(d.disk || g.sizeOnDisk) || '—'}</b></div>
				<button className="mc-launch" onClick={go.run}>{g.installed ? 'Launch' : 'Install'} <em>{g.installed ? 'GO' : 'DL'}</em></button>
				<Actions g={g} className="mc-actions" />
				<button className="mc-dismiss" onClick={close}>Clear screen</button>
			</div>
		</Panel>
	);
}

export function Mission() {
	const lists = useLibraryLists();
	const islands = useIslands();
	const dl = useKestrel((s) => s.downloads);
	const friends = useKestrel((s) => s.friends);
	const [sel, select] = useSelectedGame();
	const [, setHover] = useState(0);
	const stats = useMemo(() => {
		const hours = lists.all.reduce((s, g) => s + g.minutes, 0) / 60;
		const disk = lists.installed.reduce((s, g) => s + g.sizeOnDisk, 0);
		const fortnight = lists.all.filter((g) => g.minutes2w > 0).sort((a, b) => b.minutes2w - a.minutes2w);
		const buckets = [0, 1, 10, 50, 200, Infinity];
		const hist = buckets.slice(0, -1).map((lo, i) => ({ label: i === 0 ? 'never' : i === 4 ? '200h+' : `${lo}-${buckets[i + 1]}h`, n: lists.all.filter((g) => { const h = g.minutes / 60; return i === 0 ? g.minutes === 0 : h >= lo && h < buckets[i + 1]; }).length }));
		return { hours, disk, fortnight, hist };
	}, [lists]);
	const top = lists.top.slice(0, 10);
	const maxTop = top[0]?.minutes || 1;
	const cols = islands.filter((i) => i.id !== 'recent' && i.id !== 'uncategorized');
	const maxCol = Math.max(1, ...cols.map((c) => c.games.length));
	const maxHist = Math.max(1, ...stats.hist.map((h) => h.n));
	const clock = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	return (
		<AltPage className="mc" brand={<><i className="mc-led" />Mission Control</>}>
			<div className="mc-room">
				<div className="mc-kpis">
					{[['Library', String(lists.all.length), 'titles'], ['Runtime', Math.round(stats.hours).toLocaleString(), 'hours logged'], ['On station', String(lists.installed.length), 'installed'], ['Payload', formatBytes(stats.disk) || '0', 'on disk'], ['Untouched', String(lists.unplayed.length), 'never launched'], ['Crew', String(friends.filter((f) => f.state !== 'offline').length), 'friends online']].map(([a, b, c], i) => (
						<div key={a} className="mc-kpi" style={{ animationDelay: `${i * 60}ms` }}><span>{a}</span><b>{b}</b><em>{c}</em></div>
					))}
				</div>
				<div className="mc-grid">
					{sel ? <MainScreen key={sel.appid} g={sel} close={() => select(null)} /> : (
						<Panel title="Top runtime" code="TLM-01" className="mc-main">
							<div className="mc-bars">
								{top.map((g, i) => (
									<button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)} onMouseEnter={() => setHover(i)}>
										<span className="n">{g.name}</span>
										<span className="bar"><i style={{ width: `${(g.minutes / maxTop) * 100}%`, animationDelay: `${i * 70}ms` }} /></span>
										<span className="v">{Math.round(g.minutes / 60).toLocaleString()}h</span>
									</button>
								))}
							</div>
						</Panel>
					)}
					<Panel title="Active this fortnight" code="ACT-14">
						{stats.fortnight.length ? stats.fortnight.slice(0, 8).map((g) => (
							<button key={g.appid} data-appid={g.appid} className="mc-row" onClick={() => select(g.appid)}><b>{g.name}</b><em>{formatPlaytime(g.minutes2w)}</em></button>
						)) : <p className="mc-quiet">No activity in the last two weeks.</p>}
					</Panel>
					<Panel title="Playtime distribution" code="DST-05">
						<svg className="mc-hist" viewBox="0 0 300 140" preserveAspectRatio="none">
							{stats.hist.map((h, i) => { const hgt = (h.n / maxHist) * 110; return <g key={h.label}><rect x={i * 60 + 8} y={120 - hgt} width="44" height={hgt} rx="3" /><text x={i * 60 + 30} y="136" textAnchor="middle">{h.label}</text><text className="v" x={i * 60 + 30} y={114 - hgt} textAnchor="middle">{h.n}</text></g>; })}
						</svg>
					</Panel>
					<Panel title="Collections" code="COL-MAP">
						{cols.map((c) => (
							<div key={c.id} className="mc-col"><span>{c.name}</span><i><i style={{ width: `${(c.games.length / maxCol) * 100}%` }} /></i><em>{c.games.length}</em></div>
						))}
					</Panel>
					<Panel title="Downlink" code="NET-DL">
						<p className="mc-quiet">{dl.active ? `Receiving ${dl.active.name}: ${dl.active.percent.toFixed(1)}%${dl.rate ? ` at ${formatBytes(dl.rate)}/s` : ''}` : 'Link idle.'}</p>
						{dl.queue.map((x) => <div key={x.appid} className="mc-row static"><b>{x.name}</b><em>{x.paused ? 'held' : 'queued'}</em></div>)}
						<div className="mc-clock">T {clock}</div>
					</Panel>
				</div>
			</div>
		</AltPage>
	);
}

export const missionCss = `
html.kestrel[data-ui="mission"] { --k-ink: #050806; --k-s1: #0A110C; --k-s2: #0F1A12; --k-s3: #16251A; --k-s4: #1E3324; --k-line: rgba(120,255,160,.12); --k-line-2: rgba(120,255,160,.22);
	--k-fg: #D8FFE2; --k-fg-2: #8FC8A0; --k-fg-3: #568A66; --k-accent: #FFB020; --k-accent-2: #FFD27A; --k-on-accent: #1E1200; --k-a10: rgba(255,176,32,.08); --k-a20: rgba(255,176,32,.16); --k-a40: rgba(255,176,32,.35);
	--mc-mono: "Cascadia Mono", Consolas, monospace; }
.mc-brand { display: flex; align-items: center; gap: 10px; font: 700 16px var(--mc-mono); letter-spacing: .14em; text-transform: uppercase; color: #D8FFE2; }
.mc-led { width: 9px; height: 9px; border-radius: 50%; background: #3CFF7A; box-shadow: 0 0 10px #3CFF7A; animation: tm-blink 2s steps(1) infinite; }
.mc-stage { background: #050806; }
.mc-room { position: absolute; inset: 0; overflow-y: auto; padding: 18px 22px 40px; background: radial-gradient(70% 50% at 50% 0%, rgba(60,255,122,.06), transparent), #050806; font-family: var(--mc-mono); }
.mc-kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 14px; }
.mc-kpi { padding: 12px 14px; background: #0A110C; border: 1px solid var(--k-line-2); position: relative; animation: k-rise 500ms var(--k-out) both; }
.mc-kpi::before, .mc-kpi::after, .mc-panel::before, .mc-panel::after { content: ""; position: absolute; width: 10px; height: 10px; border: 2px solid #FFB020; }
.mc-kpi::before, .mc-panel::before { left: -2px; top: -2px; border-right: 0; border-bottom: 0; }
.mc-kpi::after, .mc-panel::after { right: -2px; bottom: -2px; border-left: 0; border-top: 0; }
.mc-kpi span { display: block; font: 600 10.5px var(--mc-mono); letter-spacing: .14em; text-transform: uppercase; color: #568A66; }
.mc-kpi b { display: block; margin: 4px 0 2px; font: 700 28px var(--mc-mono); color: #D8FFE2; text-shadow: 0 0 12px rgba(60,255,122,.35); }
.mc-kpi em { font: 11px var(--mc-mono); font-style: normal; color: #8FC8A0; }
.mc-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; grid-auto-rows: minmax(200px, auto); gap: 14px; }
.mc-panel { position: relative; padding: 12px 14px 14px; background: #0A110C; border: 1px solid var(--k-line-2); animation: k-rise 600ms var(--k-out) both; min-width: 0; }
.mc-panel header { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px dashed var(--k-line-2); }
.mc-panel header b { font: 700 12px var(--mc-mono); letter-spacing: .14em; text-transform: uppercase; color: #FFB020; }
.mc-panel header span { font: 11px var(--mc-mono); color: #568A66; }
.mc-main { grid-row: span 2; }
.mc-bars button { display: grid; grid-template-columns: 200px 1fr 64px; align-items: center; gap: 10px; width: 100%; padding: 5px 4px; text-align: left; font: 13px var(--mc-mono) !important; color: #D8FFE2 !important; }
.mc-bars button:hover { background: rgba(60,255,122,.06); }
.mc-bars .n { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-bars .bar { height: 14px; background: #0F1A12; box-shadow: inset 0 0 0 1px var(--k-line); }
.mc-bars .bar i { display: block; height: 100%; background: repeating-linear-gradient(90deg, #3CFF7A 0 6px, #24A84F 6px 8px); box-shadow: 0 0 10px rgba(60,255,122,.5); animation: mc-grow 900ms var(--k-out) both; transform-origin: left; }
@keyframes mc-grow { from { transform: scaleX(0); } }
.mc-bars .v { text-align: right; color: #FFD27A; }
.mc-row { display: flex; justify-content: space-between; gap: 10px; width: 100%; padding: 5px 2px; border-bottom: 1px dotted var(--k-line); font: 12.5px var(--mc-mono) !important; color: #D8FFE2 !important; text-align: left; }
.mc-row b { font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-row em { font-style: normal; color: #FFD27A; white-space: nowrap; }
.mc-row:not(.static):hover { background: rgba(60,255,122,.06); }
.mc-quiet { margin: 0 0 8px; font: 12.5px var(--mc-mono); color: #8FC8A0; }
.mc-hist { width: 100%; height: 160px; }
.mc-hist rect { fill: #3CFF7A; filter: drop-shadow(0 0 6px rgba(60,255,122,.5)); animation: mc-up 900ms var(--k-out) both; transform-origin: bottom; transform-box: fill-box; }
@keyframes mc-up { from { transform: scaleY(0); } }
.mc-hist text { fill: #568A66; font: 10px var(--mc-mono); } .mc-hist text.v { fill: #FFD27A; font-size: 11px; }
.mc-col { display: grid; grid-template-columns: 1fr 90px 30px; gap: 8px; align-items: center; padding: 3px 0; font: 12px var(--mc-mono); color: #D8FFE2; }
.mc-col span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-col > i { height: 8px; background: #0F1A12; } .mc-col > i > i { display: block; height: 100%; background: #FFB020; animation: mc-grow 900ms var(--k-out) both; transform-origin: left; }
.mc-col em { font-style: normal; text-align: right; color: #FFD27A; }
.mc-clock { margin-top: 10px; font: 700 22px var(--mc-mono); color: #3CFF7A; text-shadow: 0 0 10px rgba(60,255,122,.5); }
.mc-feed { position: relative; aspect-ratio: 16/7; overflow: hidden; border: 1px solid var(--k-line-2); }
.mc-feed img, .mc-feed .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(.6) contrast(1.1); }
.mc-feed::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3px), linear-gradient(rgba(60,255,122,.08), rgba(60,255,122,.08)); }
.mc-cross { position: absolute; left: 50%; top: 50%; width: 60px; height: 60px; margin: -30px; z-index: 1; border: 1px solid rgba(255,176,32,.8); border-radius: 50%; }
.mc-cross::before, .mc-cross::after { content: ""; position: absolute; background: rgba(255,176,32,.8); }
.mc-cross::before { left: 50%; top: -14px; bottom: -14px; width: 1px; } .mc-cross::after { top: 50%; left: -14px; right: -14px; height: 1px; }
.mc-rec { position: absolute; left: 10px; top: 8px; z-index: 1; font: 700 12px var(--mc-mono); color: #FF4D4D; animation: tm-blink 1.2s steps(1) infinite; }
.mc-main-body h2 { margin: 12px 0 8px; font: 700 20px var(--mc-mono); color: #D8FFE2; }
.mc-kv { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 4px 12px; margin-bottom: 14px; font: 12.5px var(--mc-mono); }
.mc-kv span { color: #568A66; text-transform: uppercase; letter-spacing: .08em; font-size: 11px; } .mc-kv b { font-weight: 400; color: #FFD27A; }
.mc-launch { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 50px; padding: 0 18px; background: #FFB020 !important; color: #1E1200 !important; font: 800 16px var(--mc-mono) !important; letter-spacing: .16em; text-transform: uppercase; box-shadow: 0 0 24px rgba(255,176,32,.4); }
.mc-launch em { font-style: normal; padding: 3px 8px; background: #1E1200; color: #FFB020; }
.mc-actions { margin-top: 10px; } .mc-actions button { font-family: var(--mc-mono) !important; }
.mc-dismiss { margin-top: 6px; font: 12px var(--mc-mono) !important; color: #568A66 !important; text-transform: uppercase; letter-spacing: .1em; }
`;

// TRANSIT — the library as a metro map. Each collection is a coloured line and its games are stations; a game in
// several collections is an interchange, and hovering one lights it up on every line it serves. Choosing a station
// brings up its departure board, where the next train is Play.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const COLORS = ['#E5484D', '#1E88E5', '#2E9E5B', '#F2C230', '#B0306E', '#F59BB8', '#8D99A6', '#2B3A8C', '#C2701F', '#7CCFB8', '#F07A1A', '#7B5CC4', '#8BC34A', '#222222'];
const STEP = 86;
const ROW = 128;
const CAP = 30;
const X0 = 170;
const yOff = (k: number) => (Math.floor(k / 6) % 2 ? 36 : 0);

type Line = { id: string; name: string; color: string; games: Game[] };

function Board({ g, lines, close }: { g: Game; lines: Line[]; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	const serving = lines.filter((l) => l.games.some((x) => x.appid === g.appid));
	return (
		<aside className="tr-board">
			<header><i className="tr-mark sm"><i /><i /></i><b>{g.name}</b><button onClick={close} aria-label="Close">×</button></header>
			<div className="tr-dots">
				<div><span>1</span><b>{g.installed ? 'Play' : 'Install'}</b><em>{g.installed ? 'Ready' : 'Needs install'}</em></div>
				<div><span>2</span><b>Journey so far</b><em>{formatPlaytime(g.minutes)}</em></div>
				<div><span>3</span><b>Last train</b><em>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</em></div>
				{d.achievements.total > 0 && <div><span>4</span><b>Stops visited</b><em>{d.achievements.achieved}/{d.achievements.total}</em></div>}
			</div>
			<p className="tr-serv">{serving.length ? 'Served by' : 'Not on any line'}{serving.map((l) => <span key={l.id} style={{ background: l.color, color: l.color === '#F2C230' || l.color === '#F59BB8' || l.color === '#7CCFB8' ? '#111' : '#fff' }}>{l.name}</span>)}</p>
			<button className="tr-go" onClick={go.run}>{g.installed ? 'Board now · Play' : 'Buy a ticket · Install'}</button>
			<Actions g={g} className="tr-actions" />
		</aside>
	);
}

export function Transit() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [hover, setHover] = useState<number | null>(null);
	const [full, setFull] = useState<Record<string, boolean>>({});
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const lines: Line[] = useMemo(() => islands.map((i, n) => ({ id: i.id, name: i.id === 'recent' ? 'Recent line' : i.name, color: COLORS[n % COLORS.length], games: i.id === 'recent' ? i.games : [...i.games].sort((a, b) => b.lastPlayed - a.lastPlayed) })), [islands]);
	const hits = useMemo(() => new Set(found?.map((g) => g.appid) ?? []), [found]);
	const count = useMemo(() => {
		const m = new Map<number, number>();
		for (const l of lines) for (const g of l.games) m.set(g.appid, (m.get(g.appid) ?? 0) + 1);
		return m;
	}, [lines]);
	const shown = lines.map((l) => ({ ...l, stops: full[l.id] ? l.games : l.games.slice(0, CAP) }));
	const width = X0 + Math.max(...shown.map((l) => l.stops.length), 1) * STEP + 220;
	const height = 110 + shown.length * ROW;
	return (
		<AltPage className="tr" brand={<><i className="tr-mark"><i /><i /></i>Metro</>} search={q} onSearch={setQ} searchPlaceholder="Find a station">
			<div className={'tr-map' + (found ? ' searching' : '')}>
				<svg width={width} height={height} className="tr-svg">
					{shown.map((l, i) => {
						const y = 90 + i * ROW;
						const pts = l.stops.map((_, k) => [X0 + k * STEP, y + yOff(k)]);
						const more = l.games.length - l.stops.length;
						return (
							<g key={l.id} className="tr-line" style={{ animationDelay: `${i * 70}ms` }}>
								<text x={20} y={y + 5} className="tr-lname" fill={l.color}>{l.name}</text>
								<text x={20} y={y + 22} className="tr-lsub">{l.games.length} station{l.games.length === 1 ? '' : 's'}</text>
								{pts.length > 1 && <polyline points={pts.map((p) => p.join(',')).join(' ')} stroke={l.color} strokeWidth="9" fill="none" strokeLinejoin="round" strokeLinecap="round" className="tr-track" />}
								{l.stops.map((g, k) => {
									const [x, yy] = pts[k];
									const inter = (count.get(g.appid) ?? 0) > 1;
									const lit = hover === g.appid || sel?.appid === g.appid || hits.has(g.appid);
									const term = k === 0 || k === pts.length - 1;
									return (
										<g key={g.appid} data-appid={g.appid} className={'tr-stn' + (lit ? ' lit' : '') + (found && !hits.has(g.appid) ? ' dim' : '')} transform={`translate(${x} ${yy})`}
											onMouseEnter={() => setHover(g.appid)} onMouseLeave={() => setHover(null)} onClick={() => select(g.appid)}>
											<rect x="-30" y="-58" width="60" height="78" fill="transparent" />
											{inter || term ? <circle r={inter ? 9 : 7} fill="#fff" stroke={inter ? '#111' : l.color} strokeWidth="3.5" /> : <rect x="-2.5" y="-14" width="5" height="9" fill={l.color} />}
											{!g.installed && <circle r="2.5" cy={inter || term ? 0 : 20} fill="#999" />}
											<text transform="translate(4 -16) rotate(-38)" className="tr-name">{g.name.length > 26 ? g.name.slice(0, 25) + '…' : g.name}</text>
										</g>
									);
								})}
								{more > 0 && <g className="tr-more" transform={`translate(${X0 + pts.length * STEP - 30} ${y + yOff(pts.length - 1)})`} onClick={() => setFull({ ...full, [l.id]: true })}>
									<rect x="0" y="-13" width="118" height="26" rx="13" fill={l.color} /><text x="59" y="5" textAnchor="middle">+{more} stations →</text></g>}
							</g>
						);
					})}
				</svg>
				<div className="tr-key"><b>Key</b><span><i className="i" />Interchange (in several collections)</span><span><i className="t" />Station</span><span><i className="u" />Not installed</span></div>
			</div>
			{sel && <Board key={sel.appid} g={sel} lines={lines} close={() => select(null)} />}
		</AltPage>
	);
}

export const transitCss = `
html.kestrel[data-ui="transit"] { --k-ink: #F4F3EE; --k-s1: #FFFFFF; --k-s2: #F0EFE9; --k-s3: #E2E0D8; --k-s4: #CFCCC0; --k-line: rgba(0,0,0,.12); --k-line-2: rgba(0,0,0,.22);
	--k-fg: #111; --k-fg-2: #3A3A3A; --k-fg-3: #777; --k-accent: #1B2A49; --k-accent-2: #2A44D0; --k-on-accent: #FFF; --k-a10: rgba(27,42,73,.08); --k-a20: rgba(27,42,73,.15); --k-a40: rgba(27,42,73,.35);
	--tr-font: "Bahnschrift", "Segoe UI", sans-serif; }
html.kestrel[data-ui="transit"] .k-top { background: #1B2A49; border-bottom: 0; --k-fg: #fff; --k-fg-2: #E0E6FF; --k-fg-3: #B8C2F0; --k-s2: rgba(255,255,255,.14); }
html.kestrel[data-ui="transit"] .tr-search { background: #fff; --k-fg: #111; --k-fg-3: #666; }
.tr-brand { display: flex; align-items: center; gap: 10px; font: 600 19px var(--tr-font); letter-spacing: .04em; color: #fff; }
.tr-mark { position: relative; display: flex; align-items: center; justify-content: space-between; width: 30px; height: 30px; padding: 0 5px; border-radius: 8px; background: #F2C230; }
.tr-mark::before { content: ""; position: absolute; left: 8px; right: 8px; top: 50%; height: 3px; margin-top: -1.5px; background: #1B2A49; transform: rotate(-30deg); }
.tr-mark i { position: relative; width: 7px; height: 7px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #1B2A49; }
.tr-mark i:first-child { margin-top: 8px; } .tr-mark i:last-child { margin-top: -8px; }
.tr-mark.sm { width: 24px; height: 24px; padding: 0 4px; border-radius: 6px; }
.tr-stage { background: #F4F3EE; }
.tr-map { position: absolute; inset: 0; overflow: auto; background: #F4F3EE radial-gradient(rgba(0,0,0,.05) 1px, transparent 1.4px) 0 0 / 22px 22px; }
.tr-map::-webkit-scrollbar { width: 12px; height: 12px; } .tr-map::-webkit-scrollbar-thumb { background: #CFCCC0; border-radius: 6px; } .tr-map::-webkit-scrollbar-corner { background: transparent; }
.tr-svg { display: block; font-family: var(--tr-font); }
.tr-line { animation: k-fade 600ms both; }
.tr-track { stroke-dasharray: 6000; stroke-dashoffset: 6000; animation: tr-draw 1.6s var(--k-out) forwards; animation-delay: inherit; }
@keyframes tr-draw { to { stroke-dashoffset: 0; } }
.tr-lname { font: 700 15px var(--tr-font); } .tr-lsub { font: 12px var(--tr-font); fill: #777; }
.tr-lname { paint-order: stroke; stroke: #F4F3EE; stroke-width: 4px; }
.tr-stn { cursor: pointer; transition: opacity .2s; }
.tr-name { font: 500 12.5px var(--tr-font); fill: #1A1A1A; paint-order: stroke; stroke: #F4F3EE; stroke-width: 3px; transition: font-size .15s; }
.tr-stn:hover .tr-name, .tr-stn.lit .tr-name { font-weight: 800; fill: #1B2A49; }
.tr-stn.lit circle { stroke: #1B2A49; } .tr-stn.lit rect[fill]:not([fill="transparent"]) { fill: #1B2A49; }
.tr-stn.lit { filter: drop-shadow(0 0 6px rgba(27,42,73,.45)); }
.tr-map.searching .tr-stn.dim { opacity: .2; }
.tr-more { cursor: pointer; } .tr-more text { font: 700 12px var(--tr-font); fill: #fff; } .tr-more:hover rect { filter: brightness(1.15); }
.tr-key { position: sticky; left: 16px; bottom: 16px; display: inline-flex; gap: 16px; align-items: center; margin: 0 16px 16px; padding: 10px 16px; background: #fff; border: 2px solid #111; font: 13px var(--tr-font); color: #222; }
.tr-key b { font-weight: 800; } .tr-key span { display: flex; align-items: center; gap: 6px; }
.tr-key i { display: inline-block; } .tr-key .i { width: 14px; height: 14px; border-radius: 50%; border: 3px solid #111; } .tr-key .t { width: 5px; height: 10px; background: #E5484D; } .tr-key .u { width: 6px; height: 6px; border-radius: 50%; background: #999; }
.tr-board { position: absolute; right: 18px; bottom: 18px; width: 420px; max-height: calc(100% - 36px); overflow-y: auto; z-index: 6; padding: 0 0 16px; background: #0B0B0B; border-radius: 6px; box-shadow: 0 20px 40px -10px rgba(0,0,0,.6); animation: tr-up 400ms var(--k-out) both; }
@keyframes tr-up { from { transform: translateY(40px); opacity: 0; } }
.tr-board header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #1B2A49; color: #fff; border-radius: 6px 6px 0 0; }
.tr-board header b { flex: 1; min-width: 0; font: 700 16px var(--tr-font); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tr-board header button { width: 28px; height: 28px; font: 20px/1 var(--k-text); color: #fff; border-radius: 4px; } .tr-board header button:hover { background: rgba(255,255,255,.15); }
.tr-dots { margin: 12px 14px 6px; padding: 10px 12px; border-radius: 4px; background: #000; box-shadow: inset 0 0 0 2px #222; font: 600 15px "Cascadia Mono", Consolas, monospace; color: #FFB000; text-shadow: 0 0 6px rgba(255,176,0,.55);
	background-image: radial-gradient(rgba(255,176,0,.05) 1px, transparent 1.2px); background-size: 4px 4px; }
.tr-dots div { display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; padding: 3px 0; }
.tr-dots b { font-weight: 600; } .tr-dots em { font-style: normal; }
.tr-dots div:first-child { animation: tr-blink 1.4s steps(2) infinite; } @keyframes tr-blink { 50% { opacity: .55; } }
.tr-serv { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 10px 14px; font: 13px var(--tr-font); color: #ccc; }
.tr-serv span { padding: 2px 8px; border-radius: 3px; font: 700 12px var(--tr-font); }
.tr-go { display: block; width: calc(100% - 28px); margin: 6px 14px 4px; height: 42px; border-radius: 4px; background: #F2C230 !important; color: #111; font: 800 15px var(--tr-font); }
.tr-go:hover { background: #F7D35E !important; }
.tr-actions { margin: 4px 8px 0; } .tr-actions button { color: #ddd !important; } .tr-actions button:hover { background: #1C1C1C !important; color: #fff !important; }
`;

// INDEX — Swiss typography. The whole library set as an A–Z index in strict columns: name and hours, nothing else.
// A letter rail jumps through the alphabet, hovering an entry shows its art in a fixed plate, and choosing one sets
// a poster: an enormous hour count, the name, the facts on a grid, and Play.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatBytes, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, gameCommands, useSelectedGame } from './common';

const letterOf = (g: Game) => { const c = g.sortName.trim()[0]?.toUpperCase() ?? '#'; return c >= 'A' && c <= 'Z' ? c : '#'; };
const ALPHA = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const hrs = (m: number) => (m >= 6000 ? Math.round(m / 60).toLocaleString() : (m / 60).toFixed(m < 600 ? 1 : 0));
type Mode = 'az' | 'hours' | 'recent';

function Poster({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<div className="ix-poster">
			<button className="ix-back" onClick={close}>← Index</button>
			<div className="ix-p-grid">
				<div className="ix-p-num">{hrs(g.minutes)}<small>hours</small></div>
				<h1>{g.name}</h1>
				<div className="ix-p-art"><Art g={g} kind="hero" /></div>
				<dl className="ix-p-facts">
					<div><dt>Last played</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : '—'}</dd></div>
					<div><dt>Added</dt><dd>{g.added ? new Date(g.added * 1000).getFullYear() : '—'}</dd></div>
					<div><dt>Achievements</dt><dd>{d.achievements.total ? `${d.achievements.achieved}/${d.achievements.total}` : '—'}</dd></div>
					<div><dt>Size</dt><dd>{formatBytes(d.disk || g.sizeOnDisk) || '—'}</dd></div>
					<div><dt>Developer</dt><dd>{d.developer || '—'}</dd></div>
					<div><dt>Status</dt><dd>{g.installed ? 'Installed' : 'Not installed'}</dd></div>
				</dl>
				<div className="ix-p-do">
					<button className="ix-play" onClick={go.run}>{g.installed ? 'Play' : 'Install'}<span>→</span></button>
					<Actions g={g} className="ix-actions" />
				</div>
				{d.description[0] && <p className="ix-p-desc">{d.description[0]}</p>}
			</div>
		</div>
	);
}

export function Index() {
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const [hover, setHover] = useState<Game | null>(null);
	const [mode, setMode] = useState<Mode>('az');
	const [q, setQ] = useState('');
	const [installedOnly, setInstalledOnly] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const groups = useMemo(() => {
		const t = q.trim().toLowerCase();
		let gs = library.filter((g) => (!t || g.name.toLowerCase().includes(t)) && (!installedOnly || g.installed));
		if (mode === 'az') {
			gs = [...gs].sort((a, b) => a.sortName.localeCompare(b.sortName));
			const m = new Map<string, Game[]>();
			for (const g of gs) m.set(letterOf(g), [...(m.get(letterOf(g)) ?? []), g]);
			return ALPHA.filter((l) => m.has(l)).map((l) => ({ key: l, label: l, games: m.get(l)! }));
		}
		if (mode === 'hours') {
			gs = [...gs].sort((a, b) => b.minutes - a.minutes);
			const bands: [string, (g: Game) => boolean][] = [['500+', (g) => g.minutes >= 30000], ['100+', (g) => g.minutes >= 6000 && g.minutes < 30000], ['10+', (g) => g.minutes >= 600 && g.minutes < 6000], ['1+', (g) => g.minutes >= 60 && g.minutes < 600], ['<1', (g) => g.minutes > 0 && g.minutes < 60], ['0', (g) => !g.minutes]];
			return bands.map(([label, f]) => ({ key: label, label, games: gs.filter(f) })).filter((b) => b.games.length);
		}
		gs = [...gs].filter((g) => g.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed);
		const m = new Map<string, Game[]>();
		for (const g of gs) { const y = String(new Date(g.lastPlayed * 1000).getFullYear()); m.set(y, [...(m.get(y) ?? []), g]); }
		return [...m.entries()].map(([y, games]) => ({ key: y, label: y, games }));
	}, [library, q, mode, installedOnly]);
	const total = groups.reduce((s, g) => s + g.games.length, 0);
	const jump = (k: string) => listRef.current?.querySelector(`[data-group="${k}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	const plate = hover ?? groups[0]?.games[0];
	if (sel) return <AltPage className="ix" brand={<>Index<sup>{library.length}</sup></>}><Poster key={sel.appid} g={sel} close={() => select(null)} /></AltPage>;
	return (
		<AltPage className="ix" brand={<>Index<sup>{library.length}</sup></>} search={q} onSearch={setQ} searchPlaceholder="Search">
			<div className="ix-page">
				<aside className="ix-side">
					<div className="ix-plate">{plate && <><Art key={plate.appid} g={plate} kind="capsule" /><span>{plate.name}</span></>}</div>
					<div className="ix-modes">
						{([['az', 'A–Z'], ['hours', 'Hours'], ['recent', 'Year played']] as [Mode, string][]).map(([m, l]) => <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}</button>)}
					</div>
					<label className="ix-check"><input type="checkbox" checked={installedOnly} onChange={(e) => setInstalledOnly(e.target.checked)} /><i />Installed only</label>
					<p className="ix-count"><b>{total}</b> entries</p>
				</aside>
				<nav className="ix-rail">{groups.map((g) => <button key={g.key} onClick={() => jump(g.key)}>{g.label}</button>)}</nav>
				<div className="ix-list" ref={listRef}>
					{groups.map((grp) => (
						<section key={grp.key} data-group={grp.key} className="ix-group">
							<h2>{grp.label}</h2>
							<ol>{grp.games.map((g) => (
								<li key={g.appid}>
									<button data-appid={g.appid} className={g.installed ? 'inst' : ''} onMouseEnter={() => setHover(g)} onFocus={() => setHover(g)} onClick={() => select(g.appid)}>
										<span className="ix-n">{g.name}</span><span className="ix-h">{g.minutes ? hrs(g.minutes) : '—'}</span>
									</button>
								</li>
							))}</ol>
						</section>
					))}
					{!groups.length && <p className="ix-none">No entries.</p>}
				</div>
			</div>
		</AltPage>
	);
}

export const indexCss = `
html.kestrel[data-ui="index"] { --k-ink: #F2F0EB; --k-s1: #FFFFFF; --k-s2: #EAE7E0; --k-s3: #DCD8CF; --k-s4: #C8C3B8; --k-line: rgba(0,0,0,.14); --k-line-2: rgba(0,0,0,.3);
	--k-fg: #111; --k-fg-2: #333; --k-fg-3: #777; --k-accent: #E30613; --k-accent-2: #FF2A36; --k-on-accent: #FFF; --k-a10: rgba(227,6,19,.08); --k-a20: rgba(227,6,19,.15); --k-a40: rgba(227,6,19,.35);
	--ix-sans: "Helvetica Neue", Helvetica, Arial, sans-serif; }
html.kestrel[data-ui="index"] .k-top { background: #F2F0EB; border-bottom: 2px solid #111; }
html.kestrel[data-ui="index"] .ix-search { border-radius: 0; background: transparent; box-shadow: inset 0 -2px #111; }
.ix-brand { font: 700 26px/1 var(--ix-sans); letter-spacing: -.04em; color: #111; } .ix-brand sup { margin-left: 4px; font: 700 12px var(--ix-sans); color: #E30613; letter-spacing: 0; }
.ix-stage { background: #F2F0EB; }
.ix-page { position: absolute; inset: 0; display: grid; grid-template-columns: 300px 48px 1fr; font-family: var(--ix-sans); color: #111; }
.ix-side { padding: 30px 26px; border-right: 2px solid #111; display: flex; flex-direction: column; gap: 22px; }
.ix-plate { position: relative; aspect-ratio: 2 / 3; background: #111; overflow: hidden; }
.ix-plate img, .ix-plate .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; animation: ix-plate 300ms var(--k-out) both; }
@keyframes ix-plate { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0); } }
.ix-plate span { position: absolute; left: 0; bottom: 0; right: 0; padding: 10px 12px; background: #E30613; color: #fff; font: 700 15px/1.15 var(--ix-sans); letter-spacing: -.01em; }
.ix-modes { display: grid; grid-template-columns: repeat(3, 1fr); border: 2px solid #111; }
.ix-modes button { height: 36px; font: 700 12.5px var(--ix-sans); color: #111; } .ix-modes button + button { border-left: 2px solid #111; }
.ix-modes button.on { background: #111 !important; color: #F2F0EB; }
.ix-check { display: flex; align-items: center; gap: 10px; font: 700 13px var(--ix-sans); cursor: pointer; }
.ix-check input { display: none; } .ix-check i { width: 18px; height: 18px; border: 2px solid #111; } .ix-check input:checked + i { background: #E30613; box-shadow: inset 0 0 0 3px #F2F0EB; }
.ix-count { margin: auto 0 0; font: 13px var(--ix-sans); } .ix-count b { display: block; font: 700 72px/0.9 var(--ix-sans); letter-spacing: -.05em; }
.ix-rail { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; border-right: 2px solid #111; overflow-y: auto; }
.ix-rail::-webkit-scrollbar { width: 0; }
.ix-rail button { width: 100%; padding: 3px 0; font: 700 12px var(--ix-sans); color: #111; } .ix-rail button:hover { background: #E30613 !important; color: #fff; }
.ix-list { overflow-y: auto; padding: 0 40px 80px; scroll-padding-top: 10px; }
.ix-list::-webkit-scrollbar { width: 8px; } .ix-list::-webkit-scrollbar-thumb { background: #111; }
.ix-group { display: grid; grid-template-columns: 140px 1fr; border-top: 2px solid #111; padding: 14px 0 26px; animation: k-fade 400ms both; }
.ix-group h2 { margin: 0; font: 700 96px/0.8 var(--ix-sans); letter-spacing: -.06em; color: #111; position: sticky; top: 14px; align-self: start; }
.ix-group:nth-child(3n+2) h2 { color: #E30613; }
.ix-group ol { margin: 0; padding: 0; list-style: none; columns: 3 260px; column-gap: 34px; column-rule: 1px solid rgba(0,0,0,.15); }
.ix-group li { break-inside: avoid; }
.ix-group li button { width: 100%; display: flex; align-items: baseline; gap: 10px; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,.12); text-align: left; font: 14px/1.3 var(--ix-sans); color: #555; }
.ix-group li button.inst { color: #111; font-weight: 700; }
.ix-group li button:hover, .ix-group li button:focus-visible { color: #E30613; outline: none; }
.ix-n { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ix-h { font: 700 12px var(--ix-sans); font-variant-numeric: tabular-nums; color: #999; } .ix-group li button:hover .ix-h { color: #E30613; }
.ix-none { margin-top: 40px; font: 700 24px var(--ix-sans); }
.ix-poster { position: absolute; inset: 0; overflow-y: auto; padding: 24px 48px 60px; background: #F2F0EB; font-family: var(--ix-sans); color: #111; animation: ix-in 450ms var(--k-out) both; }
@keyframes ix-in { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0); } }
.ix-back { font: 700 14px var(--ix-sans); color: #111; border-bottom: 2px solid #111; padding-bottom: 2px; } .ix-back:hover { color: #E30613; border-color: #E30613; }
.ix-p-grid { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 24px; margin-top: 20px; }
.ix-p-num { grid-column: 1 / -1; font: 700 clamp(120px, 22vw, 340px)/0.78 var(--ix-sans); letter-spacing: -.07em; color: #E30613; }
.ix-p-num small { margin-left: 18px; font-size: 22px; letter-spacing: 0; color: #111; }
.ix-p-grid h1 { grid-column: 1 / 9; margin: 26px 0 20px; padding-top: 14px; border-top: 2px solid #111; font: 700 clamp(36px, 4.4vw, 68px)/0.95 var(--ix-sans); letter-spacing: -.04em; }
.ix-p-art { grid-column: 9 / -1; grid-row: span 2; margin-top: 26px; aspect-ratio: 4 / 3; overflow: hidden; } .ix-p-art img, .ix-p-art .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.15); transition: filter .5s; }
.ix-p-art:hover img { filter: none; }
.ix-p-facts { grid-column: 1 / 9; display: grid; grid-template-columns: repeat(3, 1fr); margin: 0; border-top: 2px solid #111; }
.ix-p-facts div { padding: 10px 0 14px; border-bottom: 1px solid rgba(0,0,0,.2); } .ix-p-facts dt { font: 700 11px var(--ix-sans); text-transform: uppercase; letter-spacing: .08em; color: #777; } .ix-p-facts dd { margin: 4px 0 0; font: 700 20px/1.15 var(--ix-sans); letter-spacing: -.02em; }
.ix-p-do { grid-column: 1 / 9; display: flex; align-items: flex-start; gap: 30px; margin-top: 24px; }
.ix-play { display: flex; align-items: center; justify-content: space-between; gap: 40px; height: 64px; padding: 0 24px; background: #E30613 !important; color: #fff; font: 700 28px var(--ix-sans); letter-spacing: -.03em; transition: padding .3s var(--k-out); }
.ix-play:hover { padding-right: 14px; background: #111 !important; }
.ix-actions button { font-family: var(--ix-sans) !important; font-weight: 700 !important; color: #111 !important; border-radius: 0 !important; } .ix-actions button:hover { background: #111 !important; color: #fff !important; }
.ix-p-desc { grid-column: 1 / 9; margin: 24px 0 0; font: 17px/1.45 var(--ix-sans); max-width: 70ch; }
`;

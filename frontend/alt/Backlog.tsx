// BACKLOG — the library as a kanban board. Games sit in columns by how they have actually been played (never
// started, playing, on hold, deep dives); tabs swap the board to a collection, and a card opens as a ticket.
import { useMemo, useState, type CSSProperties } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const DAY = 86400;
const RECENT = 14 * DAY;
type Col = { id: string; name: string; hint: string; test: (g: Game, now: number) => boolean };
const COLS: Col[] = [
	{ id: 'new', name: 'Never started', hint: 'Not opened yet', test: (g) => !g.minutes },
	{ id: 'now', name: 'Playing', hint: 'Opened in the last two weeks', test: (g, now) => g.minutes > 0 && now - g.lastPlayed < RECENT },
	{ id: 'hold', name: 'On hold', hint: 'Started, under 20 hours, set aside', test: (g, now) => g.minutes > 0 && g.minutes < 1200 && now - g.lastPlayed >= RECENT },
	{ id: 'deep', name: 'Deep dives', hint: '20 hours or more, set aside', test: (g, now) => g.minutes >= 1200 && now - g.lastPlayed >= RECENT },
];
const LABEL_HUES = [210, 340, 150, 35, 275, 180, 10, 95];
const hue = (s: string) => LABEL_HUES[[...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % LABEL_HUES.length];
const colOf = (g: Game, now: number) => COLS.find((c) => c.test(g, now)) ?? COLS[0];

function Ticket({ g, labels, close }: { g: Game; labels: string[]; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	const col = colOf(g, Date.now() / 1000);
	return (
		<aside className="bl-ticket" role="dialog" aria-label={g.name}>
			<header><span className="bl-key">BL-{g.appid}</span><button className="bl-x" onClick={close} aria-label="Close">×</button></header>
			<h2>{g.name}</h2>
			<div className="bl-hero"><Art g={g} kind="hero" /></div>
			<button className="bl-go" onClick={go.run}>{g.installed ? '▶ Play' : '⤓ Install'}</button>
			<dl className="bl-fields">
				<dt>Status</dt><dd><span className={'bl-pill ' + col.id}>{col.name}</span></dd>
				<dt>Assignee</dt><dd>You</dd>
				<dt>Time logged</dt><dd>{formatPlaytime(g.minutes)}{g.minutes2w ? ` (${formatPlaytime(g.minutes2w)} this fortnight)` : ''}</dd>
				<dt>Last activity</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'None'}</dd>
				<dt>Created</dt><dd>{g.added ? new Date(g.added * 1000).toLocaleDateString() : 'Unknown'}</dd>
				<dt>Subtasks</dt><dd>{d.achievements.total ? <><i className="bl-sub"><i style={{ width: `${(d.achievements.achieved / d.achievements.total) * 100}%` }} /></i>{d.achievements.achieved}/{d.achievements.total} achievements</> : 'None'}</dd>
				<dt>Labels</dt><dd className="bl-labels">{labels.length ? labels.map((l) => <span key={l} style={{ '--h': hue(l) } as CSSProperties}>{l}</span>) : 'None'}</dd>
				<dt>Reporter</dt><dd>{d.developer || '—'}</dd>
			</dl>
			{d.description[0] && <section className="bl-desc"><h3>Description</h3><p>{d.description[0]}</p></section>}
			<Actions g={g} className="bl-actions" />
		</aside>
	);
}

function Card({ g, labels, onOpen, on }: { g: Game; labels: string[]; onOpen: () => void; on: boolean }) {
	return (
		<button className={'bl-card' + (on ? ' on' : '')} data-appid={g.appid} onClick={onOpen}>
			<span className="bl-thumb"><Art g={g} kind="header" /></span>
			<b>{g.name}</b>
			<span className="bl-meta">
				<span className="bl-key">BL-{g.appid}</span>
				{g.installed && <span className="bl-chip inst">Installed</span>}
				{g.busy && <span className="bl-chip busy">{g.status}</span>}
				<span className="bl-time">{g.minutes ? formatPlaytime(g.minutes) : '0 h'}</span>
			</span>
			{labels.length > 0 && <span className="bl-labels">{labels.slice(0, 2).map((l) => <span key={l} style={{ '--h': hue(l) } as CSSProperties}>{l}</span>)}</span>}
		</button>
	);
}

export function Backlog() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const named = islands.filter((i) => i.id !== 'uncategorized');
	const [sel, select] = useSelectedGame();
	const [board, setBoard] = useState('all');
	const [q, setQ] = useState('');
	const [more, setMore] = useState<Record<string, boolean>>({});
	const found = useSearch(q);
	const labelsOf = useMemo(() => {
		const m = new Map<number, string[]>();
		for (const i of named) for (const g of i.games) m.set(g.appid, [...(m.get(g.appid) ?? []), i.name]);
		return m;
	}, [named]);
	const now = Date.now() / 1000;
	const games = found ?? (board === 'all' ? library : islands.find((i) => i.id === board)?.games ?? library);
	const cols = useMemo(() => COLS.map((c) => ({ ...c, games: games.filter((g) => colOf(g, now) === c).sort((a, b) => b.lastPlayed - a.lastPlayed || a.sortName.localeCompare(b.sortName)) })), [games]);
	const LIMIT = 40;
	return (
		<AltPage className="bl" brand={<><i className="bl-logo" />Backlog</>} search={q} onSearch={setQ} searchPlaceholder="Filter cards">
			<div className={'bl-wrap' + (sel ? ' has-ticket' : '')}>
				<nav className="bl-boards">
					<button className={board === 'all' && !found ? 'on' : ''} onClick={() => { setBoard('all'); setQ(''); }}>All games <em>{library.length}</em></button>
					{islands.map((i) => <button key={i.id} className={board === i.id && !found ? 'on' : ''} onClick={() => { setBoard(i.id); setQ(''); }}>{i.name} <em>{i.games.length}</em></button>)}
				</nav>
				<div className="bl-board">
					{cols.map((c) => (
						<section key={c.id} className={'bl-col ' + c.id}>
							<header><b>{c.name}</b><em>{c.games.length}</em><span>{c.hint}</span></header>
							<div className="bl-cards">
								{(more[c.id] ? c.games : c.games.slice(0, LIMIT)).map((g) => <Card key={g.appid} g={g} labels={board === 'all' ? labelsOf.get(g.appid) ?? [] : []} on={sel?.appid === g.appid} onOpen={() => select(g.appid)} />)}
								{c.games.length > LIMIT && !more[c.id] && <button className="bl-more" onClick={() => setMore({ ...more, [c.id]: true })}>Show {c.games.length - LIMIT} more</button>}
								{!c.games.length && <p className="bl-empty">Nothing here</p>}
							</div>
						</section>
					))}
				</div>
				{sel && <Ticket key={sel.appid} g={sel} labels={labelsOf.get(sel.appid) ?? []} close={() => select(null)} />}
			</div>
		</AltPage>
	);
}

export const backlogCss = `
html.kestrel[data-ui="backlog"] { --k-ink: #F4F5F7; --k-s1: #FFFFFF; --k-s2: #EBECF0; --k-s3: #DFE1E6; --k-s4: #C1C7D0; --k-line: rgba(9,30,66,.12); --k-line-2: rgba(9,30,66,.22);
	--k-fg: #172B4D; --k-fg-2: #42526E; --k-fg-3: #6B778C; --k-accent: #0C66E4; --k-accent-2: #388BFF; --k-on-accent: #FFF; --k-a10: rgba(12,102,228,.08); --k-a20: rgba(12,102,228,.16); --k-a40: rgba(12,102,228,.35); }
html.kestrel[data-ui="backlog"] .k-top { background: #FFFFFF; border-bottom: 1px solid rgba(9,30,66,.12); }
.bl-brand { display: flex; align-items: center; gap: 9px; font: 700 17px var(--k-display); color: #172B4D; }
.bl-logo { width: 22px; height: 22px; border-radius: 5px; background: linear-gradient(90deg, #0C66E4 0 30%, transparent 30% 35%, #579DFF 35% 65%, transparent 65% 70%, #85B8FF 70%); clip-path: inset(0 0 0 0 round 5px); }
.bl-stage { background: #F4F5F7; }
.bl-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
.bl-boards { display: flex; gap: 4px; padding: 10px 20px 0; overflow-x: auto; flex: none; border-bottom: 1px solid var(--k-line); background: #fff; }
.bl-boards::-webkit-scrollbar { height: 0; }
.bl-boards button { flex: none; padding: 8px 12px 10px; font: 600 13px var(--k-text); color: #42526E; border-bottom: 2px solid transparent; }
.bl-boards button em { font-style: normal; margin-left: 4px; padding: 1px 6px; border-radius: 99px; background: #EBECF0; font-size: 11px; }
.bl-boards button:hover { color: #0C66E4; }
.bl-boards button.on { color: #0C66E4; border-bottom-color: #0C66E4; }
.bl-board { flex: 1; min-height: 0; display: flex; gap: 14px; padding: 16px 20px; overflow-x: auto; transition: padding-right .35s var(--k-out); }
.bl-wrap.has-ticket .bl-board { padding-right: 500px; }
.bl-col { flex: 1 0 280px; max-width: 360px; display: flex; flex-direction: column; min-height: 0; border-radius: 10px; background: #EBECF0; animation: k-rise 450ms var(--k-out) both; }
.bl-col:nth-child(2) { animation-delay: 60ms; } .bl-col:nth-child(3) { animation-delay: 120ms; } .bl-col:nth-child(4) { animation-delay: 180ms; }
.bl-col > header { display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: 4px 8px; padding: 12px 12px 8px; }
.bl-col > header b { font: 700 12px var(--k-text); letter-spacing: .06em; text-transform: uppercase; color: #42526E; }
.bl-col > header em { font: 700 11px var(--k-text); font-style: normal; padding: 1px 7px; border-radius: 99px; background: #DFE1E6; color: #42526E; justify-self: start; }
.bl-col > header span { grid-column: 1 / -1; font: 12px var(--k-text); color: #6B778C; }
.bl-col.now > header b { color: #0C66E4; } .bl-col.deep > header b { color: #6E5DC6; } .bl-col.hold > header b { color: #B65C02; }
.bl-cards { flex: 1; min-height: 0; overflow-y: auto; padding: 0 8px 10px; display: flex; flex-direction: column; gap: 8px; }
.bl-card { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 8px; text-align: left; background: #fff; box-shadow: 0 1px 1px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31); transition: transform .2s var(--k-spring), box-shadow .2s; }
.bl-card:hover { transform: translateY(-2px) rotate(-.4deg); box-shadow: 0 8px 16px -4px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31); }
.bl-card.on { box-shadow: 0 0 0 2px #0C66E4; }
.bl-thumb { display: block; aspect-ratio: 460 / 215; border-radius: 5px; overflow: hidden; background: #DFE1E6; }
.bl-thumb img, .bl-thumb .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.bl-card b { font: 600 14px/1.3 var(--k-text); color: #172B4D; }
.bl-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font: 12px var(--k-text); color: #6B778C; }
.bl-key { font: 600 11.5px var(--k-text); color: #6B778C; }
.bl-time { margin-left: auto; padding: 1px 7px; border-radius: 99px; background: #EBECF0; font-weight: 700; color: #42526E; }
.bl-chip { padding: 1px 6px; border-radius: 3px; font: 700 10.5px var(--k-text); text-transform: uppercase; }
.bl-chip.inst { background: #DCFFF1; color: #216E4E; } .bl-chip.busy { background: #FFF7D6; color: #7F5F01; }
.bl-labels { display: flex; flex-wrap: wrap; gap: 4px; }
.bl-labels span { padding: 1px 7px; border-radius: 3px; font: 600 11px var(--k-text); background: hsl(var(--h) 85% 92%); color: hsl(var(--h) 60% 30%); }
.bl-more { padding: 8px; border-radius: 6px; font: 600 13px var(--k-text); color: #42526E; }
.bl-more:hover { background: #DFE1E6; }
.bl-empty { margin: 8px 4px; font: 13px var(--k-text); color: #6B778C; }
.bl-ticket { position: absolute; right: 0; top: 0; bottom: 0; width: 480px; overflow-y: auto; padding: 18px 24px 28px; background: #fff; box-shadow: -12px 0 32px -8px rgba(9,30,66,.25); animation: bl-in 350ms var(--k-out) both; z-index: 3; }
@keyframes bl-in { from { transform: translateX(100%); } to { transform: none; } }
.bl-ticket header { display: flex; align-items: center; justify-content: space-between; }
.bl-x { width: 32px; height: 32px; border-radius: 6px; font: 400 24px/1 var(--k-text); color: #42526E; } .bl-x:hover { background: #EBECF0; }
.bl-ticket h2 { margin: 6px 0 14px; font: 650 24px/1.2 var(--k-display); color: #172B4D; }
.bl-hero { aspect-ratio: 16 / 7; border-radius: 8px; overflow: hidden; background: #DFE1E6; }
.bl-hero img, .bl-hero .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.bl-go { margin: 14px 0 6px; height: 36px; padding: 0 16px; border-radius: 4px; background: #0C66E4 !important; color: #fff !important; font: 600 14px var(--k-text); }
.bl-go:hover { background: #0055CC !important; }
.bl-fields { display: grid; grid-template-columns: 120px 1fr; gap: 10px 12px; margin: 16px 0; font: 13.5px var(--k-text); }
.bl-fields dt { color: #6B778C; font-weight: 600; } .bl-fields dd { margin: 0; color: #172B4D; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bl-pill { padding: 2px 8px; border-radius: 3px; font: 700 11px var(--k-text); text-transform: uppercase; background: #DFE1E6; color: #42526E; }
.bl-pill.now { background: #E9F2FF; color: #0055CC; } .bl-pill.deep { background: #F3F0FF; color: #5E4DB2; } .bl-pill.hold { background: #FFF3EB; color: #A54800; }
.bl-sub { width: 110px; height: 6px; border-radius: 3px; background: #EBECF0; overflow: hidden; } .bl-sub i { display: block; height: 100%; background: #22A06B; }
.bl-desc h3 { margin: 0 0 6px; font: 700 14px var(--k-text); color: #172B4D; } .bl-desc p { margin: 0 0 14px; font: 14px/1.55 var(--k-text); color: #42526E; }
.bl-actions { border-top: 1px solid var(--k-line); padding-top: 10px; }
`;

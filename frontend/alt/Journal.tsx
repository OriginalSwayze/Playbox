// JOURNAL — a handwritten notebook of your play. Each spread is two lined pages of diary entries (newest first) with
// taped-in pictures; the contents page lists chapters (your collections), pages turn with a flip, and an entry opens
// as a full page with Play written in marker.
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useLibraryLists, useSearch, useSelectedGame } from './common';

const PER_PAGE = 3;
const day = (u: number) => new Date(u * 1000).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
/** A diary line written from the real numbers. */
function note(g: Game): string {
	const h = g.minutes / 60;
	if (!g.minutes) return g.installed ? 'Installed it. Haven\'t started yet — soon.' : 'Still waiting on the shelf. One day.';
	const recent = g.minutes2w ? ` ${formatPlaytime(g.minutes2w)} of it in the last two weeks.` : '';
	if (h >= 300) return `${formatPlaytime(g.minutes)} now. At this point it's less a game and more a place I live.${recent}`;
	if (h >= 50) return `Up to ${formatPlaytime(g.minutes)}. Still finding reasons to go back.${recent}`;
	if (h >= 5) return `${formatPlaytime(g.minutes)} in. Getting into it.${recent}`;
	return `Only ${formatPlaytime(g.minutes)} so far — first impressions.${recent}`;
}
const tilt = (n: number) => ((n * 7919) % 7) - 3;

function Entry({ g, onOpen }: { g: Game; onOpen: () => void }) {
	return (
		<button className="jr-entry" data-appid={g.appid} onClick={onOpen}>
			<span className="jr-date">{g.lastPlayed ? day(g.lastPlayed) : g.added ? `Added ${day(g.added)}` : 'Undated'}</span>
			<span className="jr-photo" style={{ transform: `rotate(${tilt(g.appid)}deg)` }}><Art g={g} kind="header" /><i className="jr-tape" /></span>
			<b>{g.name}</b>
			<span className="jr-note">{note(g)}</span>
		</button>
	);
}

function FullPage({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<div className="jr-dim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<article className="jr-full">
				<span className="jr-date">{g.lastPlayed ? `Last played ${day(g.lastPlayed)}` : 'Not played yet'}</span>
				<h2>{g.name}</h2>
				<div className="jr-big" style={{ transform: `rotate(${tilt(g.appid) / 2}deg)` }}><Art g={g} kind="hero" /><i className="jr-tape" /><i className="jr-tape r" /></div>
				<p className="jr-hand">{note(g)}</p>
				{d.achievements.total > 0 && <p className="jr-hand">Ticked off {d.achievements.achieved} of {d.achievements.total} achievements{d.achievements.achieved === d.achievements.total ? ' — all of them!' : '.'}</p>}
				{d.description[0] && <p className="jr-clip"><em>From the box:</em> {d.description[0].slice(0, 300)}{d.description[0].length > 300 ? '…' : ''}</p>}
				<div className="jr-foot">
					<button className="jr-marker" onClick={go.run}>{g.installed ? '→ play it' : '→ install it'}</button>
					<Actions g={g} className="jr-actions" />
				</div>
				<button className="jr-close" onClick={close}>close the page</button>
			</article>
		</div>
	);
}

export function Journal() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [chapter, setChapter] = useState('diary');
	const [spread, setSpread] = useState(0);
	const [dir, setDir] = useState(1);
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const chapters = useMemo(() => [
		{ id: 'diary', name: 'Diary', games: lists.recent },
		{ id: 'someday', name: 'Someday', games: [...lists.unplayed].sort((a, b) => b.added - a.added) },
		...islands.map((i) => ({ id: i.id, name: i.name, games: [...i.games].sort((a, b) => b.lastPlayed - a.lastPlayed) })),
	], [lists, islands]);
	const cur = found ? { id: 'q', name: `Looking for “${q.trim()}”`, games: found } : chapters.find((c) => c.id === chapter) ?? chapters[0];
	// the first spread's left page is the contents; after that both pages hold entries
	const entries = cur.games;
	const spreads = 1 + Math.ceil(Math.max(0, entries.length - PER_PAGE) / (PER_PAGE * 2));
	const left = spread === 0 ? null : entries.slice(PER_PAGE + (spread - 1) * PER_PAGE * 2, PER_PAGE + (spread - 1) * PER_PAGE * 2 + PER_PAGE);
	const right = spread === 0 ? entries.slice(0, PER_PAGE) : entries.slice(PER_PAGE + (spread - 1) * PER_PAGE * 2 + PER_PAGE, PER_PAGE + spread * PER_PAGE * 2);
	const turn = (n: number) => { const t = Math.max(0, Math.min(spreads - 1, n)); setDir(t >= spread ? 1 : -1); setSpread(t); };
	useEffect(() => setSpread(0), [cur.id]);
	const pageNo = (side: 0 | 1) => spread * 2 + side + 1;
	return (
		<AltPage className="jr" brand="my game journal" search={q} onSearch={setQ} searchPlaceholder="Look something up">
			<div className="jr-desk">
				<div className="jr-book">
					<div className="jr-tabs">{chapters.filter((c) => c.games.length).map((c, i) => <button key={c.id} className={!found && c.id === cur.id ? 'on' : ''} style={{ '--h': (i * 47) % 360 } as CSSProperties} onClick={() => { setQ(''); setChapter(c.id); }}>{c.name}</button>)}</div>
					<div className={'jr-spread ' + (dir > 0 ? 'fwd' : 'back')} key={cur.id + ':' + spread}>
						<section className="jr-page l">
							{left ? left.map((g) => <Entry key={g.appid} g={g} onOpen={() => select(g.appid)} />) : (
								<div className="jr-contents">
									<h1>{cur.name}</h1>
									<p className="jr-hand">{cur.id === 'diary' ? `Everything I've played lately — ${entries.length} entries.` : cur.id === 'someday' ? `Games I own but haven't started: ${entries.length}.` : `${entries.length} games in this chapter.`}</p>
									<h3>Contents</h3>
									<ol>{chapters.filter((c) => c.games.length).map((c) => <li key={c.id}><button onClick={() => { setQ(''); setChapter(c.id); }}>{c.name}</button><i /><span>{c.games.length}</span></li>)}</ol>
								</div>
							)}
							<span className="jr-num">{pageNo(0)}</span>
						</section>
						<i className="jr-spine" />
						<section className="jr-page r">
							{right.map((g) => <Entry key={g.appid} g={g} onOpen={() => select(g.appid)} />)}
							{!right.length && <p className="jr-hand jr-blank">(the rest of this page is blank)</p>}
							<span className="jr-num">{pageNo(1)}</span>
						</section>
					</div>
					<div className="jr-turns">
						<button disabled={spread === 0} onClick={() => turn(spread - 1)}>← previous page</button>
						<span>spread {spread + 1} of {spreads}</span>
						<button disabled={spread >= spreads - 1} onClick={() => turn(spread + 1)}>next page →</button>
					</div>
				</div>
			</div>
			{sel && <FullPage key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const journalCss = `
html.kestrel[data-ui="journal"] { --k-ink: #3B2E25; --k-s1: #FFFDF6; --k-s2: #F6F0E0; --k-s3: #EADFC6; --k-s4: #D9CBA9; --k-line: rgba(60,40,20,.14); --k-line-2: rgba(60,40,20,.26);
	--k-fg: #2A2420; --k-fg-2: #4B4038; --k-fg-3: #8A7B6C; --k-accent: #2B5BB8; --k-accent-2: #4A78D0; --k-on-accent: #FFF; --k-a10: rgba(43,91,184,.08); --k-a20: rgba(43,91,184,.16); --k-a40: rgba(43,91,184,.35);
	--jr-hand: "Segoe Print", "Ink Free", cursive; --jr-ink: #1F3F8A; }
html.kestrel[data-ui="journal"] .k-top { background: #3B2E25; border-bottom: 0; --k-fg: #F6F0E0; --k-fg-2: #E2D6C0; --k-fg-3: #B8A890; --k-s2: rgba(255,255,255,.1); }
html.kestrel[data-ui="journal"] .jr-search { background: #FFFDF6; --k-fg: #2A2420; --k-fg-3: #8A7B6C; }
.jr-brand { font: 700 20px var(--jr-hand); color: #F6F0E0; }
.jr-stage { background: #3B2E25; }
.jr-desk { position: absolute; inset: 0; overflow: auto; display: flex; justify-content: center; padding: 34px 30px 30px;
	background: radial-gradient(70% 60% at 50% 40%, #5A4535, #3B2E25 70%), repeating-linear-gradient(95deg, rgba(0,0,0,.05) 0 3px, transparent 3px 14px); }
.jr-book { position: relative; width: min(1320px, 100%); display: flex; flex-direction: column; }
.jr-tabs { position: absolute; right: -14px; top: 30px; bottom: 80px; display: flex; flex-direction: column; gap: 4px; z-index: 1; overflow: hidden; }
.jr-tabs button { padding: 6px 12px 6px 20px; max-width: 180px; border-radius: 0 8px 8px 0; text-align: left; font: 600 13px var(--jr-hand); color: #2A2420; background: hsl(var(--h) 60% 80%) !important; box-shadow: 2px 2px 4px rgba(0,0,0,.25); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transform: translateX(10px); transition: transform .2s var(--k-out); }
.jr-tabs button:hover, .jr-tabs button.on { transform: translateX(22px); }
.jr-tabs button.on { font-weight: 800; }
.jr-spread { position: relative; flex: 1; min-height: 640px; display: grid; grid-template-columns: 1fr 26px 1fr; margin-right: 160px; border-radius: 6px; background: #6B3F22; padding: 10px; box-shadow: 0 30px 50px -20px rgba(0,0,0,.7); perspective: 2000px; }
.jr-spread.fwd .jr-page.r { animation: jr-flip-in 600ms var(--k-out) both; transform-origin: left center; }
.jr-spread.back .jr-page.l { animation: jr-flip-in-l 600ms var(--k-out) both; transform-origin: right center; }
@keyframes jr-flip-in { from { transform: rotateY(-70deg); filter: brightness(.7); } to { transform: none; } }
@keyframes jr-flip-in-l { from { transform: rotateY(70deg); filter: brightness(.7); } to { transform: none; } }
.jr-page { position: relative; padding: 46px 40px 46px 70px; overflow: hidden; background-color: #FFFDF6;
	background-image: linear-gradient(90deg, transparent 54px, rgba(220,80,80,.45) 54px 56px, transparent 56px), repeating-linear-gradient(transparent 0 31px, rgba(80,130,200,.28) 31px 32px); background-position: 0 14px; }
.jr-page.l { border-radius: 4px 0 0 4px; box-shadow: inset -30px 0 30px -20px rgba(0,0,0,.25); }
.jr-page.r { border-radius: 0 4px 4px 0; box-shadow: inset 30px 0 30px -20px rgba(0,0,0,.25); }
.jr-spine { background: linear-gradient(90deg, #E6DCC4, #FFFDF6 40%, #D8CCAE); box-shadow: inset 0 0 8px rgba(0,0,0,.25); }
.jr-num { position: absolute; bottom: 14px; left: 0; right: 0; text-align: center; font: 13px var(--jr-hand); color: #8A7B6C; }
.jr-entry { display: grid; grid-template-columns: 180px 1fr; grid-template-rows: auto auto 1fr; gap: 2px 18px; width: 100%; margin-bottom: 26px; text-align: left; }
.jr-entry:hover b { text-decoration: underline wavy rgba(31,63,138,.5); }
.jr-date { grid-column: 1 / -1; font: 13px/32px var(--jr-hand); color: #B04040; }
.jr-photo { position: relative; grid-row: span 2; display: block; padding: 6px 6px 18px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,.2); transition: transform .3s var(--k-spring); }
.jr-entry:hover .jr-photo { transform: rotate(0) scale(1.04) !important; }
.jr-photo img, .jr-photo .alt-noart { width: 100%; aspect-ratio: 460 / 215; object-fit: cover; display: block; }
.jr-tape { position: absolute; top: -8px; left: 50%; width: 60px; height: 18px; margin-left: -30px; background: rgba(240,225,160,.75); box-shadow: 0 1px 2px rgba(0,0,0,.1); transform: rotate(-4deg); }
.jr-tape.r { left: auto; right: -12px; top: auto; bottom: 18px; transform: rotate(40deg); }
.jr-entry b { font: 700 19px/32px var(--jr-hand); color: var(--jr-ink); }
.jr-note, .jr-hand { font: 15px/32px var(--jr-hand); color: var(--jr-ink); }
.jr-blank { color: #A89880; }
.jr-contents h1 { margin: 0 0 4px; font: 700 34px/64px var(--jr-hand); color: var(--jr-ink); text-decoration: underline 3px rgba(176,64,64,.6); text-underline-offset: 8px; }
.jr-contents h3 { margin: 14px 0 0; font: 700 18px/32px var(--jr-hand); color: #B04040; }
.jr-contents ol { margin: 0; padding: 0 0 0 24px; } .jr-contents li { display: flex; align-items: baseline; gap: 6px; font: 15px/32px var(--jr-hand); color: var(--jr-ink); }
.jr-contents li button { font: inherit; color: inherit; text-align: left; } .jr-contents li button:hover { text-decoration: underline; }
.jr-contents li i { flex: 1; border-bottom: 2px dotted rgba(31,63,138,.35); }
.jr-turns { display: flex; justify-content: center; align-items: center; gap: 30px; margin: 16px 160px 0 0; font: 14px var(--jr-hand); color: #E2D6C0; }
.jr-turns button { padding: 8px 16px; border-radius: 6px; font: 700 15px var(--jr-hand); color: #FFFDF6; background: rgba(255,255,255,.08) !important; }
.jr-turns button:hover:not(:disabled) { background: rgba(255,255,255,.16) !important; } .jr-turns button:disabled { opacity: .3; }
.jr-dim { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 26px; background: rgba(30,22,16,.7); animation: k-fade 200ms both; }
.jr-full { position: relative; width: min(820px, 96%); max-height: 100%; overflow-y: auto; padding: 30px 46px 30px 84px; border-radius: 4px; background-color: #FFFDF6;
	background-image: linear-gradient(90deg, transparent 66px, rgba(220,80,80,.45) 66px 68px, transparent 68px), repeating-linear-gradient(transparent 0 31px, rgba(80,130,200,.28) 31px 32px); background-attachment: local; background-position: 0 14px;
	box-shadow: 0 30px 60px -20px #000; animation: jr-flip-in 500ms var(--k-out) both; transform-origin: left center; }
.jr-full h2 { margin: 0 0 12px; font: 700 32px/48px var(--jr-hand); color: var(--jr-ink); }
.jr-big { position: relative; margin: 6px 0 18px; padding: 8px 8px 26px; background: #fff; box-shadow: 0 6px 16px rgba(0,0,0,.25); }
.jr-big img, .jr-big .alt-noart { width: 100%; aspect-ratio: 16 / 7; object-fit: cover; display: block; }
.jr-clip { margin: 10px 0; padding: 10px 14px; background: #F4ECD6; border-left: 3px solid #D9CBA9; font: 14px/1.5 Georgia, serif; color: #4B4038; transform: rotate(-.4deg); }
.jr-clip em { font-weight: 700; }
.jr-foot { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 20px; margin-top: 14px; }
.jr-marker { padding: 4px 16px 8px; font: 700 28px var(--jr-hand); color: #B04040; background: linear-gradient(transparent 55%, rgba(255,230,80,.75) 55% 90%, transparent 90%) !important; transition: transform .2s var(--k-spring); }
.jr-marker:hover { transform: rotate(-2deg) scale(1.05); }
.jr-actions { display: flex; flex-wrap: wrap; } .jr-actions button { font-family: var(--jr-hand) !important; color: var(--jr-ink) !important; }
.jr-close { margin-top: 12px; font: 15px var(--jr-hand); color: #8A7B6C; text-decoration: underline; }
`;

// GAZETTE — the library as a printed newspaper. The game you're most likely to play is the front-page story,
// collections are the paper's sections, unplayed games run as classifieds, and every game opens as an article
// set from its store description, with an honours list of achievements and a Play stamp.
import { useMemo, useState, type ReactNode } from 'react';
import { useKestrel } from '../state/store';
import { artFor, byRecent, formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails, useNews } from '../steam/details';
import { goNative } from '../state/nav';
import { AltChrome, Brand, PlaceButtons, gameCommands, useIslands, useNativeShowing, useSelectedGame } from './common';

const today = new Date();
const DATELINE = today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const ISSUE = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

function Photo({ g, caption, tall }: { g: Game; caption?: ReactNode; tall?: boolean }) {
	const art = artFor(g.appid);
	const [failed, setFailed] = useState(false);
	return (
		<figure className={'gz-photo' + (tall ? ' tall' : '')}>
			<div className="gz-halftone"><img src={failed ? g.header : art.hero} alt="" onError={() => setFailed(true)} /></div>
			{caption && <figcaption>{caption}</figcaption>}
		</figure>
	);
}

/** A headline that suits how the game has been played. */
function headlineFor(g: Game): string {
	const days = g.lastPlayed ? (Date.now() / 1000 - g.lastPlayed) / 86400 : 999;
	if (g.minutes2w > 600) return `${g.name} dominates the fortnight`;
	if (days < 2) return `${g.name} back in play`;
	if (g.minutes > 60 * 200) return `${g.name}: ${Math.round(g.minutes / 60)} hours and counting`;
	if (days < 14) return `The return of ${g.name}`;
	return `${g.name} awaits your return`;
}

function Stamp({ g }: { g: Game }) {
	const c = gameCommands(g)[0];
	return <button className="gz-stamp" onClick={c.run}>{c.label}</button>;
}

function Lead({ g, open }: { g: Game; open: (g: Game) => void }) {
	const d = useGameDetails(g.appid);
	const news = useNews(g.appid, 3);
	return (
		<article className="gz-lead">
			<div className="gz-kicker">{g.lastPlayed ? 'Back in play' : 'From the shelves'}</div>
			<h1 className="gz-headline" onClick={() => open(g)}>{headlineFor(g)}</h1>
			<p className="gz-deck">{formatPlaytime(g.minutes)} logged{g.lastPlayed ? `, last session ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}{d.developer ? `. From ${d.developer}.` : '.'}</p>
			<Photo g={g} caption={<>{g.name}. {g.installed ? 'Installed and ready.' : 'Not installed on this PC.'}</>} />
			<div className="gz-body cols2">
				{(d.description.length ? d.description.slice(0, 3) : ['The full story is still coming in from the store.']).map((p, i) => <p key={i} className={i === 0 ? 'drop' : ''}>{p}</p>)}
			</div>
			<div className="gz-lead-foot">
				<Stamp g={g} />
				<button className="gz-more" onClick={() => open(g)}>Continued: the full story →</button>
			</div>
			{news && news.length > 0 && (
				<aside className="gz-wire">
					<div className="gz-label">From the wire</div>
					{news.map((n) => <button key={n.id} onClick={() => goNative(n.url, 'play')}><b>{n.title}</b><span>{new Date(n.date * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {n.excerpt.slice(0, 120)}…</span></button>)}
				</aside>
			)}
		</article>
	);
}

function Article({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const islands = useIslands();
	const where = islands.filter((i) => i.id !== 'recent' && i.games.some((x) => x.appid === g.appid)).map((i) => i.name);
	const honours = d.achievements.list.filter((a) => a.achieved).sort((a, b) => b.unlocked - a.unlocked);
	return (
		<div className="gz-article">
			<button className="gz-backlink" onClick={close}>← Front page</button>
			<div className="gz-kicker">{where.length ? where.join(' · ') : 'Library'}</div>
			<h1 className="gz-title">{g.name}</h1>
			<p className="gz-deck">{[d.developer && `By ${d.developer}`, d.publisher && d.publisher !== d.developer && `published by ${d.publisher}`].filter(Boolean).join(', ') || 'From your library'}</p>
			<div className="gz-byline">The Playtime Desk · {DATELINE}</div>
			<Photo g={g} tall caption={<>{g.name}, as it appears in your library.</>} />
			<div className="gz-article-grid">
				<div className="gz-body cols2">
					{(d.description.length ? d.description : [d.ready ? 'No story has been filed for this game.' : 'The story is still coming in…']).map((p, i) => <p key={i} className={i === 0 ? 'drop' : ''}>{p}</p>)}
				</div>
				<aside className="gz-side">
					<div className="gz-box">
						<div className="gz-label">The numbers</div>
						<dl>
							<dt>Hours played</dt><dd>{formatPlaytime(g.minutes)}</dd>
							<dt>Last played</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</dd>
							{d.achievements.total > 0 && <><dt>Achievements</dt><dd>{d.achievements.achieved} of {d.achievements.total}</dd></>}
							{(d.disk || g.sizeOnDisk) > 0 && <><dt>On disk</dt><dd>{formatBytes(d.disk || g.sizeOnDisk)}</dd></>}
							<dt>Status</dt><dd>{g.status || (g.installed ? 'Installed' : 'Not installed')}</dd>
						</dl>
						<Stamp g={g} />
					</div>
					{honours.length > 0 && (
						<div className="gz-box">
							<div className="gz-label">Honours list</div>
							<ol className="gz-honours">{honours.slice(0, 8).map((a) => <li key={a.id}><b>{a.name}</b><span>{a.desc}</span></li>)}</ol>
						</div>
					)}
					<div className="gz-box">
						<div className="gz-label">Notices</div>
						<div className="gz-notices">{gameCommands(g).slice(1).map((c) => <button key={c.id} onClick={c.run}>{c.label}</button>)}</div>
					</div>
				</aside>
			</div>
		</div>
	);
}

export function Gazette() {
	const library = useKestrel((s) => s.library);
	const dl = useKestrel((s) => s.downloads);
	const friends = useKestrel((s) => s.friends);
	const islands = useIslands();
	const native = useNativeShowing();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const recent = useMemo(() => byRecent(library), [library]);
	const lead = recent[0] ?? library[0];
	const sections = islands.filter((i) => i.id !== 'recent');
	const unplayed = useMemo(() => library.filter((g) => g.minutes === 0).sort((a, b) => b.added - a.added).slice(0, 24), [library]);
	const query = q.trim().toLowerCase();
	const results = useMemo(() => (query ? library.filter((g) => g.name.toLowerCase().includes(query)).sort((a, b) => b.lastPlayed - a.lastPlayed) : []), [query, library]);
	const open = (g: Game) => select(g.appid);
	const Index = ({ gs }: { gs: Game[] }) => (
		<ul className="gz-index">{gs.map((g) => <li key={g.appid} data-appid={g.appid}><button onClick={() => open(g)}><span>{g.name}</span><i /><em>{g.minutes ? formatPlaytime(g.minutes) : 'new'}</em></button></li>)}</ul>
	);

	return (
		<>
			<AltChrome className="gz-top">
				<Brand className="gz-brand">The Kestrel Gazette</Brand>
				<label className="gz-search"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder="Search the archive" spellCheck={false} /></label>
				<PlaceButtons />
			</AltChrome>
			<main className={'k-stage gz-stage' + (native ? ' is-hidden' : '')} aria-hidden={native}>
				<div className="gz-desk">
					<div className="gz-sheet" key={sel ? 'a' + sel.appid : query ? 'search' : 'front'}>
						{sel ? <Article g={sel} close={() => select(null)} /> : query ? (
							<section>
								<div className="gz-label big">Search the archive: “{q.trim()}”</div>
								<p className="gz-deck">{results.length ? `${results.length} entries found.` : 'No entries found.'}</p>
								<Index gs={results} />
							</section>
						) : (
							<>
								<header className="gz-nameplate">
									<div className="gz-ears"><span>Every game you own</span><span>Late edition</span></div>
									<div className="gz-name">The Kestrel Gazette</div>
									<div className="gz-dateline"><span>No. {ISSUE}</span><span>{DATELINE}</span><span>{library.length} titles in circulation · {library.filter((g) => g.installed).length} on this PC</span><span>Free</span></div>
								</header>
								<div className="gz-front">
									{lead && <Lead g={lead} open={open} />}
									<aside className="gz-right">
										<div className="gz-label">In brief</div>
										{recent.slice(1, 7).map((g) => (
											<button key={g.appid} data-appid={g.appid} className="gz-brief" onClick={() => open(g)}>
												<b>{g.name}</b>
												<span>{formatPlaytime(g.minutes)} on record; last seen {formatAgo(g.lastPlayed).toLowerCase()}.</span>
											</button>
										))}
										<div className="gz-label">Downloads desk</div>
										<p className="gz-small">{dl.active ? `${dl.active.name} is coming in, ${dl.active.percent.toFixed(0)}% received.` : dl.queue.length ? `Quiet on the line. ${dl.queue.map((x) => x.name).join(', ')} waiting in the queue.` : 'Nothing on the wire.'}</p>
										<div className="gz-label">Society</div>
										<p className="gz-small">{friends.filter((f) => f.state !== 'offline').length ? friends.filter((f) => f.state !== 'offline').map((f) => `${f.name}${f.state === 'ingame' ? ` (at ${f.game})` : ''}`).join(', ') + ' seen about town.' : 'No friends about town this evening.'}</p>
									</aside>
								</div>
								{sections.map((s, i) => (
									<section className="gz-section" key={s.id}>
										<div className="gz-section-head"><span>Section {String.fromCharCode(66 + (i % 24))}</span><b>{s.name}</b><span>{s.games.length} titles</span></div>
										<Index gs={s.games} />
									</section>
								))}
								{unplayed.length > 0 && (
									<section className="gz-section">
										<div className="gz-section-head"><span>Classifieds</span><b>Wanted: a first play</b><span>{library.filter((g) => g.minutes === 0).length} unplayed</span></div>
										<div className="gz-classifieds">
											{unplayed.map((g) => (
												<button key={g.appid} data-appid={g.appid} onClick={() => open(g)}>
													<b>{g.name.toUpperCase()}.</b> Never played. {g.installed ? 'Installed, ready to go.' : 'Not installed.'} Apply within.
												</button>
											))}
										</div>
									</section>
								)}
								<footer className="gz-colophon">Printed by Kestrel from your Steam library · Ctrl+K for the index</footer>
							</>
						)}
					</div>
				</div>
			</main>
		</>
	);
}

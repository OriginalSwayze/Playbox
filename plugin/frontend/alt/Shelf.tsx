// SHELF — the library as a physical games shelf. Each collection is a wooden shelf of box spines under a lamp;
// pull a box out and it turns to show its cover, with the details on an insert card beside it.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { mainWindow } from '../steam/env';
import { AltChrome, Brand, PlaceButtons, gameCommands, useIslands, useNativeShowing, useSelectedGame } from './common';

/** A stable hue per game so spines without art still differ. */
const hue = (id: number) => (id * 47) % 360;

function Spine({ g, hit, miss, onPick }: { g: Game; hit: boolean; miss: boolean; onPick: (g: Game, el: HTMLElement) => void }) {
	const [n, setN] = useState(0);
	const src = g.capsules[n];
	return (
		<button data-appid={g.appid} className={'sh-spine' + (g.installed ? ' on' : '') + (hit ? ' hit' : '') + (miss ? ' miss' : '')} title={g.name}
			style={{ ['--h' as string]: hue(g.appid) }} onClick={(e) => onPick(g, e.currentTarget)}>
			{src && <img src={src} alt="" loading="lazy" draggable={false} onError={() => setN(n + 1)} />}
			<span className="sh-band" />
			<span className="sh-title">{g.name}</span>
			{g.installed && <i className="sh-led" />}
		</button>
	);
}

function Box({ g, onClose }: { g: Game; onClose: () => void }) {
	const [n, setN] = useState(0);
	const [closing, setClosing] = useState(false);
	const cmds = gameCommands(g);
	const close = () => { setClosing(true); setTimeout(onClose, 380); };
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [g.appid]);
	return (
		<div className={'sh-pulled' + (closing ? ' closing' : '')} onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className="sh-box3d" style={{ ['--h' as string]: hue(g.appid) }}>
				<div className="sh-face front">{g.capsules[n] ? <img src={g.capsules[n]} alt="" onError={() => setN(n + 1)} /> : <b>{g.name}</b>}</div>
				<div className="sh-face side"><span>{g.name}</span></div>
				<div className="sh-face top" />
			</div>
			<article className="sh-insert">
				<div className="sh-insert-head">Game record</div>
				<h2>{g.name}</h2>
				<dl>
					<dt>Played</dt><dd>{formatPlaytime(g.minutes)}</dd>
					<dt>Last played</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</dd>
					<dt>Status</dt><dd>{g.status || (g.installed ? 'On this PC' : 'Not installed')}</dd>
				</dl>
				<button className="sh-sticker" onClick={cmds[0].run}><Icon name={cmds[0].icon} size={20} />{cmds[0].label}</button>
				<div className="sh-insert-actions">
					{cmds.slice(1).map((c) => <button key={c.id} onClick={c.run}><Icon name={c.icon} size={15} />{c.label}</button>)}
				</div>
				<button className="sh-back" onClick={close}>Put it back</button>
			</article>
		</div>
	);
}

export function Shelf() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const native = useNativeShowing();
	const [q, setQ] = useState('');
	const room = useRef<HTMLDivElement>(null);
	const query = q.trim().toLowerCase();
	const matches = useMemo(() => (query ? new Set(islands.flatMap((i) => i.games).filter((g) => g.name.toLowerCase().includes(query)).map((g) => g.appid)) : null), [query, islands]);

	const findFirst = () => {
		const el = room.current?.querySelector('.sh-spine.hit') as HTMLElement | null;
		if (!el) return;
		el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
		el.classList.add('flash');
		setTimeout(() => el.classList.remove('flash'), 1400);
	};
	useEffect(() => { if (query) { const t = setTimeout(findFirst, 250); return () => clearTimeout(t); } }, [query]);

	return (
		<>
			<AltChrome className="sh-top">
				<Brand className="sh-brand"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 5v14M8 7v12M12 5v14M16.5 6.5l3 12.5M3 20.5h18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Shelf</Brand>
				<label className="sh-search">
					<Icon name="search" size={16} />
					<input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') findFirst(); if (e.key === 'Escape') setQ(''); }} placeholder="Look for a game on the shelves" spellCheck={false} />
					{matches && <em>{matches.size}</em>}
				</label>
				<PlaceButtons />
			</AltChrome>
			<main className={'k-stage sh-stage' + (native ? ' is-hidden' : '')} aria-hidden={native}>
				<div className="sh-room" ref={room}>
					<div className="sh-lamp" />
					{islands.map((is, i) => (
						<section className="sh-unit" key={is.id} style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
							<div className="sh-plate"><b>{is.name}</b><span>{is.games.length}</span></div>
							<div className="sh-row">
								<div className="sh-books">
									{is.games.map((g) => <Spine key={g.appid} g={g} hit={!!matches?.has(g.appid)} miss={!!matches && !matches.has(g.appid)} onPick={(x) => select(x.appid)} />)}
								</div>
								<div className="sh-plank" />
							</div>
						</section>
					))}
				</div>
				{sel && <Box key={sel.appid} g={sel} onClose={() => select(null)} />}
			</main>
		</>
	);
}

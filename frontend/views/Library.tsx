// Library: every game as a wall of covers, with your Steam collections down the side.
// Pick a collection to see just it, or group the wall into collapsible collection sections like Steam's list.
import { useDeferredValue, useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import type { Game } from '../steam/library';
import { Cover } from './cards';

type Filter = 'all' | 'installed' | 'played' | 'unplayed';
type Sort = 'name' | 'recent' | 'playtime' | 'size' | 'added';
const FILTERS: { id: Filter; label: string }[] = [
	{ id: 'all', label: 'All' }, { id: 'installed', label: 'Installed' }, { id: 'played', label: 'Played' }, { id: 'unplayed', label: 'Not played' },
];
const SORTS: Record<Sort, (a: Game, b: Game) => number> = {
	name: (a, b) => a.sortName.localeCompare(b.sortName),
	recent: (a, b) => b.lastPlayed - a.lastPlayed,
	playtime: (a, b) => b.minutes - a.minutes,
	size: (a, b) => b.sizeOnDisk - a.sizeOnDisk,
	added: (a, b) => b.added - a.added,
};

const FOLD_KEY = 'kestrel.library.folded.v1';
const GROUP_KEY = 'kestrel.library.grouped.v1';
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

export function Library() {
	const library = useKestrel((s) => s.library);
	const collections = useKestrel((s) => s.collections);
	const selected = useKestrel((s) => s.libCollection);
	const [q, setQ] = useState('');
	const [filter, setFilter] = useState<Filter>('all');
	const [sort, setSort] = useState<Sort>('name');
	const [grouped, setGrouped] = useState<boolean>(() => load(GROUP_KEY, false));
	const [folded, setFolded] = useState<string[]>(() => load(FOLD_KEY, [] as string[]));
	const query = useDeferredValue(q.trim().toLowerCase());

	const byId = useMemo(() => new Map(library.map((g) => [g.appid, g])), [library]);
	// collections reduced to games that are in the library, empty ones dropped
	const cols = useMemo(() => collections.map((c) => ({ ...c, games: c.appids.map((id) => byId.get(id)).filter(Boolean) as Game[] })).filter((c) => c.games.length > 0), [collections, byId]);
	const current = cols.find((c) => c.id === selected) ?? null;

	const pass = useMemo(() => (g: Game) => {
		if (filter === 'installed' && !g.installed) return false;
		if (filter === 'played' && g.minutes === 0) return false;
		if (filter === 'unplayed' && g.minutes > 0) return false;
		return !query || g.name.toLowerCase().includes(query);
	}, [filter, query]);

	const shown = useMemo(() => (current ? current.games : library).filter(pass).sort(SORTS[sort]), [current, library, pass, sort]);
	const sections = useMemo(() => (grouped && !current ? cols.map((c) => ({ ...c, games: c.games.filter(pass).sort(SORTS[sort]) })).filter((c) => c.games.length) : []), [grouped, current, cols, pass, sort]);

	const pick = (id: string | null) => setState({ libCollection: id });
	const toggleFold = (id: string) => { const next = folded.includes(id) ? folded.filter((x) => x !== id) : [...folded, id]; setFolded(next); save(FOLD_KEY, next); };
	const toggleGrouped = () => { setGrouped(!grouped); save(GROUP_KEY, !grouped); };
	const total = current ? current.games.length : library.length;

	return (
		<div className="k-view k-lib">
			<aside className="k-lib-side" aria-label="Collections">
				<div className="k-lib-side-head">Collections</div>
				<button className={'k-col' + (!current ? ' on' : '')} onClick={() => pick(null)}><Icon name="grid" size={16} /><span>All games</span><em>{library.length}</em></button>
				{cols.map((c) => (
					<button key={c.id} className={'k-col' + (current?.id === c.id ? ' on' : '')} onClick={() => pick(c.id)} title={c.name}>
						<Icon name={c.id === 'favorite' ? 'spark' : c.dynamic ? 'discover' : 'library'} size={16} /><span>{c.name}</span><em>{c.games.length}</em>
					</button>
				))}
			</aside>
			<div className="k-lib-main">
				<div className="k-lib-head">
					<h1>{current ? current.name : 'Library'}</h1>
					<span className="count">{shown.length === total ? `${total} games` : `${shown.length} of ${total}`}</span>
					<label className="k-field"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name" spellCheck={false} /></label>
					<div className="k-seg">{FILTERS.map((f) => <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div>
					<select className="k-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
						<option value="name">Name</option><option value="recent">Last played</option><option value="playtime">Playtime</option><option value="size">Size on disk</option><option value="added">Recently added</option>
					</select>
					{!current && <button className={'k-toggle' + (grouped ? ' on' : '')} onClick={toggleGrouped} aria-pressed={grouped}><Icon name="library" size={16} />By collection</button>}
				</div>
				<div className="k-lib-body">
					{grouped && !current ? (
						sections.length ? sections.map((c) => {
							const open = !folded.includes(c.id);
							return (
								<section key={c.id} className={'k-colsec' + (open ? ' open' : '')}>
									<button className="k-colsec-head" onClick={() => toggleFold(c.id)} aria-expanded={open}>
										<Icon name="chevron" size={18} className="chev" /><b>{c.name}</b><span>{c.games.length}</span>
									</button>
									{open && <div className="k-grid">{c.games.map((g) => <Cover key={g.appid} g={g} />)}</div>}
								</section>
							);
						}) : <div className="k-empty"><b>No games match</b>Try a different name or filter.</div>
					) : shown.length ? <div className="k-grid">{shown.map((g) => <Cover key={g.appid} g={g} />)}</div>
						: <div className="k-empty"><b>No games match</b>Try a different name or filter.</div>}
				</div>
			</div>
		</div>
	);
}

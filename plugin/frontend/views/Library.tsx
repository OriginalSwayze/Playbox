// Library: the whole collection as a wall of covers with instant search, filters and sorting.
import { useDeferredValue, useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { useKestrel } from '../state/store';
import { Cover } from './cards';

type Filter = 'all' | 'installed' | 'played' | 'unplayed';
type Sort = 'name' | 'recent' | 'playtime' | 'size' | 'added';
const FILTERS: { id: Filter; label: string }[] = [
	{ id: 'all', label: 'All' }, { id: 'installed', label: 'Installed' }, { id: 'played', label: 'Played' }, { id: 'unplayed', label: 'Not played' },
];

export function Library() {
	const library = useKestrel((s) => s.library);
	const [q, setQ] = useState('');
	const [filter, setFilter] = useState<Filter>('all');
	const [sort, setSort] = useState<Sort>('name');
	const query = useDeferredValue(q.trim().toLowerCase());

	const shown = useMemo(() => {
		let gs = library;
		if (filter === 'installed') gs = gs.filter((g) => g.installed);
		else if (filter === 'played') gs = gs.filter((g) => g.minutes > 0);
		else if (filter === 'unplayed') gs = gs.filter((g) => g.minutes === 0);
		if (query) gs = gs.filter((g) => g.name.toLowerCase().includes(query));
		const by: Record<Sort, (a: typeof gs[0], b: typeof gs[0]) => number> = {
			name: (a, b) => a.sortName.localeCompare(b.sortName),
			recent: (a, b) => b.lastPlayed - a.lastPlayed,
			playtime: (a, b) => b.minutes - a.minutes,
			size: (a, b) => b.sizeOnDisk - a.sizeOnDisk,
			added: (a, b) => b.added - a.added,
		};
		return [...gs].sort(by[sort]);
	}, [library, filter, sort, query]);

	return (
		<div className="k-view">
			<div className="k-lib-head">
				<h1>Library</h1>
				<span className="count">{shown.length === library.length ? `${library.length} games` : `${shown.length} of ${library.length}`}</span>
				<label className="k-field"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name" spellCheck={false} /></label>
				<div className="k-seg">{FILTERS.map((f) => <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div>
				<select className="k-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
					<option value="name">Name</option><option value="recent">Last played</option><option value="playtime">Playtime</option><option value="size">Size on disk</option><option value="added">Recently added</option>
				</select>
			</div>
			<div className="k-lib-body">
				{shown.length ? <div className="k-grid">{shown.map((g) => <Cover key={g.appid} g={g} />)}</div>
					: <div className="k-empty"><b>No games match</b>Try a different name or filter.</div>}
			</div>
		</div>
	);
}

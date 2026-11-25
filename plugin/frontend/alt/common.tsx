// Shared pieces for the alternative interfaces (Gazette, Shelf, Terminal): their window strip, the game action
// list, and the collection/game data they all read. Each interface supplies its own look around these.
import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import { back, canGoBack, goNative, goSpace } from '../state/nav';
import { ActivityButton, AccountCluster, WindowControls } from '../shell/TopBar';
import { artFor, playOrInstall, type Game } from '../steam/library';
import { gameActions } from '../steam/details';
import { InterfaceButton } from '../shell/InterfacePicker';

/** The 56px strip every interface keeps at the top: its own content, then activity, account and window buttons. */
export function AltChrome({ children, className = '' }: { children: ReactNode; className?: string }) {
	const canBack = useKestrel((s) => canGoBack(s));
	return (
		<header className={'k-top k-alt-top ' + className}>
			<button className="k-icon-btn" aria-label="Back" disabled={!canBack} onClick={back}><Icon name="back" size={18} /></button>
			{children}
			<div className="k-drag" />
			<InterfaceButton />
			<ActivityButton />
			<AccountCluster />
			<WindowControls />
		</header>
	);
}

/** The interface's name doubles as its home button (back from the Store, a Steam page, a selection). */
export function Brand({ className, children }: { className: string; children: ReactNode }) {
	return <button className={className} title="Home" onClick={() => goSpace('play')}>{children}</button>;
}

/** Buttons for the places Steam owns: Store, Community, profile. */
export function PlaceButtons() {
	const space = useKestrel((s) => s.space);
	const view = useKestrel((s) => s.view);
	const native = view.kind === 'native';
	const B = ({ id, label, icon }: { id: 'discover' | 'social' | 'you'; label: string; icon: string }) => (
		<button className={'k-alt-place' + (native && space === id ? ' on' : '')} onClick={() => goSpace(id)}><Icon name={icon} size={16} />{label}</button>
	);
	return (
		<nav className="k-alt-places">
			<B id="discover" label="Store" icon="discover" />
			<B id="social" label="Community" icon="social" />
			<B id="you" label="Profile" icon="you" />
		</nav>
	);
}

/** The actions every interface offers for a game, wired to Steam. */
export function gameCommands(g: Game) {
	return [
		{ id: 'play', label: g.installed ? 'Play' : 'Install', icon: g.installed ? 'play' : 'install', primary: true, run: () => playOrInstall(g) },
		{ id: 'props', label: 'Properties', icon: 'settings', run: () => gameActions.properties(g.appid) },
		{ id: 'store', label: 'Store page', icon: 'discover', run: () => goNative(`https://store.steampowered.com/app/${g.appid}/`, 'discover') },
		{ id: 'hub', label: 'Community hub', icon: 'social', run: () => goNative(`https://steamcommunity.com/app/${g.appid}`, 'social') },
		{ id: 'classic', label: 'Classic Steam page', icon: 'library', run: () => goNative(`/library/app/${g.appid}`, 'play') },
	];
}

export type Island = { id: string; name: string; games: Game[] };

/** Collections resolved to games (in Steam's order), plus Recently played at the front. */
export function useIslands(): Island[] {
	const library = useKestrel((s) => s.library);
	const collections = useKestrel((s) => s.collections);
	return useMemo(() => {
		const byId = new Map(library.map((g) => [g.appid, g]));
		const out: Island[] = collections
			.map((c) => ({ id: c.id, name: c.name, games: c.appids.map((id) => byId.get(id)).filter(Boolean) as Game[] }))
			.filter((c) => c.games.length > 0)
			.map((c) => ({ ...c, games: c.games.sort((a, b) => a.sortName.localeCompare(b.sortName)) }));
		const recent = library.filter((g) => g.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 12);
		if (recent.length) out.unshift({ id: 'recent', name: 'Recently played', games: recent });
		return out;
	}, [library, collections]);
}

/** Which game the interface should show: Kestrel's 'game' view (from the command bar, a menu) maps to a selection. */
export function useSelectedGame(): [Game | null, (appid: number | null) => void] {
	const view = useKestrel((s) => s.view);
	const library = useKestrel((s) => s.library);
	const g = view.kind === 'game' ? library.find((x) => x.appid === view.appid) ?? null : null;
	const select = (appid: number | null) => setState(appid ? { view: { kind: 'game', appid } } : { view: { kind: 'home' } });
	return [g, select];
}

/** Whether a Steam page (Store, Community, classic page…) is showing instead of the interface. */
export const useNativeShowing = () => useKestrel((s) => s.view.kind === 'native');

/** One interface page: its strip (brand, optional search, Steam places) and a stage that steps aside for Steam pages. */
export function AltPage({ brand, brandClass, search, onSearch, searchPlaceholder, className, children }: {
	brand: ReactNode; brandClass?: string; search?: string; onSearch?: (q: string) => void; searchPlaceholder?: string; className: string; children: ReactNode;
}) {
	const native = useNativeShowing();
	return (
		<>
			<AltChrome className={className + '-top'}>
				<Brand className={'alt-brand ' + (brandClass ?? className + '-brand')}>{brand}</Brand>
				{onSearch && (
					<label className={'alt-search ' + className + '-search'}>
						<Icon name="search" size={15} />
						<input value={search ?? ''} onChange={(e) => onSearch(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && onSearch('')} placeholder={searchPlaceholder ?? 'Search your games'} spellCheck={false} />
					</label>
				)}
				<PlaceButtons />
			</AltChrome>
			<main className={'k-stage ' + className + '-stage' + (native ? ' is-hidden' : '')} aria-hidden={native}>{children}</main>
		</>
	);
}

/** Game artwork with Steam's fallback chain; kind picks the cover, the wide header or the hero. */
export function Art({ g, kind = 'capsule', className }: { g: Game; kind?: 'capsule' | 'header' | 'hero'; className?: string }) {
	const list = kind === 'capsule' ? g.capsules : kind === 'header' ? [g.header, ...g.capsules] : [artFor(g.appid).hero, g.header];
	const [n, setN] = useState(0);
	const src = list[n];
	if (!src) return <span className={'alt-noart ' + (className ?? '')}>{g.name}</span>;
	return <img className={className} src={src} alt="" loading="lazy" draggable={false} onError={() => setN(n + 1)} />;
}

/** The lists most interfaces want. */
export function useLibraryLists() {
	const library = useKestrel((s) => s.library);
	return useMemo(() => {
		const recent = library.filter((g) => g.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed);
		return {
			all: library,
			recent,
			installed: library.filter((g) => g.installed).sort((a, b) => b.lastPlayed - a.lastPlayed),
			unplayed: library.filter((g) => g.minutes === 0),
			top: [...library].sort((a, b) => b.minutes - a.minutes),
		};
	}, [library]);
}

/** Case-insensitive name search over the library. */
export function useSearch(q: string): Game[] | null {
	const library = useKestrel((s) => s.library);
	return useMemo(() => {
		const t = q.trim().toLowerCase();
		return t ? library.filter((g) => g.name.toLowerCase().includes(t)).sort((a, b) => b.lastPlayed - a.lastPlayed) : null;
	}, [q, library]);
}

/** Small action list for detail panels; the first command (Play/Install) is left to the interface to style. */
export function Actions({ g, className }: { g: Game; className?: string }) {
	return <div className={'alt-actions ' + (className ?? '')}>{gameCommands(g).slice(1).map((c) => <button key={c.id} onClick={c.run}><Icon name={c.icon} size={15} />{c.label}</button>)}</div>;
}

/** Hours played to one decimal. */
export const hrs = (g: Game) => Math.round(g.minutes / 6) / 10;
/** A unix date as "3 Mar 2024", or a dash. */
export const dateOf = (unix: number, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => (unix ? new Date(unix * 1000).toLocaleDateString(undefined, o) : '—');
/** The Play / Install button, styled by the interface. */
export function PlayBtn({ g, className, label, children }: { g: Game; className?: string; label?: [string, string]; children?: ReactNode }) {
	const c = gameCommands(g)[0];
	return <button className={className} onClick={c.run}>{children}{label ? (g.installed ? label[0] : label[1]) : c.label}</button>;
}
/** Search plus the island picker most interfaces share: the chosen collection, or search results while searching. */
export function useBrowse(first = 'recent') {
	const base = useIslands();
	const library = useKestrel((s) => s.library);
	const islands = useMemo(() => [...base, { id: 'all', name: 'All games', games: [...library].sort((a, b) => a.sortName.localeCompare(b.sortName)) }], [base, library]);
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [cur, setCur] = useState(first);
	const isle = islands.find((i) => i.id === cur) ?? islands[0];
	const games = found ?? isle?.games ?? [];
	return { islands, q, setQ, found, cur: isle?.id ?? '', setCur, isle, games };
}

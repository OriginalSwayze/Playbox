// Shared pieces for the alternative interfaces (Atlas, Shelf, Terminal): their window strip, the game action
// list, and the collection/game data they all read. Each interface supplies its own look around these.
import { useMemo, type ReactNode } from 'react';
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import { back, canGoBack, goNative, goSpace } from '../state/nav';
import { ActivityButton, AccountCluster, WindowControls } from '../shell/TopBar';
import { playOrInstall, type Game } from '../steam/library';
import { gameActions } from '../steam/details';

/** The 56px strip every interface keeps at the top: its own content, then activity, account and window buttons. */
export function AltChrome({ children, className = '' }: { children: ReactNode; className?: string }) {
	const canBack = useKestrel((s) => canGoBack(s));
	return (
		<header className={'k-top k-alt-top ' + className}>
			<button className="k-icon-btn" aria-label="Back" disabled={!canBack} onClick={back}><Icon name="back" size={18} /></button>
			{children}
			<div className="k-drag" />
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

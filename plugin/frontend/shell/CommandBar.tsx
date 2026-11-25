// The command bar: one place to jump to any game, page, friend or Steam action. Ctrl+K anywhere.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from '../ui/icons';
import { getState, setState, useKestrel } from '../state/store';
import { go, goNative, goSpace, openGame } from '../state/nav';
import { byRecent, formatAgo, playOrInstall, type Game } from '../steam/library';
import { openAddGame, openFriendsList } from '../steam/activity';
import { client } from '../steam/env';

type Item = { id: string; group: string; label: string; sub?: string; icon?: string; img?: string; act?: string; run: () => void; alt?: () => void };

const steamUrl = (u: string) => { try { client().URL.ExecuteSteamURL(u); } catch (e) { console.error('[Kestrel]', e); } };

const ACTIONS: Item[] = [
	{ id: 'a-home', group: 'Go to', label: 'Home', sub: 'Your dashboard', icon: 'play', run: () => goSpace('play') },
	{ id: 'a-lib', group: 'Go to', label: 'Library', sub: 'Every game you own', icon: 'grid', run: () => go({ kind: 'library' }) },
	{ id: 'a-store', group: 'Go to', label: 'Store', sub: 'Discover', icon: 'discover', run: () => goSpace('discover') },
	{ id: 'a-comm', group: 'Go to', label: 'Community', sub: 'Social', icon: 'social', run: () => goSpace('social') },
	{ id: 'a-prof', group: 'Go to', label: 'Your profile', sub: 'You', icon: 'you', run: () => goSpace('you') },
	{ id: 'a-dl', group: 'Go to', label: 'Downloads', sub: 'Queue and history', icon: 'download', run: () => goNative('/library/downloads', 'play') },
	{ id: 'a-wish', group: 'Go to', label: 'Wishlist', sub: 'Store', icon: 'spark', run: () => goNative('https://store.steampowered.com/wishlist/', 'discover') },
	{ id: 'a-friends', group: 'Steam', label: 'Friends and chat', sub: 'Opens the friends list', icon: 'chat', run: () => { setState({ commandOpen: false }); openFriendsList() || steamUrl('steam://open/friends'); } },
	{ id: 'a-settings', group: 'Steam', label: 'Settings', sub: 'Steam settings', icon: 'settings', run: () => { setState({ commandOpen: false }); steamUrl('steam://open/settings'); } },
	{ id: 'a-add', group: 'Steam', label: 'Add a game', sub: 'Non-Steam game, activate a product', icon: 'plus', run: () => { setState({ commandOpen: false }); openAddGame(); } },
	{ id: 'a-shots', group: 'Steam', label: 'Screenshots and recordings', sub: 'Media manager', icon: 'spark', run: () => goNative('/media', 'play') },
];

function score(q: string, text: string): number {
	const t = text.toLowerCase();
	if (t === q) return 100;
	if (t.startsWith(q)) return 80;
	// word initials: "poe" finds Path of Exile, "gta" Grand Theft Auto
	const initials = t.split(/[^a-z0-9]+/).filter(Boolean).map((w) => (/^[0-9]+$/.test(w) ? w : w[0])).join('');
	if (q.length >= 2 && initials.startsWith(q)) return 70;
	const i = t.indexOf(' ' + q);
	if (i >= 0) return 60;
	if (t.includes(q)) return 40;
	// letters in order (e.g. "poe2" -> "Path of Exile 2")
	let k = 0;
	for (const c of t) if (c === q[k]) k++;
	return k === q.length ? 15 : 0;
}

function gameItem(g: Game, group: string): Item {
	return {
		id: 'g' + g.appid, group, label: g.name, img: g.icon,
		sub: `${g.installed ? 'Installed' : 'Not installed'} · ${formatAgo(g.lastPlayed)}`,
		act: g.installed ? 'Play' : 'Install',
		run: () => { setState({ commandOpen: false }); openGame(g.appid); },
		alt: () => { setState({ commandOpen: false }); playOrInstall(g); },
	};
}

export function CommandBar() {
	const open = useKestrel((s) => s.commandOpen);
	const library = useKestrel((s) => s.library);
	const [q, setQ] = useState('');
	const [sel, setSel] = useState(0);
	const input = useRef<HTMLInputElement>(null);
	const list = useRef<HTMLDivElement>(null);

	useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);

	const items = useMemo<Item[]>(() => {
		const query = q.trim().toLowerCase();
		if (!query) return [...byRecent(library).slice(0, 5).map((g) => gameItem(g, 'Recent games')), ...ACTIONS];
		const games = library.map((g) => ({ g, s: score(query, g.name) + (g.installed ? 3 : 0) })).filter((x) => x.s > 0)
			.sort((a, b) => b.s - a.s || b.g.lastPlayed - a.g.lastPlayed).slice(0, 8).map((x) => gameItem(x.g, 'Games'));
		const acts = ACTIONS.map((a) => ({ a, s: Math.max(score(query, a.label), score(query, a.sub ?? '') / 2) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.a);
		const store: Item = { id: 'store-q', group: 'Store', label: `Search the store for "${q.trim()}"`, icon: 'discover', act: 'Search',
			run: () => goNative(`https://store.steampowered.com/search/?term=${encodeURIComponent(q.trim())}`, 'discover') };
		return [...games, ...acts, store];
	}, [q, library]);

	useEffect(() => { setSel(0); }, [q]);
	useEffect(() => { list.current?.querySelector('.sel')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

	if (!open) return null;
	const close = () => setState({ commandOpen: false });
	const onKey = (e: ReactKeyboardEvent) => {
		if (e.key === 'ArrowDown') { e.preventDefault(); setSel((i) => Math.min(items.length - 1, i + 1)); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
		else if (e.key === 'Enter') { e.preventDefault(); const it = items[sel]; if (!it) return; (e.ctrlKey && it.alt ? it.alt : it.run)(); }
		else if (e.key === 'Escape') { e.preventDefault(); close(); }
	};

	let lastGroup = '';
	return (
		<>
			<div className="k-scrim" onMouseDown={close} />
			<div className="k-cmd" role="dialog" aria-label="Command bar" onKeyDown={onKey}>
				<div className="k-cmd-input">
					<Icon name="search" size={20} />
					<input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a game, open a page, run an action" spellCheck={false} />
					<span className="k-kbd">Esc</span>
				</div>
				<div className="k-cmd-list" ref={list}>
					{items.length === 0 && <div className="k-cmd-empty">Nothing matches that. Try a game's name.</div>}
					{items.map((it, i) => {
						const head = it.group !== lastGroup ? <div className="k-cmd-group" key={'h' + it.group}>{it.group}</div> : null;
						lastGroup = it.group;
						return [head, (
							<button key={it.id} className={'k-cmd-item' + (i === sel ? ' sel' : '')} onMouseMove={() => sel !== i && setSel(i)} onClick={(e) => (e.ctrlKey && it.alt ? it.alt : it.run)()}>
								<span className="ic">{it.img ? <img src={it.img} alt="" /> : <Icon name={it.icon ?? 'spark'} size={18} />}</span>
								<span className="tx"><b>{it.label}</b>{it.sub && <span>{it.sub}</span>}</span>
								<span className="act">{it.alt ? <>Open <span className="k-kbd">Enter</span> {it.act} <span className="k-kbd">Ctrl Enter</span></> : <>{it.act ?? 'Open'} <Icon name="enter" size={14} /></>}</span>
							</button>
						)];
					})}
				</div>
				<div className="k-cmd-foot">
					<span><span className="k-kbd">↑ ↓</span> Move</span>
					<span><span className="k-kbd">Enter</span> Open</span>
					<span><span className="k-kbd">Ctrl Enter</span> Play or install</span>
				</div>
			</div>
		</>
	);
}

/** Global keys on Steam's main window: Ctrl+K opens the command bar, Alt+1..4 switch spaces. */
export function bindKeys(doc: Document): () => void {
	const onKey = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); e.stopPropagation(); setState((s) => ({ commandOpen: !s.commandOpen, panelOpen: false })); return; }
		if (e.altKey && /^[1-4]$/.test(e.key)) { e.preventDefault(); goSpace((['play', 'discover', 'social', 'you'] as const)[Number(e.key) - 1]); return; }
		if (e.key === 'Escape' && getState().panelOpen) setState({ panelOpen: false });
	};
	doc.addEventListener('keydown', onKey, true);
	return () => doc.removeEventListener('keydown', onKey, true);
}

// Right-click menu for any game card or cover: the same actions Steam's library menu offers, in Kestrel's style.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { getState, setState, useKestrel } from '../state/store';
import { goNative, openGame } from '../state/nav';
import { playOrInstall } from '../steam/library';
import { gameActions, isRunning } from '../steam/details';
import { mainWindow } from '../steam/env';

export type GameMenuState = { appid: number; x: number; y: number } | null;
let menu: GameMenuState = null;
const subs = new Set<() => void>();
export function openGameMenu(appid: number, x: number, y: number) { menu = { appid, x, y }; subs.forEach((f) => f()); }
const closeMenu = () => { menu = null; subs.forEach((f) => f()); };

export function GameMenu() {
	const [m, setM] = useState<GameMenuState>(null);
	useEffect(() => { const f = () => setM(menu); subs.add(f); return () => { subs.delete(f); }; }, []);
	const library = useKestrel((s) => s.library);
	const ref = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState({ x: 0, y: 0 });
	useLayoutEffect(() => {
		if (!m || !ref.current) return;
		const doc = ref.current.ownerDocument;
		const r = ref.current.getBoundingClientRect();
		const W = doc.documentElement.clientWidth, H = doc.documentElement.clientHeight;
		setPos({ x: Math.min(m.x, W - r.width - 8), y: Math.min(m.y, H - r.height - 8) });
	}, [m]);
	useEffect(() => {
		if (!m) return;
		const doc = mainWindow()?.BrowserWindow.document;
		const off = (e: Event) => { if (!ref.current?.contains(e.target as Node)) closeMenu(); };
		const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); } };
		doc?.addEventListener('mousedown', off, true);
		doc?.addEventListener('wheel', closeMenu, { passive: true, capture: true });
		doc?.addEventListener('keydown', key, true);
		return () => { doc?.removeEventListener('mousedown', off, true); doc?.removeEventListener('wheel', closeMenu, true); doc?.removeEventListener('keydown', key, true); };
	}, [m]);
	if (!m) return null;
	const g = library.find((x) => x.appid === m.appid);
	if (!g) return null;
	const running = isRunning(g.appid);
	const run = (f: () => void) => () => { closeMenu(); try { f(); } catch (e) { console.error('[Kestrel]', e); } };
	return (
		<div className="k-menu k-ctx" ref={ref} role="menu" style={{ left: pos.x, top: pos.y }} onContextMenu={(e) => e.preventDefault()}>
			<div className="k-ctx-head">{g.name}</div>
			{running
				? <button role="menuitem" className="primary" onClick={run(() => gameActions.stop(g.gameid))}><Icon name="close" size={16} />Stop</button>
				: <button role="menuitem" className="primary" onClick={run(() => playOrInstall(g))}><Icon name={g.installed ? 'play' : 'install'} size={16} />{g.installed ? 'Play' : 'Install'}</button>}
			<button role="menuitem" onClick={run(() => openGame(g.appid))}><Icon name="forward" size={16} />Open game page</button>
			<button role="menuitem" onClick={run(() => gameActions.properties(g.appid))}><Icon name="settings" size={16} />Properties</button>
			<hr />
			<button role="menuitem" onClick={run(() => goNative(`https://store.steampowered.com/app/${g.appid}/`, 'discover'))}><Icon name="discover" size={16} />Store page</button>
			<button role="menuitem" onClick={run(() => goNative(`https://steamcommunity.com/app/${g.appid}`, 'social'))}><Icon name="social" size={16} />Community hub</button>
			<button role="menuitem" onClick={run(() => goNative(`/library/app/${g.appid}`, 'play'))}><Icon name="library" size={16} />Classic Steam page</button>
			{g.installed && <><hr /><button role="menuitem" className="danger" onClick={run(() => gameActions.uninstall(g.appid))}><Icon name="close" size={16} />Uninstall</button></>}
		</div>
	);
}

/** Bind right-click on Kestrel's game cards (anything with data-appid) to the game menu. */
export function bindGameMenu(doc: Document): () => void {
	const on = (e: MouseEvent) => {
		const el = (e.target as Element | null)?.closest?.('#kestrel-root [data-appid]') as HTMLElement | null;
		if (!el) return;
		e.preventDefault();
		e.stopPropagation();
		if (getState().commandOpen) setState({ commandOpen: false });
		openGameMenu(Number(el.dataset.appid), e.clientX, e.clientY);
	};
	doc.addEventListener('contextmenu', on, true);
	return () => doc.removeEventListener('contextmenu', on, true);
}

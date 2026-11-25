// Launcher kit: what the game-launcher interfaces share. Game logos and hero art, keyboard and controller navigation
// (arrows/Enter/Esc, or a pad's d-pad, stick, A, B, bumpers), a cursor that only scrolls for key moves, and the facts
// a launcher shows about a game.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { mainWindow } from '../steam/env';
import { artFor, formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { getState, useKestrel } from '../state/store';
import { dateOf } from './common';

/** The game's logo art; its name in big type when it has none. The name is always present as text for readers. */
export function Logo({ g, className }: { g: Game; className?: string }) {
	return <LogoArt key={g.appid} g={g} className={className} />;
}
function LogoArt({ g, className }: { g: Game; className?: string }) {
	const [bad, setBad] = useState(false);
	const src = artFor(g.appid).logo;
	if (bad || !src) return <span className={'lk-logotext ' + (className ?? '')}>{g.name}</span>;
	return <span className={'lk-logo ' + (className ?? '')}><img src={src} alt="" draggable={false} onError={() => setBad(true)} /><b>{g.name}</b></span>;
}

/** Wide key art that fades in when the game changes. */
export function Backdrop({ g, className }: { g: Game | null | undefined; className?: string }) {
	if (!g) return <div className={'lk-bd ' + (className ?? '')} />;
	return <div className={'lk-bd ' + (className ?? '')}><HeroImg key={g.appid} g={g} /></div>;
}
function HeroImg({ g }: { g: Game }) {
	const list = [artFor(g.appid).hero, g.header, ...g.capsules];
	const [n, setN] = useState(0);
	if (!list[n]) return null;
	return <img src={list[n]} alt="" draggable={false} onError={() => setN(n + 1)} />;
}

export type Key = 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'next' | 'prev' | 'menu';
const KEYS: Record<string, Key> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'enter', Escape: 'back', Backspace: 'back', PageDown: 'next', PageUp: 'prev', Tab: 'menu' };
const busy = () => { const s = getState(); return s.pickerOpen || s.commandOpen || s.settingsOpen || s.panelOpen || s.view.kind === 'native'; };

/** Keyboard and controller input for an interface. Return false from the handler to let the key through. */
export function useKeys(fn: (k: Key) => boolean | void) {
	const ref = useRef(fn);
	ref.current = fn;
	useEffect(() => {
		const win = mainWindow()?.BrowserWindow;
		const doc = win?.document;
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
			if (e.ctrlKey || e.altKey || e.metaKey || busy()) return;
			const k = KEYS[e.key];
			if (!k || (k === 'menu' && e.shiftKey)) return;
			if (ref.current(k) !== false) { e.preventDefault(); e.stopPropagation(); }
		};
		doc?.addEventListener('keydown', onKey, true);
		// controllers: polled on a timer (Steam reports its window hidden, which stops animation frames)
		const prev: boolean[] = [];
		let held: { k: Key | ''; t: number } = { k: '', t: 0 };
		const pad = setInterval(() => {
			let gp: Gamepad | null = null;
			try { gp = [...((win?.navigator as Navigator | undefined)?.getGamepads?.() ?? [])].find(Boolean) ?? null; } catch { /* no pads */ }
			if (!gp) return;
			if (busy()) { held.k = ''; return; }
			const b = (i: number) => !!gp!.buttons[i]?.pressed;
			const ax = gp.axes;
			const dir: Key | '' = b(12) || ax[1] < -0.6 ? 'up' : b(13) || ax[1] > 0.6 ? 'down' : b(14) || ax[0] < -0.6 ? 'left' : b(15) || ax[0] > 0.6 ? 'right' : '';
			const now = Date.now();
			if (dir && held.k !== dir) { held = { k: dir, t: now + 380 }; ref.current(dir); }
			else if (dir && now >= held.t) { held.t = now + 110; ref.current(dir); }
			else if (!dir) held.k = '';
			for (const [i, k] of [[0, 'enter'], [1, 'back'], [5, 'next'], [4, 'prev'], [3, 'menu']] as [number, Key][]) {
				const p = b(i);
				if (p && !prev[i]) ref.current(k);
				prev[i] = p;
			}
		}, 50);
		return () => { doc?.removeEventListener('keydown', onKey, true); clearInterval(pad); };
	}, []);
}

/** A position in a list moved by keys or the pointer; keyMoved says whether the last move came from a key. */
export function useCursor(len: number, start = 0) {
	const [raw, setRaw] = useState(start);
	const keyMoved = useRef(false);
	const i = Math.max(0, Math.min(len - 1, raw));
	const clamp = (n: number) => Math.max(0, Math.min(len - 1, n));
	return {
		i,
		keyMoved,
		move: (d: number, wrap = false) => { keyMoved.current = true; setRaw((x) => { const y = Math.max(0, Math.min(len - 1, x)) + d; return wrap ? (len ? (y + len) % len : 0) : clamp(y); }); },
		to: (n: number, byKey = false) => { keyMoved.current = byKey; setRaw(clamp(n)); },
	};
}

/** Scrolls the focused element into view after key moves only (scrolling on hover would chase the pointer). */
export function useKeepInView(box: RefObject<HTMLElement | null>, selector: string, dep: unknown, keyMoved: { current: boolean }, block: ScrollLogicalPosition = 'nearest') {
	useEffect(() => {
		if (!keyMoved.current) return;
		keyMoved.current = false;
		box.current?.querySelector(selector)?.scrollIntoView({ block, inline: block });
	}, [dep]);
}

/** How many items sit on the first row of a grid, for up/down moves. */
export function colsOf(box: HTMLElement | null, selector = '[data-appid]') {
	const items = box ? [...box.querySelectorAll<HTMLElement>(selector)] : [];
	if (!items.length) return 1;
	const top = items[0].offsetTop;
	const n = items.findIndex((e) => e.offsetTop !== top);
	return n < 0 ? items.length : Math.max(1, n);
}

/** Moves through items on its own every few seconds, unless paused. */
export function useRotate(len: number, ms: number, paused: boolean): [number, (n: number) => void] {
	const [i, setI] = useState(0);
	useEffect(() => {
		if (paused || len < 2) return;
		const t = setInterval(() => setI((x) => (x + 1) % len), ms);
		return () => clearInterval(t);
	}, [len, ms, paused, i]);
	return [len ? i % len : 0, setI];
}

/** What Steam is doing with the game, in a launcher's words. */
export function useStatus(g: Game | null | undefined): string {
	const running = useKestrel((s) => (g ? s.running.includes(g.appid) : false));
	if (!g) return '';
	if (running) return 'Running';
	if (g.busy) return g.status + (g.progress > 0 && g.progress < 100 ? ` ${Math.round(g.progress)}%` : '');
	if (g.needsUpdate) return 'Update required';
	return g.installed ? 'Ready to play' : 'Not installed';
}

/** The facts a launcher shows about a game. */
export function facts(g: Game): [string, string][] {
	return [
		['Played', g.minutes ? formatPlaytime(g.minutes) : 'Never'],
		['Last session', g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'],
		['Past 2 weeks', g.minutes2w ? formatPlaytime(g.minutes2w) : 'None'],
		['On disk', g.installed ? formatBytes(g.sizeOnDisk) || 'Installed' : 'Not installed'],
		['Metascore', g.metacritic ? String(g.metacritic) : 'n/a'],
		['Added', dateOf(g.added)],
	];
}

/** Controller-style button hints along an edge: [glyph, label] pairs. */
export function Hints({ items, className }: { items: [string, string][]; className?: string }) {
	return <div className={'lk-hints ' + (className ?? '')}>{items.map(([k, l]) => <span key={k + l}><kbd>{k}</kbd>{l}</span>)}</div>;
}

/** A random installed game (any game if none are installed), for "surprise me" buttons. */
export const pickRandom = (gs: Game[]) => { const pool = gs.filter((g) => g.installed); const l = pool.length ? pool : gs; return l[Math.floor(Math.random() * l.length)] ?? null; };

/** A clock that ticks once a minute. */
export function useClock(): Date {
	const [d, setD] = useState(new Date());
	useEffect(() => { const t = setInterval(() => setD(new Date()), 15000); return () => clearInterval(t); }, []);
	return d;
}
export const hhmm = (d: Date) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/** Collection tabs for launchers: a row of chips over useBrowse's islands. */
export function Chips({ b, className, onPick }: { b: { islands: { id: string; name: string }[]; cur: string; setCur: (id: string) => void; found: unknown }; className?: string; onPick?: () => void }) {
	return (
		<nav className={'lk-chips ' + (className ?? '')}>{b.islands.map((i) => (
			<button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setCur(i.id); onPick?.(); }}>{i.name}</button>
		))}</nav>
	);
}

/** Steps useBrowse to the next or previous collection (bumpers, Page Up/Down). */
export function cycle(b: { islands: { id: string }[]; cur: string; setCur: (id: string) => void; setQ?: (q: string) => void }, d: number) {
	const n = b.islands.length;
	if (!n) return;
	const i = b.islands.findIndex((x) => x.id === b.cur);
	b.setQ?.('');
	b.setCur(b.islands[(((i + d) % n) + n) % n].id);
}

export const Empty =({ children }: { children?: ReactNode }) => <p className="lk-empty">{children ?? 'Nothing here yet.'}</p>;

export const lkCss = `
.lk-logo { position: relative; display: inline-block; } .lk-logo img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 4px 18px rgba(0,0,0,.55)); }
.lk-logo b { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.lk-logotext { display: block; font-weight: 800; line-height: 1.02; letter-spacing: -.01em; text-wrap: balance; text-shadow: 0 3px 20px rgba(0,0,0,.5); }
.lk-bd { position: absolute; inset: 0; overflow: hidden; pointer-events: none; } .lk-bd img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: k-fade .6s ease both; }
.lk-hints { display: flex; gap: 22px; align-items: center; font: 600 13px var(--k-text); color: var(--k-fg-2); } .lk-hints span { display: flex; align-items: center; gap: 8px; }
.lk-hints kbd { display: grid; place-items: center; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 99px; background: var(--k-fg); color: var(--k-ink); font: 800 11px var(--k-text); }
.lk-chips { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; } .lk-chips::-webkit-scrollbar { display: none; }
.lk-chips button { flex: none; height: 32px; padding: 0 14px; border-radius: 99px; background: var(--k-s1); color: var(--k-fg-2); font: 600 13px var(--k-text); white-space: nowrap; }
.lk-chips button:hover { background: var(--k-s2); color: var(--k-fg); } .lk-chips button.on { background: var(--k-accent); color: var(--k-on-accent); }
.lk-empty { padding: 40px; text-align: center; color: var(--k-fg-3); font: 500 15px var(--k-text); }
`;

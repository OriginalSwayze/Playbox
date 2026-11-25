// ZEN — a quiet, minimal launcher. Paper-white, one column of names in a light serif, the focused game's cover resting
// beside them and nothing else. Type anywhere to filter; up/down move, Enter plays, Tab shows the details.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { mainWindow } from '../steam/env';
import { getState } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

export function Zen() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 400);
	const c = useCursor(gs.length);
	const [more, setMore] = useState(false);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved, 'center');
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); } else if (k === 'enter' && g) gameCommands(g)[0].run();
		else if (k === 'menu') setMore((m) => !m); else if (k === 'back') { if (b.q) return false; if (sel) select(null); else setMore(false); }
		else if (k === 'left' || k === 'right') { const i = b.islands.findIndex((x) => x.id === b.cur); const n = b.islands[(i + (k === 'right' ? 1 : -1) + b.islands.length) % b.islands.length]; if (n) { b.setQ(''); b.setCur(n.id); c.to(0); } } else return false;
	});
	// type to filter: printable keys anywhere go to the search
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			const s = getState();
			if (t?.tagName === 'INPUT' || e.ctrlKey || e.altKey || e.metaKey || s.pickerOpen || s.commandOpen || s.settingsOpen || s.view.kind === 'native') return;
			if (e.key.length === 1 && e.key !== ' ') { b.setQ(b.q + e.key); c.to(0); e.preventDefault(); e.stopPropagation(); }
			else if (e.key === 'Backspace' && b.q) { b.setQ(b.q.slice(0, -1)); e.preventDefault(); e.stopPropagation(); }
			else if (e.key === 'Escape' && b.q) { b.setQ(''); e.preventDefault(); e.stopPropagation(); }
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [b.q]);
	return (
		<AltPage className="pb-zen" brand={<>zen</>}>
			<div className="pb-zen-app">
				<nav className="pb-zen-sets">{b.islands.map((i) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); c.to(0); }}>{i.name.toLowerCase()}</button>)}</nav>
				<p className="pb-zen-q">{b.q ? <>“{b.q}”<button onClick={() => b.setQ('')}>clear</button></> : <span>type to search</span>}</p>
				<div className="pb-zen-list" ref={list}>{gs.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onMouseEnter={() => c.to(n)} onClick={() => (n === c.i ? select(sel ? null : x.appid) : c.to(n))} onDoubleClick={() => gameCommands(x)[0].run()}>{x.name}</button>
				))}{!gs.length && <p className="pb-zen-none">nothing</p>}</div>
				{g && (
					<aside className="pb-zen-side" key={g.appid}>
						<Art g={g} kind="capsule" className="pb-zen-cover" />
						<p className="pb-zen-line">{status.toLowerCase()} · {formatPlaytime(g.minutes).toLowerCase()} · {formatAgo(g.lastPlayed).toLowerCase()}</p>
						<PlayBtn g={g} className="pb-zen-play" label={['play', 'install']} />
						{(more || sel) && <><dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k.toLowerCase()}</dt><dd>{v}</dd></div>)}</dl><Actions g={g} className="pb-zen-act" /></>}
						<button className="pb-zen-more" onClick={() => setMore(!more)}>{more ? 'less' : 'more'}</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

const serif = '"Georgia", "Iowan Old Style", "Palatino Linotype", serif';
export const zenCss = tok('zen', { bg: '#F6F4EF', s1: '#EDEAE3', s2: '#E4E0D7', s3: '#D9D4C9', fg: '#2B2A27', fg2: '#5C5A54', fg3: '#9A968C', acc: '#2B2A27', on: '#F6F4EF', top: '#F6F4EF', line: 'transparent', font: serif }) + `
.pb-zen-brand { font: italic 22px ${serif}; color: #2B2A27; letter-spacing: .02em; }
.pb-zen-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) min(360px, 32%); grid-template-rows: auto auto minmax(0, 1fr); column-gap: 60px; padding: 0 8% 0 10%; background: #F6F4EF; color: #2B2A27; }
.pb-zen-sets { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px 22px; padding: 18px 0 6px; } .pb-zen-sets button { font: 15px ${serif}; color: #9A968C; } .pb-zen-sets button:hover { color: #2B2A27; } .pb-zen-sets button.on { color: #2B2A27; text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }
.pb-zen-q { grid-column: 1; margin: 10px 0 6px; font: italic 15px ${serif}; color: #5C5A54; } .pb-zen-q span { color: #C4BFB3; } .pb-zen-q button { margin-left: 12px; font: 13px ${serif}; color: #9A968C; text-decoration: underline; }
.pb-zen-list { grid-column: 1; overflow-y: auto; padding: 20vh 0 30vh; scrollbar-width: none; mask: linear-gradient(transparent, #000 18%, #000 75%, transparent); -webkit-mask: linear-gradient(transparent, #000 18%, #000 75%, transparent); } .pb-zen-list::-webkit-scrollbar { display: none; }
.pb-zen-list button { display: block; max-width: 100%; padding: 4px 0; text-align: left; font: 300 30px/1.25 ${serif}; color: #C4BFB3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .25s, transform .25s; transform-origin: left center; }
.pb-zen-list button:hover { color: #9A968C; } .pb-zen-list button.on { color: #2B2A27; transform: scale(1.12); }
.pb-zen-none { font: italic 24px ${serif}; color: #C4BFB3; }
.pb-zen-side { grid-column: 2; grid-row: 2 / 4; align-self: center; display: grid; justify-items: start; gap: 14px; max-height: 100%; overflow-y: auto; padding: 20px 0; animation: k-fade .6s both; scrollbar-width: none; }
.pb-zen-cover { width: 100%; max-width: 300px; aspect-ratio: 2/3; object-fit: cover; box-shadow: 0 20px 40px -20px rgba(40,30,10,.45); }
.pb-zen-line { margin: 0; font: italic 15px ${serif}; color: #5C5A54; }
.pb-zen-play { height: 40px; padding: 0 26px; border-radius: 99px; background: #2B2A27 !important; color: #F6F4EF !important; font: italic 16px ${serif} !important; } .pb-zen-play:hover { background: #000 !important; }
.pb-zen-side dl { width: 100%; margin: 0; } .pb-zen-side dl div { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #E4E0D7; font: 14px ${serif}; } .pb-zen-side dt { color: #9A968C; } .pb-zen-side dd { margin: 0; }
.pb-zen-act { width: 100%; } .pb-zen-act button { font: 14px ${serif} !important; color: #5C5A54 !important; } .pb-zen-act button:hover { background: #EDEAE3 !important; }
.pb-zen-more { font: italic 14px ${serif}; color: #9A968C; text-decoration: underline; }
`;

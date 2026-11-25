// INBOX — Steam as a mail client. Folders are smart views and collections, each game is a message (unread until
// you first play it), and the reading pane opens it as a letter from its developer with screenshots attached.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { mainWindow } from '../steam/env';
import { Icon } from '../ui/icons';
import { AltPage, Art, gameCommands, useIslands, useLibraryLists, useSearch, useSelectedGame } from './common';

const touched = (g: Game) => Math.max(g.lastPlayed, g.added);
function when(unix: number) {
	if (!unix) return '';
	const d = new Date(unix * 1000);
	const now = new Date();
	if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	if (now.getTime() - d.getTime() < 6 * 86400000) return d.toLocaleDateString(undefined, { weekday: 'short' });
	return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : '2-digit' });
}
function subject(g: Game) {
	if (g.busy) return `${g.status}${g.progress ? ` · ${g.progress.toFixed(0)}%` : ''}`;
	if (g.needsUpdate) return 'An update is waiting for you';
	if (!g.minutes) return g.installed ? 'Installed and ready, never opened' : 'Waiting in your library';
	return `${formatPlaytime(g.minutes)} together · last seen ${formatAgo(g.lastPlayed).toLowerCase()}`;
}
const initials = (s: string) => s.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
const hueOf = (n: number) => (n * 47) % 360;

function Letter({ g }: { g: Game }) {
	const d = useGameDetails(g.appid);
	const cmds = gameCommands(g);
	return (
		<article className="ib-letter" key={g.appid}>
			<div className="ib-tools">
				<button className="ib-reply" onClick={cmds[0].run}><Icon name={cmds[0].icon} size={15} />{g.installed ? 'Play' : 'Install'}</button>
				{cmds.slice(1).map((c) => <button key={c.id} onClick={c.run}><Icon name={c.icon} size={15} />{c.label}</button>)}
			</div>
			<h1>{g.name}</h1>
			<div className="ib-from">
				<span className="ib-av" style={{ '--h': hueOf(g.appid) } as CSSProperties}>{initials(d.developer || g.name)}</span>
				<div><b>{d.developer || g.name}</b> <span>&lt;{(d.developer || 'studio').toLowerCase().replace(/[^a-z0-9]+/g, '')}@library&gt;</span><p>to me{d.publisher && d.publisher !== d.developer ? `, cc ${d.publisher}` : ''}</p></div>
				<time>{touched(g) ? new Date(touched(g) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}</time>
			</div>
			<div className="ib-body">
				<div className="ib-banner"><Art g={g} kind="hero" /></div>
				<p className="ib-hi">{subject(g)}.</p>
				{(d.description.length ? d.description.slice(0, 3) : [d.ready ? 'No description from the studio.' : 'Loading…']).map((p, i) => <p key={i}>{p}</p>)}
				<p className="ib-sig">— {d.developer || 'The studio'}{d.achievements.total ? <><br /><small>P.S. You have unlocked {d.achievements.achieved} of {d.achievements.total} achievements.</small></> : null}</p>
			</div>
			{d.shots.length > 0 && (
				<div className="ib-attach">
					<h3><Icon name="spark" size={14} />{d.shotCount || d.shots.length} attachment{(d.shotCount || d.shots.length) === 1 ? '' : 's'} · your screenshots</h3>
					<div>{d.shots.slice(0, 6).map((s) => <span key={s.handle} className="ib-file"><img src={s.url} alt="" loading="lazy" /><em>shot_{s.handle}.jpg</em></span>)}</div>
				</div>
			)}
		</article>
	);
}

export function Inbox() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [folder, setFolder] = useState('inbox');
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const listRef = useRef<HTMLDivElement>(null);
	const folders = useMemo(() => [
		{ id: 'inbox', name: 'Inbox', icon: 'library', games: [...lists.all].sort((a, b) => touched(b) - touched(a)) },
		{ id: 'unread', name: 'Unread', icon: 'bell', games: lists.unplayed.slice().sort((a, b) => b.added - a.added) },
		{ id: 'flagged', name: 'Installed', icon: 'install', games: lists.installed },
		{ id: 'updates', name: 'Updates', icon: 'download', games: lists.all.filter((g) => g.needsUpdate || g.busy) },
		{ id: 'archive', name: 'Long reads', icon: 'clock', games: lists.top.filter((g) => g.minutes >= 3000) },
	], [lists]);
	const labels = islands.map((i) => ({ id: i.id, name: i.name, icon: 'grid', games: [...i.games].sort((a, b) => touched(b) - touched(a)) }));
	const cur = found ? { id: 'q', name: `Search: ${q.trim()}`, icon: 'search', games: found } : [...folders, ...labels].find((f) => f.id === folder) ?? folders[0];
	const shown = cur.games.slice(0, 400);
	useEffect(() => { listRef.current?.scrollTo({ top: 0 }); }, [cur.id]);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement;
			if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.isContentEditable)) return;
			if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'j' && e.key !== 'k') return;
			e.preventDefault(); e.stopPropagation();
			const i = shown.findIndex((g) => g.appid === sel?.appid);
			const n = Math.max(0, Math.min(shown.length - 1, i + (e.key === 'ArrowDown' || e.key === 'j' ? 1 : -1)));
			if (shown[n]) { select(shown[n].appid); listRef.current?.querySelector(`[data-appid="${shown[n].appid}"]`)?.scrollIntoView({ block: 'nearest' }); }
		};
		const win = mainWindow()?.BrowserWindow; // keys arrive in Steam's main window, not this shared context
		win?.addEventListener('keydown', onKey, true);
		return () => win?.removeEventListener('keydown', onKey, true);
	}, [shown, sel]);
	const Folder = ({ f }: { f: { id: string; name: string; icon: string; games: Game[] } }) => {
		const unread = f.games.filter((g) => !g.minutes).length;
		return <button className={'ib-folder' + (!found && f.id === cur.id ? ' on' : '')} onClick={() => { setFolder(f.id); setQ(''); }}><Icon name={f.icon} size={16} /><span>{f.name}</span>{f.id === 'inbox' || f.id === 'unread' ? (unread ? <b>{unread}</b> : null) : <em>{f.games.length}</em>}</button>;
	};
	return (
		<AltPage className="ib" brand={<><i className="ib-logo"><Icon name="library" size={16} /></i>Inbox</>} search={q} onSearch={setQ} searchPlaceholder="Search mail">
			<div className="ib-app">
				<nav className="ib-folders">
					<button className="ib-compose" onClick={() => setFolder('unread')}><Icon name="play" size={16} />Something new</button>
					{folders.map((f) => <Folder key={f.id} f={f} />)}
					<h4>Labels</h4>
					{labels.map((f) => <Folder key={f.id} f={f} />)}
				</nav>
				<section className="ib-list" ref={listRef}>
					<header><b>{cur.name}</b><span>{cur.games.length > shown.length ? `1–${shown.length} of ${cur.games.length}` : `${cur.games.length} conversations`}</span></header>
					{shown.map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'ib-row' + (g.minutes ? '' : ' unread') + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
							<span className="ib-av sm" style={{ '--h': hueOf(g.appid) } as CSSProperties}><Art g={g} kind="capsule" /></span>
							<span className="ib-meta"><b>{g.name}</b><time>{when(touched(g))}</time><span>{subject(g)}</span></span>
							{g.installed && <i className="ib-flag" title="Installed" />}
						</button>
					))}
					{!shown.length && <p className="ib-none">No messages here.</p>}
				</section>
				<section className="ib-read">{sel ? <Letter key={sel.appid} g={sel} /> : <div className="ib-empty"><Icon name="library" size={40} /><p>Select a message to read it.</p><small>↑ ↓ or J K move between messages</small></div>}</section>
			</div>
		</AltPage>
	);
}

export const inboxCss = `
html.kestrel[data-ui="inbox"] { --k-ink: #F6F8FC; --k-s1: #FFFFFF; --k-s2: #EEF2F9; --k-s3: #E1E7F2; --k-s4: #C9D2E3; --k-line: rgba(30,40,70,.1); --k-line-2: rgba(30,40,70,.2);
	--k-fg: #1F1F1F; --k-fg-2: #444746; --k-fg-3: #6E7381; --k-accent: #1A73E8; --k-accent-2: #4B93F0; --k-on-accent: #FFF; --k-a10: rgba(26,115,232,.08); --k-a20: rgba(26,115,232,.15); --k-a40: rgba(26,115,232,.35); }
html.kestrel[data-ui="inbox"] .k-top { background: #F6F8FC; border-bottom: 0; }
html.kestrel[data-ui="inbox"] .ib-search { width: min(620px, 40vw); height: 44px; background: #E9EEF6; box-shadow: none; }
.ib-brand { display: flex; align-items: center; gap: 10px; font: 500 21px var(--k-display); color: #444746; }
.ib-logo { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, #1A73E8, #8E5CF7); color: #fff; }
.ib-stage { background: #F6F8FC; }
.ib-app { position: absolute; inset: 0 12px 12px 0; display: grid; grid-template-columns: 240px minmax(340px, 420px) 1fr; }
.ib-folders { display: flex; flex-direction: column; gap: 1px; padding: 8px 8px 20px 10px; overflow-y: auto; }
.ib-folders::-webkit-scrollbar { width: 6px; } .ib-folders::-webkit-scrollbar-thumb { background: #C9D2E3; border-radius: 3px; }
.ib-compose { display: flex; align-items: center; gap: 12px; align-self: flex-start; height: 54px; padding: 0 22px 0 18px; margin: 0 0 14px; border-radius: 16px; background: #C2E7FF !important; font: 600 14px var(--k-text); color: #001D35; transition: box-shadow .2s; }
.ib-compose:hover { box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.ib-folder { display: flex; align-items: center; gap: 14px; height: 32px; padding: 0 12px 0 16px; border-radius: 0 16px 16px 0; margin-left: -10px; font: 14px var(--k-text); color: #1F1F1F; text-align: left; }
.ib-folder span { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ib-folder b { font: 700 12px var(--k-text); } .ib-folder em { font: 12px var(--k-text); font-style: normal; color: #6E7381; }
.ib-folder:hover { background: #E9EEF6; } .ib-folder.on { background: #D3E3FD; font-weight: 700; color: #041E49; }
.ib-folders h4 { margin: 16px 0 4px 6px; font: 500 15px var(--k-text); color: #1F1F1F; }
.ib-list { overflow-y: auto; background: #fff; border-radius: 16px 0 0 16px; border-right: 1px solid var(--k-line); }
.ib-list::-webkit-scrollbar { width: 8px; } .ib-list::-webkit-scrollbar-thumb { background: #C9D2E3; border-radius: 4px; }
.ib-list > header { position: sticky; top: 0; z-index: 1; display: flex; align-items: baseline; justify-content: space-between; padding: 14px 16px 10px; background: #fff; border-bottom: 1px solid var(--k-line); }
.ib-list > header b { font: 600 16px var(--k-text); } .ib-list > header span { font: 12px var(--k-text); color: #6E7381; }
.ib-row { position: relative; display: flex; gap: 12px; width: 100%; padding: 10px 16px; text-align: left; border-bottom: 1px solid #F1F3F4; transition: background .12s, box-shadow .12s; }
.ib-row:hover { box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3); z-index: 1; }
.ib-row.on { background: #D3E3FD; } .ib-row:not(.unread):not(.on) { background: #F8FAFD; }
.ib-av { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: hsl(var(--h) 60% 45%); color: #fff !important; font: 600 15px var(--k-text); }
.ib-av.sm img, .ib-av.sm .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 8px; }
.ib-meta { flex: 1; min-width: 0; display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; }
.ib-meta b { font: 500 14px var(--k-text); color: #1F1F1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ib-meta time { font: 12px var(--k-text); color: #6E7381; }
.ib-meta > span { grid-column: 1 / -1; font: 13px var(--k-text); color: #5F6368; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ib-row.unread .ib-meta b, .ib-row.unread .ib-meta time { font-weight: 800; color: #041E49; } .ib-row.unread .ib-meta > span { color: #1F1F1F; font-weight: 600; }
.ib-row.unread::before { content: ""; position: absolute; left: 5px; top: 50%; width: 6px; height: 6px; margin-top: -3px; border-radius: 50%; background: #1A73E8; }
.ib-flag { position: absolute; right: 14px; bottom: 12px; width: 8px; height: 12px; background: #F4B400; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%); }
.ib-none { padding: 30px; text-align: center; font: 14px var(--k-text); color: #6E7381; }
.ib-read { overflow-y: auto; background: #fff; border-radius: 0 16px 16px 0; }
.ib-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #9AA0A6; font: 14px var(--k-text); } .ib-empty p { margin: 8px 0 0; color: #5F6368; }
.ib-letter { padding: 10px 34px 40px; animation: k-fade 250ms both; }
.ib-tools { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 0 10px; background: #fff; border-bottom: 1px solid var(--k-line); }
.ib-tools button { display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 12px; border-radius: 99px; font: 500 13px var(--k-text); color: #444746; }
.ib-tools button:hover { background: #F1F3F4; }
.ib-tools .ib-reply { background: #1A73E8 !important; color: #fff; padding: 0 18px; } .ib-tools .ib-reply:hover { background: #1765CC !important; }
.ib-letter h1 { margin: 20px 0 16px; font: 400 26px/1.25 var(--k-display); color: #1F1F1F; }
.ib-from { display: flex; align-items: flex-start; gap: 12px; }
.ib-from > div { flex: 1; min-width: 0; font: 14px var(--k-text); } .ib-from b { font-weight: 700; } .ib-from span { font-size: 12.5px; color: #5F6368; } .ib-from p { margin: 2px 0 0; font-size: 12.5px; color: #5F6368; }
.ib-from time { font: 12.5px var(--k-text); color: #5F6368; }
.ib-body { padding: 18px 0 0 52px; font: 14.5px/1.6 Arial, Helvetica, sans-serif; color: #222; }
.ib-banner { aspect-ratio: 16 / 6; border-radius: 10px; overflow: hidden; margin-bottom: 16px; } .ib-banner img, .ib-banner .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.ib-hi { font-weight: 700; } .ib-body p { margin: 0 0 12px; max-width: 760px; }
.ib-sig { color: #5F6368; } .ib-sig small { font-size: 12.5px; }
.ib-attach { margin: 16px 0 0 52px; padding-top: 14px; border-top: 1px solid var(--k-line); }
.ib-attach h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font: 600 13.5px var(--k-text); color: #444746; }
.ib-attach > div { display: flex; flex-wrap: wrap; gap: 10px; }
.ib-file { width: 172px; border: 1px solid #DADCE0; border-radius: 8px; overflow: hidden; background: #F8F9FA; }
.ib-file img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.ib-file em { display: block; padding: 6px 8px; font: 12px var(--k-text); font-style: normal; color: #444746; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

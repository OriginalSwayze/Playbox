// CONTACTS — an address book. Games are contacts, alphabetised with a letter index down the side; groups are
// collections; favourites are your most played. A contact card has the usual rows ("last contacted", "known since")
// and quick-action circles: Play, Properties, Store, Hub.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { mainWindow } from '../steam/env';

const initial = (g: Game) => { const c = g.sortName[0]?.toUpperCase() ?? '#'; return /[A-Z]/.test(c) ? c : '#'; };

export function Contacts() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const groups = useMemo(() => { const m = new Map<string, Game[]>(); for (const g of [...b.games].sort((x, y) => x.sortName.localeCompare(y.sortName))) { const k = initial(g); (m.get(k) ?? m.set(k, []).get(k)!).push(g); } return [...m]; }, [b.games]);
	const favs = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 6), [b.games]);
	const jump = (l: string) => mainWindow()?.BrowserWindow.document.querySelector(`#cnt-${l}`)?.scrollIntoView({ block: 'start' });
	const cmds = sel ? gameCommands(sel) : [];
	return (
		<AltPage className="cnt" brand={<>☎ Contacts</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search contacts">
			<div className="cnt-app">
				<nav className="cnt-groups"><h5>Groups</h5>{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}<em>{i.games.length}</em></button>)}</nav>
				<section className="cnt-list">
					{!b.found && <div className="cnt-favs"><h6>Favourites</h6><div>{favs.map((g) => <button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span></button>)}</div></div>}
					{groups.map(([l, gs]) => (
						<div key={l}><h6 id={'cnt-' + l} className="cnt-letter">{l}</h6>{gs.slice(0, 200).map((g) => <button key={g.appid} data-appid={g.appid} className={'cnt-row' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}><span className="cnt-av"><Art g={g} kind="capsule" /></span><b>{g.name}</b></button>)}</div>
					))}
				</section>
				<nav className="cnt-index">{groups.map(([l]) => <button key={l} onClick={() => jump(l)}>{l}</button>)}</nav>
				<aside className="cnt-card">
					{sel ? <div key={sel.appid}>
						<span className="cnt-big"><Art g={sel} kind="capsule" /></span><h2>{sel.name}</h2><p className="cnt-sub">{sel.installed ? 'On this device' : 'Not on this device'}</p>
						<div className="cnt-quick">{cmds.slice(0, 4).map((c) => <button key={c.id} onClick={c.run}><i>{c.id === 'play' ? (sel.installed ? '▶' : '⬇') : c.id === 'props' ? '⚙' : c.id === 'store' ? '🛒' : '💬'}</i><span>{c.primary ? (sel.installed ? 'play' : 'install') : c.label.split(' ')[0].toLowerCase()}</span></button>)}</div>
						<div className="cnt-rows"><p><em>last contacted</em>{sel.lastPlayed ? `${dateOf(sel.lastPlayed)} (${formatAgo(sel.lastPlayed).toLowerCase()})` : 'never'}</p><p><em>known since</em>{dateOf(sel.added, { day: 'numeric', month: 'long', year: 'numeric' })}</p><p><em>time together</em>{formatPlaytime(sel.minutes)}</p><p><em>app id</em>{sel.appid}</p>{sel.metacritic > 0 && <p><em>rating</em>{sel.metacritic}</p>}</div>
						<button className="cnt-classic" onClick={cmds[4]?.run}>Open the classic Steam page</button>
					</div> : <p className="cnt-none">No contact selected</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const contactsCss = tok('contacts', { bg: '#F2F2F7', s1: '#FFFFFF', s2: '#E5E5EA', s3: '#D1D1D6', fg: '#000000', fg2: '#3C3C43', fg3: '#8E8E93', acc: '#007AFF', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.cnt-brand { font: 700 17px var(--k-text); color: #000; }
.cnt-app { position: absolute; inset: 0; display: grid; grid-template-columns: 200px 380px 24px minmax(0, 1fr); background: #fff; }
.cnt-groups { overflow-y: auto; padding: 12px 8px; background: #F2F2F7; border-right: 1px solid #E5E5EA; } .cnt-groups h5 { margin: 4px 10px 8px; font: 700 12px var(--k-text); color: #8E8E93; text-transform: uppercase; }
.cnt-groups button { display: flex; justify-content: space-between; width: 100%; padding: 7px 10px; border-radius: 8px; font: 14px var(--k-text); color: #000; text-align: left; } .cnt-groups button.on { background: #007AFF; color: #fff; } .cnt-groups em { font-style: normal; opacity: .55; }
.cnt-list { overflow-y: auto; border-right: 1px solid #E5E5EA; scroll-behavior: smooth; }
.cnt-favs { padding: 10px 14px 6px; } .cnt-favs h6, .cnt-letter { margin: 0; font: 700 13px var(--k-text); color: #8E8E93; } .cnt-favs > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
.cnt-favs button { display: grid; justify-items: center; gap: 4px; } .cnt-favs img, .cnt-favs .alt-noart { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; font-size: 6px; } .cnt-favs span { font: 12px var(--k-text); color: #000; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cnt-letter { position: sticky; top: 0; z-index: 1; padding: 4px 16px; background: #F2F2F7; color: #3C3C43; }
.cnt-row { display: flex; gap: 12px; align-items: center; width: 100%; padding: 8px 16px; text-align: left; border-bottom: 1px solid #F2F2F7; } .cnt-row:hover { background: #F7F7FA; } .cnt-row.on { background: #007AFF; } .cnt-row.on b { color: #fff; }
.cnt-av { width: 32px; height: 32px; flex: none; border-radius: 50%; overflow: hidden; background: #D1D1D6; } .cnt-av img { width: 100%; height: 100%; object-fit: cover; } .cnt-row b { font: 400 15px var(--k-text); color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cnt-index { display: flex; flex-direction: column; justify-content: center; overflow: hidden; } .cnt-index button { font: 600 10px/1.35 var(--k-text); color: #007AFF; }
.cnt-card { overflow-y: auto; padding: 40px 50px; } .cnt-card > div { display: grid; justify-items: center; max-width: 560px; margin: 0 auto; animation: k-fade .2s both; }
.cnt-big { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,.15); } .cnt-big img { width: 100%; height: 100%; object-fit: cover; }
.cnt-card h2 { margin: 14px 0 2px; font: 600 28px var(--k-text); text-align: center; } .cnt-sub { margin: 0 0 18px; color: #8E8E93; font: 14px var(--k-text); }
.cnt-quick { display: flex; gap: 14px; margin-bottom: 22px; } .cnt-quick button { display: grid; justify-items: center; gap: 4px; width: 80px; padding: 10px 0; border-radius: 12px; background: #F2F2F7; } .cnt-quick i { font-style: normal; font-size: 18px; color: #007AFF; } .cnt-quick span { font: 12px var(--k-text); color: #007AFF; }
.cnt-rows { width: 100%; border-radius: 12px; background: #F2F2F7; } .cnt-rows p { display: grid; margin: 0; padding: 10px 16px; border-bottom: 1px solid #E5E5EA; font: 15px var(--k-text); color: #000; } .cnt-rows p:last-child { border: 0; } .cnt-rows em { font: 13px var(--k-text); font-style: normal; color: #8E8E93; }
.cnt-classic { margin-top: 14px; color: #007AFF; font: 15px var(--k-text); } .cnt-none { color: #8E8E93; text-align: center; margin-top: 30vh; }
`;

// HUB — a modern PC game launcher. A sidebar with search, a filter and your collections as folders; the main area is
// a home with Jump back in and Recently added, or a game page with key art, a play bar and Overview / Manage tabs.
// Up and down walk the sidebar list.
import { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, useIslands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Logo, facts, useKeys, useStatus } from './lk';

type Filter = 'all' | 'installed' | 'recent';

function GamePage({ g, more, open }: { g: Game; more: Game[]; open: (g: Game) => void }) {
	const [tab, setTab] = useState<'overview' | 'manage'>('overview');
	const status = useStatus(g);
	return (
		<div className="pb-hub-game" key={g.appid}>
			<header className="pb-hub-hero"><Backdrop g={g} /><div className="pb-hub-fade" /><Logo g={g} className="pb-hub-logo" /></header>
			<div className="pb-hub-bar">
				<PlayBtn g={g} className={'pb-hub-play' + (g.installed ? '' : ' inst')}><Icon name={g.installed ? 'play' : 'install'} size={20} /></PlayBtn>
				<div><small>Status</small><b className={/Ready|Running/.test(status) ? 'ok' : ''}>{status}</b></div>
				<div><small>Last played</small><b>{formatAgo(g.lastPlayed)}</b></div>
				<div><small>Play time</small><b>{formatPlaytime(g.minutes)}</b></div>
				{g.installed && g.sizeOnDisk > 0 && <div><small>Size</small><b>{formatBytes(g.sizeOnDisk)}</b></div>}
			</div>
			<nav className="pb-hub-tabs"><button className={tab === 'overview' ? 'on' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'manage' ? 'on' : ''} onClick={() => setTab('manage')}>Manage</button></nav>
			{tab === 'overview' ? (
				<div className="pb-hub-ov">
					<h2>{g.name}</h2>
					<div className="pb-hub-cards">{facts(g).map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
					{more.length > 0 && <><h3>In the same collection</h3><div className="pb-hub-more">{more.slice(0, 8).map((x) => <button key={x.appid} onClick={() => open(x)}><Art g={x} kind="header" /><span>{x.name}</span></button>)}</div></>}
				</div>
			) : <div className="pb-hub-ov"><h2>{g.name}</h2><Actions g={g} className="pb-hub-act" /></div>}
		</div>
	);
}

export function Hub() {
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const lists = useLibraryLists();
	const library = useKestrel((s) => s.library);
	const running = useKestrel((s) => s.running);
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const [filter, setFilter] = useState<Filter>('all');
	const [shut, setShut] = useState<Record<string, boolean>>({});
	const list = useRef<HTMLDivElement>(null);
	const keep = (g: Game) => (filter === 'installed' ? g.installed : filter === 'recent' ? g.lastPlayed > 0 : true) && (!q || g.name.toLowerCase().includes(q.toLowerCase()));
	const groups = useMemo(() => {
		const sorted = [...library].sort((a, b) => a.sortName.localeCompare(b.sortName));
		const gs = q || !islands.length ? [{ id: 'all', name: q ? 'Results' : 'All games', games: sorted }] : [...islands, { id: 'all', name: 'All games', games: sorted }];
		return gs.map((i) => ({ ...i, games: (filter === 'recent' ? [...i.games].sort((a, b) => b.lastPlayed - a.lastPlayed) : i.games).filter(keep) })).filter((i) => i.games.length);
	}, [islands, library, q, filter]);
	const flat = groups.flatMap((i) => (shut[i.id] ? [] : i.games));
	useKeys((k) => {
		if (k !== 'up' && k !== 'down') { if (k === 'back' && sel) { select(null); return; } return false; }
		const at = sel ? flat.findIndex((g) => g.appid === sel.appid) : -1;
		const n = flat[Math.max(0, Math.min(flat.length - 1, at + (k === 'down' ? 1 : -1)))];
		if (n) { select(n.appid); setTimeout(() => list.current?.querySelector(`[data-appid="${n.appid}"]`)?.scrollIntoView({ block: 'nearest' }), 0); }
	});
	const moreOf = (g: Game) => (islands.find((i) => i.games.some((x) => x.appid === g.appid))?.games ?? []).filter((x) => x.appid !== g.appid);
	return (
		<AltPage className="pb-hub" brand={<><i>◆</i>Hub</>}>
			<div className="pb-hub-app">
				<aside className="pb-hub-side">
					<label className="pb-hub-find"><Icon name="search" size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search library" spellCheck={false} /></label>
					<div className="pb-hub-filter">{(['all', 'installed', 'recent'] as Filter[]).map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'installed' ? 'Installed' : 'Played'}</button>)}</div>
					<button className={'pb-hub-homebtn' + (sel ? '' : ' on')} onClick={() => select(null)}><Icon name="grid" size={16} />Home</button>
					<div className="pb-hub-list" ref={list}>{groups.map((grp) => (
						<section key={grp.id}>
							<button className="pb-hub-grp" onClick={() => setShut({ ...shut, [grp.id]: !shut[grp.id] })}><i className={shut[grp.id] ? 'shut' : ''}>▾</i>{grp.name}<small>{grp.games.length}</small></button>
							{!shut[grp.id] && grp.games.map((g) => (
								<button key={grp.id + g.appid} data-appid={g.appid} className={'pb-hub-item' + (sel?.appid === g.appid ? ' on' : '') + (g.installed ? '' : ' off')} onClick={() => select(g.appid)}>
									{g.icon ? <img src={g.icon} alt="" /> : <span className="pb-hub-noicon" />}<span className="pb-hub-nm">{g.name}</span>
									{running.includes(g.appid) ? <em className="run">Running</em> : g.busy ? <em>{Math.round(g.progress)}%</em> : g.needsUpdate ? <em>Update</em> : null}
								</button>
							))}
						</section>
					))}</div>
				</aside>
				<main className="pb-hub-main">
					{sel ? <GamePage g={sel} more={moreOf(sel)} open={(x) => select(x.appid)} /> : (
						<div className="pb-hub-home">
							<h2>Jump back in</h2>
							<div className="pb-hub-jump">{lists.recent.slice(0, 3).map((g, n) => (
								<button key={g.appid} data-appid={g.appid} className={n === 0 ? 'big' : ''} onClick={() => select(g.appid)}><Art g={g} kind={n === 0 ? 'hero' : 'header'} /><span><b>{g.name}</b><em>{formatAgo(g.lastPlayed)} · {formatPlaytime(g.minutes)}</em></span></button>
							))}</div>
							<h2>Recently added</h2>
							<div className="pb-hub-row">{[...lists.all].sort((a, b) => b.added - a.added).slice(0, 12).map((g) => <button key={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span></button>)}</div>
							<h2>Installed <small>{lists.installed.length}</small></h2>
							<div className="pb-hub-row">{lists.installed.slice(0, 18).map((g) => <button key={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span></button>)}</div>
						</div>
					)}
				</main>
			</div>
		</AltPage>
	);
}

export const hubCss = tok('hub', { bg: '#101318', s1: '#181C23', s2: '#20252E', s3: '#2A303B', fg: '#EEF1F5', fg2: '#B5BCC8', fg3: '#7A8392', acc: '#2BD9A8', on: '#03140F', top: '#0B0D11', font: '"Segoe UI Variable Text", "Segoe UI", sans-serif' }) + `
.pb-hub-brand { display: flex; align-items: center; gap: 8px; font: 700 17px var(--k-text); color: #EEF1F5; } .pb-hub-brand i { font-style: normal; color: #2BD9A8; }
.pb-hub-app { position: absolute; inset: 0; display: grid; grid-template-columns: 290px minmax(0, 1fr); background: #101318; color: #EEF1F5; }
.pb-hub-side { display: flex; flex-direction: column; min-height: 0; padding: 14px 10px 0; background: #0B0D11; border-right: 1px solid rgba(255,255,255,.05); }
.pb-hub-find { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; margin: 0 4px 10px; border-radius: 8px; background: #181C23; color: #7A8392; } .pb-hub-find:focus-within { box-shadow: inset 0 0 0 1.5px #2BD9A8; }
.pb-hub-find input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: #EEF1F5; font: 13.5px var(--k-text); }
.pb-hub-filter { display: flex; gap: 4px; margin: 0 4px 10px; padding: 3px; border-radius: 8px; background: #181C23; } .pb-hub-filter button { flex: 1; height: 28px; border-radius: 6px; font: 600 12.5px var(--k-text); color: #7A8392; } .pb-hub-filter button.on { background: #2A303B; color: #EEF1F5; }
.pb-hub-homebtn { display: flex; align-items: center; gap: 10px; height: 36px; margin: 0 4px 6px; padding: 0 12px; border-radius: 8px; font: 600 14px var(--k-text); color: #B5BCC8; } .pb-hub-homebtn:hover { background: #181C23; } .pb-hub-homebtn.on { background: rgba(43,217,168,.12); color: #2BD9A8; }
.pb-hub-list { flex: 1; min-height: 0; overflow-y: auto; padding: 0 4px 20px; scrollbar-width: thin; }
.pb-hub-grp { display: flex; align-items: center; gap: 6px; width: 100%; padding: 12px 8px 6px; font: 700 11px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #7A8392; } .pb-hub-grp i { font-style: normal; transition: transform .15s; } .pb-hub-grp i.shut { transform: rotate(-90deg); } .pb-hub-grp small { margin-left: auto; font-weight: 600; }
.pb-hub-item { display: flex; align-items: center; gap: 10px; width: 100%; height: 34px; padding: 0 8px; border-radius: 6px; text-align: left; font: 13.5px var(--k-text); color: #B5BCC8; } .pb-hub-item:hover { background: #181C23; color: #EEF1F5; }
.pb-hub-item.on { background: #20252E; color: #fff; box-shadow: inset 3px 0 0 #2BD9A8; } .pb-hub-item.off { color: #6A7382; } .pb-hub-item.off img { filter: grayscale(1) opacity(.6); }
.pb-hub-item img, .pb-hub-noicon { flex: none; width: 20px; height: 20px; border-radius: 4px; } .pb-hub-noicon { background: #2A303B; } .pb-hub-nm { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-hub-item em { font: 600 11px var(--k-text); font-style: normal; color: #7A8392; } .pb-hub-item em.run { color: #2BD9A8; }
.pb-hub-main { min-width: 0; overflow-y: auto; scrollbar-width: thin; }
.pb-hub-hero { position: relative; height: 380px; } .pb-hub-fade { position: absolute; inset: 0; background: linear-gradient(0deg, #101318, transparent 55%); }
.pb-hub-logo { position: absolute; left: 40px; bottom: 30px; height: 120px; max-width: 50%; } .pb-hub-logo img { height: 100%; } .pb-hub-logo.lk-logotext { height: auto; font-size: 40px; }
.pb-hub-bar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 34px; padding: 14px 40px; background: rgba(16,19,24,.96); border-bottom: 1px solid rgba(255,255,255,.06); }
.pb-hub-play { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 40px; border-radius: 8px; background: #2BD9A8 !important; color: #03140F !important; font: 700 17px var(--k-text) !important; box-shadow: 0 6px 24px rgba(43,217,168,.3); } .pb-hub-play:hover { filter: brightness(1.1); } .pb-hub-play.inst { background: #3B82F6 !important; color: #fff !important; box-shadow: 0 6px 24px rgba(59,130,246,.3); }
.pb-hub-bar small { display: block; font: 600 11px var(--k-text); letter-spacing: .08em; text-transform: uppercase; color: #7A8392; } .pb-hub-bar b { font: 600 14px var(--k-text); } .pb-hub-bar b.ok { color: #2BD9A8; }
.pb-hub-tabs { display: flex; gap: 24px; padding: 0 40px; border-bottom: 1px solid rgba(255,255,255,.06); } .pb-hub-tabs button { height: 46px; font: 600 14px var(--k-text); color: #7A8392; box-shadow: inset 0 -2px 0 transparent; } .pb-hub-tabs button.on { color: #EEF1F5; box-shadow: inset 0 -2px 0 #2BD9A8; }
.pb-hub-ov { padding: 24px 40px 50px; } .pb-hub-ov h2 { margin: 0 0 16px; font: 700 22px var(--k-text); } .pb-hub-ov h3 { margin: 30px 0 12px; font: 700 16px var(--k-text); }
.pb-hub-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; } .pb-hub-cards div { padding: 14px 16px; border-radius: 10px; background: #181C23; } .pb-hub-cards small { display: block; font: 600 12px var(--k-text); color: #7A8392; } .pb-hub-cards b { display: block; margin-top: 4px; font: 600 17px var(--k-text); }
.pb-hub-more { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; } .pb-hub-more button { border-radius: 8px; overflow: hidden; background: #181C23; text-align: left; } .pb-hub-more button:hover { background: #20252E; }
.pb-hub-more img, .pb-hub-more .alt-noart { display: block; width: 100%; aspect-ratio: 460/215; object-fit: cover; } .pb-hub-more span { display: block; padding: 8px 10px; font: 600 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-hub-act { max-width: 360px; } .pb-hub-act button { height: 42px; background: #181C23; margin-bottom: 6px; }
.pb-hub-home { padding: 26px 40px 50px; } .pb-hub-home h2 { margin: 26px 0 14px; font: 700 20px var(--k-text); } .pb-hub-home h2:first-child { margin-top: 0; } .pb-hub-home h2 small { font: 600 14px var(--k-text); color: #7A8392; }
.pb-hub-jump { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 14px; height: 340px; } .pb-hub-jump button { position: relative; overflow: hidden; border-radius: 12px; background: #181C23; text-align: left; } .pb-hub-jump button.big { grid-row: span 2; }
.pb-hub-jump img, .pb-hub-jump .alt-noart { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s var(--k-out); } .pb-hub-jump button:hover img { transform: scale(1.04); }
.pb-hub-jump span { position: absolute; left: 0; right: 0; bottom: 0; padding: 30px 16px 14px; background: linear-gradient(transparent, rgba(0,0,0,.85)); } .pb-hub-jump b { display: block; font: 700 17px var(--k-text); } .pb-hub-jump .big b { font-size: 24px; } .pb-hub-jump em { font: 13px var(--k-text); font-style: normal; color: #B5BCC8; }
.pb-hub-row { display: grid; grid-auto-flow: column; grid-auto-columns: 140px; gap: 14px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin; } .pb-hub-row button { text-align: left; } .pb-hub-row img, .pb-hub-row .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 8px; transition: transform .2s; } .pb-hub-row button:hover img { transform: translateY(-4px); }
.pb-hub-row span { display: block; margin-top: 8px; font: 600 13px var(--k-text); color: #B5BCC8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

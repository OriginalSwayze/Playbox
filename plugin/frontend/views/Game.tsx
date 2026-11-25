// The game page: full-bleed artwork, one adaptive action, live stats, and tabs for the details.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon, Loader } from '../ui/icons';
import { useKestrel } from '../state/store';
import { goNative } from '../state/nav';
import { artFor, formatAgo, formatBytes, formatPlaytime, playOrInstall, type Game as GameT } from '../steam/library';
import { gameActions, isRunning, useGameDetails, useNews, type Achievement, type Details, type Shot } from '../steam/details';
import { mainWindow } from '../steam/env';

type Tab = 'overview' | 'achievements' | 'media' | 'news' | 'dlc';

function ActionButton({ g, running }: { g: GameT; running: boolean }) {
	const busy = !!g.status && /download|updat|install|queue|pause|valid|verif/i.test(g.status);
	if (running) return <button className="k-btn primary stop" onClick={() => gameActions.stop(g.gameid)}><Icon name="close" size={18} />Stop</button>;
	if (busy) {
		return (
			<button className="k-btn ghost progress" onClick={() => goNative('/library/downloads', 'play')} style={{ ['--p' as string]: `${g.progress || 0}%` }}>
				<Icon name="download" size={18} />{g.status}{g.progress ? ` · ${Math.round(g.progress)}%` : ''}
			</button>
		);
	}
	return <button className="k-btn primary big" onClick={() => playOrInstall(g)}><Icon name={g.installed ? 'play' : 'install'} size={20} />{g.installed ? 'Play' : 'Install'}</button>;
}

function MoreMenu({ g }: { g: GameT }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!open) return;
		const doc = ref.current?.ownerDocument;
		const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
		doc?.addEventListener('mousedown', off);
		return () => doc?.removeEventListener('mousedown', off);
	}, [open]);
	const run = (f: () => void) => () => { setOpen(false); try { f(); } catch (e) { console.error('[Kestrel]', e); } };
	return (
		<div className="k-menu-wrap" ref={ref}>
			<button className="k-btn ghost round" aria-label="More" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="menu" size={18} /></button>
			{open && (
				<div className="k-menu" role="menu">
					<button role="menuitem" onClick={run(() => gameActions.properties(g.appid))}><Icon name="settings" size={16} />Properties</button>
					{g.installed && <button role="menuitem" onClick={run(() => gameActions.verify(g.appid))}><Icon name="spark" size={16} />Verify files</button>}
					{g.installed && <button role="menuitem" onClick={run(() => gameActions.shortcut(g.appid))}><Icon name="external" size={16} />Desktop shortcut</button>}
					<button role="menuitem" onClick={run(() => gameActions.screenshots(g.gameid))}><Icon name="grid" size={16} />Screenshot folder</button>
					<hr />
					<button role="menuitem" onClick={run(() => goNative(`https://store.steampowered.com/app/${g.appid}/`, 'discover'))}><Icon name="discover" size={16} />Store page</button>
					<button role="menuitem" onClick={run(() => goNative(`https://steamcommunity.com/app/${g.appid}`, 'social'))}><Icon name="social" size={16} />Community hub</button>
					<button role="menuitem" onClick={run(() => goNative(`/library/app/${g.appid}`, 'play'))}><Icon name="library" size={16} />Classic Steam page</button>
					{g.installed && <><hr /><button role="menuitem" className="danger" onClick={run(() => gameActions.uninstall(g.appid))}><Icon name="close" size={16} />Uninstall</button></>}
				</div>
			)}
		</div>
	);
}

function Stat({ icon, label, value, children }: { icon: string; label: string; value: ReactNode; children?: ReactNode }) {
	return (
		<div className="k-stat">
			<span className="lbl"><Icon name={icon} size={14} />{label}</span>
			<b>{value}</b>
			{children}
		</div>
	);
}

function Ring({ v }: { v: number }) {
	const C = 2 * Math.PI * 15;
	return (
		<svg className="k-ach-ring" viewBox="0 0 36 36" width="36" height="36">
			<circle cx="18" cy="18" r="15" fill="none" stroke="var(--k-s4)" strokeWidth="3" />
			<circle cx="18" cy="18" r="15" fill="none" stroke="var(--k-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v)} transform="rotate(-90 18 18)" className="k-ring-fill" />
		</svg>
	);
}

function AchievementTile({ a }: { a: Achievement }) {
	return (
		<div className={'k-ach' + (a.achieved ? ' on' : '')} title={a.desc}>
			<img src={a.image} alt="" loading="lazy" />
			<div className="tx">
				<b>{a.hidden && !a.achieved ? 'Hidden achievement' : a.name}</b>
				<span>{a.hidden && !a.achieved ? 'Keep playing to reveal it' : a.desc}</span>
				{!a.achieved && a.progress > 0 && <div className="k-bar"><i style={{ width: `${a.progress * 100}%` }} /></div>}
			</div>
			<em>{a.achieved ? formatAgo(a.unlocked) : `${a.global.toFixed(1)}%`}</em>
		</div>
	);
}

function Lightbox({ shots, index, onClose }: { shots: Shot[]; index: number; onClose: () => void }) {
	const [i, setI] = useState(index);
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
			if (e.key === 'ArrowRight') setI((n) => Math.min(shots.length - 1, n + 1));
			if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [shots.length]);
	const s = shots[i];
	return (
		<div className="k-lightbox" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
			<img key={s.handle} src={s.url} alt="" />
			<div className="k-lb-bar">
				<button className="k-icon-btn" aria-label="Previous" disabled={i === 0} onClick={() => setI(i - 1)}><Icon name="back" size={18} /></button>
				<span>{i + 1} of {shots.length} · {new Date(s.created * 1000).toLocaleDateString()}</span>
				<button className="k-icon-btn" aria-label="Next" disabled={i === shots.length - 1} onClick={() => setI(i + 1)}><Icon name="forward" size={18} /></button>
				<button className="k-icon-btn" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></button>
			</div>
		</div>
	);
}

function Overview({ g, d, go }: { g: GameT; d: Details; go: (t: Tab) => void }) {
	const recent = d.achievements.list.filter((a) => a.achieved).sort((a, b) => b.unlocked - a.unlocked).slice(0, 3);
	return (
		<div className="k-overview">
			<div className="k-prose">
				{d.description.length ? d.description.slice(0, 6).map((p, i) => <p key={i}>{p}</p>) : <p className="k-muted">{d.ready ? 'No description from the store for this game.' : 'Loading the description…'}</p>}
			</div>
			<aside className="k-side">
				{(d.developer || d.publisher) && (
					<dl className="k-facts">
						{d.developer && <><dt>Developer</dt><dd>{d.developer}</dd></>}
						{d.publisher && d.publisher !== d.developer && <><dt>Publisher</dt><dd>{d.publisher}</dd></>}
						{g.added > 0 && <><dt>In your library since</dt><dd>{new Date(g.added * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</dd></>}
						{d.buildUpdated > 0 && <><dt>Last updated</dt><dd>{formatAgo(d.buildUpdated)}</dd></>}
					</dl>
				)}
				{recent.length > 0 && (
					<div className="k-side-block">
						<div className="k-side-head">Latest achievements<button onClick={() => go('achievements')}>All</button></div>
						{recent.map((a) => <AchievementTile key={a.id} a={a} />)}
					</div>
				)}
				{d.shots.length > 0 && (
					<div className="k-side-block">
						<div className="k-side-head">Your screenshots<button onClick={() => go('media')}>All</button></div>
						<div className="k-shots-mini">{d.shots.slice(0, 4).map((s) => <img key={s.handle} src={s.url} alt="" loading="lazy" />)}</div>
					</div>
				)}
			</aside>
		</div>
	);
}

function NewsList({ appid }: { appid: number }) {
	const news = useNews(appid);
	if (!news) return <div className="k-center"><Loader /></div>;
	if (!news.length) return <div className="k-empty"><b>No news yet</b>This game hasn't posted any updates.</div>;
	return (
		<div className="k-news">
			{news.map((n, i) => (
				<button key={n.id} className="k-news-item" style={{ animationDelay: `${i * 50}ms` }} onClick={() => goNative(n.url, 'play')}>
					<span className="when">{new Date(n.date * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{n.feed ? ` · ${n.feed}` : ''}</span>
					<b>{n.title}</b>
					<p>{n.excerpt}</p>
				</button>
			))}
		</div>
	);
}

export function GamePage({ appid }: { appid: number }) {
	const library = useKestrel((s) => s.library);
	const g = useMemo(() => library.find((x) => x.appid === appid), [library, appid]);
	const d = useGameDetails(appid);
	const [tab, setTab] = useState<Tab>('overview');
	const [box, setBox] = useState(-1);
	const [, tick] = useState(0);
	const view = useRef<HTMLDivElement>(null);
	const tabs = useRef<HTMLDivElement>(null);
	const [ink, setInk] = useState({ x: 0, w: 0 });
	const [logoOk, setLogoOk] = useState(true);
	const [heroFailed, setHeroFailed] = useState(false);

	// re-check running state and late-arriving art
	useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1500); return () => clearInterval(t); }, []);
	useLayoutEffect(() => {
		const el = tabs.current?.querySelector<HTMLElement>(`button[data-tab="${tab}"]`);
		if (el) setInk({ x: el.offsetLeft, w: el.offsetWidth });
	}, [tab, d.ready]);
	// parallax: the artwork drifts slower than the page and dims as you scroll
	useEffect(() => {
		const v = view.current;
		if (!v) return;
		const on = () => v.style.setProperty('--k-scroll', String(v.scrollTop));
		v.addEventListener('scroll', on, { passive: true });
		return () => v.removeEventListener('scroll', on);
	}, []);

	if (!g) return <div className="k-view"><div className="k-empty"><b>Game not found</b>It may have been removed from your library.</div></div>;
	const art = artFor(appid);
	const running = isRunning(appid);
	const ach = d.achievements;
	const TABS: { id: Tab; label: string; n?: number }[] = [
		{ id: 'overview', label: 'Overview' },
		...(ach.total ? [{ id: 'achievements' as Tab, label: 'Achievements', n: ach.total }] : []),
		...(d.shots.length ? [{ id: 'media' as Tab, label: 'Screenshots', n: d.shots.length }] : []),
		{ id: 'news', label: 'News' },
		...(d.dlc.length ? [{ id: 'dlc' as Tab, label: 'DLC', n: d.dlc.length }] : []),
	];

	return (
		<div className="k-view k-game" ref={view}>
			<section className="k-ghero">
				<img className="k-ghero-art" src={heroFailed ? g.header : art.hero} alt="" onError={() => setHeroFailed(true)} />
				<div className="k-ghero-scrim" />
				<div className="k-ghero-body">
					{logoOk ? <img className="k-hero-logo" src={art.logo} alt={g.name} onError={() => setLogoOk(false)} /> : <h1 className="k-hero-title">{g.name}</h1>}
					<div className="k-ghero-sub">{[d.developer, running ? 'Running now' : g.installed ? 'Installed' : 'Not installed'].filter(Boolean).join(' · ')}</div>
				</div>
			</section>

			<div className="k-dock">
				<ActionButton g={g} running={running} />
				<div className="k-stats">
					<Stat icon="clock" label="Played" value={formatPlaytime(g.minutes)} />
					<Stat icon="play" label="Last played" value={g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'} />
					{ach.total > 0 && <Stat icon="trophy" label="Achievements" value={`${ach.achieved} / ${ach.total}`}><Ring v={ach.achieved / ach.total} /></Stat>}
					{(d.disk > 0 || g.sizeOnDisk > 0) && <Stat icon="disk" label="On disk" value={formatBytes(d.disk || g.sizeOnDisk)} />}
					{d.cloud && <Stat icon="spark" label="Cloud" value={d.cloud} />}
				</div>
				<button className="k-btn ghost round" aria-label="Properties" onClick={() => gameActions.properties(appid)}><Icon name="settings" size={18} /></button>
				<MoreMenu g={g} />
			</div>

			<nav className="k-tabs" ref={tabs}>
				{TABS.map((t) => (
					<button key={t.id} data-tab={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
						{t.label}{t.n ? <span>{t.n}</span> : null}
					</button>
				))}
				<i className="k-tab-ink" style={{ transform: `translateX(${ink.x}px)`, width: ink.w }} />
			</nav>

			<div className="k-tab-body" key={tab}>
				{tab === 'overview' && <Overview g={g} d={d} go={setTab} />}
				{tab === 'achievements' && (
					<div>
						<div className="k-ach-sum"><Ring v={ach.total ? ach.achieved / ach.total : 0} /><b>{ach.achieved} of {ach.total} unlocked</b><span>{ach.total ? Math.round((ach.achieved / ach.total) * 100) : 0}%</span></div>
						<div className="k-ach-grid">{ach.list.map((a) => <AchievementTile key={a.id} a={a} />)}</div>
						{ach.list.length < ach.total && <p className="k-muted">Steam shows {ach.list.length} of {ach.total} here; the rest load on the classic page.</p>}
					</div>
				)}
				{tab === 'media' && (
					<div className="k-shots">
						{d.shots.map((s, i) => <button key={s.handle} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }} onClick={() => setBox(i)}><img src={s.url} alt="" loading="lazy" /></button>)}
					</div>
				)}
				{tab === 'news' && <NewsList appid={appid} />}
				{tab === 'dlc' && (
					<div className="k-dlc">
						{d.dlc.map((x) => (
							<button key={x.appid} onClick={() => goNative(`https://store.steampowered.com/app/${x.appid}/`, 'discover')}>
								<img src={`https://shared.steamstatic.com/store_item_assets/steam/apps/${x.appid}/header.jpg`} alt="" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
								<b>{x.name}</b><span>{x.state === 'installed' ? 'Installed' : x.state === 'notinstalled' ? 'Not installed' : x.state || 'Owned'}</span>
							</button>
						))}
					</div>
				)}
			</div>
			{box >= 0 && <Lightbox shots={d.shots} index={box} onClose={() => setBox(-1)} />}
		</div>
	);
}

// Home: a cinematic spotlight of what you're most likely to play next, then rails and a cover wall.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import { go, openGame } from '../state/nav';
import { artFor, byRecent, formatAgo, formatPlaytime, playOrInstall, type Game } from '../steam/library';
import { Cover, WideCard } from './cards';
import { Rail } from './Rail';

let heroHover = false; // pauses spotlight rotation while the pointer is over it

function Spotlight({ g, picks }: { g: Game; picks: Game[] }) {
	// Steam loads hero/logo URLs on demand; look again shortly after asking for them
	const [, setTick] = useState(0);
	useEffect(() => { const t = setTimeout(() => setTick((n) => n + 1), 1200); return () => clearTimeout(t); }, [g.appid]);
	const art = artFor(g.appid);
	const [logoOk, setLogoOk] = useState(true);
	const [heroFailed, setHeroFailed] = useState(false);
	useEffect(() => { setLogoOk(true); setHeroFailed(false); }, [g.appid]);
	const heroSrc = heroFailed ? g.header : art.hero;
	// keep the previous artwork underneath so a new spotlight cross-fades instead of cutting
	const prev = useRef<{ id: number; src: string } | null>(null);
	const shown = useRef<{ id: number; src: string }>({ id: g.appid, src: heroSrc });
	if (shown.current.id !== g.appid) { prev.current = shown.current; }
	shown.current = { id: g.appid, src: heroSrc };
	const busy = g.status && /download|updat|install/i.test(g.status);
	return (
		<section className="k-hero" onMouseEnter={() => (heroHover = true)} onMouseLeave={() => (heroHover = false)}>
			<div className="k-hero-art">
				{prev.current && prev.current.id !== g.appid && <img key={'p' + prev.current.id} className="under" src={prev.current.src} alt="" />}
				<img key={g.appid} src={heroSrc} alt="" onError={() => setHeroFailed(true)} />
			</div>
			<div className="k-hero-scrim" />
			<div className="k-hero-body" key={'b' + g.appid}>
				<div className="k-eyebrow">{g.lastPlayed ? `Continue playing · ${formatAgo(g.lastPlayed)}` : 'In your library'}</div>
				{logoOk ? <img className="k-hero-logo" src={art.logo} alt={g.name} onError={() => setLogoOk(false)} /> : <h1 className="k-hero-title">{g.name}</h1>}
				<div className="k-meta">
					<span className="k-chip"><Icon name="clock" size={14} />{formatPlaytime(g.minutes)}</span>
					{g.minutes2w > 0 && g.minutes2w < g.minutes && <span className="k-chip">{formatPlaytime(g.minutes2w)} in the last two weeks</span>}
					<span className="k-chip">{busy ? g.status : g.installed ? 'Ready to play' : 'Not installed'}</span>
				</div>
				<div className="k-actions">
					<button className="k-btn primary" onClick={() => playOrInstall(g)}><Icon name={g.installed ? 'play' : 'install'} size={18} />{g.installed ? 'Play' : 'Install'}</button>
					<button className="k-btn ghost" onClick={(e) => openGame(g.appid, e.currentTarget.closest('.k-hero'))}>Game details</button>
				</div>
			</div>
			{picks.length > 1 && (
				<div className="k-picks" role="tablist" aria-label="Spotlight">
					{picks.map((p) => (
						<button key={p.appid} role="tab" aria-selected={p.appid === g.appid} aria-label={p.name} className={'k-pick' + (p.appid === g.appid ? ' on' : '')} onClick={() => setState({ spotlight: p.appid })}>
							<img src={p.header} alt="" />
						</button>
					))}
				</div>
			)}
		</section>
	);
}

export function Home() {
	const library = useKestrel((s) => s.library);
	const spot = useKestrel((s) => s.spotlight);
	const recent = useMemo(() => byRecent(library), [library]);
	const picks = recent.slice(0, 5);
	const current = picks.find((g) => g.appid === spot) ?? picks[0] ?? library[0];
	const ready = useMemo(() => {
		const seen = new Set(recent.slice(0, 12).map((g) => g.appid));
		return library.filter((g) => g.installed && !seen.has(g.appid)).sort((a, b) => b.lastPlayed - a.lastPlayed || a.sortName.localeCompare(b.sortName)).slice(0, 18);
	}, [library, recent]);
	const added = useMemo(() => [...library].sort((a, b) => b.added - a.added).slice(0, 12), [library]);
	const rotate = useKestrel((s) => s.settings.rotate);
	// Optional: move through the recent games every 12 s, pausing while the pointer is over the spotlight
	useEffect(() => {
		if (!rotate || picks.length < 2) return;
		const t = setInterval(() => {
			if (heroHover) return;
			const i = picks.findIndex((p) => p.appid === current?.appid);
			setState({ spotlight: picks[(i + 1) % picks.length].appid });
		}, 12000);
		return () => clearInterval(t);
	}, [rotate, picks.map((p) => p.appid).join(), current?.appid]);

	if (!current) return <div className="k-view"><div className="k-empty"><b>Loading your library</b>Kestrel is reading your games from Steam.</div></div>;
	return (
		<div className="k-view">
			<Spotlight g={current} picks={picks} />
			<section className="k-section">
				<div className="k-section-head"><h2>Jump back in</h2><span>{recent.length} played</span>
					<button onClick={() => go({ kind: 'library' })}>Open library <Icon name="forward" size={14} /></button></div>
				<Rail>{recent.slice(0, 12).map((g) => <WideCard key={g.appid} g={g} />)}</Rail>
			</section>
			{ready.length > 0 && (
				<section className="k-section">
					<div className="k-section-head"><h2>Ready to play</h2><span>Installed</span></div>
					<div className="k-grid">{ready.map((g) => <Cover key={g.appid} g={g} />)}</div>
				</section>
			)}
			<section className="k-section">
				<div className="k-section-head"><h2>Recently added</h2></div>
				<Rail>{added.map((g) => <WideCard key={g.appid} g={g} />)}</Rail>
			</section>
		</div>
	);
}

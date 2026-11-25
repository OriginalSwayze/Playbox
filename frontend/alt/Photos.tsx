// PHOTOS — a photo library. Every game's artwork is a photo, grouped by the month it joined your library, in a
// justified grid; collections are albums. Open one and it fills the screen with an info panel beside it.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Photos() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const groups = useMemo(() => {
		const m = new Map<string, Game[]>();
		for (const g of [...b.games].sort((x, y) => y.added - x.added)) { const k = g.added ? dateOf(g.added, { month: 'long', year: 'numeric' }) : 'Undated'; (m.get(k) ?? m.set(k, []).get(k)!).push(g); }
		return [...m];
	}, [b.games]);
	return (
		<AltPage className="pho" brand={<><span className="pho-logo"><i /><i /><i /><i /></span>Photos</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search your photos">
			<div className="pho-app">
				<nav className="pho-nav">
					<h5>Library</h5>
					{b.islands.filter((i) => i.id === 'all' || i.id === 'recent').map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.id === 'all' ? 'All photos' : 'Recents'}<em>{i.games.length}</em></button>)}
					<h5>Albums</h5>
					{b.islands.filter((i) => i.id !== 'all' && i.id !== 'recent').map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}<em>{i.games.length}</em></button>)}
				</nav>
				<section className="pho-roll">
					{groups.map(([month, gs]) => (
						<div key={month} className="pho-month">
							<h3>{month}<span>{gs.length} items</span></h3>
							<div className="pho-just">
								{gs.map((g) => <button key={g.appid} data-appid={g.appid} className="pho-ph" style={{ flexGrow: g.appid % 3 === 0 ? 1.2 : 2.14 }} onClick={() => select(g.appid)}><Art g={g} kind={g.appid % 3 === 0 ? 'capsule' : 'header'} /></button>)}
							</div>
						</div>
					))}
				</section>
				{sel && (
					<div className="pho-view" key={sel.appid}>
						<div className="pho-stagearea"><button className="pho-x" onClick={() => select(null)}>✕</button><Art g={sel} kind="hero" className="pho-big" /></div>
						<aside className="pho-info">
							<h3>{sel.name}</h3>
							<p className="pho-date">{dateOf(sel.added, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
							<dl><dt>Playtime</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Last opened</dt><dd>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</dd><dt>App ID</dt><dd>{sel.appid}</dd><dt>Location</dt><dd>{sel.installed ? 'On this device' : 'In the cloud (not installed)'}</dd></dl>
							<div className="pho-thumbs"><Art g={sel} kind="capsule" /><Art g={sel} kind="header" /></div>
							<PlayBtn g={sel} className="pho-go" />
							<Actions g={sel} className="pho-act" />
						</aside>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const photosCss = tok('photos', { bg: '#FFFFFF', s1: '#F2F2F7', s2: '#E5E5EA', s3: '#D1D1D6', fg: '#1C1C1E', fg2: '#3A3A3C', fg3: '#8E8E93', acc: '#FF7A1A', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.pho-brand { display: flex; gap: 9px; align-items: center; font: 600 19px var(--k-text); color: #1C1C1E; }
.pho-logo { position: relative; width: 24px; height: 24px; } .pho-logo i { position: absolute; left: 7px; top: 0; width: 10px; height: 13px; border-radius: 6px; transform-origin: 5px 12px; opacity: .85; }
.pho-logo i:nth-child(1) { background: #FF7A1A; } .pho-logo i:nth-child(2) { background: #FFC531; transform: rotate(90deg); } .pho-logo i:nth-child(3) { background: #3DB86A; transform: rotate(180deg); } .pho-logo i:nth-child(4) { background: #4C8DF6; transform: rotate(270deg); }
.pho-app { position: absolute; inset: 0; display: grid; grid-template-columns: 230px minmax(0, 1fr); }
.pho-nav { overflow-y: auto; padding: 14px 10px; background: #F7F7F9; border-right: 1px solid #E5E5EA; }
.pho-nav h5 { margin: 14px 10px 6px; font: 700 12px var(--k-text); color: #8E8E93; }
.pho-nav button { display: flex; justify-content: space-between; width: 100%; padding: 7px 10px; border-radius: 7px; font: 14px var(--k-text); color: #1C1C1E; text-align: left; } .pho-nav button:hover { background: #ECECF0; }
.pho-nav button.on { background: #FF7A1A; color: #fff; } .pho-nav em { font-style: normal; opacity: .55; font-size: 12px; }
.pho-roll { overflow-y: auto; padding: 10px 18px 60px; }
.pho-month h3 { position: sticky; top: 0; z-index: 1; margin: 0; padding: 18px 4px 10px; font: 700 24px var(--k-text); color: #1C1C1E; background: linear-gradient(#fff 70%, transparent); } .pho-month h3 span { margin-left: 10px; font: 13px var(--k-text); color: #8E8E93; }
.pho-just { display: flex; flex-wrap: wrap; gap: 3px; } .pho-just::after { content: ""; flex-grow: 999; }
.pho-ph { height: 190px; flex-basis: 140px; overflow: hidden; background: #E5E5EA; transition: filter .2s; } .pho-ph:hover { filter: brightness(1.08); }
.pho-ph img, .pho-ph .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; }
.pho-view { position: absolute; inset: 0; z-index: 5; display: grid; grid-template-columns: minmax(0, 1fr) 340px; background: #000; animation: k-fade .3s both; }
.pho-stagearea { position: relative; display: grid; place-items: center; overflow: hidden; } .pho-big { max-width: 100%; max-height: 100%; object-fit: contain; animation: pho-zoom .5s var(--k-out) both; }
@keyframes pho-zoom { from { transform: scale(.85); opacity: 0; } }
.pho-x { position: absolute; left: 16px; top: 16px; z-index: 1; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.16); color: #fff; }
.pho-info { overflow-y: auto; padding: 22px; background: #1C1C1E; color: #fff; } .pho-info h3 { margin: 0 0 4px; font: 700 20px var(--k-text); } .pho-date { margin: 0 0 18px; font: 13px var(--k-text); color: #8E8E93; }
.pho-info dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; font: 13px var(--k-text); padding: 14px; border-radius: 12px; background: #2C2C2E; margin: 0 0 14px; } .pho-info dt { color: #8E8E93; } .pho-info dd { margin: 0; }
.pho-thumbs { display: flex; gap: 6px; margin-bottom: 16px; } .pho-thumbs img { height: 64px; border-radius: 6px; }
.pho-go { width: 100%; height: 42px; border-radius: 10px; background: #FF7A1A !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 8px; }
.pho-act button { color: #E5E5EA !important; } .pho-act button:hover { background: #2C2C2E !important; color: #fff !important; }
`;

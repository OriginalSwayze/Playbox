// LISTINGS — a property site. Each game is a listing: priced in hours, its "floor area" is its size on disk, it was
// "listed" the day you added it. Filter by neighbourhood (collection) and features; a listing page books a viewing.
import { useMemo, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const price = (g: Game) => Math.round(g.minutes / 60).toLocaleString();
const days = (g: Game) => (g.added ? Math.floor((Date.now() / 1000 - g.added) / 86400) : 0);

export function Listings() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [inst, setInst] = useState(false);
	const [sort, setSort] = useState<'new' | 'price' | 'size'>('new');
	const [saved, setSaved] = useState<Record<number, boolean>>({});
	const list = useMemo(() => b.games.filter((g) => !inst || g.installed).sort((x, y) => (sort === 'new' ? y.added - x.added : sort === 'price' ? y.minutes - x.minutes : y.sizeOnDisk - x.sizeOnDisk)).slice(0, 120), [b.games, inst, sort]);
	const Heart = ({ g }: { g: Game }) => <button className={'est-heart' + (saved[g.appid] ? ' on' : '')} onClick={(e) => { e.stopPropagation(); setSaved({ ...saved, [g.appid]: !saved[g.appid] }); }}>{saved[g.appid] ? '♥' : '♡'}</button>;
	return (
		<AltPage className="est" brand={<><span className="est-roof">⌂</span>nestfind</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Address, neighbourhood or game">
			<div className="est-app">
				<div className="est-filters">
					<select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>Area: {i.name}</option>)}</select>
					<label><input type="checkbox" checked={inst} onChange={(e) => setInst(e.target.checked)} /> Move-in ready (installed)</label>
					<span className="est-sort">Sort: {(['new', 'price', 'size'] as const).map((s) => <button key={s} className={sort === s ? 'on' : ''} onClick={() => setSort(s)}>{s === 'new' ? 'Newest' : s === 'price' ? 'Price' : 'Size'}</button>)}</span>
					<span className="est-n">{list.length} homes</span>
				</div>
				{sel ? (
					<section className="est-page" key={sel.appid}>
						<button className="est-back" onClick={() => select(null)}>‹ Back to search</button>
						<div className="est-gal"><Art g={sel} kind="hero" /><Art g={sel} kind="capsule" /><Art g={sel} kind="header" /></div>
						<div className="est-pgrid">
							<div><h1>{price(sel)} h</h1><h2>{sel.name}</h2><p className="est-addr">{sel.appid} Library Lane · {b.isle?.name}</p>
								<div className="est-facts"><div><b>{sel.installed ? 'Yes' : 'No'}</b><span>Move-in ready</span></div><div><b>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</b><span>Floor area</span></div><div><b>{sel.metacritic || '—'}</b><span>Rating</span></div><div><b>{days(sel)}</b><span>Days listed</span></div></div>
								<h3>About this home</h3><p>{sel.minutes ? `Lived in for ${formatPlaytime(sel.minutes)}${sel.lastPlayed ? `, most recently ${formatAgo(sel.lastPlayed).toLowerCase()}` : ''}.` : 'Brand new and never lived in.'} Listed {dateOf(sel.added, { day: 'numeric', month: 'long', year: 'numeric' })}.</p></div>
							<aside className="est-agent"><b>Book a viewing</b><p>Kestrel Realty · usually responds instantly</p><PlayBtn g={sel} className="est-go" label={['Request a tour (Play)', 'Get it ready (Install)']} /><Heart g={sel} /><Actions g={sel} /></aside>
						</div>
					</section>
				) : (
					<section className="est-grid">{list.map((g) => (
						<button key={g.appid} data-appid={g.appid} className="est-card" onClick={() => select(g.appid)}>
							<span className="est-img"><Art g={g} kind="header" />{days(g) < 60 && g.added > 0 && <em>New listing</em>}<Heart g={g} /></span>
							<b>{price(g)} h</b><span className="est-meta">{g.installed ? 'Move-in ready' : 'Needs work'} · {g.sizeOnDisk ? formatBytes(g.sizeOnDisk) : 'size n/a'}</span><span className="est-addr2">{g.name}</span>
						</button>
					))}</section>
				)}
			</div>
		</AltPage>
	);
}

export const listingsCss = tok('listings', { bg: '#FFFFFF', s1: '#F6F7F8', s2: '#ECEEF0', s3: '#D9DDE1', fg: '#1A1D21', fg2: '#43484E', fg3: '#7A8088', acc: '#D92228', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.est-brand { display: flex; gap: 6px; align-items: center; font: 800 21px var(--k-text); color: #D92228; letter-spacing: -.03em; } .est-roof { font-size: 22px; }
.est-app { position: absolute; inset: 0; display: grid; grid-template-rows: 54px minmax(0, 1fr); }
.est-filters { display: flex; gap: 16px; align-items: center; padding: 0 24px; border-bottom: 1px solid #ECEEF0; font: 14px var(--k-text); color: #43484E; } .est-filters select { height: 34px; padding: 0 10px; border: 1px solid #D9DDE1; border-radius: 8px; font: 600 13px var(--k-text); }
.est-sort { display: flex; gap: 4px; align-items: center; } .est-sort button { padding: 6px 10px; border-radius: 99px; font: 600 13px var(--k-text); color: #43484E; } .est-sort button.on { background: #1A1D21; color: #fff; } .est-n { margin-left: auto; font-weight: 700; color: #1A1D21; }
.est-grid { overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px 18px; padding: 20px 24px 60px; align-content: start; }
.est-card { display: grid; gap: 2px; text-align: left; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.12); padding-bottom: 12px; transition: box-shadow .2s; } .est-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.16); }
.est-img { position: relative; aspect-ratio: 16/9; margin-bottom: 8px; } .est-img img, .est-img .alt-noart { width: 100%; height: 100%; object-fit: cover; } .est-img em { position: absolute; left: 10px; top: 10px; padding: 3px 8px; border-radius: 4px; background: #D92228; color: #fff; font: 700 11px var(--k-text); font-style: normal; }
.est-heart { position: absolute; right: 10px; top: 8px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.9); color: #D92228; font-size: 18px; } .est-heart.on { background: #D92228; color: #fff; }
.est-card > b { padding: 0 14px; font: 800 22px var(--k-text); color: #1A1D21; } .est-meta { padding: 0 14px; font: 14px var(--k-text); color: #43484E; } .est-addr2 { padding: 0 14px; font: 13px var(--k-text); color: #7A8088; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.est-page { overflow-y: auto; padding: 14px 40px 60px; animation: k-fade .25s both; } .est-back { font: 600 14px var(--k-text); color: #D92228; margin-bottom: 12px; }
.est-gal { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 6px; height: 420px; border-radius: 14px; overflow: hidden; } .est-gal img { width: 100%; height: 100%; object-fit: cover; } .est-gal img:first-child { grid-row: 1 / 3; }
.est-pgrid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 40px; margin-top: 22px; } .est-pgrid h1 { margin: 0; font: 800 34px var(--k-text); } .est-pgrid h2 { margin: 4px 0; font: 600 20px var(--k-text); } .est-addr { margin: 0 0 18px; color: #7A8088; }
.est-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 14px 0; border-top: 1px solid #ECEEF0; border-bottom: 1px solid #ECEEF0; } .est-facts b { display: block; font: 800 20px var(--k-text); } .est-facts span { font: 13px var(--k-text); color: #7A8088; }
.est-pgrid h3 { margin: 20px 0 6px; font: 700 18px var(--k-text); } .est-pgrid p { font: 15px/1.6 var(--k-text); color: #43484E; }
.est-agent { position: relative; align-self: start; padding: 20px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,.12); } .est-agent > b { font: 800 18px var(--k-text); } .est-agent p { margin: 4px 0 14px; font: 13px var(--k-text); }
.est-agent .est-heart { position: static; width: 100%; height: 40px; margin: 8px 0; border-radius: 10px; box-shadow: inset 0 0 0 1px #D92228; }
.est-go { width: 100%; height: 48px; border-radius: 10px; background: #D92228 !important; color: #fff !important; font: 700 15px var(--k-text) !important; }
`;

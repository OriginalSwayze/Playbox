// APPSHOP — a mobile app store. "Today" has big editorial story cards; the chart lists games by playtime with GET /
// OPEN pills; a product page has the rating, size, age-style info row, screenshots, What's New and an info table.
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

const stars = (g: Game) => (g.metacritic ? (g.metacritic / 20).toFixed(1) : '—');

export function Appshop() {
	const b = useBrowse();
	const { recent, unplayed, top } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const Pill = ({ g }: { g: Game }) => <PlayBtn g={g} className="aps-pill" label={['OPEN', 'GET']} />;
	const Row = ({ g, n }: { g: Game; n?: number }) => (
		<div className="aps-row">{n !== undefined && <em>{n}</em>}<button data-appid={g.appid} className="aps-ico" onClick={() => select(g.appid)}><Art g={g} kind="capsule" /></button><button className="aps-rt" onClick={() => select(g.appid)}><b>{g.name}</b><span>{g.minutes ? formatPlaytime(g.minutes) + ' played' : 'New to you'}</span></button><Pill g={g} /></div>
	);
	return (
		<AltPage className="aps" brand={<>✦ Appshop</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Games, collections…">
			<div className="aps-app">
				{sel ? (
					<section className="aps-pdp" key={sel.appid}>
						<button className="aps-back" onClick={() => select(null)}>‹ Today</button>
						<div className="aps-top"><span className="aps-bigico"><Art g={sel} kind="capsule" /></span><div><h1>{sel.name}</h1><p>Kestrel Library</p><div className="aps-cta"><PlayBtn g={sel} className="aps-pill big" label={['OPEN', 'GET']} /><Actions g={sel} className="aps-act" /></div></div></div>
						<div className="aps-info"><div><em>Rating</em><b>{stars(sel)}</b><span>★★★★★</span></div><div><em>Played</em><b>{Math.round(sel.minutes / 60)}h</b><span>all time</span></div><div><em>Size</em><b>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</b><span>{sel.installed ? 'installed' : 'download'}</span></div><div><em>Added</em><b>{dateOf(sel.added, { year: 'numeric' })}</b><span>{dateOf(sel.added, { month: 'short' })}</span></div><div><em>Last</em><b>{sel.lastPlayed ? formatAgo(sel.lastPlayed).replace(/ ago/, '') : '—'}</b><span>{sel.lastPlayed ? 'ago' : 'never'}</span></div></div>
						<div className="aps-shots"><Art g={sel} kind="hero" /><Art g={sel} kind="header" /><Art g={sel} kind="capsule" /></div>
						<h3>What's New</h3><p className="aps-new">{sel.minutes2w ? `You played ${formatPlaytime(sel.minutes2w)} in the last two weeks.` : 'No recent activity.'} {sel.needsUpdate ? 'An update is waiting.' : ''}</p>
						<h3>Information</h3><dl className="aps-tbl"><dt>App ID</dt><dd>{sel.appid}</dd><dt>Status</dt><dd>{sel.installed ? 'Installed' : 'Not installed'}</dd><dt>Metascore</dt><dd>{sel.metacritic || 'Not rated'}</dd><dt>Added</dt><dd>{dateOf(sel.added)}</dd></dl>
					</section>
				) : b.found ? (
					<section className="aps-list"><h2>Results</h2>{b.found.slice(0, 60).map((g) => <Row key={g.appid} g={g} />)}</section>
				) : (
					<section className="aps-today">
						<p className="aps-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p><h1>Today</h1>
						<div className="aps-stories">
							{recent[0] && <button data-appid={recent[0].appid} className="aps-story big" onClick={() => select(recent[0].appid)}><Art g={recent[0]} kind="hero" /><div><em>PICK UP WHERE YOU LEFT OFF</em><b>{recent[0].name}</b><span>{formatAgo(recent[0].lastPlayed)}</span></div></button>}
							{unplayed[0] && <button className="aps-story" onClick={() => select(unplayed[0].appid)}><Art g={unplayed[0]} kind="header" /><div><em>HIDDEN GEM</em><b>{unplayed[0].name}</b><span>You've never played it</span></div></button>}
							{top[0] && <button className="aps-story" onClick={() => select(top[0].appid)}><Art g={top[0]} kind="header" /><div><em>YOUR ALL-TIME FAVOURITE</em><b>{top[0].name}</b><span>{formatPlaytime(top[0].minutes)}</span></div></button>}
						</div>
						<div className="aps-cols">
							<div className="aps-list"><h2>Top charts <select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></h2>{[...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 10).map((g, i) => <Row key={g.appid} g={g} n={i + 1} />)}</div>
							<div className="aps-list"><h2>New to you</h2>{unplayed.slice(0, 10).map((g) => <Row key={g.appid} g={g} />)}</div>
						</div>
					</section>
				)}
			</div>
		</AltPage>
	);
}

export const appshopCss = tok('appshop', { bg: '#FFFFFF', s1: '#F2F2F7', s2: '#E5E5EA', s3: '#D1D1D6', fg: '#000000', fg2: '#3C3C43', fg3: '#8A8A8E', acc: '#0A84FF', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.aps-brand { font: 800 18px var(--k-text); color: #0A84FF; }
.aps-app { position: absolute; inset: 0; overflow-y: auto; } .aps-today, .aps-pdp, .aps-list { max-width: 1100px; margin: 0 auto; padding: 20px 30px 60px; }
.aps-date { margin: 0; font: 600 13px var(--k-text); color: #8A8A8E; } .aps-today h1 { margin: 0 0 18px; font: 800 36px var(--k-text); }
.aps-stories { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 220px 220px; gap: 20px; margin-bottom: 30px; }
.aps-story { position: relative; border-radius: 20px; overflow: hidden; text-align: left; color: #fff; box-shadow: 0 12px 30px -12px rgba(0,0,0,.4); transition: transform .3s var(--k-spring); } .aps-story:hover { transform: scale(.985); } .aps-story.big { grid-row: span 2; }
.aps-story > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .aps-story > div { position: absolute; inset: auto 0 0; padding: 50px 20px 18px; background: linear-gradient(transparent, rgba(0,0,0,.75)); }
.aps-story em { display: block; font: 700 12px var(--k-text); font-style: normal; opacity: .85; } .aps-story b { display: block; font: 800 26px/1.1 var(--k-text); } .aps-story.big b { font-size: 36px; } .aps-story span { font: 14px var(--k-text); opacity: .85; }
.aps-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; } .aps-list { padding: 0 !important; } .aps-list h2 { display: flex; justify-content: space-between; align-items: center; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid #E5E5EA; font: 800 22px var(--k-text); } .aps-list h2 select { border: 0; font: 15px var(--k-text); color: #0A84FF; }
.aps-row { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid #F2F2F7; } .aps-row em { width: 20px; font: 700 17px var(--k-text); font-style: normal; color: #000; }
.aps-ico { width: 60px; height: 60px; flex: none; border-radius: 14px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); } .aps-ico img, .aps-ico .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 6px; }
.aps-rt { flex: 1; min-width: 0; text-align: left; } .aps-rt b { display: block; font: 500 16px var(--k-text); color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .aps-rt span { font: 13px var(--k-text); color: #8A8A8E; }
.aps-pill { min-width: 74px; height: 30px; padding: 0 16px; border-radius: 15px; background: #F2F2F7 !important; color: #0A84FF !important; font: 800 14px var(--k-text) !important; } .aps-pill.big { background: #0A84FF !important; color: #fff !important; height: 34px; }
.aps-pdp { animation: k-fade .25s both; } .aps-back { color: #0A84FF; font: 15px var(--k-text); margin-bottom: 16px; }
.aps-top { display: flex; gap: 24px; } .aps-bigico { width: 150px; height: 150px; border-radius: 34px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,.15); flex: none; } .aps-bigico img { width: 100%; height: 100%; object-fit: cover; }
.aps-top h1 { margin: 6px 0 2px; font: 800 30px var(--k-text); } .aps-top p { margin: 0 0 14px; color: #8A8A8E; } .aps-cta { display: flex; gap: 16px; align-items: flex-start; } .aps-act { grid-auto-flow: column; }
.aps-info { display: grid; grid-template-columns: repeat(5, 1fr); margin: 24px 0; padding: 12px 0; border-top: 1px solid #E5E5EA; border-bottom: 1px solid #E5E5EA; text-align: center; } .aps-info div { border-right: 1px solid #E5E5EA; } .aps-info div:last-child { border: 0; }
.aps-info em { display: block; font: 700 11px var(--k-text); font-style: normal; color: #8A8A8E; text-transform: uppercase; } .aps-info b { display: block; font: 800 22px var(--k-text); color: #3C3C43; } .aps-info span { font: 12px var(--k-text); color: #8A8A8E; }
.aps-shots { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 6px; } .aps-shots img { height: 300px; border-radius: 16px; flex: none; }
.aps-pdp h3 { margin: 24px 0 8px; font: 800 22px var(--k-text); } .aps-new { font: 15px/1.5 var(--k-text); color: #3C3C43; }
.aps-tbl { display: grid; grid-template-columns: 200px 1fr; margin: 0; } .aps-tbl dt, .aps-tbl dd { margin: 0; padding: 10px 0; border-bottom: 1px solid #F2F2F7; font: 15px var(--k-text); } .aps-tbl dt { color: #8A8A8E; }
`;

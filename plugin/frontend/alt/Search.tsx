// SEARCH — a web search engine for your library. The home page is a logo and a box; results come as ranked links
// with breadcrumbs and snippets, an Images tab, and a knowledge panel for the chosen game with its actions.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Art, AltPage, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const snip = (g: Game) => `${g.minutes ? `Played for ${formatPlaytime(g.minutes)}` : 'Never played'}${g.lastPlayed ? ` · last session ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}. ${g.installed ? 'Installed on this PC.' : 'Not installed.'}${g.metacritic ? ` Metascore ${g.metacritic}.` : ''} Added ${dateOf(g.added)}.`;

export function Search() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [tab, setTab] = useState<'all' | 'images'>('all');
	const [page, setPage] = useState(0);
	const [home, setHome] = useState(true);
	const res = b.found ?? b.games;
	const shown = res.slice(page * 10, page * 10 + 10);
	const panel = sel ?? (b.found ? b.found[0] : null);
	const Logo = ({ big }: { big?: boolean }) => <span className={'srp-logo' + (big ? ' big' : '')}><b>s</b><b>e</b><b>e</b><b>k</b></span>;
	const box = <label className="srp-box"><span>⌕</span><input value={b.q} autoFocus onChange={(e) => { b.setQ(e.target.value); setPage(0); setHome(false); }} placeholder="Search your library" spellCheck={false} /></label>;
	if (home && !sel && !b.q) return (
		<AltPage className="srp" brand={<Logo />}>
			<div className="srp-home"><Logo big />{box}<div className="srp-btns"><button onClick={() => setHome(false)}>Browse everything</button><button onClick={() => { const g = res[Math.floor(Math.random() * res.length)]; g && select(g.appid); setHome(false); }}>I'm feeling lucky</button></div>
				<p className="srp-cols">{b.islands.slice(0, 8).map((i) => <button key={i.id} onClick={() => { b.setCur(i.id); setHome(false); }}>{i.name}</button>)}</p></div>
		</AltPage>
	);
	return (
		<AltPage className="srp" brand={<Logo />}>
			<div className="srp-app">
				<div className="srp-head">{box}<div className="srp-tabs"><button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>All</button><button className={tab === 'images' ? 'on' : ''} onClick={() => setTab('images')}>Images</button>
					<select value={b.cur} onChange={(e) => { b.setCur(e.target.value); setPage(0); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>In: {i.name}</option>)}</select></div></div>
				<div className="srp-body">
					<section className="srp-res">
						<p className="srp-stats">About {res.length} results</p>
						{tab === 'images' ? <div className="srp-imgs">{res.slice(0, 60).map((g) => <button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="header" /><span>{g.name}</span></button>)}</div>
							: shown.map((g) => (
								<article key={g.appid} className="srp-hit">
									<div className="srp-crumb"><span className="srp-fav"><Art g={g} kind="capsule" /></span><span><b>Steam library</b><em>steam://app/{g.appid}</em></span></div>
									<button data-appid={g.appid} className="srp-title" onClick={() => select(g.appid)}>{g.name}</button>
									<p>{snip(g)}</p>
								</article>
							))}
						{tab === 'all' && res.length > 10 && <div className="srp-pages"><Logo />{Array.from({ length: Math.min(10, Math.ceil(res.length / 10)) }, (_, i) => <button key={i} className={i === page ? 'on' : ''} onClick={() => setPage(i)}>{i + 1}</button>)}<button onClick={() => setPage(Math.min(Math.ceil(res.length / 10) - 1, page + 1))}>Next</button></div>}
					</section>
					{panel && (
						<aside className="srp-kp" key={panel.appid}>
							<Art g={panel} kind="header" />
							<h2>{panel.name}</h2><p className="srp-kind">Game in your library</p>
							<p>{snip(panel)}</p>
							<dl><dt>Playtime</dt><dd>{formatPlaytime(panel.minutes)}</dd><dt>Last played</dt><dd>{panel.lastPlayed ? dateOf(panel.lastPlayed) : 'Never'}</dd><dt>App ID</dt><dd>{panel.appid}</dd></dl>
							<div className="srp-acts">{gameCommands(panel).map((c) => <button key={c.id} className={c.primary ? 'p' : ''} onClick={c.run}>{c.primary ? (panel.installed ? 'Play' : 'Install') : c.label}</button>)}</div>
						</aside>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const searchCss = tok('search', { bg: '#FFFFFF', s1: '#F3F4F6', s2: '#E9EBEF', s3: '#D8DBE1', fg: '#1F2328', fg2: '#4D5562', fg3: '#6E7681', acc: '#6D3FD8', on: '#fff', font: 'Arial, "Segoe UI", sans-serif' }) + `
.srp-logo { display: inline-flex; font: 800 24px "Segoe UI", sans-serif; letter-spacing: -.04em; } .srp-logo b { color: #6D3FD8; } .srp-logo b:nth-child(2), .srp-logo b:nth-child(3) { color: #fff; -webkit-text-stroke: 2px #6D3FD8; }
.srp-logo.big { font-size: 96px; margin-bottom: 26px; }
.srp-home { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; padding-bottom: 12vh; }
.srp-box { display: flex; gap: 12px; align-items: center; width: min(620px, 80vw); height: 48px; padding: 0 18px; border-radius: 24px; border: 1px solid #D8DBE1; background: #fff; color: #6E7681; font-size: 18px; } .srp-box:hover, .srp-box:focus-within { box-shadow: 0 2px 8px rgba(32,33,36,.2); border-color: transparent; }
.srp-box input { flex: 1; border: 0; outline: none; font: 16px Arial, sans-serif; color: #1F2328; background: none; }
.srp-btns { display: flex; gap: 12px; margin-top: 26px; } .srp-btns button { height: 36px; padding: 0 16px; border-radius: 6px; background: #F3F4F6; font: 14px Arial, sans-serif; color: #1F2328; } .srp-btns button:hover { box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.srp-cols { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 30px; max-width: 700px; } .srp-cols button { font: 13px Arial, sans-serif; color: #6D3FD8; }
.srp-app { position: absolute; inset: 0; overflow-y: auto; }
.srp-head { position: sticky; top: 0; z-index: 2; padding: 16px 0 0 170px; background: #fff; border-bottom: 1px solid #E9EBEF; } .srp-head .srp-box { height: 44px; }
.srp-tabs { display: flex; gap: 24px; align-items: center; margin-top: 10px; } .srp-tabs button { padding: 10px 2px; font: 14px Arial, sans-serif; color: #4D5562; } .srp-tabs button.on { color: #6D3FD8; box-shadow: inset 0 -3px #6D3FD8; } .srp-tabs select { border: 0; font: 14px Arial, sans-serif; color: #4D5562; background: none; }
.srp-body { display: grid; grid-template-columns: minmax(0, 650px) 380px; gap: 60px; padding: 0 30px 60px 170px; }
.srp-stats { font: 14px Arial, sans-serif; color: #6E7681; margin: 12px 0 18px; }
.srp-hit { margin-bottom: 28px; } .srp-crumb { display: flex; gap: 10px; align-items: center; } .srp-fav { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: #F3F4F6; } .srp-fav img { width: 100%; height: 100%; object-fit: cover; }
.srp-crumb b { display: block; font: 14px Arial, sans-serif; color: #1F2328; } .srp-crumb em { font: 12px Arial, sans-serif; font-style: normal; color: #4D5562; }
.srp-title { display: block; margin: 6px 0 4px; font: 20px Arial, sans-serif; color: #4B2BB0; text-align: left; } .srp-title:hover { text-decoration: underline; } .srp-hit p { margin: 0; font: 14px/1.58 Arial, sans-serif; color: #4D5562; }
.srp-imgs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; } .srp-imgs button { display: grid; gap: 4px; text-align: left; } .srp-imgs img { width: 100%; border-radius: 8px; } .srp-imgs span { font: 12px Arial, sans-serif; color: #4D5562; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.srp-pages { display: flex; gap: 14px; align-items: center; margin-top: 30px; } .srp-pages button { font: 14px Arial, sans-serif; color: #6D3FD8; } .srp-pages button.on { color: #1F2328; font-weight: 700; }
.srp-kp { align-self: start; position: sticky; top: 130px; margin-top: 20px; padding: 0 0 16px; border: 1px solid #E9EBEF; border-radius: 10px; overflow: hidden; animation: k-fade .25s both; } .srp-kp > img { width: 100%; display: block; }
.srp-kp h2 { margin: 14px 16px 2px; font: 28px Arial, sans-serif; color: #1F2328; } .srp-kind { margin: 0 16px 10px !important; color: #6E7681 !important; } .srp-kp p { margin: 0 16px 12px; font: 14px/1.55 Arial, sans-serif; color: #4D5562; }
.srp-kp dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 16px 14px; font: 14px Arial, sans-serif; } .srp-kp dt { font-weight: 700; color: #1F2328; } .srp-kp dd { margin: 0; color: #4D5562; }
.srp-acts { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px; } .srp-acts button { height: 34px; padding: 0 14px; border-radius: 17px; border: 1px solid #D8DBE1; font: 13px Arial, sans-serif; color: #6D3FD8; } .srp-acts button.p { background: #6D3FD8; border-color: #6D3FD8; color: #fff; }
`;

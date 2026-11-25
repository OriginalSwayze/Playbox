// TUBE — a video site. Chips along the top are your collections, every game is a video (its length is your
// playtime), and opening one goes to a watch page: the big player plays the game, "Up next" sits beside it.
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { useState } from 'react';

const dur = (g: Game) => (g.minutes >= 60 ? `${Math.floor(g.minutes / 60)}:${String(g.minutes % 60).padStart(2, '0')}:00` : `${g.minutes}:00`);
const views = (g: Game) => (g.minutes > 1000 ? (g.minutes / 1000).toFixed(1) + 'K' : String(g.minutes)) + ' views';

export function Tube() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [subbed, setSubbed] = useState(false);
	const V = ({ g, small }: { g: Game; small?: boolean }) => (
		<button data-appid={g.appid} className={'tub-v' + (small ? ' sm' : '')} onClick={() => select(g.appid)}>
			<span className="tub-th"><Art g={g} kind="header" /><i>{dur(g)}</i>{g.minutes2w > 0 && <b className="tub-prog" style={{ width: Math.min(100, 20 + g.minutes2w / 10) + '%' }} />}</span>
			<span className="tub-meta">{!small && <span className="tub-ch"><Art g={g} kind="capsule" /></span>}<span><strong>{g.name}</strong><em>{g.installed ? 'Installed ✓' : 'Not installed'}</em><em>{views(g)} · {g.lastPlayed ? formatAgo(g.lastPlayed).toLowerCase() : 'never watched'}</em></span></span>
		</button>
	);
	return (
		<AltPage className="tub" brand={<><span className="tub-logo"><Icon name="play" size={12} /></span>Tube</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search">
			<div className="tub-app">
				<nav className="tub-side">
					{[['Home', 'recent'], ['Library', 'all']].map(([n, id]) => <button key={id} className={b.cur === id && !b.found ? 'on' : ''} onClick={() => { select(null); b.setQ(''); b.setCur(id); }}>{n}</button>)}
					<hr /><h5>Subscriptions</h5>
					{b.islands.filter((i) => i.id !== 'all' && i.id !== 'recent').map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { select(null); b.setQ(''); b.setCur(i.id); }}><span className="tub-dot">{i.name[0]}</span>{i.name}</button>)}
				</nav>
				{sel ? (
					<section className="tub-watch" key={sel.appid}>
						<div className="tub-col">
							<div className="tub-player"><Art g={sel} kind="hero" /><PlayBtn g={sel} className="tub-big"><Icon name={sel.installed ? 'play' : 'install'} size={34} /></PlayBtn><div className="tub-bar"><i style={{ width: Math.min(100, sel.minutes2w / 6) + '%' }} /></div></div>
							<h1>{sel.name}</h1>
							<div className="tub-row"><span className="tub-ch big"><Art g={sel} kind="capsule" /></span><div><b>{sel.name}</b><em>{formatPlaytime(sel.minutes)} watched</em></div><button className={'tub-sub' + (subbed ? ' on' : '')} onClick={() => setSubbed(!subbed)}>{subbed ? 'Subscribed' : 'Subscribe'}</button><span className="tub-like">👍 {sel.metacritic || '—'} | 👎</span></div>
							<div className="tub-desc"><b>{views(sel)} · Added {dateOf(sel.added)}</b><p>{sel.installed ? 'Ready to play on this PC.' : 'Install to watch.'} Last played {sel.lastPlayed ? formatAgo(sel.lastPlayed).toLowerCase() : 'never'}.</p><Actions g={sel} className="tub-act" /></div>
						</div>
						<aside className="tub-next"><h4>Up next</h4>{b.games.filter((g) => g.appid !== sel.appid).slice(0, 20).map((g) => <V key={g.appid} g={g} small />)}</aside>
					</section>
				) : (
					<section className="tub-home">
						<div className="tub-chips">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</div>
						<div className="tub-grid">{b.games.slice(0, 160).map((g) => <V key={g.appid} g={g} />)}</div>
					</section>
				)}
			</div>
		</AltPage>
	);
}

export const tubeCss = tok('tube', { bg: '#0F0F0F', s1: '#222', s2: '#272727', s3: '#3F3F3F', fg: '#F1F1F1', fg2: '#CCCCCC', fg3: '#AAAAAA', acc: '#3EA6FF', on: '#0F0F0F', font: '"Segoe UI", Roboto, sans-serif' }) + `
.tub-brand { display: flex; gap: 6px; align-items: center; font: 700 20px var(--k-text); letter-spacing: -.04em; color: #fff; }
.tub-logo { display: grid; place-items: center; width: 30px; height: 21px; border-radius: 6px; background: #7B5CFF; color: #fff; }
.tub-app { position: absolute; inset: 0; display: grid; grid-template-columns: 230px minmax(0, 1fr); }
.tub-side { overflow-y: auto; padding: 10px; } .tub-side button { display: flex; gap: 14px; align-items: center; width: 100%; height: 40px; padding: 0 12px; border-radius: 10px; font: 14px var(--k-text); color: #F1F1F1; text-align: left; white-space: nowrap; overflow: hidden; }
.tub-side button:hover { background: #272727; } .tub-side button.on { background: #272727; font-weight: 600; } .tub-side hr { border: 0; border-top: 1px solid #3F3F3F; margin: 10px 0; } .tub-side h5 { margin: 6px 12px; font: 600 15px var(--k-text); color: #fff; }
.tub-dot { width: 24px; height: 24px; flex: none; border-radius: 50%; background: #3F3F3F; font: 700 11px/24px var(--k-text); text-align: center; }
.tub-home { overflow-y: auto; padding: 0 24px 60px; }
.tub-chips { position: sticky; top: 0; z-index: 2; display: flex; gap: 10px; padding: 12px 0; background: #0F0F0F; overflow-x: auto; } .tub-chips button { flex: none; height: 32px; padding: 0 12px; border-radius: 8px; background: #272727; font: 600 14px var(--k-text); color: #F1F1F1; } .tub-chips button.on { background: #F1F1F1; color: #0F0F0F; }
.tub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 36px 16px; padding-top: 10px; }
.tub-v { display: grid; gap: 12px; text-align: left; align-content: start; } .tub-th { position: relative; display: block; aspect-ratio: 460/215; border-radius: 12px; overflow: hidden; background: #272727; transition: border-radius .2s; }
.tub-v:hover .tub-th { border-radius: 0; } .tub-th img, .tub-th .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.tub-th i { position: absolute; right: 6px; bottom: 6px; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,.8); color: #fff; font: 600 12px var(--k-text); font-style: normal; }
.tub-prog { position: absolute; left: 0; bottom: 0; height: 4px; background: #7B5CFF; }
.tub-meta { display: flex; gap: 12px; } .tub-ch { width: 36px; height: 36px; flex: none; border-radius: 50%; overflow: hidden; } .tub-ch img { width: 100%; height: 100%; object-fit: cover; } .tub-ch.big { width: 40px; height: 40px; }
.tub-meta strong { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font: 600 16px/1.35 var(--k-text); color: #F1F1F1; margin-bottom: 4px; } .tub-meta em { display: block; font: 14px var(--k-text); font-style: normal; color: #AAAAAA; }
.tub-watch { overflow-y: auto; display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 24px; padding: 24px; animation: k-fade .3s both; }
.tub-player { position: relative; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #000; } .tub-player > img { width: 100%; height: 100%; object-fit: cover; }
.tub-big { position: absolute; left: 50%; top: 50%; width: 76px; height: 54px; margin: -27px -38px; border-radius: 16px; display: grid; place-items: center; background: rgba(123,92,255,.92) !important; color: #fff !important; transition: transform .2s; } .tub-big:hover { transform: scale(1.1); }
.tub-bar { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 4px; background: rgba(255,255,255,.3); } .tub-bar i { display: block; height: 100%; background: #7B5CFF; }
.tub-col h1 { margin: 14px 0 10px; font: 700 21px var(--k-text); color: #F1F1F1; }
.tub-row { display: flex; gap: 12px; align-items: center; } .tub-row b { display: block; font: 600 16px var(--k-text); color: #fff; } .tub-row em { font: 12px var(--k-text); font-style: normal; color: #AAA; }
.tub-sub { height: 36px; padding: 0 16px; margin-left: 14px; border-radius: 18px; background: #F1F1F1; color: #0F0F0F; font: 600 14px var(--k-text); } .tub-sub.on { background: #272727; color: #F1F1F1; }
.tub-like { margin-left: auto; height: 36px; padding: 0 16px; border-radius: 18px; background: #272727; font: 600 14px/36px var(--k-text); color: #F1F1F1; }
.tub-desc { margin-top: 12px; padding: 12px; border-radius: 12px; background: #272727; font: 14px var(--k-text); color: #F1F1F1; } .tub-desc p { margin: 6px 0 8px; } .tub-act { grid-template-columns: repeat(4, auto); justify-content: start; } .tub-act button { color: #F1F1F1 !important; } .tub-act button:hover { background: #3F3F3F !important; }
.tub-next h4 { margin: 0 0 10px; font: 600 16px var(--k-text); color: #fff; } .tub-next { display: grid; gap: 10px; align-content: start; }
.tub-v.sm { grid-template-columns: 168px 1fr; gap: 8px; } .tub-v.sm .tub-th { border-radius: 8px; } .tub-v.sm strong { font-size: 14px; }
`;

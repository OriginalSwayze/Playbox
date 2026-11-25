// STREAM — a music streaming app. Collections are playlists in the sidebar, games are tracks (their length is
// your playtime), and the bar along the bottom is "now playing": the big round button starts the game.
import { useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const len = (g: Game) => { const m = g.minutes; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };

export function Stream() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [liked, setLiked] = useState<Record<number, boolean>>({});
	const list = b.games.slice(0, 300);
	const total = b.games.reduce((n, g) => n + g.minutes, 0);
	return (
		<AltPage className="mus" brand={<><span className="mus-logo"><i /><i /><i /></span>Stream</>} search={b.q} onSearch={b.setQ} searchPlaceholder="What do you want to play?">
			<div className="mus-app">
				<aside className="mus-side">
					<h4><Icon name="library" size={16} />Your library</h4>
					{b.islands.map((i) => (
						<button key={i.id} className={'mus-pl' + (b.cur === i.id && !b.found ? ' on' : '')} onClick={() => { b.setQ(''); b.setCur(i.id); }}>
							<span className="mus-plart">{i.games[0] && <Art g={i.games[0]} kind="capsule" />}</span>
							<span><b>{i.name}</b><em>Playlist · {i.games.length} tracks</em></span>
						</button>
					))}
				</aside>
				<section className="mus-main">
					<header className="mus-head">
						<div className="mus-mosaic">{b.games.slice(0, 4).map((g) => <Art key={g.appid} g={g} kind="capsule" />)}</div>
						<div><span>Playlist</span><h1>{b.found ? `Results for “${b.q.trim()}”` : b.isle?.name}</h1><p>Kestrel · {b.games.length} tracks, {formatPlaytime(total)}</p></div>
					</header>
					<div className="mus-table">
						<div className="mus-tr mus-th"><span>#</span><span>Title</span><span>Status</span><span>Last played</span><span><Icon name="clock" size={14} /></span></div>
						{list.map((g, i) => (
							<div key={g.appid} data-appid={g.appid} className={'mus-tr' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)} onDoubleClick={() => select(g.appid)}>
								<span className="n">{sel?.appid === g.appid ? <span className="mus-eq"><i /><i /><i /></span> : i + 1}</span>
								<span className="t"><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{g.installed ? 'Downloaded' : 'Stream (install)'}</em></span></span>
								<span>{g.status || (g.installed ? 'Ready' : '—')}</span>
								<span>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</span>
								<span className="d"><button className={'mus-heart' + (liked[g.appid] ? ' on' : '')} onClick={(e) => { e.stopPropagation(); setLiked({ ...liked, [g.appid]: !liked[g.appid] }); }}>♥</button>{len(g)}</span>
							</div>
						))}
					</div>
				</section>
				{sel && <aside className="mus-np" key={sel.appid}><Art g={sel} kind="capsule" className="mus-npart" /><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} played</p><Actions g={sel} className="mus-act" /></aside>}
				<footer className="mus-bar">
					{sel ? <><div className="mus-now"><Art g={sel} kind="capsule" /><span><b>{sel.name}</b><em>{sel.installed ? 'Kestrel' : 'Not downloaded'}</em></span></div>
						<div className="mus-ctl"><div><button onClick={() => { const i = list.findIndex((x) => x.appid === sel.appid); list[i - 1] && select(list[i - 1].appid); }}>⏮</button><PlayBtn g={sel} className="mus-play"><Icon name={sel.installed ? 'play' : 'install'} size={18} /></PlayBtn><button onClick={() => { const i = list.findIndex((x) => x.appid === sel.appid); list[i + 1] && select(list[i + 1].appid); }}>⏭</button></div>
							<div className="mus-prog"><span>0:00</span><i><b style={{ width: Math.min(100, sel.minutes2w / 6) + '%' }} /></i><span>{len(sel)}</span></div></div>
						<div className="mus-vol">{sel.installed ? 'Play' : 'Install'} with the round button</div></>
						: <div className="mus-hint">Pick a track</div>}
				</footer>
			</div>
		</AltPage>
	);
}

export const streamCss = tok('stream', { bg: '#000000', s1: '#1F1F1F', s2: '#2A2A2A', s3: '#333', fg: '#FFFFFF', fg2: '#B3B3B3', fg3: '#7A7A7A', acc: '#B38CFF', on: '#000', font: '"Segoe UI", system-ui, sans-serif' }) + `
.mus-brand { display: flex; align-items: center; gap: 9px; font: 800 19px var(--k-text); color: #fff; }
.mus-logo { display: grid; gap: 2px; width: 24px; height: 24px; padding: 6px 5px; border-radius: 50%; background: #B38CFF; } .mus-logo i { height: 2px; border-radius: 2px; background: #000; } .mus-logo i:nth-child(2) { margin: 0 1px; } .mus-logo i:nth-child(3) { margin: 0 3px; }
.mus-app { position: absolute; inset: 0 8px 8px; display: grid; grid-template-columns: 300px minmax(0, 1fr) auto; grid-template-rows: minmax(0, 1fr) 76px; gap: 8px; }
.mus-side, .mus-main, .mus-np { border-radius: 8px; background: #121212; overflow-y: auto; }
.mus-side { padding: 12px 8px; } .mus-side h4 { display: flex; gap: 10px; align-items: center; margin: 4px 10px 12px; font: 700 15px var(--k-text); color: #B3B3B3; }
.mus-pl { display: flex; gap: 12px; align-items: center; width: 100%; padding: 8px; border-radius: 6px; text-align: left; } .mus-pl:hover { background: #1A1A1A; } .mus-pl.on { background: #232323; }
.mus-plart { width: 48px; height: 48px; flex: none; border-radius: 4px; overflow: hidden; background: #282828; } .mus-plart img { width: 100%; height: 100%; object-fit: cover; }
.mus-pl b { display: block; font: 600 14px var(--k-text); color: #fff; } .mus-pl.on b { color: #B38CFF; } .mus-pl em { font: 13px var(--k-text); font-style: normal; color: #A7A7A7; }
.mus-head { display: flex; gap: 24px; align-items: flex-end; padding: 60px 26px 24px; background: linear-gradient(180deg, #7A3A4D, #121212); }
.mus-mosaic { width: 200px; height: 200px; flex: none; display: grid; grid-template-columns: 1fr 1fr; box-shadow: 0 8px 40px rgba(0,0,0,.6); background: #282828; overflow: hidden; } .mus-mosaic img { width: 100%; height: 100%; object-fit: cover; }
.mus-head span { font: 600 13px var(--k-text); color: #fff; } .mus-head h1 { margin: 6px 0 12px; font: 900 64px/1 var(--k-text); letter-spacing: -.04em; color: #fff; } .mus-head p { margin: 0; font: 600 14px var(--k-text); color: #ddd; }
.mus-table { padding: 0 20px 30px; }
.mus-tr { display: grid; grid-template-columns: 36px minmax(0, 3fr) 1.2fr 1.2fr 110px; gap: 14px; align-items: center; height: 56px; padding: 0 14px; border-radius: 4px; font: 14px var(--k-text); color: #B3B3B3; cursor: default; }
.mus-tr:not(.mus-th):hover { background: #2A2A2A; } .mus-tr.on { background: #333; } .mus-tr.on b { color: #B38CFF; }
.mus-th { height: 36px; border-bottom: 1px solid #2A2A2A; margin-bottom: 8px; font-size: 13px; position: sticky; top: 0; background: #121212; z-index: 1; }
.mus-tr .n { text-align: right; } .mus-tr .t { display: flex; gap: 12px; align-items: center; min-width: 0; } .mus-tr .t img, .mus-tr .t .alt-noart { width: 40px; height: 40px; object-fit: cover; border-radius: 3px; flex: none; }
.mus-tr .t > span { min-width: 0; } .mus-tr b { display: block; font: 500 15px var(--k-text); color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .mus-tr em { font-style: normal; font-size: 13px; }
.mus-tr .d { display: flex; gap: 14px; justify-content: flex-end; align-items: center; }
.mus-heart { color: #555; font-size: 16px; } .mus-heart.on { color: #B38CFF; }
.mus-eq { display: inline-flex; gap: 2px; align-items: flex-end; height: 14px; } .mus-eq i { width: 3px; background: #B38CFF; animation: mus-eq .8s ease-in-out infinite alternate; } .mus-eq i:nth-child(2) { animation-delay: .3s; } .mus-eq i:nth-child(3) { animation-delay: .55s; }
@keyframes mus-eq { from { height: 3px; } to { height: 14px; } }
.mus-np { width: 320px; padding: 16px; animation: k-fade .3s both; } .mus-npart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 8px; } .mus-np h3 { margin: 14px 0 4px; font: 800 22px var(--k-text); color: #fff; } .mus-np p { margin: 0 0 12px; color: #B3B3B3; font: 14px var(--k-text); }
.mus-bar { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1.4fr 1fr; align-items: center; padding: 0 12px; background: #000; }
.mus-now { display: flex; gap: 12px; align-items: center; min-width: 0; } .mus-now img, .mus-now .alt-noart { width: 56px; height: 56px; object-fit: cover; border-radius: 4px; } .mus-now b { display: block; font: 600 14px var(--k-text); color: #fff; } .mus-now em { font: 12px var(--k-text); font-style: normal; color: #B3B3B3; }
.mus-ctl { display: grid; justify-items: center; gap: 6px; } .mus-ctl > div:first-child { display: flex; gap: 22px; align-items: center; } .mus-ctl > div:first-child > button:not(.mus-play) { color: #B3B3B3; font-size: 16px; }
.mus-play { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: #fff !important; color: #000 !important; transition: transform .15s; } .mus-play:hover { transform: scale(1.07); }
.mus-prog { display: flex; gap: 8px; align-items: center; width: 100%; font: 12px var(--k-text); color: #A7A7A7; } .mus-prog i { flex: 1; height: 4px; border-radius: 2px; background: #4D4D4D; } .mus-prog b { display: block; height: 100%; border-radius: 2px; background: #fff; }
.mus-vol { justify-self: end; font: 12px var(--k-text); color: #7A7A7A; } .mus-hint { grid-column: 1 / -1; text-align: center; color: #7A7A7A; font: 14px var(--k-text); }
.mus-act button { color: #B3B3B3 !important; } .mus-act button:hover { color: #fff !important; background: #2A2A2A !important; }
`;

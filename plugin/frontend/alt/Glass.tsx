// GLASS — glassmorphism. Slow-moving colour blobs behind frosted-glass panes: a glass dock of collections, a grid
// of glass game tiles with soft highlights, and a big glass detail pane that takes the game's art as its tint.
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Glass() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="gls" brand={<>◇ glass</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search">
			<div className="gls-app">
				<div className="gls-blob a" /><div className="gls-blob b" /><div className="gls-blob c" />
				{sel && <Art g={sel} kind="hero" className="gls-tint" key={'t' + sel.appid} />}
				<nav className="gls-dock">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</nav>
				<section className="gls-grid">{b.games.slice(0, 90).map((g) => (
					<button key={g.appid} data-appid={g.appid} className={'gls-tile' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
						<Art g={g} kind="header" /><b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'Unplayed'}</em>
					</button>))}</section>
				{sel && (
					<aside className="gls-pane" key={sel.appid}>
						<Art g={sel} kind="capsule" className="gls-cover" />
						<h2>{sel.name}</h2><p>{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p>
						<PlayBtn g={sel} className="gls-go" /><Actions g={sel} className="gls-act" /><button className="gls-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const glassCss = tok('glass', { bg: '#14122B', s1: 'rgba(255,255,255,.12)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.82)', fg3: 'rgba(255,255,255,.6)', acc: '#FFFFFF', on: '#14122B', top: 'rgba(255,255,255,.06)', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="glass"] .k-top { position: relative; z-index: 3; backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,.12); }
.gls-brand { font: 600 19px var(--k-text); color: #fff; }
.gls-app { position: absolute; inset: 0; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 64px minmax(0, 1fr); background: #14122B; }
.gls-blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .75; animation: gls-float 22s ease-in-out infinite alternate; } .gls-blob.a { width: 520px; height: 520px; left: -80px; top: -60px; background: #FF5FA2; } .gls-blob.b { width: 600px; height: 600px; right: -120px; top: 20%; background: #5B8CFF; animation-delay: -6s; } .gls-blob.c { width: 460px; height: 460px; left: 30%; bottom: -160px; background: #2EE6C5; animation-delay: -12s; }
@keyframes gls-float { to { transform: translate(120px, 80px) scale(1.15); } }
.gls-tint { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; filter: blur(40px) saturate(1.5); animation: k-fade .8s both; }
.gls-dock { position: relative; z-index: 2; grid-column: 1 / -1; justify-self: center; align-self: center; display: flex; gap: 6px; padding: 6px; border-radius: 20px; background: rgba(255,255,255,.12); backdrop-filter: blur(24px); box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 10px 30px rgba(0,0,0,.25); max-width: 90%; overflow-x: auto; }
.gls-dock button { flex: none; padding: 7px 16px; border-radius: 14px; font: 600 13px var(--k-text); color: rgba(255,255,255,.85); } .gls-dock button.on { background: rgba(255,255,255,.3); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.5); }
.gls-grid { position: relative; z-index: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; padding: 10px 26px 60px; align-content: start; }
.gls-tile { display: grid; gap: 4px; padding: 10px 10px 14px; border-radius: 22px; text-align: left; color: #fff; background: linear-gradient(140deg, rgba(255,255,255,.22), rgba(255,255,255,.06)); backdrop-filter: blur(20px); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), inset 0 0 0 1px rgba(255,255,255,.14), 0 14px 30px -14px rgba(0,0,0,.5); transition: transform .3s var(--k-spring); animation: k-rise .45s var(--k-out) both; }
.gls-tile:hover { transform: translateY(-4px); } .gls-tile.on { box-shadow: inset 0 0 0 2px rgba(255,255,255,.8), 0 14px 30px -14px rgba(0,0,0,.5); }
.gls-tile img, .gls-tile .alt-noart { width: 100%; aspect-ratio: 460/215; object-fit: cover; border-radius: 14px; margin-bottom: 6px; } .gls-tile b { font: 600 15px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .gls-tile em { font: 12px var(--k-text); font-style: normal; color: rgba(255,255,255,.7); }
.gls-pane { position: relative; z-index: 2; width: 380px; margin: 0 20px 20px 0; padding: 22px; border-radius: 30px; background: linear-gradient(160deg, rgba(255,255,255,.25), rgba(255,255,255,.08)); backdrop-filter: blur(30px); box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 0 0 1px rgba(255,255,255,.18); color: #fff; overflow-y: auto; display: grid; justify-items: center; align-content: start; text-align: center; animation: k-rise .35s var(--k-out) both; }
.gls-cover { width: 190px; border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,.4); } .gls-pane h2 { margin: 16px 0 4px; font: 700 22px var(--k-text); } .gls-pane p { margin: 0 0 16px; color: rgba(255,255,255,.75); font: 14px var(--k-text); }
.gls-go { width: 100%; height: 50px; border-radius: 16px; background: rgba(255,255,255,.9) !important; color: #14122B !important; font: 700 15px var(--k-text) !important; margin-bottom: 8px; } .gls-act { width: 100%; } .gls-act button { color: #fff !important; } .gls-act button:hover { background: rgba(255,255,255,.14) !important; } .gls-x { margin-top: 8px; color: #fff; opacity: .8; font: 600 13px var(--k-text); }
`;

// SWIPE — a swipe-to-match app for your backlog. One big card at a time: drag it right (or press ♥) to match and
// it's added to your matches, left (✕) to pass. Open a match to see its profile and play.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Swipe() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [gone, setGone] = useState<Record<number, 'l' | 'r'>>({});
	const [dx, setDx] = useState(0);
	const [fly, setFly] = useState<'l' | 'r' | null>(null);
	const start = useRef<number | null>(null);
	const deck = useMemo(() => [...b.games].sort((x, y) => (x.minutes === 0 ? 0 : 1) - (y.minutes === 0 ? 0 : 1) || y.added - x.added), [b.games]).filter((g) => !gone[g.appid]);
	const matches = b.games.filter((g) => gone[g.appid] === 'r');
	const top = deck[0];
	const decide = (d: 'l' | 'r') => { if (!top) return; setFly(d); setTimeout(() => { setGone((o) => ({ ...o, [top.appid]: d })); setFly(null); setDx(0); }, 320); };
	const card = (g: Game, i: number) => {
		const isTop = i === 0;
		const t = isTop ? (fly ? (fly === 'r' ? 900 : -900) : dx) : 0;
		return (
			<div key={g.appid} data-appid={g.appid} className={'swp-card' + (isTop ? ' top' : '')} style={{ transform: `translateX(${t}px) rotate(${t / 22}deg) scale(${1 - i * 0.04}) translateY(${i * 14}px)`, zIndex: 10 - i, transition: start.current !== null && isTop ? 'none' : undefined }}
				onPointerDown={isTop ? (e) => { start.current = e.clientX; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } : undefined}
				onPointerMove={isTop ? (e) => { if (start.current !== null) setDx(e.clientX - start.current); } : undefined}
				onPointerUp={isTop ? () => { const v = dx; start.current = null; if (v > 120) decide('r'); else if (v < -120) decide('l'); else if (Math.abs(v) < 4) select(g.appid); else setDx(0); } : undefined}>
				<Art g={g} kind="capsule" />
				{isTop && <><span className="swp-stamp like" style={{ opacity: Math.max(0, dx / 120) }}>PLAY</span><span className="swp-stamp nope" style={{ opacity: Math.max(0, -dx / 120) }}>PASS</span></>}
				<div className="swp-txt"><h2>{g.name}</h2><p>{g.minutes ? `${formatPlaytime(g.minutes)} together` : 'Never played · new here'}</p><div className="swp-tags">{g.installed && <span>Installed</span>}{g.metacritic > 0 && <span>Metascore {g.metacritic}</span>}{g.added > 0 && <span>Since {dateOf(g.added, { month: 'short', year: 'numeric' })}</span>}</div></div>
			</div>
		);
	};
	return (
		<AltPage className="swp" brand={<><span className="swp-flame">♥</span>Swipe</>}>
			<div className="swp-app">
				<aside className="swp-side">
					<div className="swp-me"><span>Your matches</span><b>{matches.length}</b></div>
					<div className="swp-pools">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name}</button>)}</div>
					<div className="swp-matches">{matches.map((g) => <button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span></button>)}{!matches.length && <p>Swipe right on a game to match.</p>}</div>
					{Object.keys(gone).length > 0 && <button className="swp-reset" onClick={() => setGone({})}>Start over</button>}
				</aside>
				<section className="swp-stage2">
					<div className="swp-stack">{deck.slice(0, 3).reverse().map((g) => card(g, deck.indexOf(g)))}{!top && <p className="swp-done">You've seen everyone in {b.isle?.name}.</p>}</div>
					<div className="swp-btns"><button className="no" onClick={() => decide('l')}>✕</button><button className="info" onClick={() => top && select(top.appid)}>i</button><button className="yes" onClick={() => decide('r')}>♥</button></div>
				</section>
				{sel && (
					<div className="swp-prof" key={sel.appid}>
						<div className="swp-pcard"><button className="swp-x" onClick={() => select(null)}>✕</button><Art g={sel} kind="hero" /><div className="swp-pb"><h2>{sel.name}</h2>
							<p>{sel.minutes ? `You've spent ${formatPlaytime(sel.minutes)} together${sel.lastPlayed ? `, last ${formatAgo(sel.lastPlayed).toLowerCase()}` : ''}.` : "You haven't met yet."}</p>
							<PlayBtn g={sel} className="swp-go" label={["It's a match — Play", 'Match — Install']} /><Actions g={sel} /></div></div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const swipeCss = tok('swipe', { bg: '#F7F3F5', s1: '#FFFFFF', s2: '#F0E9ED', s3: '#E5DBE1', fg: '#21181D', fg2: '#4D4048', fg3: '#8C7D86', acc: '#FF4F6D', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.swp-brand { display: flex; gap: 8px; align-items: center; font: 800 22px var(--k-text); color: #FF4F6D; letter-spacing: -.03em; } .swp-flame { font-size: 20px; }
.swp-app { position: absolute; inset: 0; display: grid; grid-template-columns: 320px minmax(0, 1fr); }
.swp-side { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: #fff; border-right: 1px solid #EEE4EA; min-height: 0; }
.swp-me { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 14px; background: linear-gradient(135deg, #FF4F6D, #FF8A4F); color: #fff; font: 700 15px var(--k-text); } .swp-me b { font-size: 24px; }
.swp-pools { display: flex; flex-wrap: wrap; gap: 6px; max-height: 110px; overflow-y: auto; } .swp-pools button { padding: 5px 12px; border-radius: 99px; background: #F0E9ED; font: 600 12px var(--k-text); color: #4D4048; } .swp-pools button.on { background: #21181D; color: #fff; }
.swp-matches { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; align-content: start; }
.swp-matches button { display: grid; gap: 4px; } .swp-matches img, .swp-matches .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 10px; } .swp-matches span { font: 600 11px var(--k-text); color: #4D4048; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.swp-matches p { grid-column: 1 / -1; color: #8C7D86; font: 14px var(--k-text); text-align: center; } .swp-reset { color: #FF4F6D; font: 700 13px var(--k-text); }
.swp-stage2 { display: grid; grid-template-rows: minmax(0, 1fr) 110px; justify-items: center; align-items: center; padding-top: 20px; }
.swp-stack { position: relative; width: min(400px, 80%); height: min(600px, 100%); }
.swp-card { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; background: #333; box-shadow: 0 16px 40px -14px rgba(60,20,40,.5); transition: transform .32s var(--k-out); touch-action: none; cursor: grab; user-select: none; }
.swp-card img, .swp-card .alt-noart { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.swp-txt { position: absolute; inset: auto 0 0; padding: 70px 22px 22px; background: linear-gradient(transparent, rgba(0,0,0,.85)); color: #fff; } .swp-txt h2 { margin: 0 0 4px; font: 800 30px/1.1 var(--k-text); } .swp-txt p { margin: 0 0 10px; font: 15px var(--k-text); opacity: .9; }
.swp-tags { display: flex; flex-wrap: wrap; gap: 6px; } .swp-tags span { padding: 4px 10px; border-radius: 99px; background: rgba(255,255,255,.2); backdrop-filter: blur(6px); font: 600 12px var(--k-text); }
.swp-stamp { position: absolute; top: 40px; padding: 4px 14px; border: 4px solid; border-radius: 8px; font: 900 40px var(--k-text); letter-spacing: .06em; } .swp-stamp.like { left: 24px; color: #3DDC97; transform: rotate(-16deg); } .swp-stamp.nope { right: 24px; color: #FF4F6D; transform: rotate(16deg); }
.swp-done { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: #8C7D86; font: 16px var(--k-text); }
.swp-btns { display: flex; gap: 22px; align-items: center; } .swp-btns button { display: grid; place-items: center; border-radius: 50%; background: #fff; box-shadow: 0 6px 18px -6px rgba(60,20,40,.35); transition: transform .2s var(--k-spring); } .swp-btns button:hover { transform: scale(1.12); }
.swp-btns .no { width: 66px; height: 66px; font-size: 26px; color: #FF4F6D; } .swp-btns .yes { width: 66px; height: 66px; font-size: 28px; color: #3DDC97; } .swp-btns .info { width: 46px; height: 46px; font: 800 18px Georgia, serif; color: #4C8DF6; }
.swp-prof { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(33,24,29,.55); backdrop-filter: blur(6px); animation: k-fade .25s both; }
.swp-pcard { position: relative; width: min(560px, 90%); max-height: 90%; overflow-y: auto; border-radius: 22px; background: #fff; animation: k-rise .35s var(--k-out) both; } .swp-pcard > img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.swp-x { position: absolute; right: 12px; top: 12px; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; } .swp-pb { padding: 18px 22px 22px; } .swp-pb h2 { margin: 0 0 6px; font: 800 26px var(--k-text); color: #21181D; } .swp-pb p { margin: 0 0 14px; font: 15px var(--k-text); color: #4D4048; }
.swp-go { width: 100%; height: 48px; border-radius: 24px; background: linear-gradient(135deg, #FF4F6D, #FF8A4F) !important; color: #fff !important; font: 800 16px var(--k-text) !important; margin-bottom: 8px; }
`;

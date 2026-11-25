// POSTERS — a cinematic wall of tall covers. The hovered game's name runs huge and outlined across the back of the
// wall, covers lean towards the pointer, and a click opens a full-height poster page with the game's details.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, colsOf, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

function Poster({ g, close }: { g: Game; close: () => void }) {
	const status = useStatus(g);
	return (
		<section className="pb-pos-page" key={g.appid}>
			<Backdrop g={g} className="pb-pos-pbd" />
			<button className="pb-pos-close" onClick={close}>← All posters</button>
			<Art g={g} kind="capsule" className="pb-pos-big" />
			<div className="pb-pos-copy">
				<p className="pb-pos-kick">{status}</p>
				<h1>{g.name}</h1>
				<p className="pb-pos-credits">{facts(g).map(([k, v]) => <span key={k}><small>{k}</small>{v}</span>)}</p>
				<PlayBtn g={g} className="pb-pos-play"><Icon name={g.installed ? 'play' : 'install'} size={18} /></PlayBtn>
				<Actions g={g} className="pb-pos-act" />
			</div>
		</section>
	);
}

export function Posters() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 300);
	const c = useCursor(gs.length);
	const [title, setTitle] = useState<Game | null>(null);
	const wall = useRef<HTMLDivElement>(null);
	useKeepInView(wall, '.kf', c.i, c.keyMoved);
	const show = title ?? gs[c.i];
	useKeys((k) => {
		if (sel) { if (k === 'back') { select(null); return; } return false; }
		const cols = colsOf(wall.current);
		if (k === 'left') c.move(-1); else if (k === 'right') c.move(1); else if (k === 'up') c.move(-cols); else if (k === 'down') c.move(cols);
		else if (k === 'enter') { const g = gs[c.i]; if (g) select(g.appid); } else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
		setTitle(null);
	});
	const tilt = (e: React.MouseEvent<HTMLButtonElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty('--rx', ((e.clientY - r.top) / r.height - 0.5) * -10 + 'deg');
		e.currentTarget.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 12 + 'deg');
	};
	return (
		<AltPage className="pb-pos" brand={<>POSTERS</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-pos-app">
				{sel ? <Poster g={sel} close={() => select(null)} /> : <>
					<div className="pb-pos-name" aria-hidden key={show?.appid}>{show?.name}</div>
					<div className="pb-pos-head"><Chips b={b} className="pb-pos-chips" onPick={() => c.to(0)} />{show && <p>{show.name}<span>{formatPlaytime(show.minutes)} · {formatAgo(show.lastPlayed)}</span></p>}</div>
					<div className="pb-pos-wall" ref={wall}>{gs.map((g, n) => (
						<button key={g.appid} data-appid={g.appid} className={'pb-pos-card' + (n === c.i ? ' kf' : '')} onMouseEnter={() => setTitle(g)} onMouseMove={tilt} onMouseLeave={(e) => { e.currentTarget.style.removeProperty('--rx'); e.currentTarget.style.removeProperty('--ry'); setTitle(null); }} onClick={() => { c.to(n); select(g.appid); }}>
							<Art g={g} kind="capsule" />{!g.installed && <i>Not installed</i>}
						</button>
					))}{!gs.length && <p className="lk-empty">No posters match.</p>}</div>
				</>}
			</div>
		</AltPage>
	);
}

export const postersCss = tok('posters', { bg: '#0A0A0A', s1: '#171717', s2: '#222', s3: '#2E2E2E', fg: '#F5F1E8', fg2: '#C9C3B6', fg3: '#857F73', acc: '#E9C46A', on: '#1A1400', top: '#0A0A0A', font: '"Bahnschrift", "Segoe UI", sans-serif' }) + `
.pb-pos-brand { font: 700 15px var(--k-text); letter-spacing: .5em; color: #E9C46A; }
.pb-pos-app { position: absolute; inset: 0; overflow: hidden; background: #0A0A0A; color: #F5F1E8; }
.pb-pos-name { position: absolute; left: -2%; right: -2%; top: 50%; transform: translateY(-50%); text-align: center; font: 900 clamp(90px, 15vw, 240px)/.85 var(--k-text); text-transform: uppercase; letter-spacing: -.03em; color: transparent; -webkit-text-stroke: 1.5px rgba(233,196,106,.14); white-space: nowrap; overflow: hidden; pointer-events: none; animation: k-fade .5s both; }
.pb-pos-head { position: relative; display: flex; align-items: center; gap: 20px; padding: 14px 36px 6px; } .pb-pos-chips { flex: 1; min-width: 0; }
.pb-pos-head p { flex: none; max-width: 40%; margin: 0; font: 600 16px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-pos-head p span { margin-left: 12px; font-weight: 400; color: #857F73; }
.pb-pos-wall { position: absolute; top: 58px; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 26px 22px; align-content: start; padding: 20px 36px 60px; overflow-y: auto; perspective: 900px; scrollbar-width: thin; }
.pb-pos-card { position: relative; aspect-ratio: 2/3; transform: rotateX(var(--rx, 0)) rotateY(var(--ry, 0)); transition: transform .25s ease-out, box-shadow .25s; box-shadow: 0 16px 34px rgba(0,0,0,.7); }
.pb-pos-card img, .pb-pos-card .alt-noart { width: 100%; height: 100%; object-fit: cover; } .pb-pos-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, rgba(255,255,255,.18), transparent 40%); opacity: 0; transition: opacity .25s; } .pb-pos-card:hover::after { opacity: 1; }
.pb-pos-card:hover { transform: rotateX(var(--rx, 0)) rotateY(var(--ry, 0)) translateZ(30px); z-index: 1; box-shadow: 0 30px 60px rgba(0,0,0,.85); } .pb-pos-card.kf { outline: 2px solid #E9C46A; outline-offset: 5px; }
.pb-pos-card i { position: absolute; left: 0; right: 0; bottom: 0; padding: 5px; font: 600 10px var(--k-text); font-style: normal; letter-spacing: .2em; text-transform: uppercase; background: rgba(0,0,0,.7); color: #C9C3B6; }
.pb-pos-page { position: absolute; inset: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 60px; align-items: center; padding: 40px 70px; animation: k-fade .4s both; }
.pb-pos-pbd { opacity: .25; } .pb-pos-pbd img { filter: grayscale(.5); } .pb-pos-page::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #0A0A0A 30%, rgba(10,10,10,.7)); }
.pb-pos-close { position: absolute; left: 70px; top: 22px; z-index: 1; font: 600 13px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #C9C3B6; } .pb-pos-close:hover { color: #E9C46A; }
.pb-pos-big { position: relative; height: min(78vh, 640px); aspect-ratio: 2/3; object-fit: cover; box-shadow: 0 40px 90px #000; animation: pb-pos-up .6s var(--k-out) both; } @keyframes pb-pos-up { from { transform: translateY(30px) rotate(-2deg); opacity: 0; } }
.pb-pos-copy { position: relative; } .pb-pos-kick { margin: 0 0 10px; font: 700 13px var(--k-text); letter-spacing: .3em; text-transform: uppercase; color: #E9C46A; }
.pb-pos-copy h1 { margin: 0 0 26px; font: 800 clamp(40px, 5vw, 76px)/.95 var(--k-text); text-transform: uppercase; letter-spacing: -.01em; }
.pb-pos-credits { display: flex; flex-wrap: wrap; gap: 14px 34px; margin: 0 0 30px; padding: 18px 0; border-top: 1px solid rgba(233,196,106,.3); border-bottom: 1px solid rgba(233,196,106,.3); font: 600 16px var(--k-text); }
.pb-pos-credits small { display: block; font: 500 11px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #857F73; }
.pb-pos-play { display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 36px; background: #E9C46A !important; color: #1A1400 !important; font: 700 16px var(--k-text) !important; letter-spacing: .2em; text-transform: uppercase; } .pb-pos-play:hover { filter: brightness(1.1); }
.pb-pos-act { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; } .pb-pos-act button { color: #C9C3B6 !important; } .pb-pos-act button:hover { background: rgba(255,255,255,.06) !important; }
`;

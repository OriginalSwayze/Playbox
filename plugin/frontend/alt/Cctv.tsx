// CCTV — a security-monitor wall. Every game is a camera feed with scanlines, a timestamp of its last session and a
// REC light if it was active this fortnight. Pick a layout, page through cameras; open a feed full-screen to act.
import { useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const stamp = (g: Game) => (g.lastPlayed ? new Date(g.lastPlayed * 1000).toISOString().replace('T', ' ').slice(0, 19) : '---- -- -- --:--:--');
const cam = (n: number) => 'CAM-' + String(n + 1).padStart(2, '0');

export function Cctv() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [n, setN] = useState(3);
	const [page, setPage] = useState(0);
	const per = n * n;
	const pages = Math.max(1, Math.ceil(b.games.length / per));
	const feeds = b.games.slice(page * per, page * per + per);
	const Feed = ({ g, i, big }: { g: Game; i: number; big?: boolean }) => (
		<button data-appid={g.appid} className={'cct-feed' + (big ? ' big' : '') + (g.installed ? '' : ' lost')} onClick={() => select(g.appid)}>
			<Art g={g} kind="hero" />
			<span className="cct-tl">{cam(i)} · {g.name.toUpperCase()}</span>
			<span className="cct-tr">{g.minutes2w > 0 && <i className="cct-rec">● REC</i>}</span>
			<span className="cct-bl">{stamp(g)}</span>
			{!g.installed && <span className="cct-nosig">NO SIGNAL</span>}
		</button>
	);
	return (
		<AltPage className="cct" brand={<><span className="cct-dot" />SECURE·VIEW</>}>
			<div className="cct-app">
				<aside className="cct-side">
					<h5>Sites</h5>{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); setPage(0); select(null); }}>▸ {i.name}<em>{i.games.length}</em></button>)}
					<h5>Layout</h5><div className="cct-lay">{[2, 3, 4].map((k) => <button key={k} className={n === k ? 'on' : ''} onClick={() => { setN(k); setPage(0); }}>{k}×{k}</button>)}</div>
					<h5>Status</h5><p>Online <b>{b.games.filter((g) => g.installed).length}</b></p><p>Recording <b>{b.games.filter((g) => g.minutes2w).length}</b></p><p>No signal <b>{b.games.filter((g) => !g.installed).length}</b></p>
				</aside>
				<section className="cct-wall">
					{sel ? (
						<div className="cct-one" key={sel.appid}><Feed g={sel} i={Math.max(0, b.games.indexOf(sel))} big />
							<div className="cct-ops"><button onClick={() => select(null)}>◂ Wall</button><PlayBtn g={sel} className="cct-go" label={['▶ ENGAGE (PLAY)', '⬇ RESTORE SIGNAL (INSTALL)']} /><b className="cct-name">{sel.name}</b><span>{formatPlaytime(sel.minutes)} of footage</span><Actions g={sel} className="cct-act" /></div></div>
					) : <>
						<div className="cct-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>{feeds.map((g, i) => <Feed key={g.appid} g={g} i={page * per + i} />)}</div>
						<div className="cct-pager"><button onClick={() => setPage(Math.max(0, page - 1))}>◂</button><span>PAGE {page + 1}/{pages}</span><button onClick={() => setPage(Math.min(pages - 1, page + 1))}>▸</button></div>
					</>}
				</section>
			</div>
		</AltPage>
	);
}

export const cctvCss = tok('cctv', { bg: '#050806', s1: '#0D1410', s2: '#14201A', s3: '#1E2E25', fg: '#B8F5C8', fg2: '#7FCF95', fg3: '#4A8A5E', acc: '#39FF7A', on: '#021006', top: '#050806', font: 'Consolas, "Courier New", monospace' }) + `
.cct-brand { display: flex; gap: 8px; align-items: center; font: 700 15px Consolas, monospace; letter-spacing: .2em; color: #B8F5C8; } .cct-dot { width: 10px; height: 10px; border-radius: 50%; background: #FF3B3B; box-shadow: 0 0 8px #FF3B3B; animation: cct-blink 1.2s steps(2) infinite; } @keyframes cct-blink { 50% { opacity: .2; } }
.cct-app { position: absolute; inset: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr); font: 12px Consolas, monospace; color: #B8F5C8; }
.cct-side { overflow-y: auto; padding: 12px; background: #0D1410; border-right: 1px solid #1E2E25; } .cct-side h5 { margin: 14px 0 6px; font: 700 11px Consolas, monospace; letter-spacing: .2em; color: #4A8A5E; }
.cct-side > button { display: flex; justify-content: space-between; width: 100%; padding: 4px 6px; text-align: left; font: 12px Consolas, monospace; color: #7FCF95; } .cct-side > button.on { background: #14201A; color: #39FF7A; } .cct-side em { font-style: normal; color: #4A8A5E; }
.cct-lay { display: flex; gap: 4px; } .cct-lay button { flex: 1; padding: 4px; border: 1px solid #1E2E25; font: 12px Consolas, monospace; color: #7FCF95; } .cct-lay button.on { border-color: #39FF7A; color: #39FF7A; }
.cct-side p { display: flex; justify-content: space-between; margin: 3px 0; color: #7FCF95; } .cct-side p b { color: #39FF7A; }
.cct-wall { display: grid; grid-template-rows: minmax(0, 1fr) 30px; min-height: 0; padding: 6px; gap: 6px; background: #000; }
.cct-grid { display: grid; gap: 6px; min-height: 0; }
.cct-feed { position: relative; overflow: hidden; background: #000; box-shadow: inset 0 0 0 1px #1E2E25; min-height: 0; }
.cct-feed img, .cct-feed .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) sepia(1) hue-rotate(70deg) saturate(1.6) contrast(1.15) brightness(.8); }
.cct-feed::before { content: ""; position: absolute; inset: 0; z-index: 1; background: repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,.35) 2px 3px); pointer-events: none; }
.cct-feed::after { content: ""; position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.7)); pointer-events: none; }
.cct-feed:hover { box-shadow: inset 0 0 0 2px #39FF7A; } .cct-feed.lost img { filter: grayscale(1) brightness(.25) blur(2px); }
.cct-feed > span { position: absolute; z-index: 2; font: 11px Consolas, monospace; color: #E8FFE8; text-shadow: 0 0 3px #000, 0 0 1px #000; white-space: nowrap; } .cct-tl { left: 8px; top: 6px; max-width: 80%; overflow: hidden; text-overflow: ellipsis; } .cct-tr { right: 8px; top: 6px; } .cct-bl { left: 8px; bottom: 6px; }
.cct-rec { font-style: normal; color: #FF3B3B; animation: cct-blink 1.2s steps(2) infinite; } .cct-nosig { left: 50%; top: 50%; transform: translate(-50%, -50%); padding: 4px 10px; background: #000; color: #FF3B3B !important; font-size: 14px !important; letter-spacing: .3em; }
.cct-feed.big > span { font-size: 15px; }
.cct-pager { display: flex; gap: 14px; justify-content: center; align-items: center; color: #7FCF95; } .cct-pager button { width: 36px; height: 24px; border: 1px solid #1E2E25; color: #39FF7A; }
.cct-one { grid-row: 1 / -1; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 8px; min-height: 0; animation: k-fade .2s both; }
.cct-ops { display: flex; gap: 14px; align-items: center; padding: 8px; border: 1px solid #1E2E25; background: #0D1410; } .cct-ops > button:first-child { color: #39FF7A; font: 12px Consolas, monospace; }
.cct-go { height: 34px; padding: 0 16px; border: 1px solid #39FF7A; background: #0D2A18 !important; color: #39FF7A !important; font: 700 12px Consolas, monospace !important; letter-spacing: .1em; } .cct-ops span { color: #7FCF95; } .cct-name { color: #E8FFE8; font: 700 13px Consolas, monospace; }
.cct-act { grid-auto-flow: column; margin-left: auto; } .cct-act button { color: #7FCF95 !important; font-family: Consolas, monospace !important; } .cct-act button:hover { background: #14201A !important; color: #39FF7A !important; }
`;

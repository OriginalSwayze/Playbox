// SLIDES — presentation software. A collection is a deck: thumbnails down the left, the current slide on the
// canvas, speaker notes beneath, and Present goes full-screen (arrow keys step, Esc leaves). Each game is a slide.
import { useEffect, useState } from 'react';
import { mainWindow } from '../steam/env';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const LAYOUTS = ['title', 'split', 'big'] as const;
function Slide({ g, n, mini }: { g: Game; n: number; mini?: boolean }) {
	const l = LAYOUTS[n % 3];
	return (
		<div className={'sld-slide ' + l + (mini ? ' mini' : '')}>
			{l === 'title' && <><Art g={g} kind="hero" /><div className="sld-tt"><h1>{g.name}</h1><p>{g.minutes ? formatPlaytime(g.minutes) + ' played' : 'A game yet to be played'}</p></div></>}
			{l === 'split' && <><div className="sld-l"><h2>{g.name}</h2><ul><li>{g.minutes ? `${formatPlaytime(g.minutes)} in total` : 'Never played'}</li><li>{g.lastPlayed ? `Last played ${formatAgo(g.lastPlayed).toLowerCase()}` : 'No sessions yet'}</li><li>{g.installed ? 'Installed and ready' : 'Not installed'}</li>{g.metacritic > 0 && <li>Metascore {g.metacritic}</li>}</ul></div><div className="sld-r"><Art g={g} kind="capsule" /></div></>}
			{l === 'big' && <><div className="sld-num">{Math.round(g.minutes / 60)}<small>hours</small></div><p className="sld-cap">spent in <b>{g.name}</b>{g.added ? ` since ${dateOf(g.added, { month: 'long', year: 'numeric' })}` : ''}</p><Art g={g} kind="header" /></>}
			<span className="sld-pg">{n + 1}</span>
		</div>
	);
}

export function Slides() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [show, setShow] = useState(false);
	const deck = b.games.slice(0, 120);
	const i = Math.max(0, deck.findIndex((g) => g.appid === sel?.appid));
	const cur = sel ?? deck[0] ?? null;
	useEffect(() => {
		if (!show) return;
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			const go = (d: number) => { const x = deck[i + d]; if (x) select(x.appid); };
			if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) go(1); else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) go(-1); else if (e.key === 'Escape') setShow(false); else return;
			e.preventDefault(); e.stopPropagation();
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [show, i, deck]);
	return (
		<AltPage className="sld" brand={<><span className="sld-logo">▭</span>Slides</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search slides">
			<div className="sld-app">
				<div className="sld-ribbon">
					<span className="sld-doc">{b.found ? 'Search results' : b.isle?.name}.deck</span>
					<select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); }}>{b.islands.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
					<span className="sld-tools">B <i>I</i> <u>U</u> │ ≡ ☰ │ ▭ ◯ △ │ 🖼</span>
					{cur && <PlayBtn g={cur} className="sld-playbtn" label={['▶ Play game', '⬇ Install']} />}
					<button className="sld-present" onClick={() => { if (!sel && deck[0]) select(deck[0].appid); setShow(true); }}>▶ Present</button>
				</div>
				<aside className="sld-thumbs">{deck.map((g, n) => <button key={g.appid} data-appid={g.appid} className={cur?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><em>{n + 1}</em><Slide g={g} n={n} mini /></button>)}</aside>
				<section className="sld-canvas">
					{cur && <div className="sld-frame" key={cur.appid}><Slide g={cur} n={Math.max(0, deck.indexOf(cur))} /></div>}
					{cur && <div className="sld-notes"><b>Speaker notes</b><p>{cur.name}: {cur.minutes ? `${formatPlaytime(cur.minutes)} played` : 'not played yet'}. {cur.installed ? 'Installed.' : 'Not installed.'}</p><Actions g={cur} className="sld-act" /></div>}
				</section>
				{show && cur && <div className="sld-show" onClick={() => { const x = deck[deck.indexOf(cur) + 1]; x ? select(x.appid) : setShow(false); }}><div className="sld-sframe" key={cur.appid}><Slide g={cur} n={Math.max(0, deck.indexOf(cur))} /></div><span className="sld-hint">← → to move · Esc to leave · {deck.indexOf(cur) + 1} / {deck.length}</span></div>}
			</div>
		</AltPage>
	);
}

export const slidesCss = tok('slides', { bg: '#E9E6E2', s1: '#FFFFFF', s2: '#F3F1EE', s3: '#DCD8D2', fg: '#252423', fg2: '#484644', fg3: '#8A8886', acc: '#D35230', on: '#fff', top: '#D35230', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.sld-brand { display: flex; gap: 8px; align-items: center; font: 600 17px var(--k-text); color: #fff; } .sld-logo { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 5px; background: #fff; color: #D35230; font-size: 14px; }
.sld-app { position: absolute; inset: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr); grid-template-rows: 48px minmax(0, 1fr); }
.sld-ribbon { grid-column: 1 / -1; display: flex; gap: 14px; align-items: center; padding: 0 14px; background: #F3F1EE; border-bottom: 1px solid #DCD8D2; font: 13px var(--k-text); color: #484644; }
.sld-doc { font-weight: 600; color: #252423; } .sld-ribbon select { height: 28px; border: 1px solid #C8C6C4; border-radius: 4px; background: #fff; font: 13px var(--k-text); color: #252423; } .sld-tools { color: #605E5C; letter-spacing: .1em; }
.sld-playbtn { margin-left: auto; height: 30px; padding: 0 12px; border-radius: 4px; border: 1px solid #C8C6C4; background: #fff; font: 600 13px var(--k-text); color: #252423; }
.sld-present { height: 30px; padding: 0 14px; border-radius: 4px; background: #D35230; color: #fff; font: 600 13px var(--k-text); }
.sld-thumbs { overflow-y: auto; padding: 12px 14px 30px 8px; display: grid; gap: 12px; align-content: start; background: #F3F1EE; border-right: 1px solid #DCD8D2; }
.sld-thumbs button { display: flex; gap: 6px; align-items: flex-start; } .sld-thumbs em { width: 16px; font: 11px var(--k-text); font-style: normal; color: #605E5C; text-align: right; }
.sld-thumbs .sld-slide { width: 170px; box-shadow: 0 0 0 1px #DCD8D2; } .sld-thumbs button.on .sld-slide { box-shadow: 0 0 0 3px #D35230; }
.sld-canvas { overflow: auto; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 12px; padding: 24px 40px 16px; }
.sld-frame { display: grid; place-items: center; min-height: 0; animation: k-fade .3s both; } .sld-frame .sld-slide { width: min(100%, calc((100vh - 330px) * 16 / 9)); box-shadow: 0 6px 24px rgba(0,0,0,.18); }
.sld-notes { padding: 10px 14px; background: #fff; border: 1px solid #DCD8D2; border-radius: 4px; font: 13px var(--k-text); color: #484644; } .sld-notes p { margin: 4px 0 6px; } .sld-act { grid-template-columns: repeat(4, auto); justify-content: start; }
.sld-slide { position: relative; aspect-ratio: 16/9; background: #fff; overflow: hidden; container-type: inline-size; color: #252423; }
.sld-slide img { display: block; } .sld-pg { position: absolute; right: 2.5cqw; bottom: 2cqw; font: 1.6cqw var(--k-text); color: #8A8886; }
.sld-slide.title > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .sld-tt { position: absolute; left: 0; right: 0; bottom: 0; padding: 4cqw 6cqw; background: linear-gradient(transparent, rgba(0,0,0,.8)); color: #fff; }
.sld-tt h1 { margin: 0; font: 700 6cqw/1.05 Georgia, serif; } .sld-tt p { margin: 1cqw 0 0; font: 2.2cqw var(--k-text); }
.sld-slide.split { display: grid; grid-template-columns: 1.3fr 1fr; } .sld-l { padding: 6cqw 5cqw; border-left: 1.2cqw solid #D35230; } .sld-l h2 { margin: 0 0 3cqw; font: 700 4.4cqw/1.1 Georgia, serif; } .sld-l ul { margin: 0; padding-left: 3cqw; font: 2.4cqw/1.8 var(--k-text); }
.sld-r { background: #F3F1EE; display: grid; place-items: center; } .sld-r img { height: 80%; box-shadow: 0 1cqw 3cqw rgba(0,0,0,.3); }
.sld-slide.big { display: grid; place-content: center; text-align: center; background: #252423; color: #fff; } .sld-num { font: 800 18cqw/1 var(--k-text); color: #FF8B5E; } .sld-num small { display: block; font: 600 2.6cqw var(--k-text); letter-spacing: .3em; text-transform: uppercase; color: #fff; }
.sld-cap { margin: 2cqw 0; font: 2.6cqw var(--k-text); } .sld-slide.big > img { width: 30cqw; margin: 0 auto; border-radius: .6cqw; }
.sld-slide.mini .sld-pg { display: none; }
.sld-show { position: absolute; inset: 0; z-index: 10; display: grid; place-items: center; background: #000; cursor: pointer; animation: k-fade .3s both; } .sld-sframe { width: min(100%, calc((100vh - 80px) * 16 / 9)); animation: k-fade .35s both; } .sld-sframe .sld-slide { width: 100%; }
.sld-hint { position: absolute; bottom: 10px; font: 12px var(--k-text); color: #777; }
`;

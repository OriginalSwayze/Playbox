// CODEX — a fantasy grimoire. An open book on a dark table: ribbon bookmarks are your collections, the left page lists
// the tomes with illuminated capitals, the right page shows the chosen one's plate in a gilded frame, its lore and a wax
// seal that begins the quest. Up/down turn through the tomes, Enter breaks the seal.
import { useRef } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { cycle, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const rank = (m: number) => (m >= 6000 ? 'Legendary' : m >= 1800 ? 'Epic' : m >= 600 ? 'Rare' : m > 0 ? 'Common' : 'Unread');
function lore(g: Game) {
	const h = Math.round(g.minutes / 60);
	return [
		g.minutes ? `Thou hast spent ${h ? h + ' hour' + (h === 1 ? '' : 's') : g.minutes + ' minutes'} within these pages` : 'These pages remain uncut; no hand hath turned them',
		g.lastPlayed ? `, last opened ${formatAgo(g.lastPlayed).toLowerCase()}.` : '.',
		g.minutes2w ? ` Of late it hath held thee ${formatPlaytime(g.minutes2w)} in a fortnight.` : '',
		g.installed ? ` The tome rests upon thy shelf${g.sizeOnDisk ? ', weighing ' + formatBytes(g.sizeOnDisk) : ''}.` : ' It lies yet in the far library, and must be fetched ere it be read.',
		g.metacritic ? ` The scribes of the realm rate it ${g.metacritic} of a hundred.` : '',
	].join('');
}

export function Codex() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 200);
	const c = useCursor(gs.length);
	const list = useRef<HTMLDivElement>(null);
	useKeepInView(list, '.on', c.i, c.keyMoved);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'up') { c.move(-1); select(null); } else if (k === 'down') { c.move(1); select(null); }
		else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	return (
		<AltPage className="pb-cdx" brand={<>❦ Codex</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }} searchPlaceholder="Seek a tome…">
			<div className="pb-cdx-app">
				<nav className="pb-cdx-ribbons">{b.islands.slice(0, 9).map((i, n) => <button key={i.id} className={!b.found && i.id === b.cur ? 'on' : ''} style={{ ['--h' as string]: [0, 210, 130, 40, 280, 180, 330, 20, 100][n] }} onClick={() => { b.setCur(i.id); c.to(0); select(null); }}><span>{i.name}</span></button>)}</nav>
				<div className="pb-cdx-book">
					<section className="pb-cdx-page l">
						<h2>{b.found ? 'Tomes Sought' : b.isle?.name}</h2><p className="pb-cdx-orn">✦ ❧ ✦</p>
						<div className="pb-cdx-list" ref={list}>{gs.map((x, n) => (
							<button key={x.appid} data-appid={x.appid} className={n === c.i ? 'on' : ''} onClick={() => { c.to(n); select(null); }} onDoubleClick={() => select(x.appid)}>
								<b>{x.name.charAt(0)}</b><span>{x.name.slice(1)}</span><em>{rank(x.minutes)}</em>
							</button>
						))}{!gs.length && <p className="pb-cdx-none">The shelves are bare.</p>}</div>
						<i className="pb-cdx-folio">{c.i + 1}</i>
					</section>
					<section className="pb-cdx-page r">
						{g && <div key={g.appid} className="pb-cdx-plate">
							<div className="pb-cdx-frame"><Art g={g} kind="header" /></div>
							<h1>{g.name}</h1>
							<p className="pb-cdx-rank"><span>{rank(g.minutes)}</span> · {status}</p>
							<p className="pb-cdx-lore">{lore(g)}</p>
							<div className="pb-cdx-seal-row"><PlayBtn g={g} className="pb-cdx-seal" label={['Begin', 'Fetch']} /><button className="pb-cdx-more" onClick={() => select(sel ? null : g.appid)}>{sel ? 'Close the margins' : 'Read the margins'}</button></div>
							{sel && <Actions g={sel} className="pb-cdx-act" />}
						</div>}
						<i className="pb-cdx-folio">{c.i + 2}</i>
					</section>
				</div>
			</div>
		</AltPage>
	);
}

const serif = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
export const codexCss = tok('codex', { bg: '#1A120C', s1: '#2A1E14', s2: '#3A2A1C', s3: '#4A3624', fg: '#F1E4C8', fg2: '#D4C19A', fg3: '#9C8763', acc: '#C9A24A', on: '#2A1A08', top: '#120C08', font: serif }) + `
.pb-cdx-brand { font: italic 600 22px ${serif}; color: #C9A24A; }
.pb-cdx-app { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; background: radial-gradient(60% 70% at 50% 45%, #3A2616, #120C08 75%); }
.pb-cdx-ribbons { position: absolute; top: 0; left: 50%; z-index: 2; display: flex; gap: 6px; transform: translateX(-50%); }
.pb-cdx-ribbons button { position: relative; width: 70px; height: 46px; padding-top: 6px; background: hsl(var(--h) 50% 30%); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%); transition: height .2s; box-shadow: inset 0 0 0 1px rgba(0,0,0,.3); }
.pb-cdx-ribbons button span { display: block; padding: 0 4px; font: 600 10px ${serif}; color: #F1E4C8; line-height: 1.1; overflow: hidden; max-height: 24px; } .pb-cdx-ribbons button:hover { height: 54px; } .pb-cdx-ribbons button.on { height: 66px; background: hsl(var(--h) 60% 38%); }
.pb-cdx-book { position: relative; display: grid; grid-template-columns: 1fr 1fr; width: min(1180px, 94%); height: min(88%, 760px); margin-top: 20px; filter: drop-shadow(0 30px 60px rgba(0,0,0,.7)); }
.pb-cdx-book::before { content: ""; position: absolute; inset: -14px -16px; border-radius: 10px; background: linear-gradient(90deg, #4A1E14, #6B2A1A 50%, #4A1E14); z-index: -1; box-shadow: inset 0 0 0 3px #2A0F08, inset 0 0 0 5px #C9A24A55; }
.pb-cdx-page { position: relative; display: flex; flex-direction: column; min-height: 0; padding: 34px 44px 40px; color: #3A2A1A; background: radial-gradient(120% 90% at 50% 50%, #F4E7C8, #E4CFA2); }
.pb-cdx-page.l { border-radius: 4px 0 0 4px; box-shadow: inset -30px 0 40px -20px rgba(90,60,20,.45); } .pb-cdx-page.r { border-radius: 0 4px 4px 0; box-shadow: inset 30px 0 40px -20px rgba(90,60,20,.45); }
.pb-cdx-page h2 { margin: 0; text-align: center; font: italic 600 28px ${serif}; color: #6B2A1A; } .pb-cdx-orn { margin: 4px 0 12px; text-align: center; color: #A8832E; letter-spacing: .4em; }
.pb-cdx-list { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; } .pb-cdx-list::-webkit-scrollbar { display: none; }
.pb-cdx-list button { display: flex; align-items: baseline; width: 100%; padding: 5px 8px; text-align: left; font: 17px ${serif}; color: #3A2A1A; border-bottom: 1px dotted rgba(90,60,20,.25); }
.pb-cdx-list b { font: 700 26px/1 ${serif}; color: #8C1F14; margin-right: 1px; text-shadow: 1px 1px 0 #C9A24A; } .pb-cdx-list span { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-cdx-list em { margin-left: 10px; font: italic 13px ${serif}; color: #8B7350; } .pb-cdx-list button:hover { background: rgba(201,162,74,.15); } .pb-cdx-list button.on { background: rgba(140,31,20,.12); box-shadow: inset 3px 0 0 #8C1F14; }
.pb-cdx-none { text-align: center; font: italic 17px ${serif}; color: #8B7350; }
.pb-cdx-folio { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); font: italic 13px ${serif}; color: #8B7350; }
.pb-cdx-plate { display: flex; flex-direction: column; align-items: center; min-height: 0; overflow-y: auto; text-align: center; animation: pb-cdx-ink .6s ease both; scrollbar-width: none; } @keyframes pb-cdx-ink { from { opacity: 0; filter: blur(3px); } }
.pb-cdx-frame { padding: 10px; background: linear-gradient(135deg, #E8C766, #9C7424 40%, #F3D982 60%, #8A6418); box-shadow: 0 6px 14px rgba(60,30,0,.4); } .pb-cdx-frame img, .pb-cdx-frame .alt-noart { display: block; width: min(420px, 100%); aspect-ratio: 460/215; object-fit: cover; box-shadow: inset 0 0 0 2px #3A2A1A; filter: sepia(.25); }
.pb-cdx-plate h1 { margin: 18px 0 4px; font: 700 30px/1.1 ${serif}; color: #3A2A1A; font-variant: small-caps; } .pb-cdx-rank { margin: 0 0 14px; font: italic 15px ${serif}; color: #8B7350; } .pb-cdx-rank span { color: #8C1F14; font-weight: 700; }
.pb-cdx-lore { max-width: 460px; margin: 0 0 18px; font: 16px/1.6 ${serif}; text-align: justify; color: #3A2A1A; } .pb-cdx-lore::first-letter { float: left; margin: 4px 6px 0 0; font: 700 44px/.8 ${serif}; color: #8C1F14; }
.pb-cdx-seal-row { display: flex; align-items: center; gap: 22px; } .pb-cdx-seal { width: 92px; height: 92px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #D0402C, #8C1F14 60%, #5A0F08) !important; color: #F4E7C8 !important; font: italic 700 18px ${serif} !important; box-shadow: 0 0 0 5px rgba(140,31,20,.35), 0 6px 14px rgba(60,10,0,.5), inset 0 -4px 8px rgba(0,0,0,.35); transition: transform .2s; }
.pb-cdx-seal:hover { transform: rotate(-8deg) scale(1.05); } .pb-cdx-more { font: italic 16px ${serif}; color: #6B2A1A; text-decoration: underline; text-decoration-color: #C9A24A; }
.pb-cdx-act { width: min(320px, 100%); margin-top: 16px; } .pb-cdx-act button { font: 15px ${serif} !important; color: #3A2A1A !important; } .pb-cdx-act button:hover { background: rgba(201,162,74,.2) !important; }
`;

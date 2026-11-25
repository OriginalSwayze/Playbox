// SPRINGBOARD — Steam as a phone home screen. Installed games are app icons, collections are folders that open
// with a zoom, recent games sit in the dock, and widgets show what you were playing and what's downloading.
import { useEffect, useMemo, useState } from 'react';
import { artFor, formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, gameCommands, useIslands, useLibraryLists, useSelectedGame } from './common';

function Icon({ g, onOpen, small }: { g: Game; onOpen: (g: Game) => void; small?: boolean }) {
	return (
		<button className={'sb-app' + (small ? ' sm' : '') + (g.installed ? '' : ' cloud')} data-appid={g.appid} onClick={() => onOpen(g)} title={g.name}>
			<span className="sb-ic"><Art g={g} kind="capsule" />{!g.installed && <i className="sb-cl">☁</i>}</span>
			{!small && <span className="sb-nm">{g.name}</span>}
		</button>
	);
}

function Sheet({ g, close }: { g: Game; close: () => void }) {
	const play = gameCommands(g)[0];
	return (
		<div className="sb-sheet-wrap" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className="sb-sheet">
				<i className="sb-grab" />
				<div className="sb-sheet-head">
					<span className="sb-ic big"><Art g={g} kind="capsule" /></span>
					<div><h2>{g.name}</h2><p>{formatPlaytime(g.minutes)} · {g.lastPlayed ? `opened ${formatAgo(g.lastPlayed).toLowerCase()}` : 'never opened'}</p>
						<button className="sb-get" onClick={play.run}>{g.installed ? 'OPEN' : 'GET'}</button></div>
				</div>
				<div className="sb-shot"><Art g={g} kind="hero" /></div>
				<Actions g={g} className="sb-actions" />
			</div>
		</div>
	);
}

export function Springboard() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent' && i.id !== 'uncategorized');
	const dl = useKestrel((s) => s.downloads);
	const [sel, select] = useSelectedGame();
	const [folder, setFolder] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [now, setNow] = useState(new Date());
	useEffect(() => { const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);
	const apps = useMemo(() => [...lists.installed].sort((a, b) => a.sortName.localeCompare(b.sortName)), [lists]);
	const PER = 24;
	const pages = Math.max(1, Math.ceil(apps.length / PER));
	const dock = lists.recent.slice(0, 5);
	const last = lists.recent[0];
	const open = (g: Game) => select(g.appid);
	const f = islands.find((i) => i.id === folder);
	const wall = last ? artFor(last.appid).hero : '';
	return (
		<AltPage className="sb" brand="Springboard">
			<div className="sb-screen">
				<div className="sb-wall" style={{ backgroundImage: wall ? `url("${wall}")` : undefined }} />
				<div className="sb-status"><b>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><span>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
				<div className="sb-pages" style={{ transform: `translateX(${-page * 100}%)` }}>
					{Array.from({ length: pages + 1 }, (_, p) => (
						<div className="sb-page" key={p}>
							{p === 0 ? (
								<>
									<div className="sb-widgets">
										{last && <button className="sb-widget big" onClick={() => open(last)}><span className="sb-wbg"><Art g={last} kind="hero" /></span><em>Continue</em><b>{last.name}</b><span>{formatPlaytime(last.minutes)} · {formatAgo(last.lastPlayed)}</span></button>}
										<div className="sb-widget"><em>Downloads</em><b>{dl.active ? dl.active.name : dl.queue.length ? `${dl.queue.length} queued` : 'All done'}</b>{dl.active && <i className="sb-prog"><i style={{ width: `${dl.active.percent}%` }} /></i>}<span>{dl.active ? `${dl.active.percent.toFixed(0)}%` : dl.queue.map((x) => x.name).join(', ') || 'Nothing downloading'}</span></div>
										<div className="sb-widget"><em>Library</em><b>{lists.all.length} games</b><span>{lists.installed.length} installed · {Math.round(lists.all.reduce((s, g) => s + g.minutes, 0) / 60).toLocaleString()} hours</span></div>
									</div>
									<div className="sb-grid">{islands.map((c) => (
										<button key={c.id} className="sb-app" onClick={() => setFolder(c.id)}>
											<span className="sb-ic folder">{c.games.slice(0, 9).map((g) => <Art key={g.appid} g={g} kind="capsule" />)}</span>
											<span className="sb-nm">{c.name}</span>
										</button>
									))}</div>
								</>
							) : <div className="sb-grid">{apps.slice((p - 1) * PER, p * PER).map((g) => <Icon key={g.appid} g={g} onOpen={open} />)}</div>}
						</div>
					))}
				</div>
				<div className="sb-dots">{Array.from({ length: pages + 1 }, (_, p) => <button key={p} className={p === page ? 'on' : ''} onClick={() => setPage(p)} aria-label={`Page ${p + 1}`} />)}</div>
				<div className="sb-dock">{dock.map((g) => <Icon key={g.appid} g={g} onOpen={open} small />)}</div>
				{page > 0 && <button className="sb-edge l" onClick={() => setPage(page - 1)} aria-label="Previous page">‹</button>}
				{page < pages && <button className="sb-edge r" onClick={() => setPage(page + 1)} aria-label="Next page">›</button>}
				{f && (
					<div className="sb-folder-wrap" onMouseDown={(e) => e.target === e.currentTarget && setFolder(null)}>
						<div className="sb-folder"><h3>{f.name}</h3><div className="sb-grid in">{f.games.map((g) => <Icon key={g.appid} g={g} onOpen={(x) => { setFolder(null); open(x); }} />)}</div></div>
					</div>
				)}
				{sel && <Sheet key={sel.appid} g={sel} close={() => select(null)} />}
			</div>
		</AltPage>
	);
}

export const springboardCss = `
html.kestrel[data-ui="springboard"] { --k-ink: #101018; --k-s1: rgba(40,40,52,.75); --k-s2: rgba(60,60,76,.8); --k-s3: rgba(80,80,100,.85); --k-s4: rgba(100,100,124,.9); --k-line: rgba(255,255,255,.1); --k-line-2: rgba(255,255,255,.2);
	--k-fg: #FFFFFF; --k-fg-2: rgba(255,255,255,.78); --k-fg-3: rgba(255,255,255,.55); --k-accent: #0A84FF; --k-accent-2: #64B5FF; --k-on-accent: #fff; --k-a10: rgba(10,132,255,.12); --k-a20: rgba(10,132,255,.2); --k-a40: rgba(10,132,255,.4); }
.sb-brand { font: 600 17px var(--k-display); color: #fff; }
.sb-stage { background: #101018; }
.sb-screen { position: absolute; inset: 0; overflow: hidden; }
.sb-wall { position: absolute; inset: -40px; background: linear-gradient(135deg, #3A2A6B, #0E5C7A) center / cover; filter: blur(40px) saturate(1.4) brightness(.6); transform: scale(1.1); }
.sb-status { position: absolute; left: 0; right: 0; top: 18px; z-index: 1; text-align: center; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,.4); }
.sb-status b { display: block; font: 200 64px var(--k-display); letter-spacing: -.02em; line-height: 1; }
.sb-status span { font: 500 15px var(--k-text); opacity: .85; }
.sb-pages { position: absolute; left: 0; right: 0; top: 130px; bottom: 150px; display: flex; transition: transform 600ms var(--k-out); }
.sb-page { flex: none; width: 100%; height: 100%; overflow-y: auto; padding: 10px 12% 0; }
.sb-widgets { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 18px; margin-bottom: 26px; }
.sb-widget { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; min-height: 150px; padding: 16px 18px; border-radius: 24px; text-align: left;
	background: rgba(30,30,40,.45); -webkit-backdrop-filter: blur(30px) saturate(1.6); backdrop-filter: blur(30px) saturate(1.6); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); color: #fff; }
.sb-widget em { font: 600 12px var(--k-text); font-style: normal; text-transform: uppercase; letter-spacing: .05em; opacity: .75; }
.sb-widget b { font: 700 19px var(--k-display); margin: 4px 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; }
.sb-widget span:not(.sb-wbg) { font-size: 13px; opacity: .8; position: relative; }
.sb-widget.big { transition: transform .35s var(--k-spring); } .sb-widget.big:hover { transform: scale(1.02); }
.sb-wbg { position: absolute; inset: 0; } .sb-wbg img { width: 100%; height: 100%; object-fit: cover; } .sb-wbg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.75), transparent 70%); }
.sb-widget.big em, .sb-widget.big b { position: relative; }
.sb-prog { display: block; height: 6px; border-radius: 99px; background: rgba(255,255,255,.2); margin: 6px 0; overflow: hidden; } .sb-prog i { display: block; height: 100%; background: #30D158; }
.sb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 26px 18px; }
.sb-app { display: flex; flex-direction: column; align-items: center; gap: 7px; transition: transform .3s var(--k-spring); }
.sb-app:hover { transform: scale(1.08); } .sb-app:active { transform: scale(.92); }
.sb-ic { position: relative; width: 76px; height: 76px; border-radius: 19px; overflow: hidden; background: #2A2A36; box-shadow: 0 8px 18px -6px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.1); }
.sb-ic img, .sb-ic .alt-noart { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; font-size: 9px; }
.sb-ic.big { width: 110px; height: 110px; border-radius: 26px; flex: none; }
.sb-ic.folder { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 8px; background: rgba(255,255,255,.22); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); }
.sb-ic.folder img, .sb-ic.folder .alt-noart { border-radius: 4px; aspect-ratio: 1; height: auto; }
.sb-app.cloud .sb-ic img { filter: brightness(.6) grayscale(.3); }
.sb-cl { position: absolute; right: 4px; bottom: 2px; font-style: normal; font-size: 16px; color: #fff; text-shadow: 0 1px 4px #000; }
.sb-nm { max-width: 100px; font: 500 12.5px var(--k-text); color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-dots { position: absolute; left: 0; right: 0; bottom: 124px; display: flex; justify-content: center; gap: 8px; }
.sb-dots button { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.35); transition: background-color .2s, transform .2s; }
.sb-dots button.on { background: #fff; transform: scale(1.2); }
.sb-dock { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); display: flex; gap: 18px; padding: 14px 20px; border-radius: 32px; background: rgba(255,255,255,.18); -webkit-backdrop-filter: blur(30px) saturate(1.6); backdrop-filter: blur(30px) saturate(1.6); box-shadow: inset 0 0 0 1px rgba(255,255,255,.15); }
.sb-app.sm .sb-ic { width: 66px; height: 66px; border-radius: 16px; }
.sb-edge { position: absolute; top: 45%; width: 44px; height: 80px; border-radius: 22px; font-size: 40px !important; color: rgba(255,255,255,.7) !important; background: rgba(255,255,255,.08) !important; }
.sb-edge.l { left: 14px; } .sb-edge.r { right: 14px; }
.sb-folder-wrap { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(0,0,0,.25); -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); animation: k-fade 250ms both; }
.sb-folder { width: min(720px, 80%); max-height: 70%; overflow-y: auto; padding: 22px 26px 26px; border-radius: 36px; background: rgba(255,255,255,.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); animation: sb-zoom 450ms var(--k-spring) both; }
@keyframes sb-zoom { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }
.sb-folder h3 { margin: 0 0 18px; text-align: center; font: 600 26px var(--k-display); color: #fff; }
.sb-sheet-wrap { position: absolute; inset: 0; z-index: 6; display: flex; align-items: flex-end; justify-content: center; background: rgba(0,0,0,.35); animation: k-fade 250ms both; }
.sb-sheet { width: min(640px, 92%); max-height: 86%; overflow-y: auto; padding: 10px 24px 24px; border-radius: 30px 30px 0 0; background: rgba(28,28,34,.96); color: #fff; animation: sb-up 500ms var(--k-out) both; }
@keyframes sb-up { from { transform: translateY(100%); } to { transform: none; } }
.sb-grab { display: block; width: 40px; height: 5px; margin: 0 auto 14px; border-radius: 3px; background: rgba(255,255,255,.3); }
.sb-sheet-head { display: flex; gap: 18px; align-items: center; margin-bottom: 16px; }
.sb-sheet-head h2 { margin: 0 0 4px; font: 700 22px var(--k-display); }
.sb-sheet-head p { margin: 0 0 10px; font-size: 13.5px; color: rgba(255,255,255,.6); }
.sb-get { padding: 7px 22px; border-radius: 99px; background: #0A84FF !important; color: #fff !important; font: 800 14px var(--k-text) !important; letter-spacing: .02em; }
.sb-shot { aspect-ratio: 16/8; border-radius: 18px; overflow: hidden; margin-bottom: 12px; } .sb-shot img, .sb-shot .alt-noart { width: 100%; height: 100%; object-fit: cover; }
`;

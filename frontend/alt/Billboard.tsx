// BILLBOARD — a streaming-service front page. A billboard rotates through your recent games with logo and actions,
// then a row per collection; cards grow on hover. Arrows move between rows and cards, Enter opens a game sheet with
// more from the same collection.
import { useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useLibraryLists, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Logo, facts, useKeys, useRotate, useStatus } from './lk';

function Sheet({ g, more, close, open }: { g: Game; more: Game[]; close: () => void; open: (g: Game) => void }) {
	const status = useStatus(g);
	return (
		<div className="pb-bill-sheet" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<article key={g.appid}>
				<header><Backdrop g={g} /><div className="pb-bill-fade" /><Logo g={g} className="pb-bill-slogo" />
					<div className="pb-bill-sbtn"><PlayBtn g={g} className="pb-bill-play" label={['▶  Play', '⬇  Install']} /><button className="pb-bill-x" onClick={close} aria-label="Close">✕</button></div></header>
				<div className="pb-bill-body">
					<div><p className="pb-bill-match">{status}</p><h2>{g.name}</h2><dl>{facts(g).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
					<Actions g={g} className="pb-bill-act" />
				</div>
				{more.length > 0 && <><h3>More like this</h3><div className="pb-bill-more">{more.slice(0, 12).map((x) => <button key={x.appid} data-appid={x.appid} onClick={() => open(x)}><Art g={x} kind="header" /><span>{x.name}</span></button>)}</div></>}
			</article>
		</div>
	);
}

export function Billboard() {
	const islands = useIslands();
	const lists = useLibraryLists();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const feat = (lists.recent.length ? lists.recent : lists.top).slice(0, 6);
	const [hover, setHover] = useState(false);
	const [rot, setRot] = useRotate(feat.length, 9000, hover || !!sel);
	const f = feat[rot];
	const rows: { id: string; name: string; games: Game[] }[] = found ? [{ id: 'q', name: `Results for “${q}”`, games: found }] : [...islands, { id: 'top', name: 'Most played', games: lists.top.slice(0, 30) }, { id: 'new', name: 'Never played', games: lists.unplayed.slice(0, 30) }];
	const [cur, setCur] = useState<[number, number]>([-1, 0]);
	const page = useRef<HTMLDivElement>(null);
	const focus = (r: number, c: number) => {
		setCur([r, c]);
		const el = page.current?.querySelector(r < 0 ? '.pb-bill-hero' : `[data-r="${r}"] [data-c="${c}"]`);
		el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	};
	const moreOf = (g: Game) => (islands.find((i) => i.id !== 'recent' && i.games.some((x) => x.appid === g.appid))?.games ?? lists.top).filter((x) => x.appid !== g.appid);
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else return false; return; }
		const [r, c] = cur;
		if (k === 'down') focus(Math.min(rows.length - 1, r + 1), 0);
		else if (k === 'up') focus(Math.max(-1, r - 1), 0);
		else if (k === 'left') r < 0 ? setRot((rot - 1 + feat.length) % feat.length) : focus(r, Math.max(0, c - 1));
		else if (k === 'right') r < 0 ? setRot((rot + 1) % feat.length) : focus(r, Math.min(rows[r].games.length - 1, c + 1));
		else if (k === 'enter') { const g = r < 0 ? f : rows[r]?.games[c]; if (g) select(g.appid); }
		else return false;
	});
	return (
		<AltPage className="pb-bill" brand={<>PLAYBOX<i>ORIGINALS</i></>} search={q} onSearch={setQ} searchPlaceholder="Titles, collections">
			<div className="pb-bill-app" ref={page}>
				{!found && f && (
					<section className={'pb-bill-hero' + (cur[0] < 0 ? ' kf' : '')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
						<Backdrop g={f} className="pb-bill-bd" /><div className="pb-bill-vig" />
						<div className="pb-bill-copy" key={f.appid}>
							<p className="pb-bill-tag"><b>P</b> {f.lastPlayed ? 'CONTINUE PLAYING' : 'MOST PLAYED'}</p>
							<Logo g={f} className="pb-bill-logo" />
							<p className="pb-bill-line">{f.minutes ? formatPlaytime(f.minutes) + ' played' : 'Not played yet'} · {formatAgo(f.lastPlayed)}{f.metacritic ? ` · ${f.metacritic} Metascore` : ''}</p>
							<div className="pb-bill-btns"><PlayBtn g={f} className="pb-bill-play" label={['▶  Play', '⬇  Install']} /><button className="pb-bill-info" onClick={() => select(f.appid)}><Icon name="menu" size={18} />More info</button></div>
						</div>
						<div className="pb-bill-dots">{feat.map((x, n) => <button key={x.appid} className={n === rot ? 'on' : ''} onClick={() => setRot(n)} aria-label={x.name} />)}</div>
					</section>
				)}
				<div className="pb-bill-rows">{rows.map((row, r) => (
					<section key={row.id} className="pb-bill-row" data-r={r}><h3>{row.name}<small>{row.games.length}</small></h3>
						<div className="pb-bill-track">{row.games.slice(0, 40).map((g, c) => (
							<button key={g.appid} data-appid={g.appid} data-c={c} className={'pb-bill-card' + (cur[0] === r && cur[1] === c ? ' kf' : '')} onClick={() => select(g.appid)}>
								<Art g={g} kind="header" /><span className="pb-bill-cap"><b>{g.name}</b><em>{g.installed ? '● Installed' : 'Not installed'} · {formatPlaytime(g.minutes)}</em></span>
								{g.minutes > 0 && g.lastPlayed > 0 && row.id === 'recent' && <i className="pb-bill-prog" style={{ width: Math.min(100, 15 + Math.sqrt(g.minutes) * 2) + '%' }} />}
							</button>
						))}</div>
					</section>
				))}{found && !found.length && <p className="lk-empty">No titles match.</p>}</div>
			</div>
			{sel && <Sheet g={sel} more={moreOf(sel)} close={() => select(null)} open={(x) => select(x.appid)} />}
		</AltPage>
	);
}

export const billboardCss = tok('billboard', { bg: '#141414', s1: '#222', s2: '#2E2E2E', s3: '#3A3A3A', fg: '#FFFFFF', fg2: '#D2D2D2', fg3: '#8C8C8C', acc: '#E8243C', on: '#fff', top: 'linear-gradient(rgba(0,0,0,.8), transparent)', font: '"Segoe UI", Helvetica, sans-serif' }) + `
html.kestrel[data-ui="billboard"] .k-top { position: relative; z-index: 3; border: 0; }
.pb-bill-brand { font: 900 22px "Bahnschrift", "Arial Black", sans-serif; letter-spacing: .04em; color: #E8243C; display: flex; align-items: baseline; gap: 6px; } .pb-bill-brand i { font: 700 10px var(--k-text); font-style: normal; letter-spacing: .25em; color: #fff; opacity: .7; }
.pb-bill-app { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; background: #141414; color: #fff; scrollbar-width: thin; }
.pb-bill-hero { position: relative; height: min(68vh, 620px); min-height: 380px; overflow: hidden; }
.pb-bill-bd img { object-position: center 25%; } .pb-bill-vig { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.85), rgba(0,0,0,.2) 55%, transparent), linear-gradient(0deg, #141414 2%, transparent 40%); }
.pb-bill-copy { position: absolute; left: 4%; bottom: 18%; width: min(560px, 46%); animation: k-rise .6s var(--k-out) both; }
.pb-bill-tag { margin: 0 0 14px; font: 800 13px var(--k-text); letter-spacing: .3em; color: #ddd; } .pb-bill-tag b { color: #E8243C; font: 900 22px "Bahnschrift", sans-serif; letter-spacing: 0; margin-right: 4px; }
.pb-bill-logo { display: block; height: 150px; max-width: 100%; } .pb-bill-logo img { height: 100%; } .pb-bill-logo.lk-logotext { height: auto; font: 900 54px "Bahnschrift", var(--k-text); }
.pb-bill-line { margin: 18px 0 22px; font: 500 16px var(--k-text); color: #e5e5e5; text-shadow: 0 1px 6px #000; }
.pb-bill-btns { display: flex; gap: 12px; } .pb-bill-play { height: 48px; padding: 0 30px; border-radius: 6px; background: #fff !important; color: #000 !important; font: 700 18px var(--k-text) !important; } .pb-bill-play:hover { background: rgba(255,255,255,.8) !important; }
.pb-bill-info { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 26px; border-radius: 6px; background: rgba(110,110,110,.6); color: #fff; font: 700 18px var(--k-text); } .pb-bill-info:hover { background: rgba(110,110,110,.4); }
.pb-bill-hero.kf .pb-bill-play { box-shadow: 0 0 0 3px #141414, 0 0 0 5px #fff; }
.pb-bill-dots { position: absolute; right: 4%; bottom: 22%; display: flex; gap: 6px; } .pb-bill-dots button { width: 22px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.35); } .pb-bill-dots button.on { background: #fff; }
.pb-bill-rows { position: relative; margin-top: -70px; padding-bottom: 60px; } .pb-bill-app > .pb-bill-rows:first-child { margin-top: 20px; }
.pb-bill-row h3 { display: flex; gap: 10px; align-items: baseline; margin: 0 4% 10px; font: 700 20px var(--k-text); } .pb-bill-row h3 small { font: 600 13px var(--k-text); color: #8c8c8c; }
.pb-bill-track { display: flex; gap: 8px; padding: 6px 4% 34px; overflow-x: auto; scrollbar-width: none; scroll-padding: 0 4%; } .pb-bill-track::-webkit-scrollbar { display: none; }
.pb-bill-card { position: relative; flex: none; width: 250px; aspect-ratio: 460 / 215; border-radius: 6px; overflow: hidden; background: #222; transition: transform .25s var(--k-out), box-shadow .25s; transform-origin: center; }
.pb-bill-card img, .pb-bill-card .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.pb-bill-card:hover, .pb-bill-card.kf { transform: scale(1.12); z-index: 2; box-shadow: 0 12px 30px rgba(0,0,0,.7); } .pb-bill-card.kf { outline: 3px solid #fff; outline-offset: 2px; }
.pb-bill-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 10px 8px; background: linear-gradient(transparent, rgba(0,0,0,.92)); text-align: left; opacity: 0; transition: opacity .2s; } .pb-bill-card:hover .pb-bill-cap, .pb-bill-card.kf .pb-bill-cap { opacity: 1; }
.pb-bill-cap b { display: block; font: 700 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-bill-cap em { font: 600 11px var(--k-text); font-style: normal; color: #46D369; }
.pb-bill-prog { position: absolute; left: 0; bottom: 0; height: 3px; background: #E8243C; }
.pb-bill-sheet { position: absolute; inset: 0; z-index: 5; display: grid; justify-items: center; overflow-y: auto; padding: 30px 0; background: rgba(0,0,0,.7); pointer-events: auto; animation: k-fade .2s both; }
.pb-bill-sheet article { width: min(900px, 92%); border-radius: 10px; overflow: hidden; background: #181818; box-shadow: 0 20px 80px #000; animation: k-rise .35s var(--k-out) both; align-self: start; }
.pb-bill-sheet header { position: relative; height: 420px; } .pb-bill-fade { position: absolute; inset: 0; background: linear-gradient(0deg, #181818, transparent 60%); }
.pb-bill-slogo { position: absolute; left: 48px; bottom: 90px; height: 120px; max-width: 55%; } .pb-bill-slogo img { height: 100%; } .pb-bill-slogo.lk-logotext { height: auto; font: 900 40px "Bahnschrift", var(--k-text); }
.pb-bill-sbtn { position: absolute; left: 48px; right: 20px; bottom: 26px; display: flex; justify-content: space-between; align-items: center; }
.pb-bill-x { position: absolute; right: 0; top: -380px; width: 38px; height: 38px; border-radius: 50%; background: #181818; color: #fff; font: 700 16px var(--k-text); }
.pb-bill-body { display: grid; grid-template-columns: 1fr 240px; gap: 30px; padding: 10px 48px 20px; } .pb-bill-match { margin: 0; font: 700 15px var(--k-text); color: #46D369; } .pb-bill-body h2 { margin: 6px 0 16px; font: 700 26px var(--k-text); }
.pb-bill-body dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0; } .pb-bill-body dt { font: 13px var(--k-text); color: #777; } .pb-bill-body dd { margin: 2px 0 0; font: 600 15px var(--k-text); }
.pb-bill-act button { color: #ddd !important; } .pb-bill-sheet h3 { margin: 10px 48px 14px; font: 700 22px var(--k-text); }
.pb-bill-more { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 0 48px 40px; } .pb-bill-more button { border-radius: 6px; overflow: hidden; background: #2F2F2F; text-align: left; }
.pb-bill-more img, .pb-bill-more .alt-noart { width: 100%; aspect-ratio: 460/215; object-fit: cover; display: block; } .pb-bill-more span { display: block; padding: 10px 12px; font: 600 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-bill-more button:hover { background: #3a3a3a; }
`;

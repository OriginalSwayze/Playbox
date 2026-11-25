// CINEMA — a picture palace. A bulb-lit marquee bills the game you played last, the screen between velvet curtains
// shows it, and the programme below runs posters; choosing one prints a ticket whose stub starts the show.
import { useMemo, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useLibraryLists, useSearch, useSelectedGame } from './common';

const stars = (m: number) => (m ? '★★★★★'.slice(0, Math.round(m / 20)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(m / 20)) : '');

function Ticket({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<div className="cn-dim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<article className="cn-ticket">
				<div className="cn-t-main">
					<div className="cn-t-art"><Art g={g} kind="hero" /></div>
					<div className="cn-t-body">
						<em>Kestrel Picture Palace presents</em>
						<h2>{g.name}</h2>
						<p className="cn-credits">{d.developer ? `A ${d.developer} production` : ' '}{d.publisher && d.publisher !== d.developer ? ` · distributed by ${d.publisher}` : ''}</p>
						<div className="cn-t-grid">
							<span>Running time</span><b>{formatPlaytime(g.minutes)}</b>
							<span>Last screening</span><b>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Premiere'}</b>
							<span>Reel size</span><b>{formatBytes(d.disk || g.sizeOnDisk) || '—'}</b>
							<span>Reviews</span><b>{g.metacritic ? `${stars(g.metacritic)} ${g.metacritic}` : 'Not rated'}</b>
						</div>
						{d.description[0] && <p className="cn-syn">{d.description[0].slice(0, 260)}{d.description[0].length > 260 ? '…' : ''}</p>}
						<Actions g={g} className="cn-actions" />
					</div>
				</div>
				<button className="cn-stub" onClick={go.run}>
					<em>Admit one</em>
					<b>{g.installed ? 'Start the show' : 'Book it · install'}</b>
					<span>Seat {String.fromCharCode(65 + (g.appid % 12))}{(g.appid % 20) + 1}</span>
					<i className="cn-code">{g.appid}</i>
				</button>
				<button className="cn-close" onClick={close} aria-label="Close">×</button>
			</article>
		</div>
	);
}

function Poster({ g, onOpen, i }: { g: Game; onOpen: () => void; i: number }) {
	return (
		<button className="cn-poster" data-appid={g.appid} onClick={onOpen} style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
			<span className="cn-frame"><Art g={g} kind="capsule" />{!g.installed && <i className="cn-tag">Not installed</i>}</span>
			<b>{g.name}</b>
			<span>{g.minutes ? formatPlaytime(g.minutes) : 'Premiere'}{g.metacritic ? <em> {stars(g.metacritic)}</em> : null}</span>
		</button>
	);
}

export function Cinema() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [prog, setProg] = useState('showing');
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const feature = lists.recent[0];
	const programmes = useMemo(() => [
		{ id: 'showing', name: 'Now showing', games: lists.installed.slice(0, 60) },
		{ id: 'classics', name: 'Classics', games: lists.top.filter((g) => g.minutes).slice(0, 30) },
		{ id: 'premieres', name: 'Premieres', games: lists.unplayed.slice(0, 60) },
		{ id: 'vault', name: 'From the vault', games: lists.all.filter((g) => !g.installed && g.minutes).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 60) },
		...islands.map((i) => ({ id: i.id, name: i.name, games: i.games })),
	], [lists, islands]);
	const cur = found ? { id: 'q', name: `Search: ${q.trim()}`, games: found.slice(0, 60) } : programmes.find((p) => p.id === prog) ?? programmes[0];
	return (
		<AltPage className="cn" brand="Picture Palace" search={q} onSearch={setQ} searchPlaceholder="Find a film">
			<div className="cn-hall">
				{feature && (
					<section className="cn-front">
						<div className="cn-marquee">
							<div className="cn-bulbs" />
							<em>Now showing</em>
							<b>{feature.name}</b>
							<span>{formatPlaytime(feature.minutes)} · last screened {formatAgo(feature.lastPlayed).toLowerCase()}</span>
						</div>
						<div className="cn-screen-wrap">
							<i className="cn-curtain l" /><i className="cn-curtain r" />
							<button className="cn-screen" onClick={() => select(feature.appid)}><Art g={feature} kind="hero" /><span className="cn-beam" /></button>
						</div>
						<div className="cn-seats" />
					</section>
				)}
				<nav className="cn-programme">
					{programmes.filter((p) => p.games.length).map((p) => <button key={p.id} className={!found && p.id === cur.id ? 'on' : ''} onClick={() => { setProg(p.id); setQ(''); }}>{p.name}</button>)}
				</nav>
				<h3 className="cn-bill">{cur.name}<span>{cur.games.length} feature{cur.games.length === 1 ? '' : 's'}</span></h3>
				<div className="cn-posters" key={cur.id}>{cur.games.map((g, i) => <Poster key={g.appid} g={g} i={i} onOpen={() => select(g.appid)} />)}</div>
			</div>
			{sel && <Ticket key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const cinemaCss = `
html.kestrel[data-ui="cinema"] { --k-ink: #0B0506; --k-s1: #1A0C0E; --k-s2: #241114; --k-s3: #321820; --k-s4: #42202A; --k-line: rgba(255,210,140,.12); --k-line-2: rgba(255,210,140,.24);
	--k-fg: #FFF1DC; --k-fg-2: #D9BFA0; --k-fg-3: #9C8068; --k-accent: #F5C04A; --k-accent-2: #FFE08A; --k-on-accent: #2A1500; --k-a10: rgba(245,192,74,.08); --k-a20: rgba(245,192,74,.16); --k-a40: rgba(245,192,74,.35);
	--cn-deco: "Bahnschrift", "Segoe UI", sans-serif; }
html.kestrel[data-ui="cinema"] .k-top { background: #0B0506; border-bottom: 1px solid rgba(245,192,74,.25); }
.cn-brand { font: 600 20px var(--cn-deco); letter-spacing: .28em; text-transform: uppercase; color: #F5C04A; text-shadow: 0 0 12px rgba(245,192,74,.6); }
.cn-stage { background: #0B0506; }
.cn-hall { position: absolute; inset: 0; overflow-y: auto; padding-bottom: 60px; background: radial-gradient(80% 40% at 50% 0, #2A0E12, transparent 70%), #0B0506; }
.cn-hall::-webkit-scrollbar { width: 10px; } .cn-hall::-webkit-scrollbar-thumb { background: #42202A; border-radius: 5px; }
.cn-front { position: relative; padding: 22px 0 0; }
.cn-marquee { position: relative; width: min(820px, 80%); margin: 0 auto 18px; padding: 18px 40px; text-align: center; border-radius: 6px; background: linear-gradient(#1C0B0D, #120607); box-shadow: 0 0 0 3px #6B4A1A, 0 0 60px rgba(245,192,74,.15); animation: k-rise 600ms var(--k-out) both; }
.cn-bulbs { position: absolute; inset: 6px; border-radius: 4px; pointer-events: none;
	background: radial-gradient(circle, #FFE7A0 2.5px, transparent 3.5px) 0 0 / 22px 100% repeat-x, radial-gradient(circle, #FFE7A0 2.5px, transparent 3.5px) 0 100% / 22px 100% repeat-x;
	background-size: 22px 8px, 22px 8px; background-position: 0 0, 11px 100%; background-repeat: repeat-x; animation: cn-chase 1.2s steps(2) infinite; filter: drop-shadow(0 0 4px #FFC94A); }
@keyframes cn-chase { 50% { background-position: 11px 0, 0 100%; } }
.cn-marquee em { display: block; font: 600 12px var(--cn-deco); font-style: normal; letter-spacing: .5em; text-transform: uppercase; color: #E44B4B; }
.cn-marquee b { display: block; margin: 6px 0 4px; font: 700 34px/1.1 var(--cn-deco); letter-spacing: .06em; text-transform: uppercase; color: #FFF1DC; text-shadow: 0 0 18px rgba(255,220,150,.5); }
.cn-marquee span { font: 14px var(--k-text); color: #D9BFA0; }
.cn-screen-wrap { position: relative; width: min(1100px, 86%); margin: 0 auto; padding: 0 70px; }
.cn-curtain { position: absolute; top: -10px; bottom: -6px; width: 120px; z-index: 2; pointer-events: none; background: repeating-linear-gradient(90deg, #5C0B14 0 14px, #8E1424 14px 26px, #5C0B14 26px 40px); box-shadow: inset 0 -30px 40px rgba(0,0,0,.5); }
.cn-curtain.l { left: 0; border-radius: 0 0 60% 0; animation: cn-open-l 1.2s var(--k-out) both; } .cn-curtain.r { right: 0; border-radius: 0 0 0 60%; animation: cn-open-r 1.2s var(--k-out) both; }
@keyframes cn-open-l { from { width: 52%; } } @keyframes cn-open-r { from { width: 52%; } }
.cn-screen { position: relative; display: block; width: 100%; aspect-ratio: 2.39 / 1; overflow: hidden; border-radius: 3px; box-shadow: 0 0 80px rgba(255,230,190,.12), 0 30px 60px -20px #000; }
.cn-screen img, .cn-screen .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: brightness(.92) contrast(1.05); transition: transform 1.2s var(--k-out); }
.cn-screen:hover img { transform: scale(1.03); }
.cn-beam { position: absolute; inset: 0; background: radial-gradient(60% 80% at 50% 120%, rgba(255,240,210,.12), transparent 60%); pointer-events: none; }
.cn-seats { height: 46px; margin: 0 auto; width: min(1100px, 86%); background: radial-gradient(ellipse 18px 22px at 50% 100%, #2A0D12 60%, transparent 62%) 0 100% / 44px 46px repeat-x; opacity: .9; }
.cn-programme { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; padding: 24px 40px 6px; }
.cn-programme button { padding: 7px 14px; border-radius: 99px; font: 600 13px var(--cn-deco); letter-spacing: .1em; text-transform: uppercase; color: #D9BFA0; box-shadow: inset 0 0 0 1px rgba(245,192,74,.25); }
.cn-programme button:hover { color: #FFF1DC; box-shadow: inset 0 0 0 1px #F5C04A; }
.cn-programme button.on { background: #F5C04A; color: #2A1500; }
.cn-bill { display: flex; align-items: baseline; justify-content: center; gap: 14px; margin: 18px 0 18px; font: 700 26px var(--cn-deco); letter-spacing: .14em; text-transform: uppercase; color: #FFF1DC; }
.cn-bill span { font: 500 13px var(--k-text); letter-spacing: 0; text-transform: none; color: #9C8068; }
.cn-posters { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 26px 22px; padding: 0 48px; max-width: 1500px; margin: 0 auto; }
.cn-poster { display: flex; flex-direction: column; gap: 6px; text-align: left; animation: k-rise 500ms var(--k-out) both; }
.cn-frame { position: relative; display: block; aspect-ratio: 2 / 3; padding: 6px; border-radius: 3px; background: linear-gradient(135deg, #8A6420, #F5D27A 40%, #8A6420 60%, #C9A044); box-shadow: 0 12px 24px -10px #000; transition: transform .3s var(--k-spring), box-shadow .3s; }
.cn-frame img, .cn-frame .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; }
.cn-poster:hover .cn-frame { transform: translateY(-6px); box-shadow: 0 0 30px rgba(245,192,74,.35), 0 20px 30px -10px #000; }
.cn-tag { position: absolute; left: 6px; right: 6px; bottom: 6px; padding: 3px; text-align: center; font: 700 10px var(--cn-deco); font-style: normal; letter-spacing: .14em; text-transform: uppercase; background: rgba(11,5,6,.85); color: #D9BFA0; }
.cn-poster b { font: 600 14px/1.25 var(--k-text); color: #FFF1DC; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.cn-poster > span { font: 12.5px var(--k-text); color: #9C8068; } .cn-poster em { font-style: normal; color: #F5C04A; letter-spacing: .05em; }
.cn-dim { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 30px; background: rgba(5,2,3,.82); animation: k-fade 250ms both; }
.cn-ticket { position: relative; display: flex; width: min(1040px, 96%); max-height: 100%; animation: cn-print 600ms var(--k-out) both; filter: drop-shadow(0 30px 40px rgba(0,0,0,.6)); }
@keyframes cn-print { from { transform: translateY(40px) rotate(-2deg); opacity: 0; } to { transform: none; opacity: 1; } }
.cn-t-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-y: auto; border-radius: 12px 0 0 12px; background: #F6EAD2; color: #2A1A10;
	-webkit-mask: radial-gradient(circle 12px at 100% 0, transparent 98%, #000) top right / 100% 51% no-repeat, radial-gradient(circle 12px at 100% 100%, transparent 98%, #000) bottom right / 100% 51% no-repeat; }
.cn-t-art { aspect-ratio: 21 / 8; overflow: hidden; flex: none; } .cn-t-art img, .cn-t-art .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.cn-t-body { padding: 18px 28px 22px; }
.cn-t-body > em { font: 600 11.5px var(--cn-deco); font-style: normal; letter-spacing: .3em; text-transform: uppercase; color: #8E1424; }
.cn-t-body h2 { margin: 4px 0 4px; font: 700 34px/1.1 var(--cn-deco); text-transform: uppercase; letter-spacing: .03em; color: #1C0B0D; }
.cn-credits { margin: 0 0 14px; font: italic 14px var(--k-text); color: #6B5040; }
.cn-t-grid { display: grid; grid-template-columns: repeat(4, auto); gap: 2px 18px; justify-content: start; padding: 10px 0; border-block: 1px dashed rgba(42,26,16,.3); }
.cn-t-grid span { font: 700 10.5px var(--cn-deco); letter-spacing: .14em; text-transform: uppercase; color: #8C6E58; grid-row: 1; }
.cn-t-grid b { font: 600 15px var(--k-text); color: #2A1A10; grid-row: 2; }
.cn-syn { font: 14px/1.55 var(--k-text); color: #4A3424; margin: 14px 0 8px; }
.cn-actions { display: flex; flex-wrap: wrap; } .cn-actions button { color: #4A3424 !important; } .cn-actions button:hover { background: rgba(42,26,16,.08); color: #1C0B0D !important; }
.cn-stub { position: relative; flex: none; width: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; padding: 20px; border-radius: 0 12px 12px 0; text-align: center;
	background: #8E1424 !important; color: #FFF1DC; border-left: 3px dashed #F6EAD2;
	-webkit-mask: radial-gradient(circle 12px at 0 0, transparent 98%, #000) top left / 100% 51% no-repeat, radial-gradient(circle 12px at 0 100%, transparent 98%, #000) bottom left / 100% 51% no-repeat; transition: background .2s; }
.cn-stub:hover { background: #A81A2C !important; }
.cn-stub em { font: 700 12px var(--cn-deco); font-style: normal; letter-spacing: .4em; text-transform: uppercase; color: #F5C04A; }
.cn-stub b { font: 700 22px/1.15 var(--cn-deco); text-transform: uppercase; }
.cn-stub span { font: 13px var(--k-text); color: #F0C8B0; }
.cn-code { font: 11px Consolas, monospace; font-style: normal; letter-spacing: .3em; color: #F0C8B0; padding-top: 30px; background: repeating-linear-gradient(90deg, #FFF1DC 0 2px, transparent 2px 4px, #FFF1DC 4px 5px, transparent 5px 8px) top / 100% 26px no-repeat; }
.cn-close { position: absolute; top: 10px; right: 214px; width: 34px; height: 34px; border-radius: 50%; background: rgba(11,5,6,.6) !important; color: #FFF1DC; font: 22px/1 var(--k-text); }
`;

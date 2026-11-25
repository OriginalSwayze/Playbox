// MUSEUM — a gallery of your library. Each collection is a room of framed works under gallery lights, with a
// placard under every piece; step up to one for the curator's notes and an invitation to experience it.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const frameOf = (id: number) => ['gilt', 'black', 'oak', 'white'][id % 4];

function Exhibit({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const play = gameCommands(g)[0];
	return (
		<div className="mu-exhibit" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className={'mu-frame big ' + frameOf(g.appid)}><div className="mu-canvas"><Art g={g} kind="hero" /></div></div>
			<aside className="mu-notes">
				<div className="mu-kicker">Curator's notes</div>
				<h2>{g.name}</h2>
				<div className="mu-medium">{d.developer || 'Unknown studio'}{d.publisher && d.publisher !== d.developer ? ` for ${d.publisher}` : ''}. Interactive work, pixels on glass.</div>
				<p>{d.description[0] ?? 'The catalogue entry for this work is still being written.'}</p>
				<div className="mu-prov"><span>Provenance</span>In your collection{g.added ? ` since ${new Date(g.added * 1000).getFullYear()}` : ''}. {formatPlaytime(g.minutes)} spent with the work{g.lastPlayed ? `, most recently ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}.</div>
				<button className="mu-enter" onClick={play.run}>{g.installed ? 'Experience the work' : 'Request the work (install)'}</button>
				<Actions g={g} className="mu-actions" />
				<button className="mu-leave" onClick={close}>Return to the gallery</button>
			</aside>
		</div>
	);
}

export function Museum() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const rooms = found ? [{ id: 'q', name: `Search: ${q.trim()}`, games: found }] : islands;
	const [room, setRoom] = useState(0);
	const cur = rooms[Math.min(room, rooms.length - 1)];
	return (
		<AltPage className="mu" brand="The Museum" search={q} onSearch={(v) => { setQ(v); setRoom(0); }} searchPlaceholder="Search the catalogue">
			<div className="mu-gallery">
				<nav className="mu-rooms">{rooms.map((r, i) => <button key={r.id} className={i === room ? 'on' : ''} onClick={() => setRoom(i)}><b>Room {ROMAN[i] ?? i + 1}</b><span>{r.name}</span></button>)}</nav>
				{cur && (
					<section className="mu-room" key={cur.id}>
						<header><div className="mu-roomno">Room {ROMAN[room] ?? room + 1}</div><h1>{cur.name}</h1><p>{cur.games.length} works on display</p></header>
						<div className="mu-wall">
							{cur.games.map((g, i) => (
								<figure key={g.appid} data-appid={g.appid} className="mu-piece" style={{ animationDelay: `${Math.min(i, 16) * 45}ms` }}>
									<button className={'mu-frame ' + frameOf(g.appid)} onClick={() => select(g.appid)} title={g.name}><div className="mu-canvas"><Art g={g} kind="header" /></div></button>
									<figcaption><b>{g.name}</b><span>{g.minutes ? `${formatPlaytime(g.minutes)} of viewing` : 'Not yet viewed'}{g.installed ? '' : ' · in storage'}</span></figcaption>
								</figure>
							))}
						</div>
					</section>
				)}
			</div>
			{sel && <Exhibit key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const museumCss = `
html.kestrel[data-ui="museum"] { --k-ink: #ECE9E2; --k-s1: #F7F5F0; --k-s2: #E7E3DA; --k-s3: #DAD4C8; --k-s4: #C9C1B2; --k-line: rgba(40,36,30,.1); --k-line-2: rgba(40,36,30,.2);
	--k-fg: #23201B; --k-fg-2: #57514A; --k-fg-3: #8B847A; --k-accent: #8C6A2E; --k-accent-2: #B08A44; --k-on-accent: #FFFDF8; --k-a10: rgba(140,106,46,.08); --k-a20: rgba(140,106,46,.15); --k-a40: rgba(140,106,46,.35);
	--mu-serif: "Palatino Linotype", Palatino, Georgia, serif; }
html.kestrel[data-ui="museum"] .k-top { background: #F4F2EC; }
.mu-brand { font: 400 19px var(--mu-serif); letter-spacing: .32em; text-transform: uppercase; color: #23201B; }
.mu-stage { background: #ECE9E2; }
.mu-gallery { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr); }
.mu-rooms { overflow-y: auto; padding: 26px 14px; border-right: 1px solid rgba(40,36,30,.12); background: #F4F2EC; }
.mu-rooms button { display: block; width: 100%; text-align: left; padding: 10px 12px; border-radius: 4px; transition: background-color .2s; }
.mu-rooms b { display: block; font: 400 11px var(--k-text); letter-spacing: .18em; text-transform: uppercase; color: #8B847A; }
.mu-rooms span { display: block; font: 400 16px var(--mu-serif); color: #23201B; }
.mu-rooms button:hover { background: rgba(40,36,30,.05); }
.mu-rooms button.on { background: #23201B; } .mu-rooms button.on span { color: #F7F5F0; } .mu-rooms button.on b { color: #B08A44; }
.mu-room { overflow-y: auto; padding: 40px 56px 80px; background: radial-gradient(60% 40% at 50% 0%, #FFFFFF, #ECE9E2 70%); animation: k-fade 500ms both; }
.mu-room header { text-align: center; margin-bottom: 44px; }
.mu-roomno { font: 400 12px var(--k-text); letter-spacing: .3em; text-transform: uppercase; color: #8C6A2E; }
.mu-room h1 { margin: 8px 0 6px; font: 400 44px var(--mu-serif); letter-spacing: .02em; }
.mu-room header p { margin: 0; font: italic 15px var(--mu-serif); color: #8B847A; }
.mu-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 64px 52px; align-items: start; }
.mu-piece { position: relative; margin: 0; animation: k-rise 700ms var(--k-out) both; }
.mu-piece::before { content: ""; position: absolute; left: 10%; right: 10%; top: -46px; height: 90px; pointer-events: none; background: radial-gradient(50% 100% at 50% 0%, rgba(255,240,200,.65), transparent 70%); }
.mu-frame { display: block; width: 100%; padding: 16px; transition: transform .5s var(--k-out), box-shadow .5s; box-shadow: 0 22px 30px -18px rgba(40,30,15,.55); }
.mu-frame.gilt { background: linear-gradient(135deg, #D6B26A, #8C6A2E 45%, #E7C982 60%, #7A5A22); padding: 18px; box-shadow: inset 0 0 0 2px #5C4314, inset 0 0 0 6px rgba(255,235,180,.4), 0 22px 30px -18px rgba(40,30,15,.6); }
.mu-frame.black { background: #1A1816; padding: 12px; }
.mu-frame.oak { background: linear-gradient(90deg, #8A6A44, #A98559, #7C5D38); padding: 14px; }
.mu-frame.white { background: #FBFAF6; padding: 22px; box-shadow: inset 0 0 0 1px #DAD4C8, 0 22px 30px -18px rgba(40,30,15,.4); }
.mu-canvas { aspect-ratio: 460/215; overflow: hidden; background: #ddd; box-shadow: inset 0 0 0 1px rgba(0,0,0,.25); }
.mu-frame.white .mu-canvas { box-shadow: 0 0 0 10px #F2EFE7, inset 0 0 0 1px rgba(0,0,0,.2); }
.mu-canvas img, .mu-canvas .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.mu-frame:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 34px 40px -20px rgba(40,30,15,.6); }
.mu-piece figcaption { margin: 18px auto 0; width: max-content; max-width: 88%; padding: 8px 14px; background: #FBFAF6; box-shadow: 0 1px 3px rgba(0,0,0,.15); text-align: left; }
.mu-piece figcaption b { display: block; font: 600 14px var(--mu-serif); }
.mu-piece figcaption span { font: italic 12.5px var(--mu-serif); color: #8B847A; }
.mu-exhibit { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; gap: 56px; padding: 40px; background: rgba(20,18,15,.92); animation: k-fade 300ms both; }
.mu-frame.big { width: min(760px, 52vw); animation: k-zoom 600ms var(--k-out) both; }
.mu-notes { width: 380px; max-height: 100%; overflow-y: auto; padding: 26px 28px; background: #F7F5F0; color: #23201B; animation: k-rise 600ms var(--k-out) 150ms both; }
.mu-kicker { font: 400 11px var(--k-text); letter-spacing: .26em; text-transform: uppercase; color: #8C6A2E; }
.mu-notes h2 { margin: 8px 0 6px; font: 400 30px/1.1 var(--mu-serif); }
.mu-medium { font: italic 13.5px var(--mu-serif); color: #57514A; margin-bottom: 14px; }
.mu-notes p { font: 15px/1.6 var(--mu-serif); color: #3A352E; margin: 0 0 14px; max-height: 10em; overflow: hidden; }
.mu-prov { font: 13.5px/1.5 var(--mu-serif); color: #57514A; padding: 10px 0 16px; border-top: 1px solid rgba(40,36,30,.15); }
.mu-prov span { display: block; font: 400 10.5px var(--k-text); letter-spacing: .2em; text-transform: uppercase; color: #8B847A; margin-bottom: 3px; }
.mu-enter { width: 100%; height: 48px; background: #23201B !important; color: #F7F5F0 !important; font: 400 15px var(--mu-serif) !important; letter-spacing: .12em; text-transform: uppercase; transition: background-color .2s; }
.mu-enter:hover { background: #8C6A2E !important; }
.mu-actions { margin-top: 12px; }
.mu-leave { margin-top: 8px; font: italic 14px var(--mu-serif) !important; color: #8C6A2E !important; }
`;

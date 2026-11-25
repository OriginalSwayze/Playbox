// CORKBOARD — your games pinned to a cork wall: polaroids under coloured pushpins, a sticky note heading each
// collection, everything slightly askew. Unpin one and it comes to the front with notes scrawled on the back.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const tilt = (id: number) => (((id * 37) % 11) - 5) * 0.9;
const PINS = ['#E23B3B', '#2F7BE5', '#F2C12E', '#36B37E', '#9B59D0'];
const NOTES = ['#FFE680', '#FFB3C7', '#A8E6CF', '#A7C7FF', '#FFD0A1'];

function Polaroid({ g, onPick }: { g: Game; onPick: () => void }) {
	return (
		<button className={'cb-pol' + (g.installed ? '' : ' old')} data-appid={g.appid} onClick={onPick} style={{ ['--r' as string]: `${tilt(g.appid)}deg`, ['--pin' as string]: PINS[(Math.floor(g.appid / 10) * 7 + g.appid) % PINS.length] }} title={g.name}>
			<i className="cb-pin" />
			<div className="cb-photo"><Art g={g} kind="capsule" /></div>
			<span>{g.name}</span>
		</button>
	);
}

function Unpinned({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const [back, setBack] = useState(false);
	const play = gameCommands(g)[0];
	const cmds = gameCommands(g).slice(1);
	return (
		<div className="cb-front" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className={'cb-big' + (back ? ' flipped' : '')}>
				<div className="cb-side a" onClick={() => setBack(true)}>
					<div className="cb-photo"><Art g={g} kind="capsule" /></div>
					<span>{g.name}</span>
					<em>turn over →</em>
				</div>
				<div className="cb-side b">
					<div className="cb-scrawl">
						<b>{g.name}</b>
						<p>{formatPlaytime(g.minutes)} played{g.lastPlayed ? `, last time ${formatAgo(g.lastPlayed).toLowerCase()}` : ' (never!)'}.</p>
						{d.achievements.total > 0 && <p>{d.achievements.achieved}/{d.achievements.total} achievements ✓</p>}
						{d.developer && <p>made by {d.developer}</p>}
						<p className="cb-quote">“{(d.description[0] ?? 'remember to try this one').slice(0, 140)}{(d.description[0]?.length ?? 0) > 140 ? '…' : ''}”</p>
					</div>
					<button className="cb-flipback" onClick={() => setBack(false)}>← front</button>
				</div>
			</div>
			<div className="cb-stickies">
				<button className="cb-sticky go" onClick={play.run}>{g.installed ? 'PLAY IT!' : 'install this'}</button>
				{cmds.map((c, i) => <button key={c.id} className="cb-sticky" style={{ background: NOTES[(i + 1) % NOTES.length], ['--r' as string]: `${(i % 2 ? 2 : -3)}deg` }} onClick={c.run}>{c.label}</button>)}
				<button className="cb-sticky" style={{ background: '#fff' }} onClick={close}>pin it back</button>
			</div>
		</div>
	);
}

export function Corkboard() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const groups = found ? [{ id: 'q', name: `looking for “${q.trim()}”`, games: found.slice(0, 80) }] : islands;
	return (
		<AltPage className="cb" brand="Corkboard" search={q} onSearch={setQ} searchPlaceholder="Look for a photo">
			<div className="cb-wall">
				{groups.map((c, i) => (
					<section key={c.id} className="cb-group">
						<div className="cb-note" style={{ background: NOTES[i % NOTES.length], ['--r' as string]: `${i % 2 ? 2.5 : -2}deg` }}>{c.name}<small>{c.games.length} pinned</small></div>
						<div className="cb-pins">{c.games.map((g) => <Polaroid key={g.appid} g={g} onPick={() => select(g.appid)} />)}</div>
					</section>
				))}
			</div>
			{sel && <Unpinned key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const corkboardCss = `
html.kestrel[data-ui="corkboard"] { --k-ink: #3A2A1A; --k-s1: #FFF9E6; --k-s2: #F3E9CC; --k-s3: #E6D7AE; --k-s4: #D5C28E; --k-line: rgba(60,40,20,.14); --k-line-2: rgba(60,40,20,.25);
	--k-fg: #2B2117; --k-fg-2: #5A4A38; --k-fg-3: #8A7660; --k-accent: #E23B3B; --k-accent-2: #FF6B6B; --k-on-accent: #fff; --k-a10: rgba(226,59,59,.08); --k-a20: rgba(226,59,59,.15); --k-a40: rgba(226,59,59,.35);
	--cb-hand: "Ink Free", "Segoe Print", "Comic Sans MS", cursive; }
html.kestrel[data-ui="corkboard"] .k-top { background: #6B4A2B; }
html.kestrel[data-ui="corkboard"] .k-top .k-icon-btn, html.kestrel[data-ui="corkboard"] .k-top .k-alt-place, html.kestrel[data-ui="corkboard"] .k-win button { color: #F6E7C8 !important; }
.cb-brand { font: 700 23px var(--cb-hand); color: #FFF3D6 !important; }
.cb-stage { background: #B08654; }
.cb-wall { position: absolute; inset: 0; overflow-y: auto; padding: 30px 40px 80px;
	background-color: #B88A55;
	background-image: radial-gradient(rgba(70,40,10,.35) 1px, transparent 1.6px), radial-gradient(rgba(255,230,180,.25) 1px, transparent 1.4px), radial-gradient(rgba(90,55,20,.25) 2px, transparent 2.5px);
	background-size: 7px 7px, 11px 11px, 23px 23px; background-position: 0 0, 3px 5px, 9px 2px;
	box-shadow: inset 0 0 0 14px #6B4A2B, inset 0 0 0 16px #4A3018, inset 0 0 60px rgba(0,0,0,.4); }
.cb-group { margin-bottom: 36px; }
.cb-note { display: inline-block; padding: 14px 20px 12px; min-width: 200px; transform: rotate(var(--r)); font: 700 22px var(--cb-hand); color: #2B2117; box-shadow: 0 10px 14px -8px rgba(0,0,0,.5); margin: 0 0 14px 10px; }
.cb-note small { display: block; font: 15px var(--cb-hand); opacity: .7; }
.cb-pins { display: flex; flex-wrap: wrap; gap: 26px 22px; padding: 10px 6px; }
.cb-pol { position: relative; width: 132px; padding: 9px 9px 0; background: #FDFBF5; transform: rotate(var(--r)); box-shadow: 0 8px 14px -6px rgba(0,0,0,.55); transition: transform .35s var(--k-spring), box-shadow .3s; }
.cb-pol:hover { transform: rotate(0deg) scale(1.08) translateY(-6px); box-shadow: 0 18px 26px -10px rgba(0,0,0,.6); z-index: 2; }
.cb-pol.old .cb-photo { filter: sepia(.6) saturate(.7); }
.cb-pin { position: absolute; left: 50%; top: -8px; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; z-index: 1;
	background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.7), var(--pin) 45%, color-mix(in srgb, var(--pin) 60%, #000)); box-shadow: 2px 4px 4px rgba(0,0,0,.45); }
.cb-photo { aspect-ratio: 1; overflow: hidden; background: #222; }
.cb-photo img, .cb-photo .alt-noart { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.cb-pol span { display: block; padding: 8px 2px 10px; font: 15px/1.15 var(--cb-hand); color: #2B2117; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cb-front { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; gap: 50px; background: rgba(40,25,10,.7); animation: k-fade 250ms both; perspective: 1200px; }
.cb-big { position: relative; width: 340px; height: 440px; transform-style: preserve-3d; transition: transform .7s var(--k-out); animation: cb-unpin 600ms var(--k-spring) both; }
@keyframes cb-unpin { from { transform: rotate(-8deg) scale(.5) translateY(80px); opacity: 0; } to { transform: none; opacity: 1; } }
.cb-big.flipped { transform: rotateY(180deg); }
.cb-side { position: absolute; inset: 0; padding: 16px 16px 0; background: #FDFBF5; backface-visibility: hidden; box-shadow: 0 30px 50px -20px #000; }
.cb-side.a { cursor: pointer; }
.cb-side.a span { display: block; padding: 14px 4px 6px; font: 24px var(--cb-hand); color: #2B2117; }
.cb-side.a em { position: absolute; right: 16px; bottom: 12px; font: 15px var(--cb-hand); color: #8A7660; font-style: normal; }
.cb-side.b { transform: rotateY(180deg); padding: 26px; background: #FBF6E8 repeating-linear-gradient(180deg, transparent 0 27px, rgba(80,120,200,.25) 27px 28px); }
.cb-scrawl { font: 19px/28px var(--cb-hand); color: #1F3A7A; transform: rotate(-1deg); }
.cb-scrawl b { display: block; font-size: 25px; color: #2B2117; margin-bottom: 4px; }
.cb-scrawl p { margin: 0; }
.cb-quote { margin-top: 10px !important; color: #5A4A38; font-size: 17px; }
.cb-flipback { position: absolute; left: 22px; bottom: 16px; font: 16px var(--cb-hand) !important; color: #8A7660 !important; }
.cb-stickies { display: flex; flex-direction: column; gap: 14px; width: 220px; }
.cb-sticky { --r: -2deg; padding: 14px 16px; text-align: left; transform: rotate(var(--r)); font: 20px var(--cb-hand) !important; color: #2B2117 !important; box-shadow: 0 10px 14px -8px rgba(0,0,0,.6); background: #FFE680; transition: transform .3s var(--k-spring); }
.cb-sticky:hover { transform: rotate(0deg) scale(1.05); }
.cb-sticky.go { background: #FF6B6B; color: #fff !important; font-size: 28px !important; font-weight: 700; --r: 3deg; }
`;

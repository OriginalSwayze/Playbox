// COMIC — your library as a comic book. Each collection is an issue laid out in inked panels with halftone art,
// caption boxes and speech balloons; open a panel for a full splash page and a "POW!" to play.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

/** What the hero of each panel says, from how the game has been played. */
function balloon(g: Game): string {
	const h = g.minutes / 60;
	if (!g.minutes) return "Haven't even started!";
	if (h > 300) return `${Math.round(h)} hours?! I live here now!`;
	if (h > 50) return 'One more run…';
	if (g.lastPlayed && Date.now() / 1000 - g.lastPlayed < 86400 * 7) return 'Back for more!';
	return 'I remember this one!';
}
const SFX = ['POW!', 'ZAP!', 'BLAM!', 'KRAK!', 'WHAM!', 'BOOM!'];

function Splash({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	return (
		<div className="cm-splash-wrap" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<article className="cm-splash">
				<div className="cm-caption top">Meanwhile, in your library…</div>
				<div className="cm-big"><Art g={g} kind="hero" /><i className="cm-dots" /></div>
				<h1>{g.name}</h1>
				<div className="cm-caption">{d.description[0]?.slice(0, 220) ?? 'Our story begins…'}{(d.description[0]?.length ?? 0) > 220 ? '…' : ''}</div>
				<div className="cm-foot">
					<button className="cm-pow" onClick={go.run}><span>{g.installed ? 'POW! PLAY' : 'GET IT!'}</span></button>
					<div className="cm-stats"><b>{formatPlaytime(g.minutes)}</b> in the saga{g.lastPlayed ? ` · last issue ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}{d.achievements.total ? ` · ${d.achievements.achieved}/${d.achievements.total} feats` : ''}</div>
				</div>
				<Actions g={g} className="cm-actions" />
				<button className="cm-close" onClick={close}>To be continued…</button>
			</article>
		</div>
	);
}

export function Comic() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const issues = found ? [{ id: 'q', name: `Special: ${q.trim()}`, games: found.slice(0, 40) }] : islands;
	return (
		<AltPage className="cm" brand="KAPOW! Comics" search={q} onSearch={setQ} searchPlaceholder="Find a hero">
			<div className="cm-desk">
				{issues.map((is, n) => (
					<section key={is.id} className="cm-issue">
						<header className="cm-masthead"><b>{is.name}</b><span>Issue #{n + 1} · {is.games.length} panels · 25¢</span></header>
						<div className="cm-page">
							{is.games.map((g, i) => (
								<button key={g.appid} data-appid={g.appid} className={'cm-panel s' + (i % 7)} onClick={() => select(g.appid)}>
									<Art g={g} kind={i % 7 === 0 ? 'hero' : 'header'} /><i className="cm-dots" />
									<span className="cm-cap">{g.name}</span>
									<span className={'cm-bubble' + (i % 2 ? ' r' : '')}>{balloon(g)}</span>
									{i % 5 === 2 && <span className="cm-sfx">{SFX[g.appid % SFX.length]}</span>}
								</button>
							))}
						</div>
					</section>
				))}
			</div>
			{sel && <Splash key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const comicCss = `
html.kestrel[data-ui="comic"] { --k-ink: #F4ECD8; --k-s1: #FFF9E8; --k-s2: #F7EED6; --k-s3: #EADFC2; --k-s4: #DCCDA6; --k-line: rgba(0,0,0,.18); --k-line-2: rgba(0,0,0,.35);
	--k-fg: #111; --k-fg-2: #333; --k-fg-3: #666; --k-accent: #E8231F; --k-accent-2: #FF4A3D; --k-on-accent: #FFF; --k-a10: rgba(232,35,31,.08); --k-a20: rgba(232,35,31,.15); --k-a40: rgba(232,35,31,.35);
	--cm-sfx: Impact, "Arial Black", sans-serif; --cm-hand: "Comic Sans MS", "Segoe Print", cursive; }
html.kestrel[data-ui="comic"] .k-top { background: #FFE135; border-bottom: 4px solid #111; }
.cm-brand { font: 400 26px var(--cm-sfx); letter-spacing: .02em; color: #E8231F; -webkit-text-stroke: 1.5px #111; text-shadow: 3px 3px 0 #111; transform: rotate(-3deg); }
.cm-stage { background: #F4ECD8; }
.cm-desk { position: absolute; inset: 0; overflow-y: auto; padding: 26px 40px 60px; background: #2B6CB0 radial-gradient(rgba(255,255,255,.18) 1.5px, transparent 2px) 0 0 / 14px 14px; }
.cm-issue { max-width: 1240px; margin: 0 auto 40px; padding: 18px 20px 24px; background: #FFF9E8; box-shadow: 8px 8px 0 #111, 0 0 0 4px #111; animation: k-rise 600ms var(--k-out) both; }
.cm-masthead { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 4px solid #111; }
.cm-masthead b { font: 400 40px var(--cm-sfx); color: #E8231F; -webkit-text-stroke: 1.5px #111; text-shadow: 4px 4px 0 #111; text-transform: uppercase; }
.cm-masthead span { font: 700 14px var(--cm-hand); color: #111; }
.cm-page { display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 160px; grid-auto-flow: dense; gap: 12px; }
.cm-panel { position: relative; overflow: hidden; border: 4px solid #111; background: #fff; transition: transform .25s var(--k-spring), box-shadow .2s; }
.cm-panel.s0 { grid-column: span 3; grid-row: span 2; } .cm-panel.s3 { grid-column: span 2; } .cm-panel.s5 { grid-row: span 2; } .cm-panel.s1, .cm-panel.s2, .cm-panel.s4, .cm-panel.s6 { grid-column: span 1; }
.cm-panel:nth-child(4n+2) { grid-column: span 2; }
.cm-panel:hover { transform: rotate(-1deg) scale(1.03); box-shadow: 6px 6px 0 #111; z-index: 2; }
.cm-panel img, .cm-panel .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.6) contrast(1.25); }
.cm-dots { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(rgba(0,0,0,.35) 1px, transparent 1.4px) 0 0 / 5px 5px; mix-blend-mode: multiply; }
.cm-cap { position: absolute; left: 0; top: 0; max-width: 90%; padding: 3px 8px; background: #FFE135; border-right: 3px solid #111; border-bottom: 3px solid #111; font: 700 12px var(--cm-hand); color: #111; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cm-bubble { position: absolute; left: 10px; bottom: 14px; max-width: 75%; padding: 6px 10px; border: 3px solid #111; border-radius: 50% / 40%; background: #fff; font: 700 12.5px/1.2 var(--cm-hand); color: #111; text-align: center; }
.cm-bubble::after { content: ""; position: absolute; left: 22px; bottom: -14px; border: 8px solid transparent; border-top: 12px solid #111; }
.cm-bubble.r { left: auto; right: 10px; } .cm-bubble.r::after { left: auto; right: 22px; }
.cm-panel.s1 .cm-bubble, .cm-panel.s2 .cm-bubble, .cm-panel.s4 .cm-bubble, .cm-panel.s6 .cm-bubble { display: none; }
.cm-sfx { position: absolute; right: 12px; top: 40px; font: 400 30px var(--cm-sfx); color: #FFE135; -webkit-text-stroke: 2px #111; text-shadow: 3px 3px 0 #E8231F; transform: rotate(12deg); }
.cm-splash-wrap { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 24px; background: rgba(17,17,17,.75); animation: k-fade 200ms both; }
.cm-splash { width: min(900px, 94%); max-height: 100%; overflow-y: auto; padding: 18px 20px 20px; background: #FFF9E8; box-shadow: 0 0 0 5px #111, 12px 12px 0 #E8231F; animation: cm-slam 500ms var(--k-spring) both; }
@keyframes cm-slam { from { transform: scale(.3) rotate(-12deg); opacity: 0; } to { transform: none; opacity: 1; } }
.cm-caption { padding: 8px 12px; background: #FFE135; border: 3px solid #111; font: 700 14px/1.4 var(--cm-hand); color: #111; }
.cm-caption.top { display: inline-block; margin-bottom: 10px; text-transform: uppercase; }
.cm-big { position: relative; aspect-ratio: 16/7; border: 5px solid #111; overflow: hidden; } .cm-big img, .cm-big .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.5) contrast(1.2); }
.cm-splash h1 { margin: 14px 0 10px; font: 400 54px/1 var(--cm-sfx); color: #E8231F; -webkit-text-stroke: 2px #111; text-shadow: 5px 5px 0 #111; text-transform: uppercase; }
.cm-foot { display: flex; align-items: center; gap: 24px; margin: 16px 0 8px; }
.cm-pow { position: relative; width: 190px; height: 120px; flex: none; transition: transform .25s var(--k-spring);
	background: #FFE135 !important; clip-path: polygon(50% 0, 61% 22%, 86% 8%, 78% 34%, 100% 42%, 80% 58%, 94% 84%, 66% 76%, 56% 100%, 44% 78%, 18% 94%, 24% 66%, 0 56%, 20% 42%, 8% 16%, 36% 24%); }
.cm-pow span { font: 400 30px var(--cm-sfx); color: #E8231F; -webkit-text-stroke: 1.5px #111; }
.cm-pow:hover { transform: scale(1.12) rotate(-6deg); }
.cm-stats { font: 700 15px var(--cm-hand); color: #111; }
.cm-actions { display: flex; flex-wrap: wrap; } .cm-actions button { font-family: var(--cm-hand) !important; color: #111 !important; }
.cm-close { margin-top: 8px; font: 700 italic 15px var(--cm-hand) !important; color: #2B6CB0 !important; }
`;

// NOVEL — a visual novel. The scene's background is a game's artwork, its cover stands in as the character portrait,
// and a dialogue box types out lines about your history together; click to advance. At the end you choose: play it,
// or move on to the next character. A backlog and chapter select sit in the corner.
import { useEffect, useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

function script(g: Game): string[] {
	return [
		g.minutes ? `Oh, it's you again. ${formatPlaytime(g.minutes)}… have we really spent that long together?` : `…Hello? You added me ${g.added ? 'back on ' + dateOf(g.added, { day: 'numeric', month: 'long', year: 'numeric' }) : 'ages ago'}, but we've never actually met.`,
		g.lastPlayed ? `The last time I saw you was ${formatAgo(g.lastPlayed).toLowerCase()}. ${g.minutes2w ? "And you've been back a lot lately. I noticed." : 'I was starting to wonder if you’d forgotten me.'}` : 'I’ve been waiting here the whole time, you know.',
		g.installed ? 'I’m all set up and ready. Whenever you are.' : 'I’d need to be installed first… but I’d wait for that, too.',
		'So… what will it be?',
	];
}

export function Novel() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const cast = b.games.slice(0, 60);
	const g = sel ?? cast[0] ?? null;
	const lines = useMemo(() => (g ? script(g) : []), [g?.appid]);
	const [line, setLine] = useState(0);
	const [chars, setChars] = useState(0);
	const [log, setLog] = useState(false);
	useEffect(() => { setLine(0); setChars(0); }, [g?.appid]);
	useEffect(() => { setChars(0); const t = setInterval(() => setChars((c) => c + 2), 22); return () => clearInterval(t); }, [line, g?.appid]);
	const text = lines[line] ?? '';
	const done = chars >= text.length;
	const next = () => { if (!done) setChars(text.length); else if (line < lines.length - 1) setLine(line + 1); };
	const nextChar = () => { const i = cast.findIndex((x) => x.appid === g?.appid); const n = cast[(i + 1) % Math.max(1, cast.length)]; if (n) select(n.appid); };
	return (
		<AltPage className="vn" brand={<>❀ Kestrel Story</>}>
			<div className="vn-app" onClick={next}>
				{g && <Art g={g} kind="hero" className="vn-bg" key={'bg' + g.appid} />}
				{g && <div className="vn-char" key={'c' + g.appid}><Art g={g} kind="capsule" /></div>}
				<div className="vn-menu" onClick={(e) => e.stopPropagation()}><button onClick={() => setLog(!log)}>Log</button><select value={b.cur} onChange={(e) => { b.setCur(e.target.value); select(null); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>Chapter: {i.name}</option>)}</select><button onClick={nextChar}>Skip ▸▸</button></div>
				{g && (
					<div className="vn-box">
						<span className="vn-name">{g.name}</span>
						<p>{text.slice(0, chars)}{done && line < lines.length - 1 && <i className="vn-more">▼</i>}</p>
						{done && line === lines.length - 1 && (
							<div className="vn-choices" onClick={(e) => e.stopPropagation()}>
								<button data-appid={g.appid} onClick={gameCommands(g)[0].run}>{g.installed ? '“Let’s play.”' : '“Let me install you.”'}</button>
								<button onClick={nextChar}>“Maybe another time.”</button>
								<button onClick={gameCommands(g)[2].run}>“Tell me more.” (Store page)</button>
							</div>
						)}
					</div>
				)}
				{log && g && <div className="vn-log" onClick={(e) => e.stopPropagation()}><h4>Backlog</h4>{lines.slice(0, line + 1).map((l, i) => <p key={i}><b>{g.name}:</b> {l}</p>)}<button onClick={() => setLog(false)}>Close</button></div>}
			</div>
		</AltPage>
	);
}

export const novelCss = tok('novel', { bg: '#1B1424', s1: '#2A2036', s2: '#3A2C4A', s3: '#4B3A60', fg: '#FFFFFF', fg2: '#EADFF7', fg3: '#B9A8CF', acc: '#FF8FC7', on: '#2A0E1E', top: 'transparent', font: '"Segoe UI", "Yu Gothic UI", sans-serif' }) + `
html.kestrel[data-ui="novel"] .k-top { position: relative; z-index: 3; border: 0; background: linear-gradient(rgba(0,0,0,.4), transparent); }
.vn-brand { font: 600 17px var(--k-text); color: #fff; letter-spacing: .1em; }
.vn-app { position: absolute; inset: 0; overflow: hidden; background: #1B1424; cursor: pointer; user-select: none; }
.vn-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(1.1) brightness(.85); animation: vn-in 1s ease both; } @keyframes vn-in { from { opacity: 0; transform: scale(1.04); } }
.vn-char { position: absolute; left: 50%; bottom: 0; height: 88%; transform: translateX(-50%); animation: vn-char .6s var(--k-out) both; filter: drop-shadow(0 0 30px rgba(0,0,0,.6)); } .vn-char img { height: 100%; border-radius: 16px 16px 0 0; mask-image: linear-gradient(#000 70%, transparent); } @keyframes vn-char { from { opacity: 0; transform: translate(-50%, 30px); } }
.vn-menu { position: absolute; right: 16px; top: 12px; z-index: 3; display: flex; gap: 6px; } .vn-menu button, .vn-menu select { height: 30px; padding: 0 12px; border-radius: 15px; border: 0; background: rgba(0,0,0,.45); color: #fff; font: 600 12px var(--k-text); }
.vn-box { position: absolute; left: 50%; bottom: 24px; z-index: 2; width: min(1100px, 92%); min-height: 170px; padding: 30px 34px 20px; transform: translateX(-50%); border-radius: 18px; background: linear-gradient(rgba(40,24,56,.82), rgba(20,12,30,.9)); box-shadow: inset 0 0 0 2px rgba(255,180,220,.4), 0 20px 40px rgba(0,0,0,.4); backdrop-filter: blur(6px); }
.vn-name { position: absolute; left: 26px; top: -18px; padding: 6px 22px; border-radius: 12px; background: linear-gradient(90deg, #FF8FC7, #B48CFF); font: 700 16px var(--k-text); color: #fff; box-shadow: 0 6px 14px rgba(0,0,0,.3); }
.vn-box p { margin: 0; font: 20px/1.6 var(--k-text); color: #fff; text-shadow: 0 1px 2px #000; } .vn-more { margin-left: 8px; font-style: normal; color: #FF8FC7; animation: vn-b 1s ease-in-out infinite; } @keyframes vn-b { 50% { transform: translateY(4px); } }
.vn-choices { display: grid; gap: 8px; margin-top: 14px; } .vn-choices button { padding: 10px 18px; border-radius: 12px; background: rgba(255,255,255,.1); box-shadow: inset 0 0 0 1px rgba(255,180,220,.5); text-align: left; font: 17px var(--k-text); color: #fff; } .vn-choices button:hover { background: rgba(255,143,199,.35); }
.vn-log { position: absolute; inset: 60px 15% 220px; z-index: 4; overflow-y: auto; padding: 20px; border-radius: 16px; background: rgba(10,6,16,.92); color: #EADFF7; cursor: default; } .vn-log h4 { margin: 0 0 10px; } .vn-log p { margin: 0 0 10px; line-height: 1.6; } .vn-log b { color: #FF8FC7; } .vn-log button { color: #FF8FC7; }
`;

// TYPEWRITER — a typewriter on a desk. Pick an index card and the machine types a letter about that game onto the
// sheet, a character at a time; pull the carriage-return lever to play. Typing in the card box searches.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const letter = (g: Game) => `${dateOf(Date.now() / 1000, { day: 'numeric', month: 'long', year: 'numeric' })}\n\nRe: ${g.name}\n\nDear Player,\n\n${g.minutes ? `I write to remind you of the ${formatPlaytime(g.minutes)} we have spent together${g.lastPlayed ? `, most recently ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}.` : `I write as a game you have never once played, though you added me ${g.added ? 'on ' + dateOf(g.added, { day: 'numeric', month: 'long', year: 'numeric' }) : 'long ago'}.`} ${g.installed ? 'I am installed and ready at a moment’s notice.' : 'I am not installed at present, but could be shortly.'}\n\nShould you wish to resume our acquaintance, simply pull the lever.\n\nYours faithfully,\n${g.name}`;

export function Typewriter() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [n, setN] = useState(0);
	const [pulled, setPulled] = useState(false);
	const text = sel ? letter(sel) : '';
	useEffect(() => { setN(0); setPulled(false); if (!sel) return; const t = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(t), x) : x + 2)), 18); return () => clearInterval(t); }, [sel?.appid]);
	const cmds = sel ? gameCommands(sel) : [];
	return (
		<AltPage className="typ" brand={<>The Kestrel <i>No. 5</i></>}>
			<div className="typ-app">
				<aside className="typ-cards">
					<input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Find a card…" spellCheck={false} />
					<div className="typ-tabs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</div>
					<div className="typ-file">{b.games.slice(0, 120).map((g) => <button key={g.appid} data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'unplayed'}</em></button>)}</div>
				</aside>
				<section className="typ-desk">
					<div className="typ-machine">
						<div className="typ-sheet" key={sel?.appid ?? 'blank'}>{sel ? <><Art g={sel} kind="capsule" className="typ-photo" /><pre>{text.slice(0, n)}<span className="typ-caret">▌</span></pre></> : <pre className="typ-blank">Choose an index card…<span className="typ-caret">▌</span></pre>}</div>
						<div className="typ-platen"><i /><i /></div>
						<div className="typ-body">
							<button className={'typ-lever' + (pulled ? ' pulled' : '')} disabled={!sel} onClick={() => { setPulled(true); setTimeout(() => cmds[0]?.run(), 450); }} title={sel?.installed ? 'Play' : 'Install'}><span>{sel ? (sel.installed ? 'RETURN · PLAY' : 'RETURN · INSTALL') : 'RETURN'}</span></button>
							<div className="typ-keys">{'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map((k) => <span key={k}>{k}</span>)}</div>
							{sel && <div className="typ-more">{cmds.slice(1).map((c) => <button key={c.id} onClick={c.run}>{c.label}</button>)}</div>}
						</div>
					</div>
				</section>
			</div>
		</AltPage>
	);
}

export const typewriterCss = tok('typewriter', { bg: '#4B3524', s1: '#5C4330', s2: '#6E513B', s3: '#806048', fg: '#F3E9D6', fg2: '#D9C9AB', fg3: '#A8957A', acc: '#C0392B', on: '#fff', top: '#2E2016', font: '"Courier New", "American Typewriter", monospace' }) + `
.typ-brand { font: 700 18px Georgia, serif; color: #F3E9D6; } .typ-brand i { font-weight: 400; color: #D9C9AB; }
.typ-app { position: absolute; inset: 0; display: grid; grid-template-columns: 320px minmax(0, 1fr); background: repeating-linear-gradient(92deg, rgba(0,0,0,.08) 0 2px, transparent 2px 40px), linear-gradient(#6E4B30, #3E2A1B); }
.typ-cards { display: flex; flex-direction: column; gap: 8px; min-height: 0; padding: 16px; }
.typ-cards input { height: 38px; padding: 0 12px; border: 0; border-radius: 2px; background: #FFFDF5; font: 15px "Courier New", monospace; color: #222; outline: none; box-shadow: 0 2px 4px rgba(0,0,0,.4); }
.typ-tabs { display: flex; flex-wrap: wrap; gap: 4px; max-height: 90px; overflow-y: auto; } .typ-tabs button { padding: 3px 9px; border-radius: 6px 6px 0 0; background: #E9D8A6; font: 12px "Courier New", monospace; color: #3E2A1B; } .typ-tabs button.on { background: #FFFDF5; font-weight: 700; }
.typ-file { flex: 1; overflow-y: auto; padding: 6px; border-radius: 4px; background: #2E2016; box-shadow: inset 0 4px 10px rgba(0,0,0,.6); }
.typ-file button { display: block; width: 100%; margin-bottom: -12px; padding: 8px 12px 18px; text-align: left; border-radius: 3px; background: linear-gradient(#FFFDF5 0 22px, #F4C2C2 22px 23px, #FFFDF5 23px), #FFFDF5; box-shadow: 0 -2px 4px rgba(0,0,0,.25); transition: transform .2s var(--k-spring); }
.typ-file button:hover { transform: translateY(-6px); } .typ-file button.on { transform: translateY(-10px) translateX(8px); box-shadow: 0 -2px 4px rgba(0,0,0,.25), 0 0 0 2px #C0392B; }
.typ-file b { display: block; font: 700 13px "Courier New", monospace; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .typ-file em { font: 12px "Courier New", monospace; font-style: normal; color: #555; }
.typ-desk { display: grid; place-items: end center; padding: 20px 20px 0; overflow: hidden; }
.typ-machine { position: relative; width: min(760px, 100%); height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) 30px 230px; }
.typ-sheet { position: relative; justify-self: center; width: 78%; overflow: hidden; padding: 30px 40px; background: #FFFDF5; box-shadow: 0 0 20px rgba(0,0,0,.4); animation: typ-feed .6s var(--k-out) both; display: flex; flex-direction: column; justify-content: flex-end; } @keyframes typ-feed { from { transform: translateY(60%); } }
.typ-sheet pre { margin: 0; font: 15px/1.6 "Courier New", monospace; color: #1A1A1A; white-space: pre-wrap; text-shadow: 0 0 .6px #000; } .typ-blank { color: #999 !important; }
.typ-photo { position: absolute; right: 24px; top: 24px; width: 90px; transform: rotate(4deg); box-shadow: 0 3px 8px rgba(0,0,0,.3); border: 5px solid #fff; } .typ-caret { animation: cct-blink 1s steps(2) infinite; color: #C0392B; } @keyframes cct-blink { 50% { opacity: 0; } }
.typ-platen { position: relative; border-radius: 15px; background: linear-gradient(#333, #111 50%, #333); box-shadow: 0 4px 6px rgba(0,0,0,.5); } .typ-platen i { position: absolute; top: -6px; width: 26px; height: 42px; border-radius: 8px; background: linear-gradient(90deg, #555, #222); } .typ-platen i:first-child { left: -20px; } .typ-platen i:last-child { right: -20px; }
.typ-body { position: relative; display: grid; align-content: start; justify-items: center; gap: 10px; padding-top: 20px; border-radius: 30px 30px 0 0; background: linear-gradient(#2B3A32, #18221D); box-shadow: inset 0 2px 0 rgba(255,255,255,.15); }
.typ-lever { position: absolute; left: -10px; top: -46px; transform-origin: right center; transition: transform .45s var(--k-spring); } .typ-lever span { display: block; padding: 8px 14px; border-radius: 99px 4px 4px 99px; background: linear-gradient(#E0E0E0, #9A9A9A); font: 700 11px var(--k-text); letter-spacing: .08em; color: #222; box-shadow: 0 3px 6px rgba(0,0,0,.4); }
.typ-lever.pulled { transform: translateX(80px) rotate(-8deg); } .typ-lever:disabled { opacity: .6; }
.typ-keys { display: grid; grid-template-columns: repeat(10, 40px); gap: 8px 10px; } .typ-keys span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFFDF5, #CFC6B0); box-shadow: 0 0 0 3px #111, 0 4px 0 #000; font: 700 14px "Courier New", monospace; color: #222; }
.typ-keys span:nth-child(n+11):nth-child(-n+19) { transform: translateX(20px); } .typ-keys span:nth-child(n+20) { transform: translateX(40px); }
.typ-more { display: flex; gap: 6px; } .typ-more button { padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,.1); font: 12px "Courier New", monospace; color: #D9C9AB; } .typ-more button:hover { background: rgba(255,255,255,.2); }
`;

// QUEST — a classic role-playing-game menu. Blue gradient windows with white borders: the party (your most-played
// games, with level, HP and MP bars from your playtime), a command list, the item bag (a collection) and a status
// screen. "Fight" starts the game. A hand cursor points at the current choice.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

const lvl = (g: Game) => Math.max(1, Math.min(99, Math.round(Math.sqrt(g.minutes / 6))));
const hp = (g: Game) => Math.min(1, g.minutes2w / 600 + (g.installed ? 0.3 : 0.05));

export function Quest() {
	const { top } = useLibraryLists();
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [cmd, setCmd] = useState<'party' | 'items' | 'status'>('party');
	const party = top.slice(0, 4);
	const cur = sel ?? party[0] ?? null;
	const total = top.reduce((n, g) => n + g.minutes, 0);
	const Member = ({ g }: { g: Game }) => (
		<button data-appid={g.appid} className={'rpg-mem' + (cur?.appid === g.appid ? ' on' : '')} onClick={() => { select(g.appid); setCmd('status'); }}>
			<span className="rpg-hand">☞</span><span className="rpg-face"><Art g={g} kind="capsule" /></span>
			<span className="rpg-st"><b>{g.name.slice(0, 18)}</b><em>LV {lvl(g)}</em><span className="rpg-bar hp"><i style={{ width: hp(g) * 100 + '%' }} /></span><span className="rpg-bar mp"><i style={{ width: Math.min(100, (g.metacritic || 30)) + '%' }} /></span></span>
		</button>
	);
	return (
		<AltPage className="rpg" brand={<>⚔ QUEST</>}>
			<div className="rpg-app">
				<div className="rpg-win rpg-main">
					{cmd === 'party' && <div className="rpg-party">{party.map((g) => <Member key={g.appid} g={g} />)}</div>}
					{cmd === 'items' && <div className="rpg-items"><div className="rpg-pouch">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name}</button>)}</div>
						<div className="rpg-list">{b.games.slice(0, 120).map((g) => <button key={g.appid} data-appid={g.appid} className={cur?.appid === g.appid ? 'on' : ''} onClick={() => { select(g.appid); setCmd('status'); }}><span className="rpg-hand">☞</span>{g.installed ? '◆' : '◇'} {g.name.slice(0, 26)}<em>×{Math.max(1, lvl(g))}</em></button>)}</div></div>}
					{cmd === 'status' && cur && <div className="rpg-status" key={cur.appid}><Art g={cur} kind="capsule" className="rpg-port" /><div><h2>{cur.name}</h2>
						<table><tbody><tr><td>LEVEL</td><td>{lvl(cur)}</td></tr><tr><td>EXP</td><td>{cur.minutes} min</td></tr><tr><td>NEXT LV</td><td>{Math.round(((lvl(cur) + 1) ** 2) * 6 - cur.minutes)} min</td></tr><tr><td>HP</td><td>{Math.round(hp(cur) * 999)}/999</td></tr><tr><td>MP</td><td>{cur.metacritic || 0}/100</td></tr><tr><td>JOINED</td><td>{dateOf(cur.added)}</td></tr><tr><td>LAST BATTLE</td><td>{cur.lastPlayed ? formatAgo(cur.lastPlayed) : 'NEVER'}</td></tr></tbody></table>
						<div className="rpg-acts">{gameCommands(cur).map((c, i) => <button key={c.id} onClick={c.run}><span className="rpg-hand">☞</span>{i === 0 ? (cur.installed ? 'FIGHT (PLAY)' : 'RECRUIT (INSTALL)') : c.label.toUpperCase()}</button>)}</div></div></div>}
				</div>
				<div className="rpg-win rpg-cmds">{([['party', 'PARTY'], ['items', 'ITEMS'], ['status', 'STATUS']] as const).map(([k, n]) => <button key={k} className={cmd === k ? 'on' : ''} onClick={() => setCmd(k)}><span className="rpg-hand">☞</span>{n}</button>)}</div>
				<div className="rpg-win rpg-gold"><p>TIME<b>{formatPlaytime(total)}</b></p><p>GOLD<b>{top.length} G</b></p></div>
				<div className="rpg-win rpg-msg">{cur ? `${cur.name}: ${cur.minutes2w ? 'Ready for battle!' : cur.minutes ? 'Resting at the inn.' : 'A new challenger awaits.'}` : 'Choose a party member.'}</div>
			</div>
		</AltPage>
	);
}

export const questCss = tok('quest', { bg: '#000000', s1: '#1A2A8C', s2: '#2236A8', s3: '#2C44C4', fg: '#FFFFFF', fg2: '#E0E6FF', fg3: '#A8B4F0', acc: '#FFFFFF', on: '#000', top: '#000000', font: '"Lucida Console", "Courier New", monospace' }) + `
.rpg-brand { font: 700 16px var(--k-text); letter-spacing: .2em; color: #fff; }
.rpg-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 260px; grid-template-rows: minmax(0, 1fr) 140px 70px; gap: 10px; padding: 16px; background: #000; font: 16px "Lucida Console", "Courier New", monospace; color: #fff; text-shadow: 2px 2px 0 #000; }
.rpg-win { border-radius: 8px; background: linear-gradient(#2C44C4, #0B1660); box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 5px #6A78C8, 0 0 0 2px #000; padding: 16px 18px; overflow: hidden; }
.rpg-main { grid-row: 1 / 3; overflow-y: auto; } .rpg-cmds { display: grid; align-content: start; gap: 6px; } .rpg-gold p { display: flex; justify-content: space-between; margin: 4px 0; } .rpg-msg { grid-column: 1 / -1; display: flex; align-items: center; font-size: 17px; }
.rpg-hand { visibility: hidden; margin-right: 8px; font-size: 18px; color: #fff; animation: rpg-point .6s steps(2) infinite; } @keyframes rpg-point { 50% { transform: translateX(4px); } }
.rpg-cmds button, .rpg-list button, .rpg-acts button { display: flex; align-items: center; width: 100%; padding: 4px 2px; text-align: left; font: 17px "Lucida Console", monospace; color: #fff; text-shadow: 2px 2px 0 #000; }
.rpg-cmds button.on .rpg-hand, .rpg-cmds button:hover .rpg-hand, .rpg-list button:hover .rpg-hand, .rpg-list button.on .rpg-hand, .rpg-acts button:hover .rpg-hand, .rpg-mem:hover .rpg-hand, .rpg-mem.on .rpg-hand { visibility: visible; }
.rpg-party { display: grid; gap: 14px; } .rpg-mem { display: flex; gap: 14px; align-items: center; width: 100%; text-align: left; color: #fff; }
.rpg-face { width: 72px; height: 72px; flex: none; border: 3px solid #fff; overflow: hidden; } .rpg-face img, .rpg-face .alt-noart { width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated; font-size: 6px; }
.rpg-st { display: grid; grid-template-columns: 1fr auto; gap: 4px 20px; flex: 1; } .rpg-st b { font-weight: 400; font-size: 18px; } .rpg-st em { font-style: normal; color: #FFE45E; }
.rpg-bar { grid-column: 1 / -1; display: block; height: 8px; background: #000; box-shadow: 0 0 0 1px #fff; } .rpg-bar i { display: block; height: 100%; } .rpg-bar.hp i { background: linear-gradient(#7CFF7C, #2BB82B); } .rpg-bar.mp i { background: linear-gradient(#7CC4FF, #2B6AB8); }
.rpg-items { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 10px; height: 100%; } .rpg-pouch { display: flex; flex-wrap: wrap; gap: 6px; } .rpg-pouch button { padding: 2px 8px; font: 13px "Lucida Console", monospace; color: #A8B4F0; box-shadow: inset 0 0 0 1px #6A78C8; } .rpg-pouch button.on { color: #fff; background: rgba(255,255,255,.15); }
.rpg-list { overflow-y: auto; columns: 2; } .rpg-list button { break-inside: avoid; } .rpg-list em { margin-left: auto; font-style: normal; color: #A8B4F0; }
.rpg-status { display: flex; gap: 24px; } .rpg-port { width: 180px; border: 3px solid #fff; align-self: start; } .rpg-status h2 { margin: 0 0 10px; font: 400 24px "Lucida Console", monospace; } .rpg-status table { border-spacing: 0 4px; margin-bottom: 14px; } .rpg-status td:first-child { width: 160px; color: #FFE45E; }
.rpg-acts { display: grid; gap: 2px; }
`;

// IRC — a 90s chat client. Channels are collections (#recently-played…), the nick list is the channel's games
// (@ for installed, + for played this fortnight), and the log is a stream of joins and messages. Type /play, /info,
// /join #channel or a name.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { useKestrel } from '../state/store';

const chan = (n: string) => '#' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const nick = (g: Game) => g.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 14) || 'game' + g.appid;
const ts = (u: number) => new Date(u * 1000).toTimeString().slice(0, 5);

export function Irc() {
	const library = useKestrel((s) => s.library);
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [extra, setExtra] = useState<{ t: string; c?: string }[]>([]);
	const [line, setLine] = useState('');
	const log = useRef<HTMLDivElement>(null);
	const ops = b.games;
	const msgs = ops.filter((g) => g.lastPlayed).sort((a, c) => a.lastPlayed - c.lastPlayed).slice(-60).map((g) => ({ t: `[${ts(g.lastPlayed)}] <${nick(g)}> ${g.minutes2w ? `played ${formatPlaytime(g.minutes2w)} this fortnight` : `last seen ${formatAgo(g.lastPlayed).toLowerCase()}`}`, g }));
	useEffect(() => { log.current?.scrollTo(0, 1e9); }, [b.cur, extra.length, sel?.appid]);
	const say = (t: string, c?: string) => setExtra((x) => [...x.slice(-80), { t, c }]);
	const run = (raw: string) => {
		const [cmd, ...rest] = raw.trim().split(' '); const arg = rest.join(' ');
		const find = (q: string) => library.find((g) => nick(g).toLowerCase() === q.toLowerCase() || g.name.toLowerCase().includes(q.toLowerCase()));
		if (cmd === '/join') { const i = b.islands.find((x) => chan(x.name) === arg.toLowerCase() || chan(x.name) === '#' + arg.toLowerCase()); if (i) { b.setCur(i.id); say(`* Now talking in ${chan(i.name)}`, 'j'); } else say(`* ${arg}: No such channel`, 'e'); }
		else if (cmd === '/play' || cmd === '/info') { const g = arg ? find(arg) : sel; if (!g) return say(`* ${arg || 'nobody'}: No such nick`, 'e'); select(g.appid); if (cmd === '/play') { gameCommands(g)[0].run(); say(`* You ${g.installed ? 'launch' : 'install'} ${g.name}`, 'a'); } }
		else if (cmd === '/help') say('* Commands: /join #channel, /play <nick>, /info <nick>, /list', 'j');
		else if (cmd === '/list') say('* Channels: ' + b.islands.map((x) => chan(x.name)).join(' '), 'j');
		else if (raw.trim()) { const g = find(raw.trim()); g ? select(g.appid) : say(`<you> ${raw}`); }
	};
	return (
		<AltPage className="irc" brand={<>kIRC 4.2</>}>
			<div className="irc-app">
				<aside className="irc-chans"><b>Status</b>{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); say(`* Now talking in ${chan(i.name)}`, 'j'); }}>{chan(i.name)}</button>)}</aside>
				<section className="irc-main">
					<div className="irc-topic">{chan(b.isle?.name ?? 'library')}: {b.games.length} games · topic: {sel ? `${sel.name} — ${formatPlaytime(sel.minutes)} played, ${sel.installed ? 'installed' : 'not installed'}` : 'type /help'}</div>
					<div className="irc-log" ref={log}>
						<p className="j">* Now talking in {chan(b.isle?.name ?? 'library')}</p>
						{msgs.map((m, i) => <p key={i}><button className="irc-n" onClick={() => select(m.g.appid)}>{m.t}</button></p>)}
						{sel && <p className="a">* {nick(sel)} is {sel.name} · {formatPlaytime(sel.minutes)} · {sel.installed ? 'installed (type /play)' : 'not installed (type /play to install)'}</p>}
						{extra.map((m, i) => <p key={'x' + i} className={m.c}>{m.t}</p>)}
					</div>
					<form className="irc-in" onSubmit={(e) => { e.preventDefault(); run(line); setLine(''); }}><span>[{sel ? nick(sel) : 'you'}]</span><input value={line} onChange={(e) => setLine(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="/help" spellCheck={false} /></form>
				</section>
				<aside className="irc-nicks"><b>{ops.length} nicks</b>{ops.slice(0, 300).map((g) => <button key={g.appid} data-appid={g.appid} className={(sel?.appid === g.appid ? 'on ' : '') + (g.installed ? 'op' : g.minutes2w ? 'v' : '')} onClick={() => select(g.appid)} onDoubleClick={() => gameCommands(g)[0].run()}>{g.installed ? '@' : g.minutes2w ? '+' : ' '}{nick(g)}</button>)}</aside>
			</div>
		</AltPage>
	);
}

export const ircCss = tok('irc', { bg: '#FFFFFF', s1: '#ECE9D8', s2: '#E0DCC8', s3: '#C8C4B0', fg: '#000000', fg2: '#222', fg3: '#666', acc: '#000080', on: '#fff', top: '#ECE9D8', font: '"Fixedsys", "Lucida Console", Consolas, monospace' }) + `
.irc-brand { font: 700 13px Tahoma, sans-serif; color: #000; }
.irc-app { position: absolute; inset: 0; display: grid; grid-template-columns: 180px minmax(0, 1fr) 190px; gap: 3px; padding: 3px; background: #ECE9D8; font: 13px/1.4 "Lucida Console", Consolas, monospace; }
.irc-chans, .irc-nicks { overflow-y: auto; background: #fff; border: 2px inset #fff; } .irc-chans b, .irc-nicks b { display: block; padding: 3px 6px; background: #ECE9D8; font: 700 12px Tahoma, sans-serif; }
.irc-chans button, .irc-nicks button { display: block; width: 100%; padding: 0 6px; text-align: left; font: 13px/1.5 "Lucida Console", Consolas, monospace; color: #000; white-space: pre; overflow: hidden; text-overflow: ellipsis; } .irc-chans button.on, .irc-nicks button.on { background: #000080; color: #fff; }
.irc-nicks .op { color: #000; } .irc-nicks .v { color: #00007F; } .irc-nicks button:not(.op):not(.v):not(.on) { color: #808080; }
.irc-main { display: grid; grid-template-rows: auto minmax(0, 1fr) 26px; min-height: 0; gap: 3px; }
.irc-topic { padding: 3px 6px; background: #fff; border: 2px inset #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000080; }
.irc-log { overflow-y: auto; padding: 4px 6px; background: #fff; border: 2px inset #fff; } .irc-log p { margin: 0; white-space: pre-wrap; } .irc-n { font: inherit; text-align: left; color: #000; } .irc-n:hover { background: #FFFFC0; }
.irc-log .j { color: #009300; } .irc-log .a { color: #9C009C; } .irc-log .e { color: #FC0000; }
.irc-in { display: flex; gap: 6px; align-items: center; padding: 0 6px; background: #fff; border: 2px inset #fff; } .irc-in span { color: #000080; } .irc-in input { flex: 1; border: 0; outline: none; font: 13px "Lucida Console", Consolas, monospace; }
`;

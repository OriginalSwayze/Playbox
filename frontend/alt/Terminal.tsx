// TERMINAL — Steam as a command line on a phosphor monitor. Real commands drive Steam: play, install, ls,
// find, info, store, downloads, menus… with Tab completion, history and clickable output.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getState, setState, useKestrel } from '../state/store';
import { goNative, goSpace } from '../state/nav';
import { updateSettings } from '../state/settings';
import { formatAgo, formatBytes, formatPlaytime, playOrInstall, type Game } from '../steam/library';
import { gameActions } from '../steam/details';
import { openFriendsList } from '../steam/activity';
import { openRootMenu, system, type RootMenu } from '../steam/native';
import { client, mainWindow } from '../steam/env';
import { CATALOG, uiIds } from './catalog';
import { AltChrome, Brand, PlaceButtons, useIslands, useNativeShowing } from './common';

type Entry = { id: number; cmd?: string; out: ReactNode };
const COMMANDS = ['help', 'ls', 'find', 'info', 'play', 'install', 'stop', 'props', 'store', 'community', 'profile', 'wishlist', 'downloads', 'dl', 'online', 'friends', 'menu', 'settings', 'kestrel', 'ui', 'clear', 'history', 'exit'];
const HELP: [string, string][] = [
	['ls [installed|recent|played|unplayed|<collection>]', 'list games; plain ls lists your collections'],
	['find <text>', 'search your library'],
	['info <game>', 'details, art and actions for a game'],
	['play | install | stop <game>', 'launch, install or close a game'],
	['props <game>', "open the game's Steam properties"],
	['store [search]', 'open the Store, or search it'],
	['community · profile · wishlist', 'open those Steam pages'],
	['downloads · dl', 'download status (downloads opens the page)'],
	['online · friends', "who's online · open the friends list"],
	['menu <steam|view|friends|games|help>', "open one of Steam's menus"],
	['settings · kestrel', "Steam's settings · Kestrel's settings"],
	['ui [name]', 'list interfaces, or switch to one'],
	['clear · history · exit', 'clear the screen · past commands · quit Steam'],
];

function score(q: string, text: string): number {
	const t = text.toLowerCase();
	if (t === q) return 100;
	if (t.startsWith(q)) return 80;
	const initials = t.split(/[^a-z0-9]+/).filter(Boolean).map((w) => (/^[0-9]+$/.test(w) ? w : w[0])).join('');
	if (q.length >= 2 && initials.startsWith(q)) return 70;
	if (t.includes(' ' + q)) return 60;
	if (t.includes(q)) return 40;
	return 0;
}

const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));

export function Terminal() {
	const library = useKestrel((s) => s.library);
	const friends = useKestrel((s) => s.friends);
	const islands = useIslands();
	const native = useNativeShowing();
	const [log, setLog] = useState<Entry[]>([]);
	const [line, setLine] = useState('');
	const [hist, setHist] = useState<string[]>([]);
	const [hi, setHi] = useState(-1);
	const input = useRef<HTMLInputElement>(null);
	const screen = useRef<HTMLDivElement>(null);
	const nextId = useRef(1);
	const booted = useRef(false);

	const print = (out: ReactNode, cmd?: string) => setLog((l) => [...l.slice(-200), { id: nextId.current++, cmd, out }]);
	const sorted = useMemo(() => [...library].sort((a, b) => b.lastPlayed - a.lastPlayed), [library]);

	const resolve = (q: string): Game | Game[] | null => {
		q = q.trim().toLowerCase();
		if (!q) return null;
		const ranked = library.map((g) => ({ g, s: score(q, g.name) + (g.installed ? 3 : 0) + (g.lastPlayed ? 1 : 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.g.lastPlayed - a.g.lastPlayed);
		if (!ranked.length) return null;
		if (ranked[0].s >= 60 || ranked.length === 1) return ranked[0].g;
		return ranked.slice(0, 6).map((x) => x.g);
	};

	const G = ({ g }: { g: Game }) => <button className="tm-link" onClick={() => run(`info ${g.name}`)}>{g.name}</button>;
	const A = ({ cmd, children }: { cmd: string; children: ReactNode }) => <button className="tm-act" onClick={() => run(cmd)}>[{children}]</button>;
	const table = (gs: Game[]) => (
		<div className="tm-table">
			<div className="tm-th">{pad('NAME', 46)}{pad('PLAYED', 11)}{pad('LAST', 17)}STATE</div>
			{gs.map((g) => (
				<div key={g.appid} className={'tm-tr' + (g.installed ? ' on' : '')}>
					<span style={{ display: 'inline-block', width: '46ch' }}><G g={g} /></span>{pad(g.minutes ? formatPlaytime(g.minutes) : 'never', 11)}{pad(g.lastPlayed ? formatAgo(g.lastPlayed) : '—', 17)}{g.status || (g.installed ? 'installed' : '-')}
				</div>
			))}
		</div>
	);
	const withGame = (arg: string, f: (g: Game) => ReactNode) => {
		const r = resolve(arg);
		if (!r) return <span className="tm-err">no game matches "{arg}"</span>;
		if (Array.isArray(r)) return <>did you mean:{r.map((g) => <div key={g.appid}>  <G g={g} /></div>)}</>;
		return f(r);
	};

	function run(raw: string) {
		const text = raw.trim();
		if (!text) return;
		setHist((h) => [...h.filter((x) => x !== text), text].slice(-100));
		setHi(-1);
		const [cmd, ...rest] = text.split(/\s+/);
		const arg = rest.join(' ');
		const c = cmd.toLowerCase();
		const out = (() => {
			switch (c) {
				case 'help': return <div className="tm-help">{HELP.map(([a, b]) => <div key={a}><b>{pad(a, 44)}</b>{b}</div>)}</div>;
				case 'clear': setLog([]); return null;
				case 'history': return <>{hist.slice(-20).map((h, i) => <div key={i}><button className="tm-link" onClick={() => run(h)}>{h}</button></div>)}</>;
				case 'ls': {
					const a = arg.toLowerCase();
					if (!a) return <div className="tm-help">{islands.map((i) => <div key={i.id}><button className="tm-link" onClick={() => run(`ls ${i.name}`)}>{pad(i.name, 34)}</button>{String(i.games.length).padStart(4)} games</div>)}<div className="tm-dim">ls installed · ls recent · ls played · ls unplayed · ls all</div></div>;
					if (a === 'all') return table([...library].sort((x, y) => x.sortName.localeCompare(y.sortName)));
					if (a === 'installed') return table(sorted.filter((g) => g.installed));
					if (a === 'recent') return table(sorted.filter((g) => g.lastPlayed).slice(0, 20));
					if (a === 'played') return table([...library].filter((g) => g.minutes > 0).sort((x, y) => y.minutes - x.minutes));
					if (a === 'unplayed') return table([...library].filter((g) => g.minutes === 0).sort((x, y) => x.sortName.localeCompare(y.sortName)));
					const col = islands.find((i) => i.name.toLowerCase() === a) ?? islands.find((i) => i.name.toLowerCase().startsWith(a)) ?? islands.find((i) => i.name.toLowerCase().includes(a));
					return col ? <>{col.name}:{table(col.games)}</> : <span className="tm-err">no collection called "{arg}"</span>;
				}
				case 'find': {
					if (!arg) return <span className="tm-err">usage: find &lt;text&gt;</span>;
					const q = arg.toLowerCase();
					const gs = library.filter((g) => score(q, g.name) > 0).sort((a, b) => score(q, b.name) - score(q, a.name));
					return gs.length ? <>{gs.length} found{table(gs.slice(0, 40))}</> : <span className="tm-err">nothing found for "{arg}"</span>;
				}
				case 'info': return withGame(arg, (g) => (
					<div className="tm-info">
						<img src={g.header} alt="" />
						<div>
							<div className="tm-big">{g.name}</div>
							<div>played {formatPlaytime(g.minutes)} · last {g.lastPlayed ? formatAgo(g.lastPlayed) : 'never'}{g.sizeOnDisk ? ` · ${formatBytes(g.sizeOnDisk)}` : ''}</div>
							<div>{g.status || (g.installed ? 'installed' : 'not installed')} · appid {g.appid}</div>
							<div className="tm-acts">
								<A cmd={`${g.installed ? 'play' : 'install'} ${g.name}`}>{g.installed ? 'play' : 'install'}</A>
								<A cmd={`props ${g.name}`}>properties</A>
								<button className="tm-act" onClick={() => goNative(`https://store.steampowered.com/app/${g.appid}/`, 'discover')}>[store page]</button>
								<button className="tm-act" onClick={() => goNative(`/library/app/${g.appid}`, 'play')}>[steam page]</button>
							</div>
						</div>
					</div>
				));
				case 'play': return withGame(arg, (g) => { if (!g.installed) return <span className="tm-err">{g.name} isn't installed. try: <A cmd={`install ${g.name}`}>install</A></span>; playOrInstall(g); return <>launching {g.name}…</>; });
				case 'install': return withGame(arg, (g) => { if (g.installed) return <>{g.name} is already installed</>; playOrInstall(g); return <>opening Steam's installer for {g.name}</>; });
				case 'stop': return withGame(arg, (g) => { if (!getState().running.includes(g.appid)) return <>{g.name} isn't running</>; gameActions.stop(g.gameid); return <>closing {g.name}</>; });
				case 'props': case 'properties': return withGame(arg, (g) => { gameActions.properties(g.appid); return <>opening properties for {g.name}</>; });
				case 'store': if (arg) { goNative(`https://store.steampowered.com/search/?term=${encodeURIComponent(arg)}`, 'discover'); return <>searching the store for "{arg}"</>; } goSpace('discover'); return <>opening the store</>;
				case 'community': goSpace('social'); return <>opening the community</>;
				case 'profile': goSpace('you'); return <>opening your profile</>;
				case 'wishlist': goNative('https://store.steampowered.com/wishlist/', 'discover'); return <>opening your wishlist</>;
				case 'downloads': goNative('/library/downloads', 'play'); return <>opening downloads</>;
				case 'dl': {
					const d = getState().downloads;
					return d.active ? <>{d.active.name}: {d.active.percent.toFixed(1)}%{d.rate ? ` at ${formatBytes(d.rate)}/s` : ''}{d.queue.length ? ` · ${d.queue.length} queued` : ''}</> : <>nothing downloading{d.queue.length ? `, ${d.queue.length} queued: ${d.queue.map((q) => q.name).join(', ')}` : ''}</>;
				}
				case 'online': { const on = friends.filter((f) => f.state !== 'offline'); return on.length ? <>{on.map((f) => <div key={f.id}>{pad(f.name, 28)}{f.state === 'ingame' ? `playing ${f.game}` : f.state}</div>)}</> : <>no friends online</>; }
				case 'friends': openFriendsList(); return <>opening the friends list</>;
				case 'menu': { const m = (arg[0]?.toUpperCase() + arg.slice(1).toLowerCase()) as RootMenu; if (!['Steam', 'View', 'Friends', 'Games', 'Help'].includes(m)) return <span className="tm-err">usage: menu steam|view|friends|games|help</span>; openRootMenu(m); return <>opening the {m} menu</>; }
				case 'settings': try { client().URL.ExecuteSteamURL('steam://open/settings'); } catch { /* ignore */ } return <>opening Steam settings</>;
				case 'kestrel': setState({ settingsOpen: true }); return <>opening Kestrel settings</>;
				case 'ui': { const u = arg.toLowerCase(); if (!u) return <div className="tm-help">{CATALOG.map((c) => <div key={c.id}><button className="tm-link" onClick={() => run('ui ' + c.id)}>{pad(c.id, 16)}</button>{c.blurb}</div>)}</div>; if (!uiIds().includes(u)) return <span className="tm-err">no interface called "{u}". type <A cmd="ui">ui</A> for the list</span>; updateSettings({ ui: u }); return <>switching to {u}</>; }
				case 'exit': if (arg === '--yes') { system.exit(); return <>shutting Steam down…</>; } return <>this quits Steam completely. type <A cmd="exit --yes">exit --yes</A> to confirm</>;
				default: {
					const g = resolve(text);
					if (g && !Array.isArray(g)) return <span className="tm-err">unknown command "{cmd}". did you mean <A cmd={`info ${g.name}`}>info {g.name}</A>?</span>;
					return <span className="tm-err">unknown command "{cmd}". type <A cmd="help">help</A></span>;
				}
			}
		})();
		if (out !== null) print(out, text);
		else if (c !== 'clear') print('', text);
	}

	// first boot message once the library is known
	useEffect(() => {
		if (booted.current || !library.length) return;
		booted.current = true;
		const inst = library.filter((g) => g.installed).length;
		const last = sorted[0];
		print(<div className="tm-boot">
			<div className="tm-big">KESTREL/OS 1.0</div>
			<div>connected to Steam · {library.length} games · {inst} installed · {islands.filter((i) => i.id !== 'recent').length} collections</div>
			{last && <div>last played: <G g={last} /> ({formatAgo(last.lastPlayed)}) <A cmd={`play ${last.name}`}>play</A></div>}
			<div className="tm-dim">type <A cmd="help">help</A> for commands · Tab completes · ↑ ↓ history · Ctrl+K opens the command bar</div>
		</div>);
	}, [library.length]);

	useEffect(() => { const s = screen.current; if (s) s.scrollTop = s.scrollHeight; }, [log]);
	useEffect(() => { if (!native) setTimeout(() => input.current?.focus(), 50); }, [native]);

	const complete = () => {
		const parts = line.split(' ');
		if (parts.length === 1) {
			const m = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
			if (m.length === 1) setLine(m[0] + ' ');
			else if (m.length) print(<span className="tm-dim">{m.join('  ')}</span>);
			return;
		}
		const cmd = parts[0].toLowerCase(), arg = parts.slice(1).join(' ').toLowerCase();
		const pool = cmd === 'ls' ? [...islands.map((i) => i.name), 'installed', 'recent', 'played', 'unplayed', 'all'] : cmd === 'menu' ? ['steam', 'view', 'friends', 'games', 'help'] : cmd === 'ui' ? uiIds() : sorted.map((g) => g.name);
		const m = pool.filter((n) => n.toLowerCase().startsWith(arg));
		if (m.length === 1) setLine(`${parts[0]} ${m[0]}`);
		else if (m.length > 1) {
			let p = m[0];
			for (const x of m) while (!x.toLowerCase().startsWith(p.toLowerCase())) p = p.slice(0, -1);
			if (p.length > arg.length) setLine(`${parts[0]} ${p}`);
			else print(<span className="tm-dim">{m.slice(0, 12).join('  ·  ')}{m.length > 12 ? `  … ${m.length - 12} more` : ''}</span>);
		}
	};

	return (
		<>
			<AltChrome className="tm-top">
				<Brand className="tm-brand">kestrel<span>@steam</span>:~$</Brand>
				<PlaceButtons />
			</AltChrome>
			<main className={'k-stage tm-stage' + (native ? ' is-hidden' : '')} aria-hidden={native} onMouseUp={() => { if (!mainWindow()?.BrowserWindow.getSelection()?.toString()) input.current?.focus(); }}>
				<div className="tm-crt">
					<div className="tm-screen" ref={screen}>
						{log.map((e) => (
							<div className="tm-entry" key={e.id}>
								{e.cmd !== undefined && <div className="tm-cmd"><span className="tm-ps">kestrel@steam:~$</span> {e.cmd}</div>}
								{e.out && <div className="tm-out">{e.out}</div>}
							</div>
						))}
						<div className="tm-prompt">
							<span className="tm-ps">kestrel@steam:~$</span>
							<span className="tm-line">
								<input ref={input} value={line} spellCheck={false} autoComplete="off" aria-label="Command"
									onChange={(e) => setLine(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') { e.preventDefault(); run(line); setLine(''); }
										else if (e.key === 'Tab') { e.preventDefault(); complete(); }
										else if (e.key === 'ArrowUp') { e.preventDefault(); const i = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1); if (hist[i] !== undefined) { setHi(i); setLine(hist[i]); } }
										else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < 0) return; const i = hi + 1; if (i >= hist.length) { setHi(-1); setLine(''); } else { setHi(i); setLine(hist[i]); } }
										else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLog([]); }
									}} />
								<i className="tm-caret" style={{ left: `${line.length}ch` }} />
							</span>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}


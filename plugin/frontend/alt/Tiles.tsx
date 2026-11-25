// TILES — a tiling window manager. Workspaces along the bar are collections; each workspace tiles its games as
// windows: the focused one is the master on the left, the rest stack on the right. The prompt filters, ⏎ plays.
import { useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Tiles() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [stack, setStack] = useState(6);
	const list = b.games;
	const master: Game | null = sel ?? list[0] ?? null;
	const rest = list.filter((g) => g.appid !== master?.appid).slice(0, stack);
	const now = new Date();
	return (
		<AltPage className="tlw" brand={<>[kestrel]</>}>
			<div className="tlw-app">
				<div className="tlw-bar">
					<div className="tlw-ws">{b.islands.slice(0, 10).map((i, n) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); select(null); }} title={i.name}>{n + 1}<em>{i.name.slice(0, 10).toLowerCase()}</em></button>)}</div>
					<label className="tlw-run">run: <input value={b.q} onChange={(e) => b.setQ(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && list[0]) gameCommands(list[0])[0].run(); }} placeholder="type to filter, enter to launch" spellCheck={false} /></label>
					<div className="tlw-tray"><span>tiles {rest.length + 1}</span><button onClick={() => setStack(Math.max(2, stack - 2))}>−</button><button onClick={() => setStack(Math.min(12, stack + 2))}>+</button><span>{now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })} {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></div>
				</div>
				<div className="tlw-screen">
					{master && (
						<div className="tlw-win master" key={master.appid}>
							<div className="tlw-title"><span>● {master.name}</span><em>{master.installed ? 'installed' : 'not installed'}</em></div>
							<div className="tlw-body"><Art g={master} kind="hero" className="tlw-hero" />
								<pre>{`$ kestrel info ${master.appid}\nname       ${master.name}\nplaytime   ${formatPlaytime(master.minutes)}\nlast run   ${master.lastPlayed ? formatAgo(master.lastPlayed) : 'never'}\nsize       ${master.sizeOnDisk ? formatBytes(master.sizeOnDisk) : '-'}\nscore      ${master.metacritic || '-'}`}</pre>
								<div className="tlw-cmds"><PlayBtn g={master} className="tlw-go" label={['$ kestrel play', '$ kestrel install']} /><Actions g={master} className="tlw-act" /></div></div>
						</div>
					)}
					<div className="tlw-stack">{rest.map((g) => (
						<button key={g.appid} data-appid={g.appid} className="tlw-win" onClick={() => select(g.appid)}>
							<div className="tlw-title"><span>○ {g.name}</span><em>{formatPlaytime(g.minutes)}</em></div>
							<div className="tlw-thumb"><Art g={g} kind="header" /></div>
						</button>
					))}</div>
				</div>
			</div>
		</AltPage>
	);
}

export const tilesCss = tok('tiles', { bg: '#1D2021', s1: '#282828', s2: '#32302F', s3: '#3C3836', fg: '#EBDBB2', fg2: '#D5C4A1', fg3: '#928374', acc: '#FABD2F', on: '#1D2021', top: '#1D2021', font: '"Cascadia Mono", Consolas, monospace' }) + `
.tlw-brand { font: 700 14px var(--k-text); color: #FABD2F; }
.tlw-app { position: absolute; inset: 0; display: grid; grid-template-rows: 28px minmax(0, 1fr); font: 12px var(--k-text); color: #EBDBB2; background: #1D2021; }
.tlw-bar { display: flex; gap: 14px; align-items: center; padding: 0 6px; background: #282828; border-bottom: 2px solid #3C3836; }
.tlw-ws { display: flex; gap: 2px; } .tlw-ws button { display: flex; gap: 6px; align-items: center; height: 22px; padding: 0 8px; font: 12px var(--k-text); color: #928374; } .tlw-ws button em { font-style: normal; } .tlw-ws button.on { background: #FABD2F; color: #1D2021; }
.tlw-run { flex: 1; display: flex; gap: 6px; align-items: center; color: #B8BB26; } .tlw-run input { flex: 1; height: 20px; border: 0; outline: none; background: transparent; color: #EBDBB2; font: 12px var(--k-text); }
.tlw-tray { display: flex; gap: 8px; align-items: center; color: #83A598; } .tlw-tray button { width: 18px; height: 18px; background: #3C3836; color: #EBDBB2; font: 12px var(--k-text); }
.tlw-screen { display: grid; grid-template-columns: 1.4fr 1fr; gap: 8px; padding: 8px; min-height: 0; }
.tlw-win { display: grid; grid-template-rows: 22px minmax(0, 1fr); min-height: 0; border: 2px solid #3C3836; background: #282828; text-align: left; overflow: hidden; } .tlw-win:hover { border-color: #665C54; } .tlw-win.master { border-color: #FABD2F; animation: k-fade .2s both; }
.tlw-title { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 0 8px; background: #32302F; color: #D5C4A1; white-space: nowrap; overflow: hidden; } .tlw-win.master .tlw-title { background: #FABD2F; color: #1D2021; } .tlw-title span { overflow: hidden; text-overflow: ellipsis; } .tlw-title em { font-style: normal; opacity: .7; }
.tlw-body { overflow-y: auto; padding: 10px; display: grid; gap: 10px; align-content: start; } .tlw-hero { width: 100%; max-height: 46vh; object-fit: cover; }
.tlw-body pre { margin: 0; font: 13px/1.5 var(--k-text); color: #B8BB26; white-space: pre-wrap; }
.tlw-cmds { display: flex; gap: 14px; align-items: flex-start; } .tlw-go { height: 30px; padding: 0 14px; border: 1px solid #FABD2F; background: transparent !important; color: #FABD2F !important; font: 700 12px var(--k-text) !important; } .tlw-go:hover { background: #FABD2F !important; color: #1D2021 !important; }
.tlw-act { grid-auto-flow: column; } .tlw-act button { color: #83A598 !important; font-family: var(--k-text) !important; font-size: 12px !important; border-radius: 0 !important; } .tlw-act button:hover { background: #3C3836 !important; }
.tlw-stack { display: grid; grid-auto-rows: minmax(0, 1fr); gap: 8px; min-height: 0; } .tlw-thumb { min-height: 0; overflow: hidden; } .tlw-thumb img, .tlw-thumb .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(.8); }
`;

// BIOS — a firmware setup utility. Main shows your library's "system information", Boot lists installed games in boot
// order (recently played first), Devices lists everything by collection; ↑ ↓ move, Enter opens, F10 boots it.
import { useEffect, useState } from 'react';
import { mainWindow } from '../steam/env';
import { useKestrel } from '../state/store';
import { formatAgo, formatBytes, formatPlaytime } from '../steam/library';
import { AltPage, gameCommands, dateOf, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

type Tab = 'main' | 'boot' | 'devices' | 'exit';

export function Bios() {
	const library = useKestrel((s) => s.library);
	const { installed, top } = useLibraryLists();
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [tab, setTab] = useState<Tab>('boot');
	const [i, setI] = useState(0);
	const rows = tab === 'boot' ? installed : tab === 'devices' ? b.games : [];
	useEffect(() => setI(0), [tab, b.cur]);
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
			const tabs: Tab[] = ['main', 'boot', 'devices', 'exit'];
			if (e.key === 'ArrowDown') setI((x) => Math.min(rows.length - 1, x + 1)); else if (e.key === 'ArrowUp') setI((x) => Math.max(0, x - 1));
			else if (e.key === 'ArrowRight') setTab((t) => tabs[Math.min(3, tabs.indexOf(t) + 1)]); else if (e.key === 'ArrowLeft') setTab((t) => tabs[Math.max(0, tabs.indexOf(t) - 1)]);
			else if (e.key === 'Enter' && rows[i]) select(rows[i].appid); else if (e.key === 'Escape') select(null); else if (e.key === 'F10' && sel) gameCommands(sel)[0].run(); else return;
			e.preventDefault(); e.stopPropagation();
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	});
	const focus = sel ?? rows[i] ?? null;
	const total = library.reduce((n, g) => n + g.minutes, 0);
	const disk = library.reduce((n, g) => n + (g.sizeOnDisk || 0), 0);
	return (
		<AltPage className="bio" brand={<>Kestrel Setup Utility</>}>
			<div className="bio-app">
				<div className="bio-tabs">{(['main', 'boot', 'devices', 'exit'] as Tab[]).map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
				<div className="bio-body">
					<section className="bio-pane">
						{tab === 'main' && <table><tbody>
							<tr><td>Firmware Version</td><td>Kestrel 1.0</td></tr><tr><td>System Date</td><td>[{new Date().toLocaleDateString()}]</td></tr><tr><td>Installed Games</td><td>{installed.length}</td></tr><tr><td>Total Games</td><td>{library.length}</td></tr>
							<tr><td>Total Playtime</td><td>{formatPlaytime(total)}</td></tr><tr><td>Disk In Use</td><td>{formatBytes(disk)}</td></tr><tr><td>Most Played</td><td>{top[0]?.name ?? '—'}</td></tr></tbody></table>}
						{tab === 'boot' && <><p className="bio-h">Boot Priority Order</p>{installed.slice(0, 60).map((g, n) => <button key={g.appid} data-appid={g.appid} className={'bio-row' + (n === i && !sel ? ' on' : '') + (sel?.appid === g.appid ? ' on' : '')} onClick={() => { setI(n); select(g.appid); }}><span>Boot Option #{n + 1}</span><b>[{g.name}]</b></button>)}</>}
						{tab === 'devices' && <><p className="bio-h">Device Group <select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></p>
							{b.games.slice(0, 80).map((g, n) => <button key={g.appid} data-appid={g.appid} className={'bio-row' + ((n === i && !sel) || sel?.appid === g.appid ? ' on' : '')} onClick={() => { setI(n); select(g.appid); }}><span>{g.name}</span><b>[{g.installed ? 'Enabled' : 'Disabled'}]</b></button>)}</>}
						{tab === 'exit' && <><p className="bio-h">Exit</p>{focus && <button className="bio-row" onClick={() => gameCommands(focus)[0].run()}><span>Save Changes and Boot {focus.name}</span><b>[F10]</b></button>}<button className="bio-row" onClick={() => select(null)}><span>Discard Changes</span><b>[Esc]</b></button><button className="bio-row" onClick={() => setTab('main')}><span>Load Setup Defaults</span><b /></button></>}
					</section>
					<aside className="bio-help">
						<p className="bio-h">Item Specific Help</p>
						{focus ? <div key={focus.appid}><b>{focus.name}</b><p>App ID: {focus.appid}<br />Playtime: {formatPlaytime(focus.minutes)}<br />Last boot: {focus.lastPlayed ? formatAgo(focus.lastPlayed) : 'Never'}<br />Added: {dateOf(focus.added)}<br />Size: {focus.sizeOnDisk ? formatBytes(focus.sizeOnDisk) : 'N/A'}</p>
							{gameCommands(focus).map((c) => <button key={c.id} className="bio-cmd" onClick={c.run}>{c.primary ? (focus.installed ? '► Boot now (Play)' : '► Install') : '► ' + c.label}</button>)}</div> : <p>Select an item to see its details.</p>}
					</aside>
				</div>
				<div className="bio-keys"><span>←→ Select Screen</span><span>↑↓ Select Item</span><span>Enter: Select</span><span>F10: Boot</span><span>Esc: Back</span></div>
			</div>
		</AltPage>
	);
}

export const biosCss = tok('bios', { bg: '#0000AA', s1: '#0000CC', s2: '#1010DD', s3: '#2020EE', fg: '#FFFFFF', fg2: '#CCCCCC', fg3: '#AAAAAA', acc: '#FFFF55', on: '#0000AA', top: '#00AAAA', topFg: '#000000', font: '"Perfect DOS VGA 437", "Lucida Console", Consolas, monospace' }) + `
.bio-brand { font: 700 14px var(--k-text); color: #000; }
.bio-app { position: absolute; inset: 0; display: grid; grid-template-rows: 32px minmax(0, 1fr) 30px; background: #0000AA; color: #fff; font: 15px/1.5 "Lucida Console", Consolas, monospace; }
.bio-tabs { display: flex; gap: 0; padding: 0 20px; background: #00AAAA; } .bio-tabs button { padding: 0 22px; font: 15px "Lucida Console", Consolas, monospace; color: #000; } .bio-tabs button.on { background: #0000AA; color: #fff; }
.bio-body { display: grid; grid-template-columns: minmax(0, 1fr) 340px; margin: 10px 20px; border: 3px double #AAAAAA; min-height: 0; }
.bio-pane { overflow-y: auto; padding: 14px 18px; border-right: 3px double #AAAAAA; } .bio-pane table { border-spacing: 0 6px; } .bio-pane td:first-child { width: 280px; color: #AAAAAA; } .bio-pane td:last-child { color: #fff; }
.bio-h { margin: 0 0 8px; color: #FFFF55; } .bio-h select { margin-left: 10px; background: #0000AA; color: #fff; border: 1px solid #AAAAAA; font: 14px "Lucida Console", monospace; }
.bio-row { display: flex; justify-content: space-between; gap: 20px; width: 100%; padding: 1px 6px; font: 15px/1.5 "Lucida Console", Consolas, monospace; color: #AAAAAA; text-align: left; } .bio-row span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .bio-row b { font-weight: 400; color: #fff; white-space: nowrap; }
.bio-row.on, .bio-row:hover { background: #AAAAAA; color: #0000AA; } .bio-row.on b, .bio-row:hover b { color: #0000AA; }
.bio-help { overflow-y: auto; padding: 14px 18px; color: #AAAAAA; } .bio-help b { display: block; color: #fff; margin-bottom: 6px; } .bio-help p { margin: 0 0 12px; }
.bio-cmd { display: block; width: 100%; padding: 1px 6px; text-align: left; font: 15px "Lucida Console", Consolas, monospace; color: #FFFF55; } .bio-cmd:hover { background: #AAAAAA; color: #0000AA; }
.bio-keys { display: flex; gap: 30px; align-items: center; padding: 0 20px; background: #00AAAA; color: #000; font: 14px "Lucida Console", Consolas, monospace; }
`;

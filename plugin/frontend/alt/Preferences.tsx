// PREFERENCES — a system-settings app. The sidebar lists "settings panes" — one per collection plus General and
// Storage — and every game is a settings row with an icon, a value on the right and a chevron; open one for its pane
// with toggles that act: Play, Properties, and links to the Store and Hub.
import { useKestrel } from '../state/store';
import { formatAgo, formatBytes, formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

export function Preferences() {
	const library = useKestrel((s) => s.library);
	const { installed } = useLibraryLists();
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const disk = installed.reduce((n, g) => n + (g.sizeOnDisk || 0), 0);
	const cmds = sel ? gameCommands(sel) : [];
	return (
		<AltPage className="set" brand={<>⚙ Preferences</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search">
			<div className="set-app">
				<nav className="set-side">
					<div className="set-me"><span>☺</span><div><b>Player</b><em>{library.length} games · {installed.length} installed</em></div></div>
					<div className="set-grp">{b.islands.map((i, k) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); select(null); }}><i style={{ background: `hsl(${(k * 47) % 360} 70% 50%)` }}>{i.name[0]}</i>{i.name}</button>)}</div>
				</nav>
				<section className="set-pane">
					{sel ? (
						<div key={sel.appid}>
							<button className="set-back" onClick={() => select(null)}>‹ {b.isle?.name}</button>
							<div className="set-hero"><Art g={sel} kind="capsule" /><div><h1>{sel.name}</h1><p>{sel.installed ? 'Installed' : 'Not installed'} · App ID {sel.appid}</p></div></div>
							<div className="set-card">
								<div className="set-row"><span>Launch</span><button className="set-btn p" onClick={cmds[0].run}>{sel.installed ? 'Play' : 'Install'}</button></div>
								<div className="set-row"><span>Installed</span><i className={'set-tog' + (sel.installed ? ' on' : '')} /></div>
								<div className="set-row"><span>Played recently</span><i className={'set-tog' + (sel.minutes2w ? ' on' : '')} /></div>
							</div>
							<div className="set-card">
								<div className="set-row"><span>Playtime</span><em>{formatPlaytime(sel.minutes)}</em></div><div className="set-row"><span>Last played</span><em>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</em></div>
								<div className="set-row"><span>Added</span><em>{dateOf(sel.added)}</em></div><div className="set-row"><span>Size on disk</span><em>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</em></div>
							</div>
							<div className="set-card">{cmds.slice(1).map((c) => <button key={c.id} className="set-row link" onClick={c.run}><span>{c.label}</span><em>›</em></button>)}</div>
						</div>
					) : (
						<div>
							<h1 className="set-title">{b.found ? 'Search' : b.isle?.name}</h1>
							{!b.found && <div className="set-card"><div className="set-row"><span>Storage used by installed games</span><em>{formatBytes(disk)}</em></div><div className="set-meter"><i style={{ width: Math.min(100, (disk / 2e12) * 100) + '%' }} /></div></div>}
							<div className="set-card">{b.games.slice(0, 200).map((g) => (
								<button key={g.appid} data-appid={g.appid} className="set-row link" onClick={() => select(g.appid)}><span className="set-ri"><Art g={g} kind="capsule" />{g.name}</span><em>{g.installed ? (g.minutes ? formatPlaytime(g.minutes) : 'Installed') : 'Off'} ›</em></button>
							))}</div>
						</div>
					)}
				</section>
			</div>
		</AltPage>
	);
}

export const preferencesCss = tok('preferences', { bg: '#F5F5F7', s1: '#FFFFFF', s2: '#E8E8ED', s3: '#D2D2D7', fg: '#1D1D1F', fg2: '#424245', fg3: '#86868B', acc: '#0071E3', on: '#fff', top: '#ECECEE', font: '"Segoe UI", system-ui, sans-serif' }) + `
.set-brand { font: 600 15px var(--k-text); color: #1D1D1F; }
.set-app { position: absolute; inset: 0; display: grid; grid-template-columns: 280px minmax(0, 1fr); }
.set-side { overflow-y: auto; padding: 12px 10px; background: #ECECEE; border-right: 1px solid #D2D2D7; }
.set-me { display: flex; gap: 10px; align-items: center; padding: 10px; margin-bottom: 10px; border-radius: 10px; background: rgba(255,255,255,.6); } .set-me > span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #86868B; color: #fff; font-size: 22px; } .set-me b { display: block; font: 600 14px var(--k-text); } .set-me em { font: 12px var(--k-text); font-style: normal; color: #86868B; }
.set-grp button { display: flex; gap: 10px; align-items: center; width: 100%; padding: 6px 10px; border-radius: 7px; font: 13.5px var(--k-text); color: #1D1D1F; text-align: left; } .set-grp button.on { background: #0071E3; color: #fff; } .set-grp i { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; color: #fff; font: 700 11px var(--k-text); font-style: normal; }
.set-pane { overflow-y: auto; padding: 24px 40px 60px; } .set-pane > div { max-width: 700px; margin: 0 auto; animation: k-fade .2s both; }
.set-title { margin: 0 0 16px; font: 700 26px var(--k-text); } .set-back { color: #0071E3; font: 14px var(--k-text); margin-bottom: 14px; }
.set-hero { display: flex; gap: 16px; align-items: center; margin-bottom: 18px; } .set-hero img { width: 70px; height: 70px; object-fit: cover; border-radius: 16px; } .set-hero h1 { margin: 0; font: 700 24px var(--k-text); } .set-hero p { margin: 2px 0 0; color: #86868B; font: 13px var(--k-text); }
.set-card { margin-bottom: 16px; border-radius: 10px; background: #fff; box-shadow: 0 0 0 1px #E8E8ED; overflow: hidden; }
.set-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; width: 100%; min-height: 44px; padding: 6px 14px; border-bottom: 1px solid #F0F0F2; font: 13.5px var(--k-text); color: #1D1D1F; text-align: left; } .set-row:last-child { border-bottom: 0; } .set-row em { font-style: normal; color: #86868B; white-space: nowrap; } .set-row.link:hover { background: #F5F5F7; }
.set-ri { display: flex; gap: 10px; align-items: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .set-ri img, .set-ri .alt-noart { width: 26px; height: 26px; border-radius: 6px; object-fit: cover; flex: none; font-size: 3px; }
.set-tog { position: relative; width: 38px; height: 22px; border-radius: 11px; background: #D2D2D7; } .set-tog::after { content: ""; position: absolute; left: 2px; top: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .2s; } .set-tog.on { background: #34C759; } .set-tog.on::after { transform: translateX(16px); }
.set-btn { height: 26px; padding: 0 14px; border-radius: 6px; background: #E8E8ED; font: 600 13px var(--k-text); color: #1D1D1F; } .set-btn.p { background: #0071E3; color: #fff; }
.set-meter { height: 8px; margin: 0 14px 14px; border-radius: 4px; background: #E8E8ED; } .set-meter i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #0071E3, #5E5CE6); }
`;

// HOME — a smart-home controller. Rooms are collections, every game is a device tile (lit when installed, glowing
// when it ran this fortnight), scenes filter the house, and a device's panel has one big power button: Play.
import { useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, hrs, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const SCENES: { id: string; name: string; icon: string; f: (g: Game) => boolean }[] = [
	{ id: 'all', name: 'Everything', icon: '⌂', f: () => true },
	{ id: 'on', name: 'Ready', icon: '⏻', f: (g) => g.installed },
	{ id: 'busy', name: 'Active', icon: '⚡', f: (g) => g.minutes2w > 0 },
	{ id: 'new', name: 'New devices', icon: '✦', f: (g) => g.minutes === 0 },
];

export function Home() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [scene, setScene] = useState('all');
	const f = SCENES.find((s) => s.id === scene)!.f;
	const devs = b.games.filter(f).slice(0, 150);
	const power = b.games.reduce((n, g) => n + g.minutes2w, 0) / 60;
	return (
		<AltPage className="hom" brand={<><span className="hom-house">⌂</span>Home</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Find a device">
			<div className="hom-app">
				<header className="hom-head">
					<div><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h1><p>{b.games.filter((g) => g.installed).length} devices ready · {power.toFixed(1)} h used this fortnight</p></div>
					<div className="hom-scenes">{SCENES.map((s) => <button key={s.id} className={scene === s.id ? 'on' : ''} onClick={() => setScene(s.id)}><i>{s.icon}</i>{s.name}</button>)}</div>
				</header>
				<nav className="hom-rooms">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}<em>{i.games.filter((g) => g.installed).length}/{i.games.length}</em></button>)}</nav>
				<section className="hom-grid">
					{devs.map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'hom-dev' + (g.installed ? ' on' : '') + (g.minutes2w ? ' hot' : '') + (sel?.appid === g.appid ? ' sel' : '')} onClick={() => select(g.appid)}>
							<span className="hom-icon"><Art g={g} kind="capsule" /></span>
							<b>{g.name}</b>
							<span className="hom-state">{g.busy ? g.status : g.installed ? (g.minutes2w ? `Active · ${formatPlaytime(g.minutes2w)}` : 'Ready') : 'Offline'}</span>
							<i className="hom-sw" />
						</button>
					))}
				</section>
				{sel && (
					<div className="hom-sheet" key={sel.appid} onClick={() => select(null)}>
						<div className="hom-panel" onClick={(e) => e.stopPropagation()}>
							<div className="hom-ph"><Art g={sel} kind="hero" /><div><b>{sel.name}</b><span>{b.isle?.name ?? 'Library'}</span></div></div>
							<PlayBtn g={sel} className={'hom-power' + (sel.installed ? '' : ' off')}><Icon name={sel.installed ? 'play' : 'install'} size={40} /></PlayBtn>
							<p className="hom-plabel">{sel.installed ? 'Tap to turn on (Play)' : 'Offline — tap to set up (Install)'}</p>
							<div className="hom-stats"><div><em>Usage</em><b>{hrs(sel)} h</b></div><div><em>Fortnight</em><b>{(sel.minutes2w / 60).toFixed(1)} h</b></div><div><em>Last on</em><b>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</b></div><div><em>Storage</em><b>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</b></div></div>
							<Actions g={sel} className="hom-act" />
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const homeCss = tok('home', { bg: '#14161C', s1: '#1F222B', s2: '#2A2E39', s3: '#353A47', fg: '#F2F3F7', fg2: '#B9BDCB', fg3: '#7D8296', acc: '#FFB547', on: '#231700', font: '"Segoe UI", system-ui, sans-serif' }) + `
.hom-brand { display: flex; gap: 8px; align-items: center; font: 700 19px var(--k-text); color: #F2F3F7; } .hom-house { color: #FFB547; font-size: 22px; }
.hom-app { position: absolute; inset: 0; overflow-y: auto; padding: 20px 30px 60px; background: radial-gradient(80% 60% at 80% 0%, #2B2440, transparent), #14161C; }
.hom-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; } .hom-head h1 { margin: 0; font: 700 34px var(--k-text); color: #fff; } .hom-head p { margin: 4px 0 0; color: #9DA2B5; font: 14px var(--k-text); }
.hom-scenes { display: flex; gap: 10px; } .hom-scenes button { display: flex; gap: 8px; align-items: center; padding: 10px 16px; border-radius: 14px; background: #1F222B; font: 600 13px var(--k-text); color: #B9BDCB; } .hom-scenes button i { font-style: normal; font-size: 16px; } .hom-scenes button.on { background: #FFB547; color: #231700; }
.hom-rooms { display: flex; gap: 8px; margin: 22px 0 18px; overflow-x: auto; padding-bottom: 4px; } .hom-rooms button { flex: none; display: flex; gap: 8px; align-items: baseline; padding: 8px 16px; border-radius: 99px; background: transparent; box-shadow: inset 0 0 0 1px #353A47; font: 600 14px var(--k-text); color: #B9BDCB; }
.hom-rooms button.on { background: #F2F3F7; color: #14161C; box-shadow: none; } .hom-rooms em { font: 12px var(--k-text); font-style: normal; opacity: .6; }
.hom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
.hom-dev { position: relative; display: grid; gap: 4px; align-content: start; height: 150px; padding: 14px; border-radius: 22px; text-align: left; background: #1F222B; color: #7D8296; transition: background .3s, transform .25s var(--k-spring); animation: k-rise .4s var(--k-out) both; }
.hom-dev:hover { transform: scale(1.03); } .hom-dev.on { background: #2A2E39; color: #F2F3F7; } .hom-dev.hot { background: linear-gradient(145deg, #FFD27A, #FFB547); color: #231700; } .hom-dev.sel { box-shadow: 0 0 0 2px #fff; }
.hom-icon { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; margin-bottom: 10px; filter: grayscale(1) brightness(.6); } .hom-dev.on .hom-icon { filter: none; } .hom-icon img, .hom-icon .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 6px; }
.hom-dev b { font: 600 14px/1.25 var(--k-text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } .hom-state { font: 12px var(--k-text); opacity: .8; }
.hom-sw { position: absolute; right: 14px; top: 18px; width: 34px; height: 20px; border-radius: 10px; background: #353A47; } .hom-sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #7D8296; transition: transform .25s; }
.hom-dev.on .hom-sw { background: #FFB547; } .hom-dev.on .hom-sw::after { transform: translateX(14px); background: #fff; } .hom-dev.hot .hom-sw { background: #231700; }
.hom-sheet { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(8,9,12,.6); backdrop-filter: blur(14px); animation: k-fade .25s both; }
.hom-panel { width: min(440px, 92%); padding: 20px; border-radius: 30px; background: #1F222B; display: grid; justify-items: center; gap: 14px; animation: k-rise .35s var(--k-out) both; }
.hom-ph { display: flex; gap: 12px; align-items: center; width: 100%; } .hom-ph img { width: 90px; height: 54px; object-fit: cover; border-radius: 12px; } .hom-ph b { display: block; font: 700 18px var(--k-text); color: #fff; } .hom-ph span { font: 13px var(--k-text); color: #7D8296; }
.hom-power { width: 150px; height: 150px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 35% 30%, #FFE1A6, #FFB547) !important; color: #231700 !important; box-shadow: 0 0 0 10px rgba(255,181,71,.15), 0 0 60px rgba(255,181,71,.45); transition: transform .2s var(--k-spring); }
.hom-power:hover { transform: scale(1.05); } .hom-power.off { background: #2A2E39 !important; color: #B9BDCB !important; box-shadow: 0 0 0 10px rgba(255,255,255,.04); }
.hom-plabel { margin: 0; font: 13px var(--k-text); color: #9DA2B5; }
.hom-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%; } .hom-stats div { padding: 10px; border-radius: 14px; background: #2A2E39; text-align: center; } .hom-stats em { display: block; font: 11px var(--k-text); font-style: normal; color: #7D8296; } .hom-stats b { font: 600 14px var(--k-text); color: #fff; }
.hom-act { width: 100%; }
`;

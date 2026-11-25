// SOFT — soft-UI (neumorphic) design. Everything is pressed out of, or into, the same pale surface: extruded game
// pods with a playtime dial, a sunken search well, toggle-style collection switches and one big soft Play knob.
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Icon } from '../ui/icons';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const Dial = ({ g, size = 64 }: { g: Game; size?: number }) => { const r = 26, C = 2 * Math.PI * r, p = Math.min(1, g.minutes / 6000); return <svg className="neu-dial" width={size} height={size} viewBox="0 0 64 64"><circle cx="32" cy="32" r={r} className="t" /><circle cx="32" cy="32" r={r} className="v" strokeDasharray={`${C * p} ${C}`} transform="rotate(-90 32 32)" /></svg>; };

export function Soft() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="neu" brand={<>◐ soft</>}>
			<div className="neu-app">
				<aside className="neu-side">
					<label className="neu-well"><Icon name="search" size={16} /><input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Search" spellCheck={false} /></label>
					{b.islands.map((i) => <button key={i.id} className={'neu-sw' + (b.cur === i.id && !b.found ? ' on' : '')} onClick={() => { b.setQ(''); b.setCur(i.id); }}><span>{i.name}</span><i /></button>)}
				</aside>
				<section className="neu-grid">{b.games.slice(0, 80).map((g) => (
					<button key={g.appid} data-appid={g.appid} className={'neu-pod' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
						<span className="neu-img"><Art g={g} kind="capsule" /></span>
						<span className="neu-row"><span><b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'New'}</em></span><span className="neu-d"><Dial g={g} size={44} /></span></span>
					</button>))}</section>
				{sel && (
					<aside className="neu-panel" key={sel.appid}>
						<span className="neu-cover"><Art g={sel} kind="capsule" /></span>
						<h2>{sel.name}</h2><p>{sel.lastPlayed ? `Last played ${formatAgo(sel.lastPlayed).toLowerCase()}` : 'Never played'}</p>
						<div className="neu-big"><Dial g={sel} size={180} /><PlayBtn g={sel} className="neu-knob"><Icon name={sel.installed ? 'play' : 'install'} size={34} /></PlayBtn></div>
						<p className="neu-l">{sel.installed ? 'Press to play' : 'Press to install'} · {formatPlaytime(sel.minutes)}</p>
						<Actions g={sel} className="neu-act" /><button className="neu-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const softCss = tok('soft', { bg: '#E4E9F0', s1: '#E4E9F0', s2: '#DCE2EA', s3: '#CDD5DF', fg: '#3A4556', fg2: '#5B6678', fg3: '#8C96A6', acc: '#6C7CF0', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
html.kestrel[data-ui="soft"] { --neu-out: 8px 8px 16px #C3CAD4, -8px -8px 16px #FFFFFF; --neu-in: inset 6px 6px 12px #C3CAD4, inset -6px -6px 12px #FFFFFF; }
.neu-brand { font: 700 20px var(--k-text); color: #3A4556; }
.neu-app { position: absolute; inset: 0; display: grid; grid-template-columns: 260px minmax(0, 1fr) auto; gap: 10px; background: #E4E9F0; }
.neu-side { overflow-y: auto; padding: 22px 18px; display: grid; align-content: start; gap: 14px; }
.neu-well { display: flex; gap: 10px; align-items: center; height: 46px; padding: 0 16px; border-radius: 23px; box-shadow: var(--neu-in); color: #8C96A6; } .neu-well input { flex: 1; border: 0; outline: none; background: none; font: 14px var(--k-text); color: #3A4556; }
.neu-sw { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 16px; box-shadow: var(--neu-out); font: 600 14px var(--k-text); color: #5B6678; text-align: left; } .neu-sw span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.neu-sw i { position: relative; flex: none; width: 40px; height: 22px; border-radius: 11px; box-shadow: var(--neu-in); } .neu-sw i::after { content: ""; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #E4E9F0; box-shadow: 2px 2px 4px #C3CAD4, -2px -2px 4px #fff; transition: transform .25s var(--k-spring), background .25s; }
.neu-sw.on { box-shadow: var(--neu-in); color: #6C7CF0; } .neu-sw.on i::after { transform: translateX(18px); background: #6C7CF0; }
.neu-grid { overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 26px; padding: 26px 20px 60px; align-content: start; }
.neu-pod { display: grid; gap: 12px; padding: 14px; border-radius: 26px; box-shadow: var(--neu-out); text-align: left; transition: box-shadow .25s; } .neu-pod:active, .neu-pod.on { box-shadow: var(--neu-in); }
.neu-img { display: block; aspect-ratio: 2/3; border-radius: 18px; overflow: hidden; box-shadow: var(--neu-in); padding: 6px; } .neu-img img, .neu-img .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 13px; }
.neu-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; } .neu-row > span:first-child { min-width: 0; } .neu-row b { display: block; font: 700 14px var(--k-text); color: #3A4556; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .neu-row em { font: 12px var(--k-text); font-style: normal; color: #8C96A6; }
.neu-d { flex: none; border-radius: 50%; box-shadow: var(--neu-out); } .neu-dial .t { fill: none; stroke: #D3DAE3; stroke-width: 6; } .neu-dial .v { fill: none; stroke: #6C7CF0; stroke-width: 6; stroke-linecap: round; }
.neu-panel { width: 360px; overflow-y: auto; padding: 26px; display: grid; justify-items: center; align-content: start; text-align: center; animation: k-fade .3s both; }
.neu-cover { width: 150px; padding: 8px; border-radius: 22px; box-shadow: var(--neu-out); } .neu-cover img { width: 100%; border-radius: 16px; display: block; }
.neu-panel h2 { margin: 18px 0 4px; font: 800 22px var(--k-text); color: #3A4556; } .neu-panel p { margin: 0 0 18px; font: 13px var(--k-text); color: #8C96A6; }
.neu-big { position: relative; width: 180px; height: 180px; border-radius: 50%; box-shadow: var(--neu-out); } .neu-big .neu-dial { position: absolute; inset: 0; }
.neu-knob { position: absolute; left: 35px; top: 35px; width: 110px; height: 110px; border-radius: 50%; display: grid; place-items: center; background: #E4E9F0 !important; color: #6C7CF0 !important; box-shadow: var(--neu-out); transition: box-shadow .15s; } .neu-knob:active { box-shadow: var(--neu-in); }
.neu-l { margin-top: 16px !important; } .neu-act { width: 100%; } .neu-act button { color: #5B6678 !important; } .neu-act button:hover { background: #DCE2EA !important; } .neu-x { margin-top: 10px; color: #6C7CF0; font: 600 13px var(--k-text); }
`;

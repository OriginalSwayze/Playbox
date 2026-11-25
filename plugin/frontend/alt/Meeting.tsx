// MEETING — a video call. A collection's games are the participants in a gallery; the most active one this fortnight
// is the speaker (green ring), uninstalled ones have their camera off. Pin one to spotlight it; the call bar plays.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Meeting() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [react, setReact] = useState<string | null>(null);
	const [panel, setPanel] = useState<'people' | 'chat'>('people');
	const people = b.games.slice(0, 25);
	const speaker = [...people].sort((x, y) => y.minutes2w - x.minutes2w)[0];
	const cols = Math.ceil(Math.sqrt(people.length || 1));
	const Tile = ({ g, big }: { g: Game; big?: boolean }) => (
		<button data-appid={g.appid} className={'vcl-tile' + (big ? ' big' : '') + (speaker?.appid === g.appid && g.minutes2w ? ' talk' : '') + (g.installed ? '' : ' off')} onClick={() => select(sel?.appid === g.appid ? null : g.appid)}>
			{g.installed ? <Art g={g} kind="hero" /> : <span className="vcl-ava"><Art g={g} kind="capsule" /></span>}
			<span className="vcl-name">{g.installed ? '' : '🔇 '}{g.name}</span>
			{react && speaker?.appid === g.appid && <span className="vcl-react">{react}</span>}
		</button>
	);
	return (
		<AltPage className="vcl" brand={<><span className="vcl-cam">▶</span>Meet</>}>
			<div className="vcl-app">
				<div className="vcl-head"><b>{b.found ? 'Search' : b.isle?.name} · weekly sync</b><span>{people.length} participants · {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
					<select value={b.cur} onChange={(e) => { b.setCur(e.target.value); select(null); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>Room: {i.name}</option>)}</select></div>
				<section className="vcl-stage2">
					{sel ? <div className="vcl-spot" key={sel.appid}><Tile g={sel} big /><div className="vcl-strip">{people.filter((g) => g.appid !== sel.appid).slice(0, 8).map((g) => <Tile key={g.appid} g={g} />)}</div></div>
						: <div className="vcl-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{people.map((g) => <Tile key={g.appid} g={g} />)}</div>}
				</section>
				<aside className="vcl-side">
					<div className="vcl-ptabs"><button className={panel === 'people' ? 'on' : ''} onClick={() => setPanel('people')}>People</button><button className={panel === 'chat' ? 'on' : ''} onClick={() => setPanel('chat')}>Chat</button></div>
					{panel === 'people' ? people.map((g) => <button key={g.appid} className="vcl-person" onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span><i>{g.installed ? '🎙' : '🔇'}</i></button>)
						: <div className="vcl-chat">{people.filter((g) => g.lastPlayed).slice(0, 12).map((g) => <p key={g.appid}><b>{g.name}</b><span>{formatAgo(g.lastPlayed)}</span>{g.minutes2w ? `I've had ${formatPlaytime(g.minutes2w)} of screen time lately.` : 'Sorry, been away for a while.'}</p>)}</div>}
					{sel && <div className="vcl-info"><b>{sel.name}</b><Actions g={sel} /></div>}
				</aside>
				<footer className="vcl-bar">
					<button>🎙</button><button>📷</button><button>🖥</button>{['👍', '🎉', '❤'].map((e) => <button key={e} onClick={() => { setReact(e); setTimeout(() => setReact(null), 1800); }}>{e}</button>)}
					{sel ? <PlayBtn g={sel} className="vcl-join" label={[`Join ${sel.name.slice(0, 24)} (Play)`, `Install ${sel.name.slice(0, 24)}`]} /> : <span className="vcl-hint">Click a participant to pin them</span>}
					<button className="vcl-leave" onClick={() => select(null)}>✆</button>
				</footer>
			</div>
		</AltPage>
	);
}

export const meetingCss = tok('meeting', { bg: '#202124', s1: '#2D2E31', s2: '#3C4043', s3: '#4A4E52', fg: '#E8EAED', fg2: '#BDC1C6', fg3: '#9AA0A6', acc: '#8AB4F8', on: '#202124', top: '#202124', font: '"Segoe UI", system-ui, sans-serif' }) + `
.vcl-brand { display: flex; gap: 8px; align-items: center; font: 600 17px var(--k-text); color: #E8EAED; } .vcl-cam { display: grid; place-items: center; width: 26px; height: 20px; border-radius: 5px; background: #34A853; color: #fff; font-size: 9px; }
.vcl-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 300px; grid-template-rows: 44px minmax(0, 1fr) 76px; color: #E8EAED; }
.vcl-head { grid-column: 1 / -1; display: flex; gap: 14px; align-items: center; padding: 0 16px; } .vcl-head b { font: 600 15px var(--k-text); } .vcl-head span { color: #9AA0A6; font: 13px var(--k-text); } .vcl-head select { margin-left: auto; background: #2D2E31; color: #E8EAED; border: 0; border-radius: 6px; height: 30px; padding: 0 8px; }
.vcl-stage2 { min-height: 0; padding: 0 12px; }
.vcl-grid { display: grid; gap: 8px; height: 100%; grid-auto-rows: 1fr; }
.vcl-tile { position: relative; min-height: 0; border-radius: 12px; overflow: hidden; background: #3C4043; display: grid; place-items: center; transition: box-shadow .2s; } .vcl-tile > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.vcl-tile.talk { box-shadow: 0 0 0 3px #34A853; } .vcl-tile:hover { box-shadow: 0 0 0 2px #8AB4F8; }
.vcl-ava { width: min(90px, 45%); aspect-ratio: 1; border-radius: 50%; overflow: hidden; } .vcl-ava img, .vcl-ava .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 7px; }
.vcl-name { position: absolute; left: 10px; bottom: 8px; max-width: calc(100% - 20px); padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,.5); font: 500 13px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vcl-react { position: absolute; left: 50%; bottom: 30%; font-size: 50px; animation: vcl-up 1.8s ease-out both; } @keyframes vcl-up { from { transform: translate(-50%, 40px); opacity: 0; } 20% { opacity: 1; } to { transform: translate(-50%, -80px); opacity: 0; } }
.vcl-spot { display: grid; grid-template-rows: minmax(0, 1fr) 120px; gap: 8px; height: 100%; } .vcl-strip { display: flex; gap: 8px; } .vcl-strip .vcl-tile { flex: 1; } .vcl-tile.big .vcl-name { font-size: 16px; }
.vcl-side { display: flex; flex-direction: column; gap: 6px; margin: 0 12px 0 0; padding: 12px; border-radius: 12px; background: #fff; color: #202124; min-height: 0; overflow-y: auto; }
.vcl-ptabs { display: flex; gap: 4px; } .vcl-ptabs button { flex: 1; height: 32px; border-radius: 16px; font: 600 13px var(--k-text); color: #5F6368; } .vcl-ptabs button.on { background: #E8F0FE; color: #1967D2; }
.vcl-person { display: flex; gap: 10px; align-items: center; padding: 4px; border-radius: 8px; text-align: left; font: 14px var(--k-text); color: #202124; } .vcl-person:hover { background: #F1F3F4; } .vcl-person img, .vcl-person .alt-noart { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; font-size: 4px; } .vcl-person span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vcl-chat p { margin: 0 0 10px; font: 13px var(--k-text); } .vcl-chat b { margin-right: 6px; } .vcl-chat span { color: #5F6368; font-size: 11px; display: block; }
.vcl-info { margin-top: auto; padding-top: 8px; border-top: 1px solid #E8EAED; } .vcl-info .alt-actions button { color: #3C4043 !important; } .vcl-info .alt-actions button:hover { background: #F1F3F4 !important; }
.vcl-bar { grid-column: 1 / -1; display: flex; gap: 10px; justify-content: center; align-items: center; } .vcl-bar > button { width: 44px; height: 44px; border-radius: 50%; background: #3C4043; font-size: 18px; }
.vcl-join { height: 44px; padding: 0 20px; border-radius: 22px; background: #8AB4F8 !important; color: #202124 !important; font: 600 14px var(--k-text) !important; } .vcl-hint { color: #9AA0A6; font: 13px var(--k-text); padding: 0 10px; }
.vcl-leave { width: 60px !important; border-radius: 22px !important; background: #EA4335 !important; transform: rotate(135deg); }
`;

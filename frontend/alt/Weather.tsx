// FORECAST — a weather app. Each game is a city: its temperature is the hours you've played, its sky is how
// recently you were there (sunny this week, snow if you've never been). Collections are your saved locations.
import { formatAgo, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, hrs, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const DAY = 86400;
function sky(g: Game) {
	const age = g.lastPlayed ? Date.now() / 1000 - g.lastPlayed : Infinity;
	if (!g.lastPlayed) return { k: 'snow', label: 'Snow — never visited', icon: '❄' };
	if (age < 7 * DAY) return { k: 'sun', label: 'Sunny', icon: '☀' };
	if (age < 30 * DAY) return { k: 'part', label: 'Partly cloudy', icon: '⛅' };
	if (age < 365 * DAY) return { k: 'cloud', label: 'Overcast', icon: '☁' };
	return { k: 'rain', label: 'Rain', icon: '☂' };
}
const deg = (g: Game) => Math.round(hrs(g));

export function Weather() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const g = sel ?? b.games[0] ?? null;
	const s = g ? sky(g) : null;
	return (
		<AltPage className="wth" brand={<><span className="wth-sun" />Forecast</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search for a city">
			<div className={'wth-app sky-' + (s?.k ?? 'sun')}>
				<aside className="wth-side">
					<div className="wth-locs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</div>
					<div className="wth-list">
						{b.games.slice(0, 120).map((x) => { const k = sky(x); return (
							<button key={x.appid} data-appid={x.appid} className={'wth-city sky-' + k.k + (g?.appid === x.appid ? ' on' : '')} onClick={() => select(x.appid)}>
								<div><b>{x.name}</b><span>{k.label}</span></div><em>{deg(x)}°</em>
							</button>); })}
					</div>
				</aside>
				{g && s && (
					<section className="wth-main" key={g.appid}>
						<div className="wth-now">
							<span className="wth-place">{g.name}</span>
							<span className="wth-temp">{deg(g)}°</span>
							<span className="wth-cond">{s.icon} {s.label}</span>
							<span className="wth-hl">H: {Math.round(g.minutes2w / 60)}° (2 wk) · L: 0°</span>
						</div>
						<div className="wth-card wth-hourly">
							<h4>Hourly — around this city</h4>
							<div>{b.games.slice(0, 12).map((x, i) => <button key={x.appid} onClick={() => select(x.appid)}><span>{i === 0 ? 'Now' : String((8 + i) % 24).padStart(2, '0')}</span><i>{sky(x).icon}</i><b>{deg(x)}°</b></button>)}</div>
						</div>
						<div className="wth-grid">
							<div className="wth-card"><h4>Last visit</h4><b>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</b></div>
							<div className="wth-card"><h4>UV index</h4><b>{g.metacritic ? Math.round(g.metacritic / 10) : '—'}</b><p>{g.metacritic ? `Metascore ${g.metacritic}` : 'No score'}</p></div>
							<div className="wth-card"><h4>Visibility</h4><b>{g.installed ? 'Clear' : 'Fog'}</b><p>{g.installed ? 'Installed' : 'Not installed'}</p></div>
							<div className="wth-card"><h4>This fortnight</h4><b>{Math.round(g.minutes2w)} min</b></div>
						</div>
						<div className="wth-card wth-radar"><Art g={g} kind="hero" /><div><PlayBtn g={g} className="wth-go" label={['Travel there — Play', 'Install']} /><Actions g={g} className="wth-act" /></div></div>
					</section>
				)}
			</div>
		</AltPage>
	);
}

export const weatherCss = tok('weather', { bg: '#1D4E89', s1: 'rgba(255,255,255,.16)', s2: 'rgba(255,255,255,.22)', s3: 'rgba(255,255,255,.3)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.85)', fg3: 'rgba(255,255,255,.6)', acc: '#FFD45C', on: '#1D2B44', top: 'transparent', font: '"Segoe UI Variable Display", "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="weather"] .k-top { position: relative; z-index: 2; background: rgba(0,0,0,.12); backdrop-filter: blur(10px); border: 0; }
.wth-brand { display: flex; align-items: center; gap: 9px; font: 600 19px var(--k-text); color: #fff; }
.wth-sun { width: 18px; height: 18px; border-radius: 50%; background: #FFD45C; box-shadow: 0 0 12px #FFD45C; }
.wth-app { position: absolute; inset: 0; display: grid; grid-template-columns: 330px minmax(0, 1fr); color: #fff; transition: background 1s; background: linear-gradient(180deg, #3D8BE0, #8EC5FF); }
.wth-app.sky-part { background: linear-gradient(180deg, #4F7DB0, #A9C3DE); } .wth-app.sky-cloud { background: linear-gradient(180deg, #5E6B7C, #9AA5B3); }
.wth-app.sky-rain { background: linear-gradient(180deg, #2D3A4C, #56677D); } .wth-app.sky-snow { background: linear-gradient(180deg, #8FA6C2, #DCE6F2); }
.wth-side { display: flex; flex-direction: column; min-height: 0; padding: 14px; gap: 10px; background: rgba(0,0,0,.1); backdrop-filter: blur(18px); }
.wth-locs { display: flex; flex-wrap: wrap; gap: 6px; max-height: 96px; overflow-y: auto; }
.wth-locs button { padding: 5px 11px; border-radius: 99px; background: rgba(255,255,255,.14); font: 600 12px var(--k-text); color: #fff; } .wth-locs button.on { background: #fff; color: #1D2B44; }
.wth-list { flex: 1; overflow-y: auto; display: grid; align-content: start; gap: 8px; }
.wth-city { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; text-align: left; color: #fff; background: linear-gradient(135deg, #4A90E2, #74B4F7); box-shadow: 0 4px 14px -6px rgba(0,0,0,.4); transition: transform .25s var(--k-spring); }
.wth-city.sky-part { background: linear-gradient(135deg, #5A82B0, #8FB0D4); } .wth-city.sky-cloud { background: linear-gradient(135deg, #67727F, #8C96A3); } .wth-city.sky-rain { background: linear-gradient(135deg, #34465C, #50647C); } .wth-city.sky-snow { background: linear-gradient(135deg, #8EA3BC, #B9C9DB); }
.wth-city:hover { transform: scale(1.02); } .wth-city.on { box-shadow: 0 0 0 2px #fff; }
.wth-city b { display: block; font: 600 14px var(--k-text); } .wth-city span { font: 12px var(--k-text); opacity: .8; } .wth-city em { font: 300 34px var(--k-text); font-style: normal; }
.wth-main { overflow-y: auto; padding: 34px 40px 60px; display: grid; gap: 16px; align-content: start; max-width: 900px; margin: 0 auto; width: 100%; animation: k-fade .5s both; }
.wth-now { display: grid; justify-items: center; text-align: center; padding: 10px 0 20px; text-shadow: 0 2px 12px rgba(0,0,0,.2); }
.wth-place { font: 400 32px var(--k-text); } .wth-temp { font: 200 120px/1 var(--k-text); margin-left: 30px; } .wth-cond { font: 500 20px var(--k-text); } .wth-hl { font: 500 16px var(--k-text); opacity: .85; }
.wth-card { padding: 14px 16px; border-radius: 18px; background: rgba(255,255,255,.14); backdrop-filter: blur(20px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.15); }
.wth-card h4 { margin: 0 0 8px; font: 600 11px var(--k-text); letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
.wth-card > b { font: 300 30px var(--k-text); } .wth-card p { margin: 4px 0 0; font: 13px var(--k-text); opacity: .8; }
.wth-hourly > div { display: flex; gap: 4px; overflow-x: auto; }
.wth-hourly button { flex: none; width: 64px; display: grid; justify-items: center; gap: 6px; padding: 8px 0; border-radius: 12px; color: #fff; } .wth-hourly button:hover { background: rgba(255,255,255,.12); }
.wth-hourly span { font: 600 12px var(--k-text); } .wth-hourly i { font-style: normal; font-size: 20px; } .wth-hourly b { font: 500 17px var(--k-text); }
.wth-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.wth-radar { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; align-items: center; }
.wth-radar img { width: 100%; aspect-ratio: 16/7; object-fit: cover; border-radius: 12px; }
.wth-go { width: 100%; height: 46px; border-radius: 14px; background: #fff !important; color: #1D2B44 !important; font: 700 15px var(--k-text) !important; margin-bottom: 8px; }
.wth-act button { color: #fff !important; } .wth-act button:hover { background: rgba(255,255,255,.14) !important; }
`;

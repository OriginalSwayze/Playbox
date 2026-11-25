// BOARDING — an airline app. Your trips are games: installed ones are "ready to board", the rest need check-in
// (install). Open a trip and you get a full boarding pass with gate, seat and a barcode; Board now plays.
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const code = (g: Game) => (g.name.replace(/[^A-Za-z]/g, '').toUpperCase() + 'XXX').slice(0, 3);
const flight = (g: Game) => 'KS ' + String(g.appid % 9000 + 100);
const seat = (g: Game) => `${(g.appid % 38) + 1}${'ABCDEF'[g.appid % 6]}`;
const gate = (g: Game) => `${'ABCDE'[g.appid % 5]}${(g.appid % 40) + 1}`;
const Bars = ({ g }: { g: Game }) => <div className="brd-bars">{String(g.appid).padStart(8, '0').repeat(4).split('').map((d, i) => <i key={i} style={{ width: 1 + (Number(d) % 4) }} />)}</div>;

export function Boarding() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="brd" brand={<><span className="brd-wing">✈</span>Kestrel Air</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Find a trip">
			<div className="brd-app">
				<aside className="brd-trips">
					<div className="brd-tabs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</div>
					<h3>My trips <span>{b.games.length}</span></h3>
					{b.games.slice(0, 150).map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'brd-trip' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
							<div className="brd-route"><b>KST</b><i>- - - ✈ - - -</i><b>{code(g)}</b></div>
							<div className="brd-tname">{g.name}</div>
							<div className="brd-tmeta"><span>{flight(g)}</span><span className={g.installed ? 'ok' : 'warn'}>{g.installed ? 'Ready to board' : 'Check-in required'}</span></div>
						</button>
					))}
				</aside>
				<section className="brd-main">
					{sel ? (
						<div className="brd-pass" key={sel.appid}>
							<div className="brd-ph"><span className="brd-wing">✈</span><b>Kestrel Air</b><em>Boarding pass</em></div>
							<div className="brd-hero"><Art g={sel} kind="hero" /></div>
							<div className="brd-big"><div><em>From</em><b>KST</b><span>Kestrel Library</span></div><i>✈</i><div className="r"><em>To</em><b>{code(sel)}</b><span>{sel.name}</span></div></div>
							<div className="brd-cells">
								<div><em>Flight</em><b>{flight(sel)}</b></div><div><em>Gate</em><b>{gate(sel)}</b></div><div><em>Seat</em><b>{seat(sel)}</b></div><div><em>Class</em><b>{sel.minutes > 6000 ? 'First' : sel.minutes > 600 ? 'Business' : 'Economy'}</b></div>
								<div><em>Last flown</em><b>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</b></div><div><em>Air miles</em><b>{formatPlaytime(sel.minutes)}</b></div><div><em>Booked</em><b>{dateOf(sel.added)}</b></div><div><em>Status</em><b className={sel.installed ? 'ok' : 'warn'}>{sel.installed ? 'On time' : 'Check in'}</b></div>
							</div>
							<div className="brd-perf" />
							<div className="brd-stub"><Bars g={sel} /><PlayBtn g={sel} className="brd-go" label={['Board now', 'Check in (install)']} /></div>
							<Actions g={sel} className="brd-act" />
						</div>
					) : <div className="brd-empty"><span>✈</span><p>Choose a trip to see your boarding pass.</p></div>}
				</section>
			</div>
		</AltPage>
	);
}

export const boardingCss = tok('boarding', { bg: '#EEF2F7', s1: '#FFFFFF', s2: '#E3E9F1', s3: '#D0D9E5', fg: '#0B1F3A', fg2: '#33475F', fg3: '#7285A0', acc: '#E8423F', on: '#fff', top: '#0B1F3A', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.brd-brand { display: flex; gap: 8px; align-items: center; font: 800 18px var(--k-text); color: #fff; letter-spacing: .02em; } .brd-wing { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #E8423F; color: #fff; font-size: 14px; }
.brd-app { position: absolute; inset: 0; display: grid; grid-template-columns: 380px minmax(0, 1fr); }
.brd-trips { overflow-y: auto; padding: 14px; background: #0B1F3A; } .brd-trips h3 { margin: 14px 4px 10px; font: 700 18px var(--k-text); color: #fff; } .brd-trips h3 span { opacity: .5; font-weight: 400; }
.brd-tabs { display: flex; gap: 6px; flex-wrap: wrap; max-height: 100px; overflow-y: auto; } .brd-tabs button { padding: 5px 11px; border-radius: 99px; background: rgba(255,255,255,.1); font: 600 12px var(--k-text); color: #CFE0F5; } .brd-tabs button.on { background: #E8423F; color: #fff; }
.brd-trip { display: block; width: 100%; margin-bottom: 10px; padding: 14px 16px; border-radius: 14px; text-align: left; background: #13305A; color: #fff; transition: transform .2s var(--k-spring); } .brd-trip:hover { transform: translateX(4px); } .brd-trip.on { background: #fff; color: #0B1F3A; }
.brd-route { display: flex; justify-content: space-between; align-items: center; font: 800 22px var(--k-text); } .brd-route i { font-style: normal; font-size: 12px; opacity: .5; }
.brd-tname { margin: 4px 0 8px; font: 14px var(--k-text); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brd-tmeta { display: flex; justify-content: space-between; font: 600 12px var(--k-text); } .ok { color: #2DBE7E !important; } .warn { color: #F5A524 !important; }
.brd-main { overflow-y: auto; display: grid; place-items: start center; padding: 30px; }
.brd-pass { width: min(560px, 100%); border-radius: 22px; background: #fff; box-shadow: 0 30px 60px -30px rgba(11,31,58,.5); overflow: hidden; animation: k-rise .45s var(--k-out) both; }
.brd-ph { display: flex; gap: 10px; align-items: center; padding: 14px 20px; background: #0B1F3A; color: #fff; font: 15px var(--k-text); } .brd-ph em { margin-left: auto; font: 600 12px var(--k-text); font-style: normal; text-transform: uppercase; letter-spacing: .1em; opacity: .7; }
.brd-hero img { width: 100%; height: 150px; object-fit: cover; display: block; }
.brd-big { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 8px; } .brd-big > i { font-style: normal; font-size: 26px; color: #E8423F; }
.brd-big em, .brd-cells em { display: block; font: 600 11px var(--k-text); font-style: normal; color: #7285A0; text-transform: uppercase; letter-spacing: .08em; } .brd-big b { display: block; font: 800 50px/1 var(--k-text); color: #0B1F3A; }
.brd-big span { display: block; max-width: 200px; font: 13px var(--k-text); color: #33475F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .brd-big .r { text-align: right; }
.brd-cells { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 14px 24px 18px; } .brd-cells b { font: 700 16px var(--k-text); color: #0B1F3A; }
.brd-perf { position: relative; height: 0; border-top: 2px dashed #D0D9E5; margin: 0 22px; } .brd-perf::before, .brd-perf::after { content: ""; position: absolute; top: -14px; width: 26px; height: 26px; border-radius: 50%; background: #EEF2F7; } .brd-perf::before { left: -36px; } .brd-perf::after { right: -36px; }
.brd-stub { display: grid; gap: 14px; padding: 20px 24px; } .brd-bars { display: flex; gap: 2px; height: 56px; justify-content: center; } .brd-bars i { background: #0B1F3A; }
.brd-go { height: 52px; border-radius: 14px; background: #E8423F !important; color: #fff !important; font: 800 17px var(--k-text) !important; }
.brd-act { padding: 0 18px 18px; }
.brd-empty { display: grid; justify-items: center; margin-top: 18vh; color: #7285A0; font: 16px var(--k-text); } .brd-empty span { font-size: 60px; color: #0B1F3A; }
`;

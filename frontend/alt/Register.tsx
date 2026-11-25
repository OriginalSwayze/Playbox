// REGISTER — a point-of-sale till. Category tabs are collections, the colour-coded key grid rings games up onto the
// ticket (priced in hours played); tap a ticket line to select it, and the big green key "charges" it: Play.
import { useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const hue = (g: Game) => (g.appid * 37) % 360;
const amt = (g: Game) => (g.minutes / 60).toFixed(2);

export function Register() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [ticket, setTicket] = useState<Game[]>([]);
	const ring = (g: Game) => { setTicket((t) => (t.some((x) => x.appid === g.appid) ? t : [...t, g])); select(g.appid); };
	const total = ticket.reduce((n, g) => n + g.minutes / 60, 0);
	return (
		<AltPage className="pos" brand={<>TILL 01 · <b>Kestrel</b></>}>
			<div className="pos-app">
				<aside className="pos-ticket">
					<div className="pos-th"><b>Ticket #{String(ticket.length + 1041)}</b><span>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></div>
					<div className="pos-lines">{ticket.map((g, i) => <button key={g.appid} className={'pos-line' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}><span>{i + 1}</span><b>{g.name}</b><em>{amt(g)} h</em></button>)}{!ticket.length && <p>Tap a key to ring up a game.</p>}</div>
					{sel && <div className="pos-sel" key={sel.appid}><b>{sel.name}</b><span>{formatPlaytime(sel.minutes)} · {sel.installed ? 'in stock' : 'needs install'}</span><Actions g={sel} className="pos-act" /></div>}
					<div className="pos-total"><span>Total</span><b>{total.toFixed(2)} h</b></div>
					<div className="pos-keys2"><button onClick={() => { setTicket([]); select(null); }}>VOID</button><button onClick={() => sel && setTicket(ticket.filter((x) => x.appid !== sel.appid))}>DEL LINE</button>{sel ? <PlayBtn g={sel} className="pos-charge" label={['CHARGE ▶ PLAY', 'CHARGE ⬇ INSTALL']} /> : <button className="pos-charge off">CHARGE</button>}</div>
				</aside>
				<section className="pos-main">
					<div className="pos-tabs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}<input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="PLU / name" spellCheck={false} /></div>
					<div className="pos-grid">{b.games.slice(0, 120).map((g) => <button key={g.appid} data-appid={g.appid} style={{ ['--h' as string]: hue(g) }} className={ticket.some((x) => x.appid === g.appid) ? 'in' : ''} onClick={() => ring(g)}><b>{g.name}</b><em>{amt(g)}</em></button>)}</div>
				</section>
			</div>
		</AltPage>
	);
}

export const registerCss = tok('register', { bg: '#2E3338', s1: '#3A4046', s2: '#454C53', s3: '#545C64', fg: '#F4F6F8', fg2: '#C9D0D6', fg3: '#8C969F', acc: '#2ECC71', on: '#0B2A17', top: '#1F2327', font: '"Segoe UI", Arial, sans-serif' }) + `
.pos-brand { font: 700 14px var(--k-text); letter-spacing: .08em; color: #8C969F; } .pos-brand b { color: #F4F6F8; }
.pos-app { position: absolute; inset: 0; display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 10px; padding: 10px; }
.pos-ticket { display: grid; grid-template-rows: auto minmax(0, 1fr) auto auto auto; border-radius: 10px; background: #FDFDFB; color: #222; overflow: hidden; }
.pos-th { display: flex; justify-content: space-between; padding: 12px 14px; background: #ECEFF1; font: 13px Consolas, monospace; }
.pos-lines { overflow-y: auto; } .pos-lines p { padding: 20px; color: #888; font: 14px var(--k-text); }
.pos-line { display: grid; grid-template-columns: 26px 1fr auto; gap: 8px; width: 100%; padding: 9px 14px; border-bottom: 1px dashed #DDD; text-align: left; font: 14px Consolas, monospace; color: #222; } .pos-line b { font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pos-line span { color: #999; } .pos-line.on { background: #E3F6EA; }
.pos-sel { padding: 10px 14px; border-top: 1px solid #DDD; background: #F6F8F9; animation: k-fade .2s both; } .pos-sel b { display: block; font: 700 15px var(--k-text); } .pos-sel span { font: 12px var(--k-text); color: #666; }
.pos-act { grid-template-columns: repeat(2, 1fr); margin-top: 6px; } .pos-act button { color: #333 !important; font-size: 12px !important; padding: 6px !important; }
.pos-total { display: flex; justify-content: space-between; align-items: baseline; padding: 12px 14px; background: #222; color: #7CFF9E; font: 16px Consolas, monospace; } .pos-total b { font-size: 30px; }
.pos-keys2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 8px; background: #ECEFF1; } .pos-keys2 > button { height: 46px; border-radius: 8px; background: #CFD8DC; font: 800 14px var(--k-text); color: #263238; }
.pos-charge { grid-column: 1 / -1; height: 66px !important; background: #2ECC71 !important; color: #0B2A17 !important; font: 900 20px var(--k-text) !important; border-radius: 8px; box-shadow: 0 4px 0 #1E8449; } .pos-charge.off { opacity: .45; }
.pos-main { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 10px; min-height: 0; }
.pos-tabs { display: flex; gap: 6px; flex-wrap: wrap; } .pos-tabs button { height: 44px; padding: 0 16px; border-radius: 8px; background: #454C53; font: 700 14px var(--k-text); color: #F4F6F8; } .pos-tabs button.on { background: #F4F6F8; color: #2E3338; }
.pos-tabs input { margin-left: auto; width: 200px; height: 44px; padding: 0 12px; border-radius: 8px; border: 0; outline: none; background: #1F2327; color: #7CFF9E; font: 15px Consolas, monospace; }
.pos-grid { overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); grid-auto-rows: 96px; gap: 8px; align-content: start; }
.pos-grid button { position: relative; display: grid; align-content: space-between; padding: 10px; border-radius: 10px; text-align: left; background: hsl(var(--h) 55% 46%); color: #fff; box-shadow: 0 4px 0 hsl(var(--h) 55% 30%); transition: transform .06s; } .pos-grid button:active { transform: translateY(3px); box-shadow: 0 1px 0 hsl(var(--h) 55% 30%); }
.pos-grid b { font: 700 14px/1.2 var(--k-text); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 1px rgba(0,0,0,.3); } .pos-grid em { justify-self: end; font: 700 13px Consolas, monospace; font-style: normal; opacity: .85; }
.pos-grid button.in::after { content: "✓"; position: absolute; right: 8px; top: 6px; font: 900 14px var(--k-text); }
`;

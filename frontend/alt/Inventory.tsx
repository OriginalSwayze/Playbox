// INVENTORY — an adventure game's backpack. A grid of slots holds your games as items with rarity borders (from
// hours played: common to legendary), stack counts and an equipped marker for installed ones. Bags are collections;
// hover for a tooltip, click to inspect, and Use plays it.
import { useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const RAR = [{ n: 'Common', c: '#9DA5B4', m: 0 }, { n: 'Uncommon', c: '#3FD26A', m: 60 }, { n: 'Rare', c: '#3F8CFF', m: 600 }, { n: 'Epic', c: '#B15CFF', m: 3000 }, { n: 'Legendary', c: '#FF9F1A', m: 9000 }];
const rar = (g: Game) => [...RAR].reverse().find((r) => g.minutes >= r.m)!;

export function Inventory() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [tip, setTip] = useState<{ g: Game; x: number; y: number } | null>(null);
	const slots = 60;
	const items = b.games.slice(0, slots);
	return (
		<AltPage className="inv" brand={<>🎒 Inventory</>}>
			<div className="inv-app">
				<nav className="inv-bags">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>👜 {i.name}<em>{Math.min(slots, i.games.length)}/{slots}</em></button>)}</nav>
				<section className="inv-pack">
					<header><b>{b.isle?.name}</b><span>{items.filter((g) => g.installed).length} equipped · {RAR.map((r) => <i key={r.n} style={{ color: r.c }}>■</i>)}</span></header>
					<div className="inv-grid">{Array.from({ length: slots }, (_, i) => { const g = items[i]; if (!g) return <span key={i} className="inv-slot empty" />; const r = rar(g); return (
						<button key={g.appid} data-appid={g.appid} className={'inv-slot' + (sel?.appid === g.appid ? ' on' : '')} style={{ ['--r' as string]: r.c }} onClick={() => select(g.appid)}
							onMouseEnter={(e) => { const p = (e.currentTarget.closest('.inv-pack') as HTMLElement).getBoundingClientRect(); const q = e.currentTarget.getBoundingClientRect(); setTip({ g, x: q.right - p.left + 8, y: q.top - p.top }); }} onMouseLeave={() => setTip(null)}>
							<Art g={g} kind="capsule" />{g.installed && <i className="inv-eq">E</i>}{g.minutes2w > 0 && <i className="inv-new">!</i>}<em>{Math.max(1, Math.round(g.minutes / 60))}</em>
						</button>); })}</div>
					{tip && <div className="inv-tip" style={{ left: tip.x, top: tip.y, ['--r' as string]: rar(tip.g).c }}><b>{tip.g.name}</b><em>{rar(tip.g).n} game</em><p>{formatPlaytime(tip.g.minutes)} of use</p><p>{tip.g.installed ? 'Equipped (installed)' : 'In pack (not installed)'}</p><small>Click to inspect</small></div>}
				</section>
				<aside className="inv-insp">
					{sel ? <div key={sel.appid} style={{ ['--r' as string]: rar(sel).c }}>
						<div className="inv-big"><Art g={sel} kind="capsule" /></div><h3>{sel.name}</h3><em className="inv-rar">{rar(sel).n}</em>
						<ul><li>+{Math.round(sel.minutes / 60)} Experience (hours)</li><li>+{Math.round(sel.minutes2w / 60)} Momentum (2 weeks)</li>{sel.metacritic > 0 && <li>+{sel.metacritic} Renown</li>}<li>Weight: {sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</li><li className="flav">“{sel.lastPlayed ? `Last used ${formatAgo(sel.lastPlayed).toLowerCase()}.` : 'Never used. Still shiny.'}”</li></ul>
						<PlayBtn g={sel} className="inv-use" label={['Use (Play)', 'Equip (Install)']} /><Actions g={sel} className="inv-act" /><button className="inv-x" onClick={() => select(null)}>Put away</button>
					</div> : <p className="inv-none">Select an item to inspect it.</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const inventoryCss = tok('inventory', { bg: '#1A1410', s1: '#2A2018', s2: '#3A2C20', s3: '#4A3828', fg: '#F2E6D0', fg2: '#D4C2A0', fg3: '#9C8A6C', acc: '#FF9F1A', on: '#2A1600', top: '#120D09', font: '"Palatino Linotype", "Book Antiqua", Georgia, serif' }) + `
.inv-brand { font: 700 18px var(--k-text); color: #F2E6D0; }
.inv-app { position: absolute; inset: 0; display: grid; grid-template-columns: 230px minmax(0, 1fr) 340px; gap: 14px; padding: 16px; background: radial-gradient(60% 60% at 50% 30%, #3A2C20, #120D09 80%); }
.inv-bags { overflow-y: auto; display: grid; align-content: start; gap: 6px; } .inv-bags button { display: flex; justify-content: space-between; gap: 6px; padding: 8px 10px; border-radius: 6px; background: linear-gradient(#3A2C20, #2A2018); box-shadow: inset 0 0 0 1px #5A4430; font: 14px var(--k-text); color: #D4C2A0; text-align: left; } .inv-bags button.on { box-shadow: inset 0 0 0 2px #FF9F1A; color: #fff; } .inv-bags em { font-style: normal; color: #9C8A6C; font-size: 12px; }
.inv-pack { position: relative; padding: 14px; border-radius: 12px; background: linear-gradient(#4A3828, #2A2018); box-shadow: inset 0 0 0 3px #6B5238, inset 0 0 0 6px #2A2018, 0 20px 40px rgba(0,0,0,.6); overflow-y: auto; }
.inv-pack header { display: flex; justify-content: space-between; margin-bottom: 10px; font: 700 16px var(--k-text); color: #F2E6D0; } .inv-pack header span { font: 13px var(--k-text); color: #9C8A6C; } .inv-pack header i { font-style: normal; margin-left: 2px; }
.inv-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.inv-slot { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: radial-gradient(circle, #2A2018, #120D09); box-shadow: inset 0 0 0 2px var(--r, #3A2C20), inset 0 0 14px color-mix(in srgb, var(--r, #000) 45%, transparent); } .inv-slot.empty { box-shadow: inset 0 0 0 1px #3A2C20, inset 0 2px 6px rgba(0,0,0,.6); }
.inv-slot img, .inv-slot .alt-noart { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; padding: 4px; border-radius: 8px; font-size: 5px; } .inv-slot:hover { filter: brightness(1.2); } .inv-slot.on { box-shadow: inset 0 0 0 3px #fff, 0 0 12px var(--r); }
.inv-slot em { position: absolute; right: 4px; bottom: 2px; font: 700 12px var(--k-text); font-style: normal; color: #fff; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000; } .inv-eq { position: absolute; left: 3px; top: 3px; padding: 0 4px; border-radius: 3px; background: #3FD26A; font: 800 10px var(--k-text); font-style: normal; color: #0A2A12; } .inv-new { position: absolute; right: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #FF9F1A; font: 800 10px/14px var(--k-text); font-style: normal; text-align: center; color: #2A1600; }
.inv-tip { position: absolute; z-index: 5; width: 220px; padding: 10px 12px; border-radius: 6px; background: rgba(12,8,5,.95); box-shadow: inset 0 0 0 1px var(--r); pointer-events: none; color: #F2E6D0; } .inv-tip b { display: block; font: 700 15px var(--k-text); color: var(--r); } .inv-tip em { font: italic 12px var(--k-text); color: #9C8A6C; } .inv-tip p { margin: 4px 0 0; font: 13px var(--k-text); } .inv-tip small { display: block; margin-top: 6px; color: #9C8A6C; }
.inv-insp { overflow-y: auto; padding: 18px; border-radius: 12px; background: linear-gradient(#2A2018, #1A1410); box-shadow: inset 0 0 0 2px #5A4430; color: #F2E6D0; } .inv-insp > div { display: grid; justify-items: center; text-align: center; animation: k-fade .2s both; }
.inv-big { width: 150px; padding: 8px; border-radius: 12px; box-shadow: inset 0 0 0 3px var(--r), 0 0 30px color-mix(in srgb, var(--r) 50%, transparent); } .inv-big img { width: 100%; border-radius: 6px; display: block; }
.inv-insp h3 { margin: 12px 0 2px; font: 700 20px var(--k-text); color: var(--r); } .inv-rar { font: italic 14px var(--k-text); color: #9C8A6C; }
.inv-insp ul { width: 100%; list-style: none; margin: 14px 0; padding: 0; text-align: left; font: 14px var(--k-text); } .inv-insp li { padding: 3px 0; color: #3FD26A; } .inv-insp li:nth-child(4) { color: #D4C2A0; } .inv-insp .flav { color: #D4A84A; font-style: italic; }
.inv-use { width: 100%; height: 44px; border-radius: 6px; background: linear-gradient(#FFB84D, #E07B00) !important; color: #2A1600 !important; font: 700 16px var(--k-text) !important; box-shadow: inset 0 1px 0 #FFE0A8; margin-bottom: 6px; } .inv-act { width: 100%; } .inv-act button { color: #D4C2A0 !important; } .inv-act button:hover { background: #3A2C20 !important; } .inv-x { margin-top: 6px; color: #FF9F1A; font: 14px var(--k-text); } .inv-none { color: #9C8A6C; text-align: center; margin-top: 40px; }
`;

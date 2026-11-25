// LOGS — an observability log explorer. Every game emits log events (session ended, added to library, update
// pending, never launched) with a level and a service (its collection); a histogram shows events over time,
// filters pick levels and services, and an event opens as structured JSON with Play.
import { useMemo, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

type Ev = { g: Game; at: number; lvl: 'INFO' | 'WARN' | 'DEBUG'; svc: string; msg: string };

export function Logs() {
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [lv, setLv] = useState<Record<string, boolean>>({ INFO: true, WARN: true, DEBUG: true });
	const [svc, setSvc] = useState<string | null>(null);
	const [q, setQ] = useState('');
	const events = useMemo(() => {
		const seen = new Set<number>(); const out: Ev[] = [];
		for (const i of islands) for (const g of i.games) { if (seen.has(g.appid)) continue; seen.add(g.appid); const s = i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			if (g.lastPlayed) out.push({ g, at: g.lastPlayed, lvl: 'INFO', svc: s, msg: `session.end game="${g.name}" total_min=${g.minutes} last2w_min=${g.minutes2w}` });
			if (g.added) out.push({ g, at: g.added, lvl: 'DEBUG', svc: s, msg: `library.add game="${g.name}" appid=${g.appid}` });
			if (g.needsUpdate) out.push({ g, at: Date.now() / 1000, lvl: 'WARN', svc: s, msg: `update.pending game="${g.name}"` });
			if (!g.minutes && g.installed) out.push({ g, at: g.added || 0, lvl: 'WARN', svc: s, msg: `install.idle game="${g.name}" reason="never launched"` }); }
		return out.sort((a, b) => b.at - a.at);
	}, [islands]);
	const shown = events.filter((e) => lv[e.lvl] && (!svc || e.svc === svc) && (!q || e.msg.toLowerCase().includes(q.toLowerCase()))).slice(0, 400);
	const hist = useMemo(() => { const now = Date.now() / 1000, span = 365 * 86400, n = 60; const bins = Array(n).fill(0); for (const e of shown) { const k = Math.floor(((e.at - (now - span)) / span) * n); if (k >= 0 && k < n) bins[k]++; } return bins as number[]; }, [shown]);
	const maxB = Math.max(1, ...hist);
	const services = [...new Set(events.map((e) => e.svc))];
	const ts = (u: number) => new Date(u * 1000).toISOString().replace('T', ' ').slice(0, 19);
	return (
		<AltPage className="log" brand={<>◉ Observe · Logs</>}>
			<div className="log-app">
				<nav className="log-side"><h5>Level</h5>{(['INFO', 'WARN', 'DEBUG'] as const).map((l) => <label key={l} className={'lv-' + l}><input type="checkbox" checked={lv[l]} onChange={(e) => setLv({ ...lv, [l]: e.target.checked })} />{l}<em>{events.filter((e) => e.lvl === l).length}</em></label>)}
					<h5>Service</h5><button className={!svc ? 'on' : ''} onClick={() => setSvc(null)}>all</button>{services.map((s) => <button key={s} className={svc === s ? 'on' : ''} onClick={() => setSvc(s)}>{s}</button>)}</nav>
				<section className="log-main">
					<div className="log-q"><span>service:{svc ?? '*'}</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search log messages…" spellCheck={false} /><b>{shown.length} events</b></div>
					<div className="log-hist">{hist.map((h, i) => <i key={i} style={{ height: (h / maxB) * 100 + '%' }} />)}<span className="l">−12 mo</span><span className="r">now</span></div>
					<div className="log-lines">{shown.map((e, i) => (
						<button key={i} data-appid={e.g.appid} className={'log-ln lv-' + e.lvl + (sel?.appid === e.g.appid ? ' on' : '')} onClick={() => select(e.g.appid)}><time>{e.at ? ts(e.at) : '—'}</time><b>{e.lvl}</b><em>{e.svc}</em><span>{e.msg}</span></button>
					))}</div>
				</section>
				{sel && <aside className="log-json" key={sel.appid}><h4>{sel.name}</h4><pre>{JSON.stringify({ appid: sel.appid, name: sel.name, installed: sel.installed, minutes: sel.minutes, minutes_2w: sel.minutes2w, last_played: sel.lastPlayed ? ts(sel.lastPlayed) : null, added: sel.added ? ts(sel.added) : null, size_bytes: sel.sizeOnDisk, metascore: sel.metacritic || null, status: sel.status || 'idle' }, null, 2)}</pre>
					<p>{formatPlaytime(sel.minutes)} total</p><PlayBtn g={sel} className="log-go" label={['▶ Run (Play)', '⬇ Deploy (Install)']} /><Actions g={sel} className="log-act" /><button className="log-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const logsCss = tok('logs', { bg: '#0B0C0E', s1: '#141519', s2: '#1C1E24', s3: '#272A33', fg: '#D8DAE0', fg2: '#A9ADB8', fg3: '#6B7080', acc: '#F46800', on: '#fff', top: '#0B0C0E', font: '"Segoe UI", system-ui, sans-serif' }) + `
.log-brand { font: 600 14px var(--k-text); color: #D8DAE0; }
.log-app { position: absolute; inset: 0; display: grid; grid-template-columns: 210px minmax(0, 1fr) auto; font: 13px var(--k-text); color: #D8DAE0; }
.log-side { overflow-y: auto; padding: 10px; background: #141519; border-right: 1px solid #272A33; } .log-side h5 { margin: 10px 4px 6px; font: 600 11px var(--k-text); text-transform: uppercase; color: #6B7080; }
.log-side label { display: flex; gap: 8px; align-items: center; padding: 4px; font: 600 12px Consolas, monospace; } .log-side label em { margin-left: auto; font-style: normal; color: #6B7080; } .log-side label.lv-INFO { color: #73BF69; } .log-side label.lv-WARN { color: #F2CC0C; } .log-side label.lv-DEBUG { color: #8AB8FF; }
.log-side button { display: block; width: 100%; padding: 4px 6px; border-radius: 4px; text-align: left; font: 12px Consolas, monospace; color: #A9ADB8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .log-side button.on { background: #272A33; color: #fff; }
.log-main { display: grid; grid-template-rows: 40px 90px minmax(0, 1fr); min-height: 0; }
.log-q { display: flex; gap: 10px; align-items: center; padding: 0 12px; border-bottom: 1px solid #272A33; } .log-q span { padding: 3px 8px; border-radius: 3px; background: #272A33; font: 12px Consolas, monospace; color: #F46800; } .log-q input { flex: 1; height: 28px; padding: 0 10px; border: 1px solid #272A33; border-radius: 4px; background: #0B0C0E; color: #D8DAE0; font: 13px Consolas, monospace; outline: none; } .log-q b { color: #6B7080; font-weight: 400; }
.log-hist { position: relative; display: flex; gap: 2px; align-items: flex-end; padding: 10px 12px 18px; border-bottom: 1px solid #272A33; } .log-hist i { flex: 1; min-height: 1px; background: #73BF69; opacity: .8; border-radius: 1px 1px 0 0; } .log-hist span { position: absolute; bottom: 2px; font: 10px Consolas, monospace; color: #6B7080; } .log-hist .l { left: 12px; } .log-hist .r { right: 12px; }
.log-lines { overflow-y: auto; font: 12.5px Consolas, "Cascadia Mono", monospace; }
.log-ln { display: grid; grid-template-columns: 150px 56px 150px minmax(0, 1fr); gap: 10px; width: 100%; padding: 2px 12px; text-align: left; color: #D8DAE0; border-left: 3px solid transparent; } .log-ln:hover { background: #141519; } .log-ln.on { background: #1C1E24; }
.log-ln time { color: #6B7080; } .log-ln em { font-style: normal; color: #8AB8FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .log-ln span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-ln.lv-INFO { border-color: #73BF69; } .log-ln.lv-INFO b { color: #73BF69; } .log-ln.lv-WARN { border-color: #F2CC0C; } .log-ln.lv-WARN b { color: #F2CC0C; } .log-ln.lv-DEBUG { border-color: #3D71D9; } .log-ln.lv-DEBUG b { color: #8AB8FF; }
.log-json { width: 380px; overflow-y: auto; padding: 14px; background: #141519; border-left: 1px solid #272A33; animation: k-fade .2s both; } .log-json h4 { margin: 0 0 8px; font: 600 15px var(--k-text); }
.log-json pre { margin: 0 0 10px; padding: 10px; border-radius: 4px; background: #0B0C0E; font: 12px/1.5 Consolas, monospace; color: #CE9178; white-space: pre-wrap; word-break: break-all; } .log-json p { color: #6B7080; }
.log-go { width: 100%; height: 34px; border-radius: 4px; background: #F46800 !important; color: #fff !important; font: 600 13px var(--k-text) !important; margin-bottom: 6px; } .log-act button { color: #A9ADB8 !important; } .log-act button:hover { background: #1C1E24 !important; } .log-x { margin-top: 6px; color: #F46800; font: 12px var(--k-text); }
`;

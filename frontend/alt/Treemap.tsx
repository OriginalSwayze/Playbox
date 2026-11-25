// TREEMAP — a disk-usage analyser. Your games fill the screen as a squarified treemap, each rectangle sized by size on
// disk (or by hours played, or by hours this fortnight) and coloured by collection. Click a block for its details;
// Play or Uninstall-style actions sit in the panel.
import { useMemo, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, Art, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

type R = { g: Game; x: number; y: number; w: number; h: number };
function squarify(items: { g: Game; v: number }[], x: number, y: number, w: number, h: number): R[] {
	const out: R[] = []; let rest = [...items]; const total = rest.reduce((n, i) => n + i.v, 0) || 1; const scale = (w * h) / total;
	while (rest.length) {
		const short = Math.min(w, h); let row: typeof rest = []; let best = Infinity;
		for (const it of rest) { const tr = [...row, it]; const s = tr.reduce((n, i) => n + i.v * scale, 0); const mx = Math.max(...tr.map((i) => i.v * scale)), mn = Math.min(...tr.map((i) => i.v * scale)); const worst = Math.max((short * short * mx) / (s * s), (s * s) / (short * short * mn)); if (worst > best) break; best = worst; row = tr; }
		const s = row.reduce((n, i) => n + i.v * scale, 0); const thick = s / short; let off = 0;
		for (const it of row) { const len = (it.v * scale) / thick; if (w >= h) out.push({ g: it.g, x, y: y + off, w: thick, h: len }); else out.push({ g: it.g, x: x + off, y, w: len, h: thick }); off += len; }
		if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
		rest = rest.slice(row.length);
	}
	return out;
}
const MODES = { disk: { n: 'Size on disk', v: (g: Game) => g.sizeOnDisk }, hours: { n: 'Hours played', v: (g: Game) => g.minutes }, recent: { n: 'Last two weeks', v: (g: Game) => g.minutes2w } } as const;

export function Treemap() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [mode, setMode] = useState<keyof typeof MODES>('disk');
	const hueOf = useMemo(() => { const m = new Map<number, number>(); b.islands.filter((i) => i.id !== 'all' && i.id !== 'recent').forEach((i, k) => i.games.forEach((g) => !m.has(g.appid) && m.set(g.appid, (k * 53) % 360))); return m; }, [b.islands]);
	const items = useMemo(() => b.games.map((g) => ({ g, v: MODES[mode].v(g) })).filter((i) => i.v > 0).sort((a, c) => c.v - a.v).slice(0, 150), [b.games, mode]);
	const rects = useMemo(() => squarify(items, 0, 0, 1600, 860), [items]);
	const total = items.reduce((n, i) => n + i.v, 0);
	const fmt = (v: number) => (mode === 'disk' ? formatBytes(v) : formatPlaytime(v));
	return (
		<AltPage className="tmp" brand={<>▦ Treemap</>}>
			<div className="tmp-app">
				<div className="tmp-bar"><select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
					<div className="tmp-seg">{(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => <button key={k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{MODES[k].n}</button>)}</div><span>{items.length} items · {fmt(total)}</span></div>
				<div className="tmp-map">
					<svg viewBox="0 0 1600 860" preserveAspectRatio="none">{rects.map((r) => (
						<g key={r.g.appid} data-appid={r.g.appid} className={'tmp-r' + (sel?.appid === r.g.appid ? ' on' : '')} onClick={() => select(r.g.appid)}>
							<rect x={r.x + 1} y={r.y + 1} width={Math.max(0, r.w - 2)} height={Math.max(0, r.h - 2)} rx="3" style={{ fill: `hsl(${hueOf.get(r.g.appid) ?? 210} 55% ${38 + Math.min(20, (r.w * r.h) / 20000)}%)` }} />
							{r.w > 70 && r.h > 26 && <text x={r.x + 8} y={r.y + 20}>{r.g.name.slice(0, Math.floor(r.w / 8))}</text>}
							{r.w > 70 && r.h > 44 && <text x={r.x + 8} y={r.y + 38} className="s">{fmt(MODES[mode].v(r.g))} · {((MODES[mode].v(r.g) / total) * 100).toFixed(1)}%</text>}
						</g>))}</svg>
					{!items.length && <p className="tmp-none">Nothing to measure for {MODES[mode].n.toLowerCase()} here.</p>}
				</div>
				{sel && <aside className="tmp-card" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><dl><dt>Size on disk</dt><dd>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</dd><dt>Played</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Last played</dt><dd>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Never'}</dd><dt>Share</dt><dd>{total ? ((MODES[mode].v(sel) / total) * 100).toFixed(2) : 0}%</dd></dl><PlayBtn g={sel} className="tmp-go" /><Actions g={sel} className="tmp-act" /><button className="tmp-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const treemapCss = tok('treemap', { bg: '#12161C', s1: '#1A2028', s2: '#232B35', s3: '#2E3844', fg: '#E8EEF5', fg2: '#B3BFCC', fg3: '#74818F', acc: '#4DA3FF', on: '#fff', top: '#0D1015', font: '"Segoe UI", system-ui, sans-serif' }) + `
.tmp-brand { font: 600 16px var(--k-text); color: #E8EEF5; }
.tmp-app { position: absolute; inset: 0; display: grid; grid-template-rows: 46px minmax(0, 1fr); }
.tmp-bar { display: flex; gap: 14px; align-items: center; padding: 0 16px; font: 13px var(--k-text); color: #74818F; } .tmp-bar select { height: 30px; border-radius: 6px; border: 0; background: #232B35; color: #E8EEF5; padding: 0 8px; }
.tmp-seg { display: flex; padding: 2px; border-radius: 8px; background: #1A2028; } .tmp-seg button { padding: 5px 12px; border-radius: 6px; font: 600 12px var(--k-text); color: #B3BFCC; } .tmp-seg button.on { background: #4DA3FF; color: #fff; }
.tmp-map { position: relative; margin: 0 12px 12px; } .tmp-map svg { width: 100%; height: 100%; display: block; }
.tmp-r { cursor: pointer; } .tmp-r rect { stroke: #12161C; stroke-width: 1; transition: filter .15s; } .tmp-r:hover rect { filter: brightness(1.25); } .tmp-r.on rect { stroke: #fff; stroke-width: 3; }
.tmp-r text { font: 600 13px var(--k-text); fill: #fff; pointer-events: none; } .tmp-r text.s { font: 11px var(--k-text); fill: rgba(255,255,255,.75); }
.tmp-none { position: absolute; inset: 0; display: grid; place-items: center; color: #74818F; }
.tmp-card { position: absolute; right: 24px; bottom: 24px; width: 320px; padding: 14px; border-radius: 12px; background: rgba(26,32,40,.95); box-shadow: 0 20px 40px rgba(0,0,0,.5); color: #E8EEF5; animation: k-rise .25s var(--k-out) both; }
.tmp-card img { width: 100%; border-radius: 8px; } .tmp-card h3 { margin: 10px 0; font: 700 17px var(--k-text); } .tmp-card dl { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; margin: 0 0 12px; font: 13px var(--k-text); } .tmp-card dt { color: #74818F; } .tmp-card dd { margin: 0; }
.tmp-go { width: 100%; height: 40px; border-radius: 8px; background: #4DA3FF !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 6px; } .tmp-act button { color: #B3BFCC !important; } .tmp-act button:hover { background: #232B35 !important; } .tmp-x { margin-top: 6px; color: #4DA3FF; font: 600 13px var(--k-text); }
`;

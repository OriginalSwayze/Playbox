// ELEMENTS — a periodic table of your games. The 118 most-played take the classic layout: atomic number is rank,
// "mass" is hours, the symbol comes from the name, and the colour family is the game's first collection. Pick an
// element for its data sheet; React plays it.
import { useMemo } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

// [row, col] for elements 1..118 in the standard 18-column layout (lanthanides/actinides in rows 9-10).
const CELLS: [number, number][] = (() => {
	const out: [number, number][] = [];
	const put = (r: number, cols: number[]) => cols.forEach((c) => out.push([r, c]));
	const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
	put(1, [1, 18]); put(2, [1, 2, ...range(13, 18)]); put(3, [1, 2, ...range(13, 18)]); put(4, range(1, 18)); put(5, range(1, 18));
	put(6, [1, 2]); put(9, range(3, 17)); put(6, range(4, 18)); put(7, [1, 2]); put(10, range(3, 17)); put(7, range(4, 18));
	return out;
})();
const symbol = (g: Game) => { const w = g.name.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/); const s = (w[0]?.[0] ?? 'X').toUpperCase() + ((w[1]?.[0] ?? w[0]?.[1] ?? '').toLowerCase()); return s; };
const FAM = ['#FF8A80', '#FFD180', '#FFFF8D', '#CCFF90', '#A7FFEB', '#80D8FF', '#82B1FF', '#B388FF', '#F8BBD0', '#D7CCC8', '#CFD8DC'];

export function Elements() {
	const library = useKestrel((s) => s.library);
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 10);
	const [sel, select] = useSelectedGame();
	const els = useMemo(() => [...library].sort((a, b) => b.minutes - a.minutes).slice(0, 118), [library]);
	const fam = useMemo(() => { const m = new Map<number, number>(); islands.forEach((i, k) => i.games.forEach((g) => !m.has(g.appid) && m.set(g.appid, k))); return m; }, [islands]);
	const color = (g: Game) => FAM[fam.get(g.appid) ?? 10];
	const cur = sel ?? els[0] ?? null;
	const z = cur ? els.indexOf(cur) + 1 : 0;
	return (
		<AltPage className="pt" brand={<>Periodic Table of Games</>}>
			<div className="pt-app">
				<div className="pt-table">
					{els.map((g, i) => { const [r, c] = CELLS[i]; return (
						<button key={g.appid} data-appid={g.appid} className={'pt-el' + (cur?.appid === g.appid ? ' on' : '') + (g.installed ? '' : ' dim')} style={{ gridRow: r, gridColumn: c, background: color(g) }} onClick={() => select(g.appid)} title={g.name}>
							<em>{i + 1}</em><b>{symbol(g)}</b><span>{g.name}</span><small>{(g.minutes / 60).toFixed(1)}</small>
						</button>); })}
					{cur && (
						<div className="pt-sheet" key={cur.appid} style={{ ['--c' as string]: color(cur) }}>
							<div className="pt-big"><em>{z || '–'}</em><b>{symbol(cur)}</b><span>{cur.name}</span><small>{(cur.minutes / 60).toFixed(2)}</small></div>
							<div className="pt-data"><p><i>Atomic mass</i>{formatPlaytime(cur.minutes)}</p><p><i>Half-life</i>{cur.lastPlayed ? formatAgo(cur.lastPlayed) : 'Stable (never played)'}</p><p><i>State</i>{cur.installed ? 'Solid (installed)' : 'Gas (not installed)'}</p><p><i>Reactivity</i>{cur.minutes2w ? 'High — active this fortnight' : 'Low'}</p></div>
							<div className="pt-act"><PlayBtn g={cur} className="pt-go" label={['⚗ React (Play)', '⚗ Synthesise (Install)']} /><Actions g={cur} /></div>
							<Art g={cur} kind="capsule" className="pt-img" />
						</div>
					)}
					<div className="pt-legend">{islands.map((i, k) => <span key={i.id}><i style={{ background: FAM[k] }} />{i.name}</span>)}<span><i style={{ background: FAM[10] }} />Uncollected</span></div>
				</div>
			</div>
		</AltPage>
	);
}

export const elementsCss = tok('elements', { bg: '#FAFAF7', s1: '#FFFFFF', s2: '#EEEEE8', s3: '#DDDDD4', fg: '#1A1A1A', fg2: '#3A3A3A', fg3: '#777', acc: '#1A1A1A', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.pt-brand { font: 700 17px var(--k-text); color: #1A1A1A; }
.pt-app { position: absolute; inset: 0; overflow: auto; padding: 16px 20px; display: grid; place-items: start center; }
.pt-table { position: relative; display: grid; grid-template-columns: repeat(18, minmax(56px, 1fr)); grid-template-rows: repeat(7, 74px) 18px repeat(2, 74px) auto; gap: 3px; width: min(1500px, 100%); }
.pt-el { position: relative; display: grid; grid-template-rows: auto 1fr auto auto; padding: 4px 5px; border-radius: 3px; text-align: left; color: #1A1A1A; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); overflow: hidden; transition: transform .15s; }
.pt-el:hover { transform: scale(1.18); z-index: 2; box-shadow: 0 6px 16px rgba(0,0,0,.25); } .pt-el.on { box-shadow: 0 0 0 3px #1A1A1A; z-index: 1; } .pt-el.dim { filter: saturate(.35) brightness(1.05); }
.pt-el em { font: 600 10px var(--k-text); font-style: normal; } .pt-el b { font: 800 22px/1 var(--k-text); align-self: center; } .pt-el span { font: 9px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pt-el small { font: 9px Consolas, monospace; opacity: .7; }
.pt-sheet { grid-row: 1 / 4; grid-column: 3 / 13; align-self: start; max-height: 226px; overflow: hidden; display: grid; grid-template-columns: 130px 1fr auto 70px; gap: 16px; padding: 10px 14px; margin: 0 6px; border-radius: 6px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.1); animation: k-fade .2s both; }
.pt-big { display: grid; padding: 8px 10px; border-radius: 4px; background: var(--c); box-shadow: inset 0 0 0 2px rgba(0,0,0,.15); } .pt-big em { font: 700 14px var(--k-text); font-style: normal; } .pt-big b { font: 800 50px/1 var(--k-text); } .pt-big span { font: 600 12px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pt-big small { font: 11px Consolas, monospace; }
.pt-data p { display: grid; grid-template-columns: 100px 1fr; margin: 2px 0; font: 13px var(--k-text); } .pt-data i { font-style: normal; color: #777; }
.pt-act { display: grid; align-content: start; gap: 4px; } .pt-go { height: 34px; padding: 0 14px; border-radius: 6px; background: #1A1A1A !important; color: #fff !important; font: 700 13px var(--k-text) !important; } .pt-act .alt-actions { grid-template-columns: 1fr 1fr; } .pt-act .alt-actions button { padding: 4px 6px !important; font-size: 11px !important; }
.pt-img { width: 70px; border-radius: 3px; }
.pt-legend { grid-row: 11; grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 14px; padding-top: 10px; font: 12px var(--k-text); color: #3A3A3A; } .pt-legend i { display: inline-block; width: 12px; height: 12px; margin-right: 6px; border-radius: 2px; vertical-align: -1px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
`;

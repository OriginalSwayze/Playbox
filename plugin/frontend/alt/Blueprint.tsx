// BLUEPRINT — an architect's floor plan. Collections are rooms sized by how many games they hold, each game a numbered
// fixture inside its room; dimension lines and a title block finish the sheet. Pick a fixture and its spec appears
// in the title block, with Build (Play).
import { useMemo } from 'react';
import { formatAgo, formatBytes, formatPlaytime } from '../steam/library';
import { Actions, AltPage, PlayBtn, dateOf, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const W = 1400, H = 820;

export function Blueprint() {
	const islands = useIslands().slice(0, 9);
	const [sel, select] = useSelectedGame();
	const rooms = useMemo(() => {
		// rooms in rows of three, each row's widths proportional to its rooms' game counts
		const out: { i: typeof islands[0]; x: number; y: number; w: number; h: number }[] = [];
		const rows = Math.max(1, Math.ceil(islands.length / 3)); const rh = (H - 200) / rows;
		for (let r = 0; r < rows; r++) { const part = islands.slice(r * 3, r * 3 + 3); const sum = part.reduce((n, i) => n + Math.max(6, i.games.length), 0); let x = 60;
			for (const i of part) { const w = (Math.max(6, i.games.length) / sum) * (W - 120); out.push({ i, x, y: 60 + r * rh, w, h: rh - 20 }); x += w; } }
		return out;
	}, [islands]);
	return (
		<AltPage className="blu" brand={<>DWG · KESTREL-LIB-01</>}>
			<div className="blu-app">
				<svg className="blu-sheet" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
					<defs><pattern id="blugrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" className="g" /></pattern><marker id="bluarr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className="arr" /></marker></defs>
					<rect width={W} height={H} fill="url(#blugrid)" />
					<rect x="20" y="20" width={W - 40} height={H - 40} className="frame" />
					{rooms.map((r, k) => { const cols = Math.max(1, Math.floor(r.w / 60)); return (
						<g key={r.i.id}>
							<rect x={r.x} y={r.y} width={r.w} height={r.h} className="wall" />
							<path d={`M${r.x + 30} ${r.y + r.h} a 30 30 0 0 1 30 -30`} className="door" />
							<text x={r.x + 10} y={r.y + 22} className="room">{r.i.name.toUpperCase()}</text>
							<text x={r.x + 10} y={r.y + 38} className="sub">{String.fromCharCode(65 + k)}-{r.i.games.length} UNITS</text>
							<line x1={r.x} x2={r.x + r.w} y1={r.y - 14} y2={r.y - 14} className="dim" markerStart="url(#bluarr)" markerEnd="url(#bluarr)" /><text x={r.x + r.w / 2} y={r.y - 18} className="dimt">{Math.round(r.w / 10) * 100}</text>
							{r.i.games.slice(0, cols * Math.max(1, Math.floor((r.h - 60) / 46))).map((g, n) => { const fx = r.x + 14 + (n % cols) * ((r.w - 28) / cols), fy = r.y + 52 + Math.floor(n / cols) * 46; const fw = (r.w - 28) / cols - 8; return (
								<g key={g.appid} data-appid={g.appid} className={'fix' + (sel?.appid === g.appid ? ' on' : '') + (g.installed ? '' : ' plan')} onClick={() => select(g.appid)}>
									<rect x={fx} y={fy} width={fw} height="34" rx="2" /><text x={fx + 4} y={fy + 14} className="fn">{k + 1}.{n + 1}</text><text x={fx + 4} y={fy + 27} className="fl">{g.name.slice(0, Math.max(4, Math.floor(fw / 6.2)))}</text>
								</g>); })}
						</g>); })}
					<g className="tb"><rect x={W - 470} y={H - 150} width="430" height="110" /><line x1={W - 470} x2={W - 40} y1={H - 115} y2={H - 115} /><line x1={W - 160} x2={W - 160} y1={H - 150} y2={H - 40} />
						<text x={W - 460} y={H - 127} className="tbt">KESTREL LIBRARY · FLOOR PLAN</text><text x={W - 150} y={H - 127} className="tbt">SHEET 1/1</text>
						<text x={W - 460} y={H - 95} className="tbs">{sel ? sel.name.toUpperCase().slice(0, 40) : 'SELECT A FIXTURE'}</text>
						{sel && <><text x={W - 460} y={H - 75} className="tbs">PLAYTIME {formatPlaytime(sel.minutes).toUpperCase()} · {sel.installed ? 'BUILT' : 'PLANNED'}</text><text x={W - 460} y={H - 55} className="tbs">ADDED {dateOf(sel.added).toUpperCase()} · SIZE {sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk).toUpperCase() : 'N/A'}</text></>}
						<text x={W - 150} y={H - 95} className="tbs">SCALE 1:{sel ? Math.max(1, Math.round(sel.minutes / 60)) : 100}</text><text x={W - 150} y={H - 75} className="tbs">REV {new Date().getFullYear()}</text></g>
				</svg>
				{sel && <aside className="blu-spec" key={sel.appid}><b>{sel.name}</b><p>{sel.lastPlayed ? `Last inspected ${formatAgo(sel.lastPlayed).toLowerCase()}` : 'Never inspected'}</p><PlayBtn g={sel} className="blu-go" label={['BUILD (PLAY)', 'APPROVE PLAN (INSTALL)']} /><Actions g={sel} className="blu-act" /></aside>}
			</div>
		</AltPage>
	);
}

export const blueprintCss = tok('blueprint', { bg: '#0D3B66', s1: '#124A7E', s2: '#175896', s3: '#1D66AE', fg: '#EAF4FF', fg2: '#BFD9F5', fg3: '#8DB5E0', acc: '#FFFFFF', on: '#0D3B66', top: '#0A2E50', font: '"Consolas", "Courier New", monospace' }) + `
.blu-brand { font: 700 13px var(--k-text); letter-spacing: .14em; color: #EAF4FF; }
.blu-app { position: absolute; inset: 0; display: grid; place-items: center; padding: 10px; background: #0D3B66; }
.blu-sheet { width: 100%; height: 100%; } .blu-sheet .g { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 1; } .frame { fill: none; stroke: #EAF4FF; stroke-width: 2; }
.wall { fill: rgba(255,255,255,.03); stroke: #EAF4FF; stroke-width: 4; } .door { fill: none; stroke: #EAF4FF; stroke-width: 1.5; stroke-dasharray: 4 3; }
.room { font: 700 15px Consolas, monospace; fill: #fff; letter-spacing: .1em; } .sub { font: 11px Consolas, monospace; fill: #8DB5E0; }
.dim { stroke: #8DB5E0; stroke-width: 1; } .arr { fill: #8DB5E0; } .dimt { font: 10px Consolas, monospace; fill: #8DB5E0; text-anchor: middle; }
.fix { cursor: pointer; } .fix rect { fill: rgba(234,244,255,.06); stroke: #BFD9F5; stroke-width: 1.2; } .fix.plan rect { stroke-dasharray: 4 3; } .fix:hover rect { fill: rgba(234,244,255,.18); } .fix.on rect { fill: #EAF4FF; stroke: #fff; } .fix.on text { fill: #0D3B66; }
.fn { font: 700 9px Consolas, monospace; fill: #8DB5E0; } .fl { font: 10px Consolas, monospace; fill: #EAF4FF; }
.tb rect { fill: #0D3B66; stroke: #EAF4FF; stroke-width: 2; } .tb line { stroke: #EAF4FF; stroke-width: 1; } .tbt { font: 700 12px Consolas, monospace; fill: #fff; } .tbs { font: 11px Consolas, monospace; fill: #BFD9F5; }
.blu-spec { position: absolute; left: 30px; bottom: 30px; width: 300px; padding: 14px; border: 2px solid #EAF4FF; background: rgba(13,59,102,.92); color: #EAF4FF; animation: k-fade .2s both; } .blu-spec b { font: 700 15px Consolas, monospace; } .blu-spec p { margin: 4px 0 10px; font: 12px Consolas, monospace; color: #BFD9F5; }
.blu-go { width: 100%; height: 38px; border: 2px solid #fff; background: transparent !important; color: #fff !important; font: 700 13px Consolas, monospace !important; letter-spacing: .1em; margin-bottom: 6px; } .blu-go:hover { background: #fff !important; color: #0D3B66 !important; }
.blu-act button { color: #BFD9F5 !important; font-family: Consolas, monospace !important; border-radius: 0 !important; } .blu-act button:hover { background: rgba(255,255,255,.1) !important; }
`;

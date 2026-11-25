// RECEIPT — your library printed on one long till roll. Each collection is a section with dotted leaders, hours as
// amounts and a subtotal; click a line and a small slip feeds out of the printer beside it, with Play at the bottom.
import { formatAgo } from '../steam/library';
import { AltPage, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const h = (m: number) => (m / 60).toFixed(1);

export function Receipt() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const secs = b.found ? [{ id: 'q', name: 'SEARCH', games: b.found }] : b.islands.filter((i) => i.id !== 'all');
	const grand = secs.reduce((n, s) => n + s.games.reduce((k, g) => k + g.minutes, 0), 0);
	const now = new Date();
	return (
		<AltPage className="rcp" brand={<>RECEIPT</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Find a line">
			<div className="rcp-app">
				<div className="rcp-roll">
					<div className="rcp-paper">
						<pre className="rcp-head">{`        ★ KESTREL GAMES ★\n     Your library, itemised\n   ${now.toLocaleDateString()}   ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}\n--------------------------------`}</pre>
						{secs.map((s) => (
							<div key={s.id} className="rcp-sec">
								<div className="rcp-sh">** {s.name.toUpperCase()} **</div>
								{s.games.slice(0, 80).map((g) => <button key={g.appid} data-appid={g.appid} className={'rcp-line' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}><span>{g.name.toUpperCase()}</span><i /><b>{h(g.minutes)}</b></button>)}
								{s.games.length > 80 && <div className="rcp-more">… {s.games.length - 80} MORE ITEMS</div>}
								<div className="rcp-sub"><span>SUBTOTAL ({s.games.length})</span><i /><b>{h(s.games.reduce((n, g) => n + g.minutes, 0))} H</b></div>
							</div>
						))}
						<pre className="rcp-foot">{`================================\nTOTAL HOURS ${h(grand).padStart(20)}\nITEMS       ${String(secs.reduce((n, s) => n + s.games.length, 0)).padStart(20)}\n================================\n     THANK YOU FOR PLAYING\n        PLEASE COME AGAIN`}</pre>
						<div className="rcp-bars">{Array.from({ length: 60 }, (_, i) => <i key={i} style={{ width: 1 + ((i * 7) % 4) }} />)}</div>
					</div>
				</div>
				<aside className="rcp-printer">
					<div className="rcp-box"><span className="rcp-led" />THERMAL PRINTER<div className="rcp-slot" /></div>
					{sel && <div className="rcp-slip" key={sel.appid}>
						<pre>{`ITEM SLIP\n----------------------\n${sel.name}\n----------------------\nAPP ID     ${sel.appid}\nPLAYED     ${h(sel.minutes)} H\n2 WEEKS    ${h(sel.minutes2w)} H\nLAST       ${sel.lastPlayed ? formatAgo(sel.lastPlayed).toUpperCase() : 'NEVER'}\nADDED      ${dateOf(sel.added).toUpperCase()}\nSTATUS     ${sel.installed ? 'INSTALLED' : 'NOT INSTALLED'}\n----------------------`}</pre>
						{gameCommands(sel).map((c) => <button key={c.id} className={c.primary ? 'p' : ''} onClick={c.run}>{c.primary ? (sel.installed ? '>> PLAY <<' : '>> INSTALL <<') : c.label.toUpperCase()}</button>)}
						<button className="rcp-tear" onClick={() => select(null)}>✂ tear off</button>
					</div>}
				</aside>
			</div>
		</AltPage>
	);
}

export const receiptCss = tok('receipt', { bg: '#2A2622', s1: '#38332E', s2: '#46403A', s3: '#554E46', fg: '#F2EBDD', fg2: '#CFC4B0', fg3: '#9A8F7C', acc: '#F2EBDD', on: '#2A2622', top: '#1F1C19', font: '"Courier New", Consolas, monospace' }) + `
.rcp-brand { font: 700 16px "Courier New", monospace; letter-spacing: .3em; color: #F2EBDD; }
.rcp-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 380px; background: radial-gradient(60% 80% at 40% 30%, #3A342D, #1F1C19); }
.rcp-roll { overflow-y: auto; padding: 30px 0 80px; }
.rcp-paper { width: 420px; margin: 0 auto; padding: 22px 22px 30px; background: #FBFAF5; color: #2B2B2B; font: 13px/1.45 "Courier New", monospace; box-shadow: 0 20px 40px -10px rgba(0,0,0,.6); position: relative; }
.rcp-paper::after { content: ""; position: absolute; left: 0; right: 0; bottom: -10px; height: 10px; background: linear-gradient(135deg, #FBFAF5 50%, transparent 50%) 0 0 / 14px 10px, linear-gradient(225deg, #FBFAF5 50%, transparent 50%) 0 0 / 14px 10px; }
.rcp-paper pre { margin: 0; font: inherit; white-space: pre; } .rcp-head { text-align: left; font-weight: 700; }
.rcp-sec { margin: 12px 0; } .rcp-sh { text-align: center; font-weight: 700; margin-bottom: 4px; }
.rcp-line { display: flex; gap: 4px; width: 100%; padding: 0; text-align: left; font: inherit; color: inherit; } .rcp-line span { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .rcp-line i { flex: 1; border-bottom: 1.5px dotted #888; margin-bottom: 5px; } .rcp-line b { font-weight: 400; }
.rcp-line:hover { background: #EFEDE3; } .rcp-line.on { background: #2B2B2B; color: #FBFAF5; } .rcp-line.on i { border-color: #FBFAF5; }
.rcp-more { text-align: center; color: #888; } .rcp-sub { display: flex; gap: 4px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #888; font-weight: 700; } .rcp-sub i { flex: 1; }
.rcp-bars { display: flex; gap: 2px; justify-content: center; height: 46px; margin-top: 16px; } .rcp-bars i { background: #2B2B2B; }
.rcp-printer { position: relative; padding: 40px 30px; }
.rcp-box { position: relative; z-index: 2; height: 90px; padding: 14px 18px; border-radius: 14px 14px 6px 6px; background: linear-gradient(#5A5550, #3A3632); color: #CFC4B0; font: 700 11px var(--k-text); letter-spacing: .2em; box-shadow: 0 10px 20px rgba(0,0,0,.5); }
.rcp-led { display: inline-block; width: 8px; height: 8px; margin-right: 8px; border-radius: 50%; background: #5CFF7A; box-shadow: 0 0 6px #5CFF7A; } .rcp-slot { position: absolute; left: 30px; right: 30px; bottom: 14px; height: 6px; border-radius: 3px; background: #111; }
.rcp-slip { position: relative; z-index: 1; margin: -10px 44px 0; padding: 22px 16px 16px; background: #FBFAF5; color: #2B2B2B; font: 13px/1.45 "Courier New", monospace; box-shadow: 0 10px 20px rgba(0,0,0,.4); animation: rcp-print 1.1s steps(14) both; transform-origin: top; }
@keyframes rcp-print { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
.rcp-slip pre { margin: 0 0 10px; font: inherit; white-space: pre-wrap; } .rcp-slip button { display: block; width: 100%; padding: 5px 0; font: 13px "Courier New", monospace; color: #2B2B2B; text-align: left; } .rcp-slip button:hover { background: #EFEDE3; }
.rcp-slip button.p { margin-bottom: 6px; padding: 10px 0; text-align: center; background: #2B2B2B; color: #FBFAF5; font-weight: 700; } .rcp-tear { margin-top: 8px; color: #888 !important; text-align: center !important; border-top: 1px dashed #888 !important; padding-top: 8px !important; }
`;

// CHANNELS — Steam as a cable TV guide. Each collection is a channel, each game a programme whose length is its
// playtime; flip channels with the remote, preview on the TV set, and tune in to play.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, gameCommands, useIslands, useSelectedGame } from './common';

const width = (g: Game) => Math.round(120 + Math.min(360, Math.log10(1 + g.minutes) * 95));

export function Channels() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [ch, setCh] = useState(0);
	const chans = islands;
	const cur = chans[Math.min(ch, chans.length - 1)];
	const preview = sel ?? cur?.games[0] ?? null;
	const play = preview ? gameCommands(preview)[0] : null;
	const slots = useMemo(() => { const h = new Date().getHours(); return Array.from({ length: 8 }, (_, i) => `${String((h + Math.floor(i / 2)) % 24).padStart(2, '0')}:${i % 2 ? '30' : '00'}`); }, []);
	return (
		<AltPage className="tv" brand={<><b>TV</b>Guide</>}>
			<div className="tv-room">
				<div className="tv-upper">
					<div className="tv-set">
						<div className="tv-glass" key={preview?.appid}>{preview && <Art g={preview} kind="hero" />}<i className="tv-lines" /><span className="tv-osd">CH {String(ch + 1).padStart(2, '0')} · {cur?.name}</span></div>
						<div className="tv-knobs"><i /><i /><span>KESTREL</span></div>
					</div>
					<div className="tv-now">
						{preview && <>
							<em>{sel ? 'Selected programme' : 'On now'}</em>
							<h2>{preview.name}</h2>
							<p>Running time {formatPlaytime(preview.minutes)} · {preview.lastPlayed ? `last aired ${formatAgo(preview.lastPlayed).toLowerCase()}` : 'never aired'} · {preview.installed ? 'available' : 'not recorded (install)'}</p>
							<button className="tv-tune" onClick={play!.run}>{preview.installed ? '● Tune in (play)' : '⏺ Record (install)'}</button>
							<Actions g={preview} className="tv-actions" />
						</>}
					</div>
					<div className="tv-remote">
						<button onClick={() => { setCh((ch + 1) % chans.length); select(null); }}>CH ▲</button>
						<b>{String(ch + 1).padStart(2, '0')}</b>
						<button onClick={() => { setCh((ch - 1 + chans.length) % chans.length); select(null); }}>CH ▼</button>
						<button className="pwr" onClick={() => select(null)}>GUIDE</button>
					</div>
				</div>
				<div className="tv-guide">
					<div className="tv-times"><span className="tv-chcol">Channel</span>{slots.map((s) => <span key={s}>{s}</span>)}</div>
					{chans.map((c, i) => (
						<div key={c.id} className={'tv-row' + (i === ch ? ' on' : '')}>
							<button className="tv-chcol" onClick={() => { setCh(i); select(null); }}><b>{String(i + 1).padStart(2, '0')}</b>{c.name}</button>
							<div className="tv-progs">
								{c.games.map((g) => (
									<button key={g.appid} data-appid={g.appid} className={'tv-prog' + (sel?.appid === g.appid ? ' sel' : '') + (g.installed ? '' : ' off')} style={{ width: width(g) }} onClick={() => { setCh(i); select(g.appid); }}>
										<b>{g.name}</b><span>{g.minutes ? formatPlaytime(g.minutes) : 'Premiere'}</span>
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</AltPage>
	);
}

export const channelsCss = `
html.kestrel[data-ui="channels"] { --k-ink: #0A1548; --k-s1: #13206A; --k-s2: #1A2B85; --k-s3: #2338A0; --k-s4: #2E46B8; --k-line: rgba(180,200,255,.15); --k-line-2: rgba(180,200,255,.3);
	--k-fg: #FFFFFF; --k-fg-2: #C9D4FF; --k-fg-3: #8E9DE0; --k-accent: #FFE14A; --k-accent-2: #FFF09A; --k-on-accent: #1A1400; --k-a10: rgba(255,225,74,.1); --k-a20: rgba(255,225,74,.2); --k-a40: rgba(255,225,74,.4); }
.tv-brand { font: 900 italic 20px "Arial Black", sans-serif; color: #FFE14A; text-shadow: 2px 2px 0 #C2185B; }
.tv-brand b { margin-right: 4px; padding: 0 6px; background: #C2185B; color: #fff; text-shadow: none; }
.tv-stage { background: #0A1548; }
.tv-room { position: absolute; inset: 0; display: flex; flex-direction: column; background: linear-gradient(180deg, #13206A, #0A1548 40%); }
.tv-upper { display: grid; grid-template-columns: 420px minmax(0, 1fr) 110px; gap: 26px; padding: 20px 26px; }
.tv-set { padding: 16px 16px 10px; border-radius: 22px; background: linear-gradient(180deg, #4A3A2A, #2E2318); box-shadow: 0 20px 30px -14px #000, inset 0 2px 0 rgba(255,255,255,.15); }
.tv-glass { position: relative; aspect-ratio: 4/3; border-radius: 26px / 30px; overflow: hidden; background: #000; box-shadow: inset 0 0 40px #000; animation: tv-on 600ms ease-out both; }
@keyframes tv-on { 0% { filter: brightness(4) contrast(.5); transform: scaleY(.02); } 40% { transform: scaleY(1); } 100% { filter: none; } }
.tv-glass img, .tv-glass .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(1.3) contrast(1.1); }
.tv-lines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.3) 0 2px, transparent 2px 4px), radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.6)); }
.tv-osd { position: absolute; left: 14px; top: 12px; font: 800 18px "Cascadia Mono", monospace; color: #4CFF6A; text-shadow: 0 0 6px #4CFF6A, 2px 2px 0 #000; }
.tv-knobs { display: flex; align-items: center; gap: 10px; padding: 10px 6px 0; }
.tv-knobs i { width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #CFC6B6, #6E6450); }
.tv-knobs span { margin-left: auto; font: 800 11px var(--k-text); letter-spacing: .3em; color: #B8A88C; }
.tv-now { align-self: center; }
.tv-now em { font: 800 12px var(--k-text); font-style: normal; text-transform: uppercase; letter-spacing: .14em; color: #FFE14A; }
.tv-now h2 { margin: 6px 0 8px; font: 900 34px/1.05 "Arial Black", sans-serif; color: #fff; }
.tv-now p { margin: 0 0 16px; font: 15px var(--k-text); color: #C9D4FF; }
.tv-tune { padding: 12px 22px; border-radius: 8px; background: #FFE14A !important; color: #1A1400 !important; font: 900 16px "Arial Black", sans-serif !important; box-shadow: 4px 4px 0 #C2185B; transition: transform .2s; }
.tv-tune:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #C2185B; }
.tv-actions { margin-top: 10px; display: flex; flex-wrap: wrap; }
.tv-remote { align-self: center; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 10px; border-radius: 40px; background: linear-gradient(180deg, #2A2A2E, #141416); box-shadow: 0 16px 24px -10px #000; }
.tv-remote button { width: 70px; padding: 8px 0; border-radius: 10px; background: #3A3A40 !important; color: #fff !important; font: 800 12px var(--k-text) !important; }
.tv-remote button:hover { background: #55555E !important; }
.tv-remote b { font: 800 20px "Cascadia Mono", monospace; color: #FF5252; text-shadow: 0 0 8px #FF5252; }
.tv-remote .pwr { background: #C2185B !important; }
.tv-guide { flex: 1; min-height: 0; overflow: auto; margin: 0 26px 18px; border-radius: 8px; background: #0A1548; box-shadow: inset 0 0 0 2px #2E46B8; }
.tv-times { position: sticky; top: 0; z-index: 2; display: flex; background: #2E46B8; font: 800 13px var(--k-text); color: #FFE14A; }
.tv-times span { flex: none; width: 240px; padding: 8px 12px; border-left: 1px solid #13206A; }
.tv-chcol { position: sticky; left: 0; z-index: 1; flex: none; width: 210px !important; display: flex; align-items: center; gap: 10px; padding: 0 12px; background: #13206A !important; text-align: left; font: 700 13.5px var(--k-text) !important; color: #fff !important; border-right: 2px solid #2E46B8; }
.tv-chcol b { font: 800 16px "Cascadia Mono", monospace; color: #FFE14A; }
.tv-row { display: flex; border-top: 1px solid #13206A; min-height: 58px; }
.tv-row.on .tv-chcol { background: #FFE14A !important; color: #1A1400 !important; } .tv-row.on .tv-chcol b { color: #C2185B; }
.tv-progs { display: flex; }
.tv-prog { flex: none; display: flex; flex-direction: column; justify-content: center; padding: 6px 12px; border-left: 1px solid #13206A; text-align: left; background: #1A2B85; transition: background-color .15s; overflow: hidden; }
.tv-prog:nth-child(odd) { background: #2338A0; }
.tv-prog b { font: 700 13.5px var(--k-text); color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tv-prog span { font: 12px var(--k-text); color: #C9D4FF; }
.tv-prog.off b { color: #8E9DE0; }
.tv-prog:hover { background: #3A55D0 !important; }
.tv-prog.sel { background: #FFE14A !important; } .tv-prog.sel b, .tv-prog.sel span { color: #1A1400; }
`;

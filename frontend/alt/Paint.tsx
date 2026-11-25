// PAINT — a paint program. Open any game's cover and draw on it: brush, marker and eraser, a colour palette and
// sizes. The file list on the right is a collection; "Run" in the menu plays the game. Doodles last until you switch.
import { useEffect, useRef, useState, type PointerEvent as PE } from 'react';
import { formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const COLORS = ['#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4', '#FFFFFF', '#C3C3C3', '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7'];
type Tool = 'brush' | 'marker' | 'eraser';

export function Paint() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const cur = sel ?? b.games[0] ?? null;
	const cv = useRef<HTMLCanvasElement>(null);
	const last = useRef<{ x: number; y: number } | null>(null);
	const [tool, setTool] = useState<Tool>('brush');
	const [color, setColor] = useState('#ED1C24');
	const [size, setSize] = useState(6);
	const [pos, setPos] = useState('');
	useEffect(() => { const c = cv.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); }, [cur?.appid]);
	const at = (e: PE) => { const r = cv.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 600, y: ((e.clientY - r.top) / r.height) * 900 }; };
	const draw = (e: PE) => {
		const p = at(e); setPos(`${Math.round(p.x)}, ${Math.round(p.y)}px`);
		if (!(e.buttons & 1) || !last.current) return;
		const x = cv.current!.getContext('2d')!;
		x.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
		x.globalAlpha = tool === 'marker' ? 0.35 : 1; x.strokeStyle = color; x.lineWidth = tool === 'marker' ? size * 3 : size; x.lineCap = 'round'; x.lineJoin = 'round';
		x.beginPath(); x.moveTo(last.current.x, last.current.y); x.lineTo(p.x, p.y); x.stroke(); last.current = p;
	};
	return (
		<AltPage className="pnt" brand={<><span className="pnt-logo">🖌</span>Paint</>}>
			<div className="pnt-app">
				<div className="pnt-menu"><span>File</span><span>Edit</span><span>View</span><span>Image</span>{cur && <PlayBtn g={cur} className="pnt-run" label={['Run ▶', 'Install ⬇']} />}<button onClick={() => { const c = cv.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); }}>Clear</button></div>
				<div className="pnt-ribbon">
					<div className="pnt-grp"><span>Tools</span><div>{(['brush', 'marker', 'eraser'] as Tool[]).map((t) => <button key={t} className={tool === t ? 'on' : ''} onClick={() => setTool(t)}>{t === 'brush' ? '🖌' : t === 'marker' ? '🖍' : '⌫'}<em>{t}</em></button>)}</div></div>
					<div className="pnt-grp"><span>Size</span><div>{[2, 6, 12, 24].map((s) => <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)}><i style={{ width: s, height: s }} /></button>)}</div></div>
					<div className="pnt-grp"><span>Colours</span><div className="pnt-cols"><b style={{ background: color }} />{COLORS.map((c) => <button key={c} style={{ background: c }} className={color === c ? 'on' : ''} onClick={() => setColor(c)} />)}</div></div>
				</div>
				<section className="pnt-work">
					{cur && <div className="pnt-sheet" key={cur.appid}><Art g={cur} kind="capsule" /><canvas ref={cv} width={600} height={900} onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); last.current = at(e); draw({ ...e, buttons: 1 } as PE); }} onPointerMove={draw} onPointerUp={() => (last.current = null)} /></div>}
				</section>
				<aside className="pnt-files">
					<h5>Open</h5>
					<select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
					<div className="pnt-list">{b.games.slice(0, 150).map((g) => <button key={g.appid} data-appid={g.appid} className={cur?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name.replace(/[^\w]+/g, '_').slice(0, 24)}.png</span></button>)}</div>
					{cur && <div className="pnt-info"><b>{cur.name}</b><p>{formatPlaytime(cur.minutes)} played</p><Actions g={cur} className="pnt-act" /></div>}
				</aside>
				<footer className="pnt-status"><span>{pos || '—'}</span><span>600 × 900px</span><span>{cur?.name}</span></footer>
			</div>
		</AltPage>
	);
}

export const paintCss = tok('paint', { bg: '#C9D4E3', s1: '#F5F6F7', s2: '#E9ECEF', s3: '#D3D8DE', fg: '#1F1F1F', fg2: '#3F3F3F', fg3: '#707070', acc: '#2B7BD8', on: '#fff', top: '#F5F6F7', font: '"Segoe UI", system-ui, sans-serif' }) + `
.pnt-brand { display: flex; gap: 8px; align-items: center; font: 600 15px var(--k-text); color: #1F1F1F; }
.pnt-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 260px; grid-template-rows: 30px 96px minmax(0, 1fr) 26px; font: 12px var(--k-text); color: #1F1F1F; }
.pnt-menu { grid-column: 1 / -1; display: flex; gap: 2px; align-items: center; padding: 0 8px; background: #F5F6F7; } .pnt-menu span, .pnt-menu button { padding: 4px 10px; border-radius: 4px; font: 12px var(--k-text); color: #1F1F1F; } .pnt-menu span:hover, .pnt-menu button:hover { background: #E3E7EC; }
.pnt-run { margin-left: auto; background: #2B7BD8 !important; color: #fff !important; font-weight: 600 !important; }
.pnt-ribbon { grid-column: 1 / -1; display: flex; gap: 0; padding: 6px 8px; background: #F9FAFB; border-bottom: 1px solid #D3D8DE; }
.pnt-grp { display: grid; grid-template-rows: 1fr auto; padding: 0 14px; border-right: 1px solid #E3E7EC; } .pnt-grp > span { text-align: center; font-size: 11px; color: #707070; } .pnt-grp > div { display: flex; gap: 4px; align-items: center; }
.pnt-grp button { display: grid; justify-items: center; place-content: center; min-width: 44px; height: 54px; border-radius: 4px; font-size: 20px; } .pnt-grp button em { font: 11px var(--k-text); font-style: normal; text-transform: capitalize; } .pnt-grp button:hover { background: #E8F1FB; } .pnt-grp button.on { background: #CCE4F7; box-shadow: inset 0 0 0 1px #2B7BD8; }
.pnt-grp button i { display: block; border-radius: 50%; background: #1F1F1F; }
.pnt-cols { display: grid !important; grid-template-columns: 44px repeat(10, 20px); grid-template-rows: 20px 20px; gap: 3px !important; } .pnt-cols b { grid-row: 1 / 3; width: 40px; height: 43px; border-radius: 4px; box-shadow: inset 0 0 0 1px #aaa; }
.pnt-cols button { min-width: 0 !important; width: 20px; height: 20px !important; border-radius: 50% !important; box-shadow: inset 0 0 0 1px rgba(0,0,0,.25); } .pnt-cols button.on { box-shadow: 0 0 0 2px #2B7BD8 !important; }
.pnt-work { overflow: auto; display: grid; place-items: center; padding: 20px; background: #C9D4E3; }
.pnt-sheet { position: relative; height: min(100%, 720px); aspect-ratio: 2/3; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,.25); animation: k-fade .25s both; } .pnt-sheet img, .pnt-sheet .alt-noart { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pnt-sheet canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; touch-action: none; }
.pnt-files { display: flex; flex-direction: column; min-height: 0; padding: 10px; background: #F5F6F7; border-left: 1px solid #D3D8DE; } .pnt-files h5 { margin: 0 0 6px; font: 600 12px var(--k-text); } .pnt-files select { height: 26px; margin-bottom: 8px; }
.pnt-list { flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; align-content: start; } .pnt-list button { display: grid; gap: 2px; padding: 3px; border-radius: 3px; } .pnt-list button.on { background: #CCE4F7; }
.pnt-list img, .pnt-list .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; font-size: 8px; } .pnt-list span { font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pnt-info { padding-top: 8px; border-top: 1px solid #D3D8DE; } .pnt-info p { margin: 2px 0 4px; color: #707070; } .pnt-act button { padding: 5px 8px !important; font-size: 12px !important; }
.pnt-status { grid-column: 1 / -1; display: flex; gap: 30px; align-items: center; padding: 0 12px; background: #F0F0F0; border-top: 1px solid #D3D8DE; color: #3F3F3F; }
`;

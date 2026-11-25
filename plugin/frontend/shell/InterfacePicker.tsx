// The interface picker: one dedicated place to switch between Kestrel and all its alternative interfaces. Opened by
// the grid button in every top strip, or Ctrl+I. It keeps its own neutral look whatever interface is showing.
// Search, groups, recently used, a surprise pick; arrow keys move, Enter switches, Esc closes.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import { switchInterface } from '../state/nav';
import { CATALOG, GROUPS, groupOf, type InterfaceInfo } from '../alt/catalog';
import { mainWindow } from '../steam/env';

const RECENT = 'kestrel.recentUI';
const loadRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch { return []; } };
const COLS = 4;

/** The button every top strip carries. */
export function InterfaceButton() {
	const open = useKestrel((s) => s.pickerOpen);
	const ui = useKestrel((s) => s.settings.ui);
	const name = CATALOG.find((c) => c.id === ui)?.name ?? 'Kestrel';
	return (
		<button className="k-ui-btn" aria-label="Choose interface" aria-expanded={open} title="Choose interface (Ctrl+I)" onClick={() => setState((s) => ({ pickerOpen: !s.pickerOpen, commandOpen: false, panelOpen: false }))}>
			<Icon name="grid" size={16} /><span>{name}</span>
		</button>
	);
}

export function InterfacePicker() {
	const open = useKestrel((s) => s.pickerOpen);
	const ui = useKestrel((s) => s.settings.ui);
	const [q, setQ] = useState('');
	const [group, setGroup] = useState<string>('All');
	const [sel, setSel] = useState(0);
	const [recent, setRecent] = useState<string[]>(loadRecent);
	const input = useRef<HTMLInputElement>(null);
	const grid = useRef<HTMLDivElement>(null);
	useEffect(() => { if (open) { setQ(''); setRecent(loadRecent()); setTimeout(() => input.current?.focus(), 30); } }, [open]);
	const list = useMemo(() => {
		const t = q.trim().toLowerCase();
		let l: InterfaceInfo[] = CATALOG;
		if (t) l = l.filter((c) => (c.name + ' ' + c.blurb + ' ' + c.id + ' ' + groupOf(c.id)).toLowerCase().includes(t));
		else if (group === 'Recent') l = recent.map((id) => CATALOG.find((c) => c.id === id)).filter(Boolean) as InterfaceInfo[];
		else if (group !== 'All') l = l.filter((c) => groupOf(c.id) === group);
		return l;
	}, [q, group, recent]);
	useEffect(() => { const i = list.findIndex((c) => c.id === ui); setSel(i >= 0 ? i : 0); }, [list.length, group, q]);
	// scroll only for keyboard moves: scrolling on hover moves another card under the pointer, which would select it
	// and scroll again, a loop that locks Steam up
	const byKey = useRef(false);
	useEffect(() => { if (!byKey.current) return; byKey.current = false; grid.current?.querySelector('.k-pk-card.sel')?.scrollIntoView({ block: 'nearest' }); }, [sel]);
	const close = () => setState({ pickerOpen: false });
	const pick = (id: string) => {
		const r = [id, ...recent.filter((x) => x !== id)].slice(0, 8);
		try { localStorage.setItem(RECENT, JSON.stringify(r)); } catch { /* storage off */ }
		setRecent(r); switchInterface(id);
	};
	useEffect(() => {
		if (!open) return;
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => {
			const move = (d: number) => { byKey.current = true; setSel((s) => Math.max(0, Math.min(list.length - 1, s + d))); };
			if (e.key === 'Escape') close(); else if (e.key === 'Enter') { const c = list[sel]; if (c) pick(c.id); }
			else if (e.key === 'ArrowRight') move(1); else if (e.key === 'ArrowLeft') move(-1); else if (e.key === 'ArrowDown') move(COLS); else if (e.key === 'ArrowUp') move(-COLS);
			else return;
			e.preventDefault(); e.stopPropagation();
		};
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [open, list, sel, recent]);
	if (!open) return null;
	const cur = CATALOG.find((c) => c.id === ui);
	const tabs = ['All', ...(recent.length ? ['Recent'] : []), ...GROUPS.map((g) => g.name)];
	const count = (t: string) => (t === 'All' ? CATALOG.length : t === 'Recent' ? recent.length : CATALOG.filter((c) => groupOf(c.id) === t).length);
	return (
		<>
			<div className="k-pk-scrim" onMouseDown={close} />
			<section className="k-pk" role="dialog" aria-label="Choose interface">
				<header className="k-pk-head">
					<div><h2>Interfaces</h2><span>Now using <b>{cur?.name ?? 'Kestrel'}</b> · {CATALOG.length} to choose from</span></div>
					<label className="k-pk-find"><Icon name="search" size={15} /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) e.stopPropagation(); }} placeholder="Find an interface: “music”, “retro”, “map”…" spellCheck={false} /></label>
					<button className="k-pk-rand" onClick={() => { const others = CATALOG.filter((c) => c.id !== ui); pick(others[Math.floor(Math.random() * others.length)].id); }}><Icon name="spark" size={15} />Surprise me</button>
					<button className="k-pk-x" aria-label="Close" onClick={close}><Icon name="close" size={18} /></button>
				</header>
				<div className="k-pk-body">
					<nav className="k-pk-groups">{tabs.map((t) => <button key={t} className={!q && group === t ? 'on' : ''} onClick={() => { setQ(''); setGroup(t); }}>{t}<em>{count(t)}</em></button>)}</nav>
					<div className="k-pk-grid" ref={grid}>
						{list.map((c, i) => (
							<button key={c.id} className={'k-pk-card' + (i === sel ? ' sel' : '') + (c.id === ui ? ' cur' : '')} onMouseEnter={() => setSel(i)} onClick={() => pick(c.id)} title={c.blurb}>
								<span className="k-pk-thumb" style={{ background: c.swatch[0] }}>
									<i className="bar" style={{ background: `color-mix(in srgb, ${c.swatch[0]} 70%, ${c.swatch[1]})` }} />
									<i className="a" style={{ background: c.swatch[1] }} /><i className="b" style={{ background: c.swatch[1] }} /><i className="c" style={{ background: c.swatch[1] }} />
									{c.id === ui && <em className="k-pk-now">In use</em>}
								</span>
								<b>{c.name}</b><span className="k-pk-bl">{c.blurb}</span><span className="k-pk-grp">{groupOf(c.id)}</span>
							</button>
						))}
						{!list.length && <p className="k-pk-none">No interface matches “{q}”.</p>}
					</div>
				</div>
				<footer className="k-pk-foot"><span><kbd>←↑↓→</kbd> move</span><span><kbd>Enter</kbd> switch</span><span><kbd>Esc</kbd> close</span><span><kbd>Ctrl I</kbd> open from anywhere</span></footer>
			</section>
		</>
	);
}

// Fixed, neutral styling: the picker looks the same over every interface.
export const pickerCss = `
.k-ui-btn { height: 34px; display: flex; align-items: center; gap: 7px; padding: 0 12px 0 10px; border-radius: 99px; flex: none; max-width: 190px;
	background: var(--k-s2); color: var(--k-fg) !important; font: 600 12.5px var(--k-text, "Segoe UI", sans-serif) !important; box-shadow: inset 0 0 0 1px var(--k-line-2); transition: background-color .15s; }
.k-ui-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .k-ui-btn:hover, .k-ui-btn[aria-expanded="true"] { background: var(--k-s3); }
.k-pk-scrim { position: fixed; inset: 0; z-index: 60; pointer-events: auto; background: rgba(6,7,10,.72); }
.k-pk { position: fixed; left: 50%; top: 50%; z-index: 61; pointer-events: auto; -webkit-app-region: no-drag; width: min(1180px, calc(100vw - 40px)); height: min(780px, calc(100vh - 60px)); transform: translate(-50%, -50%);
	display: grid; grid-template-rows: auto minmax(0, 1fr) auto; border-radius: 20px; background: #12141A; color: #ECEEF3; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 40px 100px rgba(0,0,0,.6);
	font: 14px "Segoe UI Variable Text", "Segoe UI", sans-serif; animation: k-pk-in .28s cubic-bezier(.2,.8,.2,1) both; overflow: hidden; }
@keyframes k-pk-in { from { opacity: 0; transform: translate(-50%, -48%) scale(.97); } }
.k-pk button { font-family: inherit; color: inherit; }
.k-pk-head { display: flex; gap: 14px; align-items: center; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,.07); }
.k-pk-head h2 { margin: 0; font: 700 22px "Segoe UI Variable Display", "Segoe UI", sans-serif; } .k-pk-head span { font: 13px inherit; color: #9AA0AE; } .k-pk-head b { color: #ECEEF3; font-weight: 600; }
.k-pk-find { flex: 1; display: flex; gap: 10px; align-items: center; height: 40px; margin-left: 20px; padding: 0 14px; border-radius: 12px; background: #1C1F27; color: #7D8392; box-shadow: inset 0 0 0 1px rgba(255,255,255,.06); }
.k-pk-find:focus-within { box-shadow: inset 0 0 0 1.5px #F0A23B; } .k-pk-find input { flex: 1; border: 0; outline: none; background: none; color: #ECEEF3; font: 14px "Segoe UI", sans-serif; }
.k-pk-rand { display: flex; gap: 8px; align-items: center; height: 40px; padding: 0 14px; border-radius: 12px; background: #1C1F27; font: 600 13px "Segoe UI", sans-serif; } .k-pk-rand:hover { background: #262A34; }
.k-pk-x { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; color: #9AA0AE; } .k-pk-x:hover { background: #262A34; color: #fff; }
.k-pk-body { display: grid; grid-template-columns: 200px minmax(0, 1fr); min-height: 0; }
.k-pk-groups { overflow-y: auto; padding: 12px 10px; border-right: 1px solid rgba(255,255,255,.07); }
.k-pk-groups button { display: flex; justify-content: space-between; width: 100%; padding: 9px 12px; border-radius: 10px; font: 600 13.5px "Segoe UI", sans-serif; color: #B7BCC8; text-align: left; } .k-pk-groups button:hover { background: #1C1F27; }
.k-pk-groups button.on { background: #F0A23B; color: #1A1206; } .k-pk-groups em { font-style: normal; opacity: .6; font-weight: 400; }
.k-pk-grid { overflow-y: auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; padding: 16px 18px 24px; align-content: start; }
.k-pk-card { display: grid; gap: 3px; padding: 8px 8px 10px; border-radius: 14px; text-align: left; transition: background-color .12s; } .k-pk-card.sel { background: #1C1F27; box-shadow: inset 0 0 0 1.5px rgba(240,162,59,.7); }
.k-pk-thumb { position: relative; display: block; aspect-ratio: 16/9; margin-bottom: 6px; border-radius: 9px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 6px 14px -8px rgba(0,0,0,.6); }
.k-pk-thumb i { position: absolute; border-radius: 3px; } .k-pk-thumb .bar { left: 0; right: 0; top: 0; height: 14%; border-radius: 0; } .k-pk-thumb .a { left: 8%; top: 26%; width: 38%; height: 56%; opacity: .95; } .k-pk-thumb .b { left: 52%; top: 26%; width: 40%; height: 24%; opacity: .6; } .k-pk-thumb .c { left: 52%; top: 58%; width: 26%; height: 24%; opacity: .35; }
.k-pk-now { position: absolute; right: 6px; bottom: 6px; padding: 2px 8px; border-radius: 99px; background: #F0A23B; color: #1A1206; font: 700 10.5px "Segoe UI", sans-serif; font-style: normal; }
.k-pk-card b { font: 650 14px "Segoe UI", sans-serif; } .k-pk-card.cur b { color: #F0A23B; } .k-pk-bl { font: 12.5px/1.35 "Segoe UI", sans-serif; color: #9AA0AE; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } .k-pk-grp { font: 600 10.5px "Segoe UI", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #6B7180; }
.k-pk-none { grid-column: 1 / -1; color: #9AA0AE; text-align: center; margin-top: 60px; }
.k-pk-foot { display: flex; gap: 22px; padding: 10px 20px; border-top: 1px solid rgba(255,255,255,.07); font: 12px "Segoe UI", sans-serif; color: #7D8392; } .k-pk-foot kbd { margin-right: 6px; padding: 2px 6px; border-radius: 5px; background: #1C1F27; font: 600 11px "Segoe UI", sans-serif; color: #B7BCC8; }
`;

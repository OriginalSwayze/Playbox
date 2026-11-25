// Kestrel settings: a sheet that rises from the bottom of the window. Changes apply immediately.
import { useEffect } from 'react';
import { Icon, Mark } from '../ui/icons';
import { setState, useKestrel, type Settings } from '../state/store';
import { updateSettings } from '../state/settings';
import { mainWindow } from '../steam/env';

type Opt<K extends keyof Settings> = { key: K; label: string; hint: string; options: { value: Settings[K]; label: string }[] };

const ROWS: (Opt<'ui'> | Opt<'motion'> | Opt<'intro'> | Opt<'tilt'> | Opt<'rotate'> | Opt<'start'>)[] = [
	{ key: 'ui', label: 'Interface', hint: 'Kestrel, a map of your library, a 3D games shelf, or a command line.', options: [{ value: 'kestrel', label: 'Kestrel' }, { value: 'atlas', label: 'Atlas' }, { value: 'shelf', label: 'Shelf' }, { value: 'terminal', label: 'Terminal' }] },
	{ key: 'motion', label: 'Motion', hint: 'Auto follows Windows. Reduced keeps only quick fades.', options: [{ value: 'auto', label: 'Auto' }, { value: 'full', label: 'Full' }, { value: 'reduced', label: 'Reduced' }] },
	{ key: 'intro', label: 'Opening animation', hint: 'The Kestrel mark when Steam starts.', options: [{ value: true, label: 'On' }, { value: false, label: 'Off' }] },
	{ key: 'tilt', label: 'Cover tilt', hint: 'Covers lean towards the pointer and catch the light.', options: [{ value: true, label: 'On' }, { value: false, label: 'Off' }] },
	{ key: 'rotate', label: 'Spotlight rotation', hint: 'The home spotlight moves through your recent games on its own.', options: [{ value: false, label: 'Off' }, { value: true, label: 'Every 12 s' }] },
	{ key: 'start', label: 'Open Kestrel on', hint: 'Where Kestrel starts when Steam opens.', options: [{ value: 'home', label: 'Home' }, { value: 'library', label: 'Library' }] },
];

export function SettingsSheet() {
	const open = useKestrel((s) => s.settingsOpen);
	const settings = useKestrel((s) => s.settings);
	useEffect(() => {
		if (!open) return;
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setState({ settingsOpen: false }); } };
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	}, [open]);
	if (!open) return null;
	const close = () => setState({ settingsOpen: false });
	return (
		<>
			<div className="k-scrim" onMouseDown={close} />
			<section className="k-sheet" role="dialog" aria-label="Kestrel settings">
				<header>
					<Mark size={30} />
					<div><h2>Kestrel</h2><span>Settings for this interface. Steam's own settings are in the command bar.</span></div>
					<button className="k-icon-btn" aria-label="Close" onClick={close}><Icon name="close" size={18} /></button>
				</header>
				<div className="k-sheet-rows">
					{ROWS.map((r, i) => (
						<div className="k-sheet-row" key={r.key} style={{ animationDelay: `${60 + i * 40}ms` }}>
							<div className="tx"><b>{r.label}</b><span>{r.hint}</span></div>
							<div className="k-seg">
								{r.options.map((o) => (
									<button key={String(o.value)} className={settings[r.key] === o.value ? 'on' : ''} onClick={() => updateSettings({ [r.key]: o.value } as Partial<Settings>)}>{o.label}</button>
								))}
							</div>
						</div>
					))}
				</div>
				<footer>Kestrel 1.0 · A Millennium plugin. Ctrl+Shift+K switches to Steam's own interface and back. Turn it off in Millennium's plugin list to return to Steam's normal interface.</footer>
			</section>
		</>
	);
}

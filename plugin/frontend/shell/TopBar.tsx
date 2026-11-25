import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, Mark } from '../ui/icons';
import { setState, useKestrel, type Space } from '../state/store';
import { back, canGoBack, goSpace } from '../state/nav';
import { mainWindow } from '../steam/env';
import { accountInfo, openAccountMenu, openNotifications, openRootMenu, unreadNotifications } from '../steam/native';

const SPACES: { id: Space; label: string; icon: string }[] = [
	{ id: 'play', label: 'Play', icon: 'play' },
	{ id: 'discover', label: 'Discover', icon: 'discover' },
	{ id: 'social', label: 'Social', icon: 'social' },
	{ id: 'you', label: 'You', icon: 'you' },
];

function Switcher() {
	const space = useKestrel((s) => s.space);
	const ref = useRef<HTMLDivElement>(null);
	const [pill, setPill] = useState({ x: 0, w: 0 });
	useLayoutEffect(() => {
		const el = ref.current?.querySelector<HTMLElement>(`button[data-space="${space}"]`);
		if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
	}, [space]);
	return (
		<div className="k-switch" ref={ref} role="tablist" aria-label="Spaces">
			<span className="k-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w, left: 0 }} />
			{SPACES.map((s) => (
				<button key={s.id} data-space={s.id} role="tab" aria-selected={space === s.id} className={space === s.id ? 'on' : ''} onClick={() => goSpace(s.id)}>
					<Icon name={s.icon} size={16} />
					{s.label}
				</button>
			))}
		</div>
	);
}

export function ActivityButton() {
	const dl = useKestrel((s) => s.downloads);
	const open = useKestrel((s) => s.panelOpen);
	const pct = dl.active ? dl.active.percent : 0;
	const C = 2 * Math.PI * 13;
	return (
		<button className="k-icon-btn k-activity-btn" aria-label="Activity" aria-expanded={open} onClick={() => setState((s) => ({ panelOpen: !s.panelOpen, commandOpen: false }))}>
			{dl.active && (
				<svg className="k-ring" viewBox="0 0 30 30">
					<circle cx="15" cy="15" r="13" fill="none" stroke="var(--k-s4)" strokeWidth="2" />
					<circle cx="15" cy="15" r="13" fill="none" stroke="var(--k-accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 700ms var(--k-out)' }} />
				</svg>
			)}
			<Icon name="download" size={18} />
			{!dl.active && dl.queue.length > 0 && <span className="k-dot" />}
		</button>
	);
}

export function WindowControls() {
	const win = () => mainWindow()?.BrowserWindow.SteamClient?.Window;
	return (
		<div className="k-win">
			<button aria-label="Minimise" onClick={() => win()?.Minimize()}><Icon name="minimize" size={16} /></button>
			<button aria-label="Maximise" onClick={() => win()?.ToggleMaximize()}><Icon name="maximize" size={14} /></button>
			<button className="x" aria-label="Close" onClick={() => win()?.Close()}><Icon name="close" size={16} /></button>
		</div>
	);
}

/** Steam's notifications and account menus, kept one click away. */
export function AccountCluster() {
	const [info, setInfo] = useState(() => ({ ...accountInfo(), unread: unreadNotifications() }));
	useEffect(() => {
		const t = setInterval(() => setInfo({ ...accountInfo(), unread: unreadNotifications() }), 3000);
		return () => clearInterval(t);
	}, []);
	return (
		<>
			<button className="k-icon-btn k-bell" aria-label="Notifications" onClick={() => openNotifications()}>
				<Icon name="bell" size={18} />
				{info.unread > 0 && <span className="k-dot" />}
			</button>
			<button className="k-account" aria-label="Account menu" title={info.name} onClick={() => openAccountMenu()}>
				{info.avatar ? <img src={info.avatar} alt="" /> : <Icon name="you" size={18} />}
			</button>
		</>
	);
}

export function TopBar() {
	const canBack = useKestrel((s) => canGoBack(s));
	return (
		<header className="k-top">
			<button className="k-brand" title="Steam menu" onClick={() => openRootMenu('Steam')}><Mark /> Kestrel</button>
			<button className="k-icon-btn" aria-label="Back" disabled={!canBack} onClick={back}><Icon name="back" size={18} /></button>
			<Switcher />
			<div className="k-drag" />
			<button className="k-cmd-trigger" onClick={() => setState({ commandOpen: true, panelOpen: false })}>
				<Icon name="search" size={16} />
				Search games, the store, friends and settings
				<kbd>Ctrl K</kbd>
			</button>
			<div className="k-drag" />
			<ActivityButton />
			<AccountCluster />
			<WindowControls />
		</header>
	);
}

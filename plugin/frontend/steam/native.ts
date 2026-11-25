// Steam's own controls that Kestrel keeps reachable: its menus, notifications, account menu and system
// actions. Menus are opened by clicking Steam's hidden buttons, so Steam builds and positions them itself.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { client, mainDocument } from './env';

const click = (sel: string): boolean => {
	const el = mainDocument()?.querySelector(sel) as HTMLElement | null;
	if (!el) return false;
	el.click();
	return true;
};

export type RootMenu = 'Steam' | 'View' | 'Friends' | 'Games' | 'Help';
const ROOT: RootMenu[] = ['Steam', 'View', 'Friends', 'Games', 'Help'];

/** Open one of Steam's top-level menus (it appears just under Kestrel's top bar). */
export function openRootMenu(name: RootMenu): boolean {
	const i = ROOT.indexOf(name) + 1;
	// the menu's inner element carries Steam's click handler (verified for all five menus)
	return click(`.RootMenuBar > :nth-child(${i}) > *`) || click(`.RootMenuBar > :nth-child(${i})`);
}
export const openNotifications = () => click('.TitleBarControls [class*="NotificationsButton"]') || click('.TitleBarControls [class*="Notification"]');
export const openAccountMenu = () => click('.TitleBarControls .AccountMenu');

/** The signed-in account's avatar and name, read from Steam's own (hidden) account button. */
export function accountInfo(): { avatar: string; name: string } {
	const doc = mainDocument();
	const img = doc?.querySelector('.TitleBarControls .AccountMenu img') as HTMLImageElement | null;
	const name = (doc?.querySelector('.TitleBarControls .AccountMenu') as HTMLElement | null)?.textContent?.trim() ?? '';
	return { avatar: img?.src ?? '', name };
}

/** Unread notification count, when Steam exposes it. */
export function unreadNotifications(): number {
	try {
		const ns: any = (window as any).notificationStore ?? (window as any).NotificationStore;
		const n = ns?.m_rgUnviewed?.length ?? ns?.UnviewedNotifications?.length ?? ns?.m_nUnreadCount;
		if (typeof n === 'number') return n;
	} catch { /* not available */ }
	// fall back to Steam's own badge on the hidden bell
	const badge = mainDocument()?.querySelector('.TitleBarControls [class*="NotificationsButton"] [class*="Count"], .TitleBarControls [class*="NotificationsButton"] [class*="Badge"]');
	return badge ? Number(badge.textContent) || 1 : 0;
}

const url = (u: string) => { try { client().URL.ExecuteSteamURL(u); } catch (e) { console.error('[Kestrel]', e); } };

export const system = {
	checkForUpdates: () => { try { client().Updates.CheckForUpdates(); } catch { url('steam://checkforupdates'); } },
	activateProduct: () => url('steam://open/activateproduct'),
	bigPicture: () => url('steam://open/bigpicture'),
	console: () => url('steam://open/console'),
	goOffline: () => { try { client().User.GoOffline(); } catch { openRootMenu('Steam'); } },
	exit: () => { try { client().User.StartShutdown(false); } catch { url('steam://exit'); } },
};

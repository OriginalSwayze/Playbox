// The game library as Kestrel sees it: a plain, sorted snapshot of Steam's appStore plus artwork and actions.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { client, mainWindow, stores } from './env';

export type Game = {
	appid: number;
	gameid: string;
	name: string;
	sortName: string;
	installed: boolean;
	status: string; // Steam's display status text for the local client ("" when idle)
	progress: number; // 0..100 while installing/updating
	minutes: number;
	minutes2w: number;
	lastPlayed: number; // unix seconds, 0 = never
	added: number; // unix seconds
	sizeOnDisk: number;
	metacritic: number;
	capsule: string; // vertical cover
	capsules: string[]; // the cover plus fallbacks, tried in order
	header: string; // landscape header
	icon: string;
};

const CDN = 'https://shared.steamstatic.com/store_item_assets/steam/apps';

function toGame(a: any): Game | null {
	if (!a || a.app_type !== 1 || a.visible_in_game_list === false) return null;
	const pcd = (a.per_client_data && a.per_client_data[0]) || {};
	const app = stores.app;
	let capsule = '';
	let icon = '';
	try { capsule = app.GetVerticalCapsuleURLForApp(a) || ''; } catch { /* fall through */ }
	try { icon = app.GetIconURLForApp(a) || ''; } catch { /* fall through */ }
	let cached = '';
	try { cached = app.GetCachedVerticalCapsuleURL?.(a)?.[0] || ''; } catch { /* fall through */ }
	const header = a.header_filename ? `${CDN}/${a.appid}/${a.header_filename}` : `${CDN}/${a.appid}/header.jpg`;
	return {
		appid: a.appid,
		gameid: String(a.m_gameid ?? a.appid),
		name: a.display_name || String(a.appid),
		sortName: (a.sort_as || a.display_name || '').toLowerCase(),
		installed: !!pcd.installed,
		status: pcd.display_status ? String(pcd.display_status) : '',
		progress: Number(pcd.status_percentage) || 0,
		minutes: a.minutes_playtime_forever || 0,
		minutes2w: a.minutes_playtime_last_two_weeks || 0,
		lastPlayed: a.rt_last_time_played || 0,
		added: a.rt_purchased_time || 0,
		sizeOnDisk: Number(a.size_on_disk) || 0,
		metacritic: a.metacritic_score || 0,
		capsule: capsule || `${CDN}/${a.appid}/library_600x900.jpg`,
		capsules: [capsule, cached, `${CDN}/${a.appid}/library_600x900.jpg`, `${CDN}/${a.appid}/library_600x900_2x.jpg`].filter((u, i, arr) => u && arr.indexOf(u) === i),
		header,
		icon,
	};
}

/** Every game the user owns or has added, deduplicated, alphabetical. */
export function snapshotLibrary(): Game[] {
	const all: any[] = stores.app?.allApps ?? [];
	const mine = stores.collections?.myGamesCollection?.allApps;
	const owned = new Set<number>((mine ?? []).map((x: any) => x.appid));
	const out: Game[] = [];
	for (const a of all) {
		if (owned.size && !owned.has(a.appid)) continue;
		const g = toGame(a);
		if (g) out.push(g);
	}
	return out.sort((x, y) => x.sortName.localeCompare(y.sortName));
}

export const byRecent = (gs: Game[]) => gs.filter((g) => g.lastPlayed > 0).sort((a, b) => b.lastPlayed - a.lastPlayed);

/** Hero (wide key art) and logo for a game. Asks Steam to load the details if it hasn't yet. */
export function artFor(appid: number): { hero: string; logo: string } {
	const d = stores.appDetails;
	let hero = '';
	let logo = '';
	try {
		const h = d?.GetHeroImagesForAppId?.(appid);
		hero = h?.rgHeroImages?.[0] ?? '';
		const l = d?.GetLogoImagesForAppId?.(appid);
		logo = l?.rgLogoImages?.[0] ?? '';
		if (!hero) d?.RequestAppDetails?.(appid);
	} catch { /* ignore */ }
	return { hero: hero || `${CDN}/${appid}/library_hero.jpg`, logo: logo || `${CDN}/${appid}/logo.png` };
}

/** Play, or start installing if it isn't installed. */
export function playOrInstall(g: Game) {
	const sc = client();
	try {
		if (g.installed) sc.Apps.RunGame(g.gameid, '', -1, 100);
		else sc.Installs.OpenInstallWizard([g.appid]);
	} catch (e) {
		console.error('[Kestrel] launch failed, opening the game page instead', e);
		mainWindow()?.Navigate(`/library/app/${g.appid}`);
	}
}

export function formatPlaytime(min: number): string {
	if (min <= 0) return 'Not played';
	if (min < 60) return `${min} min`;
	const h = min / 60;
	return h < 10 ? `${h.toFixed(1)} h` : `${Math.round(h).toLocaleString()} h`;
}

export function formatAgo(unix: number): string {
	if (!unix) return 'Never played';
	const s = Date.now() / 1000 - unix;
	if (s < 3600) return 'Just now';
	if (s < 86400) return 'Today';
	if (s < 172800) return 'Yesterday';
	const ago = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
	if (s < 86400 * 7) return ago(Math.floor(s / 86400), 'day');
	if (s < 86400 * 30) return ago(Math.floor(s / (86400 * 7)), 'week');
	if (s < 86400 * 365) return ago(Math.max(1, Math.floor(s / (86400 * 30))), 'month');
	return ago(Math.floor(s / (86400 * 365)), 'year');
}

export function formatBytes(n: number): string {
	if (!n) return '';
	const u = ['B', 'KB', 'MB', 'GB', 'TB'];
	let i = 0;
	while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
	return `${n.toFixed(n < 10 && i > 2 ? 1 : 0)} ${u[i]}`;
}

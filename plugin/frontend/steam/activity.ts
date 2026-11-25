// Downloads and friends, read from Steam's stores and reduced to what the activity panel shows.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mainDocument, mainWindow, stores } from './env';

export type DownloadRow = { appid: number; name: string; active: boolean; paused: boolean; completed: boolean; queue: number; percent: number };
export type DownloadState = { active: DownloadRow | null; rate: number; eta: number; queue: DownloadRow[] };
export type Friend = { id: string; name: string; avatar: string; state: 'ingame' | 'online' | 'away' | 'offline'; game: string };

const nameOf = (appid: number): string => {
	try { return stores.app?.GetAppOverviewByAppID?.(appid)?.display_name ?? `App ${appid}`; } catch { return `App ${appid}`; }
};

function first<T>(m: any): T | null {
	if (!m) return null;
	if (typeof m.values === 'function') { for (const v of m.values()) return v as T; return null; }
	return (Array.isArray(m) ? m[0] : null) as T | null;
}

export function snapshotDownloads(): DownloadState {
	const ds = stores.downloads;
	const ov: any = first(ds?.m_DownloadOverview);
	const items: any[] = (first<any[]>(ds?.m_DownloadItems) ?? []) as any[];
	const rows: DownloadRow[] = items.map((it: any) => {
		const info = it.update_type_info?.[0];
		const total = Number(info?.total_bytes ?? 0);
		const done = Number(info?.downloaded_bytes ?? 0);
		return {
			appid: it.appid,
			name: nameOf(it.appid),
			active: !!it.active,
			paused: !!it.paused,
			completed: !!it.completed,
			queue: it.queue_index ?? -1,
			percent: total > 0 ? Math.min(100, (done / total) * 100) : 0,
		};
	});
	let active = rows.find((r) => r.active) ?? null;
	if (ov && ov.update_appid && ov.progress) {
		const p = ov.progress.find((x: any) => x.bytes_total > 0);
		const pct = p ? (Number(p.bytes_in_progress) / Number(p.bytes_total)) * 100 : active?.percent ?? 0;
		active = { ...(active ?? { appid: ov.update_appid, name: nameOf(ov.update_appid), active: true, paused: false, completed: false, queue: 0, percent: 0 }), percent: pct };
	}
	return {
		active,
		rate: Number(ov?.update_network_bytes_per_second ?? 0),
		eta: Number(ov?.progress?.find?.((x: any) => x.estimated_time_remaining_sec > 0)?.estimated_time_remaining_sec ?? -1),
		queue: rows.filter((r) => !r.completed && r !== active && r.appid !== active?.appid).sort((a, b) => a.queue - b.queue),
	};
}

export function snapshotFriends(): Friend[] {
	const list: any[] = stores.friends?.allFriends ?? [];
	const out: Friend[] = [];
	for (const f of list) {
		const p = f?.persona;
		if (!p) continue;
		const st = Number(p.m_ePersonaState ?? 0);
		const game = p.m_unGamePlayedAppID ? (f.current_game_name || nameOf(p.m_unGamePlayedAppID)) : '';
		const state: Friend['state'] = game ? 'ingame' : st === 1 ? 'online' : st >= 2 ? 'away' : 'offline';
		const hash = p.m_strAvatarHash && p.m_strAvatarHash !== '0000000000000000000000000000000000000000' ? p.m_strAvatarHash : 'fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb';
		out.push({ id: String(f.steamid64 ?? f.accountid), name: f.display_name || p.m_strPlayerName || 'Friend', avatar: `https://avatars.steamstatic.com/${hash}_medium.jpg`, state, game });
	}
	const rank = { ingame: 0, online: 1, away: 2, offline: 3 } as const;
	return out.sort((a, b) => rank[a.state] - rank[b.state] || a.name.localeCompare(b.name));
}

/** Click one of Steam's own (hidden) controls, so native behaviour such as menus and windows is kept. */
export function clickNative(selector: string): boolean {
	const el = mainDocument()?.querySelector(selector) as HTMLElement | null;
	if (!el) return false;
	el.click();
	return true;
}

export const openDownloadsPage = () => mainWindow()?.Navigate('/library/downloads');
export const openFriendsList = () => clickNative('.BottomBar .FriendsButton') || clickNative('[class*="FriendsButton"]');
export const openAddGame = () => clickNative('.BottomBar .AddGameButton');

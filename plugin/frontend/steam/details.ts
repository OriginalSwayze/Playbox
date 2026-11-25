// Everything the game page shows about one game, loaded from Steam's appDetailsStore and kept live.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { client, mainWindow, stores } from './env';

export type Achievement = { id: string; name: string; desc: string; image: string; achieved: boolean; unlocked: number; global: number; progress: number; hidden: boolean };
export type Shot = { handle: number; url: string; created: number; w: number; h: number };
export type Dlc = { appid: number; name: string; state: string; enabled: boolean };
export type News = { id: string; title: string; url: string; date: number; excerpt: string; feed: string };

export type Details = {
	ready: boolean;
	developer: string;
	publisher: string;
	description: string[]; // paragraphs, BBCode stripped
	disk: number;
	dlcDisk: number;
	cloud: string;
	buildUpdated: number;
	achievements: { total: number; achieved: number; list: Achievement[] };
	shots: Shot[];
	shotCount: number;
	dlc: Dlc[];
	platforms: string[];
};

const EMPTY: Details = { ready: false, developer: '', publisher: '', description: [], disk: 0, dlcDisk: 0, cloud: '', buildUpdated: 0, achievements: { total: 0, achieved: 0, list: [] }, shots: [], shotCount: 0, dlc: [], platforms: [] };

const CLOUD: Record<number, string> = { 1: 'Synced', 2: 'Syncing', 3: 'Up to date', 4: 'Conflict', 5: 'Unavailable', 6: 'Offline', 7: 'Pending', 8: 'Uploading', 9: 'Downloading' };

/** Steam descriptions are BBCode; keep the words, drop the markup. */
function paragraphs(bb: string): string[] {
	return bb
		.replace(/\[\/?(?:p|h\d|list|olist)\]/gi, '\n')
		.replace(/\[\*\]/g, '\n• ')
		.replace(/\[img[^\]]*\][^[]*\[\/img\]/gi, '')
		.replace(/\[[^\]]+\]/g, '')
		.replace(/<[^>]+>/g, '')
		.split(/\n+/)
		.map((s) => s.replace(/\s+/g, ' ').trim())
		.filter((s) => s.length > 1)
		.slice(0, 14);
}

function read(appid: number): Details {
	const ads = stores.appDetails;
	const d: any = ads?.GetAppDetails?.(appid);
	const data: any = ads?.GetAppData?.(appid);
	if (!d) return EMPTY;
	const a = d.achievements ?? {};
	const toA = (x: any, achieved: boolean): Achievement => ({
		id: x.strID, name: (x.strName || '').trim(), desc: x.strDescription || '', image: x.strImage || '', achieved: achieved || !!x.bAchieved,
		unlocked: x.rtUnlocked || 0, global: Number(x.flAchieved) || 0, hidden: !!x.bHidden,
		progress: x.flMaxProgress > 0 ? Math.min(1, (x.flCurrentProgress - x.flMinProgress) / (x.flMaxProgress - x.flMinProgress || 1)) : 0,
	});
	const list = [...(a.vecHighlight ?? []).map((x: any) => toA(x, !!x.bAchieved)), ...(a.vecAchievedHidden ?? []).map((x: any) => toA(x, true)), ...(a.vecUnachieved ?? []).map((x: any) => toA(x, false))];
	const assoc = data?.associationData;
	return {
		ready: true,
		developer: assoc?.rgDevelopers?.map((x: any) => x.strName).join(', ') || d.strDeveloperName || '',
		publisher: assoc?.rgPublishers?.map((x: any) => x.strName).join(', ') || '',
		description: paragraphs(data?.descriptionsData?.strFullDescription || data?.descriptionsData?.strSnippet || ''),
		disk: Number(d.lDiskUsageBytes) || 0,
		dlcDisk: Number(d.lDlcUsageBytes) || 0,
		cloud: d.bCloudAvailable ? CLOUD[d.eCloudStatus as number] ?? 'Available' : '',
		buildUpdated: d.rtLastUpdated || 0,
		achievements: { total: a.nTotal || 0, achieved: a.nAchieved || 0, list },
		shots: (d.vecScreenShots ?? []).map((s: any) => ({ handle: s.hHandle, url: s.strUrl, created: s.nCreated, w: s.nWidth, h: s.nHeight })).sort((x: Shot, y: Shot) => y.created - x.created),
		shotCount: d.nScreenshots || 0,
		dlc: (d.vecDLC ?? []).map((x: any) => ({ appid: x.unAppID, name: x.strName, state: x.strState, enabled: !!x.bEnabled })),
		platforms: (d.vecPlatforms ?? []).map(String),
	};
}

/** Live details for one game: subscribes to Steam's app data and asks for everything the page needs. */
export function useGameDetails(appid: number): Details {
	const [det, setDet] = useState<Details>(() => read(appid));
	useEffect(() => {
		const ads = stores.appDetails;
		let reg: any = null;
		const update = () => setDet(read(appid));
		try {
			reg = ads?.RegisterForAppData?.(appid, update);
			ads?.RequestAppDetails?.(appid);
			ads?.RequestAchievements?.(appid);
			ads?.RequestDescriptionsData?.(appid);
			ads?.RequestAssociationData?.(appid);
		} catch (e) { console.error('[Kestrel] details', e); }
		// Some parts (achievements, descriptions) arrive without a callback; look again a few times
		const timers = [400, 1200, 2500, 5000].map((ms) => setTimeout(update, ms));
		update();
		return () => { timers.forEach(clearTimeout); try { reg?.unregister?.(); } catch { /* ignore */ } };
	}, [appid]);
	return det;
}

/** Latest news from Steam's public news feed for this app. */
export function useNews(appid: number, count = 6): News[] | null {
	const [news, setNews] = useState<News[] | null>(null);
	useEffect(() => {
		let live = true;
		setNews(null);
		const url = (official: boolean) => `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appid}&count=${count}&maxlength=280&format=json${official ? '&feeds=steam_community_announcements' : ''}`;
		// The developer's own announcements first; other sources only when there are none
		fetch(url(true))
			.then((r) => r.json())
			.then((j) => (j?.appnews?.newsitems?.length ? j : fetch(url(false)).then((r) => r.json())))
			.then((j) => {
				if (!live) return;
				const items = j?.appnews?.newsitems ?? [];
				setNews(items.map((n: any) => ({ id: n.gid, title: n.title, url: n.url, date: n.date, feed: n.feedlabel || '', excerpt: paragraphs(n.contents || '').join(' ').slice(0, 260) })));
			})
			.catch(() => live && setNews([]));
		return () => { live = false; };
	}, [appid]);
	return news;
}

export function isRunning(appid: number): boolean {
	try { return (stores.ui?.RunningApps ?? []).some((r: any) => r.appid === appid); } catch { return false; }
}

/** Steam's own management actions for a game. Each one opens Steam's native dialog or does the native thing. */
export const gameActions = {
	properties: (appid: number) => client().Apps.OpenAppSettingsDialog(appid, ''),
	verify: (appid: number) => client().Apps.VerifyApp(appid),
	uninstall: (appid: number) => client().Installs.OpenUninstallWizard([appid], false),
	shortcut: (appid: number) => client().Apps.CreateDesktopShortcutForApp(appid),
	stop: (gameid: string) => client().Apps.TerminateApp(gameid, false),
	screenshots: (gameid: string) => client().Apps.BrowseScreenshotsForApp(gameid),
	store: (appid: number) => mainWindow()?.NavigateToSteamWeb(`https://store.steampowered.com/app/${appid}/`),
	hub: (appid: number) => mainWindow()?.NavigateToSteamWeb(`https://steamcommunity.com/app/${appid}`),
};

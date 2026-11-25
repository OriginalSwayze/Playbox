// The user's own Steam collections (the "sub folders" of Steam's game list), read from collectionStore.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { stores } from './env';

export type Collection = { id: string; name: string; appids: number[]; dynamic: boolean };

/** User collections in Steam's order, then Favorites and Uncategorized where Steam puts them. */
export function snapshotCollections(): Collection[] {
	const cs = stores.collections;
	const list: any[] = cs?.userCollections ?? [];
	const out: Collection[] = [];
	for (const c of list) {
		try {
			const id = String(c.id ?? c.m_strId);
			if (/^type-/.test(id)) continue; // Steam's own type groups (soundtracks, tools) are not game collections
			const appids: number[] = (c.allApps ?? []).map((a: any) => a.appid).filter((n: number) => typeof n === 'number');
			out.push({ id, name: c.displayName ?? c.m_strName ?? id, appids, dynamic: !!c.bIsDynamic });
		} catch { /* skip a collection Steam can't describe */ }
	}
	// Uncategorized last, like Steam
	return out.sort((a, b) => (a.id === 'uncategorized' ? 1 : 0) - (b.id === 'uncategorized' ? 1 : 0));
}

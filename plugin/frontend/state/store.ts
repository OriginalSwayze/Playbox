// Kestrel's app state: one small observable store, read with useKestrel(selector).
import { useSyncExternalStore } from 'react';
import type { Game } from '../steam/library';
import type { DownloadState, Friend } from '../steam/activity';

export type Space = 'play' | 'discover' | 'social' | 'you';
export type View = { kind: 'home' } | { kind: 'library' } | { kind: 'game'; appid: number } | { kind: 'native' };

export type State = {
	space: Space;
	view: View;
	history: View[];
	library: Game[];
	downloads: DownloadState;
	friends: Friend[];
	commandOpen: boolean;
	panelOpen: boolean;
	spotlight: number; // appid shown in the home spotlight (0 = most recent)
	calm: boolean; // reduced motion
};

let state: State = {
	space: 'play',
	view: { kind: 'home' },
	history: [],
	library: [],
	downloads: { active: null, rate: 0, eta: -1, queue: [] },
	friends: [],
	commandOpen: false,
	panelOpen: false,
	spotlight: 0,
	calm: false,
};
const subs = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
	const p = typeof patch === 'function' ? patch(state) : patch;
	state = { ...state, ...p };
	subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export function useKestrel<T>(sel: (s: State) => T): T {
	return useSyncExternalStore(subscribe, () => sel(state));
}

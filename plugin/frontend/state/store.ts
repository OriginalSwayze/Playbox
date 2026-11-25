// Kestrel's app state: one small observable store, read with useKestrel(selector).
import { useSyncExternalStore } from 'react';
import type { Game } from '../steam/library';
import type { DownloadState, Friend } from '../steam/activity';
import type { Collection } from '../steam/collections';

export type Space = 'play' | 'discover' | 'social' | 'you';
export type View = { kind: 'home' } | { kind: 'library' } | { kind: 'game'; appid: number } | { kind: 'native' };

export type Settings = {
	motion: 'auto' | 'full' | 'reduced'; // auto follows the system setting
	intro: boolean; // the opening animation when Steam starts
	tilt: boolean; // covers lean towards the pointer
	rotate: boolean; // the home spotlight moves through recent games on its own
	start: 'home' | 'library'; // where Kestrel opens
	ui: UI; // which interface is drawn
};
export type UI = 'kestrel' | 'gazette' | 'shelf' | 'terminal';
export const DEFAULT_SETTINGS: Settings = { motion: 'auto', intro: true, tilt: true, rotate: false, start: 'home', ui: 'kestrel' };

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
	morph: Morph | null; // artwork to carry from a card into the game page
	settings: Settings;
	settingsOpen: boolean;
	dir: 'forward' | 'back'; // direction of the last move, for page transitions
	running: number[]; // appids Steam reports as running
	collections: Collection[]; // the user's Steam collections
	libCollection: string | null; // collection the Library is showing (null = all games)
};
export type Morph = { appid: number; src: string; x: number; y: number; w: number; h: number; radius: number };

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
	morph: null,
	settings: DEFAULT_SETTINGS,
	settingsOpen: false,
	dir: 'forward',
	running: [],
	collections: [],
	libCollection: null,
};
const subs = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
	const p = typeof patch === 'function' ? patch(state) : patch;
	state = { ...state, ...p };
	subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const subscribeState = subscribe;

export function useKestrel<T>(sel: (s: State) => T): T {
	return useSyncExternalStore(subscribe, () => sel(state));
}

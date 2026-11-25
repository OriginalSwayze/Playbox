// Components and styles for every alternative interface. Adding one = its file + an entry here + one in catalog.ts.
import type { ComponentType } from 'react';
import { kitCss } from './kit';
import { Gazette } from './Gazette';
import { Shelf } from './Shelf';
import { Terminal } from './Terminal';
import { Vinyl, vinylCss } from './Vinyl';
import { Arcade, arcadeCss } from './Arcade';
import { Deck, deckCss } from './Deck';
import { Museum, museumCss } from './Museum';
import { Corkboard, corkboardCss } from './Corkboard';

export const INTERFACES: Record<string, ComponentType> = {
	gazette: Gazette,
	shelf: Shelf,
	terminal: Terminal,
	vinyl: Vinyl,
	arcade: Arcade,
	deck: Deck,
	museum: Museum,
	corkboard: Corkboard,
};

/** Styles contributed by interfaces that carry their own (the first three live in styles/alt.ts and styles/gazette.ts). */
export const INTERFACE_CSS: string[] = [kitCss, vinylCss, arcadeCss, deckCss, museumCss, corkboardCss];

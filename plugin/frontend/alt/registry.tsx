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
import { Chronicle, chronicleCss } from './Chronicle';
import { Mission, missionCss } from './Mission';
import { Springboard, springboardCss } from './Springboard';
import { Channels, channelsCss } from './Channels';
import { Comic, comicCss } from './Comic';
import { Backlog, backlogCss } from './Backlog';
import { Cinema, cinemaCss } from './Cinema';
import { Vending, vendingCss } from './Vending';
import { Inbox, inboxCss } from './Inbox';
import { Ledger, ledgerCss } from './Ledger';
import { Garden, gardenCss } from './Garden';
import { Journal, journalCss } from './Journal';
import { Transit, transitCss } from './Transit';
import { Retro, retroCss } from './Retro';
import { Index, indexCss } from './Index';
import { Weather, weatherCss } from './Weather';
import { Stream, streamCss } from './Stream';
import { Chat, chatCss } from './Chat';
import { Calendar, calendarCss } from './Calendar';
import { Photos, photosCss } from './Photos';
import { Notes, notesCss } from './Notes';
import { Code, codeCss } from './Code';
import { Files, filesCss } from './Files';
import { Tube, tubeCss } from './Tube';
import { Feed, feedCss } from './Feed';

export const INTERFACES: Record<string, ComponentType> = {
	gazette: Gazette,
	shelf: Shelf,
	terminal: Terminal,
	vinyl: Vinyl,
	arcade: Arcade,
	deck: Deck,
	museum: Museum,
	corkboard: Corkboard,
	chronicle: Chronicle,
	mission: Mission,
	springboard: Springboard,
	channels: Channels,
	comic: Comic,
	backlog: Backlog,
	cinema: Cinema,
	vending: Vending,
	inbox: Inbox,
	ledger: Ledger,
	garden: Garden,
	journal: Journal,
	transit: Transit,
	retro: Retro,
	index: Index,
	weather: Weather,
	stream: Stream,
	chat: Chat,
	calendar: Calendar,
	photos: Photos,
	notes: Notes,
	code: Code,
	files: Files,
	tube: Tube,
	feed: Feed,
};

/** Styles contributed by interfaces that carry their own (the first three live in styles/alt.ts and styles/gazette.ts). */
export const INTERFACE_CSS: string[] = [kitCss, vinylCss, arcadeCss, deckCss, museumCss, corkboardCss, chronicleCss, missionCss, springboardCss, channelsCss, comicCss, backlogCss, cinemaCss, vendingCss, inboxCss, ledgerCss, gardenCss, journalCss, transitCss, retroCss, indexCss, weatherCss, streamCss, chatCss, calendarCss, photosCss, notesCss, codeCss, filesCss, tubeCss, feedCss];

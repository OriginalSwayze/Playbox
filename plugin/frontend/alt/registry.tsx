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
import { Swipe, swipeCss } from './Swipe';
import { Ticker, tickerCss } from './Ticker';
import { Shop, shopCss } from './Shop';
import { Reader, readerCss } from './Reader';
import { Boarding, boardingCss } from './Boarding';
import { Home, homeCss } from './Home';
import { Drive, driveCss } from './Drive';
import { Watch, watchCss } from './Watch';
import { Wiki, wikiCss } from './Wiki';
import { Forum, forumCss } from './Forum';
import { Slides, slidesCss } from './Slides';
import { Canvas, canvasCss } from './Canvas';
import { Studio, studioCss } from './Studio';
import { Cut, cutCss } from './Cut';
import { Paint, paintCss } from './Paint';
import { Clocks, clocksCss } from './Clocks';
import { Delivery, deliveryCss } from './Delivery';
import { Analytics, analyticsCss } from './Analytics';
import { Gantt, ganttCss } from './Gantt';
import { Mindmap, mindmapCss } from './Mindmap';
import { Flashcards, flashcardsCss } from './Flashcards';
import { Quiz, quizCss } from './Quiz';
import { Habits, habitsCss } from './Habits';
import { Envelopes, envelopesCss } from './Envelopes';
import { Ereader, ereaderCss } from './Ereader';
import { Radio, radioCss } from './Radio';
import { Camera, cameraCss } from './Camera';
import { Cctv, cctvCss } from './Cctv';
import { Tiles, tilesCss } from './Tiles';
import { Phone, phoneCss } from './Phone';
import { Crossbar, crossbarCss } from './Crossbar';
import { Kiosk, kioskCss } from './Kiosk';
import { Register, registerCss } from './Register';
import { Receipt, receiptCss } from './Receipt';
import { Typewriter, typewriterCss } from './Typewriter';
import { Teletext, teletextCss } from './Teletext';
import { Bios, biosCss } from './Bios';
import { Wizard, wizardCss } from './Wizard';
import { Homepage, homepageCss } from './Homepage';
import { Search, searchCss } from './Search';
import { Irc, ircCss } from './Irc';
import { Meeting, meetingCss } from './Meeting';
import { Listings, listingsCss } from './Listings';
import { Jobs, jobsCss } from './Jobs';
import { Flights, flightsCss } from './Flights';
import { Lineup, lineupCss } from './Lineup';
import { League, leagueCss } from './League';
import { Stars, starsCss } from './Stars';
import { Elements, elementsCss } from './Elements';
import { Scope, scopeCss } from './Scope';
import { Synth, synthCss } from './Synth';
import { Wheel, wheelCss } from './Wheel';
import { Advent, adventCss } from './Advent';
import { Blueprint, blueprintCss } from './Blueprint';
import { Circuit, circuitCss } from './Circuit';
import { Family, familyCss } from './Family';
import { Orgchart, orgchartCss } from './Orgchart';
import { Bracket, bracketCss } from './Bracket';
import { Menuboard, menuboardCss } from './Menuboard';
import { Stamps, stampsCss } from './Stamps';

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
	swipe: Swipe,
	ticker: Ticker,
	shop: Shop,
	reader: Reader,
	boarding: Boarding,
	home: Home,
	drive: Drive,
	watch: Watch,
	wiki: Wiki,
	forum: Forum,
	slides: Slides,
	canvas: Canvas,
	studio: Studio,
	cut: Cut,
	paint: Paint,
	clocks: Clocks,
	delivery: Delivery,
	analytics: Analytics,
	gantt: Gantt,
	mindmap: Mindmap,
	flashcards: Flashcards,
	quiz: Quiz,
	habits: Habits,
	envelopes: Envelopes,
	ereader: Ereader,
	radio: Radio,
	camera: Camera,
	cctv: Cctv,
	tiles: Tiles,
	phone: Phone,
	crossbar: Crossbar,
	kiosk: Kiosk,
	register: Register,
	receipt: Receipt,
	typewriter: Typewriter,
	teletext: Teletext,
	bios: Bios,
	wizard: Wizard,
	homepage: Homepage,
	search: Search,
	irc: Irc,
	meeting: Meeting,
	listings: Listings,
	jobs: Jobs,
	flights: Flights,
	lineup: Lineup,
	league: League,
	stars: Stars,
	elements: Elements,
	scope: Scope,
	synth: Synth,
	wheel: Wheel,
	advent: Advent,
	blueprint: Blueprint,
	circuit: Circuit,
	family: Family,
	orgchart: Orgchart,
	bracket: Bracket,
	menuboard: Menuboard,
	stamps: Stamps,
};

/** Styles contributed by interfaces that carry their own (the first three live in styles/alt.ts and styles/gazette.ts). */
export const INTERFACE_CSS: string[] = [kitCss, vinylCss, arcadeCss, deckCss, museumCss, corkboardCss, chronicleCss, missionCss, springboardCss, channelsCss, comicCss, backlogCss, cinemaCss, vendingCss, inboxCss, ledgerCss, gardenCss, journalCss, transitCss, retroCss, indexCss, weatherCss, streamCss, chatCss, calendarCss, photosCss, notesCss, codeCss, filesCss, tubeCss, feedCss, swipeCss, tickerCss, shopCss, readerCss, boardingCss, homeCss, driveCss, watchCss, wikiCss, forumCss, slidesCss, canvasCss, studioCss, cutCss, paintCss, clocksCss, deliveryCss, analyticsCss, ganttCss, mindmapCss, flashcardsCss, quizCss, habitsCss, envelopesCss, ereaderCss, radioCss, cameraCss, cctvCss, tilesCss, phoneCss, crossbarCss, kioskCss, registerCss, receiptCss, typewriterCss, teletextCss, biosCss, wizardCss, homepageCss, searchCss, ircCss, meetingCss, listingsCss, jobsCss, flightsCss, lineupCss, leagueCss, starsCss, elementsCss, scopeCss, synthCss, wheelCss, adventCss, blueprintCss, circuitCss, familyCss, orgchartCss, bracketCss, menuboardCss, stampsCss];

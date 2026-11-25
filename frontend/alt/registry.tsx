// Components and styles for every alternative interface. Adding one = its file + an entry here + one in catalog.ts.
import type { ComponentType } from 'react';
import { kitCss } from './kit';
import { lkCss } from './lk';
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
import { Passport, passportCss } from './Passport';
import { Contact, contactCss } from './Contact';
import { Magazine, magazineCss } from './Magazine';
import { Whiteboard, whiteboardCss } from './Whiteboard';
import { Aquarium, aquariumCss } from './Aquarium';
import { Pet, petCss } from './Pet';
import { Widgets, widgetsCss } from './Widgets';
import { Launcher, launcherCss } from './Launcher';
import { Assistant, assistantCss } from './Assistant';
import { Notifications, notificationsCss } from './Notifications';
import { Wallet, walletCss } from './Wallet';
import { Contacts, contactsCss } from './Contacts';
import { Appshop, appshopCss } from './Appshop';
import { Preferences, preferencesCss } from './Preferences';
import { Commits, commitsCss } from './Commits';
import { Sql, sqlCss } from './Sql';
import { Logs, logsCss } from './Logs';
import { Graph, graphCss } from './Graph';
import { Treemap, treemapCss } from './Treemap';
import { Heatmap, heatmapCss } from './Heatmap';
import { Zine, zineCss } from './Zine';
import { Brutalist, brutalistCss } from './Brutalist';
import { Soft, softCss } from './Soft';
import { Glass, glassCss } from './Glass';
import { Papercraft, papercraftCss } from './Papercraft';
import { Quest, questCss } from './Quest';
import { Novel, novelCss } from './Novel';
import { Versus, versusCss } from './Versus';
import { Techtree, techtreeCss } from './Techtree';
import { Inventory, inventoryCss } from './Inventory';
import { Dashboard, dashboardCss } from './Dashboard';
import { Billboard, billboardCss } from './Billboard';
import { Coverflow, coverflowCss } from './Coverflow';
import { Spotlight, spotlightCss } from './Spotlight';
import { Couch, couchCss } from './Couch';
import { Hub, hubCss } from './Hub';
import { Mosaic, mosaicCss } from './Mosaic';
import { Posters, postersCss } from './Posters';
import { Orbit, orbitCss } from './Orbit';
import { Radial, radialCss } from './Radial';
import { Dock, dockCss } from './Dock';
import { Blades, bladesCss } from './Blades';
import { Neon, neonCss } from './Neon';
import { Hud, hudCss } from './Hud';
import { Holo, holoCss } from './Holo';
import { Codex, codexCss } from './Codex';
import { Loadout, loadoutCss } from './Loadout';
import { Pitlane, pitlaneCss } from './Pitlane';
import { Overworld, overworldCss } from './Overworld';
import { Saves, savesCss } from './Saves';
import { Pause, pauseCss } from './Pause';
import { Lobby, lobbyCss } from './Lobby';
import { Season, seasonCss } from './Season';
import { Trophy, trophyCss } from './Trophy';
import { Rhythm, rhythmCss } from './Rhythm';
import { Dread, dreadCss } from './Dread';
import { Hexmap, hexmapCss } from './Hexmap';
import { Gacha, gachaCss } from './Gacha';
import { Compact, compactCss } from './Compact';
import { Zen, zenCss } from './Zen';
import { Pixel, pixelCss } from './Pixel';
import { Cartridge, cartridgeCss } from './Cartridge';
import { Galaxy, galaxyCss } from './Galaxy';
import { Dossier, dossierCss } from './Dossier';
import { Realm, realmCss } from './Realm';
import { Ascent, ascentCss } from './Ascent';
import { Skyline, skylineCss } from './Skyline';
import { Board, boardCss } from './Board';
import { Kickoff, kickoffCss } from './Kickoff';

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
	passport: Passport,
	contact: Contact,
	magazine: Magazine,
	whiteboard: Whiteboard,
	aquarium: Aquarium,
	pet: Pet,
	widgets: Widgets,
	launcher: Launcher,
	assistant: Assistant,
	notifications: Notifications,
	wallet: Wallet,
	contacts: Contacts,
	appshop: Appshop,
	preferences: Preferences,
	commits: Commits,
	sql: Sql,
	logs: Logs,
	graph: Graph,
	treemap: Treemap,
	heatmap: Heatmap,
	zine: Zine,
	brutalist: Brutalist,
	soft: Soft,
	glass: Glass,
	papercraft: Papercraft,
	quest: Quest,
	novel: Novel,
	versus: Versus,
	techtree: Techtree,
	inventory: Inventory,
	dashboard: Dashboard,
	billboard: Billboard,
	coverflow: Coverflow,
	spotlight: Spotlight,
	couch: Couch,
	hub: Hub,
	mosaic: Mosaic,
	posters: Posters,
	orbit: Orbit,
	radial: Radial,
	dock: Dock,
	blades: Blades,
	neon: Neon,
	hud: Hud,
	holo: Holo,
	codex: Codex,
	loadout: Loadout,
	pitlane: Pitlane,
	overworld: Overworld,
	saves: Saves,
	pause: Pause,
	lobby: Lobby,
	season: Season,
	trophy: Trophy,
	rhythm: Rhythm,
	dread: Dread,
	hexmap: Hexmap,
	gacha: Gacha,
	compact: Compact,
	zen: Zen,
	pixel: Pixel,
	cartridge: Cartridge,
	galaxy: Galaxy,
	dossier: Dossier,
	realm: Realm,
	ascent: Ascent,
	skyline: Skyline,
	board: Board,
	kickoff: Kickoff,
};

/** Styles contributed by interfaces that carry their own (the first three live in styles/alt.ts and styles/gazette.ts). */
export const INTERFACE_CSS: string[] = [kitCss, lkCss, vinylCss, arcadeCss, deckCss, museumCss, corkboardCss, chronicleCss, missionCss, springboardCss, channelsCss, comicCss, backlogCss, cinemaCss, vendingCss, inboxCss, ledgerCss, gardenCss, journalCss, transitCss, retroCss, indexCss, weatherCss, streamCss, chatCss, calendarCss, photosCss, notesCss, codeCss, filesCss, tubeCss, feedCss, swipeCss, tickerCss, shopCss, readerCss, boardingCss, homeCss, driveCss, watchCss, wikiCss, forumCss, slidesCss, canvasCss, studioCss, cutCss, paintCss, clocksCss, deliveryCss, analyticsCss, ganttCss, mindmapCss, flashcardsCss, quizCss, habitsCss, envelopesCss, ereaderCss, radioCss, cameraCss, cctvCss, tilesCss, phoneCss, crossbarCss, kioskCss, registerCss, receiptCss, typewriterCss, teletextCss, biosCss, wizardCss, homepageCss, searchCss, ircCss, meetingCss, listingsCss, jobsCss, flightsCss, lineupCss, leagueCss, starsCss, elementsCss, scopeCss, synthCss, wheelCss, adventCss, blueprintCss, circuitCss, familyCss, orgchartCss, bracketCss, menuboardCss, stampsCss, passportCss, contactCss, magazineCss, whiteboardCss, aquariumCss, petCss, widgetsCss, launcherCss, assistantCss, notificationsCss, walletCss, contactsCss, appshopCss, preferencesCss, commitsCss, sqlCss, logsCss, graphCss, treemapCss, heatmapCss, zineCss, brutalistCss, softCss, glassCss, papercraftCss, questCss, novelCss, versusCss, techtreeCss, inventoryCss, dashboardCss, billboardCss, coverflowCss, spotlightCss, couchCss, hubCss, mosaicCss, postersCss, orbitCss, radialCss, dockCss, bladesCss, neonCss, hudCss, holoCss, codexCss, loadoutCss, pitlaneCss, overworldCss, savesCss, pauseCss, lobbyCss, seasonCss, trophyCss, rhythmCss, dreadCss, hexmapCss, gachaCss, compactCss, zenCss, pixelCss, cartridgeCss, galaxyCss, dossierCss, realmCss, ascentCss, skylineCss, boardCss, kickoffCss];

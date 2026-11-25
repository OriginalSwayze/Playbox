// Every interface Kestrel can draw: id, name, one-line description and two swatch colours for the gallery.
// Kept free of components so settings, the command bar and the Terminal can list interfaces without cycles.
export type InterfaceInfo = { id: string; name: string; blurb: string; swatch: [string, string] };

export const CATALOG: InterfaceInfo[] = [
	{ id: 'kestrel', name: 'Kestrel', blurb: 'Spaces, a cinematic dashboard and a library wall', swatch: ['#08090C', '#F0A23B'] },
	{ id: 'gazette', name: 'Gazette', blurb: 'Your library as a printed newspaper', swatch: ['#F7F3EA', '#A8231B'] },
	{ id: 'shelf', name: 'Shelf', blurb: 'A lamp-lit shelf of game boxes', swatch: ['#1E1510', '#E2B06A'] },
	{ id: 'terminal', name: 'Terminal', blurb: 'Steam as a command line', swatch: ['#020604', '#4CFF8A'] },
	{ id: 'vinyl', name: 'Vinyl', blurb: 'Crates of records and a turntable', swatch: ['#2A1C13', '#E8742C'] },
	{ id: 'arcade', name: 'Arcade', blurb: 'A neon hall of game cabinets', swatch: ['#07030F', '#FF2BD6'] },
	{ id: 'deck', name: 'Deck', blurb: 'Collectible cards ranked by playtime', swatch: ['#0C2A20', '#F2C14E'] },
	{ id: 'museum', name: 'Museum', blurb: 'Framed works in gallery rooms', swatch: ['#ECE9E2', '#8C6A2E'] },
	{ id: 'corkboard', name: 'Corkboard', blurb: 'Polaroids pinned to a cork wall', swatch: ['#B88A55', '#E23B3B'] },
	{ id: 'chronicle', name: 'Chronicle', blurb: 'Your gaming life as a timeline', swatch: ['#0B0D1F', '#6FFFCB'] },
	{ id: 'mission', name: 'Mission Control', blurb: 'Your library as live telemetry', swatch: ['#050806', '#FFB020'] },
	{ id: 'springboard', name: 'Springboard', blurb: 'A phone home screen of games', swatch: ['#3A2A6B', '#0A84FF'] },
	{ id: 'channels', name: 'Channels', blurb: 'A cable TV guide of your games', swatch: ['#0A1548', '#FFE14A'] },
	{ id: 'comic', name: 'Comic', blurb: 'Your library as a comic book', swatch: ['#2B6CB0', '#E8231F'] },
	{ id: 'backlog', name: 'Backlog', blurb: 'Your games as a kanban board', swatch: ['#F4F5F7', '#0C66E4'] },
	{ id: 'cinema', name: 'Cinema', blurb: 'A picture palace with a marquee and tickets', swatch: ['#0B0506', '#F5C04A'] },
	{ id: 'vending', name: 'Vending', blurb: 'A vending machine with a keypad', swatch: ['#C81E1E', '#6CFF8F'] },
	{ id: 'inbox', name: 'Inbox', blurb: 'Your library as a mail client', swatch: ['#F6F8FC', '#1A73E8'] },
	{ id: 'ledger', name: 'Ledger', blurb: 'Your library as a spreadsheet', swatch: ['#FFFFFF', '#107C41'] },
	{ id: 'garden', name: 'Garden', blurb: 'Games grow into plants as you play', swatch: ['#EAF2DC', '#5E9E3A'] },
	{ id: 'journal', name: 'Journal', blurb: 'A handwritten notebook of your play', swatch: ['#FFFDF6', '#1F3F8A'] },
	{ id: 'transit', name: 'Transit', blurb: 'Collections as metro lines', swatch: ['#F4F3EE', '#E5484D'] },
	{ id: 'retro', name: 'Retro Desktop', blurb: 'A 90s desktop with draggable windows', swatch: ['#2E4A62', '#D4D0C8'] },
	{ id: 'index', name: 'Index', blurb: 'A Swiss typographic A–Z index', swatch: ['#F2F0EB', '#E30613'] },
	{ id: 'weather', name: 'Forecast', blurb: 'A weather app: games are cities, hours are degrees', swatch: ['#3D8BE0', '#FFD45C'] },
	{ id: 'stream', name: 'Stream', blurb: 'A music streaming app with playlists and a now-playing bar', swatch: ['#121212', '#B38CFF'] },
	{ id: 'chat', name: 'Chat', blurb: 'A messenger where every game is a conversation', swatch: ['#2F7CF6', '#FFFFFF'] },
	{ id: 'calendar', name: 'Calendar', blurb: 'A calendar of your last sessions and new arrivals', swatch: ['#FFFFFF', '#1A73E8'] },
	{ id: 'photos', name: 'Photos', blurb: 'A photo library with albums and a lightbox', swatch: ['#F7F7F9', '#FF7A1A'] },
	{ id: 'notes', name: 'Notes', blurb: 'A notes app; write your own notes per game', swatch: ['#F6F5F2', '#E0A800'] },
	{ id: 'code', name: 'Code', blurb: 'A code editor: your library as a source tree', swatch: ['#1E1F22', '#3D8EF2'] },
	{ id: 'files', name: 'Files', blurb: 'A file manager with details view and preview', swatch: ['#F3F3F3', '#0F6CBD'] },
	{ id: 'tube', name: 'Tube', blurb: 'A video site with a watch page and up next', swatch: ['#0F0F0F', '#7B5CFF'] },
	{ id: 'feed', name: 'Feed', blurb: 'A social timeline where your library posts', swatch: ['#FFFFFF', '#F0457A'] },
];

export const uiIds = () => CATALOG.map((c) => c.id);
export const isUI = (id: string) => CATALOG.some((c) => c.id === id);

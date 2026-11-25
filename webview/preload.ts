/**
 * Kestrel web layer: runs inside Steam's browser views (Store, Community).
 * No React here, only the page DOM. Phase 6 adds the Discover/Social styling.
 */
export default async function main() {
	document.documentElement.dataset.kestrel = '1';
}

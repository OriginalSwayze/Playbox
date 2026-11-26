// Stand-in for Millennium's 'millennium' package when Playbox runs on Beyond Steam. Beyond Steam calls the module's
// default export once Steam's interface is ready; Field only appears in Millennium's settings list, so it draws nothing.
export function definePlugin<T>(fn: () => T): () => T {
	return fn;
}
export function Field(): null {
	return null;
}

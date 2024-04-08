export function getBrowser() {
	return (globalThis?.browser ?? globalThis?.chrome) as typeof globalThis.chrome;
}

// Builds Playbox for Beyond Steam: beyond/dist/com.originalswayze.kestrel/{plugin.json, playbox.js}.
// Run with Bun from the repo root: bun beyond/build.mjs [--install]   (--install copies it into Beyond Steam's plugins folder)
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dir, '..');
const toml = readFileSync(join(root, 'millennium.toml'), 'utf8');
const field = (k) => toml.match(new RegExp('^' + k + '\\s*=\\s*"(.*)"', 'm'))?.[1] ?? '';
const id = field('id');
if (!/^[\w.-]+$/.test(id)) throw new Error('could not read the plugin id from millennium.toml');
const out = join(import.meta.dir, 'dist', id);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const shims = {
	millennium: join(import.meta.dir, 'shim/millennium.ts'),
	react: join(import.meta.dir, 'shim/react.ts'),
	'react/jsx-runtime': join(import.meta.dir, 'shim/jsx-runtime.ts'),
	'react/jsx-dev-runtime': join(import.meta.dir, 'shim/jsx-runtime.ts'),
};
const result = await Bun.build({
	entrypoints: [join(root, 'frontend/index.tsx')],
	outdir: out,
	naming: 'playbox.js',
	format: 'esm',
	target: 'browser',
	minify: true,
	define: { 'process.env.NODE_ENV': '"production"' },
	plugins: [{
		name: 'beyond-steam-shims',
		setup(b) {
			b.onResolve({ filter: /^(millennium|react|react\/jsx-runtime|react\/jsx-dev-runtime)$/ }, (a) => ({ path: shims[a.path] }));
		},
	}],
});
if (!result.success) { for (const l of result.logs) console.error(l); process.exit(1); }

writeFileSync(join(out, 'plugin.json'), JSON.stringify({
	id, name: field('name'), version: field('version'), author: field('author'), description: field('description'),
	main: 'playbox.js', theme: 'Kestrel', home: 'https://github.com/OriginalSwayze/Playbox',
}, null, 2));
console.log('built', out);

if (process.argv.includes('--install')) {
	const dest = join(process.env.APPDATA, 'Beyond Steam', 'plugins', id);
	rmSync(dest, { recursive: true, force: true });
	cpSync(out, dest, { recursive: true });
	console.log('installed into', dest);
}

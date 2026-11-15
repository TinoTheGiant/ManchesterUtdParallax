import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');

// Never clean a directory outside this project's named build output or follow a link.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
    throw new Error('Invalid build output directory.');
}
const existingOutput = await fs.lstat(output).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
});
if (existingOutput?.isSymbolicLink()) throw new Error('Build output must not be a symbolic link.');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(path.join(output, 'js'), { recursive: true });
await fs.mkdir(path.join(output, 'css'), { recursive: true });

const pageNames = ['index.html', 'legends.html'];
const pages = await Promise.all(pageNames.map((name) => fs.readFile(path.join(root, name), 'utf8')));
const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/g;
const scriptNames = [...new Set(pages.flatMap((html) => [...html.matchAll(scriptPattern)].map((match) => match[1])))];
if (scriptNames.some((name) => !/^js\/[a-z0-9-]+\.js$/i.test(name))) {
    throw new Error('Unexpected script path in the production entry points.');
}

const source = (await Promise.all(scriptNames.map((name) => fs.readFile(path.join(root, name), 'utf8')))).join('\n;\n');
const script = await transform(source, {
    loader: 'js',
    format: 'iife',
    target: 'es2022',
    minify: true,
    minifyIdentifiers: true,
    legalComments: 'none',
    sourcemap: false,
    charset: 'ascii'
});
const stylesheet = await transform(await fs.readFile(path.join(root, 'css/styles.css'), 'utf8'), {
    loader: 'css', minify: true, legalComments: 'none', sourcemap: false
});
const fingerprint = (content) => createHash('sha256').update(content).digest('hex').slice(0, 12);
const scriptName = `js/app-${fingerprint(script.code)}.js`;
const stylesheetName = `css/styles-${fingerprint(stylesheet.code)}.css`;

await Promise.all([
    fs.writeFile(path.join(output, scriptName), script.code),
    fs.writeFile(path.join(output, stylesheetName), stylesheet.code),
    ...['assets', 'audio', 'data'].map((name) => fs.cp(path.join(root, name), path.join(output, name), { recursive: true })),
    fs.copyFile(path.join(root, 'LICENSE.txt'), path.join(output, 'LICENSE.txt'))
]);

await Promise.all(pages.map((html, index) => {
    const built = html
        .replace(scriptPattern, '')
        .replace('css/styles.css', stylesheetName)
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\n\s*\n/g, '\n')
        .replace('</body>', `    <script src="${scriptName}" defer></script>\n</body>`);
    return fs.writeFile(path.join(output, pageNames[index]), built);
}));

console.log(`Production build: ${scriptNames.length} source scripts -> ${scriptName}`);
console.log(`JavaScript: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(script.code)} bytes; identifiers mangled; no source maps.`);
console.log('Ready in dist/ with fingerprinted JavaScript and CSS.');

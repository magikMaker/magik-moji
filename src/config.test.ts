import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
    DEFAULT_CONFIG,
    DEFAULT_SKIP_PATTERNS,
    loadConfig,
    resolveConfig,
} from './config.js';

/**
 * Create a throw-away temporary directory for a single test case so we
 * can drop config files in it without touching the real cwd. The
 * directory is removed in `afterEach`.
 */
function mktmp(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'magik-moji-'));
}

describe('resolveConfig', () => {
    it('returns defaults when no user config is provided', () => {
        expect(resolveConfig(undefined)).toEqual(DEFAULT_CONFIG);
    });

    it('falls back to default emojis when user supplies an empty array', () => {
        const resolved = resolveConfig({ emojis: [] });
        expect(resolved.emojis).toBe(DEFAULT_CONFIG.emojis);
    });

    it('preserves a user-supplied emoji pool', () => {
        const resolved = resolveConfig({ emojis: ['🦄'] });
        expect(resolved.emojis).toEqual(['🦄']);
    });

    it('allows an empty-string separator', () => {
        expect(resolveConfig({ separator: '' }).separator).toBe('');
    });

    it('overrides skip patterns when supplied', () => {
        const resolved = resolveConfig({ skipPatterns: ['^WIP'] });
        expect(resolved.skipPatterns).toEqual(['^WIP']);
    });

    it('falls back to default skip patterns on empty array', () => {
        expect(resolveConfig({ skipPatterns: [] }).skipPatterns).toBe(
            DEFAULT_SKIP_PATTERNS,
        );
    });

    it('propagates boolean flags', () => {
        const resolved = resolveConfig({
            semantic: true,
            deterministic: true,
            position: 'suffix',
        });
        expect(resolved.semantic).toBe(true);
        expect(resolved.deterministic).toBe(true);
        expect(resolved.position).toBe('suffix');
    });
});

describe('loadConfig', () => {
    let tmp: string;

    beforeEach(() => {
        tmp = mktmp();
    });

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it('returns defaults when no config file exists', () => {
        expect(loadConfig(tmp)).toEqual(DEFAULT_CONFIG);
    });

    it('reads a `.magikmojirc` JSON file', () => {
        fs.writeFileSync(
            path.join(tmp, '.magikmojirc'),
            JSON.stringify({ emojis: ['🦄'], semantic: true }),
        );
        const config = loadConfig(tmp);
        expect(config.emojis).toEqual(['🦄']);
        expect(config.semantic).toBe(true);
    });

    it('reads `.magikmojirc.json`', () => {
        fs.writeFileSync(
            path.join(tmp, '.magikmojirc.json'),
            JSON.stringify({ separator: '-' }),
        );
        expect(loadConfig(tmp).separator).toBe('-');
    });

    it('reads a `magikMoji` key in package.json', () => {
        fs.writeFileSync(
            path.join(tmp, 'package.json'),
            JSON.stringify({
                name: 'x',
                magikMoji: { position: 'suffix' },
            }),
        );
        expect(loadConfig(tmp).position).toBe('suffix');
    });

    it('prefers `.magikmojirc` over `package.json`', () => {
        fs.writeFileSync(
            path.join(tmp, '.magikmojirc'),
            JSON.stringify({ separator: 'A' }),
        );
        fs.writeFileSync(
            path.join(tmp, 'package.json'),
            JSON.stringify({ magikMoji: { separator: 'B' } }),
        );
        expect(loadConfig(tmp).separator).toBe('A');
    });

    it('silently ignores invalid JSON', () => {
        fs.writeFileSync(path.join(tmp, '.magikmojirc'), '{not json');
        expect(loadConfig(tmp)).toEqual(DEFAULT_CONFIG);
    });
});

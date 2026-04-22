import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DEFAULT_EMOJIS, SEMANTIC_EMOJIS } from './emojis.js';
import { DEFAULT_CONFIG, resolveConfig } from './config.js';
import {
    DISABLE_ENV_VAR,
    addEmoji,
    fnv1a,
    hasLeadingEmoji,
    matchesAny,
    pickEmoji,
    transformMessage,
} from './hook.js';

describe('fnv1a', () => {
    it('is deterministic for the same input', () => {
        expect(fnv1a('hello')).toBe(fnv1a('hello'));
    });

    it('produces different hashes for different inputs', () => {
        expect(fnv1a('a')).not.toBe(fnv1a('b'));
    });

    it('returns an unsigned 32-bit integer', () => {
        const hash = fnv1a('anything');
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(2 ** 32);
    });
});

describe('hasLeadingEmoji', () => {
    it.each(['🚀 rocket launch', '✨ shiny', '  ✨ with spaces'])(
        'detects emoji in %s',
        (input) => {
            expect(hasLeadingEmoji(input)).toBe(true);
        },
    );

    it.each(['plain text', 'feat: add', '123 numbers'])(
        'returns false for %s',
        (input) => {
            expect(hasLeadingEmoji(input)).toBe(false);
        },
    );
});

describe('matchesAny', () => {
    it('returns true on first matching pattern', () => {
        expect(matchesAny('Merge branch main', ['^Merge'])).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(matchesAny('merge ok', ['^MERGE'])).toBe(true);
    });

    it('returns false when nothing matches', () => {
        expect(matchesAny('hello', ['^bye'])).toBe(false);
    });

    it('skips malformed regex without throwing', () => {
        expect(() => matchesAny('hello', ['([bad'])).not.toThrow();
        expect(matchesAny('hello', ['([bad', '^hello'])).toBe(true);
    });
});

describe('pickEmoji', () => {
    it('returns an emoji from the default pool', () => {
        const emoji = pickEmoji();
        expect(DEFAULT_EMOJIS).toContain(emoji);
    });

    it('returns an emoji from a custom pool when configured', () => {
        const config = resolveConfig({ emojis: ['🦄', '🌈'] });
        const emoji = pickEmoji({ config });
        expect(['🦄', '🌈']).toContain(emoji);
    });

    it('returns the semantic emoji for a recognised commit type', () => {
        const config = resolveConfig({ semantic: true });
        expect(pickEmoji({ message: 'feat: add thing', config })).toBe(
            SEMANTIC_EMOJIS.feat,
        );
        expect(pickEmoji({ message: 'fix(scope): bug', config })).toBe(
            SEMANTIC_EMOJIS.fix,
        );
    });

    it('falls through to random selection for unknown semantic types', () => {
        const config = resolveConfig({ semantic: true });
        const emoji = pickEmoji({ message: 'unknown: x', config });
        expect(DEFAULT_EMOJIS).toContain(emoji);
    });

    it('is deterministic when configured', () => {
        const config = resolveConfig({ deterministic: true });
        const a = pickEmoji({ message: 'identical message', config });
        const b = pickEmoji({ message: 'identical message', config });
        expect(a).toBe(b);
    });
});

describe('transformMessage', () => {
    it('prepends an emoji and separator to a plain message', () => {
        const result = transformMessage('hello world', DEFAULT_CONFIG);
        expect(result.endsWith('hello world')).toBe(true);
        expect(result.length).toBeGreaterThan('hello world'.length);
    });

    it.each([
        'Merge branch "main"',
        'Revert "feat: broken"',
        'fixup! feat: thing',
        'squash! fix: bug',
        'amend! perf: tweak',
    ])('does not touch %s', (message) => {
        expect(transformMessage(message, DEFAULT_CONFIG)).toBe(message);
    });

    it('is idempotent when the message already has a leading emoji', () => {
        const input = '🚀 already has an emoji';
        expect(transformMessage(input, DEFAULT_CONFIG)).toBe(input);
    });

    it('respects the MAGIK_MOJI_DISABLE env var', () => {
        process.env[DISABLE_ENV_VAR] = '1';
        try {
            expect(transformMessage('plain', DEFAULT_CONFIG)).toBe('plain');
        } finally {
            delete process.env[DISABLE_ENV_VAR];
        }
    });

    it('skips messages on configured branches', () => {
        const config = resolveConfig({ skipBranches: ['^release/'] });
        expect(transformMessage('plain', config, 'release/v1')).toBe('plain');
    });

    it('appends instead of prepending when position=suffix', () => {
        const config = resolveConfig({
            position: 'suffix',
            deterministic: true,
            emojis: ['🦄'],
        });
        const result = transformMessage('hi', config);
        expect(result.trimEnd().endsWith('🦄')).toBe(true);
        expect(result.endsWith('\n')).toBe(true);
    });

    it('uses the configured separator', () => {
        const config = resolveConfig({
            emojis: ['🦄'],
            deterministic: true,
            separator: ' | ',
        });
        expect(transformMessage('msg', config)).toBe('🦄 | msg');
    });
});

describe('addEmoji (file I/O)', () => {
    let tmp: string;

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'magik-moji-hook-'));
    });

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it('writes a transformed message back to disk', () => {
        const file = path.join(tmp, 'COMMIT_EDITMSG');
        fs.writeFileSync(file, 'hello world');
        addEmoji(file, resolveConfig({ emojis: ['🦄'], deterministic: true }));
        expect(fs.readFileSync(file, 'utf8')).toBe('🦄  hello world');
    });

    it('leaves the file untouched when skipped', () => {
        const file = path.join(tmp, 'COMMIT_EDITMSG');
        fs.writeFileSync(file, 'Merge branch main');
        addEmoji(file, DEFAULT_CONFIG);
        expect(fs.readFileSync(file, 'utf8')).toBe('Merge branch main');
    });

    it('is idempotent on repeated invocation', () => {
        const file = path.join(tmp, 'COMMIT_EDITMSG');
        fs.writeFileSync(file, 'hello');
        const config = resolveConfig({ emojis: ['🦄'], deterministic: true });
        addEmoji(file, config);
        const afterFirst = fs.readFileSync(file, 'utf8');
        addEmoji(file, config);
        expect(fs.readFileSync(file, 'utf8')).toBe(afterFirst);
    });
});

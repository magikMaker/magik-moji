import {
    CONVENTIONAL_COMMIT_REGEX,
    DEFAULT_EMOJIS,
    SEMANTIC_EMOJIS,
} from './emojis.js';

describe('DEFAULT_EMOJIS', () => {
    it('contains no duplicate entries', () => {
        const set = new Set(DEFAULT_EMOJIS);
        expect(set.size).toBe(DEFAULT_EMOJIS.length);
    });

    it('contains only non-empty single-grapheme strings', () => {
        for (const e of DEFAULT_EMOJIS) {
            expect(typeof e).toBe('string');
            expect(e.length).toBeGreaterThan(0);
        }
    });

    it('is frozen to prevent accidental mutation', () => {
        expect(Object.isFrozen(DEFAULT_EMOJIS)).toBe(true);
    });
});

describe('SEMANTIC_EMOJIS', () => {
    it('has the canonical conventional commit keys', () => {
        for (const key of ['feat', 'fix', 'docs', 'refactor', 'perf']) {
            expect(SEMANTIC_EMOJIS[key]).toBeDefined();
        }
    });

    it('is frozen', () => {
        expect(Object.isFrozen(SEMANTIC_EMOJIS)).toBe(true);
    });
});

describe('CONVENTIONAL_COMMIT_REGEX', () => {
    it.each([
        ['feat: add thing', 'feat'],
        ['fix(scope): thing', 'fix'],
        ['docs!: breaking', 'docs'],
        ['chore(release): v1', 'chore'],
    ])('matches %s', (input, expected) => {
        const match = input.match(CONVENTIONAL_COMMIT_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe(expected);
    });

    it.each([
        'no prefix here',
        '🚀 already has an emoji',
        'feat no colon',
        ':leading colon',
    ])('does not match %s', (input) => {
        expect(input.match(CONVENTIONAL_COMMIT_REGEX)).toBeNull();
    });
});

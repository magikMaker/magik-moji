import magikMoji, {
    DEFAULT_CONFIG,
    DEFAULT_EMOJIS,
    DEFAULT_SKIP_PATTERNS,
    DISABLE_ENV_VAR,
    SEMANTIC_EMOJIS,
    addEmoji,
    fnv1a,
    hasLeadingEmoji,
    loadConfig,
    matchesAny,
    pickEmoji,
    resolveConfig,
    transformMessage,
} from './index.js';

describe('public API surface', () => {
    it('exports the documented named members', () => {
        expect(DEFAULT_EMOJIS.length).toBeGreaterThan(0);
        expect(DEFAULT_SKIP_PATTERNS.length).toBeGreaterThan(0);
        expect(DEFAULT_CONFIG).toBeDefined();
        expect(SEMANTIC_EMOJIS.feat).toBeDefined();
        expect(typeof addEmoji).toBe('function');
        expect(typeof fnv1a).toBe('function');
        expect(typeof hasLeadingEmoji).toBe('function');
        expect(typeof loadConfig).toBe('function');
        expect(typeof matchesAny).toBe('function');
        expect(typeof pickEmoji).toBe('function');
        expect(typeof resolveConfig).toBe('function');
        expect(typeof transformMessage).toBe('function');
        expect(DISABLE_ENV_VAR).toBe('MAGIK_MOJI_DISABLE');
    });

    it('exposes a default export mirroring the named helpers', () => {
        expect(magikMoji.pickEmoji).toBe(pickEmoji);
        expect(magikMoji.transformMessage).toBe(transformMessage);
        expect(magikMoji.loadConfig).toBe(loadConfig);
    });
});

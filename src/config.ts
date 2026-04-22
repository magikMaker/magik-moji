import * as fs from 'fs';
import * as path from 'path';

/**
 * User-facing configuration shape. Every field is optional — omitted
 * fields fall back to {@link DEFAULT_CONFIG}.
 */
export interface MagikMojiConfig {
    /**
     * Override the default emoji pool. If provided and non-empty, random
     * selection draws from this list instead of {@link DEFAULT_EMOJIS}.
     */
    emojis?: readonly string[];

    /**
     * String placed between the emoji and the commit message.
     * Defaults to two spaces, matching the historic magik-moji output.
     */
    separator?: string;

    /**
     * Where the emoji is inserted relative to the existing message.
     * `prefix` (default) prepends; `suffix` appends.
     */
    position?: 'prefix' | 'suffix';

    /**
     * Array of regular-expression source strings. If any pattern matches
     * the commit message, no emoji is added. Patterns are matched
     * case-insensitively.
     */
    skipPatterns?: readonly string[];

    /**
     * Array of regular-expression source strings matched against the
     * current branch name. If any matches, no emoji is added.
     */
    skipBranches?: readonly string[];

    /**
     * When true, and the message starts with a Conventional-Commit type
     * (e.g. `feat:`, `fix(scope):`), a type-appropriate emoji from
     * {@link SEMANTIC_EMOJIS} is used instead of a random one.
     */
    semantic?: boolean;

    /**
     * When true, the emoji is chosen deterministically from the commit
     * message body (FNV-1a hash modulo pool length) so the same message
     * always receives the same emoji.
     */
    deterministic?: boolean;
}

/**
 * Strict, fully-resolved internal configuration. {@link loadConfig} always
 * returns a value of this shape, even when the project has no config file.
 */
export interface ResolvedConfig {
    emojis: readonly string[] | null;
    separator: string;
    position: 'prefix' | 'suffix';
    skipPatterns: readonly string[];
    skipBranches: readonly string[];
    semantic: boolean;
    deterministic: boolean;
}

/**
 * Default commit-message patterns that should never receive an emoji.
 * Merge / revert / fixup! / squash! / amend! are produced by git itself or
 * by interactive-rebase workflows where injecting an emoji would break
 * autosquash detection.
 */
export const DEFAULT_SKIP_PATTERNS: readonly string[] = Object.freeze([
    '^Merge ',
    '^Revert ',
    '^fixup!',
    '^squash!',
    '^amend!',
]);

/**
 * The defaults used when no user configuration is supplied.
 */
export const DEFAULT_CONFIG: ResolvedConfig = Object.freeze({
    emojis: null,
    separator: '  ',
    position: 'prefix',
    skipPatterns: DEFAULT_SKIP_PATTERNS,
    skipBranches: [],
    semantic: false,
    deterministic: false,
});

/** File names searched (in order) for a standalone config file. */
const RC_FILENAMES: readonly string[] = [
    '.magikmojirc',
    '.magikmojirc.json',
    'magikmoji.config.json',
];

/**
 * Merge a partial user config onto {@link DEFAULT_CONFIG}, returning a
 * fully-resolved configuration. Exported for unit testing.
 *
 * @param user - a partial user configuration (may be undefined)
 * @returns a resolved configuration with every field populated
 */
export function resolveConfig(user?: MagikMojiConfig): ResolvedConfig {
    if (!user) return { ...DEFAULT_CONFIG };

    return {
        emojis:
            user.emojis && user.emojis.length > 0
                ? [...user.emojis]
                : DEFAULT_CONFIG.emojis,
        separator:
            typeof user.separator === 'string'
                ? user.separator
                : DEFAULT_CONFIG.separator,
        position: user.position ?? DEFAULT_CONFIG.position,
        skipPatterns:
            user.skipPatterns && user.skipPatterns.length > 0
                ? [...user.skipPatterns]
                : DEFAULT_CONFIG.skipPatterns,
        skipBranches:
            user.skipBranches && user.skipBranches.length > 0
                ? [...user.skipBranches]
                : DEFAULT_CONFIG.skipBranches,
        semantic: user.semantic ?? DEFAULT_CONFIG.semantic,
        deterministic: user.deterministic ?? DEFAULT_CONFIG.deterministic,
    };
}

/**
 * Read and parse a JSON file, returning the parsed value or `null` on any
 * error (missing file, invalid JSON). Errors are swallowed deliberately:
 * a broken config should never block a commit.
 *
 * @param filePath - absolute path to the JSON file
 * @returns the parsed value or `null`
 */
function readJsonSafe(filePath: string): unknown {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * Find a user configuration, searching (in order):
 *  1. `.magikmojirc`, `.magikmojirc.json`, `magikmoji.config.json`
 *  2. The `magikMoji` key in `package.json`
 *
 * @param cwd - directory to search (defaults to `process.cwd()`)
 * @returns the fully-resolved configuration
 */
export function loadConfig(cwd: string = process.cwd()): ResolvedConfig {
    for (const name of RC_FILENAMES) {
        const rcPath = path.join(cwd, name);
        if (fs.existsSync(rcPath)) {
            const parsed = readJsonSafe(rcPath) as MagikMojiConfig | null;
            if (parsed && typeof parsed === 'object') {
                return resolveConfig(parsed);
            }
        }
    }

    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const parsed = readJsonSafe(pkgPath) as
            | { magikMoji?: MagikMojiConfig }
            | null;
        if (parsed && parsed.magikMoji) {
            return resolveConfig(parsed.magikMoji);
        }
    }

    return { ...DEFAULT_CONFIG };
}

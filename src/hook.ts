import * as fs from 'fs';
import { execSync } from 'child_process';
import {
    CONVENTIONAL_COMMIT_REGEX,
    DEFAULT_EMOJIS,
    SEMANTIC_EMOJIS,
} from './emojis.js';
import {
    DEFAULT_CONFIG,
    loadConfig,
    type ResolvedConfig,
} from './config.js';

/**
 * Matches a commit message that already starts with a "pictographic"
 * Unicode codepoint — i.e. any emoji. Used to guarantee idempotency so
 * running the hook twice (for example on `git commit --amend`) does not
 * stack emojis.
 */
const LEADING_EMOJI_REGEX = /^\s*\p{Extended_Pictographic}/u;

/**
 * Environment variable that, when set to a non-empty string, disables the
 * emoji prepending for a single commit. Example:
 *
 * ```sh
 * MAGIK_MOJI_DISABLE=1 git commit -m "plain message"
 * ```
 */
export const DISABLE_ENV_VAR = 'MAGIK_MOJI_DISABLE';

/**
 * Options accepted by {@link pickEmoji}.
 */
export interface PickEmojiOptions {
    /** The commit message, used for semantic/deterministic selection. */
    readonly message?: string;
    /** A pre-resolved configuration (overrides file discovery). */
    readonly config?: ResolvedConfig;
}

/**
 * Small, dependency-free FNV-1a 32-bit hash, used for deterministic
 * emoji selection. FNV-1a is fast, has good distribution for short
 * strings, and does not need the Node crypto module.
 *
 * @param input - arbitrary string
 * @returns an unsigned 32-bit integer hash
 */
export function fnv1a(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/**
 * Pick a single emoji for the given commit message according to the
 * resolved configuration. The selection strategy is:
 *
 *  1. If `semantic` is enabled and the message starts with a Conventional
 *     Commit type whose emoji is known, return that emoji.
 *  2. If `deterministic` is enabled, hash the message and index into the
 *     pool.
 *  3. Otherwise, return a uniformly random emoji.
 *
 * @param options - picker options (see {@link PickEmojiOptions})
 * @returns a single emoji grapheme
 */
export function pickEmoji(options: PickEmojiOptions = {}): string {
    const config = options.config ?? DEFAULT_CONFIG;
    const pool =
        config.emojis && config.emojis.length > 0
            ? config.emojis
            : DEFAULT_EMOJIS;
    const message = options.message ?? '';

    if (config.semantic) {
        const match = message.match(CONVENTIONAL_COMMIT_REGEX);
        if (match) {
            const type = match[1].toLowerCase();
            const semantic = SEMANTIC_EMOJIS[type];
            if (semantic) return semantic;
        }
    }

    if (config.deterministic && message.length > 0) {
        return pool[fnv1a(message) % pool.length];
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns `true` when the message already begins with an emoji (ignoring
 * leading whitespace). Used to short-circuit the hook and avoid stacking
 * emojis when the user already wrote one, or when the hook fires twice.
 *
 * @param message - raw commit message text
 */
export function hasLeadingEmoji(message: string): boolean {
    return LEADING_EMOJI_REGEX.test(message);
}

/**
 * Returns `true` when any pattern in `patterns` matches `value`.
 * Patterns are treated as case-insensitive regex source strings. Invalid
 * regexes are ignored silently.
 *
 * @param value - the string to test
 * @param patterns - array of regex source strings
 */
export function matchesAny(
    value: string,
    patterns: readonly string[],
): boolean {
    for (const pattern of patterns) {
        try {
            if (new RegExp(pattern, 'i').test(value)) return true;
        } catch {
            // Ignore malformed patterns — never block a commit on config.
        }
    }
    return false;
}

/**
 * Shell-out to git to read the current branch name. Returns `null` when
 * git is unavailable or the command fails (for example outside a repo).
 *
 * @returns the current branch name, or `null`
 */
export function getCurrentBranch(): string | null {
    try {
        const out = execSync('git rev-parse --abbrev-ref HEAD', {
            stdio: ['ignore', 'pipe', 'ignore'],
            encoding: 'utf8',
        });
        const trimmed = out.trim();
        return trimmed.length > 0 ? trimmed : null;
    } catch {
        return null;
    }
}

/**
 * Pure transformation: given a commit message and configuration, return
 * the message that should be written back to disk. Contains all the
 * business logic for skipping, idempotency and positioning — `addEmoji`
 * is just I/O around this function.
 *
 * @param message - the original commit message
 * @param config - a resolved configuration
 * @param branch - current branch name (may be `null` if unknown)
 * @returns the transformed message, or the original if no emoji applies
 */
export function transformMessage(
    message: string,
    config: ResolvedConfig = DEFAULT_CONFIG,
    branch: string | null = null,
): string {
    if (process.env[DISABLE_ENV_VAR]) return message;
    if (hasLeadingEmoji(message)) return message;
    if (matchesAny(message, config.skipPatterns)) return message;
    if (branch && matchesAny(branch, config.skipBranches)) return message;

    const emoji = pickEmoji({ message, config });

    return config.position === 'suffix'
        ? `${message.replace(/\n*$/, '')}${config.separator}${emoji}\n`
        : `${emoji}${config.separator}${message}`;
}

/**
 * Read the commit-message file at `filePath`, transform its contents via
 * {@link transformMessage}, and write the result back. This is the
 * function invoked from the `prepare-commit-msg` git hook.
 *
 * @param filePath - path to the commit-message file supplied by git
 * @param config - optional pre-resolved configuration (defaults to
 *                 {@link loadConfig}). Exposed for testing.
 */
export function addEmoji(
    filePath: string,
    config: ResolvedConfig = loadConfig(),
): void {
    const original = fs.readFileSync(filePath, 'utf8');
    const branch = getCurrentBranch();
    const updated = transformMessage(original, config, branch);
    if (updated !== original) {
        fs.writeFileSync(filePath, updated);
    }
}

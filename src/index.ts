import { green, red } from 'barva';
import * as magikHooks from 'magik-hooks';
import { DEFAULT_EMOJIS, SEMANTIC_EMOJIS } from './emojis.js';
import {
    DEFAULT_CONFIG,
    DEFAULT_SKIP_PATTERNS,
    loadConfig,
    resolveConfig,
    type MagikMojiConfig,
    type ResolvedConfig,
} from './config.js';
import {
    DISABLE_ENV_VAR,
    addEmoji,
    fnv1a,
    getCurrentBranch,
    hasLeadingEmoji,
    matchesAny,
    pickEmoji,
    transformMessage,
} from './hook.js';

/**
 * Magik-Moji public API.
 *
 * Exposes the core `addEmoji` entry point used by the git hook, plus
 * helpers for picking emojis, transforming messages, and managing the
 * installed `prepare-commit-msg` hook. See the README for usage.
 */

/**
 * Identifier used by magik-hooks to tag the block of shell we write into
 * `.git/hooks/prepare-commit-msg`. Kept stable across versions so old
 * installations can be cleanly removed.
 */
const HOOK_ID = 'magik-moji';

/**
 * Git hook name we attach to.
 */
const HOOK_NAME = 'prepare-commit-msg';

/**
 * Install the `prepare-commit-msg` Git hook into the current repository.
 * Idempotent: calling it repeatedly replaces the existing block rather
 * than stacking duplicates. Prints a success line via {@link green} from
 * barva.
 *
 * @param hookScriptPath - absolute path to the compiled `hook-run.js`
 *   script that should be invoked from the git hook. Callers supply
 *   this because tsup bundles `install()` into each entry file, which
 *   makes `__dirname` inside this function unreliable across entries.
 */
export function install(hookScriptPath: string): void {
    magikHooks.create(
        HOOK_NAME,
        `node "${hookScriptPath}" "$1"`,
        HOOK_ID,
    );
    process.stdout.write(
        green`✔ magik-moji installed: ${HOOK_NAME} git hook created.\n`,
    );
}

/**
 * Remove the `prepare-commit-msg` Git hook installed by {@link install}.
 * No-op when no such hook block is present.
 */
export function uninstall(): void {
    magikHooks.remove(HOOK_NAME, HOOK_ID);
    process.stdout.write(
        green`✔ magik-moji uninstalled: ${HOOK_NAME} git hook removed.\n`,
    );
}

/**
 * Print a red error message to `stderr`. Exposed for the bin scripts so
 * they can surface failures uniformly.
 *
 * @param message - the error message to display
 */
export function printError(message: string): void {
    process.stderr.write(red`✘ magik-moji: ${message}\n`);
}

export {
    DEFAULT_CONFIG,
    DEFAULT_EMOJIS,
    DEFAULT_SKIP_PATTERNS,
    DISABLE_ENV_VAR,
    SEMANTIC_EMOJIS,
    addEmoji,
    fnv1a,
    getCurrentBranch,
    hasLeadingEmoji,
    loadConfig,
    matchesAny,
    pickEmoji,
    resolveConfig,
    transformMessage,
    type MagikMojiConfig,
    type ResolvedConfig,
};

/** Default export — convenience bundle mirroring the named exports. */
export default {
    addEmoji,
    install,
    uninstall,
    pickEmoji,
    transformMessage,
    loadConfig,
    DEFAULT_EMOJIS,
    SEMANTIC_EMOJIS,
};

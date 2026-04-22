/**
 * Thin wrapper invoked by the `prepare-commit-msg` Git hook. The hook
 * passes the path to the in-progress commit-message file as `$1`, which
 * we forward to {@link addEmoji}.
 */
import { addEmoji, printError } from '../index.js';

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
    printError(
        'missing commit-message file path — is this script being called from a git hook?',
    );
    process.exit(1);
}

try {
    addEmoji(commitMsgFile);
} catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    // Never fail the commit on an internal error — a missing emoji is
    // preferable to blocking the developer's workflow.
    process.exit(0);
}

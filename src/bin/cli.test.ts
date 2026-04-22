import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DEFAULT_EMOJIS } from '../emojis.js';
import { run } from './cli.js';

/**
 * Helper: capture writes to `process.stdout` for the duration of `fn`.
 * Restores the original write implementation afterwards, even on throw.
 */
function captureStdout(fn: () => void): string {
    const original = process.stdout.write.bind(process.stdout);
    let captured = '';
    (process.stdout.write as unknown) = (
        chunk: string | Uint8Array,
    ): boolean => {
        captured += typeof chunk === 'string' ? chunk : chunk.toString();
        return true;
    };
    try {
        fn();
    } finally {
        (process.stdout.write as unknown) = original;
    }
    return captured;
}

describe('cli.run', () => {
    let tmp: string;

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'magik-moji-cli-'));
    });

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it('prints help for no command', () => {
        const out = captureStdout(() => {
            expect(run([])).toBe(0);
        });
        expect(out).toContain('magik-moji');
        expect(out).toContain('Commands');
    });

    it('prints help for --help', () => {
        const out = captureStdout(() => {
            expect(run(['--help'])).toBe(0);
        });
        expect(out).toContain('Usage');
    });

    it('returns exit code 1 for an unknown command', () => {
        captureStdout(() => {
            expect(run(['does-not-exist'])).toBe(1);
        });
    });

    it('pick prints an emoji from the default pool', () => {
        const out = captureStdout(() => {
            expect(run(['pick'])).toBe(0);
        });
        expect(DEFAULT_EMOJIS).toContain(out.trim());
    });

    it('list prints the full default pool', () => {
        const out = captureStdout(() => {
            expect(run(['list'])).toBe(0);
        });
        for (const emoji of DEFAULT_EMOJIS) {
            expect(out).toContain(emoji);
        }
    });

    it('add transforms a commit-message file in place', () => {
        const file = path.join(tmp, 'COMMIT_EDITMSG');
        fs.writeFileSync(file, 'hello world');
        captureStdout(() => {
            expect(run(['add', file])).toBe(0);
        });
        const content = fs.readFileSync(file, 'utf8');
        expect(content.endsWith('hello world')).toBe(true);
        expect(content.length).toBeGreaterThan('hello world'.length);
    });

    it('add fails when the file is missing', () => {
        captureStdout(() => {
            expect(run(['add', path.join(tmp, 'nope.txt')])).toBe(1);
        });
    });

    it('add fails when no path is supplied', () => {
        captureStdout(() => {
            expect(run(['add'])).toBe(1);
        });
    });
});

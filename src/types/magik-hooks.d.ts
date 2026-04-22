/**
 * Minimal type declarations for the `magik-hooks` CommonJS package,
 * which currently ships no types of its own.
 *
 * @see https://github.com/magikMaker/magik-hooks
 */
declare module 'magik-hooks' {
    /**
     * Create a Git hook. Idempotent — existing blocks tagged with `id`
     * are replaced rather than duplicated.
     *
     * @param hook - the Git hook name, e.g. `prepare-commit-msg`
     * @param commands - shell commands to execute inside the hook
     * @param id - optional identifier distinguishing this block from
     *             other magikMaker tools sharing the same hook
     */
    export function create(hook: string, commands: string, id?: string): void;

    /**
     * Remove a previously-created Git hook block. No-op if the block
     * does not exist.
     *
     * @param hook - the Git hook name
     * @param id - optional identifier supplied during creation
     */
    export function remove(hook: string, id?: string): void;
}

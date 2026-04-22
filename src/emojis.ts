/**
 * Default emoji pool and semantic (Conventional Commit) mapping used by
 * {@link ../index.ts | magik-moji} when no custom pool is configured.
 *
 * The list is intentionally wide but curated — each entry is a single
 * grapheme so regex-based idempotency checks can rely on
 * `\p{Extended_Pictographic}`.
 *
 * @see http://getemoji.com/
 * @see https://gitmoji.dev
 * @see https://www.conventionalcommits.org/
 */

/**
 * The default pool of emojis prepended to a commit message when no custom
 * pool is provided. Duplicates have been removed.
 */
export const DEFAULT_EMOJIS: readonly string[] = Object.freeze([
    '🚀', // rocket — deploy / ship
    '🎉', // party popper — initial commit / celebration
    '🔖', // bookmark — release / version tag
    '✨', // sparkles — new feature
    '🐛', // bug — bug fix
    '📇', // card index — metadata / index
    '♻️', // recycling — refactor
    '📚', // books — documentation
    '🌐', // globe — i18n / networking
    '🐎', // horse — performance
    '💄', // lipstick — UI / styling
    '🔧', // wrench — configuration / tooling
    '🚨', // siren — linter / warnings
    '💩', // pile of poo — bad code, to refactor later
    '🚧', // construction sign — work in progress
    '🎨', // palette — improve code structure / format
    '📰', // newspaper — news / release notes
    '📝', // memo — prose / copy change
    '🚑', // ambulance — critical hotfix
    '🐧', // penguin — linux
    '🍎', // apple — macOS / iOS
    '🏁', // chequered flag — windows
    '🔥', // fire — remove code / files
    '🚜', // tractor — major refactor / migration
    '☔️', // umbrella — tests / coverage
    '🔬', // microscope — investigation / analysis
    '💚', // green heart — CI build fixed
    '🔒', // lock — security fix
    '⬆️', // arrow up — upgrade dependency
    '⬇️', // arrow down — downgrade dependency
    '⏩', // fast forward — rebase / forward
    '⏪', // rewind — revert
    '👕', // shirt — lint / style
    '♿️', // accessibility — a11y
    '💎', // gem — release
    '🔈', // speaker — add logging
    '🔇', // muted — remove logging
    '⚡️', // zap — performance
    '💡', // bulb — documentation inside source
    '❄️', // snowflake — freeze / pin
    '🎀', // ribbon — prettify
    '🐘', // elephant — database / big data
    '🐬', // dolphin — MySQL
    '🍃', // leaf — MongoDB / lightweight
    '🏦', // bank — finance / money
    '🐳', // whale — docker
    '🤝', // handshake — merge / agreement
]);

/**
 * Mapping from Conventional Commit type (and a few common synonyms) to a
 * semantically appropriate emoji. Used when `semantic: true` is enabled in
 * the configuration and the commit message starts with a recognised type.
 *
 * @see https://www.conventionalcommits.org/
 */
export const SEMANTIC_EMOJIS: Readonly<Record<string, string>> = Object.freeze({
    build: '🔧',
    chore: '🔧',
    ci: '💚',
    docs: '📚',
    feat: '✨',
    feature: '✨',
    fix: '🐛',
    hotfix: '🚑',
    perf: '⚡️',
    refactor: '♻️',
    release: '🔖',
    revert: '⏪',
    security: '🔒',
    style: '💄',
    test: '☔️',
    tests: '☔️',
    wip: '🚧',
});

/**
 * Regex matching a Conventional-Commit-style prefix at the start of a
 * commit message. Captures the commit type (group 1) so it can be looked
 * up in {@link SEMANTIC_EMOJIS}. Example matches:
 * `feat:`, `fix(scope):`, `docs!:`.
 */
export const CONVENTIONAL_COMMIT_REGEX = /^([a-zA-Z]+)(?:\([^)]+\))?!?:\s/;

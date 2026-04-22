# magik-moji

Automagically prepend a random emoji to every git commit message via a
`prepare-commit-msg` hook.

[![npm version](https://img.shields.io/npm/v/magik-moji.svg)](https://www.npmjs.com/package/magik-moji)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎲 Random emoji prepended to every commit
- 🧠 Optional **semantic** mode — type-based emojis for Conventional Commits
- 🔁 Optional **deterministic** mode — same message always gets the same emoji
- 🛡 **Idempotent** — won't stack emojis on `git commit --amend` or rebases
- 🙈 Skips `Merge`, `Revert`, `fixup!`, `squash!`, `amend!` out of the box
- ⚙️ Configurable via `.magikmojirc`, `magikmoji.config.json`, or
  `package.json#magikMoji`
- 🔕 One-off opt-out via `MAGIK_MOJI_DISABLE=1`
- 🧪 Fully covered by unit tests, written in strict TypeScript
- 📦 Zero runtime overhead — hook only runs at commit time

## Install

```bash
# yarn (recommended)
yarn add --dev magik-moji

# npm
npm install --save-dev magik-moji

# pnpm
pnpm add -D magik-moji

# bun
bun add -d magik-moji
```

The `postinstall` lifecycle automatically installs the
`prepare-commit-msg` git hook in your repository. On environments without
a Git working tree (CI, Docker build stages), the install step is a
no-op — it will never fail your `install`.

## Usage

Just commit:

```bash
$ git commit -m "add login flow"
# actual commit message: "✨  add login flow"
```

### Skip a single commit

```bash
MAGIK_MOJI_DISABLE=1 git commit -m "plain message"
```

### CLI

`magik-moji` ships a small CLI (available as `npx magik-moji` or
`yarn magik-moji` after install):

```bash
magik-moji install          # install the prepare-commit-msg hook
magik-moji uninstall        # remove the hook
magik-moji add <file>       # transform a commit-message file in place
magik-moji pick [message]   # print one emoji using active config
magik-moji list             # print every emoji in the active pool
magik-moji help             # print the help text
```

## Configuration

Create one of the following files in your project root (first match
wins), or add a `magikMoji` key to your `package.json`:

- `.magikmojirc`
- `.magikmojirc.json`
- `magikmoji.config.json`

Example:

```json
{
  "emojis": ["🦄", "🌈", "🚀"],
  "separator": " — ",
  "position": "prefix",
  "skipPatterns": ["^Merge ", "^Revert ", "^WIP"],
  "skipBranches": ["^release/"],
  "semantic": true,
  "deterministic": false
}
```

| Option          | Type                    | Default                                                        | Description                                                                                                                                |
| --------------- | ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `emojis`        | `string[]`              | built-in list                                                  | Override the pool of emojis eligible for selection.                                                                                        |
| `separator`     | `string`                | `"  "` (two spaces)                                            | Inserted between the emoji and the message.                                                                                                |
| `position`      | `"prefix" \| "suffix"`  | `"prefix"`                                                     | Where to place the emoji.                                                                                                                  |
| `skipPatterns`  | `string[]`              | `["^Merge ", "^Revert ", "^fixup!", "^squash!", "^amend!"]`    | Regex source strings; matching messages get no emoji.                                                                                      |
| `skipBranches`  | `string[]`              | `[]`                                                           | Regex source strings; when the current branch matches, no emoji is added.                                                                  |
| `semantic`      | `boolean`               | `false`                                                        | If the message starts with a Conventional Commit type (`feat:`, `fix(scope):`, etc.), use a type-appropriate emoji instead of random. |
| `deterministic` | `boolean`               | `false`                                                        | Hash the message (FNV-1a) so identical messages always receive the same emoji. Ignored when `semantic` matches.                            |

## Programmatic API

```ts
import magikMoji, {
  pickEmoji,
  transformMessage,
  loadConfig,
  DEFAULT_EMOJIS,
  SEMANTIC_EMOJIS,
} from 'magik-moji';

const config = loadConfig();
const emoji = pickEmoji({ message: 'feat: add thing', config });
const next = transformMessage('feat: add thing', config);
```

### Exports

| Export                | Kind      | Description                                                                 |
| --------------------- | --------- | --------------------------------------------------------------------------- |
| `install()`           | function  | Write the `prepare-commit-msg` hook into `.git/hooks`.                      |
| `uninstall()`         | function  | Remove the hook block written by `install`.                                 |
| `addEmoji(path)`      | function  | Transform a commit-message file in place (called by the hook).              |
| `transformMessage()`  | function  | Pure function: message + config → new message.                              |
| `pickEmoji()`         | function  | Return a single emoji based on the resolved config.                         |
| `loadConfig(cwd?)`    | function  | Discover & parse a user config.                                             |
| `resolveConfig()`     | function  | Merge a partial user config onto the defaults.                              |
| `hasLeadingEmoji()`   | function  | `true` when a string starts with a pictographic Unicode codepoint.          |
| `matchesAny()`        | function  | `true` when any regex source in an array matches the input.                 |
| `fnv1a()`             | function  | Small FNV-1a 32-bit hash used for deterministic selection.                  |
| `getCurrentBranch()`  | function  | Best-effort: read the current branch via `git`.                             |
| `DEFAULT_EMOJIS`      | constant  | The built-in emoji pool.                                                    |
| `SEMANTIC_EMOJIS`     | constant  | Conventional-commit-type → emoji mapping.                                   |
| `DEFAULT_CONFIG`      | constant  | The fully-resolved defaults.                                                |
| `DEFAULT_SKIP_PATTERNS` | constant | The default skip-patterns array.                                            |
| `DISABLE_ENV_VAR`     | constant  | The name of the env var that disables the hook (`"MAGIK_MOJI_DISABLE"`).    |

## Uninstall

```bash
yarn remove magik-moji
# or: npm uninstall --save-dev magik-moji
```

The `preuninstall` lifecycle removes the hook block from
`.git/hooks/prepare-commit-msg`. You can also remove it manually:

```bash
yarn magik-moji uninstall
```

## Development

```bash
# install
yarn

# lint + tests
yarn lint
yarn test

# production build (dist/)
yarn build
```

Tests live next to the files they cover as `*.test.ts`.

## Releasing

Bump the `version` field in `package.json`, update `CHANGELOG.md`, commit
and push to `main`, then:

```bash
GITHUB_TOKEN=ghp_… yarn release
```

`yarn release` creates a GitHub release named `Release <version>` with
tag `v<version>`. The tag is created server-side by GitHub if it doesn't
exist yet, so no manual `git tag` / `git push --tags` is required.
Release notes are auto-filled from the matching section of
`CHANGELOG.md`; pass a string argument to override:

```bash
yarn release "One-line override for the release notes"
```

The token needs `Contents: read and write` on this repo.

## Emoji Pool

```text
🚀 🎉 🔖 ✨ 🐛 📇 ♻️ 📚 🌐 🐎 💄 🔧 🚨 💩 🚧 🎨 📰 📝 🚑 🐧
🍎 🏁 🔥 🚜 ☔️ 🔬 💚 🔒 ⬆️ ⬇️ ⏩ ⏪ 👕 ♿️ 💎 🔈 🔇 ⚡️ 💡 ❄️
🎀 🐘 🐬 🍃 🏦 🐳 🤝
```

## License

MIT © [Bjørn Wikkeling](https://bjorn.wikkeling.com)

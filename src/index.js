const fs = require('fs');
const path = require('path');

/**
 * use magik-hooks to handle Git hooks manipulation
 *
 * @access private
 * @link https://github.com/magikMaker/magik-hooks
 * @type {{create: module.exports.create, remove: module.exports.remove}}
 */
const magikHooks = require('magik-hooks');

/**
 * Constants to change the text colours in `stdout`, use `ANSI_COLOURS.RESET`
 * to reset to default.
 *
 * @example
 * <code>
 * process.stdout.write(`${ANSI_COLOURS.YELLOW}text in yellow${ANSI_COLOURS.RESET}`);
 * </code>
 * @access private
 * @type {{BLACK: string, BLUE: string, CYAN: string, DEFAULT: string, GREEN: string, MAGENTA: string, RED: string, RESET: string, WHITE: string, YELLOW: string}}
 */
const ANSI_COLOURS = {
    BLACK: '\x1b[30m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    DEFAULT: '\x1b[0m',
    GREEN: '\x1b[32m',
    MAGENTA: '\x1b[35m',
    RED: '\x1b[31m',
    RESET: '\x1b[0m',
    WHITE: '\x1b[37m',
    YELLOW: '\x1b[33m'
};

/**
 * Identifier used by magik-hooks
 *
 * @access private
 * @type {string}
 */
const id = 'magik-moji';

/**
 * Returns a random emoji
 *
 * @todo implement more emojis
 * @link http://getemoji.com/
 * @link https://www.npmjs.com/package/utf8
 * @link http://www.recursion.org/2016/6/19/displaying-emoji-in-git-log
 * @link https://github.com/dannyfritz/commit-message-emoji
 * @returns {string}
 */
function getRandomEmoji() {
    const emojis = [
        '🚀', // rocket
        '🎉', // Party Popper
        '🔖', // Bookmark
        '✨', // Sparkles
        '🐛', // Bug
        '📇', // Card Index
        '♻ ', // ️Black Universal Recycling Symbol
        '📚', // Books
        '🌐', // Globe With Meridians
        '🐎', // Horse
        '💄', // Lipstick
        '🔧', // Wrench
        '🚨', // Police Cars Revolving Light
        '💩', // Pile of Poo
        '🚧', // Construction Sign
        '🎨',
        '📰',
        '📝',
        '🚑',
        '🐧',
        '🍎',
        '🏁',
        '🔥',
        '🚜',
        '🎨',
        '☔️',
        '🔬',
        '💚',
        '🔒',
        '⬆️',
        '⬇️',
        '⏩',
        '⏪',
        '👕',
        '♿️',
        '💎',
        '🔈',
        '🔇',
        '⚡️',
        '💡',
        '❄️',
        '🎀',
        '🐘',
        '🐬',
        '🍃',
        '🏦',
        '🐳',
        '🤝'
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Automagically adds a random emoji to a git commit message
 *
 * @type {{create: module.exports.create, remove: module.exports.remove, addEmoji: module.exports.addEmoji}}
 */
module.exports = {

    /**
     * Creates a git hook which will add a random Emoji to the commit message
     * message
     *
     * @access public
     * @returns {void}
     */
    createCommitMessageHook: function() {
        magikHooks.create('prepare-commit-msg', `node ${path.join(__dirname, 'bin', 'hook.js')} "$1"`, id);
        process.stdout.write(`${ANSI_COLOURS.GREEN}✔${ANSI_COLOURS.RESET} magik-moji installed: prepare-commit-msg git hook created.\n`);
    },

    /**
     * Removes the prepare commit message git hook
     *
     * @access public
     * @returns {void}
     */
    removeCommitMessageHook: function() {
        magikHooks.remove('prepare-commit-msg', id);
        process.stdout.write(`${ANSI_COLOURS.GREEN}✔${ANSI_COLOURS.RESET} magik-moji uninstalled: prepare-commit-msg git hook removed\n`);
    },

    /**
     * Adds a random emoji to the git commit message, this is called from the
     * git hook
     *
     * @param {string} filePath the path to the git commit message file
     * @returns {void} the new commit message with appended emoji is written to file
     */
    addEmoji: function(filePath) {
        fs.readFile(filePath, 'utf8', (err, commitMessage) => {
            if(!/^Merge/.test(commitMessage)) {
                commitMessage = getRandomEmoji() + '  ' + commitMessage;
            }

            fs.writeFile(filePath, commitMessage, err => {
                if(err){
                    /* eslint-disable no-console */
                    console.error(err);
                    /* eslint-disable no-console */

                    process.exitCode = 1;
                } else{
                    process.exit(0);
                }
            });
        });
    }
};

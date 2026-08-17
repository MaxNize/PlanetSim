module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert'],
        ],
        'scope-enum': [
            2,
            'always',
            ['wasm', 'ui', 'physics', 'perf', 'build', 'docs', 'deps', 'canvas', 'ci', 'miniview', 'sandbox', 'test', 'toast'],
        ],
        // Relaxed from the config-conventional default: 'sentence-case'/'start-case' false-flag a
        // subject that merely starts with a capitalized proper noun (e.g. "Figma-like ..."). Still
        // blocks the unambiguous cases (PascalCase, UPPERCASE).
        'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
    },
};

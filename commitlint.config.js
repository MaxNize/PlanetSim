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
            ['wasm', 'ui', 'physics', 'perf', 'build', 'docs', 'deps'],
        ],
    },
};

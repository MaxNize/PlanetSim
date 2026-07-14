module.exports = {
    extends: ['stylelint-config-standard'],
    rules: {
        'selector-class-pattern': ['^[a-z0-9]+(-[a-z0-9]+)*$', {
            "message": 'Expected class selector to be kebab-case (e.g., my-class-name)'
        }]
    }
}

const fs = require('fs');
const glob = require('glob');

const patterns = ['Docs/**/*.md', 'README.md', 'CONTRIBUTING.md'];
let changed = 0;

patterns.forEach(pattern => {
    glob.sync(pattern, { nodir: true }).forEach(file => {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        let inCode = false;
        let modified = false;
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(/^(\s*)```(\w+)?\s*$/);
            if (m) {
                const indent = m[1] || '';
                const lang = m[2];
                if (!inCode) {
                    if (!lang) {
                        lines[i] = indent + '```text';
                        modified = true;
                    }
                    inCode = true;
                } else {
                    if (lang) {
                        lines[i] = indent + '```';
                        modified = true;
                    }
                    inCode = false;
                }
            }
        }
        if (modified) {
            fs.writeFileSync(file, lines.join('\n'), 'utf8');
            console.log('Fixed indented fences in', file);
            changed++;
        }
    });
});
console.log('Done. Files changed:', changed);

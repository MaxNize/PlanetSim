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
            const m = lines[i].match(/^```(\w+)?\s*$/);
            if (m) {
                if (!inCode) {
                    // opening fence; ensure it has a language (keep if present, default to text)
                    if (!m[1]) {
                        lines[i] = '```text';
                        modified = true;
                    }
                    inCode = true;
                } else {
                    // closing fence; ensure it's just ```
                    if (m[1]) {
                        lines[i] = '```';
                        modified = true;
                    }
                    inCode = false;
                }
            }
        }
        if (modified) {
            fs.writeFileSync(file, lines.join('\n'), 'utf8');
            console.log('Fixed fences in', file);
            changed++;
        }
    });
});
console.log('Done. Files changed:', changed);

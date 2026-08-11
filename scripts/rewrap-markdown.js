const fs = require('fs');
const glob = require('glob');

const MAX = 200;
const patterns = ['Docs/**/*.md', 'README.md', 'CONTRIBUTING.md'];
let changed = 0;

// Wraps plain content (no prefix/marker) into lines that fit within `MAX` once
// `prefixLength` characters of leading marker/indent are added back by the caller.
// Returns an array of content-only lines -- the caller is responsible for
// prepending the prefix (first line) or matching indentation (continuation
// lines), so the prefix is never embedded here and never duplicated.
function wrapLine(content, prefixLength = 0) {
    const budget = Math.max(1, MAX - prefixLength);
    const words = content.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
        if (cur.length > 0 && cur.length + 1 + w.length > budget) {
            lines.push(cur);
            cur = w;
        } else {
            cur = cur.length > 0 ? `${cur} ${w}` : w;
        }
    }
    if (cur.length > 0) {
        lines.push(cur);
    }
    return lines;
}

// Mirrors markdownlint's MD013 default (non-strict) exemption: a line isn't
// actually flagged if everything past column MAX has no whitespace to break
// at (e.g. a single long inline-code span at the end). Rewrapping such lines
// anyway would just create diff noise for something the linter never complained
// about, so we only touch lines markdownlint would truly flag.
function markdownlintWouldFlag(line) {
    return line.length > MAX && /\s/.test(line.slice(MAX));
}

patterns.forEach(pattern => {
    const files = glob.sync(pattern, { nodir: true });
    files.forEach(file => {
        const text = fs.readFileSync(file, 'utf8');
        const lines = text.split(/\r?\n/);
        let inCode = false;
        let modified = false;
        const outLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const codeFence = line.match(/^\s*```/);
            if (codeFence) {
                inCode = !inCode;
                outLines.push(line);
                continue;
            }
            if (inCode) { outLines.push(line); continue; }
            // Skip tables (lines starting with |) and headings and lists with preformatted blocks
            if (/^\s*\|/.test(line) || /^\s*>/.test(line) || /^\s*```/.test(line) || /^\s*#/.test(line)) { outLines.push(line); continue; }
            // For list items, keep the marker as prefix
            const listMatch = line.match(/^(\s*[-*+]\s+)/);
            const numMatch = line.match(/^(\s*\d+\.\s+)/);
            let prefix = '';
            let content = line;
            if (listMatch) {
                prefix = listMatch[1];
                content = line.slice(prefix.length);
            } else if (numMatch) {
                prefix = numMatch[1];
                content = line.slice(prefix.length);
            } else {
                // preserve leading indentation
                const indentMatch = line.match(/^(\s+)/);
                prefix = indentMatch ? indentMatch[1] : '';
            }
            if (markdownlintWouldFlag(line)) {
                // wrap content into paragraphs preserving prefix on first line
                const wrapped = wrapLine(content.trim(), prefix.length);
                // first line should include marker if any; continuation lines
                // are indented to align with the first line's content, not the marker
                wrapped.forEach((l, idx) => {
                    if (idx === 0) outLines.push(prefix + l);
                    else outLines.push(' '.repeat(prefix.length) + l);
                });
                modified = true;
            } else {
                outLines.push(line);
            }
        }
        if (modified) {
            fs.writeFileSync(file, outLines.join('\n') + '\n', 'utf8');
            console.log('Reflowed', file);
            changed++;
        }
    });
});
console.log('Done. Files changed:', changed);

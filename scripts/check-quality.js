const fs = require('fs')
const path = require('path')

const roots = ['.']
const files = []
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ['.git', 'node_modules'].includes(entry.name)) continue
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(filename)
    else if (/\.tsx?$/.test(entry.name)) files.push(filename)
  }
}
for (const root of roots) visit(root)
const explicitAny = files.filter((filename) => /\bany\b/.test(fs.readFileSync(filename, 'utf8')))
if (explicitAny.length) {
  console.error(`explicit any found in ${explicitAny.join(', ')}`)
  process.exitCode = 1
}

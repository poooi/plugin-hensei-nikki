const { execFileSync } = require('child_process')
const os = require('os')
const path = require('path')

const output = execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
  encoding: 'utf8',
  env: { ...process.env, npm_config_cache: path.join(os.tmpdir(), 'hensei-nikki-npm-cache') },
})
const report = JSON.parse(output).at(-1)
const names = new Set(report.files.map((file) => file.path))
for (const required of ['index.js', 'utils/calc.js', 'assets/hensei-nikki.css']) {
  if (!names.has(required)) throw new Error(`package is missing ${required}`)
}

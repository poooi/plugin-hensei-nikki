const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const output = execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
  encoding: 'utf8',
  env: { ...process.env, npm_config_cache: path.join(os.tmpdir(), 'hensei-nikki-npm-cache') },
})
const report = JSON.parse(output).at(-1)
const names = new Set(report.files.map((file) => file.path))
for (const required of [
  'index.js',
  'index.js.map',
  'utils/calc.js',
  'utils/calc.js.map',
  'assets/hensei-nikki.css',
  'assets/i18n/en-US.json',
  'assets/i18n/ja-JP.json',
  'assets/i18n/zh-CN.json',
  'assets/i18n/zh-TW.json',
]) {
  if (!names.has(required)) throw new Error(`package is missing ${required}`)
}
if ([...names].some((name) => name.endsWith('.es'))) throw new Error('package contains maintained .es source')

const entry = fs.readFileSync(path.join('index.js'), 'utf8')
for (const external of ['views/create-store', 'redux-observers', 'electron']) {
  if (!entry.includes(`require('${external}')`) && !entry.includes(`require("${external}")`)) {
    throw new Error(`entry does not preserve host external ${external}`)
  }
}

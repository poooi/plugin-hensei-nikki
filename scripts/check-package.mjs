import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const cache = join(root, '.quality', 'npm-cache')
mkdirSync(cache, { recursive: true })
const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, npm_config_cache: cache },
})
const pack = JSON.parse(output)
const files = pack[0]?.files
if (!Array.isArray(files) || files.length === 0) throw new Error('Package contains no files')

const names = files.map(file => file.path)
const forbidden = names.filter(name => name.startsWith('/')
  || name.includes('node_modules/')
  || name.startsWith('.quality/')
  || name.endsWith('.map'))
if (forbidden.length) throw new Error(`Non-portable package entries: ${forbidden.join(', ')}`)
if (!names.includes('index.js')) throw new Error('Production entrypoint index.js is missing')

const workspacePath = root.replaceAll('\\', '/')
const embeddedWorkspacePaths = names.filter(name => {
  try {
    return readFileSync(join(root, name), 'utf8').includes(workspacePath)
  } catch (error) {
    return false
  }
})
if (embeddedWorkspacePaths.length) {
  throw new Error(`Machine-specific workspace paths found in: ${embeddedWorkspacePaths.join(', ')}`)
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
if (packageJson.main !== 'index.js') throw new Error('Package main must remain index.js')

console.log(`Portable package inspection passed (${names.length} files).`)

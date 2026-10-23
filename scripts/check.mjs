/**
 * Repository sanity check — no dependencies, no browser, no DSH required.
 *
 * Runs in CI and locally (`npm run check`): parses the shipping JavaScript, validates every JSON
 * file, and verifies that the manifest points at files that actually exist.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let failed = 0

function fail(message) {
  failed += 1
  console.error(`  ✗ ${message}`)
}

function ok(message) {
  console.log(`  ✓ ${message}`)
}

function checkSyntax(file) {
  try {
    // `stdio: 'inherit'` keeps the child off pipes (blocked in some sandboxes) and still surfaces
    // Node's own SyntaxError text on failure.
    execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' })
    ok(`${file} parses`)
  } catch (error) {
    fail(`${file} does not parse (exit ${error.status ?? '?'})`)
  }
}

function checkJson(file) {
  try {
    JSON.parse(readFileSync(path.join(root, file), 'utf8'))
    ok(`${file} is valid JSON`)
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`)
  }
}

console.log('syntax')
checkSyntax('client.js')
checkSyntax('index.js')
checkSyntax('scripts/check.mjs')

console.log('json')
checkJson('package.json')
checkJson('locale/zh.json')
checkJson('locale/en.json')

console.log('manifest')
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const required = ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg', 'locale/zh.json', 'locale/en.json']
for (const file of required) {
  if (existsSync(path.join(root, file))) ok(`has ${file}`)
  else fail(`missing ${file}`)
}

for (const [name, target] of Object.entries(manifest.exports || {})) {
  if (!target.startsWith('.') || target.includes('*')) continue
  const resolved = path.join(root, target.replace(/^\.\//, ''))
  const label = name === '.' ? 'main' : name.replace(/^\.\//, '')
  if (existsSync(resolved)) ok(`exports.${label} -> ${target}`)
  else fail(`exports.${label} points at a missing file: ${target}`)
}

for (const file of manifest.files || []) {
  if (file.includes('*')) continue
  if (existsSync(path.join(root, file))) ok(`files entry ${file}`)
  else fail(`files entry is missing on disk: ${file}`)
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nall checks passed')
